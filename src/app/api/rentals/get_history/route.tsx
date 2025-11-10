import { NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";
import { db } from "@/db"; // <-- your drizzle db instance
import { rentals, items, vouchers } from "@/db/schema"; // adjust import path if needed
import { eq } from "drizzle-orm";

// GET /api/transactions/history
export async function GET() {
    try {
        // ✅ Require login
        const user = await requireUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Fetch transactions for the logged-in user (as renter)
        const transactions = await db
            .select({
                id: rentals.id,
                itemName: items.name,
                itemDetail: items.detail,
                totalPrice: rentals.totalPrice,
                startDate: rentals.startDate,
                endDate: rentals.endDate,
                voucherCode: vouchers.code,
                discountAmount: vouchers.discountAmount,
            })
            .from(rentals)
            .leftJoin(items, eq(rentals.itemId, items.id))
            .leftJoin(vouchers, eq(rentals.voucherId, vouchers.id))
            .where(eq(rentals.renterId, user.id))
            .orderBy(rentals.startDate);

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction history" },
            { status: 500 }
        );
    }
}
