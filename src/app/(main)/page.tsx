import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { db } from "@/db";
import { items, itemImages, users, reviews, rentals } from "@/db/schema";
import { eq, and, avg, count, desc, isNull, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ItemCard } from "@/components/ItemCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Promotional slides for hero carousel
const PROMOTIONAL_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618486073499-242493d8f3a1?q=80&w=1176&auto=format&fit=crop",
    title: "Professional Camera Rentals",
    description: "Rent the latest camera equipment for your next project",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1526063803516-3fd204f18b75?q=80&w=1170&auto=format&fit=crop",
    title: "Premium Lenses Available",
    description: "High-quality lenses for every photography need",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1688226423273-bc2f526795d5?q=80&w=1170&auto=format&fit=crop",
    title: "Affordable Daily Rates",
    description: "Get professional equipment at student-friendly prices",
  },
];

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch featured items (items with highest ratings and most reviews)
  const featuredItemsData = await db
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
      and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 0))
    )
    .where(and(isNull(items.deletedAt), eq(items.status, "available")))
    .limit(8);

  // Calculate ratings for featured items
  const featuredItems = await Promise.all(
    featuredItemsData.map(async (item) => {
      const ratingData = await db
        .select({
          avgRating: avg(reviews.star),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
        .where(eq(rentals.itemId, item.id));

      return {
        id: item.id,
        name: item.name,
        pricePerDay: item.pricePerDay,
        imageUrl: item.firstImage || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image",
        ownerLocation: item.ownerLocation || "Unknown Location",
        averageRating: ratingData[0]?.avgRating ? parseFloat(ratingData[0].avgRating) : 0,
        totalReviews: ratingData[0]?.totalReviews || 0,
      };
    })
  );

  // Sort by rating and take top 4
  const topFeaturedItems = featuredItems
    .sort((a, b) => {
      // Sort by average rating first, then by total reviews
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.totalReviews - a.totalReviews;
    })
    .slice(0, 4);

  // Fetch recent items (most recently added)
  const recentItemsData = await db
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
      and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 0))
    )
    .where(and(isNull(items.deletedAt), eq(items.status, "available")))
    .orderBy(desc(items.id))
    .limit(4);

  // Calculate ratings for recent items
  const recentItems = await Promise.all(
    recentItemsData.map(async (item) => {
      const ratingData = await db
        .select({
          avgRating: avg(reviews.star),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
        .where(eq(rentals.itemId, item.id));

      return {
        id: item.id,
        name: item.name,
        pricePerDay: item.pricePerDay,
        imageUrl: item.firstImage || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image",
        ownerLocation: item.ownerLocation || "Unknown Location",
        averageRating: ratingData[0]?.avgRating ? parseFloat(ratingData[0].avgRating) : 0,
        totalReviews: ratingData[0]?.totalReviews || 0,
      };
    })
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Carousel */}
      <section className="w-full">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {PROMOTIONAL_SLIDES.map((slide) => (
              <CarouselItem key={slide.id}>
                <Card className="border-0">
                  <CardContent className="p-0">
                    <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/30 flex items-center">
                        <div className="text-white px-8 md:px-16 max-w-2xl">
                          <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {slide.title}
                          </h1>
                          <p className="text-lg md:text-xl mb-6 text-gray-200">
                            {slide.description}
                          </p>
                          <Button size="lg" asChild>
                            <Link href="/items">
                              Browse Items
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      {/* Featured Items */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Items</h2>
            <p className="text-muted-foreground mt-1">
              Top-rated equipment from our community
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/items">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {topFeaturedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFeaturedItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No featured items available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Recently Added</h2>
            <p className="text-muted-foreground mt-1">
              Check out the latest additions to our catalog
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/items">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No recent items available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Got Camera Equipment to Rent?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join our community and start earning by renting out your photography equipment
          to fellow students and professionals.
        </p>
        <Button size="lg" asChild>
          <Link href="/items/create">List Your Equipment</Link>
        </Button>
      </section>
    </div>
  );
}