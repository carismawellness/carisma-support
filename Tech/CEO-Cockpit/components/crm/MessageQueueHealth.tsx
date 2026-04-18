"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import { chartColors } from "@/lib/charts/config";
import type { CrmDailyRow } from "@/lib/types/crm";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BRANDS = ["spa", "aesthetics", "slimming"] as const;

const BRAND_LABELS: Record<string, string> = {
  spa: "Spa",
  aesthetics: "Aesthetics",
  slimming: "Slimming",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function healthColor(count: number): string {
  if (count < 10) return "text-emerald-600";
  if (count <= 50) return "text-amber-500";
  return "text-red-600";
}

function healthBg(count: number): string {
  if (count < 10) return "bg-emerald-100";
  if (count <= 50) return "bg-amber-100";
  return "bg-red-100";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MessageQueueHealth({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data, loading } = useKPIData<CrmDailyRow>({
    table: "crm_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // --- Get latest day's data per brand ---
  const sortedDates = [...new Set(data.map((r) => r.date))].sort();
  const latestDate = sortedDates[sortedDates.length - 1] ?? null;
  const latestRows = latestDate
    ? data.filter((r) => r.date === latestDate)
    : [];

  // --- Brand ID -> slug mapping ---
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b === brandFilter)
    : [...BRANDS];

  const brandData = visibleBrands.map((slug) => {
    const bid = brandMap[slug];
    const rows = latestRows.filter((r) => r.brand_id === bid);

    const crmUnreplied = rows.reduce(
      (sum, r) => sum + (r.unreplied_crm ?? 0),
      0,
    );
    const waUnread = rows.reduce(
      (sum, r) => sum + (r.unreplied_whatsapp ?? 0),
      0,
    );
    const emailUnread = rows.reduce(
      (sum, r) => sum + (r.unreplied_email ?? 0),
      0,
    );

    return {
      slug,
      label: BRAND_LABELS[slug],
      crmUnreplied,
      waUnread,
      emailUnread,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {brandData.map((b) => (
        <Card
          key={b.slug}
          className="p-5 border-l-4"
          style={{
            borderLeftColor:
              chartColors[b.slug as keyof typeof chartColors] ?? "#888",
          }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            {b.label}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">CRM Unreplied</span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded ${healthColor(b.crmUnreplied)} ${healthBg(b.crmUnreplied)}`}
              >
                {b.crmUnreplied}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">
                WhatsApp Unread
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded ${healthColor(b.waUnread)} ${healthBg(b.waUnread)}`}
              >
                {b.waUnread}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Email Unread</span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded ${healthColor(b.emailUnread)} ${healthBg(b.emailUnread)}`}
              >
                {b.emailUnread}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
