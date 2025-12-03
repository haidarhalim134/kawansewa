import { db } from "@/db";
import { items, itemImages, users, rentals, reviews } from "@/db/schema";
import { eq, and, gte, lte, avg } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";
import { supabase } from "@/lib/supabase";

interface Params {
  params: { itemId: string };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser(); // optional authentication
    const { params } = await context;
    const itemId = Number((await params).itemId);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Fetch item details + average rating
    const rows = await db
      .select({
        id: items.id,
        name: items.name,
        detail: items.detail,
        pricePerDay: items.pricePerDay,
        ownerId: users.id,
        ownerName: users.name,
        ownerProfileImageUrl: users.profileImageUrl,
        imageUrl: itemImages.imageUrl,
        imageOrder: itemImages.imageOrder,
        avgRating: avg(reviews.star).as("avgRating"), // use avg() from drizzle-orm
      })
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .leftJoin(itemImages, eq(items.id, itemImages.itemId))
      .leftJoin(rentals, eq(items.id, rentals.itemId))
      .leftJoin(reviews, eq(rentals.id, reviews.rentalId))
      .where(eq(items.id, itemId))
      .groupBy(
        items.id,
        users.id,
        users.name,
        users.profileImageUrl,
        itemImages.imageUrl,
        itemImages.imageOrder
      );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Group images by order
    const item = {
      id: rows[0].id,
      name: rows[0].name,
      detail: rows[0].detail,
      pricePerDay: rows[0].pricePerDay,
      owner: {
        id: rows[0].ownerId,
        name: rows[0].ownerName,
        profileImageUrl: rows[0].ownerProfileImageUrl,
      },
      rating: rows[0].avgRating ? Number(rows[0].avgRating) : null,
      images: rows
        .filter((r) => r.imageUrl)
        .map((r) => ({ url: r.imageUrl, order: r.imageOrder }))
        .sort((a, b) => a.order - b.order),
    };

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("❌ Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

type EditItemBody = {
  name?: string;
  detail?: string;
  pricePerDay?: number;
  imageUrls?: string[];
};

export async function PUT(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser();

    const { params } = await context;
    const itemId = Number((await params).itemId);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as EditItemBody;
    const { name, detail, pricePerDay, imageUrls } = body;

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: This item does not belong to you" },
        { status: 403 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const activeRentals = await db
      .select()
      .from(rentals)
      .where(
        and(
          eq(rentals.itemId, itemId),
          lte(rentals.startDate, today),
          gte(rentals.endDate, today)
        )
      );

    if (activeRentals.length > 0) {
      return NextResponse.json(
        { error: "Item is actively rented and cannot be edited" },
        { status: 400 }
      );
    }

    const updatedItem = await db.transaction(async (tx) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (detail !== undefined) updateData.detail = detail;
      if (pricePerDay !== undefined) updateData.pricePerDay = pricePerDay;

      let resultItem = item;

      if (Object.keys(updateData).length > 0) {
        const [updated] = await tx
          .update(items)
          .set(updateData)
          .where(eq(items.id, itemId))
          .returning();

        resultItem = updated;
      }

      if (Array.isArray(imageUrls)) {
        await tx.delete(itemImages).where(eq(itemImages.itemId, itemId));

        if (imageUrls.length > 0) {
          const imagesToInsert = imageUrls.map((url, idx) => ({
            itemId,
            imageOrder: idx,
            imageUrl: url,
          }));

          await tx.insert(itemImages).values(imagesToInsert);
        }
      }

      return resultItem;
    });

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser(); 
    const { params } = await context;
    const itemId = Number((await params).itemId);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId));

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: item does not belong to you" },
        { status: 403 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const activeRentals = await db
      .select()
      .from(rentals)
      .where(
        and(
          eq(rentals.itemId, itemId),
          lte(rentals.startDate, today),
          gte(rentals.endDate, today)
        )
      );

    if (activeRentals.length > 0) {
      return NextResponse.json(
        { error: "Item is actively rented and cannot be deleted" },
        { status: 400 }
      );
    }

    const itemImgs = await db
      .select()
      .from(itemImages)
      .where(eq(itemImages.itemId, itemId));

    const storagePaths = itemImgs.map((img) => {
      try {
        const url = new URL(img.imageUrl);
        const pathStart = url.pathname.indexOf("/product/"); 
        return url.pathname.substring(pathStart + 1); 
      } catch {
        return null;
      }
    }).filter(Boolean) as string[];

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("product") 
        .remove(storagePaths);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        return NextResponse.json(
          { error: "Failed to delete images from storage" },
          { status: 500 }
        );
      }
    }

    await db.transaction(async (tx) => {
      await tx.delete(itemImages).where(eq(itemImages.itemId, itemId));
      await tx.delete(items).where(eq(items.id, itemId));
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}