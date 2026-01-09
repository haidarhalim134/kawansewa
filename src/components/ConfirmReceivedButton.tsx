"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmReceivedButtonProps {
    rentalId: number;
    itemName: string;
}

export function ConfirmReceivedButton({ rentalId, itemName }: ConfirmReceivedButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!confirm(`Konfirmasi bahwa Anda telah menerima "${itemName}"?`)) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/rentals/confirm_received", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rentalId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Barang berhasil dikonfirmasi diterima!");
                router.refresh();
            } else {
                alert(data.error || "Failed to confirm item receipt");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
        >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? "Processing..." : "Barang Diterima"}
        </Button>
    );
}
