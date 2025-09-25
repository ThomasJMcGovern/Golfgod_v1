"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, GraduationCap, Calendar, Activity, Ruler, Weight } from "lucide-react";

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

  // Calculate age from birthdate
  const calculateAge = (birthDate: string) => {
    const [month, day, year] = birthDate.split("/").map(Number);
    const birth = new Date(year, month - 1, day);
    const ageDiff = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with flag background pattern */}
      <div className="relative h-32 bg-gradient-to-br from-blue-600 via-white to-red-600 opacity-10"></div>

      <CardContent className="relative -mt-16">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Player Avatar */}
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={player.photoUrl} />
              <AvatarFallback className="text-2xl bg-green-100 text-green-800">
                {player.firstName[0]}{player.lastName[0]}
              </AvatarFallback>
            </Avatar>

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

          {/* Bio Details */}
          <div className="bg-gray-50 rounded-lg p-6 ml-auto">
            <h3 className="font-semibold mb-4 text-gray-700">Player Information</h3>
            <div className="space-y-3 text-sm">
              {player.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">BIRTHDATE</p>
                    <p className="font-medium">
                      {player.birthDate} ({calculateAge(player.birthDate)})
                    </p>
                  </div>
                </div>
              )}

              {player.birthPlace && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">BIRTHPLACE</p>
                    <p className="font-medium">{player.birthPlace}</p>
                  </div>
                </div>
              )}

              {player.college && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">COLLEGE</p>
                    <p className="font-medium">{player.college || "N/A"}</p>
                  </div>
                </div>
              )}

              {player.swing && (
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">SWING</p>
                    <p className="font-medium">{player.swing}</p>
                  </div>
                </div>
              )}

              {player.turnedPro && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">TURNED PRO</p>
                    <p className="font-medium">{player.turnedPro}</p>
                  </div>
                </div>
              )}

              {player.height && (
                <div className="flex items-center gap-3">
                  <Ruler className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">HEIGHT</p>
                    <p className="font-medium">{player.height}</p>
                  </div>
                </div>
              )}

              {player.weight && (
                <div className="flex items-center gap-3">
                  <Weight className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">WEIGHT</p>
                    <p className="font-medium">{player.weight}</p>
                  </div>
                </div>
              )}
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