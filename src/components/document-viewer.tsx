"use client";

import { useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, documentTypeConfig } from "@/lib/types";
import { TypeIcon } from "./icons";
import { format } from "date-fns";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface DocumentViewerProps {
  /** Full document to display */
  document: Document;
}

// ============================================================================
// Custom Markdown Components
// ============================================================================

/**
 * Creates custom React components for markdown rendering
 * Handles internal links, code blocks, and blockquotes
 */
function createMarkdownComponents(): Components {
  return {
    // Custom link handling for internal and external links
    a: ({ href, children }) => {
      // Wiki-style links: [[document-name]]
      if (href?.startsWith("[[") && href?.endsWith("]]")) {
        const slug = href.slice(2, -2).toLowerCase().replace(/\s+/g, "-");
        return (
          <Link href={`/doc/${slug}`} className="internal-link">
            {children}
          </Link>
        );
      }

      // Relative internal links
      if (href && !href.startsWith("http") && !href.startsWith("mailto:")) {
        const cleanHref = href.replace(/\.md$/, "");
        return <Link href={`/doc/${cleanHref}`}>{children}</Link>;
      }

      // External links - open in new tab
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },

    // Enhanced blockquotes with accent border
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        {children}
      </blockquote>
    ),

    // Code blocks - prose styles handle most of it
    code: ({ className, children, ...props }) => (
      <code className={className} {...props}>
        {children}
      </code>
    ),
  };
}

// ============================================================================
// Sub-components
// ============================================================================

interface DocumentHeaderProps {
  document: Document;
}

function DocumentHeader({ document }: DocumentHeaderProps) {
  const typeInfo = documentTypeConfig[document.type];

  const formattedDate = useMemo(
    () => format(new Date(document.date), "MMMM d, yyyy"),
    [document.date]
  );

  return (
    <header className="mb-8 pb-8 border-b border-border">
      {/* Type and date */}
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <TypeIcon type={document.type} size={16} />
        <span style={{ color: typeInfo.color }}>{typeInfo.label}</span>
        <span className="text-border" aria-hidden="true">•</span>
        <time dateTime={document.date}>{formattedDate}</time>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{document.title}</h1>

      {/* Tags */}
      {document.tags.length > 0 && (
        <nav aria-label="Document tags">
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {document.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-2 py-1 bg-surface-hover hover:bg-surface-active 
                           rounded-full text-muted hover:text-foreground transition-colors inline-block"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

interface LinkedDocumentsProps {
  links: string[];
}

function LinkedDocuments({ links }: LinkedDocumentsProps) {
  if (links.length === 0) return null;

  return (
    <footer className="mt-12 pt-8 border-t border-border">
      <h2 className="text-sm font-medium text-muted mb-4">Linked Documents</h2>
      <nav aria-label="Linked documents">
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {links.map((link) => (
            <li key={link}>
              <Link
                href={`/doc/${link}`}
                className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover 
                         border border-border rounded-lg text-sm transition-colors"
              >
                {formatLinkLabel(link)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}

/**
 * Formats a slug into a human-readable label
 * e.g., "concepts/neural-networks" -> "neural-networks"
 */
function formatLinkLabel(slug: string): string {
  const parts = slug.split("/");
  return parts[parts.length - 1];
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Renders a full document with header, markdown content, and linked documents
 * Supports custom markdown extensions like wiki-style links
 */
export function DocumentViewer({ document }: DocumentViewerProps) {
  // Memoize markdown components to prevent recreation on each render
  const components = useMemo(() => createMarkdownComponents(), []);

  return (
    <article className="animate-fade-in" aria-labelledby="document-title">
      <DocumentHeader document={document} />

      {/* Main content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {document.content}
        </ReactMarkdown>
      </div>

      {/* Linked documents */}
      {document.links && <LinkedDocuments links={document.links} />}
    </article>
  );
}
