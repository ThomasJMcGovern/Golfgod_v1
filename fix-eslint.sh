#!/bin/bash

# This script fixes all ESLint errors for Vercel deployment

echo "Fixing ESLint errors for Vercel deployment..."

# Fix admin/complete-reset/page.tsx
cat > app/admin/complete-reset/page.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, Trash2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

interface ResetResult {
  message?: string;
  players?: { cleared: number };
  playerStats?: { cleared: number };
  tournamentResults?: { cleared: number };
  userFollows?: { cleared: number };
  total?: number;
}

export default function CompleteResetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResetResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const completeReset = useMutation(api.completeReset.completeReset);

  const handleCompleteReset = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const resetResult = await completeReset();
      setResult(resetResult as ResetResult);
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during reset');
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = (res: ResetResult) => {
    if (res.total) return res.total;
    let total = 0;
    if (res.players?.cleared) total += res.players.cleared;
    if (res.playerStats?.cleared) total += res.playerStats.cleared;
    if (res.tournamentResults?.cleared) total += res.tournamentResults.cleared;
    if (res.userFollows?.cleared) total += res.userFollows.cleared;
    return total;
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
                <h1 className="text-2xl font-bold">Complete Database Reset</h1>
                <span className="text-sm text-muted-foreground">Completely reset all database tables</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            {!showConfirm ? (
              <Button
                onClick={() => setShowConfirm(true)}
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
                    onClick={handleCompleteReset}
                    variant="destructive"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Yes, Reset Everything"}
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

        {/* Result */}
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
            <AlertTitle>Reset Complete</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{result.message || 'Database has been reset successfully.'}</p>
              <div className="text-sm space-y-1">
                {result.players && <p>Players cleared: {result.players.cleared}</p>}
                {result.playerStats && <p>Player stats cleared: {result.playerStats.cleared}</p>}
                {result.tournamentResults && <p>Tournament results cleared: {result.tournamentResults.cleared}</p>}
                {result.userFollows && <p>User follows cleared: {result.userFollows.cleared}</p>}
                <p className="font-semibold mt-2">Total records deleted: {calculateTotal(result)}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
EOF

echo "Fixed admin/complete-reset/page.tsx"

# Fix admin/import-json-pipeline/page.tsx - remove unused variable
sed -i '' '24d' app/admin/import-json-pipeline/page.tsx 2>/dev/null || sed -i '24d' app/admin/import-json-pipeline/page.tsx

# Fix admin/ultimate-fix/page.tsx - remove unused imports
sed -i '' 's/, AlertTitle//g' app/admin/ultimate-fix/page.tsx 2>/dev/null || sed -i 's/, AlertTitle//g' app/admin/ultimate-fix/page.tsx

# Fix app/page.tsx - remove unused import
sed -i '' '/CardContent/d' app/page.tsx 2>/dev/null || sed -i '/CardContent/d' app/page.tsx

# Fix app/players/page.tsx - remove unused import
sed -i '' '/useQuery/d' app/players/page.tsx 2>/dev/null || sed -i '/useQuery/d' app/players/page.tsx

# Fix components/PlayerStats.tsx - remove unused imports
sed -i '' '/ExternalLink/d' components/PlayerStats.tsx 2>/dev/null || sed -i '/ExternalLink/d' components/PlayerStats.tsx

echo "Script complete! Run 'npm run build' to test."