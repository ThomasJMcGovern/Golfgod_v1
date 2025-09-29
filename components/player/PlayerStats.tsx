"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, TrendingUp, Target, DollarSign, User, MapPin, GraduationCap, Calendar, Ruler, Weight } from "lucide-react";

interface PlayerStatsProps {
  playerId: Id<"players">;
}

export default function PlayerStats({ playerId }: PlayerStatsProps) {
  const player = useQuery(api.players.getPlayer, { playerId });
  const currentYear = new Date().getFullYear();
  const stats = useQuery(api.players.getPlayerStats, { playerId, year: currentYear });
  const tournamentResults = useQuery(api.tournamentResults.getPlayerTournamentResults, { playerId });
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  if (!player) {
    return null;
  }

  // Get unique years from tournament results
  const getAvailableYears = () => {
    if (!tournamentResults || tournamentResults.length === 0) return [];
    const years = [...new Set(tournamentResults.map(r => r.year))].sort((a, b) => b - a);
    return years;
  };

  // Filter results by selected year
  const filteredResults = selectedYear === "all"
    ? tournamentResults
    : tournamentResults?.filter(r => r.year === selectedYear);

  // Calculate age from birthdate
  const calculateAge = (birthDate: string) => {
    const [month, day, year] = birthDate.split("/").map(Number);
    const birth = new Date(year, month - 1, day);
    const ageDiff = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Format earnings as currency
  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get position styling
  const getPositionStyle = (position: string) => {
    if (position === "1") return "font-bold text-yellow-600";
    if (position.startsWith("T") && parseInt(position.substring(1)) <= 10) return "text-green-600";
    if (position === "Missed Cut" || position === "MC") return "text-gray-400";
    if (position === "WD" || position === "DQ") return "text-red-400";
    return "";
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Tab Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full h-auto p-0 bg-transparent rounded-none border-b">
            <div className="flex w-full">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
              >
                News
              </TabsTrigger>
              <TabsTrigger
                value="bio"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
              >
                Bio
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
              >
                Results
              </TabsTrigger>
              <TabsTrigger
                value="scorecards"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium"
              >
                Scorecards
              </TabsTrigger>
            </div>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-0">
            {/* Current Year Stats */}
            <div className="p-6">
              <h3 className="font-semibold mb-4">{currentYear} Season Statistics</h3>
              {stats ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Avg SG:APP</p>
                        <p className="text-xl font-semibold">{stats.avgSgApp?.toFixed(2) || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Fairways Hit %</p>
                        <p className="text-xl font-semibold">{stats.fairwaysHit ? `${stats.fairwaysHit.toFixed(1)}%` : "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Avg Putts</p>
                        <p className="text-xl font-semibold">{stats.avgPutts?.toFixed(1) || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Earnings</p>
                        <p className="text-xl font-semibold">
                          ${stats.earnings ? (stats.earnings / 1000000).toFixed(2) + "M" : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Tournaments</p>
                      <p className="text-xl font-semibold">{stats.tournaments || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Wins / Top 10s</p>
                      <p className="text-xl font-semibold">
                        {stats.wins || 0} / {stats.top10s || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  No statistics available for 2024
                </div>
              )}

              {/* Advanced Metrics */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Advanced Metrics</h4>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    PREMIUM
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Unlock premium metrics:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Wind Performance Splits</li>
                    <li>AM vs PM Wave Analysis</li>
                    <li>Course Type Performance</li>
                    <li>Pressure Situation Stats</li>
                  </ul>
                  <Button variant="link" className="mt-3 p-0 h-auto text-blue-600">
                    Upgrade to Premium →
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="p-6">
            <div className="text-center text-gray-500 py-8">
              <h3 className="text-lg font-semibold mb-2">Player News</h3>
              <p>Latest news and updates coming soon</p>
            </div>
          </TabsContent>

          {/* Bio Tab */}
          <TabsContent value="bio" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Player Biography</h3>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Personal Information</h4>

                  {player.birthDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Birthdate</p>
                        <p className="font-medium">
                          {player.birthDate} ({calculateAge(player.birthDate)} years old)
                        </p>
                      </div>
                    </div>
                  )}

                  {player.birthPlace && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Birthplace</p>
                        <p className="font-medium">{player.birthPlace}</p>
                      </div>
                    </div>
                  )}

                  {player.college && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">College</p>
                        <p className="font-medium">{player.college}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 border-b pb-2">Professional Details</h4>

                  {player.turnedPro && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Turned Pro</p>
                        <p className="font-medium">{player.turnedPro}</p>
                      </div>
                    </div>
                  )}

                  {player.swing && (
                    <div className="flex items-start gap-3">
                      <Activity className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Swing</p>
                        <p className="font-medium">{player.swing}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6">
                    {player.height && (
                      <div className="flex items-start gap-3">
                        <Ruler className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Height</p>
                          <p className="font-medium">{player.height}</p>
                        </div>
                      </div>
                    )}

                    {player.weight && (
                      <div className="flex items-start gap-3">
                        <Weight className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 uppercase tracking-wide">Weight</p>
                          <p className="font-medium">{player.weight} lbs</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Career Highlights - Placeholder for future */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Career Highlights</h4>
                <p className="text-gray-600 text-sm">
                  Detailed career achievements, major wins, and professional highlights will be displayed here.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-0">
            <div className="space-y-0">
              {tournamentResults && tournamentResults.length > 0 ? (
                <>
                  {/* Year Selector Tabs */}
                  <Tabs defaultValue="all" value={String(selectedYear)} onValueChange={(value) => setSelectedYear(value === "all" ? "all" : Number(value))}>
                    <TabsList className="w-full h-auto p-0 bg-gray-50 rounded-none border-b">
                      <div className="flex w-full overflow-x-auto">
                        <TabsTrigger
                          value="all"
                          className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-4 py-3 text-sm font-medium"
                        >
                          All Years
                        </TabsTrigger>
                        {getAvailableYears().map((year) => (
                          <TabsTrigger
                            key={year}
                            value={String(year)}
                            className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white px-4 py-3 text-sm font-medium"
                          >
                            {year}
                          </TabsTrigger>
                        ))}
                      </div>
                    </TabsList>

                    <TabsContent value={String(selectedYear)} className="mt-0 p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">
                            {selectedYear === "all" ? "Career" : selectedYear} Tournament Results
                          </h3>
                          <span className="text-sm text-gray-500">
                            {filteredResults?.length || 0} tournaments
                          </span>
                        </div>

                        {filteredResults && filteredResults.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b text-left">
                                  <th className="pb-3 font-semibold">Date</th>
                                  <th className="pb-3 font-semibold">Tournament</th>
                                  <th className="pb-3 font-semibold text-center">Position</th>
                                  <th className="pb-3 font-semibold">Score</th>
                                  <th className="pb-3 font-semibold">Total</th>
                                  <th className="pb-3 font-semibold text-right">Earnings</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredResults.map((result, index) => (
                                  <tr
                                    key={result._id}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="py-3 text-gray-600">{result.date}</td>
                                    <td className="py-3 font-medium">{result.tournament}</td>
                                    <td className={`py-3 text-center ${getPositionStyle(result.position)}`}>
                                      {result.position}
                                    </td>
                                    <td className="py-3 text-gray-600">{result.score}</td>
                                    <td className="py-3 text-gray-600">{result.overall}</td>
                                    <td className="py-3 text-right font-medium">
                                      {formatEarnings(result.earnings || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2">
                                  <td colSpan={5} className="pt-3 text-right font-semibold">
                                    {selectedYear === "all" ? "Career" : selectedYear} Earnings:
                                  </td>
                                  <td className="pt-3 text-right font-bold text-green-600">
                                    {formatEarnings(
                                      filteredResults.reduce((sum, r) => sum + (r.earnings || 0), 0)
                                    )}
                                  </td>
                                </tr>
                                {selectedYear === "all" && (
                                  <tr>
                                    <td colSpan={6} className="pt-2 text-sm text-gray-500">
                                      <div className="flex justify-between">
                                        <span>Wins: {filteredResults.filter(r => r.position === "1").length}</span>
                                        <span>Top 10s: {filteredResults.filter(r => {
                                          const pos = r.position.replace("T", "");
                                          const num = parseInt(pos);
                                          return !isNaN(num) && num <= 10;
                                        }).length}</span>
                                        <span>Events: {filteredResults.length}</span>
                                        <span>Missed Cuts: {filteredResults.filter(r => r.position === "Missed Cut" || r.position === "MC").length}</span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>No tournament results for {selectedYear === "all" ? "this player" : selectedYear}.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : tournamentResults === undefined ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  Loading tournament results...
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tournament results available for this player.</p>
                  <p className="text-sm mt-2">Import tournament data via the CSV tool to see results here.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Scorecards Tab */}
          <TabsContent value="scorecards" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Scorecards</h3>
              <div className="text-gray-500">
                <p>Detailed scorecards from recent rounds will be available here.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}