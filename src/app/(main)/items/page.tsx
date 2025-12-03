import { db } from "@/db";
import { items, itemImages, users, reviews, rentals } from "@/db/schema";
import { eq, and, avg, count, ilike, or } from "drizzle-orm";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
    searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 25;

export default async function ItemsSearchPage({ searchParams }: SearchPageProps) {
    const { q, category, page } = await searchParams;
    const searchQuery = q || "";
    const currentPage = parseInt(page || "1");
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    // Fetch items based on search query
    let itemsQuery = db
        .select({
            id: items.id,
            name: items.name,
            pricePerDay: items.pricePerDay,
            ownerId: items.ownerId,
            ownerLocation: users.location,
            firstImage: itemImages.imageUrl,
        })
        .from(items)
        .innerJoin(users, eq(items.ownerId, users.id))
        .leftJoin(
            itemImages,
            and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 1))
        )
        .$dynamic();

    // Apply search filter if query exists
    if (searchQuery) {
        itemsQuery = itemsQuery.where(
            or(
                ilike(items.name, `%${searchQuery}%`),
                ilike(items.detail, `%${searchQuery}%`)
            )
        );
    }

    // Get total count for pagination
    const countQuery = db
        .select({ count: count() })
        .from(items)
        .innerJoin(users, eq(items.ownerId, users.id))
        .$dynamic();

    let finalCountQuery = countQuery;
    if (searchQuery) {
        finalCountQuery = finalCountQuery.where(
            or(
                ilike(items.name, `%${searchQuery}%`),
                ilike(items.detail, `%${searchQuery}%`)
            )
        );
    }

    const [totalCountResult] = await finalCountQuery;
    const totalItems = totalCountResult?.count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Fetch paginated results
    const searchResults = await itemsQuery
        .limit(ITEMS_PER_PAGE)
        .offset(offset);

    // Calculate ratings for each item
    const itemsWithRatings = await Promise.all(
        searchResults.map(async (item) => {
            const ratingData = await db
                .select({
                    avgRating: avg(reviews.star),
                    totalReviews: count(reviews.id),
                })
                .from(reviews)
                .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
                .where(eq(rentals.itemId, item.id));

            return {
                ...item,
                rating: ratingData[0]?.avgRating
                    ? parseFloat(ratingData[0].avgRating)
                    : 0,
                totalReviews: ratingData[0]?.totalReviews || 0,
            };
        })
    );

    // Build pagination URLs
    const buildPageUrl = (pageNum: number) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (pageNum > 1) params.set("page", pageNum.toString());
        return `/items${params.toString() ? `?${params.toString()}` : ""}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {searchQuery ? `Search results for "${searchQuery}"` : "All Items"}
                    </h1>
                    <p className="text-gray-600">
                        {totalItems} {totalItems === 1 ? "item" : "items"} found
                        {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-lg border p-4 mb-6">
                    <div className="flex items-center justify-between">
                        {/* Active Filters Display */}
                        <div className="flex items-center gap-2">
                            {searchQuery ? (
                                <>
                                    <span className="text-sm text-gray-600">Active filters:</span>
                                    <Badge variant="secondary" className="gap-2">
                                        Search: {searchQuery}
                                        <a
                                            href="/items"
                                            className="ml-1 hover:text-gray-900"
                                            aria-label="Clear search"
                                        >
                                            ×
                                        </a>
                                    </Badge>
                                </>
                            ) : (
                                <span className="text-sm text-gray-600">No active filters</span>
                            )}
                        </div>

                        {/* Filter Button */}
                        <Button variant="outline" size="sm">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Results Grid */}
                {itemsWithRatings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {itemsWithRatings.map((item) => (
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
                                averageRating={item.rating}
                                totalReviews={item.totalReviews}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="mb-4">
                            <Search className="h-16 w-16 mx-auto text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No items found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery
                                ? `We couldn't find any items matching "${searchQuery}". Try different keywords.`
                                : "No items available at the moment."}
                        </p>
                        <Button asChild>
                            <a href="/">Back to Home</a>
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && itemsWithRatings.length > 0 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {/* Previous Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            asChild={currentPage > 1}
                        >
                            {currentPage > 1 ? (
                                <Link href={buildPageUrl(currentPage - 1)}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Link>
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </>
                            )}
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((pageNum) => {
                                    // Show first page, last page, current page, and pages around current
                                    return (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    );
                                })
                                .map((pageNum, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const prevPageNum = array[index - 1];
                                    const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                                    return (
                                        <div key={pageNum} className="flex items-center gap-1">
                                            {showEllipsis && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <Button
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                asChild={currentPage !== pageNum}
                                                disabled={currentPage === pageNum}
                                            >
                                                {currentPage !== pageNum ? (
                                                    <Link href={buildPageUrl(pageNum)}>{pageNum}</Link>
                                                ) : (
                                                    <span>{pageNum}</span>
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Next Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            asChild={currentPage < totalPages}
                        >
                            {currentPage < totalPages ? (
                                <Link href={buildPageUrl(currentPage + 1)}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
