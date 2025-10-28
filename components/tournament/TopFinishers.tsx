"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";

interface Finisher {
  _id: Id<"tournamentResults">;
  playerId: Id<"players">;
  playerName: string;
  position: string;
  numericPosition: number;
  score: string;
  overall: string;
  toPar?: number;
}

interface TopFinishersProps {
  finishers: Finisher[] | undefined;
  courseName: string;
  initialYear: number;
  onYearChange: (year: number) => void;
  onTopNChange: (topN: number) => void;
}

// Generate years 2015-2026
const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2015;
  const endYear = Math.max(currentYear + 1, 2026);
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
};

export default function TopFinishers({
  finishers,
  courseName,
  initialYear,
  onYearChange,
  onTopNChange,
}: TopFinishersProps) {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedTopN, setSelectedTopN] = useState(10);

  const years = getAvailableYears();

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    onYearChange(yearNum);
  };

  const handleTopNChange = (topN: string) => {
    const topNNum = parseInt(topN);
    setSelectedTopN(topNNum);
    onTopNChange(topNNum);
  };

  const handlePlayerClick = (playerId: Id<"players">) => {
    router.push(`/players?playerId=${playerId}`);
  };

  if (finishers === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Finishers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Finishers</CardTitle>
        <p className="text-sm text-muted-foreground">
          View top finishers at {courseName} by year
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Year</label>
            <Select value={String(selectedYear)} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Top</label>
            <Select value={String(selectedTopN)} onValueChange={handleTopNChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="15">Top 15</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {finishers.length === 0 ? (
          <p className="text-muted-foreground">
            No tournament data available for {selectedYear} at this course.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">POS</TableHead>
                  <TableHead>PLAYER</TableHead>
                  <TableHead className="text-right">SCORE</TableHead>
                  <TableHead className="text-right">TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finishers.map((finisher) => (
                  <TableRow key={finisher._id}>
                    <TableCell className="font-medium">
                      {finisher.position}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handlePlayerClick(finisher.playerId)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {finisher.playerName}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      {finisher.score}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {finisher.overall}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
