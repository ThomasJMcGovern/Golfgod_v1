/**
 * Family Golf History Page
 *
 * Displays family members with college or professional golf background.
 * Uses placeholder data - backend integration coming in future phase.
 */

"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderFamilyHistory } from "@/lib/placeholder-data";
import { Trophy, Users } from "lucide-react";
import PlayerBio from "@/components/player/PlayerBio";
import { Id } from "@/convex/_generated/dataModel";

interface FamilyHistoryPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default function FamilyHistoryPage({ params }: FamilyHistoryPageProps) {
  const { playerId } = use(params);
  const familyHistory = getPlaceholderFamilyHistory(playerId);

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "Professional":
        return "default";
      case "College":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Player Header */}
      <PlayerBio playerId={playerId as Id<"players">} />

      {/* Data Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real family golf history will be integrated
                in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Golf Members */}
      <Card>
        <CardHeader>
          <CardTitle>Family Golf History</CardTitle>
          <CardDescription>
            Family members with competitive golf background
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familyHistory.members.length > 0 ? (
            <div className="space-y-4">
              {familyHistory.members.map((member, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.relationship}</p>
                    </div>
                    <Badge variant={getBadgeVariant(member.golfLevel)}>
                      {member.golfLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.achievements}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No family golf history available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
