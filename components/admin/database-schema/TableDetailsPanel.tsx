"use client";

import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Database, Key, List, Copy, CheckCircle2 } from "lucide-react";
import type { SchemaTable } from "@/lib/schema-parser";
import { useState } from "react";

interface TableDetailsPanelProps {
  table: SchemaTable | null;
  onClose: () => void;
}

export default function TableDetailsPanel({ table, onClose }: TableDetailsPanelProps) {
  const [copied, setCopied] = useState(false);

  const tableInfo = useQuery(
    api.databaseSchema.getTableInfo,
    table ? { tableName: table.name } : "skip"
  );

  const sampleData = useQuery(
    api.databaseSchema.getTableSample,
    table ? { tableName: table.name } : "skip"
  );

  const handleCopySchema = () => {
    if (!table) return;

    const schemaText = `
Table: ${table.name}
Row Count: ${table.rowCount}
Size: ${table.size}

Columns:
${table.columns.map((col) => `  - ${col.name}: ${col.type}${col.required ? " (required)" : " (optional)"}${col.isForeignKey ? ` → ${col.referencesTable}` : ""}`).join("\n")}

Indexes:
${table.indexes.map((idx) => `  - ${idx}`).join("\n")}

Foreign Keys:
${table.foreignKeys.length > 0 ? table.foreignKeys.map((fk) => `  - ${fk}`).join("\n") : "  None"}
`.trim();

    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {table && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-[450px] bg-card border-l border-border shadow-2xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-mono font-bold text-lg">{table.name}</h2>
                <p className="text-sm text-muted-foreground">Table Details</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(100vh-88px)]">
            <div className="p-6 space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Row Count</span>
                    <Badge variant="outline">{table.rowCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size Category</span>
                    <Badge
                      variant="outline"
                      className={
                        table.size === "small"
                          ? "bg-green-500/20 text-green-400"
                          : table.size === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }
                    >
                      {table.size}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Columns</span>
                    <Badge variant="outline">{table.columns.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Indexes</span>
                    <Badge variant="outline">{table.indexes.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Foreign Keys</span>
                    <Badge variant="outline">{table.foreignKeys.length}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Columns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Columns</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySchema}
                      className="h-7 text-xs"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Schema
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {table.columns.map((column) => (
                      <div
                        key={column.name}
                        className={`flex items-start justify-between p-2 rounded ${
                          column.isForeignKey ? "bg-primary/10" : "bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {column.isForeignKey && <Key className="h-3 w-3 text-primary mt-0.5" />}
                          <div>
                            <p className="font-mono text-sm font-medium">{column.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {column.type}
                              {column.referencesTable && ` → ${column.referencesTable}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {column.required ? "required" : "optional"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Indexes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Indexes</CardTitle>
                  <CardDescription>Database indexes for query optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {table.indexes.map((index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                        <List className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm">{index}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Relationships */}
              {tableInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Relationships</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tableInfo.foreignKeys && tableInfo.foreignKeys.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          References (Foreign Keys)
                        </h4>
                        <div className="space-y-1">
                          {tableInfo.foreignKeys.map((fk: string, idx: number) => (
                            <div key={idx} className="text-sm font-mono bg-primary/10 p-2 rounded">
                              {fk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {tableInfo.childTables && tableInfo.childTables.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                          Referenced By (Child Tables)
                        </h4>
                        <div className="space-y-1">
                          {tableInfo.childTables.map((child: string) => (
                            <Badge key={child} variant="outline" className="mr-2">
                              {child}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sample Data */}
              {sampleData && sampleData.sampleData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sample Data</CardTitle>
                    <CardDescription>First {sampleData.count} rows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs font-mono bg-muted/20 p-3 rounded overflow-x-auto">
                        {JSON.stringify(sampleData.sampleData, null, 2)}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
