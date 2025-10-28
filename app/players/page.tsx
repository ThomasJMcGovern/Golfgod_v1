"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";
import PlayerSelect from "@/components/player/PlayerSelect";
import PlayerBio from "@/components/player/PlayerBio";
import PlayerKnowledgeHub from "@/components/player/PlayerKnowledgeHub";
import PlayerRankings from "@/components/player/PlayerRankings";
import PlayerStats from "@/components/player/PlayerStats";
import CategoryExplorer from "@/components/player/CategoryExplorer";
import AppHeader from "@/components/layout/AppHeader";
import MainNavigation from "@/components/layout/MainNavigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function PlayersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<"players"> | null>(null);
  const [activeTab, setActiveTab] = useState("players");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Check for playerId in URL parameters on mount
  useEffect(() => {
    const playerId = searchParams.get("playerId");
    if (playerId) {
      setSelectedPlayerId(playerId as Id<"players">);
    }
  }, [searchParams]);

  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view player analytics.
            </p>
            <Button onClick={() => router.push("/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {/* Header */}
          <AppHeader title="Players" subtitle="Player profiles and analytics" />

          {/* Mobile Menu Button - Fixed position overlay */}
          <div className="lg:hidden fixed top-4 left-4 z-50">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Player Selection</SheetTitle>
                </SheetHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="players">Players</TabsTrigger>
                    <TabsTrigger value="rankings">Rankings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="players" className="mt-4">
                    <h3 className="font-semibold mb-3">Select Player</h3>
                    <PlayerSelect
                      onSelectPlayer={(id) => {
                        setSelectedPlayerId(id);
                        setSheetOpen(false);
                      }}
                      selectedPlayerId={selectedPlayerId}
                    />
                  </TabsContent>

                  <TabsContent value="rankings" className="mt-4">
                    <PlayerRankings
                      onSelectPlayer={(id) => {
                        setSelectedPlayerId(id);
                        setSheetOpen(false);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Navigation */}
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
                    <BreadcrumbPage>Players</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full overflow-x-hidden">
            <div className="flex gap-4 lg:gap-6">
              {/* Left Sidebar - Desktop Only */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="bg-card rounded-lg shadow p-4 sticky top-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="players">Players</TabsTrigger>
                      <TabsTrigger value="rankings">Rankings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="players" className="mt-4">
                      <h3 className="font-semibold mb-3">Select Player</h3>
                      <PlayerSelect
                        onSelectPlayer={setSelectedPlayerId}
                        selectedPlayerId={selectedPlayerId}
                      />
                    </TabsContent>

                    <TabsContent value="rankings" className="mt-4">
                      <PlayerRankings
                        onSelectPlayer={setSelectedPlayerId}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 w-full min-w-0">
                {/* Category Explorer - only visible when no player selected */}
                {!selectedPlayerId && <CategoryExplorer />}

                {selectedPlayerId ? (
                  <div className="space-y-6">
                    <PlayerBio playerId={selectedPlayerId} />
                    <PlayerKnowledgeHub playerId={selectedPlayerId} />
                    <PlayerStats playerId={selectedPlayerId} />
                  </div>
                ) : (
                  <div className="bg-card rounded-lg shadow p-6 sm:p-12 text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 sm:w-12 sm:h-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Select a Player</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Choose a player from the {" "}
                      <button
                        onClick={() => setSheetOpen(true)}
                        className="text-green-600 hover:text-green-700 underline lg:hidden"
                      >
                        menu
                      </button>
                      <span className="hidden lg:inline">list</span>
                      {" "}to view their profile, statistics, and tournament history
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Authenticated>
    </>
  );
}