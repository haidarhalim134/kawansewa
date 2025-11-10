import { db } from "@/db";
import { items, itemImages, itemFavorites, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemCard } from "@/components/ItemCard";
import { Heart } from "lucide-react";

export default async function FavoritesPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const userId = parseInt(session.userId);

    // Fetch favorited items
    const favoriteItems = await db
        .select({
            id: items.id,
            name: items.name,
            pricePerDay: items.pricePerDay,
            ownerLocation: users.location,
            firstImage: itemImages.imageUrl,
        })
        .from(itemFavorites)
        .innerJoin(items, eq(itemFavorites.itemId, items.id))
        .innerJoin(users, eq(items.ownerId, users.id))
        .leftJoin(
            itemImages,
            and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 1))
        )
        .where(eq(itemFavorites.userId, userId));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
                <p className="text-gray-600 mt-1">
                    {favoriteItems.length} {favoriteItems.length === 1 ? "item" : "items"} saved
                </p>
            </div>

            {/* Favorites Grid */}
            {favoriteItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            pricePerDay={item.pricePerDay}
                            imageUrl={
                                item.firstImage ||
                                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"
                            }
                            ownerLocation={item.ownerLocation || "Unknown"}
                            averageRating={0}
                            totalReviews={0}
                        />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Favorites</CardTitle>
                        <CardDescription>Items you've saved for later</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No favorites yet
                            </h3>
                            <p className="text-gray-600">
                                Save items you like by clicking the heart icon on any item.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
