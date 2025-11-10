import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

interface ItemCardProps {
    id: number;
    name: string;
    pricePerDay: string;
    imageUrl: string;
    ownerName?: string;
    ownerLocation?: string;
    averageRating?: number;
    totalReviews?: number;
    isFeatured?: boolean;
}

export function ItemCard({
    id,
    name,
    pricePerDay,
    imageUrl,
    ownerName,
    ownerLocation,
    averageRating = 0,
    totalReviews = 0,
    isFeatured = false,
}: ItemCardProps) {
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(parseFloat(pricePerDay));

    return (
        <Link href={`/items/${id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {isFeatured && (
                        <Badge className="absolute top-2 left-2 z-10" variant="default">
                            Featured
                        </Badge>
                    )}
                    <img
                        src={imageUrl}
                        alt={name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-2">{name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        {averageRating > 0 ? (
                            <>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-foreground">
                                    {averageRating.toFixed(1)}
                                </span>
                                <span>({totalReviews})</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">No reviews yet</span>
                        )}
                    </div>
                    {ownerLocation && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{ownerLocation}</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <div className="w-full">
                        <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
                        <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
