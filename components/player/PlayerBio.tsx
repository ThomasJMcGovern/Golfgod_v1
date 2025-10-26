"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { } from "lucide-react";

interface PlayerBioProps {
  playerId: Id<"players">;
}

export default function PlayerBio({ playerId }: PlayerBioProps) {
  const player = useQuery(api.players.getPlayer, { playerId });
  const isFollowing = useQuery(api.players.isFollowingPlayer, { playerId });
  const followPlayer = useMutation(api.players.followPlayer);
  const unfollowPlayer = useMutation(api.players.unfollowPlayer);

  if (!player) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-0">
          <div className="h-32 bg-secondary rounded-lg"></div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="h-8 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowPlayer({ playerId });
    } else {
      await followPlayer({ playerId });
    }
  };


  return (
    <Card className="overflow-hidden">
      {/* Header with flag background pattern */}
      <div className="relative h-32 bg-gradient-to-br from-blue-600 via-white to-red-600 opacity-10"></div>

      <CardContent className="relative -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Player Avatar */}
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-lg rounded-full overflow-hidden bg-secondary flex-shrink-0">
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.name}
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: '50% 30%' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl bg-green-100 text-green-800">
                {player.firstName[0]}{player.lastName[0]}
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="pt-0 sm:pt-6 text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">
              {player.firstName.toUpperCase()} {player.lastName.toUpperCase()}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-4">
              {getFlagEmoji(player.countryCode)}
              <span>{player.country}</span>
            </div>

            <Button
              onClick={handleFollowToggle}
              className={`w-full sm:w-auto ${isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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