"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { DocumentMeta, TagCount } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

interface AppShellProps {
  children: React.ReactNode;
  documents: DocumentMeta[];
  tags: TagCount[];
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Global keyboard shortcuts
 */
function useKeyboardShortcuts() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // ⌘K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }

      // G for Graph
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push("/graph");
      }

      // H for Home
      if (e.key === "h" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push("/");
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main application shell
 * - Mobile: Full-width content + bottom nav
 * - Desktop: Sidebar + main content
 */
export function AppShell({ children, documents, tags }: AppShellProps) {
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-accent focus:text-accent-foreground"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <DesktopSidebar documents={documents} tags={tags} />

      {/* Main content area */}
      <main
        id="main-content"
        className="
          min-h-screen
          pb-20 lg:pb-0
          lg:ml-64
        "
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
