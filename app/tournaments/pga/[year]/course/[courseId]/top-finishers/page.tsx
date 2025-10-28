"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import TopFinishers from "@/components/tournament/TopFinishers";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function TopFinishersPage() {
  const router = useRouter();
  const params = useParams();
  const year = parseInt(params.year as string);
  const courseId = params.courseId as Id<"courses">;

  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedTopN, setSelectedTopN] = useState(10);

  const course = useQuery(api.courses.getCourseDetails, { courseId });
  const finishers = useQuery(api.courses.getTopFinishers, {
    courseId,
    year: selectedYear,
    topN: selectedTopN,
  });

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view top finishers.
            </p>
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-background">
          <AppHeader
            title="Top Finishers"
            subtitle={course?.name || "Loading..."}
          />
          <MainNavigation />

          {/* Breadcrumbs */}
          <div className="border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/tournaments">Tournaments</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/tournaments/pga/${year}`}>
                      {year}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Top Finishers</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <TopFinishers
              finishers={finishers}
              courseName={course?.name || ""}
              initialYear={year}
              onYearChange={setSelectedYear}
              onTopNChange={setSelectedTopN}
            />
          </div>
        </div>
      </Authenticated>
    </>
  );
}
