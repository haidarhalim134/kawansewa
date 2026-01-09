"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmReceivedButtonProps {
    rentalId: number;
    itemName: string;
}

export function ConfirmReceivedButton({ rentalId, itemName }: ConfirmReceivedButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/rentals/confirm_received", {
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
                alert(data.error || "Failed to confirm item receipt");
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Received!</h2>
                    <p className="text-gray-600 mb-4">
                        You have successfully confirmed receipt of <strong>{itemName}</strong>.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            ✅ Your rental is now active. Enjoy using the item!
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
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Confirm Item Receipt</h2>
                                <p className="text-sm text-gray-600">Verify that you have received the item</p>
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
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                <strong>Item:</strong> {itemName}
                            </p>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p className="font-semibold">Please confirm that:</p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>You have received the item from the owner</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>The item is in good condition as described</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>You are ready to start using the item</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                <strong>⚠️ Important:</strong> By confirming, you acknowledge that the rental period has started and the item is now under your responsibility.
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm Receipt
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
            className="gap-2"
        >
            <CheckCircle className="h-4 w-4" />
            Barang Diterima
        </Button>
    );
}
