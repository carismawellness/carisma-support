"use client";

import { useState } from "react";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CEO_URL = process.env.NEXT_PUBLIC_CEO_COCKPIT_URL || "https://cockpit-run.vercel.app";

const SECTIONS = [
  { slug: "ceo", label: "CEO" },
  { slug: "sales", label: "Sales" },
  { slug: "crm", label: "CRM" },
  { slug: "finance", label: "Finance" },
  { slug: "funnel", label: "Funnel" },
  { slug: "marketing", label: "Marketing" },
  { slug: "operations", label: "Operations" },
  { slug: "hr", label: "HR" },
];

export default function BusinessPage() {
  const [section, setSection] = useState("ceo");
  const [loaded, setLoaded] = useState(false);
  const src = `${CEO_URL}/${section}`;

  const handleSectionChange = (slug: string) => {
    setLoaded(false);
    setSection(slug);
  };

  return (
    <ModuleShell
      pillarId="wealth"
      moduleSlug="business"
      decision="Group revenue €1.2M MTD, +8% YoY — full breakdown in Finance tab"
    >
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => handleSectionChange(s.slug)}
              className={cn(
                "px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors min-h-[44px]",
                s.slug === section ? "border-slate-700 text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground items-center gap-1 px-2"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div
        className="relative w-full"
        style={{ height: "clamp(420px, calc(100dvh - 280px), 1400px)" }}
      >
        <iframe
          key={src}
          src={src}
          title="CEO Cockpit"
          onLoad={() => setLoaded(true)}
          className={cn(
            "w-full h-full border border-border rounded-md bg-white transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="absolute inset-0 rounded-md" />
            <p className="relative text-xs text-muted-foreground">Loading CEO Cockpit…</p>
          </div>
        )}
      </div>

      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="sm:hidden block w-full text-center py-3 rounded-md border border-border bg-card hover:bg-accent text-sm font-medium"
      >
        Open in new tab →
      </a>

      <p className="sm:hidden text-[11px] text-muted-foreground">
        First load? You may need to sign in to CEO Cockpit once. Same Supabase account as this app.
      </p>
    </ModuleShell>
  );
}
