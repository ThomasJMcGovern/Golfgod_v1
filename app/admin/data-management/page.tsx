"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/layout/AppHeader";
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Users,
  Trophy
} from "lucide-react";

interface ClearResult {
  message?: string;
  deleted?: number | {
    players?: number;
    playerStats?: number;
    tournamentResults?: number;
    userFollows?: number;
  };
  players?: { cleared: number };
  playerStats?: { cleared: number };
  tournamentResults?: { cleared: number };
  userFollows?: { cleared: number };
  total?: number;
  hasMoreData?: boolean;
  error?: string;
}

export default function DataManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClearResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const clearAllData = useMutation(api.dataManagement.clearDatabase);
  const clearPlayersData = useMutation(api.dataManagement.clearPlayersWithCascade);
  const clearTournamentResults = useMutation(api.dataManagement.clearTournamentResults);

  const handleClearAll = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const clearResult = await clearAllData({ tables: ["all"] });
      setResult(clearResult as ClearResult);
      setShowConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during reset');
      setShowConfirm(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlayers = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await clearPlayersData({ preserveAuth: true });
      setResult(res);
      setShowConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear players data");
      setShowConfirm(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTournaments = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await clearTournamentResults();
      setResult(res);
      setShowConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear tournament results");
      setShowConfirm(null);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = (res: ClearResult) => {
    if (res.total) return res.total;
    let total = 0;
    if (res.players?.cleared) total += res.players.cleared;
    if (res.playerStats?.cleared) total += res.playerStats.cleared;
    if (res.tournamentResults?.cleared) total += res.tournamentResults.cleared;
    if (res.userFollows?.cleared) total += res.userFollows.cleared;
    if (typeof res.deleted === 'object' && res.deleted) {
      if (res.deleted.players) total += res.deleted.players;
      if (res.deleted.playerStats) total += res.deleted.playerStats;
      if (res.deleted.tournamentResults) total += res.deleted.tournamentResults;
      if (res.deleted.userFollows) total += res.deleted.userFollows;
    }
    return total;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader title="Data Management" subtitle="Admin tools" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Result Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{result.message || 'Operation completed successfully.'}</p>
              <div className="text-sm space-y-1">
                {result.players && <p>Players cleared: {result.players.cleared}</p>}
                {result.playerStats && <p>Player stats cleared: {result.playerStats.cleared}</p>}
                {result.tournamentResults && <p>Tournament results cleared: {result.tournamentResults.cleared}</p>}
                {result.userFollows && <p>User follows cleared: {result.userFollows.cleared}</p>}
                {typeof result.deleted === 'object' && result.deleted && (
                  <>
                    {result.deleted.players && <p>Players deleted: {result.deleted.players}</p>}
                    {result.deleted.playerStats && <p>Player stats deleted: {result.deleted.playerStats}</p>}
                    {result.deleted.tournamentResults && <p>Tournament results deleted: {result.deleted.tournamentResults}</p>}
                    {result.deleted.userFollows && <p>User follows deleted: {result.deleted.userFollows}</p>}
                  </>
                )}
                {typeof result.deleted === 'number' && <p>Records deleted: {result.deleted}</p>}
                <p className="font-semibold mt-2">Total records affected: {calculateTotal(result)}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Management Tabs */}
        <Tabs defaultValue="complete" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="complete">Complete Reset</TabsTrigger>
            <TabsTrigger value="selective">Selective Clear</TabsTrigger>
            <TabsTrigger value="import">Import Tools</TabsTrigger>
          </TabsList>

          {/* Complete Reset Tab */}
          <TabsContent value="complete" className="space-y-4">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Complete Database Reset
                </CardTitle>
                <CardDescription>
                  This will permanently delete ALL data from the database and reset it to a clean state.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showConfirm !== 'complete' ? (
                  <Button
                    onClick={() => setShowConfirm('complete')}
                    variant="destructive"
                    disabled={isLoading}
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Complete Reset
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Are you absolutely sure?</AlertTitle>
                      <AlertDescription>
                        This action cannot be undone. This will permanently delete ALL data including:
                        <ul className="list-disc list-inside mt-2">
                          <li>All player records</li>
                          <li>All tournament results</li>
                          <li>All player statistics</li>
                          <li>All user follows</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClearAll}
                        variant="destructive"
                        disabled={isLoading}
                      >
                        {isLoading ? "Resetting..." : "Yes, Reset Everything"}
                      </Button>
                      <Button
                        onClick={() => setShowConfirm(null)}
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
          </TabsContent>

          {/* Selective Clear Tab */}
          <TabsContent value="selective" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clear Specific Data</CardTitle>
                <CardDescription>
                  Clear specific types of data from the database while preserving others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tournament Results */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Tournament Results</h3>
                      <p className="text-sm text-muted-foreground">Delete all tournament results only</p>
                    </div>
                  </div>
                  {showConfirm !== 'tournaments' ? (
                    <Button
                      onClick={() => setShowConfirm('tournaments')}
                      variant="outline"
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClearTournaments}
                        variant="destructive"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading ? "Clearing..." : "Confirm"}
                      </Button>
                      <Button
                        onClick={() => setShowConfirm(null)}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Players & Related Data */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Players & Related Data</h3>
                      <p className="text-sm text-muted-foreground">Delete all players and their associated data</p>
                    </div>
                  </div>
                  {showConfirm !== 'players' ? (
                    <Button
                      onClick={() => setShowConfirm('players')}
                      variant="outline"
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClearPlayers}
                        variant="destructive"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading ? "Clearing..." : "Confirm"}
                      </Button>
                      <Button
                        onClick={() => setShowConfirm(null)}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tools Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Tools</CardTitle>
                <CardDescription>
                  Import data into the database from various sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">JSON Import Pipeline</h3>
                      <p className="text-sm text-muted-foreground">Import player and tournament data from JSON files</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/admin/import-json-pipeline")}
                    variant="default"
                    className="w-full"
                  >
                    Open Import Pipeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}