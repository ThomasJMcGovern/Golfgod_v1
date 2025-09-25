"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FixRankingsPage() {
  const [fixResult, setFixResult] = useState<any>(null);
  const missingRanks = useQuery(api.fixRankings.checkMissingTopRankings);
  const fixScheffler = useMutation(api.fixRankings.fixSchefflerRanking);

  const handleFixScheffler = async () => {
    try {
      const result = await fixScheffler();
      setFixResult(result);
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setFixResult({ error: error instanceof Error ? error.message : "Failed to fix" });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Fix Rankings</h1>

      <div className="space-y-4">
        {missingRanks && (
          <Card>
            <CardHeader>
              <CardTitle>Current Top 10 Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {missingRanks.currentTop10.map((player, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-bold">#{player.rank}</span>
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>

              {missingRanks.missingTopRanks.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded">
                  <p className="font-semibold text-red-600">Missing Rankings:</p>
                  <p>{missingRanks.missingTopRanks.join(", ")}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p>Has Scottie Scheffler: {missingRanks.hasScheffler ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Fix Scottie Scheffler Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFixScheffler} className="w-full">
              Set Scottie Scheffler as #1
            </Button>

            {fixResult && (
              <div className={`mt-4 p-4 rounded ${fixResult.error ? 'bg-red-50' : 'bg-green-50'}`}>
                <pre>{JSON.stringify(fixResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}