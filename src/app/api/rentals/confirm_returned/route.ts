import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(req: Request) {
    try {
        const user = await requireUser();
        const { rentalId } = await req.json();

        if (!rentalId) {
            return NextResponse.json(
                { error: "Rental ID is required" },
                { status: 400 }
            );
        }

        // Get rental details and verify user is the owner
        const [rental] = await db
            .select({
                id: rentals.id,
                status: rentals.status,
                renterId: rentals.renterId,
                itemId: rentals.itemId,
                itemName: items.name,
                ownerId: items.ownerId,
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

        // Verify user is the owner
        if (rental.ownerId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized: Only the item owner can confirm return" },
                { status: 403 }
            );
        }

        // Check if rental is in "active" status
        if (rental.status !== "active") {
            return NextResponse.json(
                { error: "Rental must be in 'active' status to confirm return" },
                { status: 400 }
            );
        }

        // Update rental status to "completed" and item status back to "available"
        await db.transaction(async (tx) => {
            // Update rental status
            await tx
                .update(rentals)
                .set({ status: "completed" })
                .where(eq(rentals.id, rentalId));

            // Update item status back to available
            await tx
                .update(items)
                .set({ status: "available" })
                .where(eq(items.id, rental.itemId));
        });

        // Create notification for renter
        await db.insert(notifications).values({
            userId: rental.renterId,
            title: "Item Return Confirmed",
            description: `The owner has confirmed the return of "${rental.itemName}". Your rental is now completed and deposit will be refunded.`,
            targetUrl: `/profile/rentals`,
        });

        return NextResponse.json({
            success: true,
            message: "Item return confirmed successfully",
        });
    } catch (error) {
        console.error("Error confirming item return:", error);
        return NextResponse.json(
            { error: "Failed to confirm item return" },
            { status: 500 }
        );
    }
}
