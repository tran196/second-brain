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
  Hash,
  Network,
  Command,
} from "lucide-react";
import { DocumentType } from "@/lib/types";

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
  Hash,
  Network,
  Command,
};

export function TypeIcon({ type, size = 16 }: { type: DocumentType; size?: number }) {
  const iconMap: Record<DocumentType, React.ComponentType<{ size?: number; className?: string }>> = {
    concept: Lightbulb,
    journal: BookOpen,
    insight: Sparkles,
    research: Search,
  };

  const colorMap: Record<DocumentType, string> = {
    concept: "text-violet-500",
    journal: "text-blue-500",
    insight: "text-amber-500",
    research: "text-emerald-500",
  };

  const Icon = iconMap[type];
  return <Icon size={size} className={colorMap[type]} />;
}
