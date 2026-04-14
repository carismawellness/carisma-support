"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatPercent } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
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

/* ── Mock fallbacks ────────────────────────────────────────── */

const mockKpis: KPIData[] = [
  { label: "Avg HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Avg Utilization", value: "76.5%", trend: 3, target: "75%", targetValue: 75, currentValue: 76.5 },
  { label: "Headcount", value: "47", trend: 2 },
  { label: "Avg Productivity", value: "72%", trend: 1 },
  { label: "Slim Bookings/Therapist", value: "48", trend: 5, target: "45", targetValue: 45, currentValue: 48 },
];

const mockHcByLocation = [
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

const mockUtilizationTrend = [
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

const mockProductivityData = [
  { employee: "Maria C.", online: 7.8, active: 6.5, idle: 1.3, productive: 5.8, unproductive: 0.7, productivity: 89 },
  { employee: "Diane S.", online: 7.5, active: 6.2, idle: 1.3, productive: 5.2, unproductive: 1.0, productivity: 84 },
  { employee: "Jake T.", online: 7.2, active: 5.8, idle: 1.4, productive: 4.6, unproductive: 1.2, productivity: 79 },
  { employee: "Anna R.", online: 6.8, active: 5.1, idle: 1.7, productive: 3.8, unproductive: 1.3, productivity: 75 },
  { employee: "Chris M.", online: 7.0, active: 4.8, idle: 2.2, productive: 3.2, unproductive: 1.6, productivity: 67 },
];

export default function HRPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: hrData, loading: hrLoading } = useKPIData<{
          week_start: string;
          hc_pct: number;
          utilization_pct: number;
          headcount: number;
          location_id: string;
          location_name: string;
        }>({ table: "hr_weekly", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const { data: we360Data, loading: we360Loading } = useKPIData<{
          date: string;
          employee: string;
          online: number;
          active: number;
          idle: number;
          productive: number;
          unproductive: number;
          productivity: number;
        }>({ table: "we360_daily", dateFrom, dateTo, brandFilter });

        const isLoading = hrLoading || we360Loading;

        /* ── Compute KPIs ── */
        const avgHc = hrData.length > 0
          ? hrData.reduce((s, r) => s + (r.hc_pct || 0), 0) / hrData.length
          : 0;
        const avgUtil = hrData.length > 0
          ? hrData.reduce((s, r) => s + (r.utilization_pct || 0), 0) / hrData.length
          : 0;
        const totalHeadcount = hrData.length > 0
          ? hrData.reduce((s, r) => s + (r.headcount || 0), 0)
          : 0;
        const avgProductivity = we360Data.length > 0
          ? we360Data.reduce((s, r) => s + (r.productivity || 0), 0) / we360Data.length
          : 0;

        const computedKpis: KPIData[] = isLoading || hrData.length === 0 ? mockKpis : [
          {
            label: "Avg HC%",
            value: formatPercent(avgHc),
            target: "40%",
            targetValue: 40,
            currentValue: avgHc,
          },
          {
            label: "Avg Utilization",
            value: formatPercent(avgUtil),
            target: "75%",
            targetValue: 75,
            currentValue: avgUtil,
          },
          { label: "Headcount", value: totalHeadcount.toLocaleString() },
          { label: "Avg Productivity", value: formatPercent(avgProductivity) },
        ];

        /* ── HC% by location: latest per location ── */
        const hcByLocationChart = isLoading || hrData.length === 0 ? mockHcByLocation : (() => {
          const locMap = new Map<string, { location: string; hc: number; week: string }>();
          for (const row of hrData) {
            const name = row.location_name || row.location_id || "Unknown";
            const existing = locMap.get(name);
            if (!existing || row.week_start > existing.week) {
              locMap.set(name, { location: name, hc: row.hc_pct || 0, week: row.week_start });
            }
          }
          return Array.from(locMap.values()).map(({ location, hc }) => ({ location, hc }));
        })();

        /* ── Utilization trend by week ── */
        const utilizationChart = isLoading || hrData.length === 0 ? mockUtilizationTrend : (() => {
          const weekLocMap = new Map<string, Record<string, number>>();
          for (const row of hrData) {
            const week = row.week_start;
            if (!weekLocMap.has(week)) {
              weekLocMap.set(week, {});
            }
            const entry = weekLocMap.get(week)!;
            const loc = (row.location_name || row.location_id || "unknown").toLowerCase().replace(/[^a-z]/g, "");
            entry[loc] = row.utilization_pct || 0;
          }
          return Array.from(weekLocMap.entries()).map(([week, locs]) => ({
            week,
            ...locs,
          }));
        })();

        /* ── Productivity table ── */
        const productivityTable = isLoading || we360Data.length === 0 ? mockProductivityData : we360Data;

        /* ── Derive location keys for utilization lines ── */
        const utilizationLocationKeys = isLoading || hrData.length === 0
          ? ["sliema", "stjulians", "valletta", "mosta"]
          : (() => {
              const keys = new Set<string>();
              for (const row of hrData) {
                const loc = (row.location_name || row.location_id || "unknown").toLowerCase().replace(/[^a-z]/g, "");
                keys.add(loc);
              }
              return Array.from(keys).slice(0, 4); // limit to 4 lines for readability
            })();

        const lineColors = [chartColors.spa, chartColors.aesthetics, chartColors.slimming, "#8B5CF6"];

        return (
          <>
            <h1 className="text-2xl font-bold text-charcoal">HR Dashboard</h1>
            <KPICardRow kpis={computedKpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <h2 className="text-lg font-semibold text-charcoal mb-4">HC% by Location</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hcByLocationChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 50]} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <ReferenceLine y={40} stroke={chartColors.target} strokeDasharray="3 3" label={{ value: "Target 40%", position: "right", fill: chartColors.target, fontSize: 12 }} />
                    <Bar dataKey="hc" name="HC%" fill={chartColors.spa} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <h2 className="text-lg font-semibold text-charcoal mb-4">Utilization Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={utilizationChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[60, 90]} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                    {utilizationLocationKeys.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        stroke={lineColors[i % lineColors.length]}
                        strokeWidth={chartDefaults.strokeWidth}
                        dot={{ r: chartDefaults.dotRadius }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
              <h2 className="text-lg font-semibold text-charcoal mb-4">Employee Productivity (We360)</h2>
              <DataTable columns={productivityColumns} data={productivityTable} />
            </Card>
            <CIChat />
          </>
        );
      }}
    </DashboardShell>
  );
}
