/**
 * Personal Profile Page
 *
 * Displays player's personal profile, physical stats, and background.
 * Integrated with Convex database for real player data.
 */

"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User, Calendar, MapPin, GraduationCap, Ruler, Weight, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { playerId } = use(params);
  const player = useQuery(api.players.getPlayer, { playerId: playerId as Id<"players"> });

  // Loading state
  if (player === undefined) {
    return <ProfileSkeleton />;
  }

  // Error state - player not found
  if (player === null) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Player Not Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The player profile you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/players">Back to Players</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-muted p-2">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Live Data</h3>
              <p className="text-sm text-muted-foreground">
                Personal and physical stats are live data. Background narratives are placeholder content pending future enrichment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic profile and biographical details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Birth Date</p>
                <p className="text-sm text-muted-foreground">
                  {player.birthDate || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Birth Place</p>
                <p className="text-sm text-muted-foreground">
                  {player.birthPlace || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">College</p>
                <p className="text-sm text-muted-foreground">
                  {player.college || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Turned Pro</p>
                <p className="text-sm text-muted-foreground">
                  {player.turnedPro || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Statistics</CardTitle>
          <CardDescription>Height, weight, and playing characteristics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Ruler className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Height</p>
                <p className="text-sm text-muted-foreground">
                  {player.height || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Weight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Weight</p>
                <p className="text-sm text-muted-foreground">
                  {player.weight || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Swing</p>
                {player.swing ? (
                  <Badge variant="secondary">{player.swing}-handed</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
          <CardDescription>Early life and golf journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Early Life</h4>
            <p className="text-sm text-muted-foreground">
              Growing up in a family passionate about sports, {player.name} developed an early love for golf.
              Their natural athleticism and dedication to the game were evident from a young age,
              setting the foundation for a remarkable professional career.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Golf Beginnings</h4>
            <p className="text-sm text-muted-foreground">
              {player.name} first picked up a golf club at age 8 and quickly showed exceptional talent.
              Through years of practice and competition at the junior and amateur levels, they honed their skills
              and developed the mental toughness required to compete at the highest level.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Achievements</h4>
            <p className="text-sm text-muted-foreground">
              Throughout their career, {player.name} has achieved numerous victories and accolades on the PGA Tour.
              Known for their consistency and competitive spirit, they continue to be a formidable presence
              in professional golf, inspiring the next generation of players.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice Skeleton */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Physical Statistics Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Background Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
