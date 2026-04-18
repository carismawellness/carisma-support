"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import { LeadReconRow } from "@/lib/types/crm";
import { chartColors } from "@/lib/charts/config";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BRANDS = [
  { slug: "spa", label: "Spa" },
  { slug: "aesthetics", label: "Aesthetics" },
  { slug: "slimming", label: "Slimming" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadReconciliation({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data, loading } = useKPIData<LeadReconRow>({
    table: "crm_lead_reconciliation",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="animate-pulse text-text-secondary">Loading...</div>
    );
  }

  // Build brand_id -> slug lookup
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  // --- Per-brand summaries ---
  const brandTotals: Record<
    string,
    { crmLeads: number; metaLeads: number; delta: number }
  > = {};

  for (const brand of BRANDS) {
    brandTotals[brand.slug] = { crmLeads: 0, metaLeads: 0, delta: 0 };
  }

  for (const row of data) {
    const slug = brandIdToSlug[row.brand_id];
    if (slug && brandTotals[slug]) {
      brandTotals[slug].crmLeads += row.leads_crm;
      brandTotals[slug].metaLeads += row.leads_meta;
      brandTotals[slug].delta += row.delta;
    }
  }

  // --- Alert: days with delta > 5 ---
  const daysOverThreshold = data.filter((r) => Math.abs(r.delta) > 5).length;
  const uniqueDaysOver = new Set(
    data.filter((r) => Math.abs(r.delta) > 5).map((r) => r.date)
  ).size;

  // --- Daily trend chart data ---
  const dailyByDate: Record<
    string,
    { crm: number; meta: number; delta: number }
  > = {};

  for (const row of data) {
    if (!dailyByDate[row.date]) {
      dailyByDate[row.date] = { crm: 0, meta: 0, delta: 0 };
    }
    dailyByDate[row.date].crm += row.leads_crm;
    dailyByDate[row.date].meta += row.leads_meta;
    dailyByDate[row.date].delta += row.delta;
  }

  const trendData = Object.entries(dailyByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: format(new Date(date), "MMM dd"),
      "CRM Leads": vals.crm,
      "Meta Leads": vals.meta,
      Delta: vals.delta,
    }));

  // Visible brands for summary cards
  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b.slug === brandFilter)
    : BRANDS;

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {uniqueDaysOver > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Sync issue detected:</span>{" "}
          {uniqueDaysOver} day{uniqueDaysOver !== 1 ? "s" : ""} with delta &gt; 5
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleBrands.map((brand) => {
          const totals = brandTotals[brand.slug];
          const delta = totals.delta;
          let deltaColor = "text-emerald-600";
          let deltaLabel = "Synced";
          if (delta > 0) {
            deltaColor = "text-amber-600";
            deltaLabel = "Missing in CRM";
          } else if (delta < 0) {
            deltaColor = "text-red-600";
            deltaLabel = "Orphaned";
          }

          return (
            <Card
              key={brand.slug}
              className="p-5 border-l-4"
              style={{
                borderLeftColor:
                  chartColors[brand.slug as keyof typeof chartColors] ?? "#888",
              }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
                {brand.label}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">CRM Leads</span>
                  <span className="text-sm font-semibold text-foreground">
                    {totals.crmLeads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Meta Leads</span>
                  <span className="text-sm font-semibold text-foreground">
                    {totals.metaLeads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Delta</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${deltaColor}`}>
                      {delta > 0 ? "+" : ""}
                      {delta}
                    </span>
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded ${
                        delta === 0
                          ? "bg-emerald-100 text-emerald-700"
                          : delta > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {deltaLabel}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily trend chart */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Daily Lead Reconciliation
        </h3>
        {trendData.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">
            No data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="#9CA3AF" />
              <Bar dataKey="CRM Leads" fill={chartColors.aesthetics} />
              <Bar dataKey="Meta Leads" fill={chartColors.spa} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
