"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Trash2, AlertTriangle, CheckCircle } from "lucide-react";

export default function ClearDataPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    message?: string;
    deleted?: number | {
      players?: number;
      playerStats?: number;
      tournamentResults?: number;
      userFollows?: number;
    };
    hasMoreData?: boolean;
    error?: string;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const clearAllData = useMutation(api.clearData.clearAllData);
  const clearPlayersData = useMutation(api.clearData.clearPlayersData);
  const clearTournamentResults = useMutation(api.clearData.clearTournamentResults);

  const handleClearAll = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await clearAllData();
      setResult(res);

      // If there's more data, don't hide the confirm dialog so user can continue
      if (!res.hasMoreData) {
        setShowConfirm(false);
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to clear data" });
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlayers = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await clearPlayersData();
      setResult(res);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to clear players data" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTournaments = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await clearTournamentResults();
      setResult(res);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed to clear tournament results" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="mr-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Clear Database</h1>
                <span className="text-sm text-muted-foreground">Remove data from Convex database</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Clear All Data */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Clear All Data
            </CardTitle>
            <CardDescription>
              This will permanently delete ALL data from the database including players, tournament results, and user follows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showConfirm ? (
              <Button
                onClick={() => setShowConfirm(true)}
                variant="destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Are you absolutely sure?</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. All data will be permanently deleted.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClearAll}
                    variant="destructive"
                    disabled={isLoading}
                  >
                    {isLoading ? "Clearing..." : "Yes, Delete Everything"}
                  </Button>
                  <Button
                    onClick={() => setShowConfirm(false)}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clear Specific Data */}
        <Card>
          <CardHeader>
            <CardTitle>Clear Specific Data</CardTitle>
            <CardDescription>
              Clear specific types of data from the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Tournament Results</h3>
                <p className="text-sm text-muted-foreground">Delete all tournament results only</p>
              </div>
              <Button
                onClick={handleClearTournaments}
                variant="outline"
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Players & Related Data</h3>
                <p className="text-sm text-muted-foreground">Delete all players and their associated data</p>
              </div>
              <Button
                onClick={handleClearPlayers}
                variant="outline"
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert variant={result.error ? "destructive" : "default"}>
            {result.error ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  <p>{result.message}</p>
                  {result.deleted && (
                    <div className="mt-2 text-sm">
                      {typeof result.deleted === 'object' ? (
                        <ul>
                          {result.deleted.players > 0 && <li>Players deleted: {result.deleted.players}</li>}
                          {result.deleted.playerStats > 0 && <li>Player stats deleted: {result.deleted.playerStats}</li>}
                          {result.deleted.tournamentResults > 0 && <li>Tournament results deleted: {result.deleted.tournamentResults}</li>}
                          {result.deleted.userFollows > 0 && <li>User follows deleted: {result.deleted.userFollows}</li>}
                        </ul>
                      ) : (
                        <p>Records deleted: {result.deleted}</p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </main>
    </div>
  );
}