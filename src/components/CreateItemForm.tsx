"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2, CheckCircle, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateItemForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        detail: "",
        pricePerDay: "",
        depositAmount: "",
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate file types
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setError("Please upload only JPEG, PNG, or WebP images");
            return;
        }

        // Validate total number of images
        if (images.length + files.length > 5) {
            setError("Maximum 5 images allowed");
            return;
        }

        // Validate file size (max 5MB each)
        const maxSize = 5 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            setError("Each image must be less than 5MB");
            return;
        }

        setError(null);
        setImages((prev) => [...prev, ...files]);

        // Create previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const image of images) {
            const formData = new FormData();
            formData.append("file", image);

            const response = await fetch("/api/items/upload_image", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload image");
            }

            const data = await response.json();
            uploadedUrls.push(data.url);
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate form
        if (!formData.name || !formData.pricePerDay) {
            setError("Please fill in all required fields");
            return;
        }

        const pricePerDay = parseFloat(formData.pricePerDay);
        if (isNaN(pricePerDay) || pricePerDay <= 0) {
            setError("Please enter a valid price");
            return;
        }

        const depositAmount = formData.depositAmount ? parseFloat(formData.depositAmount) : 0;
        if (isNaN(depositAmount) || depositAmount < 0) {
            setError("Please enter a valid deposit amount");
            return;
        }

        if (images.length === 0) {
            setError("Please upload at least one image");
            return;
        }

        setUploading(true);

        try {
            // Upload images first
            setUploadingImages(true);
            const imageUrls = await uploadImages();
            setUploadingImages(false);

            // Create item
            const response = await fetch("/api/items/create_item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    detail: formData.detail || undefined,
                    pricePerDay: pricePerDay,
                    depositAmount: depositAmount,
                    imageUrls: imageUrls,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create item");
            }

            const data = await response.json();
            setSuccess(true);

            // Redirect to the item page after success
            setTimeout(() => {
                router.push(`/items/${data.item.id}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create item");
            setUploadingImages(false);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
                <Label htmlFor="name">
                    Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Canon EOS R5, Sony A7III"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Item Description */}
            <div className="space-y-2">
                <Label htmlFor="detail">Description</Label>
                <Textarea
                    id="detail"
                    name="detail"
                    placeholder="Describe your item's condition, what's included, special features..."
                    rows={4}
                    value={formData.detail}
                    onChange={handleInputChange}
                    className="resize-none"
                />
            </div>

            {/* Price Per Day */}
            <div className="space-y-2">
                <Label htmlFor="pricePerDay">
                    Price Per Day <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.00"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Deposit Amount */}
            <div className="space-y-2">
                <Label htmlFor="depositAmount">
                    Deposit Amount (Optional)
                </Label>
                <Input
                    id="depositAmount"
                    name="depositAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.depositAmount}
                    onChange={handleInputChange}
                />
                <p className="text-sm text-gray-500">
                    💡 Security deposit will be held during rental and refunded after item is returned safely
                </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
                <Label>
                    Images <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 ml-2">(Max 5 images)</span>
                </Label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                {index === 0 && (
                                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        Primary
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                {images.length < 5 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {images.length === 0 ? "Upload Images" : "Add More Images"}
                    </Button>
                )}

                <p className="text-sm text-gray-500">
                    First image will be the primary photo. Max 5MB per image.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Item created successfully! Redirecting...
                </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={uploading} className="w-full" size="lg">
                {uploading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadingImages ? "Uploading Images..." : "Creating Item..."}
                    </>
                ) : (
                    "List Item"
                )}
            </Button>
        </form>
    );
}
