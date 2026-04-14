"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { FreshnessIndicator } from "@/components/dashboard/FreshnessIndicator";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { RevenueForecast } from "@/components/dashboard/RevenueForecast";
import { AddAnnotationDialog } from "@/components/dashboard/AddAnnotationDialog";
import { AnnotationMarkers } from "@/components/dashboard/AnnotationMarkers";
import { ExportMenu } from "@/components/dashboard/ExportMenu";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency, formatPercent, formatMinutes } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useAnnotations } from "@/lib/hooks/useAnnotations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

/* ── Mock fallbacks ────────────────────────────────────────── */

const mockKpis: KPIData[] = [
  { label: "Total Revenue", value: "€42,350", trend: 8, trendMoM: 12, target: "€45,000", targetValue: 45000, currentValue: 42350, sparkline: [38500, 40200, 41800, 42350] },
  { label: "Blended ROAS", value: "5.2x", trend: 3, trendMoM: 5, target: "5.0x", targetValue: 5, currentValue: 5.2, sparkline: [4.6, 4.9, 5.0, 5.2] },
  { label: "Conversion Rate", value: "27.3%", trend: -2, trendMoM: 1, target: "25%", targetValue: 25, currentValue: 27.3, sparkline: [25.8, 26.5, 28.1, 27.3] },
  { label: "Company HC%", value: "38.2%", trend: -1, trendMoM: -3, target: "40%", targetValue: 40, currentValue: 38.2, sparkline: [41.0, 39.8, 38.9, 38.2], lowerIsBetter: true },
  { label: "Speed to Lead", value: "4.2m", trend: 5, trendMoM: 8, target: "5m", targetValue: 5, currentValue: 4.2, sparkline: [5.8, 5.1, 4.6, 4.2], lowerIsBetter: true },
];

const mockRevenueData = [
  { week: "Week 1", spa: 12400, aesthetics: 8200, slimming: 6800 },
  { week: "Week 2", spa: 13100, aesthetics: 8800, slimming: 7200 },
  { week: "Week 3", spa: 11800, aesthetics: 9400, slimming: 7600 },
  { week: "Week 4", spa: 14200, aesthetics: 9800, slimming: 8000 },
];

const deptHealthData = [
  { department: "Marketing", score: 85 },
  { department: "Sales", score: 72 },
  { department: "Finance", score: 95 },
  { department: "HR", score: 80 },
  { department: "Operations", score: 68 },
];

/* ── Brand ID mapping ──────────────────────────────────────── */

const brandNameMap: Record<number, string> = { 1: "spa", 2: "aesthetics", 3: "slimming" };

export default function CEOPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter, comparison }) => {
        const { data: salesData, loading: salesLoading, lastUpdated: salesLastUpdated } = useKPIData<{
          week_start: string;
          revenue_ex_vat: number;
          brand_id: number;
        }>({ table: "sales_weekly", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const { data: marketingData, loading: mktLoading } = useKPIData<{
          date: string;
          roas: number;
        }>({ table: "marketing_daily", dateFrom, dateTo, brandFilter });

        const { data: hrData, loading: hrLoading } = useKPIData<{
          week_start: string;
          hc_pct: number;
        }>({ table: "hr_weekly", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const { data: crmData, loading: crmLoading } = useKPIData<{
          date: string;
          conversion_rate_pct: number;
          speed_to_lead_median_min: number;
        }>({ table: "crm_daily", dateFrom, dateTo, brandFilter });

        // Previous period data for comparison (always called to respect hook rules)
        const prevDateFrom = comparison?.enabled ? comparison.previousFrom : dateFrom;
        const prevDateTo = comparison?.enabled ? comparison.previousTo : dateTo;
        const { data: prevSalesData, loading: prevSalesLoading } = useKPIData<{
          week_start: string;
          revenue_ex_vat: number;
          brand_id: number;
        }>({ table: "sales_weekly", dateFrom: prevDateFrom, dateTo: prevDateTo, brandFilter, dateColumn: "week_start" });

        const isLoading = salesLoading || mktLoading || hrLoading || crmLoading;

        const { annotations, addAnnotation, removeAnnotation } = useAnnotations("ceo", dateFrom, dateTo);

        /* ── Helper: group by week and aggregate ── */
        const groupByWeek = <T,>(rows: T[], dateKey: keyof T, valKey: keyof T, agg: "sum" | "avg" = "sum"): number[] => {
          const weekMap = new Map<string, { total: number; count: number }>();
          for (const row of rows) {
            const d = new Date(row[dateKey] as string);
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay());
            const key = weekStart.toISOString().slice(0, 10);
            if (!weekMap.has(key)) weekMap.set(key, { total: 0, count: 0 });
            const entry = weekMap.get(key)!;
            entry.total += (row[valKey] as number) || 0;
            entry.count += 1;
          }
          const sorted = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const vals = sorted.map(([, v]) => agg === "avg" ? (v.count > 0 ? v.total / v.count : 0) : v.total);
          return vals.slice(-4);
        };

        const revenueSparkline = salesData.length > 0 ? groupByWeek(salesData, "week_start", "revenue_ex_vat", "sum") : undefined;
        const roasSparkline = marketingData.length > 0 ? groupByWeek(marketingData, "date", "roas", "avg") : undefined;
        const convSparkline = crmData.length > 0 ? groupByWeek(crmData, "date", "conversion_rate_pct", "avg") : undefined;
        const hcSparkline = hrData.length > 0 ? groupByWeek(hrData, "week_start", "hc_pct", "avg") : undefined;
        const stlSparkline = crmData.length > 0 ? groupByWeek(crmData, "date", "speed_to_lead_median_min", "avg") : undefined;

        /* ── Compute KPIs ── */
        const computedKpis: KPIData[] = isLoading || salesData.length === 0 ? mockKpis : [
          {
            label: "Total Revenue",
            value: formatCurrency(salesData.reduce((s, r) => s + (r.revenue_ex_vat || 0), 0)),
            target: "€45,000",
            targetValue: 45000,
            currentValue: salesData.reduce((s, r) => s + (r.revenue_ex_vat || 0), 0),
            sparkline: revenueSparkline,
          },
          {
            label: "Blended ROAS",
            value: marketingData.length > 0
              ? `${(marketingData.reduce((s, r) => s + (r.roas || 0), 0) / marketingData.length).toFixed(1)}x`
              : "—",
            target: "5.0x",
            targetValue: 5,
            currentValue: marketingData.length > 0
              ? marketingData.reduce((s, r) => s + (r.roas || 0), 0) / marketingData.length
              : 0,
            sparkline: roasSparkline,
          },
          {
            label: "Conversion Rate",
            value: crmData.length > 0
              ? formatPercent(crmData.reduce((s, r) => s + (r.conversion_rate_pct || 0), 0) / crmData.length)
              : "—",
            target: "25%",
            targetValue: 25,
            currentValue: crmData.length > 0
              ? crmData.reduce((s, r) => s + (r.conversion_rate_pct || 0), 0) / crmData.length
              : 0,
            sparkline: convSparkline,
          },
          {
            label: "Company HC%",
            value: hrData.length > 0
              ? formatPercent(hrData.reduce((s, r) => s + (r.hc_pct || 0), 0) / hrData.length)
              : "—",
            target: "40%",
            targetValue: 40,
            currentValue: hrData.length > 0
              ? hrData.reduce((s, r) => s + (r.hc_pct || 0), 0) / hrData.length
              : 0,
            sparkline: hcSparkline,
            lowerIsBetter: true,
          },
          {
            label: "Speed to Lead",
            value: crmData.length > 0
              ? formatMinutes(crmData.reduce((s, r) => s + (r.speed_to_lead_median_min || 0), 0) / crmData.length)
              : "—",
            target: "5m",
            targetValue: 5,
            currentValue: crmData.length > 0
              ? crmData.reduce((s, r) => s + (r.speed_to_lead_median_min || 0), 0) / crmData.length
              : 0,
            sparkline: stlSparkline,
            lowerIsBetter: true,
          },
        ];

        /* ── Revenue chart data ── */
        const revenueChartData = isLoading || salesData.length === 0 ? mockRevenueData : (() => {
          const weekMap = new Map<string, { week: string; spa: number; aesthetics: number; slimming: number; prev_spa?: number; prev_aesthetics?: number; prev_slimming?: number }>();
          for (const row of salesData) {
            const key = row.week_start;
            if (!weekMap.has(key)) {
              weekMap.set(key, { week: key, spa: 0, aesthetics: 0, slimming: 0 });
            }
            const entry = weekMap.get(key)!;
            const brand = brandNameMap[row.brand_id] as "spa" | "aesthetics" | "slimming";
            if (brand) entry[brand] += row.revenue_ex_vat || 0;
          }

          // Merge previous period data when comparison is enabled
          if (comparison?.enabled && prevSalesData.length > 0 && !prevSalesLoading) {
            const prevWeekMap = new Map<string, { spa: number; aesthetics: number; slimming: number }>();
            for (const row of prevSalesData) {
              const key = row.week_start;
              if (!prevWeekMap.has(key)) {
                prevWeekMap.set(key, { spa: 0, aesthetics: 0, slimming: 0 });
              }
              const entry = prevWeekMap.get(key)!;
              const brand = brandNameMap[row.brand_id] as "spa" | "aesthetics" | "slimming";
              if (brand) entry[brand] += row.revenue_ex_vat || 0;
            }
            const prevWeeks = Array.from(prevWeekMap.values());
            const currentWeeks = Array.from(weekMap.values());
            // Align previous period data by index (week 1 vs week 1, etc.)
            for (let i = 0; i < currentWeeks.length && i < prevWeeks.length; i++) {
              currentWeeks[i].prev_spa = prevWeeks[i].spa;
              currentWeeks[i].prev_aesthetics = prevWeeks[i].aesthetics;
              currentWeeks[i].prev_slimming = prevWeeks[i].slimming;
            }
          }

          return Array.from(weekMap.values());
        })();

        return (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-charcoal">CEO Dashboard</h1>
              <div className="flex items-center gap-2">
                <AddAnnotationDialog onAdd={addAnnotation} />
                <ExportMenu pageTitle="CEO" kpiData={computedKpis as unknown as Record<string, unknown>[]} />
              </div>
            </div>
            <ExecutiveSummary
              page="CEO"
              dateFrom={dateFrom}
              dateTo={dateTo}
              brandFilter={brandFilter}
              kpiSnapshot={computedKpis}
              isDataLoading={isLoading}
            />
            <KPICardRow kpis={computedKpis} lastUpdated={salesLastUpdated} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Revenue by Brand</h2>
                  <FreshnessIndicator lastUpdated={salesLoading ? null : (salesData.length > 0 ? new Date(salesData[salesData.length - 1].week_start) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Line type="monotone" dataKey="spa" name="Spa" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                    <Line type="monotone" dataKey="aesthetics" name="Aesthetics" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                    <Line type="monotone" dataKey="slimming" name="Slimming" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                    {comparison?.enabled && (
                      <>
                        <Line type="monotone" dataKey="prev_spa" name="Spa (prev)" stroke={chartColors.spa} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="prev_aesthetics" name="Aes (prev)" stroke={chartColors.aesthetics} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="prev_slimming" name="Slim (prev)" stroke={chartColors.slimming} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Department Health</h2>
                  <FreshnessIndicator lastUpdated={null} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={deptHealthData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke={chartColors.spa} fill={chartColors.spa} fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <RevenueForecast
              salesData={salesData}
              loading={salesLoading}
            />

            <AnnotationMarkers annotations={annotations} onRemove={removeAnnotation} />

            <AlertFeed />
          </>
        );
      }}
    </DashboardShell>
  );
}
