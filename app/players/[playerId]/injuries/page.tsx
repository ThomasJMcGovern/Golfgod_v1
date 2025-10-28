/**
 * Injury History Page
 *
 * Displays player's injury history, recovery timelines, and current status.
 * Uses placeholder data - backend integration coming in future phase.
 */

"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderInjuries } from "@/lib/placeholder-data";
import { Activity, AlertCircle, Calendar, Clock } from "lucide-react";
import PlayerBio from "@/components/player/PlayerBio";
import { Id } from "@/convex/_generated/dataModel";

interface InjuriesPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default function InjuriesPage({ params }: InjuriesPageProps) {
  const { playerId } = use(params);
  const injuries = getPlaceholderInjuries(playerId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "destructive";
      case "Recovering":
        return "secondary";
      case "Recovered":
        return "default";
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
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real injury history and medical information
                will be integrated in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injury History */}
      <Card>
        <CardHeader>
          <CardTitle>Injury History</CardTitle>
          <CardDescription>
            Past injuries, recovery timelines, and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {injuries.length > 0 ? (
            <div className="space-y-4">
              {injuries.map((injury, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-semibold">{injury.type}</h4>
                      <p className="text-sm text-muted-foreground">{injury.affectedArea}</p>
                    </div>
                    <Badge variant={getStatusColor(injury.status)}>
                      {injury.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(injury.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {injury.recoveryTimeline && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Recovery Timeline</p>
                          <p className="text-sm font-medium">{injury.recoveryTimeline}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {injury.impact && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Impact</p>
                          <p className="text-sm">{injury.impact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No injury history available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This player has a clean bill of health
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
