"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2, CheckCircle, ImageIcon, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditItemFormProps {
    itemId: number;
    initialData: {
        name: string;
        detail: string;
        pricePerDay: string;
        status: string;
    };
    initialImages: string[];
    canEdit: boolean;
}

export default function EditItemForm({ itemId, initialData, initialImages, canEdit }: EditItemFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData.name,
        detail: initialData.detail,
        pricePerDay: initialData.pricePerDay,
    });

    // Track existing images (URLs from database)
    const [existingImages, setExistingImages] = useState<string[]>(initialImages);

    // Track new images to upload (File objects)
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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
        if (!canEdit) return;

        const files = Array.from(e.target.files || []);

        // Validate file types
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setError("Please upload only JPEG, PNG, or WebP images");
            return;
        }

        // Validate total number of images (existing + new)
        const totalImages = existingImages.length + newImages.length + files.length;
        if (totalImages > 5) {
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
        setNewImages((prev) => [...prev, ...files]);

        // Create previews for new images
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        if (!canEdit) return;
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        if (!canEdit) return;
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const image of newImages) {
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

        if (!canEdit) {
            setError("Cannot edit item with current status");
            return;
        }

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

        const totalImages = existingImages.length + newImages.length;
        if (totalImages === 0) {
            setError("Please keep at least one image");
            return;
        }

        setUploading(true);

        try {
            // Upload new images first
            let newImageUrls: string[] = [];
            if (newImages.length > 0) {
                setUploadingImages(true);
                newImageUrls = await uploadImages();
                setUploadingImages(false);
            }

            // Combine existing and new image URLs
            const allImageUrls = [...existingImages, ...newImageUrls];

            // Update item
            const response = await fetch(`/api/items/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    detail: formData.detail || undefined,
                    pricePerDay: pricePerDay,
                    imageUrls: allImageUrls,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update item");
            }

            setSuccess(true);

            // Redirect back to partner hub after success
            setTimeout(() => {
                router.push("/partner");
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update item");
            setUploadingImages(false);
        } finally {
            setUploading(false);
        }
    };

    const totalImages = existingImages.length + newImages.length;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Disabled Warning */}
            {!canEdit && (
                <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Editing Disabled</p>
                        <p>This item cannot be edited due to its current status. All fields are view-only.</p>
                    </div>
                </div>
            )}

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
                    disabled={!canEdit}
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
                    disabled={!canEdit}
                    className="resize-none"
                />
            </div>

            {/* Price Per Day */}
            <div className="space-y-2">
                <Label htmlFor="pricePerDay">
                    Price Per Day (USD) <span className="text-red-500">*</span>
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
                    disabled={!canEdit}
                    required
                />
            </div>

            {/* Image Management */}
            <div className="space-y-2">
                <Label>
                    Images <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 ml-2">
                        ({totalImages}/5 images)
                    </span>
                </Label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    disabled={!canEdit}
                    className="hidden"
                />

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Current Images</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {existingImages.map((imageUrl, index) => (
                                <div key={`existing-${index}`} className="relative group">
                                    <img
                                        src={imageUrl}
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                            Primary
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images Preview */}
                {newImagePreviews.length > 0 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">New Images to Upload</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {newImagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`New ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-green-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                        New
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {canEdit && totalImages < 5 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {totalImages === 0 ? "Upload Images" : "Add More Images"}
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
                    Item updated successfully! Redirecting...
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={uploading || !canEdit}
                    className="flex-1"
                    size="lg"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {uploadingImages ? "Uploading Images..." : "Updating Item..."}
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/partner")}
                    disabled={uploading}
                    size="lg"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
