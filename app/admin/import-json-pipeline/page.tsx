"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImportJSONPipelinePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [batchSize, setBatchSize] = useState(5);

  // Mutations and queries
  const clearResults = useMutation(api.dataManagement.clearTournamentResults);
  const importPlayer = useMutation(api.importPipeline.importTournamentDataFromJSON);
  const batchImport = useMutation(api.importPipeline.batchImportFromJSONFiles);
  const validateData = useQuery(api.importPipeline.validateImportedData);
  const importProgress = useQuery(api.importPipeline.getImportProgress);
  const dbStatus = useQuery(api.dataManagement.validateDatabase);

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setLogs(prev => [...prev, `${timestamp} ${prefix} ${message}`]);
  };

  // Clear all tournament results
  const handleClearResults = async () => {
    try {
      addLog("Clearing existing tournament results...");
      const result = await clearResults();
      addLog(`Cleared ${result.deleted} tournament results`, "success");
    } catch (error) {
      addLog(`Error clearing results: ${error}`, "error");
    }
  };

  // Import from JSON files directory
  const handleImportFromDirectory = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      addLog("Starting import from JSON files directory...");

      // Fetch and parse JSON files
      const response = await fetch("/api/import-json-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directory: "/Users/tjmcgovern/golfgod_x_convex/top100_2015_2025_20250924_201118",
          batchSize
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch JSON files: ${response.statusText}`);
      }

      const data = await response.json();
      const players = data.players;

      addLog(`Found ${players.length} player files to import`);

      // Process in batches
      const totalPlayers = players.length;
      let processed = 0;

      for (let i = 0; i < players.length; i += batchSize) {
        const batch = players.slice(i, Math.min(i + batchSize, players.length));
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(players.length / batchSize);

        addLog(`Processing batch ${batchNum}/${totalBatches}...`);

        for (const player of batch) {
          setCurrentPlayer(player.playerName);

          try {
            const result = await importPlayer({
              playerId: player.player_id,
              playerName: player.playerName,
              years: player.years,
            });

            addLog(
              `${player.playerName}: Imported ${result.imported}, skipped ${result.skipped} duplicates`,
              "success"
            );

            if (result.errors.length > 0) {
              addLog(`${player.playerName} had ${result.errors.length} errors`, "error");
            }

            processed++;
            setProgress((processed / totalPlayers) * 100);
          } catch (error) {
            addLog(`Failed to import ${player.playerName}: ${error}`, "error");
          }
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addLog(`✅ Import complete! Processed ${processed} players`, "success");
    } catch (error) {
      addLog(`Import failed: ${error instanceof Error ? error.message : String(error)}`, "error");
    } finally {
      setIsProcessing(false);
      setCurrentPlayer("");
      setProgress(0);
    }
  };

  // Import single player test
  const handleImportSingleTest = async () => {
    try {
      addLog("Testing import with Scottie Scheffler...");

      // Example data structure
      const testData = {
        playerId: "9478",
        playerName: "Scottie Scheffler",
        years: [
          {
            year: 2024,
            tournaments: [
              {
                date: "4/11 - 4/14",
                tournament_name: "Masters Tournament",
                course: "Augusta National",
                position: "1",
                scores: ["68", "72", "71", "66"],
                total_score: 277,
                to_par: -11,
                earnings: 3600000,
              }
            ]
          }
        ]
      };

      const result = await importPlayer(testData);
      addLog(`Test import successful: ${result.imported} imported`, "success");
    } catch (error) {
      addLog(`Test import failed: ${error}`, "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Import Tournament Data Pipeline</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-6">
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="validate">Validate</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>JSON Directory Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTitle>Directory Location</AlertTitle>
                    <AlertDescription>
                      /Users/tjmcgovern/golfgod_x_convex/top100_2015_2025_20250924_201118
                      <br />
                      Contains 101 player JSON files with tournament data from 2015-2025
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      min={1}
                      max={20}
                    />
                    <p className="text-sm text-gray-500">
                      Process players in batches to avoid timeouts
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleClearResults}
                      variant="destructive"
                      disabled={isProcessing}
                    >
                      Clear Results
                    </Button>
                    <Button
                      onClick={handleImportFromDirectory}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? "Importing..." : "Import All Players"}
                    </Button>
                  </div>

                  <Button
                    onClick={handleImportSingleTest}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full"
                  >
                    Test Import (Scottie Scheffler)
                  </Button>
                </CardContent>
              </Card>

              {/* Progress */}
              {isProcessing && (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Processing: {currentPlayer}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </CardContent>
                </Card>
              )}

              {/* Import Status */}
              {importProgress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Import Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>Total Players: <strong>{importProgress.totalPlayers}</strong></p>
                    <p>Players with Results: <strong>{importProgress.playersWithResults}</strong></p>
                    <p>Players with ESPN IDs: <strong>{importProgress.playersWithEspnId}</strong></p>
                    <p>Total Results: <strong>{importProgress.totalResults}</strong></p>

                    {importProgress.yearCounts.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold">Results by Year:</p>
                        <div className="ml-2 space-y-1">
                          {importProgress.yearCounts.slice(0, 5).map(([year, count]) => (
                            <p key={year}>{year}: {count} results</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="validate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {validateData ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <p>Players Total: <strong>{validateData.playersTotal}</strong></p>
                        <p>Players with Results: <strong>{validateData.playersWithResults}</strong></p>
                        <p>Total Results: <strong>{validateData.totalResults}</strong></p>
                        <p>Results with Scores: <strong>{validateData.resultsWithScores}</strong></p>
                        <p>Results with Earnings: <strong>{validateData.resultsWithEarnings}</strong></p>
                        <p>Unique Tournaments: <strong>{validateData.uniqueTournaments}</strong></p>
                        <p>Years Covered: <strong>{validateData.yearsCovered.join(", ")}</strong></p>
                      </div>

                      {validateData.issues.length > 0 ? (
                        <Alert variant="destructive">
                          <AlertTitle>Issues Found</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside">
                              {validateData.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-green-500">
                          <AlertTitle>✅ Validation Passed</AlertTitle>
                          <AlertDescription>
                            All data appears to be correctly imported.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <p>Loading validation...</p>
                  )}
                </CardContent>
              </Card>

              {/* Database Status */}
              {dbStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle>Database Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>Total Players: {dbStatus.players.total}</p>
                      <p>With Rankings: {dbStatus.players.withRankings}</p>
                      <p>Tournament Results: {dbStatus.tournamentResults.total}</p>

                      {dbStatus.issues.length > 0 && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertDescription>
                            {dbStatus.issues.slice(0, 3).map((issue, i) => (
                              <p key={i}>{issue}</p>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Logs */}
        <Card className="h-[800px]">
          <CardHeader>
            <CardTitle>Import Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[720px] overflow-y-auto bg-gray-50 rounded p-4 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Start an import to see activity.</p>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes("✅") ? "text-green-600" :
                      log.includes("❌") ? "text-red-600" :
                      log.includes("⚠️") ? "text-yellow-600" : ""
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}