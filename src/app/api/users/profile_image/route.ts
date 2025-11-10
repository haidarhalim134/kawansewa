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

  // Get existing profile image URL (if any)
  const existingUser = await db
    .select({ profileImageUrl: users.profileImageUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const existingImageUrl = existingUser[0]?.profileImageUrl;

  // Delete old image from Supabase Storage if exists
  if (existingImageUrl) {
    const oldPath = existingImageUrl.split("/avatars/")[1];
    if (oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
    }
  }

  // Upload new image
  const fileExt = file.name.split(".").pop();
  const fileName = `profile_${user.id}_${Date.now()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update database
  await db
    .update(users)
    .set({ profileImageUrl: publicUrl })
    .where(eq(users.id, user.id));

  return NextResponse.json({
    message: "Profile picture updated successfully",
    url: publicUrl,
  });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existingUser = await db
    .select({ profileImageUrl: users.profileImageUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const existingImageUrl = existingUser[0]?.profileImageUrl;

  if (!existingImageUrl)
    return NextResponse.json({ message: "No profile image to delete" });

  const oldPath = existingImageUrl.split("/avatars/")[1];
  if (oldPath) {
    const { error } = await supabase.storage.from("avatars").remove([oldPath]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await db
    .update(users)
    .set({ profileImageUrl: null })
    .where(eq(users.id, user.id));

  return NextResponse.json({ message: "Profile image deleted successfully" });
}
