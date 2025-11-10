"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    itemId: number;
    initialIsFavorited: boolean;
}

export function FavoriteButton({ itemId, initialIsFavorited }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                const result = await toggleFavorite(itemId);
                setIsFavorited(result.isFavorited);
                router.refresh();
            } catch (error) {
                console.error("Failed to toggle favorite:", error);
            }
        });
    };

    return (
        <Button
            variant={isFavorited ? "default" : "outline"}
            size="icon"
            onClick={handleToggle}
            disabled={isPending}
            className="transition-all"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                className={`h-5 w-5 transition-all ${isFavorited ? "fill-current" : ""
                    }`}
            />
        </Button>
    );
}
