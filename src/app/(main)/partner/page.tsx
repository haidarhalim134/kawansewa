import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Plus,
    TrendingUp,
    DollarSign,
    Eye,
    Edit,
    Trash2,
    Shield,
    AlertCircle,
    Banknote
} from "lucide-react";
import Link from "next/link";

export default async function PartnerHubPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const userId = parseInt(session.userId);

    // Fetch user data to check verification status
    const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!userData) {
        redirect("/login");
    }

    const isVerified = userData.status === "verified";

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Hub</h1>
                    <p className="text-gray-600 mt-1">Manage your rental items and track performance</p>
                </div>
                {isVerified && (
                    <Link href="/items/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            List New Item
                        </Button>
                    </Link>
                )}
            </div>

            {/* Verification Warning */}
            {!isVerified && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="shrink-0">
                                <AlertCircle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-900 mb-1">
                                    Verification Required
                                </h3>
                                <p className="text-sm text-yellow-800 mb-3">
                                    You need to verify your identity before listing items. This helps build trust in our community.
                                    {userData.status === "pending_verification" && " Your verification is currently under review."}
                                </p>
                                <Link href="/profile">
                                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Complete Verification
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Listed items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Currently rented</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp0,00</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Item views</p>
                    </CardContent>
                </Card>
            </div>

            {/* My Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>My Items</CardTitle>
                            <CardDescription>Manage your rental inventory</CardDescription>
                        </div>
                        {isVerified && (
                            <Link href="/items/create">
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Empty State */}
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No items listed yet</h3>
                        <p className="text-gray-600 mb-6">
                            {isVerified
                                ? "Start earning by listing your camera gear for rent"
                                : "Complete verification to start listing your items"
                            }
                        </p>
                        {isVerified ? (
                            <Link href="/items/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    List Your First Item
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/profile">
                                <Button>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Get Verified
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* TODO: Items list will be displayed here when API is ready */}
                    {/* Example item card structure (currently hidden):
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <img src="" alt="Item" className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                                <h4 className="font-semibold">Item Name</h4>
                                <p className="text-sm text-gray-600">$25.00 per day</p>
                                <Badge>Available</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    */}
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest rental requests and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Empty State */}
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No recent activity</p>
                    </div>

                    {/* TODO: Activity list will be displayed here when API is ready */}
                </CardContent>
            </Card>
        </div>
    );
}
