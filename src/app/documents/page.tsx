"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MobileHeader } from "@/components/mobile-header";
import { DocumentList } from "@/components/document-card";
import { Icons, TypeIcon } from "@/components/icons";
import { DocumentMeta, DocumentType, documentTypeConfig, DOCUMENT_TYPES, TagCount } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

type FilterType = DocumentType | "all";

interface DocumentsContentProps {
  documents: DocumentMeta[];
  tags: TagCount[];
}

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
        flex items-center gap-1.5
        px-3 py-2 min-h-[44px]
        text-sm rounded-full
        transition-colors touch-manipulation
        ${active
          ? "bg-accent text-accent-foreground"
          : "bg-surface-hover text-muted hover:text-foreground active:bg-surface-active"
        }
      `}
    >
      {children}
    </button>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mb-4">
      <Icons.Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        placeholder="Search documents..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-11 pr-4 py-3
          min-h-[48px]
          bg-surface border border-border rounded-xl
          text-base placeholder:text-muted
          focus:outline-none focus:border-accent
          touch-manipulation
        "
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 touch-manipulation"
          aria-label="Clear search"
        >
          <Icons.X size={18} className="text-muted" />
        </button>
      )}
    </div>
  );
}

function TypeFilters({
  active,
  onChange,
}: {
  active: FilterType;
  onChange: (type: FilterType) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mb-4">
      <FilterChip active={active === "all"} onClick={() => onChange("all")}>
        All
      </FilterChip>
      {DOCUMENT_TYPES.map((type) => (
        <FilterChip key={type} active={active === type} onClick={() => onChange(type)}>
          <TypeIcon type={type} size={14} />
          {documentTypeConfig[type].label}
        </FilterChip>
      ))}
    </div>
  );
}

function TagFilters({
  tags,
  activeTag,
  onTagClick,
}: {
  tags: TagCount[];
  activeTag: string | null;
  onTagClick: (tag: string) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-xs text-muted mb-2 flex items-center gap-1">
        <Icons.Tag size={12} />
        Tags
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 8).map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`
              text-xs px-2.5 py-1.5 rounded-lg
              transition-colors touch-manipulation
              ${activeTag === tag
                ? "bg-accent text-accent-foreground"
                : "bg-surface-hover text-muted hover:text-foreground"
              }
            `}
          >
            #{tag}
            <span className="ml-1 opacity-60">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Content Component (uses searchParams)
// ============================================================================

function DocumentsContent({ documents, tags }: DocumentsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Sync with URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const tagParam = searchParams.get("tag");

    if (typeParam && DOCUMENT_TYPES.includes(typeParam as DocumentType)) {
      setActiveFilter(typeParam as DocumentType);
    }
    if (tagParam) {
      setActiveTag(tagParam);
    }
  }, [searchParams]);

  const filteredDocs = useMemo(
    () => filterDocuments(documents, activeFilter, activeTag, searchQuery),
    [documents, activeFilter, activeTag, searchQuery]
  );

  const handleFilterChange = useCallback((type: FilterType) => {
    setActiveFilter(type);
    // Update URL without full navigation
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (activeTag) params.set("tag", activeTag);
    router.push(`/documents${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [activeTag, router]);

  const handleTagClick = useCallback((tag: string) => {
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag);
    // Update URL
    const params = new URLSearchParams();
    if (activeFilter !== "all") params.set("type", activeFilter);
    if (newTag) params.set("tag", newTag);
    router.push(`/documents${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [activeFilter, activeTag, router]);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-10 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <TypeFilters active={activeFilter} onChange={handleFilterChange} />
      <TagFilters tags={tags} activeTag={activeTag} onTagClick={handleTagClick} />

      {/* Results count */}
      <div className="text-sm text-muted mb-4">
        {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}
        {searchQuery && ` for "${searchQuery}"`}
        {activeTag && ` tagged #${activeTag}`}
      </div>

      <DocumentList documents={filteredDocs} mode="cards" />
    </div>
  );
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getDocumentsData(): Promise<{ documents: DocumentMeta[]; tags: TagCount[] }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/documents`, {
    cache: "no-store",
  });
  if (!res.ok) return { documents: [], tags: [] };
  const data = await res.json();
  return {
    documents: data.documents || [],
    tags: data.tags || [],
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default function DocumentsPage() {
  const [data, setData] = useState<{ documents: DocumentMeta[]; tags: TagCount[] }>({
    documents: [],
    tags: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocumentsData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AppShell documents={[]} tags={[]}>
        <MobileHeader title="Documents" />
        <div className="px-4 py-6 lg:px-8 lg:py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-hover rounded w-32" />
            <div className="h-12 bg-surface-hover rounded-xl" />
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-11 w-24 bg-surface-hover rounded-full flex-shrink-0" />
              ))}
            </div>
            <div className="h-4 bg-surface-hover rounded w-24" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-surface border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-surface-hover rounded" />
                  <div className="h-3 bg-surface-hover rounded w-20" />
                </div>
                <div className="h-5 bg-surface-hover rounded w-3/4" />
                <div className="h-3 bg-surface-hover rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-surface-hover rounded-full" />
                  <div className="h-5 w-16 bg-surface-hover rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell documents={data.documents} tags={data.tags}>
      <MobileHeader title="Documents" />
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <DocumentsContent documents={data.documents} tags={data.tags} />
      </Suspense>
    </AppShell>
  );
}
