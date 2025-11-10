import { NextResponse } from "next/server";
import { db } from "@/db"; // adjust the import path to your drizzle db instance
import { items } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

// GET /api/items/search?term=something
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

    const results = await db
      .select()
      .from(items)
      .where(
        or(
          ilike(items.name, `%${term}%`),
          ilike(items.detail, `%${term}%`)
        )
      );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
