"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
    images: Array<{ id: number; imageUrl: string; imageOrder: number }>;
    itemName: string;
}

export function ImageGallery({ images, itemName }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    const mainImage = images[selectedImage] || images[0];
    const fallbackImage =
        "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image";

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 border">
                <Image
                    src={mainImage?.imageUrl || fallbackImage}
                    alt={`${itemName} - Image ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-video relative rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Image
                                src={image.imageUrl}
                                alt={`${itemName} - Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
