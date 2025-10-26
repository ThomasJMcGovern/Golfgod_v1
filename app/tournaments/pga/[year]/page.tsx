"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Country code to flag emoji mapping
const countryFlags: { [key: string]: string } = {
  USA: "🇺🇸", US: "🇺🇸", "United States": "🇺🇸",
  JPN: "🇯🇵", Japan: "🇯🇵",
  CAN: "🇨🇦", Canada: "🇨🇦",
  AUS: "🇦🇺", Australia: "🇦🇺",
  ENG: "🏴󐁧󐁢󐁥󐁮󐁧󐁿", England: "🏴󐁧󐁢󐁥󐁮󐁧󐁿",
  SCO: "🏴󐁧󐁢󐁳󐁣󐁴󐁿", Scotland: "🏴󐁧󐁢󐁳󐁣󐁴󐁿",
  IRL: "🇮🇪", Ireland: "🇮🇪",
  ESP: "🇪🇸", Spain: "🇪🇸",
  FRA: "🇫🇷", France: "🇫🇷",
  GER: "🇩🇪", Germany: "🇩🇪",
  ITA: "🇮🇹", Italy: "🇮🇹",
  SWE: "🇸🇪", Sweden: "🇸🇪",
  NOR: "🇳🇴", Norway: "🇳🇴",
  DEN: "🇩🇰", Denmark: "🇩🇰",
  BEL: "🇧🇪", Belgium: "🇧🇪",
  NED: "🇳🇱", Netherlands: "🇳🇱",
  AUT: "🇦🇹", Austria: "🇦🇹",
  RSA: "🇿🇦", "South Africa": "🇿🇦",
  ARG: "🇦🇷", Argentina: "🇦🇷",
  MEX: "🇲🇽", Mexico: "🇲🇽",
  COL: "🇨🇴", Colombia: "🇨🇴",
  CHL: "🇨🇱", Chile: "🇨🇱",
  BRA: "🇧🇷", Brazil: "🇧🇷",
  KOR: "🇰🇷", "South Korea": "🇰🇷",
  CHN: "🇨🇳", China: "🇨🇳",
  TPE: "🇹🇼", "Chinese Taipei": "🇹🇼", Taiwan: "🇹🇼",
  THA: "🇹🇭", Thailand: "🇹🇭",
  IND: "🇮🇳", India: "🇮🇳",
  NZL: "🇳🇿", "New Zealand": "🇳🇿",
  FIJ: "🇫🇯", Fiji: "🇫🇯",
  ZIM: "🇿🇼", Zimbabwe: "🇿🇼",
  VEN: "🇻🇪", Venezuela: "🇻🇪",
  PRI: "🇵🇷", "Puerto Rico": "🇵🇷",
  CRI: "🇨🇷", "Costa Rica": "🇨🇷",
};

export default function YearTournamentsPage() {
  const router = useRouter();
  const params = useParams();
  const year = parseInt(params.year as string);
  const [activeTour, setActiveTour] = useState("pga");

  // Generate available years directly in frontend (no database query needed)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2015;
    const endYear = Math.max(currentYear + 1, 2026);

    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => endYear - i
    );
  };

  const availableYears = getAvailableYears();
  const tournaments = useQuery(api.tournaments.getTournamentsByYear, { year });
  const allPlayers = useQuery(api.players.getAllPlayerNamesAndIds, {});

  const formatPrizeMoney = (amount?: number) => {
    if (!amount) return "-";
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      if (millions % 1 === 0) {
        return `$${millions.toFixed(0)}M`;
      }
      return `$${millions.toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (startDate?: string, endDate?: string) => {
    if (!startDate) return "Dates TBD";
    if (!endDate || startDate === endDate) return startDate;

    const startMonth = startDate.substring(0, 3);
    const endMonth = endDate.substring(0, 3);
    const startDay = startDate.substring(4);
    const endDay = endDate.substring(4);

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  };

  // Parse date string like "Jan 2" to a comparable date
  const parseDate = (dateStr?: string, year?: number) => {
    if (!dateStr || !year) return null;

    const monthMap: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    const parts = dateStr.split(" ");
    if (parts.length !== 2) return null;

    const month = monthMap[parts[0]];
    const day = parseInt(parts[1]);

    if (month === undefined || isNaN(day)) return null;

    return new Date(year, month, day);
  };

  // Create a mapping of player names to their IDs for linking
  const playerNameToId = useMemo(() => {
    if (!allPlayers) return new Map<string, Id<"players">>();

    const nameMap = new Map<string, Id<"players">>();
    allPlayers.forEach((player) => {
      nameMap.set(player.name.toLowerCase(), player._id);

      const nameParts = player.name.split(" ");
      if (nameParts.length >= 2) {
        const lastName = nameParts[nameParts.length - 1];
        const firstName = nameParts.slice(0, -1).join(" ");
        const reverseName = `${firstName} ${lastName}`.toLowerCase();
        if (!nameMap.has(reverseName)) {
          nameMap.set(reverseName, player._id);
        }
      }
    });

    return nameMap;
  }, [allPlayers]);

  // Function to find player ID by name
  const findPlayerId = (name: string | undefined): Id<"players"> | null => {
    if (!name) return null;
    return playerNameToId.get(name.toLowerCase()) || null;
  };

  // Function to get country flag for a player
  const getCountryFlag = (playerName?: string): string => {
    // This would ideally come from player data
    // For now, using some known mappings
    const playerCountries: { [key: string]: string } = {
      "Hideki Matsuyama": "🇯🇵",
      "Nick Taylor": "🇨🇦",
      "Sepp Straka": "🇦🇹",
      "Nico Echavarria": "🇨🇴",
      "Rafael Campos": "🇵🇷",
      "Scottie Scheffler": "🇺🇸",
      "Matt McCarty": "🇺🇸",
      "Austin Eckroat": "🇺🇸",
      "Maverick McNealy": "🇺🇸",
      "Kevin Yu": "🇹🇼",
      "Harris English": "🇺🇸",
      "Rory McIlroy": "🇮🇪",
      "Thomas Detry": "🇧🇪",
      "Ludvig Aberg": "🇸🇪",
      "Brian Campbell": "🇺🇸",
      "Joe Highsmith": "🇺🇸",
      "Russell Henley": "🇺🇸",
      "Karl Vilips": "🇦🇺",
    };

    if (playerName && playerCountries[playerName]) {
      return playerCountries[playerName];
    }
    return "";
  };

  // Categorize tournaments based on dates and status
  const categorizedTournaments = useMemo(() => {
    if (!tournaments) return { current: [], scheduled: [], completed: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current: typeof tournaments = [];
    const scheduled: typeof tournaments = [];
    const completed: typeof tournaments = [];

    tournaments.forEach((tournament) => {
      if (tournament.status === "completed") {
        completed.push(tournament);
      } else {
        const startDate = parseDate(tournament.start_date, tournament.year);
        const endDate = parseDate(tournament.end_date, tournament.year) || startDate;

        if (!startDate || !endDate) {
          scheduled.push(tournament);
        } else if (today > endDate) {
          completed.push(tournament);
        } else if (today >= startDate && today <= endDate) {
          current.push(tournament);
        } else {
          scheduled.push(tournament);
        }
      }
    });

    return { current, scheduled, completed };
  }, [tournaments]);

  const handlePlayerClick = (playerId: Id<"players">) => {
    router.push(`/players?playerId=${playerId}`);
  };

  const PlayerLink = ({ name }: { name?: string }) => {
    if (!name) return null;

    const playerId = findPlayerId(name);
    const flag = getCountryFlag(name);

    const nameDisplay = (
      <>
        {flag && <span className="mr-1">{flag}</span>}
        {name}
      </>
    );

    if (playerId) {
      return (
        <button
          onClick={() => handlePlayerClick(playerId)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {nameDisplay}
        </button>
      );
    }
    return <span>{nameDisplay}</span>;
  };

  // Handle year navigation
  const handleYearChange = (newYear: string) => {
    router.push(`/tournaments/pga/${newYear}`);
  };

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view tournament information.
            </p>
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {/* Header */}
          <AppHeader title={`PGA TOUR ${year}`} subtitle="Tournament schedule and results" />

          {/* Main Navigation */}
          <MainNavigation />

          {/* Breadcrumbs - Desktop Only */}
          <div className="hidden sm:block border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/tournaments">Tournaments</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{year}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Tour Navigation */}
          <div className="border-b bg-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 py-2 min-w-max">
                  <button
                    className={`flex-shrink-0 min-w-[100px] px-4 py-2 font-medium ${
                      activeTour === "pga"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTour("pga")}
                  >
                    PGA TOUR
                  </button>
                  <button className="flex-shrink-0 min-w-[100px] px-4 py-2 text-muted-foreground/50 cursor-not-allowed">
                    LPGA
                  </button>
                  <button className="flex-shrink-0 min-w-[100px] px-4 py-2 text-muted-foreground/50 cursor-not-allowed">
                    PGA TOUR Champions
                  </button>
                  <button className="flex-shrink-0 min-w-[100px] px-4 py-2 text-muted-foreground/50 cursor-not-allowed">
                    LIV
                  </button>
                  <button className="flex-shrink-0 min-w-[100px] px-4 py-2 text-muted-foreground/50 cursor-not-allowed">
                    DP World
                  </button>
                  <button className="flex-shrink-0 min-w-[100px] px-4 py-2 text-muted-foreground/50 cursor-not-allowed">
                    Korn Ferry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Year Selector */}
          <div className="bg-card border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <Select value={String(year)} onValueChange={handleYearChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears?.map((availYear) => (
                    <SelectItem key={availYear} value={String(availYear)}>
                      {availYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full overflow-x-hidden">
            {tournaments ? (
              <div className="space-y-8">
                {/* Current Tournaments */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Current Tournaments</h2>
                  {categorizedTournaments.current.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">DATES</TableHead>
                            <TableHead>TOURNAMENT</TableHead>
                            <TableHead>PREVIOUS WINNER</TableHead>
                            <TableHead className="text-right">PURSE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categorizedTournaments.current.map((tournament) => (
                            <TableRow key={tournament._id}>
                              <TableCell className="align-top">
                                {formatDate(tournament.start_date, tournament.end_date)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {tournament.name}
                                  </div>
                                  {tournament.dates_raw && tournament.dates_raw.includes("-") && (
                                    <div className="text-sm text-muted-foreground">
                                      {tournament.dates_raw.split("-")[1].trim()}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <PlayerLink name={tournament.previous_winner_name || tournament.winner_name} />
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrizeMoney(tournament.prize_money)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No tournaments are currently in progress</p>
                  )}
                </div>

                {/* Scheduled Tournaments */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Scheduled Tournaments</h2>
                  {categorizedTournaments.scheduled.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">DATES</TableHead>
                            <TableHead>TOURNAMENT</TableHead>
                            <TableHead>PREVIOUS WINNER</TableHead>
                            <TableHead className="text-right">PURSE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categorizedTournaments.scheduled.map((tournament) => (
                            <TableRow key={tournament._id}>
                              <TableCell className="align-top">
                                {formatDate(tournament.start_date, tournament.end_date)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {tournament.name}
                                  </div>
                                  {tournament.dates_raw && tournament.dates_raw.includes("-") && (
                                    <div className="text-sm text-muted-foreground">
                                      {tournament.dates_raw.split("-")[1].trim()}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <PlayerLink name={tournament.previous_winner_name || tournament.winner_name} />
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrizeMoney(tournament.prize_money)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No upcoming tournaments scheduled</p>
                  )}
                </div>

                {/* Completed Tournaments */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Completed Tournaments</h2>
                  {categorizedTournaments.completed.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">DATES</TableHead>
                            <TableHead>TOURNAMENT</TableHead>
                            <TableHead>WINNER</TableHead>
                            <TableHead className="text-right">SCORE/PRIZE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categorizedTournaments.completed.map((tournament) => (
                            <TableRow key={tournament._id}>
                              <TableCell className="align-top">
                                {formatDate(tournament.start_date, tournament.end_date)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-blue-600 hover:text-blue-800">
                                    {tournament.name}
                                  </div>
                                  {tournament.dates_raw && tournament.dates_raw.includes("-") && (
                                    <div className="text-sm text-muted-foreground">
                                      {tournament.dates_raw.split("-")[1].trim()}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <PlayerLink name={tournament.winner_name} />
                              </TableCell>
                              <TableCell className="text-right">
                                {tournament.winning_score && (
                                  <div className="text-sm">{tournament.winning_score}</div>
                                )}
                                {tournament.prize_money && (
                                  <div className="text-sm text-foreground/80">
                                    {formatPrizeMoney(tournament.prize_money)}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No completed tournaments for this year</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}
          </div>
        </div>
      </Authenticated>
    </>
  );
}