import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, notifications, rentalStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

export async function POST(
    req: Request,
    context: { params: Promise<{ rentId: string }> }
) {
    const { params } = await context;
    const rentId = Number((await params).rentId);

    const user = await requireUser();
    const { action } = await req.json(); 

    const rental = await db.query.rentals.findFirst({
        where: eq(rentals.id, rentId),
        with: { item: true },
    });

    if (!rental) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if ((rental.item as any).ownerId !== user.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (rental.status !== rentalStatusEnum.enumValues[0])
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const newStatus = action === "approve" ? "approved" : "rejected";

    await db.update(rentals)
        .set({ status: newStatus })
        .where(eq(rentals.id, rental.id));

    await db.insert(notifications).values({
        userId: rental.renterId,
        title: action === "approve" ? "Pesanan Disetujui" : "Pesanan Ditolak",
        description: `Pesanan untuk ${rental.item.name}`,
    });

    return NextResponse.json({ success: true });
}
