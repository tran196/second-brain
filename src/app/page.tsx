import Link from "next/link";
import { getDocuments, getAllTags } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { TypeIcon } from "@/components/icons";
import { documentTypeConfig, DocumentType } from "@/lib/types";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default function Home() {
  const documents = getDocuments();
  const tags = getAllTags();

  // Get recent documents
  const recentDocs = documents.slice(0, 5);

  // Get stats by type
  const stats = (Object.keys(documentTypeConfig) as DocumentType[]).map((type) => ({
    type,
    count: documents.filter((d) => d.type === type).length,
  }));

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <div className="animate-fade-in">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to your Second Brain</h1>
          <p className="text-lg text-muted">
            Your interconnected knowledge base with {documents.length} documents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map(({ type, count }) => (
            <Link
              key={type}
              href={`/?type=${type}`}
              className="p-4 bg-surface hover:bg-surface-hover border border-border rounded-xl 
                       transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <TypeIcon type={type} size={20} />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <div className="text-sm text-muted group-hover:text-foreground transition-colors">
                {documentTypeConfig[type].label}s
              </div>
            </Link>
          ))}
        </div>

        {/* Recent documents */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/doc/${doc.slug}`}
                className="flex items-start gap-4 p-4 bg-surface hover:bg-surface-hover 
                         border border-border rounded-xl transition-colors group"
              >
                <TypeIcon type={doc.type} size={20} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium group-hover:text-accent transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mt-1">
                    {doc.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>{format(new Date(doc.date), "MMM d, yyyy")}</span>
                    {doc.tags.length > 0 && (
                      <span className="flex gap-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <span key={tag}>#{tag}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-12 text-muted">
                <p className="mb-2">No documents yet</p>
                <p className="text-sm">
                  Add markdown files to <code>~/clawd/brain/</code> to get started
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover
                       border border-border rounded-lg text-sm transition-colors"
            >
              <span>🌐</span> Graph View
            </Link>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface
                       border border-border rounded-lg text-sm"
            >
              <span>📝</span> Keyboard: <kbd>⌘K</kbd> to search
            </div>
          </div>
        </section>
      </div>
    </LayoutWrapper>
  );
}
