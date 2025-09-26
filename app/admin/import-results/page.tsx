"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ImportResultsPage() {
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
                onClick={() => router.push("/dashboard")}
                className="mr-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Import Results</h1>
                <span className="text-sm text-muted-foreground">Tournament results import</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Results Import Tool</CardTitle>
            <CardDescription>
              Tournament results are imported through the JSON pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All tournament results are now managed through the unified JSON import pipeline.
              This includes player scores, positions, and earnings data.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/import-json-pipeline")}
            >
              Go to Import Pipeline
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}