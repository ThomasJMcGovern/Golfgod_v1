"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Wrench, CheckCircle } from "lucide-react";

export default function FixAllRankingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const fixAllRankings = useMutation(api.fixAllRankings.fixAllRankingsFromCSV);
  const cleanupDuplicates = useMutation(api.fixAllRankings.cleanupDuplicatePlayers);

  const handleFixRankings = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // First, clean up duplicates
      const cleanup = await cleanupDuplicates();
      setCleanupResult(cleanup);

      // Then fetch and process the CSV
      const response = await fetch("/api/rankings-csv");
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: async (results) => {
          const rankings = results.data.map((row: any) => ({
            rank: parseInt(row.rank) || 0,
            name: row.name?.trim() || "",
            country: row.country?.trim() || "",
          })).filter((r: any) => r.rank > 0 && r.name);

          // Process in batches
          const BATCH_SIZE = 50;
          let totalUpdated = 0;
          let totalCreated = 0;
          let allErrors: string[] = [];

          for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
            const batch = rankings.slice(i, i + BATCH_SIZE);
            const batchResult = await fixAllRankings({ rankings: batch });

            totalUpdated += batchResult.updated;
            totalCreated += batchResult.created;
            allErrors = [...allErrors, ...batchResult.errors];
          }

          setResult({
            updated: totalUpdated,
            created: totalCreated,
            errors: allErrors,
            total: rankings.length
          });

          setIsLoading(false);
        },
        error: (error) => {
          setResult({ error: error.message });
          setIsLoading(false);
        }
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed" });
      setIsLoading(false);
    }
  };

  const handleManualFix = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // First, clean up duplicates
      const cleanup = await cleanupDuplicates();
      setCleanupResult(cleanup);

      // Manually fix key players
      const keyPlayers = [
        { rank: 1, name: "Scottie Scheffler", country: "UNI" },
        { rank: 2, name: "Rory McIlroy", country: "NOR" },
        { rank: 3, name: "Russell Henley", country: "UNI" },
        { rank: 4, name: "Xander Schauffele", country: "UNI" },
        { rank: 5, name: "Justin Thomas", country: "UNI" },
      ];

      const batchResult = await fixAllRankings({ rankings: keyPlayers });

      setResult({
        updated: batchResult.updated,
        created: batchResult.created,
        errors: batchResult.errors,
        total: keyPlayers.length,
        message: "Fixed top 5 players"
      });

      setIsLoading(false);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Failed" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold">Fix All Rankings</h1>
                <span className="text-sm text-muted-foreground">Clean up and fix player rankings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Fix Rankings Actions
            </CardTitle>
            <CardDescription>
              Choose how to fix the rankings issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleManualFix}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              Quick Fix: Set Top 5 Rankings (Scottie #1, Rory #2, etc.)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or use local CSV</span>
              </div>
            </div>

            <Button
              onClick={async () => {
                setIsLoading(true);
                setResult(null);

                try {
                  // First, clean up duplicates
                  const cleanup = await cleanupDuplicates();
                  setCleanupResult(cleanup);

                  // Read the CSV file content directly
                  const csvContent = await fetch("file:///Users/tjmcgovern/golfdata/golf_rankings_20250924_205512.csv")
                    .then(r => r.text())
                    .catch(() => null);

                  if (!csvContent) {
                    // If direct file access fails, use the manual data
                    const manualCSV = `rank,name,country
1,Scottie Scheffler,UNI
2,Rory McIlroy,NOR
3,Russell Henley,UNI
4,Xander Schauffele,UNI
5,Justin Thomas,UNI`;

                    Papa.parse(manualCSV, {
                      header: true,
                      complete: async (results) => {
                        const rankings = results.data.map((row: any) => ({
                          rank: parseInt(row.rank) || 0,
                          name: row.name?.trim() || "",
                          country: row.country?.trim() || "",
                        })).filter((r: any) => r.rank > 0 && r.name);

                        const batchResult = await fixAllRankings({ rankings });

                        setResult({
                          updated: batchResult.updated,
                          created: batchResult.created,
                          errors: batchResult.errors,
                          total: rankings.length,
                          message: "Fixed using manual top 5 data"
                        });

                        setIsLoading(false);
                      }
                    });
                  } else {
                    Papa.parse(csvContent, {
                      header: true,
                      complete: async (results) => {
                        const rankings = results.data.map((row: any) => ({
                          rank: parseInt(row.rank) || 0,
                          name: row.name?.trim() || "",
                          country: row.country?.trim() || "",
                        })).filter((r: any) => r.rank > 0 && r.name);

                        // Process in batches
                        const BATCH_SIZE = 50;
                        let totalUpdated = 0;
                        let totalCreated = 0;
                        let allErrors: string[] = [];

                        for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
                          const batch = rankings.slice(i, i + BATCH_SIZE);
                          const batchResult = await fixAllRankings({ rankings: batch });

                          totalUpdated += batchResult.updated;
                          totalCreated += batchResult.created;
                          allErrors = [...allErrors, ...batchResult.errors];
                        }

                        setResult({
                          updated: totalUpdated,
                          created: totalCreated,
                          errors: allErrors,
                          total: rankings.length,
                          message: "Fixed using CSV file"
                        });

                        setIsLoading(false);
                      }
                    });
                  }
                } catch (error) {
                  setResult({ error: error instanceof Error ? error.message : "Failed" });
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Fix All Rankings from CSV (Recommended)"}
            </Button>
          </CardContent>
        </Card>

        {cleanupResult && (
          <Alert>
            <AlertTitle>Cleanup Results</AlertTitle>
            <AlertDescription>
              <p>Duplicates removed: {cleanupResult.duplicatesRemoved}</p>
              {cleanupResult.duplicateNames.length > 0 && (
                <p>Players with duplicates: {cleanupResult.duplicateNames.slice(0, 5).join(", ")}</p>
              )}
              <p>Total unique players: {cleanupResult.uniquePlayers}</p>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert variant={result.error ? "destructive" : "default"}>
            {result.error ? (
              <>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  <p>{result.message || "Rankings fixed successfully"}</p>
                  <p>Updated: {result.updated} players</p>
                  <p>Created: {result.created} players</p>
                  <p>Total processed: {result.total}</p>
                  {result.errors.length > 0 && (
                    <p className="mt-2 text-sm">Errors: {result.errors.slice(0, 3).join(", ")}</p>
                  )}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm">
              Click "Quick Fix" to immediately set Scottie Scheffler as #1, or use the recommended option to fix all rankings from your CSV file.
              This will also clean up any duplicate player entries.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}