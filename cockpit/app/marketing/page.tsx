"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { FreshnessIndicator } from "@/components/dashboard/FreshnessIndicator";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { ExportMenu } from "@/components/dashboard/ExportMenu";
import { getISOWeek } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ── Mock fallbacks ────────────────────────────────────────── */

const mockKpis: KPIData[] = [
  { label: "Total Spend", value: "€4,820", trend: 12, sparkline: [4200, 4500, 4680, 4820] },
  { label: "Blended CPL", value: "€9.40", trend: -5, trendMoM: -8, sparkline: [11.2, 10.5, 9.8, 9.4], lowerIsBetter: true },
  { label: "Blended ROAS", value: "5.2x", trend: 3, trendMoM: 6, target: "5.0x", targetValue: 5, currentValue: 5.2, sparkline: [4.6, 4.9, 5.0, 5.2] },
  { label: "Email Revenue %", value: "32%", trend: -3, target: "35%", targetValue: 35, currentValue: 32, sparkline: [34, 33, 31, 32] },
  { label: "Total Leads", value: "513", trend: 8, sparkline: [420, 465, 490, 513] },
];

const mockSpendRevenueData = [
  { week: "Week 1", spend: 1100, revenue: 9200 },
  { week: "Week 2", spend: 1200, revenue: 10400 },
  { week: "Week 3", spend: 1250, revenue: 11200 },
  { week: "Week 4", spend: 1270, revenue: 11550 },
];

const mockCplByBrandData = [
  { brand: "Spa", cpl: 7.2, target: 8 },
  { brand: "Aesthetics", cpl: 13.5, target: 12 },
  { brand: "Slimming", cpl: 8.8, target: 10 },
];

const campaignColumns = [
  { key: "campaign", label: "Campaign" },
  { key: "spend", label: "Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  { key: "leads", label: "Leads", align: "right" as const, sortable: true },
  { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  { key: "roas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => `${v}x` },
];

const mockCampaignData = [
  { campaign: "Spa — Spring Relax", spend: 1800, leads: 245, cpl: 7.35, roas: 6.1 },
  { campaign: "Aesthetics — Glow Up", spend: 1620, leads: 120, cpl: 13.5, roas: 4.8 },
  { campaign: "Slimming — Transform", spend: 1400, leads: 160, cpl: 8.75, roas: 5.2 },
];

/* ── Brand ID mapping ──────────────────────────────────────── */

const brandNameMap: Record<number, string> = { 1: "Spa", 2: "Aesthetics", 3: "Slimming" };

export default function MarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: mktData, loading: mktLoading, lastUpdated: mktLastUpdated } = useKPIData<{
          date: string;
          spend: number;
          leads: number;
          revenue: number;
          roas: number;
          cpl: number;
          brand_id: number;
        }>({ table: "marketing_daily", dateFrom, dateTo, brandFilter });

        const { data: klaviyoData, loading: klaviyoLoading } = useKPIData<{
          date: string;
          revenue: number;
        }>({ table: "klaviyo_campaigns", dateFrom, dateTo, brandFilter });

        const isLoading = mktLoading || klaviyoLoading;

        /* ── Compute KPIs ── */
        const totalSpend = mktData.reduce((s, r) => s + (r.spend || 0), 0);
        const totalLeads = mktData.reduce((s, r) => s + (r.leads || 0), 0);
        const totalRevenue = mktData.reduce((s, r) => s + (r.revenue || 0), 0);
        const klaviyoRevenue = klaviyoData.reduce((s, r) => s + (r.revenue || 0), 0);
        const blendedCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
        const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
        const emailRevPct = totalRevenue > 0 ? (klaviyoRevenue / totalRevenue) * 100 : 0;

        const computedKpis: KPIData[] = isLoading || mktData.length === 0 ? mockKpis : [
          { label: "Total Spend", value: formatCurrency(totalSpend) },
          { label: "Blended CPL", value: formatCurrency(blendedCpl) },
          {
            label: "Blended ROAS",
            value: `${blendedRoas.toFixed(1)}x`,
            target: "5.0x",
            targetValue: 5,
            currentValue: blendedRoas,
          },
          {
            label: "Email Revenue %",
            value: `${emailRevPct.toFixed(0)}%`,
            target: "35%",
            targetValue: 35,
            currentValue: emailRevPct,
          },
          { label: "Total Leads", value: totalLeads.toLocaleString() },
        ];

        /* ── Spend vs Revenue by week ── */
        const spendRevenueChart = isLoading || mktData.length === 0 ? mockSpendRevenueData : (() => {
          const weekMap = new Map<number, { week: string; spend: number; revenue: number }>();
          for (const row of mktData) {
            const wk = getISOWeek(new Date(row.date));
            if (!weekMap.has(wk)) {
              weekMap.set(wk, { week: `Week ${wk}`, spend: 0, revenue: 0 });
            }
            const entry = weekMap.get(wk)!;
            entry.spend += row.spend || 0;
            entry.revenue += row.revenue || 0;
          }
          return Array.from(weekMap.values());
        })();

        /* ── CPL by Brand ── */
        const cplByBrandChart = isLoading || mktData.length === 0 ? mockCplByBrandData : (() => {
          const brandMap = new Map<number, { spend: number; leads: number }>();
          for (const row of mktData) {
            if (!brandMap.has(row.brand_id)) {
              brandMap.set(row.brand_id, { spend: 0, leads: 0 });
            }
            const entry = brandMap.get(row.brand_id)!;
            entry.spend += row.spend || 0;
            entry.leads += row.leads || 0;
          }
          return Array.from(brandMap.entries()).map(([id, v]) => ({
            brand: brandNameMap[id] || `Brand ${id}`,
            cpl: v.leads > 0 ? v.spend / v.leads : 0,
            target: 0, // no target from DB yet
          }));
        })();

        return (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-charcoal">Marketing Dashboard</h1>
              <ExportMenu pageTitle="Marketing" kpiData={computedKpis as unknown as Record<string, unknown>[]} />
            </div>
            <ExecutiveSummary
              page="Marketing"
              dateFrom={dateFrom}
              dateTo={dateTo}
              brandFilter={brandFilter}
              kpiSnapshot={computedKpis}
              isDataLoading={isLoading}
            />
            <KPICardRow kpis={computedKpis} lastUpdated={mktLastUpdated} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Spend vs Revenue</h2>
                  <FreshnessIndicator lastUpdated={mktLoading ? null : (mktData.length > 0 ? new Date(mktData[mktData.length - 1].date) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendRevenueChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" tickFormatter={(v: number) => formatCurrency(v)} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spend" name="Spend" stroke={chartColors.target} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">CPL by Brand</h2>
                  <FreshnessIndicator lastUpdated={mktLoading ? null : (mktData.length > 0 ? new Date(mktData[mktData.length - 1].date) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cplByBrandChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="brand" />
                    <YAxis tickFormatter={(v: number) => `€${v}`} />
                    <Tooltip formatter={(v) => `€${v}`} />
                    <Legend />
                    <Bar dataKey="cpl" name="CPL" fill={chartColors.spa} />
                    <Bar dataKey="target" name="Target" fill={chartColors.budget} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Campaign Performance</h2>
                <FreshnessIndicator lastUpdated={null} />
              </div>
              <DataTable columns={campaignColumns} data={mockCampaignData} />
            </Card>
          </>
        );
      }}
    </DashboardShell>
  );
}
