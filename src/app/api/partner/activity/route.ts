import { NextResponse } from "next/server";
import { db } from "@/db";
import { items, rentals, users, itemImages } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq, desc, and, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await requireUser();

    // Fetch recent rental requests for the user's items (exclude deleted items)
    const recentActivity = await db
      .select({
        rentalId: rentals.id,
        rentalStatus: rentals.status,
        startDate: rentals.startDate,
        endDate: rentals.endDate,
        totalPrice: rentals.totalPrice,
        depositHeld: rentals.depositHeld,
        itemId: items.id,
        itemName: items.name,
        renterId: users.id,
        renterName: users.name,
        renterEmail: users.email,
        renterProfileImage: users.profileImageUrl,
      })
      .from(rentals)
      .innerJoin(items, eq(rentals.itemId, items.id))
      .innerJoin(users, eq(rentals.renterId, users.id))
      .where(and(eq(items.ownerId, user.id), isNull(items.deletedAt)))
      .orderBy(desc(rentals.id))
      .limit(10);

    // Get primary image for each item
    const activityWithImages = await Promise.all(
      recentActivity.map(async (activity) => {
        const [primaryImage] = await db
          .select({ imageUrl: itemImages.imageUrl })
          .from(itemImages)
          .where(eq(itemImages.itemId, activity.itemId))
          .orderBy(itemImages.imageOrder)
          .limit(1);

        return {
          ...activity,
          itemImage: primaryImage?.imageUrl || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      activity: activityWithImages,
    });
  } catch (error: any) {
    console.error("Error fetching partner activity:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch partner activity" },
      { status: 500 }
    );
  }
}
