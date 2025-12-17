"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Calendar, DollarSign, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface Rental {
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    totalPrice: string;
    depositHeld: string;
    item: {
        id: number;
        name: string;
        pricePerDay: string;
        imageUrl: string | null;
    };
    renter: {
        id: number;
        name: string;
        email: string;
        profileImageUrl: string | null;
    };
}

interface RentalApprovalCardProps {
    rental: Rental;
    onApprove: () => void;
    onReject: () => void;
}

export function RentalApprovalCard({ rental, onApprove, onReject }: RentalApprovalCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const calculateDuration = () => {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            const response = await fetch("/api/rentals/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rentalId: rental.id }),
            });

            if (response.ok) {
                onApprove();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to approve rental");
            }
        } catch (error) {
            alert("An error occurred while approving the rental");
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        try {
            const response = await fetch("/api/rentals/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rentalId: rental.id,
                    reason: rejectReason,
                }),
            });

            if (response.ok) {
                setShowRejectDialog(false);
                setRejectReason("");
                onReject();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to reject rental");
            }
        } catch (error) {
            alert("An error occurred while rejecting the rental");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <>
            <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Item Image */}
                    <div className="relative w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {rental.item.imageUrl ? (
                            <Image
                                src={rental.item.imageUrl}
                                alt={rental.item.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Rental Details */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {rental.item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Rental Request #{rental.id}
                            </p>
                        </div>

                        {/* Renter Info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                {rental.renter.profileImageUrl ? (
                                    <Image
                                        src={rental.renter.profileImageUrl}
                                        alt={rental.renter.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{rental.renter.name}</p>
                                <p className="text-sm text-gray-500">{rental.renter.email}</p>
                            </div>
                        </div>

                        {/* Rental Period & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Rental Period</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {calculateDuration()} day{calculateDuration() > 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Payment</p>
                                    <p className="font-bold text-lg text-blue-600">
                                        {formatPrice(rental.totalPrice)}
                                    </p>
                                    {parseFloat(rental.depositHeld) > 0 && (
                                        <p className="text-xs text-gray-500">
                                            (includes {formatPrice(rental.depositHeld)} deposit)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex md:flex-col gap-3 shrink-0">
                        <Button
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="flex-1 md:flex-initial bg-green-600 hover:bg-green-700"
                            size="lg"
                        >
                            {isApproving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => setShowRejectDialog(true)}
                            disabled={isApproving || isRejecting}
                            variant="outline"
                            className="flex-1 md:flex-initial border-red-300 text-red-600 hover:bg-red-50"
                            size="lg"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Rental Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this rental request? You can optionally provide a reason.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Item not available, dates don't work, etc."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectReason("");
                            }}
                            disabled={isRejecting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isRejecting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRejecting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                "Confirm Reject"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
