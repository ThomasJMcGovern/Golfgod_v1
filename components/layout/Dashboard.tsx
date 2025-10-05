"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { signOut } = useAuthActions();
  const router = useRouter();
  const playerStats = useQuery(api.players.getPlayerCount, {});

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSignOut}
                variant="default"
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                PGA TOUR
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">
            What would you like to explore?
          </h2>
          <p className="text-muted-foreground">
            Select an option below to dive into comprehensive golf analytics
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Choose Player */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/players")}
          >
            <CardHeader>
              <div className="w-14 h-14 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <User className="w-7 h-7 text-white" />
              </div>
              <CardTitle>Choose Player</CardTitle>
              <CardDescription>
                View player profiles, statistics, and tournament history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {playerStats?.count || 0} Players
              </div>
            </CardContent>
          </Card>

          {/* Choose Tournament */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/tournaments/pga/2026")}
          >
            <CardHeader>
              <div className="w-14 h-14 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <CardTitle>Choose Tournament</CardTitle>
              <CardDescription>
                Browse current, completed, and upcoming tournaments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                600+ Events
              </div>
            </CardContent>
          </Card>

          {/* Inside the Ropes */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => router.push("/inside-the-ropes")}
          >
            <div className="absolute top-4 right-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                NEW
              </Badge>
            </div>
            <CardHeader>
              <div className="w-14 h-14 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <CardTitle>Inside the Ropes</CardTitle>
              <CardDescription>
                Course-specific player stats and betting insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4 mr-1" />
                Per-Course Analytics
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Quick Stats Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Active Players */}
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">{playerStats?.count || 0}</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>

              {/* Tournaments */}
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">600+</div>
                <div className="text-sm text-muted-foreground">Tournaments</div>
              </div>

              {/* Season Stats */}
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">2025</div>
                <div className="text-sm text-muted-foreground">Season Stats</div>
              </div>

              {/* Player Profiles */}
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold">193</div>
                <div className="text-sm text-muted-foreground">Complete Bios</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-2">
            GolfGod provides comprehensive statistical analysis for PGA Tour events.
          </p>
          <p className="text-sm text-muted-foreground">
            Our advanced metrics help you make informed decisions with real-time data and historical trends.
          </p>
        </div>
      </main>
    </div>
  );
}