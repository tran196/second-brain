import { NextResponse } from "next/server";
import { getGraphData } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  const graphData = getGraphData();
  return NextResponse.json(graphData);
}
