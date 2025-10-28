"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Winner {
  _id: Id<"courseWinners">;
  year: number;
  tournament: string;
  playerId: Id<"players">;
  playerName: string;
  score: string;
  toPar?: number;
  earnings?: number;
}

interface WinnersHistoryProps {
  winners: Winner[] | undefined;
  courseName: string;
}

export default function WinnersHistory({
  winners,
  courseName,
}: WinnersHistoryProps) {
  const router = useRouter();

  const formatEarnings = (amount?: number) => {
    if (!amount) return "-";
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handlePlayerClick = (playerId: Id<"players">) => {
    router.push(`/players?playerId=${playerId}`);
  };

  if (winners === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Winners Since 2015</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (winners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Winners Since 2015</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No winner data available for this course since 2015.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winners Since 2015</CardTitle>
        <p className="text-sm text-muted-foreground">
          Historical winners at {courseName}
        </p>
      </CardHeader>
      <CardContent>
        {/* Mobile: Horizontal scroll */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>YEAR</TableHead>
                <TableHead>TOURNAMENT</TableHead>
                <TableHead>WINNER</TableHead>
                <TableHead className="text-right">SCORE</TableHead>
                <TableHead className="text-right">EARNINGS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((winner) => (
                <TableRow key={winner._id}>
                  <TableCell className="font-medium">{winner.year}</TableCell>
                  <TableCell className="text-sm">{winner.tournament}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handlePlayerClick(winner.playerId)}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {winner.playerName}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">{winner.score}</span>
                      {winner.toPar !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {winner.toPar > 0 ? `+${winner.toPar}` : winner.toPar}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatEarnings(winner.earnings)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
