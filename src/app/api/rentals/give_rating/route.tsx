import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, rentals } from "@/db/schema";
import { requireUser } from "@/lib/cookies";

interface RateItemBody {
  star: number;
  rentalId: number;
}

export async function POST(req: Request, { params }: { params: { itemId: string } }) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;
    const body: RateItemBody = await req.json();

    if (body.star < 1 || body.star > 5) {
      return NextResponse.json({ error: "Star rating must be between 1 and 5" }, { status: 400 });
    }

    // Fetch rental
    const rows = await db
      .select()
      .from(rentals)
      .where({
        id: body.rentalId,
        renterId: user.id,
        itemId: Number(itemId),
      });

    if (rows.length === 0) {
        return NextResponse.json({ error: "rental not found" }, { status: 404 });
    }

    const rental = rows[0]

    if (!rental) {
      return NextResponse.json({ error: "Rental not found or does not belong to user" }, { status: 404 });
    }

    // Ensure rental has ended
    const now = new Date();
    const rentalEnd = new Date(rental.endDate);

    if (rentalEnd > now) {
      return NextResponse.json({ error: "You can only rate an item after the rental has ended" }, { status: 400 });
    }

    // Insert review
    const newReview = await db.insert(reviews).values({
      rentalId: rental.id,
      star: body.star,
    }).returning();

    return NextResponse.json({ review: newReview });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
