"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmReturnedButtonProps {
    rentalId: number;
    itemName: string;
    renterName: string;
}

export function ConfirmReturnedButton({ rentalId, itemName, renterName }: ConfirmReturnedButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!confirm(`Konfirmasi bahwa barang "${itemName}" telah dikembalikan oleh ${renterName}?\n\nStatus akan berubah menjadi Completed dan deposit akan dikembalikan ke penyewa.`)) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/rentals/confirm_returned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rentalId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Pengembalian barang berhasil dikonfirmasi! Dana akan cair.");
                router.refresh();
            } else {
                alert(data.error || "Failed to confirm item return");
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
            className="gap-2 bg-green-600 hover:bg-green-700"
        >
            <PackageCheck className="h-4 w-4" />
            {isLoading ? "Processing..." : "Barang Kembali"}
        </Button>
    );
}
