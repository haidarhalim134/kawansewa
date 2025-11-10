import { NextRequest, NextResponse } from "next/server";
import { users, items, vouchers, rentals, reviews, itemImages, userFollows, itemFavorites, notifications } from "@/db/schema";
import { CrudService } from "@/lib/crud";

// Map entity name in URL to table + primary key
export const entityMap: Record<string, any> = {
  // users: { table: users, pk: "id" },
  items: { table: items, pk: "id" },
  vouchers: { table: vouchers, pk: "id" },
  rentals: { table: rentals, pk: "id" },
  reviews: { table: reviews, pk: "id" },
  item_images: { table: itemImages, pk: "id" },
  user_follows: { table: userFollows, pk: "followerId" }, // composite — handle manually if needed
  item_favorites: { table: itemFavorites, pk: "userId" }, // same
  notifications: { table: notifications, pk: "id" },
};

export async function GET(req: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params; // ✅ must await
  const config = entityMap[entity];
  if (!config) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });

  const crud = new CrudService(config.table, config.pk);
  const data = await crud.getAll();
  return NextResponse.json(data);
}

// POST create
export async function POST(req: NextRequest, context: { params: Promise<{ entity: string }> }) {
  const { entity } = await context.params; // ✅ must await
  const config = entityMap[entity];
  if (!config) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });

  const body = await req.json();
  const crud = new CrudService(config.table, config.pk);
  const data = await crud.create(body);
  return NextResponse.json(data);
}
