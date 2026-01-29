"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DocumentMeta, DocumentType, documentTypeConfig } from "@/lib/types";
import { Icons, TypeIcon } from "./icons";
import { format } from "date-fns";

interface SidebarProps {
  documents: DocumentMeta[];
  tags: { tag: string; count: number }[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ documents, tags, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<DocumentType | "all">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Update filters from URL
  useEffect(() => {
    const type = searchParams.get("type") as DocumentType | null;
    const tag = searchParams.get("tag");
    setActiveFilter(type || "all");
    setActiveTag(tag);
  }, [searchParams]);

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesType = activeFilter === "all" || doc.type === activeFilter;
    const matchesTag = !activeTag || doc.tags.includes(activeTag);
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTag && matchesSearch;
  });

  // Group by date for journals, otherwise just list
  const groupedDocs = activeFilter === "journal"
    ? groupByMonth(filteredDocs)
    : { All: filteredDocs };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-surface border-r border-border z-50
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Icons.Network size={20} className="text-accent" />
              <span>Second Brain</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-hover rounded lg:hidden"
            >
              <Icons.X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Icons.Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg 
                         text-sm placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Type filters */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              >
                All
              </FilterButton>
              {(Object.keys(documentTypeConfig) as DocumentType[]).map((type) => (
                <FilterButton
                  key={type}
                  active={activeFilter === type}
                  onClick={() => setActiveFilter(type)}
                >
                  <TypeIcon type={type} size={14} />
                  {documentTypeConfig[type].label}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <Icons.Tag size={12} />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 8).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`
                      text-xs px-2 py-1 rounded-full transition-colors
                      ${activeTag === tag
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface-hover hover:bg-surface-active text-muted hover:text-foreground"
                      }
                    `}
                  >
                    #{tag}
                    <span className="ml-1 opacity-60">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document list */}
          <nav className="flex-1 overflow-y-auto p-2">
            {Object.entries(groupedDocs).map(([group, docs]) => (
              <div key={group}>
                {group !== "All" && (
                  <div className="px-2 py-2 text-xs font-medium text-muted uppercase tracking-wider">
                    {group}
                  </div>
                )}
                {docs.map((doc) => (
                  <DocLink
                    key={doc.slug}
                    doc={doc}
                    isActive={pathname === `/doc/${doc.slug}`}
                    onClick={onClose}
                  />
                ))}
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-8 text-muted text-sm">
                No documents found
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border text-xs text-muted">
            <div className="flex items-center justify-between">
              <span>{documents.length} documents</span>
              <Link
                href="/graph"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Icons.Network size={12} />
                Graph view
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors
        ${active
          ? "bg-accent text-accent-foreground"
          : "bg-surface-hover hover:bg-surface-active text-muted hover:text-foreground"
        }
      `}
    >
      {children}
    </button>
  );
}

function DocLink({
  doc,
  isActive,
  onClick,
}: {
  doc: DocumentMeta;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={`/doc/${doc.slug}`}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? "bg-accent/10 text-foreground"
          : "hover:bg-surface-hover text-muted hover:text-foreground"
        }
      `}
    >
      <TypeIcon type={doc.type} size={16} />
      <div className="flex-1 min-w-0">
        <div className="truncate">{doc.title}</div>
        <div className="text-xs text-muted truncate">
          {format(new Date(doc.date), "MMM d, yyyy")}
        </div>
      </div>
      {isActive && <Icons.ChevronRight size={14} className="text-muted" />}
    </Link>
  );
}

function groupByMonth(docs: DocumentMeta[]): Record<string, DocumentMeta[]> {
  const groups: Record<string, DocumentMeta[]> = {};

  docs.forEach((doc) => {
    const month = format(new Date(doc.date), "MMMM yyyy");
    if (!groups[month]) groups[month] = [];
    groups[month].push(doc);
  });

  return groups;
}
