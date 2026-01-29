"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DocumentMeta, DocumentType, documentTypeConfig, TagCount, DOCUMENT_TYPES } from "@/lib/types";
import { Icons, TypeIcon } from "./icons";
import { format } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface SidebarProps {
  /** List of all documents to display */
  documents: DocumentMeta[];
  /** Tags with counts for tag filter */
  tags: TagCount[];
  /** Whether sidebar is open (mobile) */
  isOpen: boolean;
  /** Callback to close sidebar */
  onClose: () => void;
}

interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

interface DocLinkProps {
  doc: DocumentMeta;
  isActive: boolean;
  onClick: () => void;
}

type FilterType = DocumentType | "all";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Groups documents by month for journal view
 */
function groupByMonth(docs: DocumentMeta[]): Record<string, DocumentMeta[]> {
  const groups: Record<string, DocumentMeta[]> = {};

  for (const doc of docs) {
    const month = format(new Date(doc.date), "MMMM yyyy");
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(doc);
  }

  return groups;
}

/**
 * Filters documents by type, tag, and search query
 */
function filterDocuments(
  documents: DocumentMeta[],
  type: FilterType,
  tag: string | null,
  query: string
): DocumentMeta[] {
  const normalizedQuery = query.toLowerCase().trim();

  return documents.filter((doc) => {
    // Type filter
    if (type !== "all" && doc.type !== type) {
      return false;
    }

    // Tag filter
    if (tag && !doc.tags.includes(tag)) {
      return false;
    }

    // Search filter
    if (normalizedQuery) {
      const matchesTitle = doc.title.toLowerCase().includes(normalizedQuery);
      const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(normalizedQuery));
      if (!matchesTitle && !matchesTags) {
        return false;
      }
    }

    return true;
  });
}

// ============================================================================
// Sub-components
// ============================================================================

function FilterButton({ children, active, onClick, ariaLabel }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`
        flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-sm rounded-lg transition-colors
        min-h-[44px] sm:min-h-[auto] touch-manipulation
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

function DocLink({ doc, isActive, onClick }: DocLinkProps) {
  const formattedDate = useMemo(
    () => format(new Date(doc.date), "MMM d, yyyy"),
    [doc.date]
  );

  return (
    <Link
      href={`/doc/${doc.slug}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`
        flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg text-sm transition-colors
        min-h-[48px] sm:min-h-[auto] touch-manipulation
        ${isActive
          ? "bg-accent/10 text-foreground"
          : "hover:bg-surface-hover text-muted hover:text-foreground"
        }
      `}
    >
      <TypeIcon type={doc.type} size={16} />
      <div className="flex-1 min-w-0">
        <div className="truncate">{doc.title}</div>
        <div className="text-xs text-muted truncate">{formattedDate}</div>
      </div>
      {isActive && <Icons.ChevronRight size={14} className="text-muted" aria-hidden />}
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Sidebar navigation component with search, type filters, and tag filters
 * Responsive: slides in on mobile, always visible on desktop
 */
export function Sidebar({ documents, tags, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync filters with URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const tagParam = searchParams.get("tag");

    // Validate type param
    if (typeParam && DOCUMENT_TYPES.includes(typeParam as DocumentType)) {
      setActiveFilter(typeParam as DocumentType);
    } else {
      setActiveFilter("all");
    }

    setActiveTag(tagParam);
  }, [searchParams]);

  // Memoized filtered documents
  const filteredDocs = useMemo(
    () => filterDocuments(documents, activeFilter, activeTag, searchQuery),
    [documents, activeFilter, activeTag, searchQuery]
  );

  // Memoized grouped documents (for journal view)
  const groupedDocs = useMemo(() => {
    if (activeFilter === "journal") {
      return groupByMonth(filteredDocs);
    }
    return { All: filteredDocs };
  }, [activeFilter, filteredDocs]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle tag toggle
  const handleTagClick = useCallback((tag: string) => {
    setActiveTag((current) => (current === tag ? null : tag));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  return (
    <>
      {/* Mobile overlay - improved positioning and z-index */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-surface border-r border-border z-[50]
          will-change-transform transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Document navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Icons.Network size={20} className="text-accent" aria-hidden />
              <span>Second Brain</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-hover rounded lg:hidden"
              aria-label="Close sidebar"
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
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search documents... (⌘K)"
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search documents"
                className="w-full pl-9 pr-10 py-3 sm:py-2 bg-background border border-border rounded-lg 
                         text-sm placeholder:text-muted focus:outline-none focus:border-accent
                         transition-smooth min-h-[44px] sm:min-h-[auto] touch-manipulation"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-hover rounded touch-manipulation"
                  aria-label="Clear search"
                >
                  <Icons.X size={14} className="text-muted" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="text-xs text-muted mt-2">
                {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Type filters */}
          <div className="p-4 border-b border-border" role="group" aria-label="Filter by type">
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => handleFilterChange("all")}
                ariaLabel="Show all documents"
              >
                All
              </FilterButton>
              {DOCUMENT_TYPES.map((type) => (
                <FilterButton
                  key={type}
                  active={activeFilter === type}
                  onClick={() => handleFilterChange(type)}
                  ariaLabel={`Filter by ${documentTypeConfig[type].label}`}
                >
                  <TypeIcon type={type} size={14} />
                  {documentTypeConfig[type].label}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-4 py-3 border-b border-border" role="group" aria-label="Filter by tag">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <Icons.Tag size={12} aria-hidden />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 8).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    aria-pressed={activeTag === tag}
                    className={`
                      text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-full transition-colors
                      min-h-[40px] sm:min-h-[auto] touch-manipulation
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
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Documents">
            {Object.entries(groupedDocs).map(([group, docs]) => (
              <div key={group} role="group" aria-label={group !== "All" ? group : undefined}>
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
              <div className="text-center py-8 text-muted text-sm" role="status">
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
                <Icons.Network size={12} aria-hidden />
                Graph view
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
