"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { DataTable } from "@/components/dashboard/DataTable";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
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

const kpis: KPIData[] = [
  { label: "Total Spend", value: "€4,820", trend: 12 },
  { label: "Blended CPL", value: "€9.40", trend: -5 },
  { label: "Blended ROAS", value: "5.2x", trend: 3, target: "5.0x", targetValue: 5, currentValue: 5.2 },
  { label: "Email Revenue %", value: "32%", trend: -3, target: "35%", targetValue: 35, currentValue: 32 },
  { label: "SEO Clicks", value: "1,245", trend: 8 },
];

const spendRevenueData = [
  { week: "Week 1", spend: 1100, revenue: 9200 },
  { week: "Week 2", spend: 1200, revenue: 10400 },
  { week: "Week 3", spend: 1250, revenue: 11200 },
  { week: "Week 4", spend: 1270, revenue: 11550 },
];

const cplByBrandData = [
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

const campaignData = [
  { campaign: "Spa — Spring Relax", spend: 1800, leads: 245, cpl: 7.35, roas: 6.1 },
  { campaign: "Aesthetics — Glow Up", spend: 1620, leads: 120, cpl: 13.5, roas: 4.8 },
  { campaign: "Slimming — Transform", spend: 1400, leads: 160, cpl: 8.75, roas: 5.2 },
];

export default function MarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h1 className="text-2xl font-bold text-foreground">Marketing Dashboard</h1>
          <KPICardRow kpis={kpis} />
          <ExecutiveSummary department="marketing" dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />

          <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Spend vs Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendRevenueData} margin={chartDefaults.margin}>
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

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">CPL by Brand</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cplByBrandData} margin={chartDefaults.margin}>
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
          </ErrorBoundary>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Campaign Performance</h2>
            <DataTable columns={campaignColumns} data={campaignData} />
          </Card>
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
