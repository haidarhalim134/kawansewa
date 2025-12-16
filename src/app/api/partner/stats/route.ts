import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, rentals, itemImages, rentalStatusEnum } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq, and, sql, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await requireUser();

    // Get total items count (exclude deleted items)
    const totalItemsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(items)
      .where(and(eq(items.ownerId, user.id), isNull(items.deletedAt)));
    
    const totalItems = totalItemsResult[0]?.count || 0;

    // Get active rentals count (approved or active status, exclude deleted items)
    const activeRentalsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rentals)
      .innerJoin(items, eq(rentals.itemId, items.id))
      .where(
        and(
          eq(items.ownerId, user.id),
          isNull(items.deletedAt),
          sql`${rentals.status} IN ('approved', 'active')`
        )
      );
    
    const activeRentals = activeRentalsResult[0]?.count || 0;

    // Get total earnings (sum of completed rentals, exclude deleted items)
    const totalEarningsResult = await db
      .select({ 
        total: sql<string>`COALESCE(SUM(${rentals.totalPrice}), 0)` 
      })
      .from(rentals)
      .innerJoin(items, eq(rentals.itemId, items.id))
      .where(
        and(
          eq(items.ownerId, user.id),
          isNull(items.deletedAt),
          eq(rentals.status, "completed")
        )
      );
    
    const totalEarnings = parseFloat(totalEarningsResult[0]?.total || "0");

    // For now, we don't have a views tracking table, so return 0
    // TODO: Implement views tracking in the future
    const totalViews = 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalItems,
        activeRentals,
        totalEarnings,
        totalViews,
      },
    });
  } catch (error: any) {
    console.error("Error fetching partner stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch partner stats" },
      { status: 500 }
    );
  }
}
