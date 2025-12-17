"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Plus,
    TrendingUp,
    Eye,
    Edit,
    Shield,
    Banknote,
    Loader2,
    Calendar,
    User as UserIcon,
    Bell,
} from "lucide-react";
import Link from "next/link";
import DeleteItemButton from "@/components/DeleteItemButton";
import { RentalApprovalCard } from "@/components/RentalApprovalCard";

interface PartnerStats {
    totalItems: number;
    activeRentals: number;
    totalEarnings: number;
    totalViews: number;
    pendingApprovals?: number;
}

interface PartnerItem {
    id: number;
    name: string;
    detail: string | null;
    pricePerDay: string;
    status: string;
    primaryImage: string | null;
}

interface Activity {
    rentalId: number;
    rentalStatus: string;
    startDate: string;
    endDate: string;
    totalPrice: string;
    itemId: number;
    itemName: string;
    renterId: number;
    renterName: string | null;
    renterEmail: string;
    renterProfileImage: string | null;
    itemImage: string | null;
}

interface PendingRental {
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

export default function PartnerHubContent({ isVerified }: { isVerified: boolean }) {
    const [stats, setStats] = useState<PartnerStats>({
        totalItems: 0,
        activeRentals: 0,
        totalEarnings: 0,
        totalViews: 0,
        pendingApprovals: 0,
    });
    const [items, setItems] = useState<PartnerItem[]>([]);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [pendingRentals, setPendingRentals] = useState<PendingRental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isVerified) {
            fetchData();
        }
    }, [isVerified]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [statsRes, itemsRes, activityRes, pendingRes] = await Promise.all([
                fetch("/api/partner/stats"),
                fetch("/api/partner/items"),
                fetch("/api/partner/activity"),
                fetch("/api/rentals/pending"),
            ]);

            if (!statsRes.ok || !itemsRes.ok || !activityRes.ok || !pendingRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const [statsData, itemsData, activityData, pendingData] = await Promise.all([
                statsRes.json(),
                itemsRes.json(),
                activityRes.json(),
                pendingRes.json(),
            ]);

            setStats(statsData.stats);
            setItems(itemsData.items);
            setActivity(activityData.activity);
            setPendingRentals(pendingData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleRentalAction = () => {
        // Refresh data after approve/reject
        fetchData();
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            available: { label: "Available", className: "bg-green-100 text-green-800" },
            unavailable: { label: "Unavailable", className: "bg-gray-100 text-gray-800" },
            pending_rent: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
        };

        const variant = variants[status] || variants.available;
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    const getRentalStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
            approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
            rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
            active: { label: "Active", className: "bg-green-100 text-green-800" },
            completed: { label: "Completed", className: "bg-gray-100 text-gray-800" },
            canceled: { label: "Canceled", className: "bg-gray-100 text-gray-800" },
        };

        const variant = variants[status] || variants.pending;
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchData} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Pending Approvals Alert - Removed, now shown inline */}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">Listed items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeRentals}</div>
                        <p className="text-xs text-muted-foreground">Currently rented</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalViews}</div>
                        <p className="text-xs text-muted-foreground">Item views</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Rental Approvals */}
            {pendingRentals.length > 0 && (
                <Card className="border-orange-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Bell className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-orange-900">Pending Rental Requests</CardTitle>
                                    <CardDescription>
                                        {pendingRentals.length} request{pendingRentals.length > 1 ? "s" : ""} waiting for your approval
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingRentals.map((rental) => (
                            <RentalApprovalCard
                                key={rental.id}
                                rental={rental}
                                onApprove={handleRentalAction}
                                onReject={handleRentalAction}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* My Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>My Items</CardTitle>
                            <CardDescription>Manage your rental inventory</CardDescription>
                        </div>
                        <Link href="/items/create">
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items listed yet</h3>
                            <p className="text-gray-600 mb-6">
                                Start earning by listing your camera gear for rent
                            </p>
                            <Link href="/items/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    List Your First Item
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <img
                                        src={item.primaryImage || "/placeholder.png"}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-sm text-gray-600">{formatCurrency(item.pricePerDay)} per day</p>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/items/${item.id}`}>
                                            <Button variant="outline" size="sm" title="View">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/items/edit/${item.id}`}>
                                            <Button variant="outline" size="sm" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteItemButton
                                            itemId={item.id}
                                            itemName={item.name}
                                            onDeleteSuccess={fetchData}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest rental requests and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    {activity.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activity.map((act) => (
                                <div key={act.rentalId} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <img
                                        src={act.itemImage || "/placeholder.png"}
                                        alt={act.itemName}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold">{act.itemName}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Requested by {act.renterName || act.renterEmail}
                                                </p>
                                            </div>
                                            {getRentalStatusBadge(act.rentalStatus)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(act.startDate)} - {formatDate(act.endDate)}
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(act.totalPrice)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
