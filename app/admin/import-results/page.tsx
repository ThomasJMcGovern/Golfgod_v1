"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ImportResultsPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const clearResults = useMutation(api.tournamentResults.clearAllResults);
  const importResultsJSON = useMutation(api.tournamentResults.importResultsJSON);
  const importBatchJSON = useMutation(api.tournamentResults.importBatchResultsJSON);
  const resultsStatus = useQuery(api.tournamentResults.checkResultsStatus);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Clear all results
  const handleClearResults = async () => {
    try {
      addLog("Clearing all tournament results...");
      const result = await clearResults();
      addLog(`✅ Cleared ${result.deleted} tournament results`);
    } catch (error) {
      addLog(`❌ Error clearing results: ${error}`);
    }
  };

  // Import single player results
  const handleImportSingle = async () => {
    if (!jsonInput.trim()) {
      addLog("❌ Please enter JSON data");
      return;
    }

    setIsProcessing(true);
    try {
      const data = JSON.parse(jsonInput);

      // Validate structure
      if (!data.playerName || !data.years) {
        addLog("❌ Invalid JSON structure. Expected { playerName: string, years: [...] }");
        setIsProcessing(false);
        return;
      }

      addLog(`Importing results for ${data.playerName}...`);
      const result = await importResultsJSON(data);

      addLog(`✅ Imported ${result.imported} tournament results for ${result.playerName}`);
      if (result.errors.length > 0) {
        addLog(`⚠️ ${result.errors.length} errors occurred`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Import batch of players
  const handleImportBatch = async () => {
    if (!jsonInput.trim()) {
      addLog("❌ Please enter JSON data");
      return;
    }

    setIsProcessing(true);
    try {
      const data = JSON.parse(jsonInput);

      // Support both array format and object with players array
      const playersData = Array.isArray(data) ? data : data.players;

      if (!playersData || !Array.isArray(playersData)) {
        addLog("❌ Invalid JSON structure. Expected array of player data or { players: [...] }");
        setIsProcessing(false);
        return;
      }

      addLog(`Starting batch import of ${playersData.length} players...`);

      // Process in smaller batches to avoid timeouts
      const BATCH_SIZE = 5;
      let totalImported = 0;

      for (let i = 0; i < playersData.length; i += BATCH_SIZE) {
        const batch = playersData.slice(i, Math.min(i + BATCH_SIZE, playersData.length));
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(playersData.length / BATCH_SIZE);

        addLog(`Processing batch ${batchNum}/${totalBatches}...`);

        const result = await importBatchJSON({ players: batch });
        totalImported += result.totalImported;

        addLog(`✅ Batch ${batchNum}: ${result.totalImported} results from ${result.playersProcessed} players`);

        if (result.errors.length > 0) {
          result.errors.forEach(err => addLog(`⚠️ ${err}`));
        }

        setProgress((i + batch.length) / playersData.length * 100);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      addLog(`✅ Import complete! Total: ${totalImported} tournament results`);
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Example JSON templates
  const singlePlayerExample = {
    playerName: "Adam Scott",
    years: [
      {
        year: 2024,
        tournaments: [
          {
            date: "Jul 18 - 21",
            tournament: "The Open Championship",
            position: "T10",
            score: "-6",
            overall: "282",
            earnings: 293750
          },
          {
            date: "Jun 13 - 16",
            tournament: "U.S. Open",
            position: "T17",
            score: "+2",
            overall: "282",
            earnings: 221587
          }
        ]
      }
    ]
  };

  const batchExample = [
    {
      playerName: "Scottie Scheffler",
      years: [
        {
          year: 2024,
          tournaments: [
            {
              date: "Apr 11 - 14",
              tournament: "Masters Tournament",
              position: "1",
              score: "-11",
              overall: "277",
              earnings: 3600000
            }
          ]
        }
      ]
    },
    {
      playerName: "Rory McIlroy",
      years: [
        {
          year: 2024,
          tournaments: [
            {
              date: "Jul 18 - 21",
              tournament: "The Open Championship",
              position: "Missed Cut",
              score: "+11",
              overall: "153",
              earnings: 0
            }
          ]
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Import Tournament Results</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Import Controls */}
        <div className="space-y-6">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Player</TabsTrigger>
              <TabsTrigger value="batch">Batch Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Single Player Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Import tournament results for a single player
                  </div>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste JSON data here..."
                    className="h-64 font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImportSingle}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Import Single Player
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setJsonInput(JSON.stringify(singlePlayerExample, null, 2))}
                    >
                      Load Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Import tournament results for multiple players
                  </div>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste JSON array here..."
                    className="h-64 font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImportBatch}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Import Batch
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setJsonInput(JSON.stringify(batchExample, null, 2))}
                    >
                      Load Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Progress Bar */}
          {progress > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-center text-gray-600">
                  {Math.round(progress)}% Complete
                </p>
              </CardContent>
            </Card>
          )}

          {/* Database Status */}
          {resultsStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Total Results: <strong>{resultsStatus.totalResults}</strong></p>
                  <p>Unique Players: <strong>{resultsStatus.uniquePlayers}</strong></p>

                  {resultsStatus.yearCounts.length > 0 && (
                    <div>
                      <p className="font-semibold mt-3">Results by Year:</p>
                      <div className="ml-2">
                        {resultsStatus.yearCounts.slice(0, 5).map(([year, count]) => (
                          <p key={year}>{year}: {count} results</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {resultsStatus.sampleScottie.length > 0 && (
                    <Alert className="mt-4">
                      <AlertTitle>Sample: Scottie Scheffler</AlertTitle>
                      <AlertDescription>
                        {resultsStatus.sampleScottie.length} tournaments imported
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Database Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleClearResults}
                variant="destructive"
                className="w-full"
                disabled={isProcessing}
              >
                Clear All Tournament Results
              </Button>
              <Button
                onClick={() => window.location.href = "/players"}
                variant="outline"
                className="w-full"
              >
                Go to Players Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Import Log */}
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