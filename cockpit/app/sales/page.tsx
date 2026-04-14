"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { DataTable } from "@/components/dashboard/DataTable";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults } from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const kpis: KPIData[] = [
  { label: "Speed to Lead", value: "4.2m", trend: 5, target: "5m", targetValue: 5, currentValue: 4.2 },
  { label: "Conversion Rate", value: "27.3%", trend: 2, target: "25%", targetValue: 25, currentValue: 27.3 },
  { label: "Deposit %", value: "68%", trend: 4 },
  { label: "Total Calls", value: "342", trend: 12 },
  { label: "Meta vs CRM", value: "156/148", trend: -5 },
];

const stlDistribution = [
  { bucket: "<1m", count: 48 },
  { bucket: "1-3m", count: 82 },
  { bucket: "3-5m", count: 65 },
  { bucket: "5-15m", count: 42 },
  { bucket: "15-30m", count: 18 },
  { bucket: "30m+", count: 8 },
];

const funnelData = [
  { stage: "Leads", value: 525 },
  { stage: "Calls", value: 342 },
  { stage: "Appointments", value: 198 },
  { stage: "Sales", value: 143 },
];

const funnelColors = [chartColors.spa, chartColors.aesthetics, chartColors.slimming, "#8B5CF6"];

const repColumns = [
  { key: "rep", label: "Rep" },
  { key: "calls", label: "Calls", align: "right" as const, sortable: true },
  { key: "bookings", label: "Bookings", align: "right" as const, sortable: true },
  { key: "conversions", label: "Conversions", align: "right" as const, sortable: true },
  { key: "rate", label: "Conv. Rate", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
  { key: "stl", label: "STL", align: "right" as const, sortable: true, render: (v: unknown) => `${v}m` },
];

const repData = [
  { rep: "Maria C.", calls: 98, bookings: 52, conversions: 38, rate: 38.8, stl: 2.1 },
  { rep: "Diane S.", calls: 92, bookings: 48, conversions: 35, rate: 38.0, stl: 3.4 },
  { rep: "Jake T.", calls: 85, bookings: 44, conversions: 28, rate: 32.9, stl: 4.8 },
  { rep: "Anna R.", calls: 67, bookings: 32, conversions: 22, rate: 32.8, stl: 5.2 },
];

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h1 className="text-2xl font-bold text-foreground">Sales / CRM Dashboard</h1>
          <KPICardRow kpis={kpis} />
          <ExecutiveSummary department="sales" dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />

          <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Speed to Lead Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stlDistribution} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Leads" fill={chartColors.spa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Conversion Funnel</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical" margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="stage" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count">
                    {funnelData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={funnelColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          </ErrorBoundary>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Rep Leaderboard</h2>
            <DataTable columns={repColumns} data={repData} />
          </Card>
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
