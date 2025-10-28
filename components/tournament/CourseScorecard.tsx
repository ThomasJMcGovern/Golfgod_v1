"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseScorecardProps {
  course: {
    name: string;
    par: number;
    yardage?: number;
    scorecardPar?: number[];
    scorecardYardage?: number[];
  };
}

export default function CourseScorecard({ course }: CourseScorecardProps) {
  const { scorecardPar, scorecardYardage } = course;

  // If no scorecard data available
  if (!scorecardPar || !scorecardYardage || scorecardPar.length !== 18 || scorecardYardage.length !== 18) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed scorecard information is not yet available for this course.
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium">Total Par:</span> {course.par}
            </p>
            {course.yardage && (
              <p className="text-sm">
                <span className="font-medium">Total Yardage:</span> {course.yardage.toLocaleString()} yards
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate front 9 and back 9 totals
  const front9Par = scorecardPar.slice(0, 9).reduce((sum, p) => sum + p, 0);
  const back9Par = scorecardPar.slice(9, 18).reduce((sum, p) => sum + p, 0);
  const front9Yardage = scorecardYardage.slice(0, 9).reduce((sum, y) => sum + y, 0);
  const back9Yardage = scorecardYardage.slice(9, 18).reduce((sum, y) => sum + y, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: Horizontal scroll */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Hole</TableHead>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((hole) => (
                  <TableHead key={hole} className="text-center">
                    {hole}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold">OUT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Par row */}
              <TableRow>
                <TableCell className="font-medium">Par</TableCell>
                {scorecardPar.slice(0, 9).map((par, idx) => (
                  <TableCell key={idx} className="text-center">
                    {par}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">{front9Par}</TableCell>
              </TableRow>
              {/* Yardage row */}
              <TableRow>
                <TableCell className="font-medium">Yards</TableCell>
                {scorecardYardage.slice(0, 9).map((yardage, idx) => (
                  <TableCell key={idx} className="text-center text-sm">
                    {yardage}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-sm">
                  {front9Yardage}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Back 9 */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mt-4">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Hole</TableHead>
                {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((hole) => (
                  <TableHead key={hole} className="text-center">
                    {hole}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold">IN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Par row */}
              <TableRow>
                <TableCell className="font-medium">Par</TableCell>
                {scorecardPar.slice(9, 18).map((par, idx) => (
                  <TableCell key={idx} className="text-center">
                    {par}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold">{back9Par}</TableCell>
              </TableRow>
              {/* Yardage row */}
              <TableRow>
                <TableCell className="font-medium">Yards</TableCell>
                {scorecardYardage.slice(9, 18).map((yardage, idx) => (
                  <TableCell key={idx} className="text-center text-sm">
                    {yardage}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-sm">
                  {back9Yardage}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Par</p>
              <p className="text-2xl font-bold">{course.par}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Yardage</p>
              <p className="text-2xl font-bold">
                {(front9Yardage + back9Yardage).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
