"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import MajorsHistory from "@/components/tournament/MajorsHistory";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CourseMajorsPage() {
  const router = useRouter();
  const params = useParams();
  const year = parseInt(params.year as string);
  const courseId = params.courseId as Id<"courses">;

  const course = useQuery(api.courses.getCourseDetails, { courseId });
  const majors = useQuery(api.courses.getCourseMajors, { courseId });

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view major championships.
            </p>
            <Button onClick={() => router.push("/signin")}>Sign In</Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-background">
          <AppHeader
            title="Major Championships"
            subtitle={course?.name || "Loading..."}
          />
          <MainNavigation />

          {/* Breadcrumbs */}
          <div className="hidden sm:block border-t">
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
                    <BreadcrumbPage>Majors</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {majors !== undefined ? (
              <MajorsHistory majors={majors} courseName={course?.name || ""} />
            ) : (
              <Skeleton className="h-96 w-full" />
            )}
          </div>
        </div>
      </Authenticated>
    </>
  );
}
