import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, notifications, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { rentalId, paymentMethod } = body;

        if (!rentalId) {
            return NextResponse.json(
                { error: "Rental ID is required" },
                { status: 400 }
            );
        }

        // Get authenticated user
        const user = await requireUser();
        const userId = user.id;

        // Get rental details with item info
        const rentalData = await db
            .select({
                rentalId: rentals.id,
                renterId: rentals.renterId,
                status: rentals.status,
                itemId: items.id,
                itemName: items.name,
                ownerId: items.ownerId,
            })
            .from(rentals)
            .innerJoin(items, eq(rentals.itemId, items.id))
            .where(eq(rentals.id, rentalId))
            .limit(1);

        if (rentalData.length === 0) {
            return NextResponse.json(
                { error: "Rental not found" },
                { status: 404 }
            );
        }

        const rental = rentalData[0];

        // Verify user is the renter
        if (rental.renterId !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Verify rental status is approved
        if (rental.status !== "approved") {
            return NextResponse.json(
                { error: "Rental is not in approved status" },
                { status: 400 }
            );
        }

        // Update rental status to paid
        await db
            .update(rentals)
            .set({ status: "paid" })
            .where(eq(rentals.id, rentalId));

        // Send notification to owner
        await db.insert(notifications).values({
            userId: rental.ownerId,
            title: "Payment Received",
            description: `Payment for "${rental.itemName}" has been received. The renter will pick up the item soon.`,
            targetUrl: `/partner/rentals`,
        });

        // Send notification to renter
        await db.insert(notifications).values({
            userId: rental.renterId,
            title: "Payment Successful",
            description: `Your payment for "${rental.itemName}" has been processed. You can now proceed to pick up the item.`,
            targetUrl: `/profile/rentals`,
        });

        return NextResponse.json({
            success: true,
            message: "Payment processed successfully",
            paymentMethod,
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        );
    }
}
