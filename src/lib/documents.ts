import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Document, DocumentMeta, DocumentType, GraphData, TagCount } from "./types";

/**
 * Brain folder location - configurable via BRAIN_PATH env variable
 * Defaults to ~/clawd/brain/
 */
const BRAIN_PATH = process.env.BRAIN_PATH || path.join(process.env.HOME || "", "clawd", "brain");

/**
 * Frontmatter schema expected in markdown files
 */
interface Frontmatter {
  title?: string;
  type?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
}

/**
 * Recursively finds all markdown files in a directory
 * @param dir - Directory to search
 * @param files - Accumulator array (used internally for recursion)
 * @returns Array of absolute file paths
 */
function getAllMarkdownFiles(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extracts internal document links from markdown content
 * Supports both [[wiki-style]] and [text](relative-path) formats
 * @param content - Raw markdown content
 * @returns Array of unique slugs referenced in the content
 */
function extractLinks(content: string): string[] {
  const wikiLinkPattern = /\[\[([^\]]+)\]\]/g;
  const mdLinkPattern = /\[([^\]]+)\]\((?!http)([^)]+)\)/g;

  const links: string[] = [];

  // Extract wiki-style links: [[Some Document]]
  let match: RegExpExecArray | null;
  while ((match = wikiLinkPattern.exec(content)) !== null) {
    const slug = match[1].toLowerCase().replace(/\s+/g, "-");
    links.push(slug);
  }

  // Extract relative markdown links: [text](path/to/doc)
  while ((match = mdLinkPattern.exec(content)) !== null) {
    const href = match[2].replace(/\.md$/, "");
    links.push(href);
  }

  // Return unique links only
  return [...new Set(links)];
}

/**
 * Generates a plain-text excerpt from markdown content
 * Strips formatting and truncates to maxLength
 * @param content - Raw markdown content
 * @param maxLength - Maximum excerpt length (default 160)
 * @returns Plain text excerpt with ellipsis if truncated
 */
function generateExcerpt(content: string, maxLength = 160): string {
  const plain = content
    .replace(/^#+\s+.+$/gm, "") // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/[*_`~]/g, "") // Remove formatting chars
    .replace(/\n+/g, " ") // Collapse newlines
    .trim();

  if (plain.length <= maxLength) return plain;

  // Truncate at word boundary
  const truncated = plain.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "…";
}

/**
 * Validates and normalizes document type from frontmatter
 * @param type - Raw type string from frontmatter
 * @returns Valid DocumentType or default "insight"
 */
function normalizeDocumentType(type: string | undefined): DocumentType {
  const validTypes: DocumentType[] = ["concept", "journal", "insight", "research"];
  if (type && validTypes.includes(type as DocumentType)) {
    return type as DocumentType;
  }
  return "insight";
}

/**
 * Parses a single markdown file into DocumentMeta
 * @param filePath - Absolute path to the markdown file
 * @returns DocumentMeta object or null if parsing fails
 */
function parseDocument(filePath: string): DocumentMeta | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as Frontmatter;

    const relativePath = path.relative(BRAIN_PATH, filePath);
    const slug = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");
    const fileName = path.basename(filePath, ".md");

    // Get file stats for fallback date
    const stats = fs.statSync(filePath);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];

    return {
      slug,
      title: frontmatter.title || fileName.replace(/-/g, " "),
      type: normalizeDocumentType(frontmatter.type),
      date: frontmatter.date || fallbackDate,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      excerpt: frontmatter.excerpt || generateExcerpt(content),
      links: extractLinks(content),
    };
  } catch (error) {
    console.error(`[documents] Failed to parse ${filePath}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Retrieves all documents from the brain folder
 * Documents are sorted by date (newest first)
 * @returns Array of DocumentMeta objects
 */
export function getDocuments(): DocumentMeta[] {
  const files = getAllMarkdownFiles(BRAIN_PATH);
  const documents: DocumentMeta[] = [];

  for (const filePath of files) {
    const doc = parseDocument(filePath);
    if (doc) {
      documents.push(doc);
    }
  }

  // Sort by date, newest first
  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Retrieves a single document by slug, including full content
 * @param slug - Document slug (relative path without .md extension)
 * @returns Full Document object or null if not found
 */
export function getDocument(slug: string): Document | null {
  const filePath = path.join(BRAIN_PATH, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as Frontmatter;

    const fileName = path.basename(filePath, ".md");
    const stats = fs.statSync(filePath);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];

    return {
      slug,
      title: frontmatter.title || fileName.replace(/-/g, " "),
      type: normalizeDocumentType(frontmatter.type),
      date: frontmatter.date || fallbackDate,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      excerpt: frontmatter.excerpt || generateExcerpt(content),
      links: extractLinks(content),
      content,
    };
  } catch (error) {
    console.error(`[documents] Failed to read ${slug}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Retrieves documents filtered by type
 * @param type - Document type to filter by
 * @returns Array of matching DocumentMeta objects
 */
export function getDocumentsByType(type: DocumentType): DocumentMeta[] {
  return getDocuments().filter((doc) => doc.type === type);
}

/**
 * Retrieves documents filtered by tag
 * @param tag - Tag to filter by
 * @returns Array of matching DocumentMeta objects
 */
export function getDocumentsByTag(tag: string): DocumentMeta[] {
  return getDocuments().filter((doc) => doc.tags.includes(tag));
}

/**
 * Retrieves all unique tags with their usage counts
 * Sorted by count (most used first)
 * @returns Array of TagCount objects
 */
export function getAllTags(): TagCount[] {
  const tagCounts = new Map<string, number>();

  for (const doc of getDocuments()) {
    for (const tag of doc.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generates graph data for visualization
 * Nodes represent documents, edges represent links between them
 * Only includes edges where both source and target exist
 * @returns GraphData with nodes and edges arrays
 */
export function getGraphData(): GraphData {
  const docs = getDocuments();
  const slugSet = new Set(docs.map((d) => d.slug));

  const nodes = docs.map((doc) => ({
    id: doc.slug,
    type: doc.type,
  }));

  const edges: GraphData["edges"] = [];

  for (const doc of docs) {
    if (doc.links) {
      for (const link of doc.links) {
        // Only add edge if target document exists
        if (slugSet.has(link)) {
          edges.push({ source: doc.slug, target: link });
        }
      }
    }
  }

  return { nodes, edges };
}
