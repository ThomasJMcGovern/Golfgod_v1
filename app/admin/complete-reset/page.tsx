"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

export default function CompleteResetPage() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<any>({});
  const [csvData, setCsvData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const deleteAllPlayers = useMutation(api.completeReset.deleteAllPlayers);
  const importRankings = useMutation(api.completeReset.importRankingsCorrectly);
  const verifyData = useQuery(api.completeReset.verifyRankings);

  // Step 1: Delete all players
  const handleDeleteAll = async () => {
    setIsLoading(true);
    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await deleteAllPlayers();
      totalDeleted += result.deleted;
      hasMore = result.hasMore;
    }

    setResults({ ...results, deleted: totalDeleted });
    setStep(2);
    setIsLoading(false);
  };

  // Step 2: Load CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  // Step 3: Import data
  const handleImport = async () => {
    if (!csvData) {
      alert("Please load CSV data first");
      return;
    }

    setIsLoading(true);

    Papa.parse(csvData, {
      header: true,
      complete: async (parseResults) => {
        const rankings = parseResults.data
          .map((row: any) => ({
            rank: parseInt(row.rank) || 0,
            name: row.name?.trim() || "",
            country: row.country?.trim() || "",
          }))
          .filter((r: any) => r.rank > 0 && r.name);

        // Import in batches
        const BATCH_SIZE = 40;
        let totalCreated = 0;
        let allErrors: string[] = [];

        for (let i = 0; i < rankings.length; i += BATCH_SIZE) {
          const batch = rankings.slice(i, i + BATCH_SIZE);
          const result = await importRankings({ rankings: batch });
          totalCreated += result.created;
          allErrors = [...allErrors, ...result.errors];
        }

        setResults({
          ...results,
          imported: totalCreated,
          errors: allErrors,
        });
        setStep(4);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Complete Database Reset</h1>

      {/* Step 1: Delete All */}
      <Card className={`mb-6 ${step === 1 ? "border-blue-500" : ""}`}>
        <CardHeader>
          <CardTitle>Step 1: Delete All Players</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Button
              onClick={handleDeleteAll}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? "Deleting..." : "Delete All Players"}
            </Button>
          ) : (
            <p className="text-green-600">✓ Deleted {results.deleted} players</p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Load CSV */}
      <Card className={`mb-6 ${step === 2 ? "border-blue-500" : ""}`}>
        <CardHeader>
          <CardTitle>Step 2: Load Rankings CSV</CardTitle>
        </CardHeader>
        <CardContent>
          {step >= 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <p className="text-sm text-gray-500">Click to upload CSV</p>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <Textarea
                placeholder="Or paste CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="h-40 font-mono text-xs"
              />

              {csvData && (
                <Button onClick={() => setStep(3)} className="w-full">
                  CSV Loaded - Continue to Import
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Import */}
      <Card className={`mb-6 ${step === 3 ? "border-blue-500" : ""}`}>
        <CardHeader>
          <CardTitle>Step 3: Import Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {step >= 3 && (
            <>
              {step === 3 ? (
                <Button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Importing..." : "Import Rankings"}
                </Button>
              ) : (
                <p className="text-green-600">
                  ✓ Imported {results.imported} players
                  {results.errors?.length > 0 && (
                    <span className="text-red-500 block">
                      Errors: {results.errors.length}
                    </span>
                  )}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Verify */}
      {step === 4 && verifyData && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>✅ Import Complete - Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Database Status</AlertTitle>
                <AlertDescription>
                  Total Players: {verifyData.totalPlayers}
                </AlertDescription>
              </Alert>

              {verifyData.scottieScheffler && (
                <Alert className={verifyData.scottieScheffler.worldRanking === 1 ? "border-green-500" : "border-red-500"}>
                  <AlertTitle>Scottie Scheffler</AlertTitle>
                  <AlertDescription>
                    World Ranking: #{verifyData.scottieScheffler.worldRanking}
                    {verifyData.scottieScheffler.worldRanking !== 1 && " ⚠️ SHOULD BE #1"}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <h3 className="font-semibold mb-2">Top 10 Rankings:</h3>
                {verifyData.top10.map((player, i) => (
                  <div key={i} className="flex gap-4 py-1">
                    <span className="font-mono w-8">#{player.rank}</span>
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => window.location.href = "/players"}
                className="w-full"
              >
                Go to Players Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}