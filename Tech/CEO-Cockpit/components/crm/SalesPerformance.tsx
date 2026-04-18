"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  formatCurrency,
  formatMinutes,
  formatPercent,
} from "@/lib/charts/config";
import type { CrmDailyRow } from "@/lib/types/crm";

/* ------------------------------------------------------------------ */
/*  Dummy fallback data (until real data flows)                        */
/* ------------------------------------------------------------------ */

const DUMMY_BRAND_DATA: Record<
  string,
  { totalSales: number; dailyAvg: number; depositPct: number; stlMedian: number }
> = {
  spa: { totalSales: 18420, dailyAvg: 1316, depositPct: 72.5, stlMedian: 3.2 },
  aesthetics: { totalSales: 34850, dailyAvg: 2489, depositPct: 68.1, stlMedian: 4.8 },
  slimming: { totalSales: 22100, dailyAvg: 1579, depositPct: 74.3, stlMedian: 6.1 },
};

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

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function depositColor(pct: number): string {
  if (pct >= 70) return "text-emerald-600";
  if (pct >= 50) return "text-amber-500";
  return "text-red-600";
}

function stlColor(min: number): string {
  if (min <= 3) return "text-emerald-600";
  if (min <= 5) return "text-amber-500";
  return "text-red-600";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SalesPerformance({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data: dailyData, loading } = useKPIData<CrmDailyRow>({
    table: "crm_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b === brandFilter)
    : [...BRANDS];

  const brandCards = visibleBrands.map((slug) => {
    const bid = brandMap[slug];
    const brandDaily = dailyData.filter((r) => r.brand_id === bid);
    const hasData = brandDaily.length > 0 && brandDaily.some((r) => (r.total_sales ?? 0) > 0);

    if (!hasData) {
      const dummy = DUMMY_BRAND_DATA[slug];
      return {
        slug,
        label: BRAND_LABELS[slug],
        totalSales: dummy.totalSales,
        dailyAvg: dummy.dailyAvg,
        depositPct: dummy.depositPct,
        stlMedian: dummy.stlMedian,
        isDummy: true,
      };
    }

    const totalSales = brandDaily.reduce((sum, r) => sum + (r.total_sales ?? 0), 0);
    const distinctDays = new Set(brandDaily.map((r) => r.date)).size;
    const dailyAvg = distinctDays > 0 ? totalSales / distinctDays : 0;

    // Deposit % — weighted average
    let depWeightedSum = 0;
    let depWeightTotal = 0;
    for (const r of brandDaily) {
      if (r.deposit_pct !== null && r.total_sales !== null && r.total_sales > 0) {
        depWeightedSum += r.deposit_pct * r.total_sales;
        depWeightTotal += r.total_sales;
      }
    }
    const depositPct = depWeightTotal > 0 ? depWeightedSum / depWeightTotal : 0;

    // Speed to lead — median of daily medians
    const stlValues = brandDaily
      .map((r) => r.speed_to_lead_median_min)
      .filter((v): v is number => v !== null && v > 0);
    const stlMedian = median(stlValues);

    return {
      slug,
      label: BRAND_LABELS[slug],
      totalSales,
      dailyAvg: Math.round(dailyAvg),
      depositPct,
      stlMedian,
      isDummy: false,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {brandCards.map((b) => (
        <Card
          key={b.slug}
          className="p-5 border-l-4 relative"
          style={{
            borderLeftColor:
              chartColors[b.slug as keyof typeof chartColors] ?? "#888",
          }}
        >
          {b.isDummy && (
            <span className="absolute top-2 right-3 text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">
              sample
            </span>
          )}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            {b.label}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Total Sales</span>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(b.totalSales)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Daily Average</span>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(b.dailyAvg)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Deposit %</span>
              <span className={`text-sm font-bold ${depositColor(b.depositPct)}`}>
                {formatPercent(b.depositPct)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Speed to Lead</span>
              <span className={`text-sm font-bold ${stlColor(b.stlMedian)}`}>
                {b.stlMedian > 0 ? formatMinutes(b.stlMedian) : "-"}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
