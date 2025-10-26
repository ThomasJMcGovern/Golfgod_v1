/**
 * Professional History Page
 *
 * Displays player's professional career timeline and achievements.
 * Uses placeholder data - backend integration coming in future phase.
 */


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderProfessional } from "@/lib/placeholder-data";
import { Briefcase, Award, Calendar } from "lucide-react";

interface ProfessionalPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default async function ProfessionalPage({ params }: ProfessionalPageProps) {
  const { playerId } = await params;
  const professional = getPlaceholderProfessional(playerId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PGA Tour":
        return "default";
      case "Korn Ferry":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real professional history will be integrated
                in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Professional tour membership</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(professional.status)} className="text-base">
              {professional.status}
            </Badge>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Tour Card Since</p>
              <p className="text-sm text-muted-foreground">{professional.tourCard}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Career Milestones</CardTitle>
          <CardDescription>Major achievements and highlights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {professional.careerMilestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{milestone.achievement}</p>
                    <Badge variant="outline">{milestone.year}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
