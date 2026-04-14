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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const kpis: KPIData[] = [
  { label: "Avg HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Avg Utilization", value: "76.5%", trend: 3, target: "75%", targetValue: 75, currentValue: 76.5 },
  { label: "Headcount", value: "47", trend: 2 },
  { label: "Avg Productivity", value: "72%", trend: 1 },
  { label: "Slim Bookings/Therapist", value: "48", trend: 5, target: "45", targetValue: 45, currentValue: 48 },
];

const hcByLocation = [
  { location: "Sliema", hc: 42.1 },
  { location: "St Julian's", hc: 38.5 },
  { location: "Valletta", hc: 36.2 },
  { location: "Mosta", hc: 40.8 },
  { location: "Qormi", hc: 35.4 },
  { location: "Fgura", hc: 37.1 },
  { location: "Birkirkara", hc: 41.2 },
  { location: "Hamrun", hc: 34.8 },
  { location: "Naxxar", hc: 39.5 },
  { location: "Rabat", hc: 36.9 },
];

const utilizationTrend = [
  { week: "Week 1", sliema: 78, stjulians: 72, valletta: 68, mosta: 74 },
  { week: "Week 2", sliema: 80, stjulians: 74, valletta: 70, mosta: 76 },
  { week: "Week 3", sliema: 76, stjulians: 75, valletta: 72, mosta: 78 },
  { week: "Week 4", sliema: 82, stjulians: 77, valletta: 74, mosta: 75 },
];

const productivityColumns = [
  { key: "employee", label: "Employee" },
  { key: "online", label: "Online", align: "right" as const, render: (v: unknown) => `${v}h` },
  { key: "active", label: "Active", align: "right" as const, render: (v: unknown) => `${v}h` },
  { key: "idle", label: "Idle", align: "right" as const, render: (v: unknown) => `${v}h` },
  { key: "productive", label: "Productive", align: "right" as const, render: (v: unknown) => `${v}h` },
  { key: "unproductive", label: "Unproductive", align: "right" as const, render: (v: unknown) => `${v}h` },
  { key: "productivity", label: "Productivity %", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
];

const productivityData = [
  { employee: "Maria C.", online: 7.8, active: 6.5, idle: 1.3, productive: 5.8, unproductive: 0.7, productivity: 89 },
  { employee: "Diane S.", online: 7.5, active: 6.2, idle: 1.3, productive: 5.2, unproductive: 1.0, productivity: 84 },
  { employee: "Jake T.", online: 7.2, active: 5.8, idle: 1.4, productive: 4.6, unproductive: 1.2, productivity: 79 },
  { employee: "Anna R.", online: 6.8, active: 5.1, idle: 1.7, productive: 3.8, unproductive: 1.3, productivity: 75 },
  { employee: "Chris M.", online: 7.0, active: 4.8, idle: 2.2, productive: 3.2, unproductive: 1.6, productivity: 67 },
];

export default function HRPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
          <KPICardRow kpis={kpis} />
          <ExecutiveSummary department="hr" dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />

          <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">HC% by Location</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hcByLocation} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 50]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <ReferenceLine y={40} stroke={chartColors.target} strokeDasharray="3 3" label={{ value: "Target 40%", position: "right", fill: chartColors.target, fontSize: 12 }} />
                  <Bar dataKey="hc" name="HC%" fill={chartColors.spa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Utilization Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={utilizationTrend} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[60, 90]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="sliema" name="Sliema" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="stjulians" name="St Julian's" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="valletta" name="Valletta" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="mosta" name="Mosta" stroke="#8B5CF6" strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
          </ErrorBoundary>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Employee Productivity (We360)</h2>
            <DataTable columns={productivityColumns} data={productivityData} />
          </Card>
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
