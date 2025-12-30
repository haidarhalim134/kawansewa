import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, vouchers, userStatus, notifications, voucherUsed } from "@/db/schema";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";
import { validateVoucherForUser } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, voucherCode, startDate, endDate, totalPrice: clientTotalPrice, depositHeld, paymentMethod } = body;

    if (!itemId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "itemId, startDate, and endDate are required." },
        { status: 400 }
      );
    }

    const item = await db.query.items.findFirst({
      where: eq(items.id, itemId),
    });
    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    // Get authenticated user
    const renter = (await requireUser())
    const renterId = renter.id;

    // Prevent renting own item
    if (item.ownerId === renterId) {
      return NextResponse.json(
        { error: "You cannot rent your own item." },
        { status: 400 }
      );
    }

    if (renter.status != userStatus.enumValues[2]) {
      return NextResponse.json(
        { error: "You are not verified." },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: "Invalid rental date range." }, { status: 400 });
    }

    const conflictingRental = await db.query.rentals.findFirst({
      where: and(
        eq(rentals.itemId, itemId),
        inArray(rentals.status, ["pending", "approved", "active"]),
        lte(rentals.startDate, endDate),
        gte(rentals.endDate, startDate)
      ),
    });

    if (conflictingRental) {
      return NextResponse.json(
        { error: "Item is already rented for the selected dates." },
        { status: 409 }
      );
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let totalPrice = Number(item.pricePerDay) * diffDays;
    const depositAmount = Number(item.depositAmount) || 0;

    let voucherId: number | null = null;

    if (voucherCode) {
      const [valid, voucher] = await validateVoucherForUser({
        code: voucherCode.toUpperCase(),
        userId: renterId,
      });
    
      if (!valid) {
        return NextResponse.json(
          { error: voucher },
          { status: 400 }
        );
      }
    
      voucherId = voucher.id;
      totalPrice = Math.max(0, totalPrice - Number(voucher.discountAmount));
    }

    // Add deposit to total price
    totalPrice += depositAmount;

    // Verify client-side total matches server-side calculation
    if (clientTotalPrice !== undefined && Math.abs(clientTotalPrice - totalPrice) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch. Please refresh and try again." },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [newRental] = await tx
        .insert(rentals)
        .values({
          itemId,
          renterId,
          voucherId,
          totalPrice: totalPrice.toString(),
          depositHeld: depositAmount.toString(),
          startDate,
          endDate,
        })
        .returning();
    
      if (voucherId) {
        await tx.insert(voucherUsed).values({
          voucherId,
          userId: renterId,
        });
      }
    
      await tx.insert(notifications).values({
        userId: item.ownerId,
        title: "New Rental Request",
        description: `You have a new rental request for "${item.name}". Please review and approve or reject it.`,
        targetUrl: `/partner/approvals`,
      });

      return newRental;
    });

    return NextResponse.json(
      {
        rental: result,
        message: "Rental created successfully",
        paymentMethod: paymentMethod || "not_specified"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rental:", error);
    return NextResponse.json(
      { error: "Failed to create rental." },
      { status: 500 }
    );
  }
}
