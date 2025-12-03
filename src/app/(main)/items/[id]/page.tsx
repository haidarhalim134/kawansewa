import { db } from "@/db";
import { items, itemImages, users, reviews, rentals, itemFavorites } from "@/db/schema";
import { eq, and, avg, count, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Star, Calendar, ShieldCheck } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { ImageGallery } from "@/components/ImageGallery";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getSession } from "@/lib/cookies";
import Link from "next/link";

interface ItemDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
        notFound();
    }

    // Fetch item with owner info
    const itemData = await db
        .select({
            id: items.id,
            name: items.name,
            detail: items.detail,
            pricePerDay: items.pricePerDay,
            ownerId: items.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            ownerLocation: users.location,
            ownerProfileImage: users.profileImageUrl,
        })
        .from(items)
        .innerJoin(users, eq(items.ownerId, users.id))
        .where(eq(items.id, itemId))
        .limit(1);

    if (itemData.length === 0) {
        notFound();
    }

    const item = itemData[0];

    // Fetch item images
    const images = await db
        .select()
        .from(itemImages)
        .where(eq(itemImages.itemId, itemId))
        .orderBy(itemImages.imageOrder);

    // Fetch average rating
    const ratingData = await db
        .select({
            avgRating: avg(reviews.star),
            totalReviews: count(reviews.id),
        })
        .from(reviews)
        .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
        .where(eq(rentals.itemId, itemId));

    const avgRating = ratingData[0]?.avgRating
        ? parseFloat(ratingData[0].avgRating)
        : 0;
    const totalReviews = ratingData[0]?.totalReviews || 0;

    // Check if item is favorited by current user
    const session = await getSession();
    let isFavorited = false;

    if (session) {
        const userId = parseInt(session.userId);
        const favoriteCheck = await db
            .select()
            .from(itemFavorites)
            .where(
                and(
                    eq(itemFavorites.userId, userId),
                    eq(itemFavorites.itemId, itemId)
                )
            )
            .limit(1);

        isFavorited = favoriteCheck.length > 0;
    }

    // Fetch other items by same owner
    const ownerItems = await db
        .select({
            id: items.id,
            name: items.name,
            pricePerDay: items.pricePerDay,
            ownerLocation: users.location,
            firstImage: itemImages.imageUrl,
        })
        .from(items)
        .innerJoin(users, eq(items.ownerId, users.id))
        .leftJoin(
            itemImages,
            and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 1))
        )
        .where(and(eq(items.ownerId, item.ownerId), ne(items.id, itemId)))
        .limit(4);

    // Calculate rating for owner items
    const ownerItemsWithRating = await Promise.all(
        ownerItems.map(async (ownerItem) => {
            const itemRating = await db
                .select({
                    avgRating: avg(reviews.star),
                })
                .from(reviews)
                .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
                .where(eq(rentals.itemId, ownerItem.id));

            return {
                ...ownerItem,
                rating: itemRating[0]?.avgRating
                    ? parseFloat(itemRating[0].avgRating)
                    : 0,
            };
        })
    );

    // Format price
    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left Side - Image Gallery */}
                    <div className="space-y-4">
                        <ImageGallery images={images} itemName={item.name} />
                    </div>

                    {/* Right Side - Item Details */}
                    <div className="space-y-6">
                        {/* Item Name & Favorite */}
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                                    {item.name}
                                </h1>
                                {session && (
                                    <FavoriteButton
                                        itemId={itemId}
                                        initialIsFavorited={isFavorited}
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">
                                        {avgRating > 0 ? avgRating.toFixed(1) : "No reviews"}
                                    </span>
                                    {totalReviews > 0 && (
                                        <span className="text-gray-500 text-sm">
                                            ({totalReviews} reviews)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Price */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-blue-600">
                                    {formatPrice(item.pricePerDay)}
                                </span>
                                <span className="text-gray-600">/ day</span>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                Rented by
                            </h3>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={item.ownerProfileImage || undefined} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                                        {item.ownerName?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{item.ownerName}</h4>
                                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        <span>{item.ownerLocation}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link href={`/checkout/${itemId}`}>
                                <Button className="w-full" size="lg">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Book Now
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full" size="lg">
                                Contact Owner
                            </Button>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {item.detail}
                            </p>
                        </div>

                        {/* Features/Benefits */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-green-900 mb-1">
                                        Safe & Verified
                                    </h4>
                                    <p className="text-sm text-green-700">
                                        All items are verified and insured. Rent with confidence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More from this owner */}
                {ownerItemsWithRating.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">
                            More from {item.ownerName}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {ownerItemsWithRating.map((ownerItem) => (
                                <ItemCard
                                    key={ownerItem.id}
                                    id={ownerItem.id}
                                    name={ownerItem.name}
                                    pricePerDay={ownerItem.pricePerDay}
                                    imageUrl={
                                        ownerItem.firstImage ||
                                        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"
                                    }
                                    ownerLocation={ownerItem.ownerLocation || "Unknown"}
                                    averageRating={ownerItem.rating}
                                    totalReviews={0}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
