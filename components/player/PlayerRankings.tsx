"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PlayerRankingsProps {
  onSelectPlayer: (playerId: Id<"players">) => void;
}

export default function PlayerRankings({ onSelectPlayer }: PlayerRankingsProps) {
  const players = useQuery(api.players.getWorldRankings);

  if (!players) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-10 bg-secondary animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">Men's Top 200</h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-[40px_1fr] gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
          <div>RK</div>
          <div>NAME</div>
        </div>
        {players.map((player, index) => (
          <button
            key={player._id}
            onClick={() => onSelectPlayer(player._id)}
            className="w-full grid grid-cols-[40px_1fr] gap-2 py-2 px-1 hover:bg-blue-50 rounded transition-colors text-left"
          >
            <div className="text-sm font-medium text-foreground/80">
              {player.worldRanking || index + 1}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {getFlagEmoji(player.countryCode)}
              </span>
              <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                {player.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  // Handle special cases for UK subdivisions
  if (countryCode === "GB-ENG" || countryCode === "GB-NIR" || countryCode === "GB-SCT") {
    return "🇬🇧";
  }

  // Convert country code to flag emoji
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}