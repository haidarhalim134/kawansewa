"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, Tag, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
    itemId: number;
    pricePerDay: string;
    depositAmount: string;
    ownerId: number;
    renterId: number;
}

export function CheckoutForm({ itemId, pricePerDay, depositAmount, ownerId, renterId }: CheckoutFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [voucherCode, setVoucherCode] = useState("");

    // Calculated state
    const [totalDays, setTotalDays] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [voucherError, setVoucherError] = useState("");

    const pricePerDayNum = parseFloat(pricePerDay);
    const depositAmountNum = parseFloat(depositAmount) || 0;

    // Calculate rental duration and price
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Check if end date is before start date
            if (end < start) {
                setTotalDays(0);
                setSubtotal(0);
                return;
            }

            const diffTime = end.getTime() - start.getTime();

            // Calculate days: same day = 1 day, next day = 2 days, etc.
            // diffTime in milliseconds / (1000 * 60 * 60 * 24) = days difference
            // Add 1 to include both start and end date
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

            setTotalDays(diffDays);
            setSubtotal(pricePerDayNum * diffDays);
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

    const total = Math.max(0, subtotal - discount + depositAmountNum);

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

        if (totalDays < 1) {
            alert("Invalid date range. End date cannot be before start date.");
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
                    depositHeld: depositAmountNum,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to rental history with success message
                router.push(`/profile/rentals?success=true&message=rental_request_submitted`);
            } else {
                alert(data.error || "Failed to submit rental request");
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
                    {startDate && endDate && totalDays === 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-900">
                                <span className="font-semibold">Invalid date range:</span> End date cannot be before start date
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

            {/* Right Column - Rental Request Info & Summary */}
            <div className="space-y-6">
                {/* Rental Request Information */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Rental Request Process
                    </h2>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shrink-0 mt-0.5">
                                1
                            </div>
                            <p>You submit a rental request to the item owner</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shrink-0 mt-0.5">
                                2
                            </div>
                            <p>The owner reviews and can approve or reject your request</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs shrink-0 mt-0.5">
                                3
                            </div>
                            <p>If approved, you can proceed with payment through your rental history</p>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                            ⚠️ <strong>Note:</strong> Your request will be marked as "Pending" until the owner responds.
                        </p>
                    </div>
                </Card>

                {/* Transaction Summary - Sticky */}
                <div className="lg:sticky lg:top-24">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Rental Summary</h2>
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
                            {depositAmountNum > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Security Deposit</span>
                                    <span className="font-medium">{formatPrice(depositAmountNum)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-lg">Estimated Total</span>
                                    <span className="font-bold text-xl text-blue-600">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>
                            {depositAmountNum > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                    <p className="text-xs text-blue-800">
                                        💡 <strong>Deposit {formatPrice(depositAmountNum)}</strong> will be refunded after the rental is completed successfully.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-6"
                            size="lg"
                            disabled={isSubmitting || totalDays <= 0}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Rental Request"}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Payment will be processed after the owner approves your request
                        </p>
                    </Card>
                </div>
            </div>
        </form>
    );
}
