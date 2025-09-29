"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function TournamentsPage() {
  const router = useRouter();
  const availableYears = useQuery(api.tournaments.getAvailableYears);

  useEffect(() => {
    if (availableYears && availableYears.length > 0) {
      // Get the current year or the most recent year available
      const currentYear = new Date().getFullYear();
      const yearToRedirect = availableYears.includes(currentYear)
        ? currentYear
        : availableYears[0]; // First year is the most recent since they're sorted desc

      router.replace(`/tournaments/pga/${yearToRedirect}`);
    }
  }, [availableYears, router]);

  // Show loading state while determining which year to redirect to
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
        <p className="text-muted-foreground">Loading tournaments...</p>
      </div>
    </div>
  );
}