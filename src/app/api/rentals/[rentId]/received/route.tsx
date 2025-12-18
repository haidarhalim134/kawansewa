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
    });
  
    if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rental.renterId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
    if (rental.status !== rentalStatusEnum.enumValues[6])
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  
    await db.transaction(async (tx) => {
        await tx.update(rentals)
            .set({ status: "active" })
            .where(eq(rentals.id, rental.id));

        await tx.update(items)
            .set({ status: "unavailable" })
            .where(eq(items.id, rental.itemId));
    });

    return NextResponse.json({ message: "Rental is now active" });
  }
  