import { db, items, rentals, rentalStatusEnum } from "@/db";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    context: { params: Promise<{ rentId: string }> }
) {
    const { params } = await context;
    const rentId = Number((await params).rentId);

    const user = await requireUser();
  
    const rental = await db.query.rentals.findFirst({
      where: eq(rentals.id, rentId),
      with: { item: true },
    });
  
    if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rental.item.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
    if (rental.status !== "active")
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  
    await db.transaction(async (tx) => {
      await tx.update(rentals)
        .set({ status: "completed" })
        .where(eq(rentals.id, rental.id));
  
      await tx.update(items)
        .set({ status: "available" })
        .where(eq(items.id, rental.itemId));
    });

    // mock payment gateway call
    const success = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: JSON.stringify({
            from: "kawansewa",
            amount: 9000, // dummy
            to: rental.renterId
        })
    })
  
    return NextResponse.json({ message: "Rental completed & funds released" });
  }
  