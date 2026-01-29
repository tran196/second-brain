import Link from "next/link";
import { getDocuments, getAllTags } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { TypeIcon } from "@/components/icons";
import { documentTypeConfig, DocumentType, DocumentMeta, DOCUMENT_TYPES } from "@/lib/types";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

// ============================================================================
// Types
// ============================================================================

interface TypeStat {
  type: DocumentType;
  count: number;
}

// ============================================================================
// Sub-components
// ============================================================================

interface HeroProps {
  documentCount: number;
}

function Hero({ documentCount }: HeroProps) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Second Brain</h1>
      <p className="text-lg text-muted">
        Your interconnected knowledge base with {documentCount} document
        {documentCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

interface StatsGridProps {
  stats: TypeStat[];
}

function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" role="list">
      {stats.map(({ type, count }) => (
        <Link
          key={type}
          href={`/?type=${type}`}
          className="p-4 bg-surface hover:bg-surface-hover border border-border rounded-xl 
                   transition-colors group"
          role="listitem"
          aria-label={`${count} ${documentTypeConfig[type].label}${count !== 1 ? "s" : ""}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <TypeIcon type={type} size={20} />
            <span className="text-2xl font-bold">{count}</span>
          </div>
          <div className="text-sm text-muted group-hover:text-foreground transition-colors">
            {documentTypeConfig[type].label}{count !== 1 ? "s" : ""}
          </div>
        </Link>
      ))}
    </div>
  );
}

interface DocumentCardProps {
  doc: DocumentMeta;
}

function DocumentCard({ doc }: DocumentCardProps) {
  const formattedDate = format(new Date(doc.date), "MMM d, yyyy");

  return (
    <Link
      href={`/doc/${doc.slug}`}
      className="flex items-start gap-4 p-4 bg-surface hover:bg-surface-hover 
               border border-border rounded-xl transition-colors group"
    >
      <TypeIcon type={doc.type} size={20} />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium group-hover:text-accent transition-colors">
          {doc.title}
        </h3>
        {doc.excerpt && (
          <p className="text-sm text-muted line-clamp-2 mt-1">{doc.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
          <time dateTime={doc.date}>{formattedDate}</time>
          {doc.tags.length > 0 && (
            <span className="flex gap-1" aria-label="Tags">
              {doc.tags.slice(0, 3).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface RecentDocumentsProps {
  documents: DocumentMeta[];
}

function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <section className="mb-12" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-xl font-semibold mb-4">
        Recent Documents
      </h2>

      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentCard key={doc.slug} doc={doc} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-muted" role="status">
      <p className="mb-2">No documents yet</p>
      <p className="text-sm">
        Add markdown files to <code className="bg-surface px-1 rounded">~/clawd/brain/</code> to get started
      </p>
    </div>
  );
}

function QuickActions() {
  return (
    <section aria-labelledby="actions-heading">
      <h2 id="actions-heading" className="text-xl font-semibold mb-4">
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-3 mb-4">
        <Link
          href="/graph"
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover
                   border border-border rounded-lg text-sm transition-colors"
        >
          <span aria-hidden="true">🌐</span> Graph View
        </Link>
      </div>
      <div className="text-xs text-muted space-y-1">
        <div>Keyboard shortcuts:</div>
        <div className="flex flex-wrap gap-4">
          <span><kbd className="font-mono text-xs">⌘K</kbd> Search</span>
          <span><kbd className="font-mono text-xs">G</kbd> Graph view</span>
          <span><kbd className="font-mono text-xs">H</kbd> Home</span>
          <span><kbd className="font-mono text-xs">ESC</kbd> Close sidebar</span>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * Home page showing document stats, recent documents, and quick actions
 */
export default function Home() {
  const documents = getDocuments();
  const tags = getAllTags();

  // Calculate stats by type
  const stats: TypeStat[] = DOCUMENT_TYPES.map((type) => ({
    type,
    count: documents.filter((d) => d.type === type).length,
  }));

  // Get 5 most recent documents
  const recentDocs = documents.slice(0, 5);

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <div className="animate-fade-in">
        <Hero documentCount={documents.length} />
        <StatsGrid stats={stats} />
        <RecentDocuments documents={recentDocs} />
        <QuickActions />
      </div>
    </LayoutWrapper>
  );
}
