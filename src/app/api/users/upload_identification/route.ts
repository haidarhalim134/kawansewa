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

  const existingUser = await db
    .select({ identificationImageUrl: users.identificationImageUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const existingImageUrl = existingUser[0]?.identificationImageUrl;

  if (existingImageUrl) {
    const oldPath = existingImageUrl.split("/avatars/")[1];
    if (oldPath) {
      await supabase.storage.from("identification").remove([oldPath]);
    }
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `identification_${user.id}_${Date.now()}.${fileExt}`;
  const filePath = `identification/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("identification")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("identification").getPublicUrl(filePath);

  // Update database
  await db
    .update(users)
    .set({ identificationImageUrl: publicUrl })
    .where(eq(users.id, user.id));

  return NextResponse.json({
    message: "Identification picture updated successfully",
    url: publicUrl,
  });
}