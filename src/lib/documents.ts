import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Document, DocumentMeta, DocumentType } from "./types";

// Brain folder location - can be configured via env
const BRAIN_PATH = process.env.BRAIN_PATH || path.join(process.env.HOME || "", "clawd", "brain");

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

function extractLinks(content: string): string[] {
  // Match [[wiki-style links]] and standard markdown [text](slug) links
  const wikiLinks = content.match(/\[\[([^\]]+)\]\]/g) || [];
  const mdLinks = content.match(/\[([^\]]+)\]\((?!http)([^)]+)\)/g) || [];

  const links: string[] = [];

  wikiLinks.forEach((link) => {
    const slug = link.replace(/\[\[|\]\]/g, "").toLowerCase().replace(/\s+/g, "-");
    links.push(slug);
  });

  mdLinks.forEach((link) => {
    const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      links.push(match[2].replace(/\.md$/, ""));
    }
  });

  return [...new Set(links)];
}

function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting for excerpt
  const plain = content
    .replace(/^#+\s+.+$/gm, "") // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
    .replace(/[*_`~]/g, "") // Remove formatting chars
    .replace(/\n+/g, " ") // Collapse newlines
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function getDocuments(): DocumentMeta[] {
  const files = getAllMarkdownFiles(BRAIN_PATH);
  const documents: DocumentMeta[] = [];

  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const relativePath = path.relative(BRAIN_PATH, filePath);
      const slug = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");

      documents.push({
        slug,
        title: data.title || path.basename(filePath, ".md").replace(/-/g, " "),
        type: (data.type as DocumentType) || "insight",
        date: data.date || fs.statSync(filePath).mtime.toISOString().split("T")[0],
        tags: data.tags || [],
        excerpt: data.excerpt || generateExcerpt(content),
        links: extractLinks(content),
      });
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
  }

  // Sort by date, newest first
  return documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getDocument(slug: string): Document | null {
  const filePath = path.join(BRAIN_PATH, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || path.basename(filePath, ".md").replace(/-/g, " "),
      type: (data.type as DocumentType) || "insight",
      date: data.date || fs.statSync(filePath).mtime.toISOString().split("T")[0],
      tags: data.tags || [],
      excerpt: data.excerpt || generateExcerpt(content),
      links: extractLinks(content),
      content,
    };
  } catch (error) {
    console.error(`Error reading document ${slug}:`, error);
    return null;
  }
}

export function getDocumentsByType(type: DocumentType): DocumentMeta[] {
  return getDocuments().filter((doc) => doc.type === type);
}

export function getDocumentsByTag(tag: string): DocumentMeta[] {
  return getDocuments().filter((doc) => doc.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();

  getDocuments().forEach((doc) => {
    doc.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGraphData(): { nodes: { id: string; type: DocumentType }[]; edges: { source: string; target: string }[] } {
  const docs = getDocuments();
  const slugSet = new Set(docs.map((d) => d.slug));

  const nodes = docs.map((doc) => ({
    id: doc.slug,
    type: doc.type,
  }));

  const edges: { source: string; target: string }[] = [];

  docs.forEach((doc) => {
    doc.links?.forEach((link) => {
      if (slugSet.has(link)) {
        edges.push({ source: doc.slug, target: link });
      }
    });
  });

  return { nodes, edges };
}
