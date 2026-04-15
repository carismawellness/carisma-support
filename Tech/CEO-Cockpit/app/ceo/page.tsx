"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { CIChat } from "@/components/ci/CIChat";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AppointmentPipeline } from "@/components/dashboard/AppointmentPipeline";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
} from "@/lib/charts/config";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  MOCK DATA — all inline, no Supabase calls                         */
/* ------------------------------------------------------------------ */

const MOCK_WEEKS = [
  "05-Jan",
  "12-Jan",
  "19-Jan",
  "26-Jan",
  "02-Feb",
  "09-Feb",
  "16-Feb",
  "23-Feb",
  "02-Mar",
  "09-Mar",
  "16-Mar",
  "23-Mar",
];

const MOCK_SPA_REVENUE = [
  90940 + 4058,
  57391 + 3177,
  44546 + 5053,
  51833 + 3756,
  58281 + 4830,
  64317 + 6677,
  84959 + 4463,
  75501 + 4847,
  72259 + 5992,
  67817 + 4470,
  77198 + 5745,
  80930 + 3766,
];

const MOCK_AES_REVENUE = [
  9356, 26242, 0, 50, 16704, 13171, 6435, 466, 16972, 17258, 2450, 0,
];

const MOCK_SLIM_REVENUE = [
  0, 0, 0, 0, 0, 798, 3803, 0, 6502, 7418, 8957, 1894,
];

const MOCK_SPA_EBITDA = [
  35426, 17202, 8180, 12206, 14586, 19755, 32735, 27942, 28095, 22141, 28555,
  33552,
];

const MOCK_AES_EBITDA = [
  4420, 21150, -5231, -5951, 10541, 7271, 1056, -4591, 11795, 12135, -2534,
  -5007,
];

const MOCK_SLIM_EBITDA = [
  0, 0, 0, 0, 0, 438, 3443, -1397, 5373, 6348, 8084, 1029,
];

const CORPORATE_OVERHEAD = 3224;

/* Revenue chart data */
const MOCK_REVENUE_CHART = MOCK_WEEKS.map((week, i) => ({
  week,
  spa: MOCK_SPA_REVENUE[i],
  aesthetics: MOCK_AES_REVENUE[i],
  slimming: MOCK_SLIM_REVENUE[i],
}));

/* EBITDA chart data */
const MOCK_EBITDA_CHART = MOCK_WEEKS.map((week, i) => {
  const groupEbitda =
    MOCK_SPA_EBITDA[i] +
    MOCK_AES_EBITDA[i] +
    MOCK_SLIM_EBITDA[i] -
    CORPORATE_OVERHEAD;
  return { week, ebitda: groupEbitda };
});

/* Department scorecard data */
interface DeptScorecard {
  name: string;
  metrics: { label: string; value: string }[];
  health: "green" | "amber" | "red";
}

const MOCK_DEPT_SCORECARDS: DeptScorecard[] = [
  {
    name: "Sales",
    metrics: [
      { label: "Revenue", value: "€915K" },
      { label: "YoY Avg", value: "-2.1%" },
      { label: "Retail Avg", value: "5.9%" },
    ],
    health: "amber",
  },
  {
    name: "CRM",
    metrics: [
      { label: "Bookings", value: "443" },
      { label: "Sales", value: "€52.5K" },
      { label: "Top Rep", value: "Abid €16.6K" },
    ],
    health: "green",
  },
  {
    name: "Marketing",
    metrics: [
      { label: "ROAS", value: "5.2x" },
      { label: "CPL", value: "€8.50" },
      { label: "Email Rev", value: "12%" },
    ],
    health: "green",
  },
  {
    name: "HR",
    metrics: [
      { label: "HC%", value: "38.2%" },
      { label: "Utilization", value: "72%" },
      { label: "Open Pos.", value: "3" },
    ],
    health: "amber",
  },
  {
    name: "Operations",
    metrics: [
      { label: "Reviews", value: "612" },
      { label: "Avg Score", value: "4.7\u2605" },
      { label: "Complaints", value: "3 (4wk)" },
    ],
    health: "green",
  },
];

/* P&L table data */
const MOCK_PNL_DATA: Record<string, unknown>[] = [
  {
    brand: "Spa (Consolidated)",
    revenue: "€892K",
    opex: "€612K",
    ebitda: "€280K",
    margin: "31.4%",
    sparkData: MOCK_SPA_EBITDA,
    sparkColor: chartColors.spa,
    isBold: false,
  },
  {
    brand: "Aesthetics",
    revenue: "€109K",
    opex: "€64K",
    ebitda: "€45K",
    margin: "41.3%",
    sparkData: MOCK_AES_EBITDA,
    sparkColor: chartColors.aesthetics,
    isBold: false,
  },
  {
    brand: "Slimming",
    revenue: "€29K",
    opex: "€6K",
    ebitda: "€23K",
    margin: "78.8%",
    sparkData: MOCK_SLIM_EBITDA,
    sparkColor: chartColors.slimming,
    isBold: false,
  },
  {
    brand: "Corporate",
    revenue: "\u2014",
    opex: "€39K",
    ebitda: "-€39K",
    margin: "\u2014",
    sparkData: [] as number[],
    sparkColor: chartColors.budget,
    isBold: false,
  },
  {
    brand: "Group Total",
    revenue: "€1,030K",
    opex: "€721K",
    ebitda: "€309K",
    margin: "30.0%",
    sparkData: MOCK_EBITDA_CHART.map((d) => d.ebitda),
    sparkColor: chartColors.spa,
    isBold: true,
  },
];

const PNL_COLUMNS = [
  {
    key: "brand",
    label: "Brand",
    render: (value: unknown, row: Record<string, unknown>) =>
      row.isBold ? (
        <span className="font-bold text-foreground">{String(value)}</span>
      ) : (
        <span>{String(value)}</span>
      ),
  },
  {
    key: "revenue",
    label: "Revenue",
    align: "right" as const,
    render: (value: unknown, row: Record<string, unknown>) =>
      row.isBold ? (
        <span className="font-bold">{String(value)}</span>
      ) : (
        <span>{String(value)}</span>
      ),
  },
  {
    key: "opex",
    label: "OPEX",
    align: "right" as const,
    render: (value: unknown, row: Record<string, unknown>) =>
      row.isBold ? (
        <span className="font-bold">{String(value)}</span>
      ) : (
        <span>{String(value)}</span>
      ),
  },
  {
    key: "ebitda",
    label: "EBITDA",
    align: "right" as const,
    render: (value: unknown, row: Record<string, unknown>) =>
      row.isBold ? (
        <span className="font-bold">{String(value)}</span>
      ) : (
        <span>{String(value)}</span>
      ),
  },
  {
    key: "margin",
    label: "Margin %",
    align: "right" as const,
    render: (value: unknown, row: Record<string, unknown>) =>
      row.isBold ? (
        <span className="font-bold">{String(value)}</span>
      ) : (
        <span>{String(value)}</span>
      ),
  },
  {
    key: "sparkData",
    label: "Trend",
    align: "center" as const,
    render: (_value: unknown, row: Record<string, unknown>) => {
      const data = row.sparkData as number[];
      if (!data || data.length === 0) return <span>—</span>;
      return <Sparkline data={data} color={row.sparkColor as string} />;
    },
  },
];

/* KPI cards */
const MOCK_KPIS: KPIData[] = [
  {
    label: "Group EBITDA",
    value: "€280K",
    trend: 6,
    target: "€260K",
    targetValue: 260000,
    currentValue: 280000,
    href: "/finance",
  },
  {
    label: "Total Revenue",
    value: "€915K",
    trend: 3,
    target: "€900K",
    targetValue: 900000,
    currentValue: 915000,
    href: "/sales",
  },
  {
    label: "Blended ROAS",
    value: "5.2x",
    trend: 4,
    target: "5.0x",
    targetValue: 5,
    currentValue: 5.2,
    href: "/marketing",
  },
  {
    label: "Avg Speed to Lead",
    value: "4.2 min",
    trend: 5,
    target: "5 min",
    targetValue: 5,
    currentValue: 4.2,
    href: "/crm",
  },
  {
    label: "Company HC%",
    value: "38.2%",
    trend: -1,
    target: "40%",
    targetValue: 40,
    currentValue: 38.2,
    href: "/hr",
  },
  {
    label: "Google Reviews",
    value: "612 \u00b7 4.7\u2605",
    trend: 2,
    target: "4.5\u2605",
    targetValue: 4.5,
    currentValue: 4.7,
    href: "/operations",
  },
];

/* ------------------------------------------------------------------ */
/*  Custom EBITDA area tooltip                                        */
/* ------------------------------------------------------------------ */

interface EbitdaTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function EbitdaTooltip({ active, payload, label }: EbitdaTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm font-semibold ${val >= 0 ? "text-green-700" : "text-red-600"}`}
      >
        {formatCurrency(val)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Health dot component                                              */
/* ------------------------------------------------------------------ */

function HealthDot({ status }: { status: "green" | "amber" | "red" }) {
  const colorClass =
    status === "green"
      ? "bg-green-500"
      : status === "amber"
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`}
      aria-label={`Health: ${status}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page & content                                                    */
/* ------------------------------------------------------------------ */

export default function CEOPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <CEOContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}

function CEOContent({
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  return (
    <>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-foreground">
        CEO Executive Summary
      </h1>
      <p className="text-sm text-muted-foreground -mt-2">
        12-week rolling view &middot; Jan 5 &ndash; Mar 23, 2025
      </p>

      {/* KPI cards (6-col grid) */}
      <KPICardRow kpis={MOCK_KPIS} />

      {/* Section 1: Revenue & EBITDA Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Trend */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">
            Weekly Revenue Trend
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            12-week by brand
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={MOCK_REVENUE_CHART} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `€${Math.round(v / 1000)}K`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="spa"
                name="Spa"
                stroke={chartColors.spa}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
              <Line
                type="monotone"
                dataKey="aesthetics"
                name="Aesthetics"
                stroke={chartColors.aesthetics}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
              <Line
                type="monotone"
                dataKey="slimming"
                name="Slimming"
                stroke={chartColors.slimming}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Group EBITDA Trend */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">
            Group EBITDA Trend
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Weekly (net of corporate overhead)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MOCK_EBITDA_CHART} margin={chartDefaults.margin}>
              <defs>
                <linearGradient id="ebitdaPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `€${Math.round(v / 1000)}K`}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<EbitdaTooltip />} />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="ebitda"
                name="Group EBITDA"
                stroke="#16a34a"
                fill="url(#ebitdaPos)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section 2: Department Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {MOCK_DEPT_SCORECARDS.map((dept) => (
          <Card key={dept.name} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {dept.name}
              </h3>
              <HealthDot status={dept.health} />
            </div>
            <div className="space-y-1.5">
              {dept.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium text-foreground">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Section 3: Brand P&L Summary */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Brand P&L Summary (12 weeks)
        </h2>
        <DataTable columns={PNL_COLUMNS} data={MOCK_PNL_DATA} pageSize={10} />
      </Card>

      {/* Section 4: Alerts & AI */}
      <AppointmentPipeline />
      <AlertFeed />
      <CIChat />
    </>
  );
}
