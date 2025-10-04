"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, XCircle, Info, Loader2, Database } from "lucide-react";

export default function ImportMasterJSON() {
  const [file, setFile] = useState<File | null>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "complete">("upload");
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);

  // Convex mutations
  const importCourses = useMutation(api.importMasterData.importCourses);
  const createMappings = useMutation(api.importMasterData.createTournamentMappings);
  const importPlayerResults = useMutation(api.importMasterData.importTournamentResultsBatch);
  const calculateStats = useMutation(api.importMasterData.calculatePlayerCourseStats);
  const clearBatch = useMutation(api.tournamentResults.clearTournamentDataBatch);

  // Query import status (small tables only - large tables shown after import completes)
  const importStatus = useQuery(api.importMasterData.getImportStatus);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState({ deleted: 0, table: "" });

  const handleClearData = async () => {
    if (!confirm("⚠️ This will delete ALL tournament results, round stats, and player-course stats. Are you sure?")) {
      return;
    }

    setIsClearing(true);
    setClearProgress({ deleted: 0, table: "" });

    try {
      let totalDeleted = 0;
      let hasMore = true;

      while (hasMore) {
        const result = await clearBatch();
        totalDeleted += result.deleted;
        setClearProgress({ deleted: totalDeleted, table: result.table });
        hasMore = result.hasMore;
      }

      alert(`✅ Successfully deleted ${totalDeleted} records!`);
    } catch (error) {
      console.error("Failed to clear data:", error);
      alert("Failed to clear data. Check console for details.");
    } finally {
      setIsClearing(false);
      setClearProgress({ deleted: 0, table: "" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    try {
      const text = await uploadedFile.text();
      const data = JSON.parse(text);
      setMasterData(data);
      setStep("preview");
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      alert("Invalid JSON file");
    }
  };

  const startImport = async () => {
    if (!masterData) return;

    setStep("importing");
    setProgress(0);

    try {
      // Step 1: Import courses (10%)
      console.log("Step 1: Importing courses...");
      const coursesResult = await importCourses({ masterData });
      console.log("Courses imported:", coursesResult);
      setProgress(10);

      // Step 2: Create tournament mappings (20%)
      console.log("Step 2: Creating tournament mappings...");
      const mappingsResult = await createMappings({ masterData });
      console.log("Mappings created:", mappingsResult);
      setProgress(20);

      // Step 3: Import tournament results (70%)
      console.log("Step 3: Importing tournament results...");
      const players = masterData.players || [];
      const totalPlayers = players.length;
      const results: any[] = [];

      for (let i = 0; i < totalPlayers; i++) {
        const player = players[i];
        const result = await importPlayerResults({ playerData: player });
        results.push(result);

        // Update progress (20% to 70%)
        const importProgress = 20 + Math.floor((i / totalPlayers) * 50);
        setProgress(importProgress);

        console.log(`Imported ${i + 1}/${totalPlayers}: ${player.player_name}`);
      }

      setProgress(70);

      // Step 4: Calculate player-course stats (70% → 100%)
      console.log("Step 4: Calculating player-course statistics...");
      const statsResults: any[] = [];

      for (let i = 0; i < results.length; i++) {
        const importResult = results[i];

        // Use the playerId from the import result
        if (!importResult.playerId) {
          console.warn(`No playerId for ${importResult.playerName}`);
          continue;
        }

        try {
          const statsResult = await calculateStats({ playerId: importResult.playerId });
          statsResults.push(statsResult);

          // Update progress (70% to 100%)
          const statsProgress = 70 + Math.floor(((i + 1) / results.length) * 30);
          setProgress(statsProgress);

          console.log(`Calculated stats ${i + 1}/${results.length}: ${statsResult.playerName}`);
        } catch (error) {
          console.error(`Failed to calculate stats for ${importResult.playerName}:`, error);
        }
      }

      setProgress(100);

      setImportResults({
        courses: coursesResult,
        mappings: mappingsResult,
        players: results,
        stats: {
          calculated: statsResults.reduce((sum, r) => sum + r.calculated, 0),
          errors: statsResults.flatMap(r => r.errors),
        },
      });

      setStep("complete");
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Check console for details.");
      setStep("preview");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Master JSON Data</h1>
        <p className="text-muted-foreground">
          Import player tournament results from all_players_results_master.json
        </p>
      </div>

      {/* Clear Data Button */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">⚠️ Clear All Tournament Data</CardTitle>
          <CardDescription>
            Delete all tournament results, round stats, and player-course stats before re-importing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClearData}
            variant="destructive"
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing Data...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Clear All Tournament Data
              </>
            )}
          </Button>

          {/* Progress Display */}
          {isClearing && clearProgress.deleted > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <div className="text-sm text-gray-600 mb-1">
                Deleting <span className="font-semibold">{clearProgress.table}</span>...
              </div>
              <div className="text-lg font-bold text-red-700">
                {clearProgress.deleted.toLocaleString()} records deleted
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Database Status */}
      {importStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{importStatus.courses}</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{importStatus.players}</div>
                <div className="text-sm text-muted-foreground">Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{importStatus.tournamentMappings}</div>
                <div className="text-sm text-muted-foreground">Tournament Mappings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Step */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Master JSON File</CardTitle>
            <CardDescription>
              Select the all_players_results_master.json file from your local system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="max-w-md"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Expected file size: ~12 MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Step */}
      {step === "preview" && masterData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>Review the data before importing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold">{masterData.metadata?.total_players || 0}</div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold">{masterData.metadata?.total_tournaments || 0}</div>
                  <div className="text-sm text-muted-foreground">Tournaments</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold">
                    {masterData.metadata?.years_covered?.[0]} - {masterData.metadata?.years_covered?.[masterData.metadata.years_covered.length - 1]}
                  </div>
                  <div className="text-sm text-muted-foreground">Years Covered</div>
                </div>
              </div>

              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This will import {masterData.metadata?.total_players} players with {masterData.metadata?.total_tournaments} tournament results.
                  The process may take several minutes.
                </AlertDescription>
              </Alert>

              {/* Sample Data Preview */}
              {masterData.players?.[0] && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Sample Data (First Player):</h4>
                  <div className="bg-secondary p-4 rounded-lg">
                    <div className="text-sm">
                      <strong>{masterData.players[0].player_name}</strong> (ID: {masterData.players[0].player_id})
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {masterData.players[0].tournaments?.length || 0} tournaments
                    </div>
                    {masterData.players[0].tournaments?.[0] && (
                      <div className="mt-2 text-xs">
                        <div>• {masterData.players[0].tournaments[0].tournament_name}</div>
                        <div>• {masterData.players[0].tournaments[0].course_name}</div>
                        <div>• Finish: {masterData.players[0].tournaments[0].finish}</div>
                        <div>• Rounds: {JSON.stringify(masterData.players[0].tournaments[0].rounds)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => setStep("upload")} variant="outline">
                  Choose Different File
                </Button>
                <Button onClick={startImport} className="flex-1">
                  <Database className="w-4 h-4 mr-2" />
                  Start Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Importing Step */}
      {step === "importing" && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Data...</CardTitle>
            <CardDescription>Please wait while we process your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 10 && "Importing courses..."}
                {progress >= 10 && progress < 20 && "Creating tournament mappings..."}
                {progress >= 20 && progress < 70 && "Importing tournament results..."}
                {progress >= 70 && progress < 100 && "Calculating player statistics..."}
                {progress === 100 && "Finalizing..."}
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === "complete" && importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Import Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  All data has been successfully imported. You can now use the "Inside the Ropes" feature.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Courses</div>
                  <div className="text-sm text-muted-foreground">
                    Created: {importResults.courses?.created || 0} | Skipped: {importResults.courses?.skipped || 0}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Tournament Mappings</div>
                  <div className="text-sm text-muted-foreground">
                    Created: {importResults.mappings?.created || 0} | Skipped: {importResults.mappings?.skipped || 0}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Player Results</div>
                  <div className="text-sm text-muted-foreground">
                    {importResults.players?.length || 0} players processed
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Statistics</div>
                  <div className="text-sm text-muted-foreground">
                    {importResults.stats?.calculated || 0} stats calculated
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button onClick={() => window.location.href = "/inside-the-ropes"} className="flex-1">
                  Go to Inside the Ropes
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Import More Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}