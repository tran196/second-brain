import { NextResponse } from "next/server";
import { getGraphData } from "@/lib/documents";
import { GraphData } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Error response shape
 */
interface ErrorResponse {
  error: string;
}

/**
 * GET /api/graph
 *
 * Fetches graph data for visualization.
 * Returns nodes (documents) and edges (links between documents).
 * Only edges where both source and target exist are included.
 *
 * Returns: { nodes: GraphNode[], edges: GraphEdge[] }
 */
export async function GET(): Promise<NextResponse<GraphData | ErrorResponse>> {
  try {
    const graphData = getGraphData();
    return NextResponse.json(graphData);
  } catch (error) {
    console.error("[api/graph] Error fetching graph data:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    );
  }
}
