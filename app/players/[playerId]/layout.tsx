/**
 * Player Detail Pages Layout
 *
 * Shared layout for all player knowledge category pages.
 * Includes breadcrumbs, player context, and consistent header.
 */

"use client";

import { use } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/AppHeader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronLeft } from "lucide-react";

interface PlayerLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    playerId: string;
  }>;
}

const categoryNames: Record<string, string> = {
  profile: "Personal Profile",
  family: "Family",
  "family-history": "Family Golf History",
  professional: "Professional History",
  "hometown-courses": "Hometown Courses",
  "university-courses": "University Courses",
  injuries: "Injury History",
  intangibles: "Intangibles",
};

export default function PlayerLayout({ children, params }: PlayerLayoutProps) {
  const { playerId } = use(params);
  const router = useRouter();
  const pathname = usePathname();

  // Extract category from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const category = pathSegments[pathSegments.length - 1];
  const categoryName = categoryNames[category] || category;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button overlay */}
      <div className="relative">
        <AppHeader title={categoryName} subtitle="Player knowledge hub" />
        {/* Back button overlay */}
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/players?playerId=${playerId}`)}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

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
                  <BreadcrumbLink href="/players">Players</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/players?playerId=${playerId}`}>
                    Player Profile
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{categoryName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
