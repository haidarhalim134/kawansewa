import { NextRequest, NextResponse } from "next/server";
import { entityMap } from "../route";
import { CrudService } from "@/lib/crud";

export async function GET(req: NextRequest, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params; // ✅ await params
  const config = entityMap[entity];
  if (!config) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });

  const crud = new CrudService(config.table, config.pk);
  const data = await crud.getOne(Number(id));
  if (data.length > 0)
    return NextResponse.json(data[0]);
  return NextResponse.json(null);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const config = entityMap[entity];
  if (!config) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });

  const body = await req.json();
  const crud = new CrudService(config.table, config.pk);
  const data = await crud.update(Number(id), body);
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await context.params;
  const config = entityMap[entity];
  if (!config) return NextResponse.json({ error: "Invalid entity" }, { status: 400 });

  const crud = new CrudService(config.table, config.pk);
  const data = await crud.delete(Number(id));
  return NextResponse.json(data);
}
