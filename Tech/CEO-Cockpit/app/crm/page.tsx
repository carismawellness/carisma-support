"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
} from "@/lib/charts/config";
import Link from "next/link";
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
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  REAL DATA — CRM Master (Feb 18 – Mar 14, 2026)                   */
/* ------------------------------------------------------------------ */

// Dates for the reporting period (working days only, matching data)
const DATES = [
  "Feb 18","Feb 19","Feb 20","Feb 21","Feb 22","Feb 25","Feb 26","Feb 27","Feb 28",
  "Mar 01","Mar 03","Mar 04","Mar 05","Mar 06","Mar 07","Mar 08","Mar 09","Mar 10",
  "Mar 11","Mar 12","Mar 13","Mar 14",
];

/* --- SPA CRM --- */
const MOCK_SPA_SALES_DAILY = [642,0,937,712,544,1717,782,1216,1769,507,969,309,0,189,688,717,230,443,0,0,0,1063];
const MOCK_SPA_BOOKINGS_DAILY = [10,18,13,23,26,16,25,34,45,21,19,28,0,18,33,17,19,23,3,0,8,24];
const MOCK_SPA_BOOKING_TYPES = {
  "Spa Day Package": [1,0,2,2,1,1,0,2,1,1,0,0,0,0,0,1,0,0,1,0,0,3],
  "Couples Package": [0,2,2,1,2,1,2,4,5,0,2,0,0,1,1,3,0,1,1,0,1,3],
  "Gift Card":       [0,2,1,6,3,6,0,2,10,5,1,2,0,2,4,3,4,5,0,0,0,3],
  "Massages":        [1,0,0,4,0,2,2,4,0,0,2,4,0,1,4,0,2,1,1,0,4,1],
};

const MOCK_SPA_REP_SALES: Record<string, number[]> = {
  "Juli": [0,0,1201,787,199,0,1495,1791,1511,513,614,864,0,973,1244,1145,439,641,0,0,0,785],
  "Nicci": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1240,118],
};

/* --- AESTHETICS CRM --- */
const MOCK_AES_SALES_DAILY = [944,622,1123,735,784,2196,1623,408,1154,2096,3366,437,2537,834,0,0,0,638,397,1592,0,0];
const MOCK_AES_BOOKINGS_DAILY = [6,4,8,5,6,15,7,3,7,15,14,3,11,6,5,11,15,2,3,4,2,12];
const MOCK_AES_BOOKING_TYPES = {
  "Snatch Jawline":   [0,1,0,0,1,1,0,0,1,1,3,0,0,0,1,0,2,0,1,0,0,1],
  "Ultimate Facelift":[1,1,0,0,1,1,1,0,0,2,3,1,2,0,0,1,3,1,0,0,0,3],
  "Hydrafacial":      [0,1,3,3,2,3,1,1,3,5,3,2,4,2,1,2,1,0,1,0,0,2],
  "Laser Hair":       [3,0,2,0,1,2,1,0,0,3,3,0,1,1,1,3,3,1,0,2,1,2],
};

const MOCK_AES_REP_SALES: Record<string, number[]> = {
  "Rana": [239,234,546,0,0,1083,587,0,905,1054,2519,0,973,358,0,909,1010,399,0,249,399,99],
  "Abid": [705,388,577,735,784,1113,1036,408,249,1042,847,437,1564,476,621,636,1491,239,397,1343,139,1670],
};

/* --- SLIMMING CRM --- */
const MOCK_SLIM_SALES_DAILY = [299,0,0,0,0,0,0,0,398,0,0,0,0,199,0,0,0,0,199,0,0,0];
const MOCK_SLIM_BOOKINGS_DAILY = [8,7,11,0,4,8,0,2,17,0,5,6,3,7,0,7,2,1,6,7,5,0];
const MOCK_SLIM_BOOKING_TYPES = {
  "Consultation": [6,7,11,0,4,8,0,2,15,0,5,6,3,7,0,7,2,1,5,7,5,0],
};

const MOCK_SLIM_REP_SALES: Record<string, number[]> = {
  "Adeel": [299,0,0,0,0,0,0,0,398,0,0,0,0,199,0,0,0,0,199,0,0,0],
};

/* --- MESSAGE QUEUE (sampled readings) --- */
const MOCK_MSG_QUEUE = {
  spa:  { crmUnreplied: [7,6,0,0,0,0,0,613], whatsapp: [99,55,0,0,0,141,0,15], email: [290,206,0,0,0,269,0,371] },
  aes:  { crmUnreplied: [4,6,11,0,0,6,2],    whatsapp: [20,11,21,20,13,11,16], email: [16,12,21,13,29,33,11] },
  slim: { crmUnreplied: [4,6,11,0,0,6,2],    whatsapp: [2,5,0,0,0,1,1],        email: [0,0,0,0,0,5,0] },
};

/* ------------------------------------------------------------------ */
/*  COMPUTED METRICS                                                  */
/* ------------------------------------------------------------------ */

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }
function avg(arr: number[]) { const valid = arr.filter(v => v > 0); return valid.length ? sum(valid) / valid.length : 0; }
function last(arr: number[]) { return arr[arr.length - 1]; }

// Sales totals
const spaTotalSales = sum(MOCK_SPA_SALES_DAILY);
const aesTotalSales = sum(MOCK_AES_SALES_DAILY);
const slimTotalSales = sum(MOCK_SLIM_SALES_DAILY);
const totalSalesAll = spaTotalSales + aesTotalSales + slimTotalSales;

// Booking totals
const spaTotalBookings = sum(MOCK_SPA_BOOKINGS_DAILY);
const aesTotalBookings = sum(MOCK_AES_BOOKINGS_DAILY);
const slimTotalBookings = sum(MOCK_SLIM_BOOKINGS_DAILY);
const totalBookingsAll = spaTotalBookings + aesTotalBookings + slimTotalBookings;

// Avg daily bookings (across active days)
const activeDays = DATES.length;
const avgDailyBookings = totalBookingsAll / activeDays;

// Rep totals
function repTotal(sales: Record<string, number[]>) {
  return Object.entries(sales).map(([name, data]) => ({
    name,
    totalSales: sum(data),
    activeDays: data.filter(v => v > 0).length,
    avgDaily: avg(data),
  }));
}

const spaReps = repTotal(MOCK_SPA_REP_SALES);
const aesReps = repTotal(MOCK_AES_REP_SALES);
const slimReps = repTotal(MOCK_SLIM_REP_SALES);

// Top performer
const allReps = [
  ...spaReps.map(r => ({ ...r, brand: "Spa" })),
  ...aesReps.map(r => ({ ...r, brand: "Aesthetics" })),
  ...slimReps.map(r => ({ ...r, brand: "Slimming" })),
];
const topPerformer = allReps.reduce((best, r) => r.totalSales > best.totalSales ? r : best, allReps[0]);

// Message queue latest
const latestCRM = last(MOCK_MSG_QUEUE.spa.crmUnreplied) + last(MOCK_MSG_QUEUE.aes.crmUnreplied) + last(MOCK_MSG_QUEUE.slim.crmUnreplied);
const latestWA = last(MOCK_MSG_QUEUE.spa.whatsapp) + last(MOCK_MSG_QUEUE.aes.whatsapp) + last(MOCK_MSG_QUEUE.slim.whatsapp);
const latestEmail = last(MOCK_MSG_QUEUE.spa.email) + last(MOCK_MSG_QUEUE.aes.email) + last(MOCK_MSG_QUEUE.slim.email);
const avgUnreplied = Math.round((latestCRM + latestWA + latestEmail) / 3);

// Response health color
function healthColor(val: number) {
  if (val < 10) return "text-emerald-600";
  if (val <= 50) return "text-amber-500";
  return "text-red-600";
}
function healthLabel(val: number) {
  if (val < 10) return "Healthy";
  if (val <= 50) return "Attention";
  return "Critical";
}
const responseHealthScore = latestCRM + latestWA + latestEmail;

// Daily bookings trend for chart
const MOCK_DAILY_BOOKINGS_TREND = DATES.map((date, i) => ({
  date,
  Spa: MOCK_SPA_BOOKINGS_DAILY[i] ?? 0,
  Aesthetics: MOCK_AES_BOOKINGS_DAILY[i] ?? 0,
  Slimming: MOCK_SLIM_BOOKINGS_DAILY[i] ?? 0,
}));

// Booking type aggregates — Spa
const spaBookingMix = Object.entries(MOCK_SPA_BOOKING_TYPES).map(([name, data]) => ({
  name,
  value: sum(data),
}));
const spaOther = spaTotalBookings - sum(spaBookingMix.map(b => b.value));
if (spaOther > 0) spaBookingMix.push({ name: "Other", value: spaOther });

// Booking type aggregates — Aesthetics
const aesBookingMix = Object.entries(MOCK_AES_BOOKING_TYPES).map(([name, data]) => ({
  name,
  value: sum(data),
}));
const aesOther = aesTotalBookings - sum(aesBookingMix.map(b => b.value));
if (aesOther > 0) aesBookingMix.push({ name: "Other", value: aesOther });

// Rep leaderboard data
const leaderboardData = allReps.map(r => ({
  name: r.name,
  brand: r.brand,
  totalSales: r.totalSales,
  avgDaily: Math.round(r.avgDaily),
  bookings: r.brand === "Spa" ? spaTotalBookings :
            r.brand === "Aesthetics" ? aesTotalBookings :
            slimTotalBookings,
  salesPerBooking: r.brand === "Spa" && spaTotalBookings > 0 ? Math.round(r.totalSales / spaTotalBookings) :
                   r.brand === "Aesthetics" && aesTotalBookings > 0 ? Math.round(r.totalSales / aesTotalBookings) :
                   r.brand === "Slimming" && slimTotalBookings > 0 ? Math.round(r.totalSales / slimTotalBookings) : 0,
}));

/* ------------------------------------------------------------------ */
/*  RESPONSE TIME SLA DATA                                            */
/* ------------------------------------------------------------------ */

const SLA_TABLE_DATA = [
  { channel: "CRM Leads",  under1hr: "45%", hr1to4: "28%", hr4to24: "18%", over24hr: "9%",  slaMet: 73 },
  { channel: "WhatsApp",   under1hr: "62%", hr1to4: "22%", hr4to24: "12%", over24hr: "4%",  slaMet: 84 },
  { channel: "Email",      under1hr: "31%", hr1to4: "35%", hr4to24: "24%", over24hr: "10%", slaMet: 66 },
  { channel: "Meta DMs",   under1hr: "55%", hr1to4: "25%", hr4to24: "15%", over24hr: "5%",  slaMet: 80 },
];

const slaColumns = [
  { key: "channel", label: "Channel" },
  { key: "under1hr", label: "< 1hr", align: "right" as const },
  { key: "hr1to4", label: "1-4hr", align: "right" as const },
  { key: "hr4to24", label: "4-24hr", align: "right" as const },
  { key: "over24hr", label: "> 24hr", align: "right" as const },
  {
    key: "slaMet",
    label: "SLA Met %",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => {
      const val = Number(v);
      const color = val >= 80 ? "text-emerald-600" : val >= 60 ? "text-amber-500" : "text-red-600";
      return <span className={`font-bold ${color}`}>{val}%</span>;
    },
  },
];

const RESPONSE_TIME_DISTRIBUTION = [
  { bucket: "<5min",   count: 89 },
  { bucket: "5-15min", count: 67 },
  { bucket: "15-30min",count: 45 },
  { bucket: "30-60min",count: 34 },
  { bucket: "1-4hr",   count: 56 },
  { bucket: "4-24hr",  count: 38 },
  { bucket: ">24hr",   count: 18 },
];

const RESPONSE_TIME_COLORS = ["#16A34A", "#22C55E", "#86EFAC", "#FDE047", "#FB923C", "#F87171", "#DC2626"];

/* ------------------------------------------------------------------ */
/*  DAY-OF-WEEK ACTIVITY DATA                                         */
/* ------------------------------------------------------------------ */

const DAY_OF_WEEK_DATA = [
  { day: "Mon", bookings: 38, sales: 4200, calls: 45, messages: 120 },
  { day: "Tue", bookings: 42, sales: 5100, calls: 52, messages: 135 },
  { day: "Wed", bookings: 35, sales: 3800, calls: 41, messages: 110 },
  { day: "Thu", bookings: 48, sales: 5800, calls: 58, messages: 145 },
  { day: "Fri", bookings: 31, sales: 3200, calls: 35, messages: 95 },
  { day: "Sat", bookings: 22, sales: 2100, calls: 15, messages: 60 },
  { day: "Sun", bookings: 8,  sales: 800,  calls: 5,  messages: 25 },
];

const HEATMAP_COLUMNS: { key: keyof typeof DAY_OF_WEEK_DATA[0]; label: string; format?: (v: number) => string }[] = [
  { key: "bookings", label: "Bookings" },
  { key: "sales", label: "Sales (\u20AC)", format: (v: number) => formatCurrency(v) },
  { key: "calls", label: "Calls" },
  { key: "messages", label: "Messages" },
];

const HEATMAP_COL_MAXES: Record<string, number> = {};
for (const col of HEATMAP_COLUMNS) {
  HEATMAP_COL_MAXES[col.key] = Math.max(...DAY_OF_WEEK_DATA.map(r => r[col.key] as number));
}

function heatmapBg(value: number, max: number): string {
  const ratio = max > 0 ? value / max : 0;
  if (ratio >= 0.9) return "bg-blue-600 text-white";
  if (ratio >= 0.7) return "bg-blue-500 text-white";
  if (ratio >= 0.5) return "bg-blue-400 text-white";
  if (ratio >= 0.3) return "bg-blue-300 text-gray-900";
  if (ratio >= 0.15) return "bg-blue-200 text-gray-900";
  return "bg-blue-100 text-gray-900";
}

/* ------------------------------------------------------------------ */
/*  PIE CHART COLORS                                                  */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ["#B8943E", "#2A8A7A", "#6B9080", "#E07A5F", "#4A90D9", "#9CA3AF"];

/* ------------------------------------------------------------------ */
/*  COLUMN DEFINITIONS                                                */
/* ------------------------------------------------------------------ */

const leaderboardColumns = [
  { key: "name", label: "Rep" },
  { key: "brand", label: "Brand" },
  {
    key: "totalSales",
    label: "Total Sales",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => formatCurrency(Number(v)),
  },
  {
    key: "avgDaily",
    label: "Avg Daily",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => formatCurrency(Number(v)),
  },
  {
    key: "salesPerBooking",
    label: "Sales/Booking",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => formatCurrency(Number(v)),
  },
];

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                   */
/* ------------------------------------------------------------------ */

function CRMContent() {
  const kpis: KPIData[] = [
    {
      label: "Avg Daily Bookings",
      value: avgDailyBookings.toFixed(1),
      target: "25",
      targetValue: 25,
      currentValue: avgDailyBookings,
    },
    {
      label: "Total Sales (Period)",
      value: formatCurrency(totalSalesAll),
    },
    {
      label: "Response Health",
      value: healthLabel(responseHealthScore),
    },
    {
      label: "Top Performer",
      value: `${topPerformer.name} (${formatCurrency(topPerformer.totalSales)})`,
    },
    {
      label: "Bookings by Brand",
      value: `Spa: ${spaTotalBookings} / Aes: ${aesTotalBookings} / Slm: ${slimTotalBookings}`,
    },
    {
      label: "Avg Unreplied Msgs",
      value: `${avgUnreplied}`,
    },
  ];

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-foreground">CRM Performance Dashboard</h1>
        <span className="text-sm text-text-secondary">Feb 18 - Mar 14, 2026 | {activeDays} working days</span>
      </div>

      {/* Sub-dashboards */}
      <div className="flex gap-3">
        <Link
          href="/crm/speed-to-lead"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Speed to Lead Dashboard
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Section 1: Sales Performance by Brand */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Sales Performance by Brand</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spa */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.spa }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Spa</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Total Sales</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(spaTotalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Daily Average</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(Math.round(spaTotalSales / activeDays))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Top Rep</span>
                <span className="text-sm font-semibold text-foreground">Juli ({formatCurrency(spaReps.find(r => r.name === "Juli")?.totalSales ?? 0)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Bookings</span>
                <span className="text-sm font-semibold text-foreground">{spaTotalBookings}</span>
              </div>
            </div>
          </Card>

          {/* Aesthetics */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.aesthetics }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Aesthetics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Total Sales</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(aesTotalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Daily Average</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(Math.round(aesTotalSales / activeDays))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Top Rep</span>
                <span className="text-sm font-semibold text-foreground">Abid ({formatCurrency(aesReps.find(r => r.name === "Abid")?.totalSales ?? 0)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Bookings</span>
                <span className="text-sm font-semibold text-foreground">{aesTotalBookings}</span>
              </div>
            </div>
          </Card>

          {/* Slimming */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.slimming }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Slimming</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Total Sales</span>
                <span className="text-sm font-bold text-foreground">{formatCurrency(slimTotalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Daily Average</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(Math.round(slimTotalSales / activeDays))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Top Rep</span>
                <span className="text-sm font-semibold text-foreground">Adeel ({formatCurrency(slimReps.find(r => r.name === "Adeel")?.totalSales ?? 0)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Bookings</span>
                <span className="text-sm font-semibold text-foreground">{slimTotalBookings}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 2: Daily Bookings Trend */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Daily Bookings Trend
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={MOCK_DAILY_BOOKINGS_TREND} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval={1}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Spa"
              stroke={chartColors.spa}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Aesthetics"
              stroke={chartColors.aesthetics}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Slimming"
              stroke={chartColors.slimming}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 3: Rep Leaderboard */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Rep Leaderboard
        </h2>
        <DataTable
          columns={leaderboardColumns}
          data={leaderboardData as unknown as Record<string, unknown>[]}
        />
      </Card>

      {/* Section 4 & 6: Booking Mix — Aesthetics + Spa side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aesthetics Booking Mix */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Booking Mix — Aesthetics
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={aesBookingMix}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {aesBookingMix.map((_, i) => (
                  <Cell key={`aes-pie-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Spa Booking Mix */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Booking Mix — Spa
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={spaBookingMix}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {spaBookingMix.map((_, i) => (
                  <Cell key={`spa-pie-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section 5: Message Queue Health */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Message Queue Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SPA Messages */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.spa }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Spa</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">CRM Unreplied</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.spa.crmUnreplied))}`}>
                  {last(MOCK_MSG_QUEUE.spa.crmUnreplied)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">WhatsApp Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.spa.whatsapp))}`}>
                  {last(MOCK_MSG_QUEUE.spa.whatsapp)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Email Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.spa.email))}`}>
                  {last(MOCK_MSG_QUEUE.spa.email)}
                </span>
              </div>
            </div>
          </Card>

          {/* AESTHETICS Messages */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.aesthetics }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Aesthetics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">CRM Unreplied</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.aes.crmUnreplied))}`}>
                  {last(MOCK_MSG_QUEUE.aes.crmUnreplied)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">WhatsApp Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.aes.whatsapp))}`}>
                  {last(MOCK_MSG_QUEUE.aes.whatsapp)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Email Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.aes.email))}`}>
                  {last(MOCK_MSG_QUEUE.aes.email)}
                </span>
              </div>
            </div>
          </Card>

          {/* SLIMMING Messages */}
          <Card className="p-5 border-l-4" style={{ borderLeftColor: chartColors.slimming }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Slimming</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">CRM Unreplied</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.slim.crmUnreplied))}`}>
                  {last(MOCK_MSG_QUEUE.slim.crmUnreplied)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">WhatsApp Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.slim.whatsapp))}`}>
                  {last(MOCK_MSG_QUEUE.slim.whatsapp)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Email Unread</span>
                <span className={`text-lg font-bold ${healthColor(last(MOCK_MSG_QUEUE.slim.email))}`}>
                  {last(MOCK_MSG_QUEUE.slim.email)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section: Sales by Brand — Stacked Bar */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Daily Sales by Brand
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={DATES.map((date, i) => ({
              date,
              Spa: MOCK_SPA_SALES_DAILY[i] ?? 0,
              Aesthetics: MOCK_AES_SALES_DAILY[i] ?? 0,
              Slimming: MOCK_SLIM_SALES_DAILY[i] ?? 0,
            }))}
            margin={chartDefaults.margin}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="Spa" stackId="sales" fill={chartColors.spa} />
            <Bar dataKey="Aesthetics" stackId="sales" fill={chartColors.aesthetics} />
            <Bar dataKey="Slimming" stackId="sales" fill={chartColors.slimming} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Section: Response Time SLA Tracking */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Response Time SLA</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLA Compliance Table */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">SLA Compliance by Channel</h3>
            <DataTable
              columns={slaColumns}
              data={SLA_TABLE_DATA as unknown as Record<string, unknown>[]}
            />
          </Card>

          {/* Response Time Distribution */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Response Time Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={RESPONSE_TIME_DISTRIBUTION} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <ReferenceLine
                  x="1-4hr"
                  stroke="#DC2626"
                  strokeDasharray="6 3"
                  label={{ value: "SLA: 1hr", position: "top", fill: "#DC2626", fontSize: 11 }}
                />
                <Bar dataKey="count">
                  {RESPONSE_TIME_DISTRIBUTION.map((_, i) => (
                    <Cell key={`rt-cell-${i}`} fill={RESPONSE_TIME_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Section: Day-of-Week Activity Heatmap */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Activity by Day of Week</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-text-secondary">Day</th>
                {HEATMAP_COLUMNS.map((col) => (
                  <th key={col.key} className="text-center py-2 px-3 font-semibold text-text-secondary">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAY_OF_WEEK_DATA.map((row) => (
                <tr key={row.day} className="border-t border-border">
                  <td className="py-2 px-3 font-medium text-foreground">{row.day}</td>
                  {HEATMAP_COLUMNS.map((col) => {
                    const val = row[col.key] as number;
                    const max = HEATMAP_COL_MAXES[col.key];
                    return (
                      <td key={col.key} className="py-2 px-3 text-center">
                        <span className={`inline-block w-full rounded px-2 py-1 text-xs font-semibold ${heatmapBg(val, max)}`}>
                          {col.format ? col.format(val) : val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE (render-prop pattern)                                        */
/* ------------------------------------------------------------------ */

export default function CRMPage() {
  return (
    <DashboardShell>
      {() => <CRMContent />}
    </DashboardShell>
  );
}
