"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, LayoutDashboard, X } from "lucide-react";
import { PILLARS, type PillarId } from "@/lib/pillars";
import { cn } from "@/lib/utils";

const PILLAR_ACCENT: Record<PillarId, string> = {
  health: "text-emerald-600",
  wealth: "text-slate-600",
  love: "text-pink-600",
};

export function Sidebar({
  open = false,
  onClose,
  isMobile = false,
}: {
  open?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const initialExpanded = (): Set<PillarId> => {
    const s = new Set<PillarId>();
    for (const p of PILLARS) {
      if (pathname.startsWith(`/${p.id}`)) s.add(p.id);
    }
    if (s.size === 0) s.add("health");
    return s;
  };
  const [expanded, setExpanded] = useState<Set<PillarId>>(initialExpanded);

  // Close drawer on route change (mobile only)
  useEffect(() => {
    if (isMobile && open && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while drawer open on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobile, open]);

  const toggle = (id: PillarId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const linkBase =
    "flex items-center gap-2 px-3 rounded-md hover:bg-sidebar-accent transition-colors";
  const moduleLinkBase =
    "flex items-center gap-2 px-2 rounded-md text-xs hover:bg-sidebar-accent transition-colors";

  // Sizing — mobile uses a touch-friendly 44px row, desktop is denser.
  const rowPad = isMobile ? "py-3" : "py-2";
  const moduleRowPad = isMobile ? "py-2.5" : "py-1.5";

  const content = (
    <>
      <div className={cn("p-4 border-b border-border flex items-center justify-between")}>
        <Link href="/" className="block">
          <div className="font-semibold text-base tracking-tight">Life Cockpit</div>
          <div className="text-[11px] text-muted-foreground">Health · Wealth · Love</div>
        </Link>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 rounded-md hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="p-2 text-sm">
        <Link href="/" className={cn(linkBase, rowPad, pathname === "/" && "bg-sidebar-accent font-medium")}>
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          <span>Today</span>
        </Link>

        <div className="mt-3 space-y-1">
          {PILLARS.map((pillar) => {
            const isExpanded = expanded.has(pillar.id);
            const Icon = isExpanded ? ChevronDown : ChevronRight;
            const isActive = pathname.startsWith(`/${pillar.id}`);
            return (
              <div key={pillar.id}>
                <button
                  type="button"
                  onClick={() => toggle(pillar.id)}
                  className={cn(linkBase, rowPad, "w-full text-left", isActive && "font-medium")}
                  aria-expanded={isExpanded}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className={cn("flex-1", PILLAR_ACCENT[pillar.id])}>{pillar.name}</span>
                  <span className="text-[10px] text-muted-foreground">{pillar.modules.length}</span>
                </button>

                {isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    <Link
                      href={`/${pillar.id}`}
                      className={cn(
                        moduleLinkBase,
                        moduleRowPad,
                        "text-muted-foreground",
                        pathname === `/${pillar.id}` && "bg-sidebar-accent text-foreground font-medium"
                      )}
                    >
                      Overview
                    </Link>
                    {pillar.modules.map((m) => {
                      const href = `/${pillar.id}/${m.slug}`;
                      const isOn = pathname === href || pathname.startsWith(`${href}/`);
                      const M = m.icon;
                      return (
                        <Link
                          key={m.id}
                          href={href}
                          className={cn(
                            moduleLinkBase,
                            moduleRowPad,
                            isOn ? "bg-sidebar-accent text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          <M className="h-3 w-3 shrink-0" />
                          <span className="truncate">{m.name}</span>
                          {m.hero && (
                            <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-600">★</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div
          aria-hidden
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity lg:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        />
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-dvh w-72 max-w-[85vw] bg-sidebar border-r border-border overflow-y-auto",
            "transition-transform duration-200 ease-out lg:hidden",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-sidebar h-dvh sticky top-0 overflow-y-auto">
      {content}
    </aside>
  );
}
