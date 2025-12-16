"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface IdentificationUploadProps {
    currentImageUrl?: string;
    status: string;
}

export default function IdentificationUpload({ currentImageUrl, status }: IdentificationUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a valid image file (JPEG, PNG, or WebP)");
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError("File size must be less than 5MB");
            return;
        }

        setError(null);
        setSuccess(false);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/users/upload_identification", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload identification");
            }

            const data = await response.json();
            setSuccess(true);

            // Reload the page after successful upload to show updated status
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload identification");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button
                onClick={handleFileSelect}
                disabled={uploading}
                className="w-full"
                variant={currentImageUrl ? "outline" : "default"}
            >
                {uploading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                    </>
                ) : success ? (
                    <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Uploaded Successfully!
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        {currentImageUrl ? "Replace Identification" : "Upload Identification"}
                    </>
                )}
            </Button>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                </div>
            )}

            {success && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                    Identification uploaded successfully! Your status will be updated to pending verification.
                </div>
            )}

            {status === "pending_verification" && (
                <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    ⏳ Your identification is currently under review. You can upload a new one if needed.
                </div>
            )}
        </div>
    );
}
