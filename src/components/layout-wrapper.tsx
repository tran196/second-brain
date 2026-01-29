"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Icons } from "./icons";
import { DocumentMeta, TagCount } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface LayoutWrapperProps {
  /** Page content */
  children: React.ReactNode;
  /** All documents for sidebar */
  documents: DocumentMeta[];
  /** Tags with counts for sidebar filter */
  tags: TagCount[];
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for handling keyboard shortcuts
 * Currently supports: ⌘K for search focus, Escape to close sidebar
 */
function useKeyboardShortcuts(
  onOpenSidebar: () => void,
  onCloseSidebar: () => void
): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenSidebar();

        // Focus the search input after sidebar opens
        requestAnimationFrame(() => {
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"]'
          );
          searchInput?.focus();
        });
      }

      // Escape to close sidebar
      if (e.key === "Escape") {
        onCloseSidebar();
      }
    },
    [onOpenSidebar, onCloseSidebar]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================================================
// Sub-components
// ============================================================================

interface MobileHeaderProps {
  onMenuClick: () => void;
}

function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border lg:hidden">
      <div className="flex items-center gap-4 px-4 h-14">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-hover rounded-lg"
          aria-label="Open navigation menu"
        >
          <Icons.Menu size={20} aria-hidden />
        </button>
        <span className="font-semibold">Second Brain</span>
      </div>
    </header>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted">Loading...</div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function LayoutWrapperContent({ children, documents, tags }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Set up keyboard shortcuts
  useKeyboardShortcuts(openSidebar, closeSidebar);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-accent focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <Sidebar
        documents={documents}
        tags={tags}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader onMenuClick={openSidebar} />

        {/* Main content */}
        <main id="main-content" className="flex-1">
          <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Main layout wrapper with sidebar navigation
 * Handles responsive sidebar, keyboard shortcuts, and content layout
 * Wrapped in Suspense for useSearchParams compatibility
 */
export function LayoutWrapper(props: LayoutWrapperProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LayoutWrapperContent {...props} />
    </Suspense>
  );
}
