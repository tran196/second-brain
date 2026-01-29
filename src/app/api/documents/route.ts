import { NextResponse } from "next/server";
import { getDocuments, getAllTags } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const tag = searchParams.get("tag");

  let documents = getDocuments();

  if (type) {
    documents = documents.filter((doc) => doc.type === type);
  }

  if (tag) {
    documents = documents.filter((doc) => doc.tags.includes(tag));
  }

  const tags = getAllTags();

  return NextResponse.json({ documents, tags });
}
