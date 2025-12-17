import { NextResponse } from "next/server";
import { db } from "@/db"; // adjust if your drizzle db instance lives elsewhere
import { items, itemImages, userStatus } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";

type CreateItemBody = {
  name: string;
  detail?: string;
  pricePerDay: number;
  depositAmount?: number;
  imageUrls?: string[];
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = (await req.json()) as CreateItemBody;
    const { name, detail, pricePerDay, depositAmount = 0, imageUrls = [] } = body;

    if (!name || !pricePerDay) {
      return NextResponse.json(
        { error: "Missing required fields: name or pricePerDay" },
        { status: 400 }
      );
    }

    if (user.status != userStatus.enumValues[2]) {
      return NextResponse.json(
        { error: "You are not verified." },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [newItem] = await tx
        .insert(items)
        .values({
          ownerId: user.id,
          name,
          detail,
          pricePerDay: pricePerDay.toString(),
          depositAmount: depositAmount.toString(),
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
