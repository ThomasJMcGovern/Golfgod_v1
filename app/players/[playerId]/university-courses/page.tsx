/**
 * University Courses Page
 *
 * Displays tour courses within 180 miles of player's university.
 * Uses placeholder data - backend integration coming in future phase.
 */


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderUniversityCourses } from "@/lib/placeholder-data";
import { GraduationCap, MapPin, Navigation, TrendingUp } from "lucide-react";

interface UniversityCoursesPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default async function UniversityCoursesPage({ params }: UniversityCoursesPageProps) {
  const { playerId } = await params;
  const courses = getPlaceholderUniversityCourses(playerId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real university course proximity data will be
                integrated in a future update with geographic calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle>University Courses</CardTitle>
          <CardDescription>
            PGA Tour courses within 180 miles of university
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold">{course.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{course.location}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {course.distance} mi
                  </Badge>
                </div>

                {course.tournaments && course.tournaments.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tournaments:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.tournaments.map((tournament, tIndex) => (
                        <Badge key={tIndex} variant="outline" className="text-xs">
                          {tournament}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {course.performance && (
                  <div className="flex items-center gap-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Events</p>
                        <p className="text-sm font-medium">{course.performance.events}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                        <p className="text-sm font-medium">{course.performance.avgScore}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic View</CardTitle>
          <CardDescription>Interactive map coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Interactive map visualization coming in future update
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
