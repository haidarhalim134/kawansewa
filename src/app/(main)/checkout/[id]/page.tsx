import { db } from "@/db";
import { items, itemImages, users, vouchers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/cookies";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CheckoutPageProps {
    params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
        notFound();
    }

    // Fetch item with owner info
    const itemData = await db
        .select({
            id: items.id,
            name: items.name,
            detail: items.detail,
            pricePerDay: items.pricePerDay,
            ownerId: items.ownerId,
            ownerName: users.name,
            ownerLocation: users.location,
        })
        .from(items)
        .innerJoin(users, eq(items.ownerId, users.id))
        .where(eq(items.id, itemId))
        .limit(1);

    if (itemData.length === 0) {
        notFound();
    }

    const item = itemData[0];

    // Fetch first item image
    const images = await db
        .select()
        .from(itemImages)
        .where(eq(itemImages.itemId, itemId))
        .orderBy(itemImages.imageOrder)
        .limit(1);

    const firstImage = images[0]?.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800";

    // Format price
    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(parseFloat(price));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={`/items/${itemId}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to item details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Item Details Card */}
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4">Item Details</h2>
                        <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                <Image
                                    src={firstImage}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                    {item.detail}
                                </p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Owner: {item.ownerName} • {item.ownerLocation}
                                </div>
                                <div className="mt-2">
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPrice(item.pricePerDay)}
                                    </span>
                                    <span className="text-sm text-gray-500"> / day</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Form Component - Now handles two-column layout */}
                    <CheckoutForm
                        itemId={item.id}
                        pricePerDay={item.pricePerDay}
                        ownerId={item.ownerId}
                        renterId={parseInt(session.userId)}
                    />
                </div>
            </div>
        </div>
    );
}
