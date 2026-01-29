"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentMeta, DocumentType, documentTypeConfig, TagCount, DOCUMENT_TYPES } from "@/lib/types";
import { Icons, TypeIcon } from "./icons";
import { format } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface DesktopSidebarProps {
  documents: DocumentMeta[];
  tags: TagCount[];
}

type FilterType = DocumentType | "all";

// ============================================================================
// Helper Functions
// ============================================================================

function filterDocuments(
  documents: DocumentMeta[],
  type: FilterType,
  tag: string | null,
  query: string
): DocumentMeta[] {
  const normalizedQuery = query.toLowerCase().trim();

  return documents.filter((doc) => {
    if (type !== "all" && doc.type !== type) return false;
    if (tag && !doc.tags.includes(tag)) return false;
    if (normalizedQuery) {
      const matchesTitle = doc.title.toLowerCase().includes(normalizedQuery);
      const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(normalizedQuery));
      if (!matchesTitle && !matchesTags) return false;
    }
    return true;
  });
}

// ============================================================================
// Sub-components
// ============================================================================

interface NavLinkProps {
  href: string;
  icon: keyof typeof Icons;
  label: string;
  isActive: boolean;
}

function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  const Icon = Icons[icon];
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? "bg-accent/10 text-accent font-medium"
          : "text-muted hover:text-foreground hover:bg-surface-hover"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1 text-xs rounded-full transition-colors
        ${active
          ? "bg-accent text-accent-foreground"
          : "bg-surface-hover text-muted hover:text-foreground hover:bg-surface-active"
        }
      `}
    >
      {children}
    </button>
  );
}

interface DocItemProps {
  doc: DocumentMeta;
  isActive: boolean;
}

function DocItem({ doc, isActive }: DocItemProps) {
  const formattedDate = format(new Date(doc.date), "MMM d");

  return (
    <Link
      href={`/doc/${doc.slug}`}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? "bg-accent/10 text-foreground"
          : "hover:bg-surface-hover text-muted hover:text-foreground"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <TypeIcon type={doc.type} size={14} />
      <span className="flex-1 truncate">{doc.title}</span>
      <span className="text-xs text-muted">{formattedDate}</span>
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Desktop sidebar - hidden on mobile, always visible on lg+
 * Linear-style navigation with clean aesthetics
 */
export function DesktopSidebar({ documents, tags }: DesktopSidebarProps) {
  const pathname = usePathname();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = useMemo(
    () => filterDocuments(documents, activeFilter, activeTag, searchQuery),
    [documents, activeFilter, activeTag, searchQuery]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag((current) => (current === tag ? null : tag));
  }, []);

  return (
    <aside
      className="
        hidden lg:flex lg:flex-col
        w-64 h-screen bg-surface border-r border-border
        fixed left-0 top-0
      "
      aria-label="Desktop navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <Icons.Network size={20} className="text-accent" />
        <span className="font-semibold">Second Brain</span>
      </div>

      {/* Main nav */}
      <nav className="p-3 space-y-1" aria-label="Main">
        <NavLink href="/" icon="Home" label="Home" isActive={pathname === "/"} />
        <NavLink href="/documents" icon="FileText" label="Documents" isActive={pathname === "/documents"} />
        <NavLink href="/search" icon="Search" label="Search" isActive={pathname === "/search"} />
        <NavLink href="/graph" icon="Network" label="Graph View" isActive={pathname === "/graph"} />
      </nav>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Icons.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Filter docs..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="
              w-full pl-8 pr-3 py-2 text-sm
              bg-background border border-border rounded-lg
              placeholder:text-muted
              focus:outline-none focus:border-accent
            "
          />
        </div>
      </div>

      {/* Type filters */}
      <div className="px-3 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
            All
          </FilterChip>
          {DOCUMENT_TYPES.map((type) => (
            <FilterChip
              key={type}
              active={activeFilter === type}
              onClick={() => setActiveFilter(type)}
            >
              {documentTypeConfig[type].label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 pb-3 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Tags</div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 6).map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`
                  text-xs px-2 py-0.5 rounded transition-colors
                  ${activeTag === tag
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground"
                  }
                `}
              >
                #{tag} <span className="opacity-50">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="text-[10px] uppercase tracking-wider text-muted px-3 mb-2">
          Documents ({filteredDocs.length})
        </div>
        <div className="space-y-0.5">
          {filteredDocs.slice(0, 20).map((doc) => (
            <DocItem
              key={doc.slug}
              doc={doc}
              isActive={pathname === `/doc/${doc.slug}`}
            />
          ))}
        </div>
        {filteredDocs.length === 0 && (
          <div className="text-sm text-muted text-center py-4">
            No documents found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border text-xs text-muted">
        <div className="flex items-center justify-between">
          <span>{documents.length} total</span>
          <span className="flex gap-2">
            <kbd className="font-mono">⌘K</kbd> search
          </span>
        </div>
      </div>
    </aside>
  );
}
