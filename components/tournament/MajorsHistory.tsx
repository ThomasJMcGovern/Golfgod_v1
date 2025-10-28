"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface Major {
  _id: Id<"courseMajors">;
  majorName: string;
  yearsHosted: number[];
  totalHosted: number;
}

interface MajorsHistoryProps {
  majors: Major[] | undefined;
  courseName: string;
}

export default function MajorsHistory({
  majors,
  courseName,
}: MajorsHistoryProps) {
  if (majors === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Major Championships</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (majors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Major Championships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Major Championships</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {courseName} has not hosted any major championships. Most PGA Tour
              courses do not host majors, as only a select few venues are chosen
              for these prestigious events.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Major Championships
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Major tournaments hosted at {courseName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {majors.map((major, index) => (
          <div key={major._id}>
            {index > 0 && <Separator className="my-6" />}

            <div>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{major.majorName}</h3>
                <Badge variant="secondary">
                  {major.totalHosted} {major.totalHosted === 1 ? "time" : "times"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Years Hosted:
                </p>
                <div className="flex flex-wrap gap-2">
                  {major.yearsHosted.sort((a, b) => b - a).map((year) => (
                    <Badge key={year} variant="outline">
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Info note */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Major championships are the four most prestigious tournaments in
            professional golf: The Masters, PGA Championship, U.S. Open, and The
            Open Championship. Only select courses host these events.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
