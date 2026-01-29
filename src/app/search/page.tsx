"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MobileHeader } from "@/components/mobile-header";
import { Icons, TypeIcon } from "@/components/icons";
import { DocumentMeta, TagCount } from "@/lib/types";
import { format } from "date-fns";
import Fuse from "fuse.js";

// ============================================================================
// Types
// ============================================================================

interface SearchResult extends DocumentMeta {
  score?: number;
}

// ============================================================================
// Components
// ============================================================================

function SearchInput({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="relative">
      <Icons.Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search your brain..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        className="
          w-full pl-12 pr-12 py-4
          min-h-[56px]
          bg-surface border border-border rounded-2xl
          text-lg placeholder:text-muted
          focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
          touch-manipulation
        "
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="
            absolute right-4 top-1/2 -translate-y-1/2
            p-2 rounded-full
            hover:bg-surface-hover active:bg-surface-active
            touch-manipulation
          "
          aria-label="Clear search"
        >
          <Icons.X size={18} className="text-muted" />
        </button>
      )}
    </div>
  );
}

function SearchResultItem({ doc }: { doc: SearchResult }) {
  const formattedDate = format(new Date(doc.date), "MMM d, yyyy");

  return (
    <Link
      href={`/doc/${doc.slug}`}
      className="
        flex items-start gap-4 p-4
        bg-surface hover:bg-surface-hover active:bg-surface-active
        border border-border rounded-xl
        transition-colors touch-manipulation
      "
    >
      <TypeIcon type={doc.type} size={20} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1">{doc.title}</h3>
        {doc.excerpt && (
          <p className="text-sm text-muted line-clamp-2 mb-2">{doc.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{formattedDate}</span>
          {doc.tags.length > 0 && (
            <span className="flex gap-1">
              {doc.tags.slice(0, 2).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold mb-2">Search your brain</h2>
        <p className="text-muted text-sm">
          Find documents by title, content, or tags
        </p>
        {/* Desktop keyboard hint */}
        <p className="hidden lg:block text-muted text-xs mt-4">
          Tip: Press <kbd className="mx-1">⌘K</kbd> from anywhere to search
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-4">🤔</div>
      <h2 className="text-lg font-semibold mb-2">No results found</h2>
      <p className="text-muted text-sm">
        Try different keywords or check your spelling
      </p>
    </div>
  );
}

function RecentSearches({ onSelect }: { onSelect: (q: string) => void }) {
  // In a real app, this would come from localStorage
  const recentSearches = ["neural networks", "productivity", "insights"];

  return (
    <div className="mt-8">
      <h3 className="text-xs text-muted uppercase tracking-wider mb-3">
        Try searching for
      </h3>
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((term) => (
          <button
            key={term}
            onClick={() => onSelect(term)}
            className="
              px-3 py-2 min-h-[40px]
              bg-surface hover:bg-surface-hover active:bg-surface-active
              border border-border rounded-lg
              text-sm text-muted hover:text-foreground
              transition-colors touch-manipulation
            "
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function SearchPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
        setTags(data.tags || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Create Fuse.js instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(documents, {
      keys: [
        { name: "title", weight: 2 },
        { name: "excerpt", weight: 1 },
        { name: "tags", weight: 1.5 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [documents]);

  // Search results
  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => ({
      ...r.item,
      score: r.score,
    }));
  }, [fuse, query]);

  return (
    <AppShell documents={documents} tags={tags}>
      <MobileHeader title="Search" />

      <div className="px-4 py-6 lg:px-8 lg:py-10 animate-fade-in">
        <SearchInput value={query} onChange={setQuery} inputRef={inputRef} />

        {loading ? (
          <div className="mt-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface rounded-xl" />
            ))}
          </div>
        ) : query.trim() ? (
          results.length > 0 ? (
            <div className="mt-6">
              <div className="text-sm text-muted mb-4">
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </div>
              <div className="space-y-3 animate-stagger">
                {results.map((doc) => (
                  <SearchResultItem key={doc.slug} doc={doc} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState query={query} />
          )
        ) : (
          <>
            <EmptyState query="" />
            <RecentSearches onSelect={setQuery} />
          </>
        )}
      </div>
    </AppShell>
  );
}
