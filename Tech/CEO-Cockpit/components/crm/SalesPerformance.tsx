"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { CrmDailyRow, CrmByRepRow } from "@/lib/types/crm";

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

  const { data: dailyData, loading: dailyLoading } = useKPIData<CrmDailyRow>({
    table: "crm_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: repData, loading: repLoading } = useKPIData<CrmByRepRow>({
    table: "crm_by_rep",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const loading = dailyLoading || repLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // --- Build brand ID -> slug lookup ---
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  // --- Per-brand summary cards ---
  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b === brandFilter)
    : [...BRANDS];

  const brandCards = visibleBrands.map((slug) => {
    const bid = brandMap[slug];
    const brandDaily = dailyData.filter((r) => r.brand_id === bid);
    const brandReps = repData.filter((r) => r.brand_id === bid);

    const totalSales = brandDaily.reduce(
      (sum, r) => sum + (r.total_sales ?? 0),
      0,
    );
    const distinctDays = new Set(brandDaily.map((r) => r.date)).size;
    const dailyAvg = distinctDays > 0 ? totalSales / distinctDays : 0;
    const bookings = brandDaily.reduce(
      (sum, r) => sum + (r.appointments_booked ?? 0),
      0,
    );

    // Top rep by total sales
    const repSales: Record<number, number> = {};
    for (const r of brandReps) {
      repSales[r.staff_id] = (repSales[r.staff_id] ?? 0) + (r.total_sales ?? 0);
    }
    const topRepEntry = Object.entries(repSales).sort(
      ([, a], [, b]) => b - a,
    )[0];
    const topRep = topRepEntry
      ? { id: Number(topRepEntry[0]), sales: topRepEntry[1] }
      : null;

    return {
      slug,
      label: BRAND_LABELS[slug],
      totalSales,
      dailyAvg,
      bookings,
      topRep,
    };
  });

  // --- Stacked bar chart data (daily sales by brand) ---
  const dailyByDate: Record<string, Record<string, number>> = {};
  for (const row of dailyData) {
    const d = row.date;
    if (!dailyByDate[d]) dailyByDate[d] = {};
    const slug = brandIdToSlug[row.brand_id];
    if (slug) {
      dailyByDate[d][slug] = (dailyByDate[d][slug] ?? 0) + (row.total_sales ?? 0);
    }
  }

  const chartData = Object.entries(dailyByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, brands]) => ({
      date: format(new Date(date), "MMM dd"),
      Spa: brands["spa"] ?? 0,
      Aesthetics: brands["aesthetics"] ?? 0,
      Slimming: brands["slimming"] ?? 0,
    }));

  return (
    <div className="space-y-6">
      {/* Brand Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandCards.map((b) => (
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
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Total Sales</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(b.totalSales)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Daily Average</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(Math.round(b.dailyAvg))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Top Rep</span>
                <span className="text-sm font-semibold text-foreground">
                  {b.topRep
                    ? `#${b.topRep.id} (${formatCurrency(b.topRep.sales)})`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Bookings</span>
                <span className="text-sm font-semibold text-foreground">
                  {b.bookings.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Stacked Bar Chart - Daily Sales by Brand */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Daily Sales by Brand
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend />
            {(!brandFilter || brandFilter === "spa") && (
              <Bar
                dataKey="Spa"
                stackId="sales"
                fill={chartColors.spa}
              />
            )}
            {(!brandFilter || brandFilter === "aesthetics") && (
              <Bar
                dataKey="Aesthetics"
                stackId="sales"
                fill={chartColors.aesthetics}
              />
            )}
            {(!brandFilter || brandFilter === "slimming") && (
              <Bar
                dataKey="Slimming"
                stackId="sales"
                fill={chartColors.slimming}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
