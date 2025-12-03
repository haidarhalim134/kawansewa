import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/cookies";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// untested
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const fileExt = file.name.split(".").pop();
  const fileName = `product_${crypto.randomUUID()}_${Date.now()}.${fileExt}`;
  const filePath = `product/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("product").getPublicUrl(filePath);

  return NextResponse.json({
    message: "Product picture updated successfully",
    url: publicUrl,
  });
}