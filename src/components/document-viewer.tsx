"use client";

import { useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Document, documentTypeConfig } from "@/lib/types";
import { TypeIcon, Icons } from "./icons";
import { MobileHeader } from "./mobile-header";
import { format } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface DocumentViewerProps {
  document: Document;
}

// ============================================================================
// Markdown Components
// ============================================================================

function createMarkdownComponents(): Components {
  return {
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

      // External links
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
        {children}
      </blockquote>
    ),

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
  const formattedDate = format(new Date(document.date), "MMMM d, yyyy");

  return (
    <header className="mb-8 pb-6 border-b border-border">
      {/* Type badge and date */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
        >
          <TypeIcon type={document.type} size={12} />
          {typeInfo.label}
        </span>
        <span className="text-muted">•</span>
        <time dateTime={document.date} className="text-muted">
          {formattedDate}
        </time>
      </div>

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">
        {document.title}
      </h1>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {document.tags.map((tag) => (
            <Link
              key={tag}
              href={`/documents?tag=${encodeURIComponent(tag)}`}
              className="
                text-xs px-3 py-1.5 min-h-[32px]
                bg-surface-hover hover:bg-surface-active
                rounded-full text-muted hover:text-foreground
                transition-colors touch-manipulation
                flex items-center
              "
            >
              #{tag}
            </Link>
          ))}
        </div>
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
      <h2 className="text-sm font-semibold text-muted mb-4 flex items-center gap-2">
        <Icons.Network size={14} />
        Linked Documents
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link}
            href={`/doc/${link}`}
            className="
              flex items-center gap-2
              px-4 py-3 min-h-[48px]
              bg-surface hover:bg-surface-hover active:bg-surface-active
              border border-border rounded-xl
              text-sm transition-colors touch-manipulation
            "
          >
            {formatLinkLabel(link)}
            <Icons.ChevronRight size={14} className="text-muted" />
          </Link>
        ))}
      </div>
    </footer>
  );
}

function formatLinkLabel(slug: string): string {
  const parts = slug.split("/");
  const name = parts[parts.length - 1];
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Full document viewer with mobile-first design
 * Optimized reading experience on all devices
 */
export function DocumentViewer({ document }: DocumentViewerProps) {
  const components = useMemo(() => createMarkdownComponents(), []);

  return (
    <>
      {/* Mobile header with back button */}
      <MobileHeader
        title={document.title}
        showBack
        backUrl="/documents"
      />

      <article className="px-4 py-6 lg:px-8 lg:py-10 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <DocumentHeader document={document} />

          {/* Main content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {document.content}
            </ReactMarkdown>
          </div>

          {/* Linked documents */}
          {document.links && <LinkedDocuments links={document.links} />}
        </div>
      </article>
    </>
  );
}
