"use client";

import {
  Lightbulb,
  BookOpen,
  Sparkles,
  Search,
  Home,
  Tag,
  Calendar,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Hash,
  Network,
  Command,
  FileText,
  Settings,
  Filter,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { DocumentType } from "@/lib/types";

// ============================================================================
// Icon Registry
// ============================================================================

/**
 * Centralized icon exports for consistent usage across the app
 * Using Lucide React for modern, consistent iconography
 */
export const Icons = {
  Lightbulb,
  BookOpen,
  Sparkles,
  Search,
  Home,
  Tag,
  Calendar,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Hash,
  Network,
  Command,
  FileText,
  Settings,
  Filter,
  ArrowLeft,
} as const;

// ============================================================================
// Type-specific Icons
// ============================================================================

/** Map of document types to their icons */
const typeIconMap: Record<DocumentType, LucideIcon> = {
  concept: Lightbulb,
  journal: BookOpen,
  insight: Sparkles,
  research: Search,
};

/** Map of document types to their colors */
const typeColorMap: Record<DocumentType, string> = {
  concept: "text-violet-500",
  journal: "text-blue-500",
  insight: "text-amber-500",
  research: "text-emerald-500",
};

// ============================================================================
// Components
// ============================================================================

interface TypeIconProps {
  /** Document type to get icon for */
  type: DocumentType;
  /** Icon size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Renders the appropriate icon for a document type with color
 * Icons are visually decorative, so they're hidden from screen readers
 */
export function TypeIcon({ type, size = 16, className = "" }: TypeIconProps) {
  const Icon = typeIconMap[type];
  const colorClass = typeColorMap[type];

  return (
    <Icon
      size={size}
      className={`${colorClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
