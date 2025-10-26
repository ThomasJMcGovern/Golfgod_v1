"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AppHeader from "@/components/layout/AppHeader";
import { Info } from "lucide-react";
import SchemaCanvas from "@/components/admin/database-schema/SchemaCanvas";
import TableDetailsPanel from "@/components/admin/database-schema/TableDetailsPanel";
import type { SchemaTable } from "@/lib/schema-parser";
import { parseSchema } from "@/lib/schema-parser";

export default function DatabaseSchemaPage() {
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);
  const { tables } = parseSchema();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm z-10">
        <AppHeader title="Database Schema" subtitle="Schema visualization" />
        <div className="px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{tables.length}</p>
                <p className="text-xs text-muted-foreground">Tables</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Size Legend:</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Small (&lt;100 rows)
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
              Medium (100-5K rows)
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
              Large (5K+ rows)
            </Badge>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative">
        <SchemaCanvas onNodeSelect={setSelectedTable} />

        {/* Help Card */}
        <Card className="absolute bottom-6 left-6 p-4 max-w-md bg-card/95 backdrop-blur-sm">
          <h3 className="font-semibold text-sm mb-2">How to Use</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Click</strong> a table to view detailed information</li>
            <li>• <strong>Drag</strong> tables to rearrange the layout</li>
            <li>• <strong>Scroll</strong> or use controls to zoom in/out</li>
            <li>• <strong>Pan</strong> by clicking and dragging the background</li>
            <li>• <strong>Green lines</strong> show foreign key relationships</li>
          </ul>
        </Card>
      </div>

      {/* Details Panel (slides in from right) */}
      <TableDetailsPanel table={selectedTable} onClose={() => setSelectedTable(null)} />
    </div>
  );
}
