"use client";

import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";

export const dynamic = 'force-dynamic';

import {
  ChevronLeft,
  Target,
  Calendar,
  Layers,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react";

export default function InsideTheRopesHub() {
  const router = useRouter();

  const features = [
    {
      id: "player-course-stats",
      title: "Player Stats Per Course",
      description: "Course-specific player performance and career stats",
      icon: Target,
      color: "bg-blue-500",
      route: "/inside-the-ropes/player-course-stats",
      active: true,
    },
    {
      id: "split-stats",
      title: "Split Stats Analysis",
      description: "Thu/Fri vs Sat/Sun, AM vs PM tee time performance",
      icon: Calendar,
      color: "bg-purple-500",
      route: null,
      active: false,
    },
    {
      id: "putting-grass",
      title: "Putting by Grass Type",
      description: "Putting statistics ranked by grass type",
      icon: Layers,
      color: "bg-green-500",
      route: null,
      active: false,
    },
    {
      id: "course-stats",
      title: "Course-Specific PGA Stats",
      description: "All PGA Tour metrics broken down by course",
      icon: TrendingUp,
      color: "bg-orange-500",
      route: null,
      active: false,
    },
    {
      id: "lefty-courses",
      title: "Best Courses for Lefties",
      description: "Top-performing courses for left-handed players",
      icon: ArrowLeftRight,
      color: "bg-pink-500",
      route: null,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="mr-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Inside the Ropes</h1>
                <span className="text-sm text-muted-foreground">
                  Advanced Analytics & Insights
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                className="bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm px-2 sm:px-4"
                onClick={() => router.push("/")}
              >
                <span className="hidden sm:inline">PGA TOUR</span>
                <span className="sm:hidden">PGA</span>
              </Button>
              <ModeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
            Select Your Analytics Focus
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Choose from our advanced analytics features to gain deeper insights
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`relative ${
                  feature.active
                    ? "cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
                    : "opacity-75"
                }`}
                onClick={() => {
                  if (feature.active && feature.route) {
                    router.push(feature.route);
                  }
                }}
              >
                {!feature.active && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <Badge variant="outline" className="bg-secondary text-xs px-2 py-0.5">
                      COMING SOON
                    </Badge>
                  </div>
                )}
                <CardHeader className="p-4 sm:p-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 md:mt-12 px-4">
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            Inside the Ropes provides exclusive course-specific analytics and advanced metrics.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            More features coming soon to help you make data-driven decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
