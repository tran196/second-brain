import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getDocument, getDocuments, getAllTags } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { DocumentViewer } from "@/components/document-viewer";

export const dynamic = "force-dynamic";

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * Document detail page
 * Displays a single document with full content, metadata, and linked documents
 */
export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Fetch the document
  const document = getDocument(slugPath);

  // Return 404 if document not found
  if (!document) {
    notFound();
  }

  // Fetch sidebar data
  const documents = getDocuments();
  const tags = getAllTags();

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <DocumentViewer document={document} />
    </LayoutWrapper>
  );
}

// ============================================================================
// Metadata
// ============================================================================

/**
 * Generate dynamic metadata for SEO and social sharing
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const document = getDocument(slugPath);

  if (!document) {
    return {
      title: "Not Found | Second Brain",
      description: "The requested document could not be found.",
    };
  }

  return {
    title: `${document.title} | Second Brain`,
    description: document.excerpt || `${document.title} - ${document.type} document`,
    openGraph: {
      title: document.title,
      description: document.excerpt,
      type: "article",
      publishedTime: document.date,
      tags: document.tags,
    },
  };
}
