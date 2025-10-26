"use client";

import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Target,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function InsideTheRopesHub() {
  const router = useRouter();

  const features = [
    {
      id: "player-course-stats",
      title: "Player Stats Per Course",
      description: "Course-specific player performance and career stats",
      icon: Target,
      color: "bg-blue-500",
      route: "/inside-the-ropes/player-course-stats",
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader title="Inside the Ropes" subtitle="Advanced Analytics & Insights" />

      {/* Main Navigation */}
      <MainNavigation />

      {/* Breadcrumbs - Desktop Only */}
      <div className="hidden sm:block border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inside the Ropes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
            Select Your Analytics Focus
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Choose from our advanced analytics features to gain deeper insights
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="relative cursor-pointer hover:shadow-lg transition-shadow active:scale-98"
                onClick={() => {
                  if (feature.route) {
                    router.push(feature.route);
                  }
                }}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 md:mt-12 px-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Inside the Ropes provides exclusive course-specific analytics and advanced metrics to help you make data-driven decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
