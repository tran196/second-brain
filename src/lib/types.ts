/**
 * Supported document types in the Second Brain
 */
export type DocumentType = "concept" | "journal" | "insight" | "research";

/**
 * Metadata for a document (excludes content for list views)
 */
export interface DocumentMeta {
  /** Relative path without .md extension (e.g., "concepts/neural-networks") */
  slug: string;
  /** Document title from frontmatter or filename */
  title: string;
  /** Document type for filtering and display */
  type: DocumentType;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Array of tag strings */
  tags: string[];
  /** Short excerpt for previews */
  excerpt?: string;
  /** Slugs of linked documents (for graph view) */
  links?: string[];
}

/**
 * Full document including markdown content
 */
export interface Document extends DocumentMeta {
  /** Raw markdown content (without frontmatter) */
  content: string;
}

/**
 * Tag with usage count for tag cloud/filtering
 */
export interface TagCount {
  tag: string;
  count: number;
}

/**
 * Graph node representing a document
 */
export interface GraphNode {
  id: string;
  type: DocumentType;
}

/**
 * Graph edge representing a link between documents
 */
export interface GraphEdge {
  source: string;
  target: string;
}

/**
 * Graph data for visualization
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Configuration for each document type
 */
export interface DocumentTypeInfo {
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Document type configuration map
 */
export const documentTypeConfig: Record<DocumentType, DocumentTypeInfo> = {
  concept: {
    label: "Concept",
    icon: "Lightbulb",
    color: "#8b5cf6",
    description: "Deep exploration of a topic",
  },
  journal: {
    label: "Journal",
    icon: "BookOpen",
    color: "#3b82f6",
    description: "Daily entries and reflections",
  },
  insight: {
    label: "Insight",
    icon: "Sparkles",
    color: "#f59e0b",
    description: "Quick observations and learnings",
  },
  research: {
    label: "Research",
    icon: "Search",
    color: "#10b981",
    description: "In-depth investigation results",
  },
};

/**
 * Array of all document types (for iteration)
 */
export const DOCUMENT_TYPES: DocumentType[] = ["concept", "journal", "insight", "research"];
