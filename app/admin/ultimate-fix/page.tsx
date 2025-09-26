"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function UltimateFixPage() {
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
                <h1 className="text-2xl font-bold">Ultimate Fix</h1>
                <span className="text-sm text-muted-foreground">Database repair tool</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Management</CardTitle>
            <CardDescription>
              Use the new data management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Database management and repair functions have been consolidated into the new import pipeline
              and data management tools.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push("/admin/import-json-pipeline")}
                variant="default"
              >
                Go to Import Pipeline
              </Button>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/clear-data")}
                variant="outline"
              >
                Clear Data Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}