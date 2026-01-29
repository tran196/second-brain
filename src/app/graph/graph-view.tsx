"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocumentType, GraphData, DOCUMENT_TYPES, documentTypeConfig } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

/**
 * Internal node representation with physics properties
 */
interface SimulationNode {
  id: string;
  type: DocumentType;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphViewProps {
  data: GraphData;
}

// ============================================================================
// Constants
// ============================================================================

/** Node colors by document type */
const TYPE_COLORS: Record<DocumentType, string> = {
  concept: "#8b5cf6",
  journal: "#3b82f6",
  insight: "#f59e0b",
  research: "#10b981",
};

/** Physics simulation constants */
const PHYSICS = {
  CENTER_GRAVITY: 0.001,
  REPULSION_STRENGTH: 1000,
  EDGE_ATTRACTION: 0.01,
  IDEAL_EDGE_LENGTH: 100,
  VELOCITY_DAMPING: 0.9,
  BOUNDARY_PADDING: 50,
  HIT_RADIUS: 100, // squared distance for hit detection
} as const;

/** Visual constants */
const VISUAL = {
  NODE_RADIUS: 8,
  NODE_RADIUS_HOVER: 12,
  EDGE_COLOR: "#333",
  EDGE_WIDTH: 1,
  LABEL_COLOR: "#ededed",
  LABEL_FONT: "12px Inter, system-ui",
  GLOW_BLUR: 20,
} as const;

// ============================================================================
// Physics Simulation
// ============================================================================

/**
 * Applies force-directed layout simulation to nodes
 * Modifies nodes in place for performance
 */
function simulateForces(
  nodes: SimulationNode[],
  edges: GraphData["edges"],
  nodeMap: Map<string, SimulationNode>,
  width: number,
  height: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Apply forces to each node
  for (const node of nodes) {
    // Center gravity - pulls nodes toward center
    node.vx += (centerX - node.x) * PHYSICS.CENTER_GRAVITY;
    node.vy += (centerY - node.y) * PHYSICS.CENTER_GRAVITY;

    // Repulsion from other nodes (Coulomb's law style)
    for (const other of nodes) {
      if (node.id === other.id) continue;

      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 1;
      const force = PHYSICS.REPULSION_STRENGTH / distSq;

      node.vx += (dx / dist) * force;
      node.vy += (dy / dist) * force;
    }
  }

  // Edge attraction (Hooke's law style)
  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - PHYSICS.IDEAL_EDGE_LENGTH) * PHYSICS.EDGE_ATTRACTION;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }

  // Apply velocity with damping and boundary constraints
  const minX = PHYSICS.BOUNDARY_PADDING;
  const maxX = width - PHYSICS.BOUNDARY_PADDING;
  const minY = PHYSICS.BOUNDARY_PADDING;
  const maxY = height - PHYSICS.BOUNDARY_PADDING;

  for (const node of nodes) {
    node.vx *= PHYSICS.VELOCITY_DAMPING;
    node.vy *= PHYSICS.VELOCITY_DAMPING;
    node.x = Math.max(minX, Math.min(maxX, node.x + node.vx));
    node.y = Math.max(minY, Math.min(maxY, node.y + node.vy));
  }
}

// ============================================================================
// Rendering
// ============================================================================

/**
 * Renders the graph to canvas
 */
function renderGraph(
  ctx: CanvasRenderingContext2D,
  nodes: SimulationNode[],
  edges: GraphData["edges"],
  nodeMap: Map<string, SimulationNode>,
  hoveredNode: string | null,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  // Draw edges
  ctx.strokeStyle = VISUAL.EDGE_COLOR;
  ctx.lineWidth = VISUAL.EDGE_WIDTH;

  for (const edge of edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) continue;

    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  }

  // Draw nodes
  for (const node of nodes) {
    const isHovered = hoveredNode === node.id;
    const radius = isHovered ? VISUAL.NODE_RADIUS_HOVER : VISUAL.NODE_RADIUS;

    // Glow effect for hovered node
    if (isHovered) {
      ctx.shadowBlur = VISUAL.GLOW_BLUR;
      ctx.shadowColor = TYPE_COLORS[node.type];
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = TYPE_COLORS[node.type];
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw label for hovered node
    if (isHovered) {
      ctx.fillStyle = VISUAL.LABEL_COLOR;
      ctx.font = VISUAL.LABEL_FONT;
      ctx.textAlign = "center";
      const label = node.id.split("/").pop() || node.id;
      ctx.fillText(label, node.x, node.y - 18);
    }
  }
}

/**
 * Finds node at given coordinates
 */
function findNodeAtPosition(
  nodes: SimulationNode[],
  x: number,
  y: number
): SimulationNode | null {
  for (const node of nodes) {
    const dx = x - node.x;
    const dy = y - node.y;
    if (dx * dx + dy * dy < PHYSICS.HIT_RADIUS) {
      return node;
    }
  }
  return null;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Interactive force-directed graph visualization of document connections
 * Nodes represent documents, edges represent links between them
 */
export function GraphView({ data }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Refs for animation state (don't trigger re-renders)
  const nodesRef = useRef<SimulationNode[]>([]);
  const animationRef = useRef<number>(0);

  // Handle node click - navigate to document
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      router.push(`/doc/${nodeId}`);
    },
    [router]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas with device pixel ratio for sharp rendering
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialize nodes with random positions if not already initialized
    if (nodesRef.current.length === 0 || nodesRef.current.length !== data.nodes.length) {
      nodesRef.current = data.nodes.map((node) => ({
        ...node,
        x: width / 2 + (Math.random() - 0.5) * width * 0.5,
        y: height / 2 + (Math.random() - 0.5) * height * 0.5,
        vx: 0,
        vy: 0,
      }));
    }

    const nodes = nodesRef.current;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Animation loop
    const animate = () => {
      simulateForces(nodes, data.edges, nodeMap, width, height);
      renderGraph(ctx, nodes, data.edges, nodeMap, hoveredNode, width, height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse move handler - update hovered node
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = findNodeAtPosition(nodes, x, y);
      setHoveredNode(node?.id ?? null);
      canvas.style.cursor = node ? "pointer" : "default";
    };

    // Click handler - navigate to document
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const node = findNodeAtPosition(nodes, x, y);
      if (node) {
        handleNodeClick(node.id);
      }
    };

    // Event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", updateSize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", updateSize);
    };
  }, [data, hoveredNode, handleNodeClick]);

  return (
    <div className="relative" role="img" aria-label="Knowledge graph visualization">
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          aria-hidden="true"
        />
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex gap-4 text-sm bg-surface/80 backdrop-blur-sm rounded-lg px-3 py-2"
        aria-label="Graph legend"
      >
        {DOCUMENT_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: TYPE_COLORS[type] }}
              aria-hidden="true"
            />
            <span className="text-muted">{documentTypeConfig[type].label}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {data.nodes.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center text-muted"
          role="status"
        >
          No documents to visualize yet
        </div>
      )}

      {/* Screen reader description */}
      <div className="sr-only">
        Graph showing {data.nodes.length} documents with {data.edges.length} connections.
        {hoveredNode && ` Currently hovering over ${hoveredNode}`}
      </div>
    </div>
  );
}
