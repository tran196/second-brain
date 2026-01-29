import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getDocument, getDocuments, getAllTags } from "@/lib/documents";
import { AppShell } from "@/components/app-shell";
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
 * Full-screen reading experience on mobile
 */
export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Fetch the document
  const document = getDocument(slugPath);

  if (!document) {
    notFound();
  }

  // Fetch data for shell
  const documents = getDocuments();
  const tags = getAllTags();

  return (
    <AppShell documents={documents} tags={tags}>
      <DocumentViewer document={document} />
    </AppShell>
  );
}

// ============================================================================
// Metadata
// ============================================================================

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
