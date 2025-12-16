import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import PartnerHubContent from "@/components/PartnerHubContent";

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

            {/* Dynamic Content */}
            {isVerified ? (
                <PartnerHubContent isVerified={isVerified} />
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12 text-gray-500">
                            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium mb-2">Complete verification to access partner features</p>
                            <p className="text-sm">Once verified, you'll be able to list items and track your earnings.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
