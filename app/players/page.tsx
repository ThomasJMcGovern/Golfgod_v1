"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Authenticated, Unauthenticated } from "convex/react";
import PlayerSelect from "@/components/PlayerSelect";
import PlayerBio from "@/components/PlayerBio";
import PlayerRankings from "@/components/PlayerRankings";
import PlayerStats from "@/components/PlayerStats";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayersPage() {
  const router = useRouter();
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<"players"> | null>(null);
  const [activeTab, setActiveTab] = useState("players");

  // Seed data on first load (development only)
  const seedPlayersMutation = useMutation(api.seed.seedPlayers);
  const seedStatsMutation = useMutation(api.seed.seedPlayerStats);

  useEffect(() => {
    // Auto-seed data in development
    const seedData = async () => {
      try {
        await seedPlayersMutation();
        await seedStatsMutation();
      } catch (error) {
        // Ignore errors if data already seeded
        console.log("Data might already be seeded");
      }
    };
    seedData();
  }, []);

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
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/")}
                    className="mr-3"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-semibold">Player Analytics</h1>
                    <p className="text-sm text-gray-500">
                      Select a player to view detailed statistics
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white"
                  onClick={() => router.push("/")}
                >
                  PGA TOUR
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-6">
              {/* Left Sidebar */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow p-4">
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
              <div className="flex-1">
                {selectedPlayerId ? (
                  <div className="space-y-6">
                    <PlayerBio playerId={selectedPlayerId} />
                    <PlayerStats playerId={selectedPlayerId} />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-12 h-12 text-green-600"
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
                    <h3 className="text-xl font-semibold mb-2">Select a Player</h3>
                    <p className="text-gray-500">
                      Choose a player from the list to view their profile, statistics, and tournament history
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