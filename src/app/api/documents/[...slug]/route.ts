import { NextResponse } from "next/server";
import { getDocument } from "@/lib/documents";
import { Document } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Error response shape
 */
interface ErrorResponse {
  error: string;
}

/**
 * GET /api/documents/[...slug]
 *
 * Fetches a single document by its slug (relative path).
 * Supports nested paths like "concepts/neural-networks".
 *
 * Path Parameters:
 * - slug: Document slug (can be nested, e.g., "concepts/neural-networks")
 *
 * Returns:
 * - 200: Full Document object including content
 * - 404: Document not found
 * - 500: Server error
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<NextResponse<Document | ErrorResponse>> {
  try {
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || slug.length === 0) {
      return NextResponse.json(
        { error: "Document slug is required" },
        { status: 400 }
      );
    }

    // Join slug parts to support nested paths
    const slugPath = slug.join("/");

    // Prevent path traversal attacks
    if (slugPath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid document path" },
        { status: 400 }
      );
    }

    const document = getDocument(slugPath);

    if (!document) {
      return NextResponse.json(
        { error: `Document not found: ${slugPath}` },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[api/documents/slug] Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}
