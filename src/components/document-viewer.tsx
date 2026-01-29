"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, documentTypeConfig } from "@/lib/types";
import { TypeIcon } from "./icons";
import { format } from "date-fns";
import Link from "next/link";

interface DocumentViewerProps {
  document: Document;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const typeInfo = documentTypeConfig[document.type];

  return (
    <article className="animate-fade-in">
      {/* Header */}
      <header className="mb-8 pb-8 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted mb-3">
          <TypeIcon type={document.type} size={16} />
          <span style={{ color: typeInfo.color }}>{typeInfo.label}</span>
          <span className="text-border">•</span>
          <time dateTime={document.date}>
            {format(new Date(document.date), "MMMM d, yyyy")}
          </time>
        </div>

        <h1 className="text-3xl font-bold mb-4">{document.title}</h1>

        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 bg-surface-hover hover:bg-surface-active 
                         rounded-full text-muted hover:text-foreground transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom link handling for internal links
            a: ({ href, children }) => {
              if (href?.startsWith("[[") && href?.endsWith("]]")) {
                const slug = href.slice(2, -2).toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link href={`/doc/${slug}`} className="internal-link">
                    {children}
                  </Link>
                );
              }
              if (href && !href.startsWith("http")) {
                return (
                  <Link href={`/doc/${href.replace(/\.md$/, "")}`}>
                    {children}
                  </Link>
                );
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
            // Styled code blocks
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;

              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            // Better blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent pl-4 italic text-muted">
                {children}
              </blockquote>
            ),
          }}
        >
          {document.content}
        </ReactMarkdown>
      </div>

      {/* Linked documents */}
      {document.links && document.links.length > 0 && (
        <footer className="mt-12 pt-8 border-t border-border">
          <h2 className="text-sm font-medium text-muted mb-4">Linked Documents</h2>
          <div className="flex flex-wrap gap-2">
            {document.links.map((link) => (
              <Link
                key={link}
                href={`/doc/${link}`}
                className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover 
                         border border-border rounded-lg text-sm transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
