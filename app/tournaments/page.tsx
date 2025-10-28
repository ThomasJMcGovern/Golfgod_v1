"use client";

import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Trophy,
  Users,
  Star,
  Globe,
  Target,
  Calendar,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Authenticated, Unauthenticated } from "convex/react";

export default function TournamentsHub() {
  const router = useRouter();

  const tours = [
    {
      id: "pga",
      title: "PGA TOUR",
      description: "America's premier professional golf tour",
      icon: Trophy,
      color: "bg-red-500",
      route: "/tournaments/pga/2025",
      active: true,
    },
    {
      id: "lpga",
      title: "LPGA",
      description: "Women's professional golf tour",
      icon: Users,
      color: "bg-purple-500",
      route: "#",
      active: false,
    },
    {
      id: "champions",
      title: "PGA TOUR Champions",
      description: "Senior professional golf tour (50+)",
      icon: Star,
      color: "bg-amber-500",
      route: "#",
      active: false,
    },
    {
      id: "liv",
      title: "LIV Golf",
      description: "Professional team-based golf league",
      icon: Target,
      color: "bg-emerald-500",
      route: "#",
      active: false,
    },
    {
      id: "dp-world",
      title: "DP World Tour",
      description: "European professional golf tour",
      icon: Globe,
      color: "bg-orange-500",
      route: "#",
      active: false,
    },
    {
      id: "korn-ferry",
      title: "Korn Ferry Tour",
      description: "PGA TOUR developmental tour",
      icon: Calendar,
      color: "bg-blue-500",
      route: "#",
      active: false,
    },
  ];

  return (
    <>
      <Authenticated>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <AppHeader title="Tournaments" subtitle="Professional golf tours" />

          {/* Main Navigation */}
          <MainNavigation />

          {/* Breadcrumbs */}
          <div className="border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Tournaments</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Section */}
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
                Select Your Professional Tour
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Choose from the world's premier professional golf tours
              </p>
            </div>

            {/* Tours Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {tours.map((tour) => {
                const Icon = tour.icon;
                return (
                  <Card
                    key={tour.id}
                    className={`relative ${
                      tour.active
                        ? "cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
                        : "opacity-60"
                    }`}
                    onClick={() => {
                      if (tour.active && tour.route) {
                        router.push(tour.route);
                      }
                    }}
                  >
                    {!tour.active && (
                      <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
                        COMING SOON
                      </Badge>
                    )}
                    <CardHeader className="p-4 sm:p-6">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${tour.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg">
                        {tour.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {tour.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Footer Message */}
            <div className="text-center mt-8 md:mt-12 px-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore tournament schedules, results, and leaderboards from the world's top professional golf tours.
              </p>
            </div>
          </main>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view tournaments
            </p>
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
