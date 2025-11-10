import { NextResponse } from "next/server";
import { db } from "@/db"; // adjust if your drizzle db instance lives elsewhere
import { items, itemImages } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";

type CreateItemBody = {
  name: string;
  detail?: string;
  pricePerDay: number;
  imageUrls?: string[]; // list of image URLs
};

export async function POST(req: Request) {
  try {
    // ✅ Get the logged-in user
    const user = await requireUser();

    // ✅ Parse request body
    const body = (await req.json()) as CreateItemBody;
    const { name, detail, pricePerDay, imageUrls = [] } = body;

    if (!name || !pricePerDay) {
      return NextResponse.json(
        { error: "Missing required fields: name or pricePerDay" },
        { status: 400 }
      );
    }

    // ✅ Create the item and its images inside a transaction
    const result = await db.transaction(async (tx) => {
      const [newItem] = await tx
        .insert(items)
        .values({
          ownerId: user.id,
          name,
          detail,
          pricePerDay,
        })
        .returning();

      if (imageUrls.length > 0) {
        const imagesToInsert = imageUrls.map((url, idx) => ({
          itemId: newItem.id,
          imageOrder: idx,
          imageUrl: url,
        }));

        await tx.insert(itemImages).values(imagesToInsert);
      }

      return newItem;
    });

    return NextResponse.json({ success: true, item: result }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create item" },
      { status: 500 }
    );
  }
}
