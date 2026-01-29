"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentType, documentTypeConfig } from "@/lib/types";

interface GraphData {
  nodes: { id: string; type: DocumentType }[];
  edges: { source: string; target: string }[];
}

interface Node {
  id: string;
  type: DocumentType;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const TYPE_COLORS: Record<DocumentType, string> = {
  concept: "#8b5cf6",
  journal: "#3b82f6",
  insight: "#f59e0b",
  research: "#10b981",
};

export function GraphView({ data }: { data: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialize nodes with random positions
    if (nodesRef.current.length === 0) {
      nodesRef.current = data.nodes.map((node) => ({
        ...node,
        x: width / 2 + (Math.random() - 0.5) * width * 0.5,
        y: height / 2 + (Math.random() - 0.5) * height * 0.5,
        vx: 0,
        vy: 0,
      }));
    }

    const nodes = nodesRef.current;
    const edges = data.edges;

    // Create node lookup
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Force simulation
    const simulate = () => {
      const centerX = width / 2;
      const centerY = height / 2;

      // Apply forces
      nodes.forEach((node) => {
        // Center gravity
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Repulsion from other nodes
        nodes.forEach((other) => {
          if (node.id === other.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        });
      });

      // Edge attraction
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.01;

        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
      });

      // Apply velocity with damping
      nodes.forEach((node) => {
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      });
    };

    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node) => {
        const isHovered = hoveredNode === node.id;
        const radius = isHovered ? 12 : 8;

        // Glow for hovered
        if (isHovered) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = TYPE_COLORS[node.type];
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = TYPE_COLORS[node.type];
        ctx.fill();

        ctx.shadowBlur = 0;

        // Label
        if (isHovered) {
          ctx.fillStyle = "#ededed";
          ctx.font = "12px Inter, system-ui";
          ctx.textAlign = "center";
          ctx.fillText(
            node.id.split("/").pop() || node.id,
            node.x,
            node.y - 18
          );
        }
      });

      simulate();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let found = null;
      for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy < 100) {
          found = node.id;
          break;
        }
      }
      setHoveredNode(found);
      canvas.style.cursor = found ? "pointer" : "default";
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy < 100) {
          router.push(`/doc/${node.id}`);
          break;
        }
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", updateSize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", updateSize);
    };
  }, [data, router, hoveredNode]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-surface border border-border rounded-xl overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-sm">
        {(Object.keys(documentTypeConfig) as DocumentType[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: TYPE_COLORS[type] }}
            />
            <span className="text-muted">{documentTypeConfig[type].label}</span>
          </div>
        ))}
      </div>

      {data.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          No documents to visualize yet
        </div>
      )}
    </div>
  );
}
