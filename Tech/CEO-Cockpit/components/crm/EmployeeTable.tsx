"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/DataTable";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
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
} from "recharts";
import { format, addDays } from "date-fns";
import type { CrmByRepRow } from "@/lib/types/crm";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(
  value: number,
  good: boolean,
): React.ReactNode {
  const color = good
    ? "bg-emerald-100 text-emerald-800"
    : "bg-red-100 text-red-800";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${color}`}
    >
      {formatPercent(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */

interface AggregatedRep {
  name: string;
  brand: string;
  team_type: string;
  total_sales: number;
  dials: number;
  bookings: number;
  conversion_rate_pct: number;
  deposit_pct: number;
  missed_pct: number;
  total_tasks: number;
  avg_tasks_per_day: number;
}

const DUMMY_EMPLOYEES: AggregatedRep[] = [
  { name: "Maria Vella", brand: "aesthetics", team_type: "SDR", total_sales: 12480, dials: 342, bookings: 42, conversion_rate_pct: 34.2, deposit_pct: 78.5, missed_pct: 8.2, total_tasks: 312, avg_tasks_per_day: 22.3 },
  { name: "Katrina Borg", brand: "slimming", team_type: "SDR", total_sales: 10950, dials: 298, bookings: 38, conversion_rate_pct: 31.5, deposit_pct: 72.1, missed_pct: 10.4, total_tasks: 274, avg_tasks_per_day: 19.6 },
  { name: "Sarah Camilleri", brand: "spa", team_type: "Chat", total_sales: 9870, dials: 0, bookings: 35, conversion_rate_pct: 28.9, deposit_pct: 75.3, missed_pct: 5.1, total_tasks: 245, avg_tasks_per_day: 17.5 },
  { name: "Anna Grech", brand: "aesthetics", team_type: "SDR", total_sales: 8640, dials: 267, bookings: 31, conversion_rate_pct: 26.1, deposit_pct: 69.8, missed_pct: 11.7, total_tasks: 238, avg_tasks_per_day: 17.0 },
  { name: "Elena Farrugia", brand: "slimming", team_type: "Chat", total_sales: 7820, dials: 0, bookings: 28, conversion_rate_pct: 24.8, deposit_pct: 81.2, missed_pct: 6.3, total_tasks: 196, avg_tasks_per_day: 14.0 },
  { name: "Julia Zammit", brand: "spa", team_type: "SDR", total_sales: 6950, dials: 215, bookings: 25, conversion_rate_pct: 22.3, deposit_pct: 66.4, missed_pct: 14.8, total_tasks: 203, avg_tasks_per_day: 14.5 },
  { name: "Lisa Galea", brand: "aesthetics", team_type: "Chat", total_sales: 6210, dials: 0, bookings: 22, conversion_rate_pct: 20.7, deposit_pct: 73.6, missed_pct: 7.5, total_tasks: 182, avg_tasks_per_day: 13.0 },
  { name: "Diane Attard", brand: "slimming", team_type: "SDR", total_sales: 5480, dials: 189, bookings: 19, conversion_rate_pct: 19.2, deposit_pct: 64.1, missed_pct: 16.2, total_tasks: 168, avg_tasks_per_day: 12.0 },
  { name: "Nicole Mifsud", brand: "spa", team_type: "Chat", total_sales: 4720, dials: 0, bookings: 17, conversion_rate_pct: 17.4, deposit_pct: 71.9, missed_pct: 9.8, total_tasks: 154, avg_tasks_per_day: 11.0 },
  { name: "Claire Spiteri", brand: "aesthetics", team_type: "SDR", total_sales: 3890, dials: 156, bookings: 14, conversion_rate_pct: 15.8, deposit_pct: 58.3, missed_pct: 18.5, total_tasks: 126, avg_tasks_per_day: 9.0 },
];

const BRAND_LABELS: Record<string, string> = {
  spa: "Spa",
  aesthetics: "Aesthetics",
  slimming: "Slimming",
};

function generateDummyDailyData(name: string): { date: string; Sales: number; Bookings: number; "Conv %": number; "Deposit %": number; "Missed %": number }[] {
  const baseDate = new Date("2026-04-05");
  const emp = DUMMY_EMPLOYEES.find((e) => e.name === name);
  if (!emp) return [];
  const dailyAvg = emp.total_sales / 14;
  return Array.from({ length: 14 }, (_, i) => ({
    date: format(addDays(baseDate, i), "MMM dd"),
    Sales: Math.round(dailyAvg * (0.6 + Math.random() * 0.8)),
    Bookings: Math.round((emp.bookings / 14) * (0.5 + Math.random())),
    "Conv %": emp.conversion_rate_pct * (0.8 + Math.random() * 0.4),
    "Deposit %": emp.deposit_pct * (0.85 + Math.random() * 0.3),
    "Missed %": emp.missed_pct * (0.7 + Math.random() * 0.6),
  }));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmployeeTable({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const { data, loading } = useKPIData<CrmByRepRow>({
    table: "crm_by_rep",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // --- Brand ID -> slug mapping ---
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  // --- Aggregate real data by staff_id ---
  const repMap: Record<
    number,
    {
      staffId: number;
      brandId: number;
      teamType: string;
      totalSales: number;
      dials: number;
      bookings: number;
      convSum: number;
      convCount: number;
      depSum: number;
      depCount: number;
      missedSum: number;
      missedCount: number;
    }
  > = {};

  for (const row of data) {
    if (!repMap[row.staff_id]) {
      repMap[row.staff_id] = {
        staffId: row.staff_id,
        brandId: row.brand_id,
        teamType: row.team_type ?? "-",
        totalSales: 0,
        dials: 0,
        bookings: 0,
        convSum: 0,
        convCount: 0,
        depSum: 0,
        depCount: 0,
        missedSum: 0,
        missedCount: 0,
      };
    }
    const agg = repMap[row.staff_id];
    agg.totalSales += row.total_sales ?? 0;
    agg.dials += row.dials ?? 0;
    agg.bookings += row.bookings ?? 0;
    if (row.conversion_rate_pct !== null) {
      agg.convSum += row.conversion_rate_pct;
      agg.convCount++;
    }
    if (row.deposit_pct !== null) {
      agg.depSum += row.deposit_pct;
      agg.depCount++;
    }
    if (row.missed_pct !== null) {
      agg.missedSum += row.missed_pct;
      agg.missedCount++;
    }
  }

  const realTableData: AggregatedRep[] = Object.values(repMap).map((r) => ({
    name: `Rep ${r.staffId}`,
    brand: brandIdToSlug[r.brandId] ?? `brand_${r.brandId}`,
    team_type: r.teamType === "sdr" ? "SDR" : r.teamType === "chat" ? "Chat" : r.teamType,
    total_sales: r.totalSales,
    dials: r.dials,
    bookings: r.bookings,
    conversion_rate_pct: r.convCount > 0 ? r.convSum / r.convCount : 0,
    deposit_pct: r.depCount > 0 ? r.depSum / r.depCount : 0,
    missed_pct: r.missedCount > 0 ? r.missedSum / r.missedCount : 0,
    total_tasks: 0,
    avg_tasks_per_day: 0,
  }));

  const hasRealData = realTableData.length > 0;
  const tableData = hasRealData
    ? realTableData
    : brandFilter
    ? DUMMY_EMPLOYEES.filter((e) => e.brand === brandFilter)
    : DUMMY_EMPLOYEES;

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "brand",
      label: "Brand",
      render: (v: unknown) => (
        <span className="capitalize">{String(v)}</span>
      ),
    },
    { key: "team_type", label: "Role" },
    {
      key: "total_sales",
      label: "Total Sales",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => formatCurrency(Number(v) || 0),
    },
    {
      key: "dials",
      label: "Dials",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "bookings",
      label: "Bookings",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "conversion_rate_pct",
      label: "Conv %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) >= 20),
    },
    {
      key: "deposit_pct",
      label: "Deposit %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) >= 70),
    },
    {
      key: "missed_pct",
      label: "Missed %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) <= 12),
    },
    {
      key: "total_tasks",
      label: "Tasks",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "avg_tasks_per_day",
      label: "Tasks/Day",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => {
        const val = Number(v) || 0;
        const color = val >= 20 ? "text-red-600 font-bold" : val >= 15 ? "text-amber-600 font-semibold" : "text-foreground font-semibold";
        return <span className={color}>{val.toFixed(1)}</span>;
      },
    },
  ];

  // --- Agent detail chart (dummy daily) ---
  const agentDailyData = selectedAgent
    ? hasRealData
      ? data
          .filter((r) => `Rep ${r.staff_id}` === selectedAgent)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((r) => ({
            date: format(new Date(r.date), "MMM dd"),
            Sales: r.total_sales ?? 0,
            Bookings: r.bookings ?? 0,
            "Conv %": r.conversion_rate_pct ?? 0,
            "Deposit %": r.deposit_pct ?? 0,
            "Missed %": r.missed_pct ?? 0,
          }))
      : generateDummyDailyData(selectedAgent)
    : [];

  // --- CRM Tasks by Brand ---
  const brandTaskStats = (() => {
    const brands = ["spa", "aesthetics", "slimming"];
    return brands
      .filter((b) => !brandFilter || b === brandFilter)
      .map((brand) => {
        const reps = tableData.filter((r) => r.brand === brand);
        const totalTasks = reps.reduce((s, r) => s + r.total_tasks, 0);
        const totalReps = reps.length;
        const avgTasksPerDay = totalReps > 0
          ? reps.reduce((s, r) => s + r.avg_tasks_per_day, 0) / totalReps
          : 0;
        return { brand, label: BRAND_LABELS[brand] ?? brand, totalTasks, totalReps, avgTasksPerDay };
      });
  })();

  const companyTotalTasks = brandTaskStats.reduce((s, b) => s + b.totalTasks, 0);
  const companyAvgTasksPerDay = brandTaskStats.length > 0
    ? brandTaskStats.reduce((s, b) => s + b.avgTasksPerDay * b.totalReps, 0) / tableData.length
    : 0;

  return (
    <div className="space-y-6 relative">
      {!hasRealData && (
        <div className="absolute top-0 right-0 text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded z-10">
          sample data
        </div>
      )}

      {/* CRM Tasks by Brand */}
      <Card className="p-4 md:p-6">
        <h3 className="text-base font-semibold text-foreground mb-1">CRM Task Volume by Brand</h3>
        <p className="text-xs text-muted-foreground mb-4">Total tasks generated and average daily workload per rep — use this to balance CRM rep distribution across brands</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {brandTaskStats.map((b) => {
            const loadLevel = b.avgTasksPerDay >= 20 ? "High" : b.avgTasksPerDay >= 15 ? "Medium" : "Low";
            const loadColor = loadLevel === "High" ? "text-red-600" : loadLevel === "Medium" ? "text-amber-600" : "text-emerald-600";
            const loadBg = loadLevel === "High" ? "bg-red-50 border-red-200" : loadLevel === "Medium" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200";
            return (
              <div key={b.brand} className="rounded-lg border p-4" style={{ borderLeftWidth: 4, borderLeftColor: chartColors[b.brand as keyof typeof chartColors] ?? "#888" }}>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{b.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{b.totalTasks}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.totalReps} rep{b.totalReps !== 1 ? "s" : ""} assigned</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg/day/rep</span>
                  <span className={`text-sm font-bold ${loadColor}`}>{b.avgTasksPerDay.toFixed(1)}</span>
                </div>
                <div className="mt-1.5">
                  <span className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${loadBg}`}>{loadLevel} Load</span>
                </div>
              </div>
            );
          })}

          {/* Company total */}
          <div className="rounded-lg border-2 border-gray-300 p-4 bg-gray-50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">All Brands</p>
            <p className="text-2xl font-bold text-foreground mt-1">{companyTotalTasks}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tableData.length} total reps</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg/day/rep</span>
              <span className="text-sm font-bold text-foreground">{companyAvgTasksPerDay.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <DataTable
          columns={columns}
          data={tableData as unknown as Record<string, unknown>[]}
          onRowClick={(row) => {
            const name = row.name as string;
            setSelectedAgent(selectedAgent === name ? null : name);
          }}
        />
      </Card>

      {/* Agent Detail */}
      {selectedAgent !== null && agentDailyData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">
              {selectedAgent} — Daily Breakdown
            </h3>
            <button
              className="text-sm text-text-secondary hover:text-foreground"
              onClick={() => setSelectedAgent(null)}
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales + Bookings bar chart */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Sales & Bookings
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agentDailyData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sales" fill={chartColors.spa} />
                  <Bar dataKey="Bookings" fill={chartColors.aesthetics} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion / Deposit / Missed line chart */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Rate Metrics
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={agentDailyData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(value) => formatPercent(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Conv %"
                    stroke={chartColors.aesthetics}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Deposit %"
                    stroke={chartColors.spa}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Missed %"
                    stroke={chartColors.target}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
