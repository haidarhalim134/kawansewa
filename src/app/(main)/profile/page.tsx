import { db } from "@/db";
import { users, reviews, rentals, items } from "@/db/schema";
import { eq, avg, count } from "drizzle-orm";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Calendar, Edit, Shield, Upload, CheckCircle, Clock, XCircle, Star } from "lucide-react";
import IdentificationUpload from "@/components/IdentificationUpload";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const userId = parseInt(session.userId);

    // Fetch user data
    const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!userData) {
        redirect("/login");
    }

    // query owner rating data, adjust to calculate own avg rating
    const ownerRatingData = await db
        .select({
            avgRating: avg(reviews.star),
            totalReviews: count(reviews.id),
        })
        .from(reviews)
        .innerJoin(rentals, eq(reviews.rentalId, rentals.id))
        .innerJoin(items, eq(rentals.itemId, items.id))
        .where(eq(items.ownerId, userId));

    const ownerAvgRating = ownerRatingData[0]?.avgRating
        ? Number(ownerRatingData[0].avgRating)
        : 0;

    const ownerTotalReviews = ownerRatingData[0]?.totalReviews ?? 0;

    // Format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(date));
    };

    // Get verification status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "verified":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                );
            case "pending_verification":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Verification
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                </div>
                <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                </Button>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userData.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                                {userData.name?.charAt(0).toUpperCase() || userData.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {userData.name || "No name set"}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">
                                        {ownerAvgRating.toFixed(1)}
                                    </span>
                                    <span className="text-gray-500">
                                        ({ownerTotalReviews})
                                    </span>
                                </div>
                                {getStatusBadge(userData.status)}
                            </div>
                            <p className="text-gray-600 text-sm">
                                Member since {formatDate(userData.createdAt)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Contact Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-600">Email Address</div>
                                    <div className="font-medium text-gray-900">{userData.email}</div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-600">Location</div>
                                    <div className="font-medium text-gray-900">
                                        {userData.location || "No location set"}
                                    </div>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="flex items-start gap-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-600">Member Since</div>
                                    <div className="font-medium text-gray-900">
                                        {formatDate(userData.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Account Stats */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Account Statistics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">0</div>
                                <div className="text-sm text-gray-600 mt-1">Total Rentals</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">0</div>
                                <div className="text-sm text-gray-600 mt-1">Items Listed</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-purple-600">0</div>
                                <div className="text-sm text-gray-600 mt-1">Favorites</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Identity Verification Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <CardTitle>Identity Verification</CardTitle>
                    </div>
                    <CardDescription>
                        Verify your identity to unlock full platform features and build trust with other users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">Verification Status</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    {userData.status === "verified" && "Your identity has been verified!"}
                                    {userData.status === "pending_verification" && "Your identification is under review"}
                                    {userData.status === "unverified" && "Upload your identification to get verified"}
                                </p>
                            </div>
                            {getStatusBadge(userData.status)}
                        </div>
                    </div>

                    {/* Upload Section */}
                    {userData.status !== "verified" && (
                        <div className="space-y-3">
                            {userData.identificationImageUrl && (
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <p className="text-sm font-medium text-blue-900 mb-2">Current Identification</p>
                                    <img
                                        src={userData.identificationImageUrl}
                                        alt="Identification"
                                        className="max-w-full h-auto rounded-lg border"
                                    />
                                </div>
                            )}

                            <IdentificationUpload
                                currentImageUrl={userData.identificationImageUrl || undefined}
                                status={userData.status}
                            />

                            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-semibold text-blue-900 mb-2">📋 Requirements</h5>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Upload a clear photo of your government-issued ID</li>
                                    <li>Accepted documents: Passport, Driver's License, National ID, Student ID</li>
                                    <li>Ensure all text is clearly visible</li>
                                    <li>Verification typically takes 24-48 hours</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {userData.status === "verified" && userData.identificationImageUrl && (
                        <div className="border rounded-lg p-4 bg-green-50">
                            <p className="text-sm font-medium text-green-900 mb-2">✓ Verified Identification</p>
                            <img
                                src={userData.identificationImageUrl}
                                alt="Verified Identification"
                                className="max-w-full h-auto rounded-lg border"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                        Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        Update Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
