import { Metadata } from "next";
import { getDocuments, getAllTags, getGraphData } from "@/lib/documents";
import { AppShell } from "@/components/app-shell";
import { MobileHeader } from "@/components/mobile-header";
import { GraphView } from "./graph-view";

export const dynamic = "force-dynamic";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Graph View | Second Brain",
  description: "Visualize connections between your documents",
};

// ============================================================================
// Page Component
// ============================================================================

export default function GraphPage() {
  const documents = getDocuments();
  const tags = getAllTags();
  const graphData = getGraphData();

  return (
    <AppShell documents={documents} tags={tags}>
      <MobileHeader title="Graph View" />

      <div className="px-4 py-6 lg:px-8 lg:py-10 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Knowledge Graph</h1>
          <p className="text-muted text-sm">
            {graphData.nodes.length > 0 ? (
              <>
                {graphData.nodes.length} nodes, {graphData.edges.length} connections
              </>
            ) : (
              "No connections yet"
            )}
          </p>
        </header>

        {/* Graph container - full width, responsive height */}
        <div className="
          bg-surface border border-border rounded-xl overflow-hidden
          h-[60vh] lg:h-[70vh]
        ">
          <GraphView data={graphData} />
        </div>

        {/* Instructions */}
        <p className="mt-4 text-sm text-muted">
          Tap a node to open that document. Pinch to zoom on mobile.
        </p>
      </div>
    </AppShell>
  );
}
