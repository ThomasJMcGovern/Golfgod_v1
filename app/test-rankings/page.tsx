"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TestRankingsPage() {
  const rankingsCheck = useQuery(api.checkRankings.checkRankingsIssue);

  if (!rankingsCheck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Rankings Debug</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Summary</h2>
          <p>Total Players: {rankingsCheck.totalPlayers}</p>
          <p>Players with Rankings: {rankingsCheck.playersWithRankings}</p>
          <p>Missing Ranks: {rankingsCheck.totalMissingRanks}</p>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-semibold">Top 5 by Ranking</h2>
          {rankingsCheck.top5.map((p, i) => (
            <div key={i}>
              #{p.rank} - {p.name}
            </div>
          ))}
        </div>

        {rankingsCheck.scheffler && (
          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold">Scottie Scheffler</h2>
            <p>Name: {rankingsCheck.scheffler.name}</p>
            <p>World Ranking: {rankingsCheck.scheffler.worldRanking}</p>
            <p>Country: {rankingsCheck.scheffler.country}</p>
          </div>
        )}

        {rankingsCheck.duplicateRankings.length > 0 && (
          <div className="p-4 bg-red-100 rounded">
            <h2 className="font-semibold">Duplicate Rankings</h2>
            {rankingsCheck.duplicateRankings.map((d, i) => (
              <div key={i}>
                Rank #{d.rank}: {d.names.join(", ")}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold">First 20 Missing Ranks</h2>
          <p>{rankingsCheck.missingRanks.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}