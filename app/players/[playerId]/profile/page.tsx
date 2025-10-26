/**
 * Personal Profile Page
 *
 * Displays player's personal profile, physical stats, and background.
 * Uses placeholder data - backend integration coming in future phase.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPlaceholderProfile } from "@/lib/placeholder-data";
import { User, Calendar, MapPin, GraduationCap, Ruler, Weight, Activity } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { playerId } = await params;
  const profile = getPlaceholderProfile(playerId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real player profile information will be
                integrated in a future update.
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
                <p className="text-sm text-muted-foreground">{profile.personalInfo.birthDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Birth Place</p>
                <p className="text-sm text-muted-foreground">{profile.personalInfo.birthPlace}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">College</p>
                <p className="text-sm text-muted-foreground">{profile.personalInfo.college}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Turned Pro</p>
                <p className="text-sm text-muted-foreground">{profile.personalInfo.turnedPro}</p>
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
                <p className="text-sm text-muted-foreground">{profile.personalInfo.height}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Weight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Weight</p>
                <p className="text-sm text-muted-foreground">{profile.personalInfo.weight}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Swing</p>
                <Badge variant="secondary">{profile.personalInfo.swing}-handed</Badge>
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
            <p className="text-sm text-muted-foreground">{profile.background.earlyLife}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Golf Beginnings</h4>
            <p className="text-sm text-muted-foreground">{profile.background.golfStart}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Achievements</h4>
            <p className="text-sm text-muted-foreground">{profile.background.achievements}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
