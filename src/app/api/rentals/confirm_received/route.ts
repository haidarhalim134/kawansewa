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

        // Get rental details
        const [rental] = await db
            .select({
                id: rentals.id,
                status: rentals.status,
                itemId: rentals.itemId,
                itemName: items.name,
                ownerId: items.ownerId,
            })
            .from(rentals)
            .innerJoin(items, eq(rentals.itemId, items.id))
            .where(
                and(
                    eq(rentals.id, rentalId),
                    eq(rentals.renterId, user.id)
                )
            )
            .limit(1);

        if (!rental) {
            return NextResponse.json(
                { error: "Rental not found or unauthorized" },
                { status: 404 }
            );
        }

        // Check if rental is in "paid" status
        if (rental.status !== "paid") {
            return NextResponse.json(
                { error: "Rental must be in 'paid' status to confirm receipt" },
                { status: 400 }
            );
        }

        // Update rental status to "active" (On Rent)
        await db
            .update(rentals)
            .set({ status: "active" })
            .where(eq(rentals.id, rentalId));

        // Create notification for owner
        await db.insert(notifications).values({
            userId: rental.ownerId,
            title: "Item Received by Renter",
            description: `The renter has confirmed receiving "${rental.itemName}". The rental is now active.`,
            targetUrl: `/partner/rentals`,
        });

        return NextResponse.json({
            success: true,
            message: "Item receipt confirmed successfully",
        });
    } catch (error) {
        console.error("Error confirming item receipt:", error);
        return NextResponse.json(
            { error: "Failed to confirm item receipt" },
            { status: 500 }
        );
    }
}
