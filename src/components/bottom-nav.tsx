"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
  matchPaths?: string[];
}

// ============================================================================
// Constants
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "Home", matchPaths: ["/"] },
  { href: "/documents", label: "Docs", icon: "FileText", matchPaths: ["/documents", "/doc"] },
  { href: "/search", label: "Search", icon: "Search", matchPaths: ["/search"] },
  { href: "/graph", label: "Graph", icon: "Network", matchPaths: ["/graph"] },
];

// ============================================================================
// Components
// ============================================================================

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
}

function NavButton({ item, isActive }: NavButtonProps) {
  const Icon = Icons[item.icon];

  return (
    <Link
      href={item.href}
      className={`
        flex flex-col items-center justify-center gap-1 flex-1 py-2
        min-h-[56px] touch-manipulation transition-all duration-200
        relative
        ${isActive 
          ? "text-accent" 
          : "text-muted hover:text-foreground active:text-foreground"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute top-1.5 w-1 h-1 rounded-full bg-accent" />
      )}
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  );
}

/**
 * Bottom navigation bar for mobile
 * Hidden on desktop (lg:hidden)
 */
export function BottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => 
        path === "/" ? pathname === "/" : pathname.startsWith(path)
      );
    }
    return pathname === item.href;
  };

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-background/80 backdrop-blur-xl backdrop-saturate-150
        border-t border-border/50
        safe-area-bottom
        lg:hidden
      "
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}
      </div>
    </nav>
  );
}
