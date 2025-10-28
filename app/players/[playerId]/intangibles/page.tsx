/**
 * Intangibles Page
 *
 * Displays intangible factors affecting player performance.
 * Uses placeholder data - backend integration coming in future phase.
 */

"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderIntangibles } from "@/lib/placeholder-data";
import { Brain, Cloud, TrendingUp, Award, Target } from "lucide-react";
import PlayerBio from "@/components/player/PlayerBio";
import { Id } from "@/convex/_generated/dataModel";

interface IntangiblesPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default function IntangiblesPage({ params }: IntangiblesPageProps) {
  const { playerId } = use(params);
  const intangibles = getPlaceholderIntangibles(playerId);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Weather":
        return Cloud;
      case "Course Type":
        return Target;
      case "Pressure":
        return Award;
      default:
        return Brain;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case "outstanding":
      case "excellent":
        return "default";
      case "strong":
      case "good":
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
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real intangible factors and performance
                patterns will be integrated in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Intangibles</CardTitle>
          <CardDescription>
            Non-statistical factors affecting tournament performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Understanding how external factors like weather, course characteristics, and pressure
            situations impact player performance can provide valuable insights for tournament
            predictions and betting decisions.
          </p>
        </CardContent>
      </Card>

      {/* Intangible Factors */}
      <div className="grid grid-cols-1 gap-4">
        {intangibles.map((factor, index) => {
          const Icon = getCategoryIcon(factor.category);

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 dark:bg-primary/20 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{factor.category}</CardTitle>
                      <CardDescription className="mt-1">
                        {factor.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getPerformanceColor(factor.performance)}>
                    {factor.performance}
                  </Badge>
                </div>
              </CardHeader>
              {factor.stats && (
                <CardContent>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Statistics</p>
                      <p className="text-sm font-medium">{factor.stats}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Future Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
          <CardDescription>Advanced analytics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              AI-generated insights will analyze patterns across weather, course types, pressure
              situations, and tournament sizes to provide predictive performance indicators.
            </p>
            <p className="text-xs text-muted-foreground">
              Feature coming in future update
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
