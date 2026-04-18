"use client";

import { useState } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
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
  ReferenceLine,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  AGENT DATA — CRM Master (Apr 14 – May 6, 2026)                   */
/* ------------------------------------------------------------------ */

const DATES = [
  "Apr 14","Apr 15","Apr 16","Apr 17","Apr 18","Apr 19","Apr 20","Apr 21",
  "Apr 22","Apr 23","Apr 24","Apr 25","Apr 26","Apr 27","Apr 28","Apr 29",
  "Apr 30","May 01","May 02","May 03","May 04","May 05","May 06",
];

type AgentType = "sdr" | "chat";

interface AgentConfig {
  name: string;
  brand: string;
  type: AgentType;
  role: string;
}

const AGENTS: AgentConfig[] = [
  { name: "Nicci",    brand: "Spa",         type: "sdr",  role: "SDR Outbound" },
  { name: "Anni",     brand: "Aesthetics",  type: "sdr",  role: "SDR Outbound" },
  { name: "Juliana",  brand: "Spa",         type: "sdr",  role: "SDR Inbound" },
  { name: "Natalia",  brand: "Aesthetics",  type: "sdr",  role: "SDR Inbound" },
  { name: "Dorianne", brand: "Slimming",    type: "sdr",  role: "SDR" },
  { name: "Abid",     brand: "Spa",         type: "chat", role: "CRM / Chat" },
  { name: "Rana",     brand: "Aesthetics",  type: "chat", role: "CRM / Chat" },
  { name: "Adeel",    brand: "Slimming",    type: "chat", role: "CRM / Chat" },
];

// SDR KPI data: [Total Sales, Total Dials, Total Bookings, Conversion %, Deposit %, Missed %]
// Chat KPI data: [Total Sales, Total Conversations, Total Bookings, Conversion %, Chat Conv %, Deposit %, Missed Chats %]

interface DayData {
  sales: number;
  activity: number; // dials for SDR, conversations for chat
  bookings: number;
  conversionRate: number;
  depositPct: number;
  missedPct: number;
  chatConvRate?: number; // chat agents only
}

type AgentDailyData = Record<string, (DayData | null)[]>;

const AGENT_DATA: AgentDailyData = {
  "Nicci": [
    { sales: 642, activity: 45, bookings: 10, conversionRate: 22.2, depositPct: 80, missedPct: 8 },
    null, null,
    { sales: 937, activity: 52, bookings: 13, conversionRate: 25.0, depositPct: 75, missedPct: 10 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Anni": [
    { sales: 944, activity: 38, bookings: 6, conversionRate: 15.8, depositPct: 66, missedPct: 14 },
    null, null,
    { sales: 1123, activity: 48, bookings: 8, conversionRate: 16.7, depositPct: 72, missedPct: 11 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Juliana": [
    { sales: 0, activity: 12, bookings: 4, conversionRate: 33.3, depositPct: 100, missedPct: 0 },
    null, null,
    { sales: 787, activity: 18, bookings: 7, conversionRate: 38.9, depositPct: 85, missedPct: 5 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Natalia": [
    { sales: 239, activity: 15, bookings: 3, conversionRate: 20.0, depositPct: 70, missedPct: 12 },
    null, null,
    { sales: 546, activity: 22, bookings: 5, conversionRate: 22.7, depositPct: 78, missedPct: 9 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Dorianne": [
    { sales: 299, activity: 30, bookings: 8, conversionRate: 26.7, depositPct: 62, missedPct: 15 },
    null, null,
    { sales: 0, activity: 25, bookings: 5, conversionRate: 20.0, depositPct: 60, missedPct: 18 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Abid": [
    { sales: 705, activity: 62, bookings: 8, conversionRate: 12.9, depositPct: 75, missedPct: 6, chatConvRate: 18.5 },
    null, null,
    { sales: 577, activity: 55, bookings: 6, conversionRate: 10.9, depositPct: 82, missedPct: 4, chatConvRate: 16.2 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Rana": [
    { sales: 239, activity: 44, bookings: 4, conversionRate: 9.1, depositPct: 68, missedPct: 8, chatConvRate: 14.0 },
    null, null,
    { sales: 546, activity: 50, bookings: 7, conversionRate: 14.0, depositPct: 71, missedPct: 6, chatConvRate: 19.4 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
  "Adeel": [
    { sales: 299, activity: 35, bookings: 6, conversionRate: 17.1, depositPct: 58, missedPct: 10, chatConvRate: 12.5 },
    null, null,
    { sales: 0, activity: 28, bookings: 3, conversionRate: 10.7, depositPct: 55, missedPct: 14, chatConvRate: 10.0 },
    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  ],
};

/* ------------------------------------------------------------------ */
/*  TARGETS                                                           */
/* ------------------------------------------------------------------ */

const TARGETS = {
  conversionRate: { min: 20, max: 30, label: "20-30%" },
  depositPct: { min: 70, label: "70%+" },
  missedPct: { max: 12, label: "<12%" },
};

/* ------------------------------------------------------------------ */
/*  COMPUTED                                                          */
/* ------------------------------------------------------------------ */

function getAgentSummary(agentName: string, config: AgentConfig) {
  const data = AGENT_DATA[agentName] ?? [];
  const activeDays = data.filter((d): d is DayData => d !== null);
  const totalSales = activeDays.reduce((s, d) => s + d.sales, 0);
  const totalBookings = activeDays.reduce((s, d) => s + d.bookings, 0);
  const totalActivity = activeDays.reduce((s, d) => s + d.activity, 0);
  const avgConversion = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.conversionRate, 0) / activeDays.length : 0;
  const avgDeposit = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.depositPct, 0) / activeDays.length : 0;
  const avgMissed = activeDays.length > 0
    ? activeDays.reduce((s, d) => s + d.missedPct, 0) / activeDays.length : 0;

  return {
    name: agentName,
    brand: config.brand,
    role: config.role,
    type: config.type,
    activeDays: activeDays.length,
    totalSales,
    totalBookings,
    totalActivity,
    avgConversion,
    avgDeposit,
    avgMissed,
  };
}

const agentSummaries = AGENTS.map(a => getAgentSummary(a.name, a));

const totalTeamSales = agentSummaries.reduce((s, a) => s + a.totalSales, 0);
const totalTeamBookings = agentSummaries.reduce((s, a) => s + a.totalBookings, 0);
const avgTeamConversion = agentSummaries.length > 0
  ? agentSummaries.reduce((s, a) => s + a.avgConversion, 0) / agentSummaries.length : 0;
const avgTeamDeposit = agentSummaries.length > 0
  ? agentSummaries.reduce((s, a) => s + a.avgDeposit, 0) / agentSummaries.length : 0;
const avgTeamMissed = agentSummaries.length > 0
  ? agentSummaries.reduce((s, a) => s + a.avgMissed, 0) / agentSummaries.length : 0;

// Daily totals for trend chart
const dailyTotals = DATES.map((date, i) => {
  let sales = 0;
  let bookings = 0;
  let activity = 0;
  for (const agent of AGENTS) {
    const d = AGENT_DATA[agent.name]?.[i];
    if (d) {
      sales += d.sales;
      bookings += d.bookings;
      activity += d.activity;
    }
  }
  return { date, sales, bookings, activity };
});

// Per-agent daily sales for comparison chart
const agentDailySales = DATES.map((date, i) => {
  const row: Record<string, string | number> = { date };
  for (const agent of AGENTS) {
    const d = AGENT_DATA[agent.name]?.[i];
    row[agent.name] = d?.sales ?? 0;
  }
  return row;
});

// Brand colors for agents
const AGENT_COLORS: Record<string, string> = {
  "Nicci": "#B79E61",
  "Juliana": "#D4BE8A",
  "Anni": "#96B2B2",
  "Natalia": "#B0CCCC",
  "Dorianne": "#8EB093",
  "Abid": "#C4B272",
  "Rana": "#7A9E9E",
  "Adeel": "#7AA087",
};

/* ------------------------------------------------------------------ */
/*  STATUS HELPERS                                                    */
/* ------------------------------------------------------------------ */

function statusBadge(value: number, target: { min?: number; max?: number }) {
  const isGood = (target.min !== undefined ? value >= target.min : true) &&
                 (target.max !== undefined ? value <= target.max : true);
  return isGood
    ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800">{formatPercent(value)}</span>
    : <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">{formatPercent(value)}</span>;
}

/* ------------------------------------------------------------------ */
/*  COLUMN DEFINITIONS                                                */
/* ------------------------------------------------------------------ */

const summaryColumns = [
  { key: "name", label: "Agent" },
  { key: "brand", label: "Brand" },
  { key: "role", label: "Role" },
  { key: "activeDays", label: "Days", align: "right" as const },
  {
    key: "totalSales",
    label: "Total Sales",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => formatCurrency(Number(v)),
  },
  {
    key: "totalBookings",
    label: "Bookings",
    align: "right" as const,
    sortable: true,
  },
  {
    key: "totalActivity",
    label: "Activity",
    align: "right" as const,
    sortable: true,
  },
  {
    key: "avgConversion",
    label: "Conv %",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => statusBadge(Number(v), TARGETS.conversionRate),
  },
  {
    key: "avgDeposit",
    label: "Deposit %",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => statusBadge(Number(v), TARGETS.depositPct),
  },
  {
    key: "avgMissed",
    label: "Missed %",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => statusBadge(Number(v), TARGETS.missedPct),
  },
];

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                   */
/* ------------------------------------------------------------------ */

function TeamKPIsContent() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [metricView, setMetricView] = useState<"sales" | "bookings" | "conversion">("sales");

  const kpis: KPIData[] = [
    {
      label: "Team Sales (Period)",
      value: formatCurrency(totalTeamSales),
    },
    {
      label: "Team Bookings",
      value: `${totalTeamBookings}`,
    },
    {
      label: "Avg Conversion",
      value: formatPercent(avgTeamConversion),
      target: TARGETS.conversionRate.label,
      targetValue: TARGETS.conversionRate.min,
      currentValue: avgTeamConversion,
    },
    {
      label: "Avg Deposit %",
      value: formatPercent(avgTeamDeposit),
      target: TARGETS.depositPct.label,
      targetValue: TARGETS.depositPct.min,
      currentValue: avgTeamDeposit,
    },
    {
      label: "Avg Missed %",
      value: formatPercent(avgTeamMissed),
      target: TARGETS.missedPct.label,
      targetValue: TARGETS.missedPct.max,
      currentValue: avgTeamMissed,
    },
    {
      label: "Active Agents",
      value: `${agentSummaries.filter(a => a.activeDays > 0).length} / ${AGENTS.length}`,
    },
  ];

  // Metric-specific daily chart data
  const metricDailyData = DATES.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const agent of AGENTS) {
      const d = AGENT_DATA[agent.name]?.[i];
      if (metricView === "sales") row[agent.name] = d?.sales ?? 0;
      else if (metricView === "bookings") row[agent.name] = d?.bookings ?? 0;
      else row[agent.name] = d?.conversionRate ?? 0;
    }
    return row;
  });

  // Agent detail view
  const agentDetail = selectedAgent
    ? AGENTS.find(a => a.name === selectedAgent)
    : null;
  const agentDetailData = selectedAgent
    ? AGENT_DATA[selectedAgent]?.map((d, i) => ({
        date: DATES[i],
        sales: d?.sales ?? 0,
        bookings: d?.bookings ?? 0,
        activity: d?.activity ?? 0,
        conversionRate: d?.conversionRate ?? 0,
        depositPct: d?.depositPct ?? 0,
        missedPct: d?.missedPct ?? 0,
      }))
    : null;

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-foreground">Team KPIs</h1>
        <span className="text-sm text-text-secondary">Apr 14 – May 6, 2026 | {DATES.length} days</span>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Agent Summary Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Agent Performance Summary</h2>
        <DataTable
          columns={summaryColumns}
          data={agentSummaries as unknown as Record<string, unknown>[]}
          onRowClick={(row) => setSelectedAgent(row.name as string)}
        />
        <p className="text-xs text-text-secondary mt-2">Click a row to see agent detail below</p>
      </Card>

      {/* Metric Selector + Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Daily Trend by Agent</h2>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["sales", "bookings", "conversion"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMetricView(m)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  metricView === m ? "bg-background shadow text-foreground" : "text-text-secondary hover:text-foreground"
                }`}
              >
                {m === "sales" ? "Sales" : m === "bookings" ? "Bookings" : "Conversion %"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          {metricView === "conversion" ? (
            <LineChart data={metricDailyData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Legend />
              <ReferenceLine y={20} stroke="#16A34A" strokeDasharray="6 3" label={{ value: "Min 20%", position: "right", fill: "#16A34A", fontSize: 10 }} />
              <ReferenceLine y={30} stroke="#16A34A" strokeDasharray="6 3" label={{ value: "Max 30%", position: "right", fill: "#16A34A", fontSize: 10 }} />
              {AGENTS.map(a => (
                <Line
                  key={a.name}
                  type="monotone"
                  dataKey={a.name}
                  stroke={AGENT_COLORS[a.name]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={metricDailyData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tickFormatter={metricView === "sales" ? (v: number) => formatCurrency(v) : undefined} />
              <Tooltip formatter={metricView === "sales" ? (v) => formatCurrency(Number(v)) : undefined} />
              <Legend />
              {AGENTS.map(a => (
                <Bar key={a.name} dataKey={a.name} stackId="stack" fill={AGENT_COLORS[a.name]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* SDR vs Chat Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SDR Agents */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">SDR Agents</h2>
          <div className="space-y-4">
            {agentSummaries.filter(a => a.type === "sdr").map(a => (
              <div
                key={a.name}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedAgent(a.name)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: AGENT_COLORS[a.name] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{a.name}</span>
                    <span className="text-xs text-text-secondary">{a.brand}</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-text-secondary">
                    <span>Sales: {formatCurrency(a.totalSales)}</span>
                    <span>Bookings: {a.totalBookings}</span>
                    <span>Dials: {a.totalActivity}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusBadge(a.avgConversion, TARGETS.conversionRate)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Agents */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">CRM / Chat Agents</h2>
          <div className="space-y-4">
            {agentSummaries.filter(a => a.type === "chat").map(a => (
              <div
                key={a.name}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedAgent(a.name)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: AGENT_COLORS[a.name] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{a.name}</span>
                    <span className="text-xs text-text-secondary">{a.brand}</span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-text-secondary">
                    <span>Sales: {formatCurrency(a.totalSales)}</span>
                    <span>Bookings: {a.totalBookings}</span>
                    <span>Convos: {a.totalActivity}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusBadge(a.avgConversion, TARGETS.conversionRate)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Agent Detail Panel */}
      {agentDetail && agentDetailData && (
        <Card className="p-6 border-l-4" style={{ borderLeftColor: AGENT_COLORS[agentDetail.name] }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{agentDetail.name} — Daily Breakdown</h2>
              <span className="text-sm text-text-secondary">{agentDetail.brand} · {agentDetail.role}</span>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-xs text-text-secondary hover:text-foreground px-2 py-1 rounded border border-border"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales + Bookings Chart */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Sales & Bookings</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={agentDetailData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={3} />
                  <YAxis yAxisId="left" tickFormatter={(v: number) => formatCurrency(v)} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill={AGENT_COLORS[agentDetail.name]} name="Sales (€)" />
                  <Bar yAxisId="right" dataKey="bookings" fill="#9CA3AF" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Conversion & Deposit Trend */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Conversion & Deposit %</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={agentDetailData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={3} />
                  <YAxis unit="%" />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                  <Legend />
                  <ReferenceLine y={20} stroke="#16A34A" strokeDasharray="6 3" />
                  <ReferenceLine y={70} stroke="#2563EB" strokeDasharray="6 3" />
                  <Line type="monotone" dataKey="conversionRate" stroke={AGENT_COLORS[agentDetail.name]} strokeWidth={2} dot={{ r: 3 }} name="Conversion %" />
                  <Line type="monotone" dataKey="depositPct" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} name="Deposit %" />
                  <Line type="monotone" dataKey="missedPct" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} name="Missed %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Team Comparison — Sales Bar */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Total Sales by Agent</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={agentSummaries.sort((a, b) => b.totalSales - a.totalSales)}
            margin={chartDefaults.margin}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="totalSales" name="Total Sales">
              {agentSummaries.map((a) => (
                <Cell key={a.name} fill={AGENT_COLORS[a.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */

export default function TeamKPIsPage() {
  return (
    <DashboardShell>
      {() => <TeamKPIsContent />}
    </DashboardShell>
  );
}
