import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, rentalStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

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

    if (rental.status !== rentalStatusEnum.enumValues[1])
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    await db.update(rentals)
        .set({ status: "paid" })
        .where(eq(rentals.id, rental.id));

    return NextResponse.json({ message: "Payment successful" });
}
