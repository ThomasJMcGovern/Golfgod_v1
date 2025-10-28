"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CourseInfoProps {
  course: {
    name: string;
    location: string;
    par: number;
    yardage?: number;
    established?: number;
    architect?: string;
    designer?: string;
    type?: string;
  };
}

export default function CourseInfo({ course }: CourseInfoProps) {
  // Use architect field first, fallback to designer
  const designerName = course.architect || course.designer || "Unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Name */}
        <div>
          <h3 className="text-lg font-semibold mb-1">{course.name}</h3>
          <p className="text-sm text-muted-foreground">{course.location}</p>
        </div>

        <Separator />

        {/* Inception Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Established</p>
            <p className="text-lg font-semibold">
              {course.established || "Unknown"}
            </p>
          </div>

          {/* Architect */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Architect</p>
            <p className="text-lg font-semibold">{designerName}</p>
          </div>
        </div>

        <Separator />

        {/* Total Length */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Par</p>
            <p className="text-lg font-semibold">{course.par}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Length</p>
            <p className="text-lg font-semibold">
              {course.yardage ? `${course.yardage.toLocaleString()} yards` : "Unknown"}
            </p>
          </div>
        </div>

        {/* Course Type (if available) */}
        {course.type && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Course Type</p>
              <p className="text-lg font-semibold">{course.type}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
