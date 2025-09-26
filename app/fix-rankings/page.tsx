"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function FixRankingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="mr-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Rankings</h1>
                <span className="text-sm text-muted-foreground">Player rankings management</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Rankings Management</CardTitle>
            <CardDescription>
              Player rankings are managed through the import pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Player rankings and statistics are now imported and managed through the JSON import pipeline.
              All 100 PGA Tour players have been imported with their complete tournament history.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/players")}
            >
              View Players
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}