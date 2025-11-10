import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Calendar, Edit } from "lucide-react";

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

    // Format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(date));
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
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {userData.name || "No name set"}
                            </h2>
                            <p className="text-gray-600">Member since {formatDate(userData.createdAt)}</p>
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
