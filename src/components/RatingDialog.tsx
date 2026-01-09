'use client'

import { Button } from "@/components/ui/button";
import {  Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function RatingDialog({ rentalId, itemId }: { rentalId: number; itemId: number }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);

    async function submitRating() {
        if (rating < 1 || rating > 5) return;

        setLoading(true);

        const res = await fetch(`/api/rentals/${rentalId}/give_rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, star: rating }),
        });

        if (res.ok) {
            setOpen(false);
            window.location.reload();
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    Give Rating
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Rental</DialogTitle>
                </DialogHeader>

                <div className="flex justify-center gap-2 py-6">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                            key={value}
                            onClick={() => setRating(value)}
                            className={`h-8 w-8 cursor-pointer ${
                                value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                        />
                    ))}
                </div>

                <Button onClick={submitRating} disabled={rating === 0 || loading}>
                    Submit Rating
                </Button>
            </DialogContent>
        </Dialog>
    );
}