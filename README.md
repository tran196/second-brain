# Second Brain

A personal knowledge management system built with Next.js. Displays interconnected markdown documents with Obsidian-like linking and a Linear-inspired dark UI.

## Features

- 📝 **Markdown-native** — Documents stored as `.md` files with YAML frontmatter
- 🔗 **Wiki-style linking** — Connect documents with `[[slug]]` syntax
- 🎨 **Dark mode** — Linear/Apple-inspired aesthetic
- 🔍 **Search** — Quick search with `⌘K`
- 🏷️ **Tags & Filtering** — Filter by document type or tags
- 📊 **Graph view** — Visualize document connections
- ⚡ **Fast** — Server-side rendering with hot reload

## Document Types

| Type | Purpose | Icon |
|------|---------|------|
| **Concept** | Deep technical explorations | 💡 |
| **Journal** | Daily entries and reflections | 📖 |
| **Insight** | Quick observations | ✨ |
| **Research** | Comparative analyses | 🔍 |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Document Structure

Documents live in `~/clawd/brain/` with this structure:

```
brain/
├── concepts/           # Deep explorations
├── journal/            # Daily entries (YYYY-MM-DD.md)
├── insights/           # Quick observations
└── research/           # Investigations
```

### Frontmatter Format

```yaml
---
title: "Document Title"
type: concept|journal|insight|research
date: 2025-01-28
tags: [tag1, tag2]
---
```

## Configuration

Set `BRAIN_PATH` environment variable to customize the documents folder:

```bash
BRAIN_PATH=/path/to/brain npm run dev
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: gray-matter + react-markdown
- **Search**: Fuse.js (client-side fuzzy search)

## License

MIT
