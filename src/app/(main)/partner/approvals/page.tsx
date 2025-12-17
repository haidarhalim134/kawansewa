"use client";

import { useEffect, useState } from "react";
import { RentalApprovalCard } from "@/components/RentalApprovalCard";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, CheckCircle } from "lucide-react";

interface Rental {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  depositHeld: string;
  item: {
    id: number;
    name: string;
    pricePerDay: string;
    imageUrl: string | null;
  };
  renter: {
    id: number;
    name: string;
    email: string;
    profileImageUrl: string | null;
  };
}

export default function RentalApprovalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rentals/pending");
      if (response.ok) {
        const data = await response.json();
        setRentals(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch rental requests");
      }
    } catch (err) {
      setError("An error occurred while fetching rental requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRentals();
  }, []);

  const handleApprove = () => {
    // Refresh the list after approval
    fetchPendingRentals();
  };

  const handleReject = () => {
    // Refresh the list after rejection
    fetchPendingRentals();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Rental Approvals</h1>
        </div>
        <p className="text-gray-600">
          Review and manage incoming rental requests for your items
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Rental Requests List */}
      {rentals.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-600">
            You don't have any pending rental requests at the moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <RentalApprovalCard
              key={rental.id}
              rental={rental}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {rentals.length > 0 && (
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            📋 You have <strong>{rentals.length}</strong> pending rental request
            {rentals.length > 1 ? "s" : ""} waiting for your review
          </p>
        </Card>
      )}
    </div>
  );
}
