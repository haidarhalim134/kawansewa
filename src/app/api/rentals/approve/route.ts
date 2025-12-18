import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, notifications, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

/**
 * POST /api/rentals/approve
 * Owner approves a rental request
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { rentalId } = body;

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
        { error: `Cannot approve rental with status: ${rental.rentalStatus}` },
        { status: 400 }
      );
    }

    // Update rental status to approved and item status to pending_rent
    await db.transaction(async (tx) => {
      // Update rental status
      await tx
        .update(rentals)
        .set({ status: "approved" })
        .where(eq(rentals.id, rentalId));

      // Update item status to pending_rent (waiting for payment)
      await tx
        .update(items)
        .set({ status: "pending_rent" })
        .where(eq(items.id, rental.itemId));

      // Reject all other pending rentals for the same item
      await tx
        .update(rentals)
        .set({ status: "rejected" })
        .where(
          and(
            eq(rentals.itemId, rental.itemId),
            eq(rentals.status, "pending"),
            ne(rentals.id, rentalId) // Don't reject the current rental
          )
        );
    });

    // Create notification for renter
    await db.insert(notifications).values({
      userId: rental.renterId,
      title: "Rental Request Approved",
      description: `Your rental request for "${rental.itemName}" has been approved. Please proceed with payment.`,
      targetUrl: `/profile/rentals`,
    });

    return NextResponse.json(
      { success: true, message: "Rental approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving rental:", error);
    return NextResponse.json(
      { error: "Failed to approve rental" },
      { status: 500 }
    );
  }
}
