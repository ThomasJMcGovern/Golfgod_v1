"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TableNode from "./TableNode";
import { parseSchema } from "@/lib/schema-parser";
import type { SchemaTable } from "@/lib/schema-parser";

interface SchemaCanvasProps {
  onNodeSelect?: (table: SchemaTable) => void;
}

// Custom node types - use type assertion to satisfy React Flow's NodeTypes
const nodeTypes = {
  table: TableNode,
} as const;

// Auto-layout helper - hierarchical layout
function getLayoutedNodes(tables: SchemaTable[], _relationships: any[]) {
  const nodes: Node[] = [];

  // Layer 1: Parent tables (no foreign keys)
  const parentTables = tables.filter((t) => t.foreignKeys.length === 0);
  // Layer 2: Tables with 1 FK
  const middleTables = tables.filter((t) => t.foreignKeys.length === 1);
  // Layer 3: Tables with 2+ FKs
  const childTables = tables.filter((t) => t.foreignKeys.length >= 2);

  const layerSpacing = 350;
  const nodeSpacing = 400;

  // Position parent tables
  parentTables.forEach((table, index) => {
    nodes.push({
      id: table.id,
      type: "table",
      position: {
        x: index * nodeSpacing,
        y: 0,
      },
      data: table as any,
    });
  });

  // Position middle tables
  middleTables.forEach((table, index) => {
    nodes.push({
      id: table.id,
      type: "table",
      position: {
        x: index * nodeSpacing,
        y: layerSpacing,
      },
      data: table as any,
    });
  });

  // Position child tables
  childTables.forEach((table, index) => {
    nodes.push({
      id: table.id,
      type: "table",
      position: {
        x: index * nodeSpacing,
        y: layerSpacing * 2,
      },
      data: table as any,
    });
  });

  return nodes;
}

// Convert relationships to edges
function getEdgesFromRelationships(relationships: any[]): Edge[] {
  return relationships.map((rel) => ({
    id: rel.id,
    source: rel.source,
    target: rel.target,
    sourceHandle: rel.sourceColumn,
    type: "smoothstep",
    animated: false,
    style: {
      stroke: "hsl(142, 76%, 36%)",
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "hsl(142, 76%, 36%)",
    },
    label: rel.sourceColumn,
    labelStyle: {
      fontSize: 10,
      fill: "hsl(120, 5%, 95%)",
      fontFamily: "monospace",
    },
    labelBgStyle: {
      fill: "hsl(120, 15%, 8%)",
      fillOpacity: 0.8,
    },
  }));
}

export default function SchemaCanvas({ onNodeSelect }: SchemaCanvasProps) {
  const { tables, relationships } = parseSchema();

  const initialNodes = useMemo(() => {
    return getLayoutedNodes(tables, relationships).map((node) => ({
      ...node,
      data: {
        ...node.data,
        onSelect: () => onNodeSelect?.(node.data as SchemaTable),
      },
    }));
  }, [tables, relationships, onNodeSelect]);

  const initialEdges = useMemo(() => {
    return getEdgesFromRelationships(relationships);
  }, [relationships]);

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        {/* Background pattern */}
        <Background
          gap={20}
          size={1}
          color="hsl(120, 5%, 20%)"
          className="bg-background"
        />

        {/* Controls (zoom, fit view) */}
        <Controls
          className="bg-card border border-border rounded-lg shadow-lg"
          showInteractive={false}
        />

        {/* Mini-map */}
        <MiniMap
          className="bg-card border border-border rounded-lg shadow-lg"
          nodeColor={(node) => {
            const data = node.data as SchemaTable;
            if (data.size === "small") return "hsl(142, 76%, 36%)";
            if (data.size === "medium") return "hsl(45, 100%, 51%)";
            return "hsl(0, 84%, 60%)";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
