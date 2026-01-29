"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Icons } from "./icons";
import { DocumentMeta } from "@/lib/types";

interface LayoutWrapperProps {
  children: React.ReactNode;
  documents: DocumentMeta[];
  tags: { tag: string; count: number }[];
}

function LayoutWrapperInner({ children, documents, tags }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ⌘K for search focus
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Search"]'
      );
      if (searchInput) {
        setSidebarOpen(true);
        setTimeout(() => searchInput.focus(), 100);
      }
    }
    // Escape to close sidebar
    if (e.key === "Escape") {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        documents={documents}
        tags={tags}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border lg:hidden">
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-surface-hover rounded-lg"
            >
              <Icons.Menu size={20} />
            </button>
            <span className="font-semibold">Second Brain</span>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LayoutWrapper(props: LayoutWrapperProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LayoutWrapperInner {...props} />
    </Suspense>
  );
}
