"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/nav/sidebar";
import { PILLARS } from "@/lib/pillars";

/**
 * Responsive shell. Desktop: persistent sidebar. Mobile (<lg): hamburger
 * triggers a slide-out drawer with a sticky top bar showing brand + active
 * pillar context.
 */
export function NavShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const activePillar = PILLARS.find((p) => pathname.startsWith(`/${p.id}`));

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar (visible at lg+) */}
      <Sidebar />

      {/* Mobile drawer (rendered always, animates in/out) */}
      <Sidebar isMobile open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar — sticky, only shown <lg */}
        <header className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2 px-3 h-14">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-2 rounded-md hover:bg-accent active:bg-accent inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="font-semibold tracking-tight">Life Cockpit</span>
              {activePillar && (
                <span className="text-[11px] text-muted-foreground truncate">· {activePillar.name}</span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 lg:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
