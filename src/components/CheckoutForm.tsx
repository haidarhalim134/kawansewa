"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, CreditCard, Wallet, Building2, Tag, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
    itemId: number;
    pricePerDay: string;
    ownerId: number;
    renterId: number;
}

export function CheckoutForm({ itemId, pricePerDay, ownerId, renterId }: CheckoutFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "e_wallet" | "bank_transfer">("credit_card");

    // Calculated state
    const [totalDays, setTotalDays] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [voucherError, setVoucherError] = useState("");

    const pricePerDayNum = parseFloat(pricePerDay);

    // Calculate rental duration and price
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date

            if (diffDays > 0) {
                setTotalDays(diffDays);
                setSubtotal(pricePerDayNum * diffDays);
            } else {
                setTotalDays(0);
                setSubtotal(0);
            }
        } else {
            setTotalDays(0);
            setSubtotal(0);
        }
    }, [startDate, endDate, pricePerDayNum]);

    const applyVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherError("Please enter a voucher code");
            return;
        }

        setVoucherError("");

        try {
            const response = await fetch(`/api/vouchers/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherCode }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setDiscount(parseFloat(data.discountAmount));
                setVoucherApplied(true);
                setVoucherError("");
            } else {
                setVoucherError(data.error || "Invalid voucher code");
                setDiscount(0);
                setVoucherApplied(false);
            }
        } catch (error) {
            setVoucherError("Failed to validate voucher");
            setDiscount(0);
            setVoucherApplied(false);
        }
    };

    const removeVoucher = () => {
        setVoucherCode("");
        setDiscount(0);
        setVoucherApplied(false);
        setVoucherError("");
    };

    const total = Math.max(0, subtotal - discount);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            alert("Please select rental dates");
            return;
        }

        if (totalDays <= 0) {
            alert("End date must be after start date");
            return;
        }

        if (ownerId === renterId) {
            alert("You cannot rent your own item");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/rentals/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId,
                    startDate,
                    endDate,
                    voucherCode: voucherApplied ? voucherCode : null,
                    totalPrice: total,
                    paymentMethod,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to success page or rental details
                router.push(`/profile/rentals?success=true`);
            } else {
                alert(data.error || "Failed to create rental");
                setIsSubmitting(false);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split("T")[0];

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Rental Duration & Voucher */}
            <div className="space-y-6">
                {/* Rental Duration */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Rental Duration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                min={today}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                min={startDate || today}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {totalDays > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Duration:</span> {totalDays} day{totalDays > 1 ? "s" : ""}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Voucher Code */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Voucher Code
                    </h2>
                    <div className="space-y-3">
                        {!voucherApplied ? (
                            <>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter voucher code"
                                        value={voucherCode}
                                        onChange={(e) => {
                                            setVoucherCode(e.target.value.toUpperCase());
                                            setVoucherError("");
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={applyVoucher}
                                        disabled={!voucherCode.trim()}
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {voucherError && (
                                    <p className="text-sm text-red-600">{voucherError}</p>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">{voucherCode}</p>
                                        <p className="text-sm text-green-700">Discount: {formatPrice(discount)}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeVoucher}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Right Column - Payment Method & Summary */}
            <div className="space-y-6">
                {/* Payment Method */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                    </h2>
                    <div className="space-y-3">
                        <label
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "credit_card"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="credit_card"
                                checked={paymentMethod === "credit_card"}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-4 h-4"
                            />
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">Credit/Debit Card</span>
                        </label>

                        <label
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "e_wallet"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="e_wallet"
                                checked={paymentMethod === "e_wallet"}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-4 h-4"
                            />
                            <Wallet className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">E-Wallet (GoPay, OVO, Dana)</span>
                        </label>

                        <label
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "bank_transfer"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="bank_transfer"
                                checked={paymentMethod === "bank_transfer"}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-4 h-4"
                            />
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">Bank Transfer</span>
                        </label>
                    </div>
                </Card>

                {/* Transaction Summary - Sticky */}
                <div className="lg:sticky lg:top-24">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Transaction Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Price per day</span>
                                <span className="font-medium">{formatPrice(pricePerDayNum)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium">
                                    {totalDays > 0 ? `${totalDays} day${totalDays > 1 ? "s" : ""}` : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            {voucherApplied && discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Voucher discount</span>
                                    <span className="font-medium">-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-lg">Total</span>
                                    <span className="font-bold text-xl text-blue-600">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            size="lg"
                            disabled={isSubmitting || totalDays <= 0}
                        >
                            {isSubmitting ? "Processing..." : "Pay Now"}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By proceeding, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </Card>
                </div>
            </div>
        </form>
    );
}
