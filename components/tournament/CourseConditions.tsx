"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CourseConditionsProps {
  course: {
    name: string;
    grassGreens?: string;
    grassFairways?: string;
    avgGreenSize?: number;
    bunkerSandType?: string;
    grassType?: string; // Fallback field
  };
}

export default function CourseConditions({ course }: CourseConditionsProps) {
  const greensGrass = course.grassGreens || course.grassType || "Unknown";
  const fairwaysGrass = course.grassFairways || course.grassType || "Unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grass Types */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Grass Types
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Greens</p>
              <Badge variant="secondary" className="text-sm">
                {greensGrass}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fairways</p>
              <Badge variant="secondary" className="text-sm">
                {fairwaysGrass}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Green Size */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Average Green Size
          </h3>
          <p className="text-2xl font-bold">
            {course.avgGreenSize
              ? `${course.avgGreenSize.toLocaleString()} sq. ft.`
              : "Not available"}
          </p>
          {course.avgGreenSize && (
            <p className="text-xs text-muted-foreground mt-1">
              {course.avgGreenSize < 5000
                ? "Small greens - precision required"
                : course.avgGreenSize < 6500
                ? "Average size greens"
                : "Large greens - more forgiving"}
            </p>
          )}
        </div>

        <Separator />

        {/* Bunker Sand Type */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Bunker Sand Type
          </h3>
          <Badge variant="outline" className="text-sm">
            {course.bunkerSandType || "Not available"}
          </Badge>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Course conditions can significantly impact player performance and scoring.
            Grass types affect ball roll and spin, while green size influences
            approach shot strategy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
