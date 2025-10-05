"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
import {
  User,
  Trophy,
  ClipboardList,
  Users,
  Calendar,
  BarChart3,
  Zap,
  ChevronLeft
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const playerStats = useQuery(api.players.getPlayerCount, {});

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
                <h1 className="text-2xl font-bold">GolfGod</h1>
                <span className="text-sm text-muted-foreground">PGA Tour Analytics</span>
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
            What would you like to explore?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Select an option below to dive into comprehensive golf analytics
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Choose Player */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
            onClick={() => router.push("/players")}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Choose Player</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View player profiles, statistics, and tournament history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {playerStats === undefined ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  `${playerStats.count} Players`
                )}
              </div>
            </CardContent>
          </Card>

          {/* Choose Tournament */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
            onClick={() => router.push("/tournaments/pga/2026")}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Choose Tournament</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Browse current, completed, and upcoming tournaments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                600+ Events
              </div>
            </CardContent>
          </Card>

          {/* Inside the Ropes */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow relative active:scale-98"
            onClick={() => router.push("/inside-the-ropes")}
          >
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs px-2 py-0.5">
                NEW
              </Badge>
            </div>
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">Inside the Ropes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Course-specific player stats and betting insights
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Per-Course Analytics
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-center text-lg sm:text-xl">Quick Stats Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {/* Active Players */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                {playerStats === undefined ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold">{playerStats.count}</div>
                )}
                <div className="text-xs sm:text-sm text-muted-foreground">Active Players</div>
              </div>

              {/* Tournaments */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">600+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Tournaments</div>
              </div>

              {/* Season Stats */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">2025</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Season Stats</div>
              </div>

              {/* Player Profiles */}
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">193</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Complete Bios</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-8 md:mt-12 px-4">
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            GolfGod provides comprehensive statistical analysis for PGA Tour events.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Our advanced metrics help you make informed decisions with real-time data and historical trends.
          </p>
        </div>
      </main>
    </div>
  );
}