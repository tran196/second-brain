export type DocumentType = "concept" | "journal" | "insight" | "research";

export interface DocumentMeta {
  slug: string;
  title: string;
  type: DocumentType;
  date: string;
  tags: string[];
  excerpt?: string;
  links?: string[]; // For graph view - linked document slugs
}

export interface Document extends DocumentMeta {
  content: string;
}

export const documentTypeConfig: Record<
  DocumentType,
  { label: string; icon: string; color: string; description: string }
> = {
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
