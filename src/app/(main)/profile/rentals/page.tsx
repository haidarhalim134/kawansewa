import { db } from "@/db";
import { rentals, items, itemImages, users, vouchers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Calendar, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function RentalHistoryPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    // Fetch all rentals for the logged-in user
    const userRentals = await db
        .select({
            id: rentals.id,
            itemId: rentals.itemId,
            itemName: items.name,
            itemDetail: items.detail,
            totalPrice: rentals.totalPrice,
            depositHeld: rentals.depositHeld,
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            status: rentals.status,
            voucherCode: vouchers.code,
            discountAmount: vouchers.discountAmount,
            ownerId: items.ownerId,
            ownerName: users.name,
            firstImage: itemImages.imageUrl,
        })
        .from(rentals)
        .innerJoin(items, eq(rentals.itemId, items.id))
        .innerJoin(users, eq(items.ownerId, users.id))
        .leftJoin(vouchers, eq(rentals.voucherId, vouchers.id))
        .leftJoin(
            itemImages,
            and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 0))
        )
        .where(eq(rentals.renterId, parseInt(session.userId)))
        .orderBy(desc(rentals.id));

    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
            pending: {
                label: "Pending Approval",
                variant: "secondary",
                icon: <Clock className="h-3 w-3" />,
            },
            approved: {
                label: "Approved - Pending Payment",
                variant: "default",
                icon: <CheckCircle className="h-3 w-3" />,
            },
            active: {
                label: "Active Rental",
                variant: "default",
                icon: <CheckCircle className="h-3 w-3" />,
            },
            completed: {
                label: "Completed",
                variant: "outline",
                icon: <CheckCircle className="h-3 w-3" />,
            },
            rejected: {
                label: "Rejected",
                variant: "destructive",
                icon: <XCircle className="h-3 w-3" />,
            },
            canceled: {
                label: "Canceled",
                variant: "destructive",
                icon: <XCircle className="h-3 w-3" />,
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Rental History</h1>
                <p className="text-gray-600 mt-1">View all your past and current rentals</p>
            </div>

            {/* Rentals List */}
            {userRentals.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Rentals</CardTitle>
                        <CardDescription>Track your rental activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <History className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No rental history yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                When you rent items, they will appear here.
                            </p>
                            <Link href="/items">
                                <Button>Browse Items</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {userRentals.map((rental) => (
                        <Card key={rental.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    {/* Item Image */}
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={rental.firstImage || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800"}
                                            alt={rental.itemName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Rental Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <Link
                                                    href={`/items/${rental.itemId}`}
                                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {rental.itemName}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Owner: {rental.ownerName}
                                                </p>
                                            </div>
                                            {getStatusBadge(rental.status)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <CreditCard className="h-4 w-4" />
                                                <span className="font-semibold text-gray-900">
                                                    {formatPrice(rental.totalPrice)}
                                                </span>
                                                {parseFloat(rental.depositHeld) > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        (incl. {formatPrice(rental.depositHeld)} deposit)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {rental.status === "approved" && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <Button size="sm" className="gap-2">
                                                    <CreditCard className="h-4 w-4" />
                                                    Pay Now
                                                </Button>
                                                <p className="text-xs text-gray-500">
                                                    Complete payment to activate your rental
                                                </p>
                                            </div>
                                        )}

                                        {rental.status === "pending" && (
                                            <div className="mt-4">
                                                <p className="text-xs text-gray-500">
                                                    Waiting for owner approval. You'll receive a notification once they respond.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
