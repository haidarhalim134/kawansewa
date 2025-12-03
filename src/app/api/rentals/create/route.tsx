import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, vouchers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, voucherCode, startDate, endDate, totalPrice: clientTotalPrice, paymentMethod } = body;

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
    const renterId = (await requireUser()).id;

    // Prevent renting own item
    if (item.ownerId === renterId) {
      return NextResponse.json(
        { error: "You cannot rent your own item." },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: "Invalid rental date range." }, { status: 400 });
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let totalPrice = Number(item.pricePerDay) * diffDays;

    let voucherId: number | null = null;
    if (voucherCode) {
      const voucher = await db.query.vouchers.findFirst({
        where: eq(vouchers.code, voucherCode.toUpperCase()),
      });
      if (voucher) {
        voucherId = voucher.id;
        totalPrice = Math.max(0, totalPrice - Number(voucher.discountAmount));
      }
    }

    // Verify client-side total matches server-side calculation
    if (clientTotalPrice !== undefined && Math.abs(clientTotalPrice - totalPrice) > 0.01) {
      return NextResponse.json(
        { error: "Price mismatch. Please refresh and try again." },
        { status: 400 }
      );
    }

    // Insert rental
    const [newRental] = await db
      .insert(rentals)
      .values({
        itemId,
        renterId,
        voucherId,
        totalPrice: totalPrice.toString(),
        startDate: startDate, // Use original string format
        endDate: endDate, // Use original string format
      })
      .returning();

    return NextResponse.json(
      {
        rental: newRental,
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
