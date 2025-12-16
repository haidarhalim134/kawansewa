import { redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { db } from "@/db";
import { items, itemImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import EditItemForm from "@/components/EditItemForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: PageProps) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);

    if (isNaN(itemId)) {
        redirect("/partner");
    }

    // Fetch item data
    const [itemData] = await db
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);

    if (!itemData) {
        redirect("/partner");
    }

    // Check if user owns this item
    const userId = parseInt(session.userId);
    if (itemData.ownerId !== userId) {
        redirect("/partner");
    }

    // Fetch item images
    const images = await db
        .select()
        .from(itemImages)
        .where(eq(itemImages.itemId, itemId))
        .orderBy(itemImages.imageOrder);

    const canEdit = itemData.status === "available";

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            available: { label: "Available", className: "bg-green-100 text-green-800" },
            unavailable: { label: "Unavailable", className: "bg-gray-100 text-gray-800" },
            pending_rent: { label: "Pending Rent", className: "bg-yellow-100 text-yellow-800" },
        };

        const variant = variants[status] || variants.available;
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
                    <p className="text-gray-600 mt-1">Update your item information</p>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(itemData.status)}
                    <Link href="/partner">
                        <Button variant="outline">Back to Partner Hub</Button>
                    </Link>
                </div>
            </div>

            {/* Status Warning */}
            {!canEdit && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="shrink-0">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900 mb-1">
                                    Cannot Edit Item
                                </h3>
                                <p className="text-sm text-red-800">
                                    {itemData.status === "unavailable" &&
                                        "This item is marked as unavailable and cannot be edited. Change the status to 'available' first."
                                    }
                                    {itemData.status === "pending_rent" &&
                                        "This item has a pending rental request and cannot be edited until the request is resolved."
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                    <CardDescription>
                        {canEdit
                            ? "Update your item information and images"
                            : "Viewing item information (editing is disabled)"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EditItemForm
                        itemId={itemId}
                        initialData={{
                            name: itemData.name,
                            detail: itemData.detail || "",
                            pricePerDay: itemData.pricePerDay,
                            status: itemData.status,
                        }}
                        initialImages={images.map(img => img.imageUrl)}
                        canEdit={canEdit}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
