import { db } from "@/db";
import { rentals, items, itemImages, users } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, Clock, CheckCircle, XCircle, Package, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConfirmReturnedButton } from "@/components/ConfirmReturnedButton";

export default async function OwnerRentalsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const userId = parseInt(session.userId);

    // Fetch all rentals for items owned by the logged-in user
    const ownerRentals = await db
        .select({
            id: rentals.id,
            itemId: rentals.itemId,
            itemName: items.name,
            totalPrice: rentals.totalPrice,
            depositHeld: rentals.depositHeld,
            startDate: rentals.startDate,
            endDate: rentals.endDate,
            status: rentals.status,
            renterId: rentals.renterId,
            renterName: users.name,
            renterEmail: users.email,
            firstImage: itemImages.imageUrl,
        })
        .from(rentals)
        .innerJoin(items, eq(rentals.itemId, items.id))
        .innerJoin(users, eq(rentals.renterId, users.id))
        .leftJoin(
            itemImages,
            and(eq(itemImages.itemId, items.id), eq(itemImages.imageOrder, 0))
        )
        .where(
            and(
                eq(items.ownerId, userId),
                // Show active, paid, and completed rentals (not pending or approved)
                or(
                    eq(rentals.status, "active"),
                    eq(rentals.status, "paid"),
                    eq(rentals.status, "completed")
                )
            )
        )
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
            paid: {
                label: "Paid - Waiting Pickup",
                variant: "secondary",
                icon: <Package className="h-3 w-3" />,
            },
            active: {
                label: "On Rent",
                variant: "default",
                icon: <Clock className="h-3 w-3" />,
            },
            completed: {
                label: "Completed",
                variant: "outline",
                icon: <CheckCircle className="h-3 w-3" />,
            },
        };

        const config = statusConfig[status] || statusConfig.paid;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    // Separate rentals by status
    const activeRentals = ownerRentals.filter(r => r.status === "active");
    const paidRentals = ownerRentals.filter(r => r.status === "paid");
    const completedRentals = ownerRentals.filter(r => r.status === "completed");

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Rentals</h1>
                <p className="text-gray-600 mt-1">Manage active rentals and confirm returns</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Rentals</p>
                                <p className="text-2xl font-bold">{activeRentals.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Awaiting Pickup</p>
                                <p className="text-2xl font-bold">{paidRentals.length}</p>
                            </div>
                            <Package className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold">{completedRentals.length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Rentals Section */}
            {activeRentals.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Rentals - Waiting Return</h2>
                    {activeRentals.map((rental) => (
                        <Card key={rental.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    {/* Item Image */}
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={rental.firstImage || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image"}
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
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Renter: {rental.renterName}</span>
                                                </div>
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
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 flex items-center gap-3">
                                            <ConfirmReturnedButton
                                                rentalId={rental.id}
                                                itemName={rental.itemName}
                                                renterName={rental.renterName || "Unknown"}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Click this button after the renter returns the item
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Paid Rentals Section */}
            {paidRentals.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Paid - Awaiting Pickup</h2>
                    {paidRentals.map((rental) => (
                        <Card key={rental.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={rental.firstImage || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image"}
                                            alt={rental.itemName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <Link
                                                    href={`/items/${rental.itemId}`}
                                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {rental.itemName}
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Renter: {rental.renterName}</span>
                                                </div>
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
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <p className="text-sm text-yellow-800">
                                                    ⏳ Waiting for renter to pick up the item
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Completed Rentals Section */}
            {completedRentals.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Completed Rentals</h2>
                    {completedRentals.map((rental) => (
                        <Card key={rental.id} className="hover:shadow-md transition-shadow opacity-75">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={rental.firstImage || "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image"}
                                            alt={rental.itemName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <Link
                                                    href={`/items/${rental.itemId}`}
                                                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                >
                                                    {rental.itemName}
                                                </Link>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Renter: {rental.renterName}</span>
                                                </div>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {ownerRentals.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>No Active Rentals</CardTitle>
                        <CardDescription>You don't have any active rentals at the moment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No rentals to manage
                            </h3>
                            <p className="text-gray-600 mb-4">
                                When someone rents your items, they will appear here.
                            </p>
                            <Link href="/partner">
                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                    Go to Partner Hub
                                </button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
