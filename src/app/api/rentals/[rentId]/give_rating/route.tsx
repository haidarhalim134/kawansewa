import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, rentals, rentalStatusEnum } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";

interface RateItemBody {
  star: number;
  itemId: number;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ rentId: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rentId = Number(params.rentId);

    const body: RateItemBody = await req.json();

    console.log("Rating request:", { rentId, userId: user.id, star: body.star, itemId: body.itemId });

    if (body.star < 1 || body.star > 5) {
      console.log("Invalid star rating:", body.star);
      return NextResponse.json(
        { error: "Star rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(rentals)
      .where(eq(rentals.id, rentId));

    if (rows.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    const rental = rows[0];

    console.log("Rental found:", { rentalId: rental.id, renterId: rental.renterId, status: rental.status });

    // Verify the user is the renter
    if (rental.renterId !== user.id) {
      console.log("Unauthorized: user is not renter", { userId: user.id, renterId: rental.renterId });
      return NextResponse.json(
        { error: "Unauthorized - You are not the renter of this rental" },
        { status: 403 }
      );
    }

    // Ensure rental is completed
    if (rental.status !== "completed") {
      console.log("Rental not completed:", rental.status);
      return NextResponse.json(
        { error: "You can only rate an item after the rental is completed" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.rentalId, rentId))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: "You have already rated this rental" },
        { status: 400 }
      );
    }

    // Insert review
    const newReview = await db
      .insert(reviews)
      .values({
        rentalId: rental.id,
        star: body.star,
      })
      .returning();

    return NextResponse.json({ review: newReview });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
