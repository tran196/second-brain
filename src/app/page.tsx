import Link from "next/link";
import { getDocuments, getAllTags } from "@/lib/documents";
import { AppShell } from "@/components/app-shell";
import { MobileHeader } from "@/components/mobile-header";
import { DocumentCard } from "@/components/document-card";
import { TypeIcon } from "@/components/icons";
import { documentTypeConfig, DocumentType, DOCUMENT_TYPES } from "@/lib/types";

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

function Hero({ documentCount }: { documentCount: number }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        Welcome back
      </h1>
      <p className="text-muted">
        {documentCount} document{documentCount !== 1 ? "s" : ""} in your brain
      </p>
    </div>
  );
}

function StatsGrid({ stats }: { stats: TypeStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8" role="list">
      {stats.map(({ type, count }) => (
        <Link
          key={type}
          href={`/documents?type=${type}`}
          className="
            flex items-center gap-3 p-4
            bg-surface hover:bg-surface-hover active:bg-surface-active
            border border-border rounded-xl
            transition-colors touch-manipulation
            min-h-[72px]
          "
        >
          <TypeIcon type={type} size={24} />
          <div>
            <div className="text-xl font-bold">{count}</div>
            <div className="text-xs text-muted">
              {documentTypeConfig[type].label}{count !== 1 ? "s" : ""}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RecentSection({ documents }: { documents: ReturnType<typeof getDocuments> }) {
  return (
    <section className="mb-8" aria-labelledby="recent-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recent-heading" className="text-lg font-semibold">
          Recent
        </h2>
        <Link
          href="/documents"
          className="text-sm text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-3 animate-stagger">
          {documents.map((doc) => (
            <DocumentCard key={doc.slug} document={doc} />
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
    <div className="text-center py-12 px-4 bg-surface border border-border rounded-xl">
      <p className="text-muted mb-2">No documents yet</p>
      <p className="text-sm text-muted">
        Add markdown files to <code className="bg-surface-hover px-1.5 py-0.5 rounded text-xs">~/clawd/brain/</code>
      </p>
    </div>
  );
}

function QuickActions() {
  return (
    <section aria-labelledby="actions-heading" className="mb-8">
      <h2 id="actions-heading" className="text-lg font-semibold mb-4">
        Quick Actions
      </h2>
      <div className="flex gap-3">
        <Link
          href="/graph"
          className="
            flex-1 flex items-center justify-center gap-2
            p-4 min-h-[56px]
            bg-surface hover:bg-surface-hover active:bg-surface-active
            border border-border rounded-xl
            text-sm font-medium
            transition-colors touch-manipulation
          "
        >
          <span aria-hidden="true">🌐</span>
          <span>Graph View</span>
        </Link>
        <Link
          href="/search"
          className="
            flex-1 flex items-center justify-center gap-2
            p-4 min-h-[56px]
            bg-surface hover:bg-surface-hover active:bg-surface-active
            border border-border rounded-xl
            text-sm font-medium
            transition-colors touch-manipulation
          "
        >
          <span aria-hidden="true">🔍</span>
          <span>Search</span>
        </Link>
      </div>
      
      {/* Desktop-only keyboard hints */}
      <div className="hidden lg:flex gap-4 mt-4 text-xs text-muted">
        <span><kbd>⌘K</kbd> Search</span>
        <span><kbd>G</kbd> Graph</span>
        <span><kbd>H</kbd> Home</span>
      </div>
    </section>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function Home() {
  const documents = getDocuments();
  const tags = getAllTags();

  // Calculate stats
  const stats: TypeStat[] = DOCUMENT_TYPES.map((type) => ({
    type,
    count: documents.filter((d) => d.type === type).length,
  }));

  // Recent documents
  const recentDocs = documents.slice(0, 5);

  return (
    <AppShell documents={documents} tags={tags}>
      <MobileHeader title="Second Brain" />
      
      <div className="px-4 py-6 lg:px-8 lg:py-10 animate-fade-in">
        <Hero documentCount={documents.length} />
        <StatsGrid stats={stats} />
        <RecentSection documents={recentDocs} />
        <QuickActions />
      </div>
    </AppShell>
  );
}
