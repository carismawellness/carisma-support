"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { CIChat } from "@/components/ci/CIChat";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency, formatPercent, formatMinutes } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
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
  { label: "Total Revenue", value: "€42,350", trend: 8, target: "€45,000", targetValue: 45000, currentValue: 42350 },
  { label: "Blended ROAS", value: "5.2x", trend: 3, target: "5.0x", targetValue: 5, currentValue: 5.2 },
  { label: "Conversion Rate", value: "27.3%", trend: -2, target: "25%", targetValue: 25, currentValue: 27.3 },
  { label: "Company HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Speed to Lead", value: "4.2m", trend: 5, target: "5m", targetValue: 5, currentValue: 4.2 },
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
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: salesData, loading: salesLoading } = useKPIData<{
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

        const isLoading = salesLoading || mktLoading || hrLoading || crmLoading;

        /* ── Compute KPIs ── */
        const computedKpis: KPIData[] = isLoading || salesData.length === 0 ? mockKpis : [
          {
            label: "Total Revenue",
            value: formatCurrency(salesData.reduce((s, r) => s + (r.revenue_ex_vat || 0), 0)),
            target: "€45,000",
            targetValue: 45000,
            currentValue: salesData.reduce((s, r) => s + (r.revenue_ex_vat || 0), 0),
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
          },
        ];

        /* ── Revenue chart data ── */
        const revenueChartData = isLoading || salesData.length === 0 ? mockRevenueData : (() => {
          const weekMap = new Map<string, { week: string; spa: number; aesthetics: number; slimming: number }>();
          for (const row of salesData) {
            const key = row.week_start;
            if (!weekMap.has(key)) {
              weekMap.set(key, { week: key, spa: 0, aesthetics: 0, slimming: 0 });
            }
            const entry = weekMap.get(key)!;
            const brand = brandNameMap[row.brand_id] as "spa" | "aesthetics" | "slimming";
            if (brand) entry[brand] += row.revenue_ex_vat || 0;
          }
          return Array.from(weekMap.values());
        })();

        return (
          <>
            <h1 className="text-2xl font-bold text-charcoal">CEO Dashboard</h1>
            <KPICardRow kpis={computedKpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Revenue by Brand</h2>
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
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Department Health</h2>
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

            <AlertFeed />
            <CIChat />
          </>
        );
      }}
    </DashboardShell>
  );
}
