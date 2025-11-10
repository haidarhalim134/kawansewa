import { NextResponse } from "next/server";
import { db } from "@/db"; // adjust the import path
import { items, itemImages } from "@/db/schema";
import { ilike, or, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");

    if (!term || term.trim() === "") {
      return NextResponse.json(
        { error: "Missing or empty search term" },
        { status: 400 }
      );
    }

    const matchedItems = await db
      .select()
      .from(items)
      .where(
        or(
          ilike(items.name, `%${term}%`),
          ilike(items.detail, `%${term}%`)
        )
      );

    if (matchedItems.length === 0) {
      return NextResponse.json([]);
    }

    const itemIds = matchedItems.map((item) => item.id);

    const images = await db
      .select()
      .from(itemImages)
      .where(
        or(...itemIds.map((id) => eq(itemImages.itemId, id)))
      );

    const results = matchedItems.map((item) => ({
      ...item,
      images: images
        .filter((img) => img.itemId === item.id)
        .sort((a, b) => a.imageOrder - b.imageOrder),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
