"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "./icons";

// ============================================================================
// Types
// ============================================================================

interface MobileHeaderProps {
  /** Page title */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Custom back URL (defaults to browser back) */
  backUrl?: string;
  /** Right-side action */
  action?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Mobile sticky header
 * Clean, minimal design inspired by native iOS apps
 * Hidden on desktop (lg:hidden)
 */
export function MobileHeader({ title = "Second Brain", showBack = false, backUrl, action }: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-background/80 backdrop-blur-xl backdrop-saturate-150
        border-b border-border/50
        lg:hidden
      "
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or logo */}
        {showBack ? (
          <button
            onClick={handleBack}
            className="
              flex items-center justify-center
              w-10 h-10 -ml-2
              rounded-full
              hover:bg-surface-hover active:bg-surface-active
              transition-colors touch-manipulation
            "
            aria-label="Go back"
          >
            <Icons.ChevronLeft size={24} />
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <Icons.Network size={20} className="text-accent" />
          </Link>
        )}

        {/* Center: Title */}
        <h1 className="font-semibold text-base truncate max-w-[60%]">
          {title}
        </h1>

        {/* Right: Action or spacer */}
        <div className="w-10 h-10 flex items-center justify-center">
          {action}
        </div>
      </div>
    </header>
  );
}
