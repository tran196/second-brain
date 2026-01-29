import { NextResponse } from "next/server";
import { getDocuments, getAllTags } from "@/lib/documents";
import { DocumentMeta, DocumentType, DOCUMENT_TYPES, TagCount } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Response shape for the documents API
 */
interface DocumentsResponse {
  documents: DocumentMeta[];
  tags: TagCount[];
}

/**
 * Error response shape
 */
interface ErrorResponse {
  error: string;
}

/**
 * Validates if a string is a valid DocumentType
 */
function isValidDocumentType(type: string): type is DocumentType {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}

/**
 * GET /api/documents
 *
 * Fetches all documents with optional filtering by type and/or tag.
 *
 * Query Parameters:
 * - type: Filter by document type (concept, journal, insight, research)
 * - tag: Filter by tag name
 *
 * Returns: { documents: DocumentMeta[], tags: TagCount[] }
 */
export async function GET(
  request: Request
): Promise<NextResponse<DocumentsResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const tagParam = searchParams.get("tag");

    // Validate type parameter if provided
    if (typeParam && !isValidDocumentType(typeParam)) {
      return NextResponse.json(
        { error: `Invalid type: ${typeParam}. Valid types: ${DOCUMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    let documents = getDocuments();

    // Apply type filter
    if (typeParam) {
      documents = documents.filter((doc) => doc.type === typeParam);
    }

    // Apply tag filter
    if (tagParam) {
      documents = documents.filter((doc) => doc.tags.includes(tagParam));
    }

    const tags = getAllTags();

    return NextResponse.json({ documents, tags });
  } catch (error) {
    console.error("[api/documents] Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
