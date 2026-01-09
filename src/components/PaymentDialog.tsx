"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, Building2, X, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentDialogProps {
    rentalId: number;
    totalAmount: string;
    itemName: string;
    onClose: () => void;
}

type PaymentMethod = "credit_card" | "e_wallet" | "bank_transfer";

export function PaymentDialog({ rentalId, totalAmount, itemName, onClose }: PaymentDialogProps) {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const paymentMethods = [
        {
            id: "credit_card" as PaymentMethod,
            name: "Credit/Debit Card",
            icon: CreditCard,
            description: "Visa, Mastercard, JCB",
        },
        {
            id: "e_wallet" as PaymentMethod,
            name: "E-Wallet",
            icon: Wallet,
            description: "GoPay, OVO, Dana, ShopeePay",
        },
        {
            id: "bank_transfer" as PaymentMethod,
            name: "Bank Transfer",
            icon: Building2,
            description: "BCA, Mandiri, BNI, BRI",
        },
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            alert("Please select a payment method");
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing (dummy)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const response = await fetch("/api/rentals/process_payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rentalId,
                    paymentMethod: selectedMethod,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                // Wait 2 seconds before redirecting
                setTimeout(() => {
                    router.push("/profile/rentals?success=true&message=payment_success");
                    router.refresh();
                }, 2000);
            } else {
                alert(data.error || "Payment failed");
                setIsProcessing(false);
            }
        } catch (error) {
            alert("An error occurred during payment");
            setIsProcessing(false);
        }
    };

    // Success screen
    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Your payment has been processed successfully.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                            <strong>Next Step:</strong> Pick up the item from the owner at the agreed time.
                        </p>
                    </div>
                    <p className="text-sm text-gray-500">Redirecting...</p>
                </Card>
            </div>
        );
    }

    // Payment form
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Payment Gateway</h2>
                        <p className="text-sm text-gray-600 mt-1">Complete your rental payment</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Item:</span>
                                <span className="font-medium">{itemName}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-blue-200">
                                <span>Total Payment:</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <Label className="text-base font-semibold mb-3 block">
                            Select Payment Method
                        </Label>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                const isSelected = selectedMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`w-full p-4 border-2 rounded-lg text-left transition-all disabled:opacity-50 ${isSelected
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-600" : "bg-gray-100"
                                                    }`}
                                            >
                                                <Icon
                                                    className={`h-6 w-6 ${isSelected ? "text-white" : "text-gray-600"
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">
                                                    {method.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {method.description}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dummy Payment Info */}
                    {selectedMethod && !isProcessing && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>⚠️ Demo Mode:</strong> This is a dummy payment gateway. No actual payment will be processed.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handlePayment}
                            disabled={!selectedMethod || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ${formatPrice(totalAmount)}`
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
