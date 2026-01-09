"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";

interface PayNowButtonProps {
    rentalId: number;
    totalAmount: string;
    itemName: string;
}

export function PayNowButton({ rentalId, totalAmount, itemName }: PayNowButtonProps) {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                className="bg-green-600 hover:bg-green-700"
            >
                <CreditCard className="h-4 w-4 mr-2" />
                Bayar Sekarang
            </Button>

            {showDialog && (
                <PaymentDialog
                    rentalId={rentalId}
                    totalAmount={totalAmount}
                    itemName={itemName}
                    onClose={() => setShowDialog(false)}
                />
            )}
        </>
    );
}
