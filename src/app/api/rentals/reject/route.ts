import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, notifications, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

/**
 * POST /api/rentals/reject
 * Owner rejects a rental request
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { rentalId, reason } = body;

    if (!rentalId) {
      return NextResponse.json(
        { error: "rentalId is required" },
        { status: 400 }
      );
    }

    // Fetch rental with item info
    const [rental] = await db
      .select({
        rentalId: rentals.id,
        rentalStatus: rentals.status,
        itemId: rentals.itemId,
        renterId: rentals.renterId,
        ownerId: items.ownerId,
        itemName: items.name,
      })
      .from(rentals)
      .innerJoin(items, eq(rentals.itemId, items.id))
      .where(eq(rentals.id, rentalId))
      .limit(1);

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (rental.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You are not the owner of this item" },
        { status: 403 }
      );
    }

    // Check if rental is in pending status
    if (rental.rentalStatus !== "pending") {
      return NextResponse.json(
        { error: `Cannot reject rental with status: ${rental.rentalStatus}` },
        { status: 400 }
      );
    }

    // Update rental status to rejected
    await db
      .update(rentals)
      .set({ status: "rejected" })
      .where(eq(rentals.id, rentalId));

    // Create notification for renter
    const notificationDescription = reason
      ? `Your rental request for "${rental.itemName}" has been rejected. Reason: ${reason}`
      : `Your rental request for "${rental.itemName}" has been rejected.`;

    await db.insert(notifications).values({
      userId: rental.renterId,
      title: "Rental Request Rejected",
      description: notificationDescription,
      targetUrl: `/profile/rentals`,
    });

    return NextResponse.json(
      { success: true, message: "Rental rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting rental:", error);
    return NextResponse.json(
      { error: "Failed to reject rental" },
      { status: 500 }
    );
  }
}
