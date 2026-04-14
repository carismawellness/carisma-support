"use client";

import { useMemo } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
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
  Cell,
} from "recharts";

const locationNames: Record<number, string> = {
  1: "InterContinental",
  2: "Hugo's",
  3: "Hyatt",
  4: "Ramla Bay",
  5: "Labranda",
  6: "Odycy",
  7: "Novotel",
  8: "Excelsior",
};

const REVPAH_TARGET = 35;

interface TherapistUtilizationRow {
  week_start: string;
  staff_id: number;
  location_id: number;
  available_hours: number;
  booked_hours: number;
  utilization_pct: number;
  bookings_count: number;
}

interface SalesWeeklyRow {
  week_start: string;
  location_id: number;
  brand_id: number;
  revenue_ex_vat: number;
}

const staticKpis: KPIData[] = [
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

function getRevPAHColor(value: number): string {
  if (value >= REVPAH_TARGET) return chartColors.slimming; // green
  if (value >= REVPAH_TARGET * 0.9) return chartColors.aesthetics; // amber
  return chartColors.target; // red
}

function HRContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { data: utilizationData, loading: utilizationLoading } =
    useKPIData<TherapistUtilizationRow>({
      table: "therapist_utilization",
      dateFrom,
      dateTo,
      brandFilter,
      dateColumn: "week_start",
    });

  const { data: salesData, loading: salesLoading } =
    useKPIData<SalesWeeklyRow>({
      table: "sales_weekly",
      dateFrom,
      dateTo,
      brandFilter,
      dateColumn: "week_start",
    });

  const revpahByLocation = useMemo(() => {
    const hoursByLocation: Record<number, number> = {};
    for (const row of utilizationData) {
      hoursByLocation[row.location_id] =
        (hoursByLocation[row.location_id] || 0) + row.available_hours;
    }

    const revenueByLocation: Record<number, number> = {};
    for (const row of salesData) {
      revenueByLocation[row.location_id] =
        (revenueByLocation[row.location_id] || 0) + row.revenue_ex_vat;
    }

    const locationIds = new Set([
      ...Object.keys(hoursByLocation).map(Number),
      ...Object.keys(revenueByLocation).map(Number),
    ]);

    return Array.from(locationIds)
      .filter((id) => hoursByLocation[id] > 0)
      .map((id) => ({
        location: locationNames[id] || `Location ${id}`,
        revpah: Math.round(
          ((revenueByLocation[id] || 0) / hoursByLocation[id]) * 100
        ) / 100,
      }))
      .sort((a, b) => b.revpah - a.revpah);
  }, [utilizationData, salesData]);

  const avgRevPAH = useMemo(() => {
    if (revpahByLocation.length === 0) return 0;
    const sum = revpahByLocation.reduce((acc, r) => acc + r.revpah, 0);
    return Math.round((sum / revpahByLocation.length) * 100) / 100;
  }, [revpahByLocation]);

  const revpahLoading = utilizationLoading || salesLoading;

  const kpis: KPIData[] = [
    ...staticKpis,
    {
      label: "Avg RevPAH",
      value: revpahLoading ? "..." : formatCurrency(avgRevPAH),
      target: formatCurrency(REVPAH_TARGET) + "/hr",
      targetValue: REVPAH_TARGET,
      currentValue: avgRevPAH,
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
      <KPICardRow kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">HC% by Location</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilization Trend</h2>
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

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RevPAH by Location</h2>
        {revpahLoading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
        ) : revpahByLocation.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revpahByLocation} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `€${v}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <ReferenceLine
                y={REVPAH_TARGET}
                stroke={chartColors.target}
                strokeDasharray="3 3"
                label={{
                  value: `Target ${formatCurrency(REVPAH_TARGET)}/hr`,
                  position: "right",
                  fill: chartColors.target,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revpah" name="RevPAH">
                {revpahByLocation.map((entry) => (
                  <Cell key={entry.location} fill={getRevPAHColor(entry.revpah)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Productivity (We360)</h2>
        <DataTable columns={productivityColumns} data={productivityData} />
      </Card>
      <CIChat />
    </>
  );
}

export default function HRPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <HRContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
