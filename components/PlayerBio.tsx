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
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <div className="flex items-start">
          <div className="flex items-start gap-6">
            {/* Player Avatar */}
            <div className="relative h-32 w-32 border-4 border-white shadow-lg rounded-full overflow-hidden bg-gray-100">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: '50% 30%' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-green-100 text-green-800">
                  {player.firstName[0]}{player.lastName[0]}
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="pt-6">
              <h2 className="text-3xl font-bold mb-1">
                {player.firstName.toUpperCase()} {player.lastName.toUpperCase()}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                {getFlagEmoji(player.countryCode)}
                <span>{player.country}</span>
              </div>

              <Button
                onClick={handleFollowToggle}
                className={isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
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