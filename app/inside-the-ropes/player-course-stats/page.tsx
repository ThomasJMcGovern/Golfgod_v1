"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import SearchableSelect from "@/components/ui/searchable-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserMenu from "@/components/layout/UserMenu";
import { ModeToggle } from "@/components/mode-toggle";
import { Trophy, TrendingUp, TrendingDown, Target, Wind, Calendar, DollarSign, Award, ChevronLeft } from "lucide-react";

export default function InsideTheRopes() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");

  // Fetch courses and players
  const courses = useQuery(api.courseStats.getAllCourses, {});
  const players = useQuery(api.players.getAll, {});

  // Fetch player stats for selected course
  const playerStats = useQuery(
    api.courseStats.getPlayerCourseStats,
    selectedCourse && selectedPlayer
      ? {
          playerId: selectedPlayer as any,
          courseId: selectedCourse as any,
        }
      : "skip"
  );

  // Fetch all players at the selected course for comparison
  const courseLeaderboard = useQuery(
    api.courseStats.getAllPlayersAtCourse,
    selectedCourse ? { courseId: selectedCourse as any } : "skip"
  );

  // Fetch tournament history for selected player at selected course
  const tournamentHistory = useQuery(
    api.courseStats.getPlayerTournamentHistoryAtCourse,
    selectedCourse && selectedPlayer
      ? {
          playerId: selectedPlayer as any,
          courseId: selectedCourse as any,
        }
      : "skip"
  );

  const calculateCourseStats = useMutation(api.courseStats.calculatePlayerCourseStats);
  const seedCourses = useMutation(api.courseStats.seedPopularCourses);

  const handleSeedCourses = async () => {
    try {
      const result = await seedCourses();
      console.log("Seeding result:", result);
    } catch (error) {
      console.error("Error seeding courses:", error);
    }
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatMoney = (value?: number) => {
    if (value === undefined) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to get flag emoji from country code
  const getFlagEmoji = (countryCode: string): string => {
    // Handle special cases for UK subdivisions - use UK flag for all
    if (countryCode === "GB-ENG" || countryCode === "GB-SCT" ||
        countryCode === "GB-NIR" || countryCode === "GB-WLS") {
      return "🇬🇧"; // UK flag for all British subdivisions
    }

    // Handle invalid or empty country codes
    if (!countryCode || countryCode.length !== 2) {
      return "🏳️"; // Default flag
    }

    try {
      // Convert country code to flag emoji
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🏳️"; // Default flag on error
    }
  };

  // Format courses for SearchableSelect
  const courseOptions = courses?.map((course) => ({
    value: course._id,
    label: course.name,
    subtitle: course.location,
  })) || [];

  // Format players for SearchableSelect
  const playerOptions = players?.map((player) => ({
    value: player._id,
    label: player.name,
    subtitle: player.country,
    flag: player.countryCode ? getFlagEmoji(player.countryCode) : undefined,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="mr-3"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Inside the Ropes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Course-specific player performance and betting insights
                </p>
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
      <div className="container mx-auto px-4 py-8">
        {/* Course and Player Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Course</label>
            {courses?.length === 0 ? (
              <div className="p-4 text-center border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">No courses available</p>
                <Button size="sm" onClick={handleSeedCourses}>
                  Seed Popular Courses
                </Button>
              </div>
            ) : (
              <SearchableSelect
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={courseOptions}
                placeholder="Search for a course..."
                isLoading={!courses}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Player</label>
            <SearchableSelect
              value={selectedPlayer}
              onChange={setSelectedPlayer}
              options={playerOptions}
              placeholder="Search for a player..."
              isLoading={!players}
              showFlags={true}
            />
          </div>
        </div>

      {/* Player Course Statistics */}
      {playerStats && (
        <div className="space-y-4 md:space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Scoring Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.scoringAverage.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Best: {playerStats.bestScore} | Worst: {playerStats.worstScore}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cut Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {playerStats.cutsMade}/{playerStats.cutsPlayed}
                </div>
                <Progress
                  value={(playerStats.cutsMade / playerStats.cutsPlayed) * 100}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(playerStats.cutsMade / playerStats.cutsPlayed)} made
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tournament Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {playerStats.wins > 0 && (
                    <Badge variant="default">
                      <Trophy className="w-3 h-3 mr-1" />
                      {playerStats.wins}W
                    </Badge>
                  )}
                  <Badge variant="secondary">T10: {playerStats.top10s}</Badge>
                  <Badge variant="outline">T25: {playerStats.top25s}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(playerStats.totalEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  {playerStats.roundsPlayed} rounds played
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="inline-flex h-auto w-full justify-start overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-x-visible">
              <TabsTrigger value="history" className="flex-shrink-0">Tournament History</TabsTrigger>
              <TabsTrigger value="scoring" className="flex-shrink-0">Career Stats</TabsTrigger>
              <TabsTrigger value="rounds" className="flex-shrink-0">Rounds</TabsTrigger>
              <TabsTrigger value="advanced" className="flex-shrink-0">Advanced</TabsTrigger>
              <TabsTrigger value="comparison" className="flex-shrink-0">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Tournament-by-Tournament History at a Specific Course</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Individual tournament performances (most recent first)</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {tournamentHistory && tournamentHistory.length > 0 ? (
                    <ScrollArea className="w-full">
                      <div className="min-w-[800px] p-4 sm:p-0">
                        <table className="w-full">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 font-semibold text-xs sm:text-sm">Year</th>
                            <th className="pb-3 font-semibold text-xs sm:text-sm">Tournament</th>
                            <th className="pb-3 font-semibold text-center text-xs sm:text-sm">Position</th>
                            <th className="pb-3 font-semibold text-center text-xs sm:text-sm">Scorecard</th>
                            <th className="pb-3 font-semibold text-center text-xs sm:text-sm">Total</th>
                            <th className="pb-3 font-semibold text-center text-xs sm:text-sm">To Par</th>
                            <th className="pb-3 font-semibold text-right text-xs sm:text-sm">Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tournamentHistory.map((tournament, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-3 text-xs sm:text-sm">{tournament.year}</td>
                              <td className="py-3 text-xs sm:text-sm">{tournament.tournament}</td>
                              <td className="py-3 text-center">
                                {tournament.position?.toUpperCase().includes("MC") ||
                                 tournament.position?.toUpperCase().includes("CUT") ||
                                 tournament.position?.toUpperCase().includes("WD") ? (
                                  <Badge variant="outline" className="bg-secondary text-xs">
                                    {tournament.position}
                                  </Badge>
                                ) : (
                                  <Badge variant={tournament.position === "1" ? "default" : "outline"} className="text-xs">
                                    {tournament.position}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 text-center">
                                {tournament.scorecard ? (
                                  <span className="text-blue-600 font-mono text-xs sm:text-sm">
                                    {tournament.scorecard}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="py-3 text-center font-medium text-xs sm:text-sm">
                                {tournament.totalScore || "-"}
                              </td>
                              <td className="py-3 text-center text-xs sm:text-sm">
                                {tournament.toPar !== undefined && tournament.toPar !== 0 ? (
                                  <span className={tournament.toPar < 0 ? "text-green-600 font-semibold" : "text-red-600"}>
                                    {tournament.toPar > 0 ? "+" : ""}{tournament.toPar}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">E</span>
                                )}
                              </td>
                              <td className="py-3 text-right text-xs sm:text-sm">
                                {formatMoney(tournament.earnings)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm sm:text-base p-4">
                      No tournament history found at this course
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Scoring Breakdown</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Round-by-round scoring averages at this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Individual Rounds</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Round 1 Average:</span>
                          <span className="font-medium">{playerStats.avgR1Score?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Round 2 Average:</span>
                          <span className="font-medium">{playerStats.avgR2Score?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Round 3 Average:</span>
                          <span className="font-medium">{playerStats.avgR3Score?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Round 4 Average:</span>
                          <span className="font-medium">{playerStats.avgR4Score?.toFixed(2) || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Performance Splits</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Thursday/Friday:</span>
                          <span className="font-medium">{playerStats.avgEarlyScore?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Weekend:</span>
                          <span className="font-medium">{playerStats.avgWeekendScore?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Weekend Differential:</span>
                          {playerStats.avgEarlyScore && playerStats.avgWeekendScore && (
                            <Badge variant={
                              playerStats.avgWeekendScore < playerStats.avgEarlyScore ? "default" : "destructive"
                            }>
                              {playerStats.avgWeekendScore < playerStats.avgEarlyScore ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {Math.abs(playerStats.avgWeekendScore - playerStats.avgEarlyScore).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rounds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Round History</CardTitle>
                  <CardDescription>Historical performance at this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    Detailed round history coming soon...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl">Advanced Statistics</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Strokes gained and detailed metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Ball Striking Stats */}
                    <div>
                      <h4 className="font-semibold mb-3">Ball Striking</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Driving Distance:</span>
                          <span className="font-medium">
                            {playerStats.avgDrivingDistance?.toFixed(1) || "N/A"} yds
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Driving Accuracy:</span>
                          <span className="font-medium">
                            {formatPercentage(playerStats.avgDrivingAccuracy)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Greens in Regulation:</span>
                          <span className="font-medium">
                            {formatPercentage(playerStats.avgGIR)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Short Game Stats */}
                    <div>
                      <h4 className="font-semibold mb-3">Short Game</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Putts per Round:</span>
                          <span className="font-medium">
                            {playerStats.avgPuttsPerRound?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Scrambling:</span>
                          <span className="font-medium">
                            {formatPercentage(playerStats.avgScrambling)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Sand Saves:</span>
                          <span className="font-medium">
                            {formatPercentage(playerStats.avgSandSaves)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Strokes Gained */}
                    {(playerStats.avgSgTotal || playerStats.avgSgPutt) && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3">Strokes Gained</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="font-bold">{playerStats.avgSgTotal?.toFixed(2) || "N/A"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">OTT</div>
                            <div className="font-bold">{playerStats.avgSgOtt?.toFixed(2) || "N/A"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">APP</div>
                            <div className="font-bold">{playerStats.avgSgApp?.toFixed(2) || "N/A"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">ARG</div>
                            <div className="font-bold">{playerStats.avgSgArg?.toFixed(2) || "N/A"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">PUTT</div>
                            <div className="font-bold">{playerStats.avgSgPutt?.toFixed(2) || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Leaderboard</CardTitle>
                  <CardDescription>Compare against other players at this course</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseLeaderboard && courseLeaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {courseLeaderboard.slice(0, 10).map((player, index) => (
                        <div
                          key={player._id}
                          className={`flex items-center justify-between p-2 rounded ${
                            player.playerId === selectedPlayer ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-8">{index + 1}.</span>
                            <span className="font-medium">{player.playerName}</span>
                            <span className="text-xs text-muted-foreground">({player.playerCountry})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{player.scoringAverage.toFixed(2)}</span>
                            {player.wins > 0 && (
                              <Badge variant="default" className="text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                {player.wins}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No data available for this course yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {selectedCourse && selectedPlayer && !playerStats && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No data available</p>
            <p className="text-muted-foreground mb-4">
              This player hasn't played at this course yet, or data hasn't been imported.
            </p>
            <Button
              onClick={() => {
                // This would trigger data calculation if we had the tournament mapping
                console.log("Would calculate stats for", selectedPlayer, "at", selectedCourse);
              }}
            >
              Import Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!selectedCourse && !selectedPlayer && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Select a course and player</p>
            <p className="text-muted-foreground">
              Discover course-specific performance insights to inform your betting decisions
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}