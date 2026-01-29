import { Metadata } from "next";
import { getDocuments, getAllTags, getGraphData } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { GraphView } from "./graph-view";

export const dynamic = "force-dynamic";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: "Graph View | Second Brain",
  description: "Visualize connections between your documents in an interactive graph",
};

// ============================================================================
// Page Component
// ============================================================================

/**
 * Graph visualization page
 * Displays an interactive force-directed graph of document connections
 */
export default function GraphPage() {
  const documents = getDocuments();
  const tags = getAllTags();
  const graphData = getGraphData();

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <div className="animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Knowledge Graph</h1>
          <p className="text-muted">
            Visualize connections between your documents.
            {graphData.nodes.length > 0 && (
              <span className="ml-1">
                {graphData.nodes.length} nodes, {graphData.edges.length} connections.
              </span>
            )}
          </p>
        </header>

        <GraphView data={graphData} />

        {/* Usage instructions */}
        <div className="mt-6 text-sm text-muted">
          <p>
            <strong>Tip:</strong> Click on a node to navigate to that document.
            Hover to see the document name.
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}
