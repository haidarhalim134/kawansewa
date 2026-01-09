"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, PackageCheck, X, Loader2, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmReturnedButtonProps {
    rentalId: number;
    itemName: string;
    renterName: string;
    depositAmount?: string;
}

export function ConfirmReturnedButton({ rentalId, itemName, renterName, depositAmount }: ConfirmReturnedButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const handleConfirm = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/rentals/confirm_returned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rentalId }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                // Wait 2 seconds before closing and refreshing
                setTimeout(() => {
                    setShowDialog(false);
                    router.refresh();
                }, 2000);
            } else {
                alert(data.error || "Failed to confirm item return");
                setIsLoading(false);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    // Success screen
    if (showDialog && isSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Return Confirmed!</h2>
                    <p className="text-gray-600 mb-4">
                        <strong>{itemName}</strong> has been successfully returned by {renterName}.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-green-800">
                            ✅ Rental completed successfully
                        </p>
                        {depositAmount && parseFloat(depositAmount) > 0 && (
                            <p className="text-sm text-green-800">
                                💰 Deposit {formatPrice(depositAmount)} will be refunded to the renter
                            </p>
                        )}
                        <p className="text-sm text-green-800">
                            💸 Your rental payment is now available
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    // Confirmation dialog
    if (showDialog) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="border-b p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <PackageCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Confirm Item Return</h2>
                                <p className="text-sm text-gray-600">Verify that the item has been returned</p>
                            </div>
                        </div>
                        {!isLoading && (
                            <button
                                onClick={() => setShowDialog(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1">
                            <p className="text-sm text-gray-700">
                                <strong>Item:</strong> {itemName}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Renter:</strong> {renterName}
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p className="font-semibold">Please confirm that:</p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>The item has been returned by {renterName}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>The item is in good condition without damage</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>You have inspected the item thoroughly</span>
                                </li>
                            </ul>
                        </div>

                        {depositAmount && parseFloat(depositAmount) > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-800">
                                        <strong>Deposit Refund:</strong> The security deposit of {formatPrice(depositAmount)} will be automatically refunded to the renter.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-800">
                                <strong>💸 Payment Release:</strong> By confirming, the rental payment will be released and available for withdrawal.
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>⚠️ Important:</strong> This action cannot be undone. Make sure the item has been returned and inspected before confirming.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t p-6 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <PackageCheck className="h-4 w-4 mr-2" />
                                    Confirm Return
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Trigger button
    return (
        <Button
            size="sm"
            onClick={() => setShowDialog(true)}
            className="gap-2 bg-green-600 hover:bg-green-700"
        >
            <PackageCheck className="h-4 w-4" />
            Barang Kembali
        </Button>
    );
}
