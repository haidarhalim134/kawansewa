import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
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

// Temporary mock data - will be replaced with real database queries
const PROMOTIONAL_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=500&fit=crop",
    title: "Professional Camera Rentals",
    description: "Rent the latest camera equipment for your next project",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=500&fit=crop",
    title: "Premium Lenses Available",
    description: "High-quality lenses for every photography need",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1606800052890-c331f6d16d92?w=1200&h=500&fit=crop",
    title: "Affordable Daily Rates",
    description: "Get professional equipment at student-friendly prices",
  },
];

const FEATURED_ITEMS = [
  {
    id: 1,
    name: "Canon EOS R5",
    pricePerDay: "500000",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.8,
    totalReviews: 24,
    isFeatured: true,
  },
  {
    id: 4,
    name: "Sony A7 IV",
    pricePerDay: "480000",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.9,
    totalReviews: 18,
    isFeatured: true,
  },
  {
    id: 7,
    name: "Nikon Z9",
    pricePerDay: "650000",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&brightness=95",
    ownerLocation: "Telkom University Bandung",
    averageRating: 5.0,
    totalReviews: 12,
    isFeatured: true,
  },
  {
    id: 11,
    name: "Fujifilm GFX 100S",
    pricePerDay: "750000",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&contrast=105",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.7,
    totalReviews: 8,
    isFeatured: true,
  },
];

const RECENT_ITEMS = [
  {
    id: 12,
    name: "Canon RF 24-70mm f/2.8L",
    pricePerDay: "250000",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&focus=lens",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.6,
    totalReviews: 15,
  },
  {
    id: 22,
    name: "DJI Ronin-S Gimbal",
    pricePerDay: "180000",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&item=gimbal",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.5,
    totalReviews: 10,
  },
  {
    id: 17,
    name: "Canon RF 85mm f/1.2L",
    pricePerDay: "200000",
    imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&detail=glass",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.9,
    totalReviews: 20,
  },
  {
    id: 20,
    name: "Godox AD600Pro",
    pricePerDay: "150000",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&item=flash",
    ownerLocation: "Telkom University Bandung",
    averageRating: 4.4,
    totalReviews: 7,
  },
];

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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
            <Link href="/items?filter=featured">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_ITEMS.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
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
            <Link href="/items?sort=recent">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RECENT_ITEMS.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Got Camera Equipment to Rent?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join our community and start earning by renting out your photography equipment
          to fellow students and professionals.
        </p>
        <Button size="lg" asChild>
          <Link href="/items/new">List Your Equipment</Link>
        </Button>
      </section>
    </div>
  );
}