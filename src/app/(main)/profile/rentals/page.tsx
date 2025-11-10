import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function RentalHistoryPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Rental History</h1>
                <p className="text-gray-600 mt-1">View all your past and current rentals</p>
            </div>

            {/* Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Rentals</CardTitle>
                    <CardDescription>Track your rental activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <History className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No rental history yet
                        </h3>
                        <p className="text-gray-600">
                            When you rent items, they will appear here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
