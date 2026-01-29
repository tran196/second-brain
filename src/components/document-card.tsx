import Link from "next/link";
import { DocumentMeta } from "@/lib/types";
import { TypeIcon } from "./icons";
import { format } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface DocumentCardProps {
  document: DocumentMeta;
  /** Compact mode for list views */
  compact?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Touch-friendly document card
 * 44px+ touch targets, good readability on mobile
 */
export function DocumentCard({ document, compact = false }: DocumentCardProps) {
  const formattedDate = format(new Date(document.date), "MMM d, yyyy");

  if (compact) {
    return (
      <Link
        href={`/doc/${document.slug}`}
        className="
          flex items-center gap-3 px-4 py-3
          min-h-[56px]
          bg-surface hover:bg-surface-hover active:bg-surface-active
          border-b border-border last:border-b-0
          transition-colors touch-manipulation
        "
      >
        <TypeIcon type={document.type} size={18} />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{document.title}</div>
          <div className="text-xs text-muted">{formattedDate}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/doc/${document.slug}`}
      className="
        block p-4
        bg-surface hover:bg-surface-hover active:bg-surface-active
        border border-border rounded-xl
        transition-all duration-200 touch-manipulation
        hover:border-accent/30 hover:shadow-sm
      "
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TypeIcon type={document.type} size={16} />
        <span className="text-xs text-muted">{formattedDate}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base mb-1 leading-tight">
        {document.title}
      </h3>

      {/* Excerpt */}
      {document.excerpt && (
        <p className="text-sm text-muted line-clamp-2 mb-3">
          {document.excerpt}
        </p>
      )}

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {document.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-surface-hover rounded-full text-muted"
            >
              #{tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-xs text-muted">+{document.tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}

// ============================================================================
// List Component
// ============================================================================

interface DocumentListProps {
  documents: DocumentMeta[];
  /** Display mode */
  mode?: "cards" | "compact";
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * List of document cards
 */
export function DocumentList({ documents, mode = "cards", emptyMessage = "No documents found" }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  if (mode === "compact") {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {documents.map((doc) => (
          <DocumentCard key={doc.slug} document={doc} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.slug} document={doc} />
      ))}
    </div>
  );
}
