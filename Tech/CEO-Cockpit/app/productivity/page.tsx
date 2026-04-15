"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults } from "@/lib/charts/config";
import { CIChat } from "@/components/ci/CIChat";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                         */
/* ------------------------------------------------------------------ */

const MOCK_KPIS: KPIData[] = [
  { label: "Avg Productivity", value: "73.2%", target: "80%", targetValue: 80, currentValue: 73.2, trend: 2 },
  { label: "Avg Daily Hours", value: "7.4h", target: "8h", targetValue: 8, currentValue: 7.4 },
  { label: "Active vs Idle Ratio", value: "3.8:1", trend: 5 },
  { label: "Email Time", value: "1.2h/day" },
  { label: "Top Performer", value: "Sarah M. (89%)" },
  { label: "Underperforming", value: "2 staff below 60%" },
];

const MOCK_DAILY_PRODUCTIVITY = [
  { date: "Mar 03", productive: 5.2, neutral: 0.8, unproductive: 0.4, idle: 1.0 },
  { date: "Mar 04", productive: 5.5, neutral: 0.7, unproductive: 0.3, idle: 0.9 },
  { date: "Mar 05", productive: 5.1, neutral: 0.9, unproductive: 0.5, idle: 1.1 },
  { date: "Mar 06", productive: 5.8, neutral: 0.6, unproductive: 0.2, idle: 0.8 },
  { date: "Mar 07", productive: 4.9, neutral: 1.0, unproductive: 0.6, idle: 1.2 },
  { date: "Mar 10", productive: 5.4, neutral: 0.8, unproductive: 0.4, idle: 1.0 },
  { date: "Mar 11", productive: 5.6, neutral: 0.7, unproductive: 0.3, idle: 0.8 },
  { date: "Mar 12", productive: 5.3, neutral: 0.9, unproductive: 0.5, idle: 1.0 },
  { date: "Mar 13", productive: 5.7, neutral: 0.6, unproductive: 0.3, idle: 0.9 },
  { date: "Mar 14", productive: 5.0, neutral: 1.0, unproductive: 0.5, idle: 1.1 },
  { date: "Mar 17", productive: 5.5, neutral: 0.7, unproductive: 0.4, idle: 0.9 },
  { date: "Mar 18", productive: 5.8, neutral: 0.6, unproductive: 0.2, idle: 0.8 },
  { date: "Mar 19", productive: 5.2, neutral: 0.9, unproductive: 0.5, idle: 1.0 },
  { date: "Mar 20", productive: 5.9, neutral: 0.5, unproductive: 0.2, idle: 0.7 },
  { date: "Mar 21", productive: 4.8, neutral: 1.1, unproductive: 0.6, idle: 1.2 },
  { date: "Mar 24", productive: 5.6, neutral: 0.7, unproductive: 0.3, idle: 0.9 },
  { date: "Mar 25", productive: 5.4, neutral: 0.8, unproductive: 0.4, idle: 1.0 },
  { date: "Mar 26", productive: 5.7, neutral: 0.6, unproductive: 0.3, idle: 0.8 },
  { date: "Mar 27", productive: 5.3, neutral: 0.9, unproductive: 0.5, idle: 1.0 },
  { date: "Mar 28", productive: 5.1, neutral: 1.0, unproductive: 0.4, idle: 1.1 },
];

const MOCK_STAFF_PRODUCTIVITY = [
  { name: "Sarah M.", dept: "Sales", avgHours: 8.1, productivePct: 89, activeIdleRatio: 5.2, emailHrs: 1.4, status: "excellent" },
  { name: "Abid K.", dept: "Sales", avgHours: 7.8, productivePct: 84, activeIdleRatio: 4.8, emailHrs: 1.6, status: "good" },
  { name: "Juli R.", dept: "Sales", avgHours: 7.5, productivePct: 81, activeIdleRatio: 4.5, emailHrs: 1.1, status: "good" },
  { name: "Rana H.", dept: "Sales", avgHours: 7.9, productivePct: 78, activeIdleRatio: 4.1, emailHrs: 1.8, status: "good" },
  { name: "Nicci D.", dept: "Sales", avgHours: 6.8, productivePct: 72, activeIdleRatio: 3.5, emailHrs: 0.9, status: "average" },
  { name: "Maria C.", dept: "Marketing", avgHours: 7.6, productivePct: 76, activeIdleRatio: 3.8, emailHrs: 2.1, status: "good" },
  { name: "Jake T.", dept: "Marketing", avgHours: 7.2, productivePct: 71, activeIdleRatio: 3.4, emailHrs: 1.9, status: "average" },
  { name: "Elena P.", dept: "Operations", avgHours: 8.0, productivePct: 82, activeIdleRatio: 4.6, emailHrs: 1.3, status: "good" },
  { name: "Mark S.", dept: "HR", avgHours: 7.1, productivePct: 68, activeIdleRatio: 3.1, emailHrs: 2.4, status: "average" },
  { name: "Lisa F.", dept: "Finance", avgHours: 7.4, productivePct: 75, activeIdleRatio: 3.7, emailHrs: 2.0, status: "good" },
  { name: "Adeel M.", dept: "Sales", avgHours: 6.5, productivePct: 58, activeIdleRatio: 2.4, emailHrs: 0.7, status: "needs_attention" },
  { name: "Tom B.", dept: "Operations", avgHours: 6.2, productivePct: 55, activeIdleRatio: 2.1, emailHrs: 0.5, status: "needs_attention" },
];

const MOCK_DEPT_PRODUCTIVITY = [
  { dept: "Sales", avgPct: 77 },
  { dept: "Marketing", avgPct: 74 },
  { dept: "Finance", avgPct: 75 },
  { dept: "Operations", avgPct: 69 },
  { dept: "HR", avgPct: 68 },
];

const MOCK_TIME_ALLOCATION = [
  { name: "Productive", value: 72, color: "#22C55E" },
  { name: "Neutral", value: 11, color: "#9CA3AF" },
  { name: "Unproductive", value: 5, color: "#EF4444" },
  { name: "Idle", value: 12, color: "#F59E0B" },
];

/* Generate heatmap data from staff with weekly variance */
const WEEKS = ["W1 (Mar 3-7)", "W2 (Mar 10-14)", "W3 (Mar 17-21)", "W4 (Mar 24-28)"];
const MOCK_HEATMAP = MOCK_STAFF_PRODUCTIVITY.map((s) => ({
  name: s.name,
  weeks: WEEKS.map((_, wi) => {
    const base = s.productivePct;
    const offsets = [-3, 1, 2, -2];
    return Math.max(40, Math.min(95, base + offsets[wi] + (wi % 2 === 0 ? -1 : 2)));
  }),
}));

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

function getDeptBarColor(pct: number): string {
  if (pct >= 75) return "#22C55E";
  if (pct >= 60) return "#F59E0B";
  return "#EF4444";
}

function getHeatmapBg(pct: number): string {
  if (pct >= 85) return "bg-green-600 text-white";
  if (pct >= 75) return "bg-green-500 text-white";
  if (pct >= 65) return "bg-green-400 text-white";
  if (pct >= 55) return "bg-green-300 text-green-900";
  return "bg-green-200 text-green-900";
}

const statusConfig: Record<string, { label: string; className: string }> = {
  excellent: { label: "Excellent", className: "bg-green-100 text-green-800" },
  good: { label: "Good", className: "bg-blue-100 text-blue-800" },
  average: { label: "Average", className: "bg-amber-100 text-amber-800" },
  needs_attention: { label: "Needs Attention", className: "bg-red-100 text-red-800" },
};

/* ------------------------------------------------------------------ */
/*  TABLE COLUMNS                                                     */
/* ------------------------------------------------------------------ */

const staffColumns = [
  { key: "name", label: "Name" },
  { key: "dept", label: "Dept" },
  { key: "avgHours", label: "Avg Hours", align: "right" as const, sortable: true, render: (v: unknown) => `${v}h` },
  { key: "productivePct", label: "Productive %", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
  { key: "activeIdleRatio", label: "Active:Idle", align: "right" as const, sortable: true, render: (v: unknown) => `${v}:1` },
  { key: "emailHrs", label: "Email hrs/day", align: "right" as const, sortable: true, render: (v: unknown) => `${v}h` },
  {
    key: "status",
    label: "Status",
    render: (v: unknown) => {
      const cfg = statusConfig[v as string] ?? { label: String(v), className: "bg-gray-100 text-gray-800" };
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </span>
      );
    },
  },
];

/* Sort staff by productivePct descending for the table */
const sortedStaff = [...MOCK_STAFF_PRODUCTIVITY].sort((a, b) => b.productivePct - a.productivePct);

/* ------------------------------------------------------------------ */
/*  INNER CONTENT COMPONENT                                           */
/* ------------------------------------------------------------------ */

function ProductivityContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  // dateFrom, dateTo, brandFilter available for future live data fetching
  void dateFrom;
  void dateTo;
  void brandFilter;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Productivity Dashboard</h1>

      {/* KPI Cards */}
      <KPICardRow kpis={MOCK_KPIS} />

      {/* Section 1: Daily Productivity Trend */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Productivity Trend</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={MOCK_DAILY_PRODUCTIVITY} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v: number) => `${v}h`} />
            <Tooltip formatter={(v) => `${v}h`} />
            <Legend />
            <Area
              type="monotone"
              dataKey="productive"
              name="Productive"
              stackId="1"
              stroke="#22C55E"
              fill="#22C55E"
              fillOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="neutral"
              name="Neutral"
              stackId="1"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="unproductive"
              name="Unproductive"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="idle"
              name="Idle"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.7}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 2: Staff Productivity Leaderboard */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Productivity Leaderboard</h2>
        <DataTable columns={staffColumns} data={sortedStaff as unknown as Record<string, unknown>[]} pageSize={12} />
      </Card>

      {/* Section 3: Time Breakdown by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dept Avg Productivity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dept Avg Productivity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MOCK_DEPT_PRODUCTIVITY} layout="vertical" margin={{ ...chartDefaults.margin, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 13 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine x={80} stroke={chartColors.target} strokeDasharray="3 3" label={{ value: "Target 80%", position: "top", fill: chartColors.target, fontSize: 12 }} />
              <Bar dataKey="avgPct" name="Avg Productivity %">
                {MOCK_DEPT_PRODUCTIVITY.map((entry) => (
                  <Cell key={entry.dept} fill={getDeptBarColor(entry.avgPct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Right: Time Allocation Donut */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={MOCK_TIME_ALLOCATION}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name ?? ""} ${value}%`}
              >
                {MOCK_TIME_ALLOCATION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section 4: Weekly Productivity Heatmap */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Productivity Heatmap</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">Staff</th>
                {WEEKS.map((w) => (
                  <th key={w} className="text-center py-2 px-3 font-semibold text-gray-700 border-b border-gray-200">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HEATMAP.map((row) => (
                <tr key={row.name}>
                  <td className="py-2 px-3 font-medium text-gray-900 border-b border-gray-100">{row.name}</td>
                  {row.weeks.map((pct, i) => (
                    <td key={i} className="py-2 px-3 border-b border-gray-100">
                      <div className={`rounded-md text-center text-xs font-semibold py-1.5 ${getHeatmapBg(pct)}`}>
                        {pct}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CI Chat */}
      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                       */
/* ------------------------------------------------------------------ */

export default function ProductivityPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <ProductivityContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
