"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function UltimateFixPage() {
  const [stage, setStage] = useState<"clear" | "load" | "import" | "done">("clear");
  const [rankings, setRankings] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const clearEverything = useMutation(api.ultimateFix.clearEverything);
  const importBatch = useMutation(api.ultimateFix.importBatch);
  const dbStatus = useQuery(api.ultimateFix.checkDatabase);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Step 1: Clear all data
  const handleClear = async () => {
    addLog("Starting to clear database...");
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const result = await clearEverything();
      totalDeleted += result.deleted;
      hasMore = result.hasMore;
      addLog(`Deleted ${result.deleted} items...`);
    }

    addLog(`✅ Database cleared! Total deleted: ${totalDeleted}`);
    setStage("load");
  };

  // Step 2: Load CSV
  const handleLoadCSV = async () => {
    try {
      // Fetch the CSV file
      const response = await fetch("/golf_rankings.csv");
      const text = await response.text();

      Papa.parse(text, {
        header: true,
        complete: (results) => {
          const data = results.data
            .map((row: any) => ({
              rank: parseInt(row.rank) || 0,
              name: row.name?.trim() || "",
              country: row.country?.trim() || "",
            }))
            .filter((r: any) => r.rank > 0 && r.name)
            .sort((a, b) => a.rank - b.rank); // Sort by rank

          setRankings(data);
          addLog(`✅ Loaded ${data.length} rankings from CSV`);

          // Verify Scottie is #1
          const scottie = data.find((p: any) => p.rank === 1);
          if (scottie) {
            addLog(`✅ Confirmed: ${scottie.name} is ranked #1`);
          } else {
            addLog(`⚠️ WARNING: No player with rank #1 found!`);
          }

          setStage("import");
        },
        error: (error) => {
          addLog(`❌ Error parsing CSV: ${error.message}`);
        }
      });
    } catch (error) {
      // If fetch fails, use manual input
      addLog("Could not fetch CSV, please paste data manually");

      // Use the data directly from your file
      const manualData = `rank,name,country
1,Scottie Scheffler,UNI
2,Rory McIlroy,NOR
3,Russell Henley,UNI
4,Xander Schauffele,UNI
5,Justin Thomas,UNI
6,J.J. Spaun,UNI
7,Tommy Fleetwood,ENG
8,Collin Morikawa,UNI
9,Robert MacIntyre,SCO
10,Harris English,UNI`;

      Papa.parse(manualData, {
        header: true,
        complete: (results) => {
          const data = results.data
            .map((row: any) => ({
              rank: parseInt(row.rank) || 0,
              name: row.name?.trim() || "",
              country: row.country?.trim() || "",
            }))
            .filter((r: any) => r.rank > 0 && r.name)
            .sort((a, b) => a.rank - b.rank);

          setRankings(data);
          addLog(`✅ Loaded ${data.length} rankings from manual data`);
          setStage("import");
        }
      });
    }
  };

  // Step 3: Import in small batches
  const handleImport = async () => {
    const BATCH_SIZE = 25; // Small batches to avoid Convex limits
    const totalBatches = Math.ceil(rankings.length / BATCH_SIZE);

    addLog(`Starting import of ${rankings.length} players in ${totalBatches} batches...`);

    for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
      const startIndex = i;
      const endIndex = Math.min(i + BATCH_SIZE, rankings.length);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      try {
        addLog(`Processing batch ${batchNumber}/${totalBatches} (ranks ${startIndex + 1}-${endIndex})...`);

        const result = await importBatch({
          startIndex: 0,
          endIndex: endIndex - startIndex,
          players: rankings.slice(startIndex, endIndex),
        });

        addLog(`✅ Batch ${batchNumber}: Created ${result.created} players`);

        if (result.errors.length > 0) {
          addLog(`⚠️ Batch ${batchNumber} had ${result.errors.length} errors`);
        }

        setProgress((endIndex / rankings.length) * 100);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        addLog(`❌ Error in batch ${batchNumber}: ${error}`);
      }
    }

    addLog("✅ Import complete!");
    setStage("done");
  };

  // Auto-load CSV when on load stage
  useEffect(() => {
    if (stage === "load") {
      handleLoadCSV();
    }
  }, [stage]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Ultimate Rankings Fix</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Clear Database */}
          <Card className={stage === "clear" ? "border-blue-500" : ""}>
            <CardHeader>
              <CardTitle>Step 1: Clear Database</CardTitle>
            </CardHeader>
            <CardContent>
              {stage === "clear" ? (
                <Button onClick={handleClear} className="w-full" variant="destructive">
                  Clear All Data
                </Button>
              ) : (
                <p className="text-green-600">✅ Database Cleared</p>
              )}
            </CardContent>
          </Card>

          {/* Import Rankings */}
          <Card className={stage === "import" ? "border-blue-500" : ""}>
            <CardHeader>
              <CardTitle>Step 2: Import Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {stage === "import" && rankings.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Ready to import {rankings.length} players
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleImport} className="w-full bg-green-600 hover:bg-green-700">
                    Start Import
                  </Button>
                </div>
              )}
              {progress > 0 && progress < 100 && (
                <Progress value={progress} className="mt-4" />
              )}
              {stage === "done" && (
                <p className="text-green-600">✅ Import Complete</p>
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
                  <p>Total Players: {dbStatus.totalPlayers}</p>
                  <p>With Rankings: {dbStatus.withRankings}</p>
                  {dbStatus.scottie && (
                    <Alert className={dbStatus.scottie.worldRanking === 1 ? "border-green-500" : "border-red-500"}>
                      <AlertDescription>
                        Scottie Scheffler: Rank #{dbStatus.scottie.worldRanking}
                        {dbStatus.scottie.worldRanking !== 1 && " ⚠️ SHOULD BE #1"}
                      </AlertDescription>
                    </Alert>
                  )}
                  {dbStatus.missingTop10.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Missing ranks: {dbStatus.missingTop10.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "done" && (
            <Button
              onClick={() => window.location.href = "/players"}
              className="w-full"
              size="lg"
            >
              Go to Players Page
            </Button>
          )}
        </div>

        {/* Right: Logs */}
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>Import Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto bg-gray-50 rounded p-4 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className={log.includes("✅") ? "text-green-600" : log.includes("❌") ? "text-red-600" : ""}>
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}