"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
import SearchableSelect from "@/components/ui/searchable-select";
import {
  User,
  Trophy,
  ClipboardList,
  Users,
  BarChart3,
  Zap,
  LogOut,
  ExternalLink
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const playerStats = useQuery(api.players.getPlayerCount, {});

  // State for Card 1 (FIND PLAYER)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  // State for Card 2 (CHOOSE TOUR)
  const [selectedTour, setSelectedTour] = useState<string>("pga");
  const [selectedSeason, setSelectedSeason] = useState<string>("2025-2026");
  const [selectedTournament, setSelectedTournament] = useState<string>("");

  // Helper function to extract year from season (e.g., "2024-2025" → 2025)
  const getSeasonEndYear = (season: string) => {
    return parseInt(season.split('-')[1]);
  };

  // Generate all available seasons dynamically (2015-2026)
  const availableSeasons = (() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2015;
    const endYear = Math.max(currentYear + 1, 2026);
    const seasons = [];

    for (let year = endYear - 1; year >= startYear; year--) {
      seasons.push({
        value: `${year}-${year + 1}`,
        label: `${year}/${year + 1}`
      });
    }

    return seasons;
  })();

  // Fetch data for selects
  const players = useQuery(api.players.getAll, {});
  const tournaments = useQuery(api.tournaments.getTournamentsByYear, {
    year: getSeasonEndYear(selectedSeason),
    limit: 100
  });

  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string): string => {
    if (countryCode === "GB-ENG" || countryCode === "GB-SCT" ||
        countryCode === "GB-NIR" || countryCode === "GB-WLS") {
      return "🇬🇧";
    }
    if (!countryCode || countryCode.length !== 2) {
      return "🏳️";
    }
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🏳️";
    }
  };

  // Format players for SearchableSelect
  const playerOptions = players?.map((player) => ({
    value: player._id,
    label: player.name,
    subtitle: player.country,
    flag: player.countryCode ? getFlagEmoji(player.countryCode) : undefined,
  })) || [];

  // Format tournaments for SearchableSelect
  const tournamentOptions = tournaments?.map((tournament) => ({
    value: tournament._id,
    label: tournament.name,
    subtitle: tournament.start_date ? `${tournament.start_date} ${tournament.year}` : `${tournament.year}`,
  })) || [];

  // Get current season year for schedule link
  const getCurrentSeasonYear = () => {
    return getSeasonEndYear(selectedSeason);
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
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="mr-3"
              >
                <LogOut className="h-4 w-4" />
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
          {/* Card 1: FIND PLAYER */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">FIND PLAYER</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              <div>
                <SearchableSelect
                  value={selectedPlayerId}
                  onChange={(value) => {
                    setSelectedPlayerId(value);
                    if (value) {
                      router.push(`/players?playerId=${value}`);
                    }
                  }}
                  options={playerOptions}
                  placeholder="Search for a player..."
                  isLoading={!players}
                  showFlags={true}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Once the player is chosen and found then show the following options
              </p>
            </CardContent>
          </Card>

          {/* Card 2: CHOOSE TOUR */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">CHOOSE TOUR</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {/* Tour Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tour (currently only offers 1 tour)</Label>
                <Select value={selectedTour} onValueChange={setSelectedTour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pga">PGA Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Season Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Choose SEASON (2015-2026)</Label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableSeasons.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tournament Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">FIND TOURNAMENT</Label>
                <SearchableSelect
                  value={selectedTournament}
                  onChange={(value) => {
                    setSelectedTournament(value);
                    if (value) {
                      // Navigate to specific tournament page when implemented
                      console.log("Navigate to tournament:", value);
                    }
                  }}
                  options={tournamentOptions}
                  placeholder="Search for a tournament..."
                  isLoading={!tournaments}
                />
              </div>

              {/* Schedule Link */}
              <div className="pt-2">
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-semibold text-green-600 hover:text-green-700 whitespace-normal text-left inline-flex items-start"
                  onClick={() => router.push(`/tournaments/pga/${getCurrentSeasonYear()}`)}
                >
                  <span className="flex-1">OR CLICK HERE FOR FULL SCHEDULE - CURRENT SEASON!</span>
                  <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0 mt-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: INSIDE THE ROPES */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
            onClick={() => router.push("/inside-the-ropes")}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">INSIDE THE ROPES</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <CardDescription className="text-xs sm:text-sm mb-3">
                Course-specific player stats and betting insights
              </CardDescription>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Advanced Analytics
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