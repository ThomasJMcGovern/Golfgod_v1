"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Key, Database } from "lucide-react";
import type { SchemaTable } from "@/lib/schema-parser";

const TableNode = memo(({ data, selected }: NodeProps) => {
  // Cast data to our SchemaTable type
  const tableData = data as SchemaTable;
  const [expanded, setExpanded] = useState(false);

  const sizeColors = {
    small: "bg-green-500/20 text-green-400 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    large: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  const borderColors = {
    small: "border-green-500/30",
    medium: "border-yellow-500/30",
    large: "border-red-500/30",
  };

  // Get foreign key columns
  const foreignKeyColumns = tableData.columns.filter((col) => col.isForeignKey);
  const regularColumns = tableData.columns.filter((col) => !col.isForeignKey);

  return (
    <>
      {/* Target handles for incoming connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={() => tableData.onSelect?.()}
      >
        <Card
          className={`min-w-[280px] max-w-[320px] ${borderColors[tableData.size]} ${
            selected ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
          } transition-all duration-200`}
        >
          {/* Header */}
          <div className="bg-card/50 p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-mono font-semibold text-sm">{tableData.name}</h3>
            </div>
            <Badge className={sizeColors[tableData.size]} variant="outline">
              {tableData.rowCount}
            </Badge>
          </div>

          {/* Foreign Key Columns (always visible) */}
          {foreignKeyColumns.length > 0 && (
            <div className="p-2 space-y-1 bg-muted/20">
              {foreignKeyColumns.map((column) => (
                <div
                  key={column.name}
                  className="flex items-center gap-2 text-xs font-mono bg-primary/10 rounded px-2 py-1"
                >
                  <Key className="h-3 w-3 text-primary" />
                  <span className="text-primary font-semibold">{column.name}</span>
                  <span className="text-muted-foreground">: {column.type}</span>
                  {column.referencesTable && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      → {column.referencesTable}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Expandable columns section */}
          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
              {regularColumns.slice(0, expanded ? undefined : 3).map((column) => (
                <div
                  key={column.name}
                  className="flex items-center gap-2 text-xs font-mono px-2 py-1 hover:bg-muted/20 rounded"
                >
                  <span className={column.required ? "text-foreground" : "text-muted-foreground"}>
                    {column.name}
                  </span>
                  <span className="text-muted-foreground">: {column.type}</span>
                  {!column.required && (
                    <span className="text-xs text-muted-foreground ml-auto">?</span>
                  )}
                </div>
              ))}
              {regularColumns.length > 3 && !expanded && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{regularColumns.length - 3} more columns
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer - indexes and expand toggle */}
          <div className="border-t border-border p-2 flex items-center justify-between bg-muted/5">
            <div className="text-xs text-muted-foreground">
              {tableData.indexes.length} {tableData.indexes.length === 1 ? "index" : "indexes"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Expand
                </>
              )}
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Source handles for outgoing connections (one for each foreign key) */}
      {foreignKeyColumns.map((fk, index) => (
        <Handle
          key={fk.name}
          type="source"
          position={Position.Bottom}
          id={fk.name}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
          style={{
            left: `${((index + 1) / (foreignKeyColumns.length + 1)) * 100}%`,
          }}
        />
      ))}

      {/* Default source handle if no foreign keys */}
      {foreignKeyColumns.length === 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-primary !w-3 !h-3 !border-2 !border-background"
        />
      )}
    </>
  );
});

TableNode.displayName = "TableNode";

export default TableNode;
