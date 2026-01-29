import { notFound } from "next/navigation";
import { getDocument, getDocuments, getAllTags } from "@/lib/documents";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { DocumentViewer } from "@/components/document-viewer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const document = getDocument(slugPath);

  if (!document) {
    notFound();
  }

  const documents = getDocuments();
  const tags = getAllTags();

  return (
    <LayoutWrapper documents={documents} tags={tags}>
      <DocumentViewer document={document} />
    </LayoutWrapper>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const document = getDocument(slugPath);

  if (!document) {
    return { title: "Not Found" };
  }

  return {
    title: `${document.title} | Second Brain`,
    description: document.excerpt,
  };
}
