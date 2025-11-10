"use server";

import { db } from "@/db";
import { itemFavorites } from "@/db/schema";
import { getSession } from "@/lib/cookies";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(itemId: number) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = parseInt(session.userId);

  // Check if already favorited
  const existing = await db
    .select()
    .from(itemFavorites)
    .where(
      and(
        eq(itemFavorites.userId, userId),
        eq(itemFavorites.itemId, itemId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove from favorites
    await db
      .delete(itemFavorites)
      .where(
        and(
          eq(itemFavorites.userId, userId),
          eq(itemFavorites.itemId, itemId)
        )
      );
    
    revalidatePath(`/items/${itemId}`);
    return { isFavorited: false };
  } else {
    // Add to favorites
    await db.insert(itemFavorites).values({
      userId: userId,
      itemId: itemId,
    });
    
    revalidatePath(`/items/${itemId}`);
    return { isFavorited: true };
  }
}
