import { NextResponse } from "next/server";
import { db } from "@/db";
import { rentals, items, users, itemImages } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/cookies";

/**
 * GET /api/rentals/pending
 * Get all pending rental requests for owner's items
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser();

    // Fetch all pending rentals for items owned by the user
    const pendingRentals = await db
      .select({
        rentalId: rentals.id,
        rentalStatus: rentals.status,
        startDate: rentals.startDate,
        endDate: rentals.endDate,
        totalPrice: rentals.totalPrice,
        depositHeld: rentals.depositHeld,
        createdAt: rentals.id, // Use as timestamp proxy
        itemId: items.id,
        itemName: items.name,
        itemPricePerDay: items.pricePerDay,
        renterId: users.id,
        renterName: users.name,
        renterEmail: users.email,
        renterProfileImage: users.profileImageUrl,
      })
      .from(rentals)
      .innerJoin(items, eq(rentals.itemId, items.id))
      .innerJoin(users, eq(rentals.renterId, users.id))
      .where(
        and(
          eq(items.ownerId, user.id),
          eq(rentals.status, "pending"),
          isNull(items.deletedAt)
        )
      )
      .orderBy(rentals.id); // Order by ID descending (newest first)

    // Fetch primary images for each item
    const itemIds = [...new Set(pendingRentals.map((r) => r.itemId))];
    
    let images: any[] = [];
    if (itemIds.length > 0) {
      images = await db
        .select({
          itemId: itemImages.itemId,
          imageUrl: itemImages.imageUrl,
          imageOrder: itemImages.imageOrder,
        })
        .from(itemImages)
        .where(
          and(
            eq(itemImages.imageOrder, 0), // Primary image only
            ...itemIds.map((id) => eq(itemImages.itemId, id))
          )
        );
    }

    // Map images to items
    const imageMap = new Map(images.map((img) => [img.itemId, img.imageUrl]));

    // Format response
    const formattedRentals = pendingRentals.map((rental) => ({
      id: rental.rentalId,
      status: rental.rentalStatus,
      startDate: rental.startDate,
      endDate: rental.endDate,
      totalPrice: rental.totalPrice,
      depositHeld: rental.depositHeld,
      item: {
        id: rental.itemId,
        name: rental.itemName,
        pricePerDay: rental.itemPricePerDay,
        imageUrl: imageMap.get(rental.itemId) || null,
      },
      renter: {
        id: rental.renterId,
        name: rental.renterName,
        email: rental.renterEmail,
        profileImageUrl: rental.renterProfileImage,
      },
    }));

    return NextResponse.json(formattedRentals, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending rentals" },
      { status: 500 }
    );
  }
}
