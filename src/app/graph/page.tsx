import { getDocuments, getAllTags, getGraphData } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { GraphView } from "./graph-view";

export const dynamic = "force-dynamic";

export default function GraphPage() {
  const documents = getDocuments();
  const tags = getAllTags();
  const graphData = getGraphData();

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Knowledge Graph</h1>
        <p className="text-muted mb-8">
          Visualize connections between your documents
        </p>
        <GraphView data={graphData} />
      </div>
    </LayoutWrapper>
  );
}

export const metadata = {
  title: "Graph View | Second Brain",
  description: "Visualize your knowledge connections",
};
