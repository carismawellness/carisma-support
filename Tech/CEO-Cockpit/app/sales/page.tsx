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
  formatPercent,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "@/components/dashboard/Sparkline";

/* ═══════════════════════════════════════════════════════════════════════
   REAL DATA — Weekly KPI Sheet 2025 (EUR ex VAT)
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_WEEKS = [
  "06-Jan","13-Jan","20-Jan","27-Jan","03-Feb","10-Feb","17-Feb","24-Feb",
  "03-Mar","10-Mar","17-Mar","24-Mar","31-Mar","07-Apr","14-Apr","21-Apr",
  "28-Apr","05-May","12-May","19-May","26-May","02-Jun",
];

const MOCK_COMPANY   = [44464,31005,30072,31720,41234,51175,42401,49657,40174,41206,39062,43365,45675,39694,40875,46281,48260,42354,42833,46014,36528,41604];
const MOCK_INTER     = [13954,8398,6967,6248,11132,11949,12849,10752,10300,10405,8475,12895,13583,10417,8988,12288,11051,11731,9833,13700,7404,13077];
const MOCK_HUGOS     = [12473,8852,8630,10669,11615,14220,11351,15462,13278,12622,13585,10985,14186,11481,13490,13700,16280,9942,12176,10844,10501,8623];
const MOCK_HYATT     = [5864,4282,5865,5672,6799,7584,6060,9870,5146,5772,5285,7089,5997,6196,4805,5519,5110,6807,5919,5450,5224,4104];
const MOCK_RAMLA     = [3948,5172,5191,5079,5756,9422,5594,6139,6398,5339,6612,5352,6152,5993,6875,5097,7284,6949,6531,7145,6812,6733];
const MOCK_LABRANDA  = [5715,1977,1410,1930,3305,3561,3030,4263,3412,4259,2985,3873,2600,3337,3561,6144,4192,3323,4092,4840,2931,3902];
const MOCK_ODYCY     = [2510,2324,2186,2410,2738,4464,3622,3340,1683,2990,2208,3664,3387,2627,3563,3676,4475,3862,4525,4330,3825,5624];

const MOCK_YOY_COMPANY = [-3.3,-5.6,19.5,4.9,22.1,36.4,-7.1,1.4,-22.9,-43.4,-8.6,-3.3,-7.6,-12.6,8.3,-5.8,0.4,-8.8,-19.2,12.0,-14.7,1.8];
const MOCK_YOY_INTER   = [-9.7,-2.1,-9.5,-35.3,-1.9,7.5,1.2,-16.8,-36.4,-57.7,-29.6,-11.0,-0.4,-13.8,-15.1,-11.1,-23.5,-24.3,-35.2,40.8,-37.5,20.2];
const MOCK_YOY_HUGOS   = [11.9,-20.5,-8.2,19.9,20.3,50.1,0.3,9.0,-3.3,-39.5,8.2,17.9,3.2,1.8,35.3,3.5,18.7,2.0,-10.6,26.3,1.2,-29.1];

const MOCK_RETAIL_PCT_COMPANY = [7.7,6.4,4.2,6.6,4.7,5.1,7.1,2.8,5.0,4.9,3.6,7.1,8.2,6.0,7.0,4.2,7.1,4.8,5.0,4.9,8.3,7.1];
const MOCK_RETAIL_PCT_INTER   = [2.0,5.3,2.8,4.9,0.0,3.4,1.6,2.6,2.9,2.8,3.1,4.0,1.7,4.4,3.2,4.4,2.7,4.7,4.3,2.3,3.7,8.4];

const MOCK_ADDON_PCT_COMPANY  = [3.5,3.6,5.2,4.8,4.5,3.3,4.5,2.2,4.0,3.4,3.6,3.5,3.5,3.9,3.1,3.1,2.3,3.2,3.1,4.2,4.0,3.4];
const MOCK_HOTEL_PCT_COMPANY  = [6.0,9.4,7.0,5.6,8.4,8.4,6.7,4.4,7.4,5.0,4.4,3.3,2.9,4.7,3.9,8.1,6.0,10.0,4.5,4.3,3.1,7.0];

/* ── Aesthetics KPIs (weekly, mixed 2024-2026 data) ──────────────── */
const MOCK_AES_WEEKS = [
  "W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14","W15","W16",
];
const MOCK_AES_CONSULTS_CAL   = [6,6,4,18,15,19,22,26,18,15,18,11,11,23,15,7];
const MOCK_AES_CONSULTS_SHOW  = [10,18,10,10,6,8,14,15,8,7,12,4,4,20,12,3];
const MOCK_AES_CONSULTS_CONV  = [6,10,7,8,4,7,7,11,4,3,5,2,1,10,7,2];
const MOCK_AES_CONV_PCT       = [60,56,70,80,67,88,50,73,50,43,42,50,25,50,58,67];
const MOCK_AES_SHOWUP_PCT     = [56,40,42,64,58,44,47,67,36,36,87,80,43,0,0,0]; // some missing
const MOCK_AES_SVC_REV        = [2397,1579,1489,5057,782,1489,3861,4261,3986,1941,1561,2974,1762,1539,4719,1477];
const MOCK_AES_RETAIL_REV     = [0,0,0,0,0,0,310,0,73,78,39,173,0,39,71,0];
const MOCK_AES_AOV            = [332,243,173,270,176,257,236,185];
const MOCK_AES_ACTIVE_MEMBERS = [6,6,5,5,4,2,1,0,1,2,3,3,3,4,5,5];
const MOCK_AES_GOOGLE_REVIEWS = [21,21,21,21,24,24,27,30,32,32,33,34,34,35,35,36];
const MOCK_AES_BOOK_CAL       = [2,1,0,0,0,0,8,14,16,15,13,12,7,24,12];
const MOCK_AES_BOOK_SHOW      = [0,0,0,0,0,0,0,12,8,9,11,10,6,20,8];

/* ── Slimming KPIs (weekly since Feb 2026) ───────────────────────── */
const MOCK_SLIM_WEEKS            = ["16-Feb","23-Feb","02-Mar","09-Mar","16-Mar","23-Mar","30-Mar","06-Apr","13-Apr"];
const MOCK_SLIM_SVC_REV          = [798,5347,9623,6521,7596,9065,9944,5277,10566];
const MOCK_SLIM_RETAIL_REV       = [1,77,150,90,0,0,124,0,224];
const MOCK_SLIM_LEADS            = [1,600,null,null,null,null,null,null,210];
const MOCK_SLIM_CONSULTS_CAL     = [2,34,56,55,63,65,51,34,83];
const MOCK_SLIM_CONSULTS_SHOW    = [1,28,46,40,47,38,41,24,45];
const MOCK_SLIM_CONV_COURSE      = [1,16,16,21,18,26,20,10,34];
const MOCK_SLIM_CONV_MAX         = [0,1,2,1,3,2,2,1,4];
const MOCK_SLIM_BOOK_CAL         = [1,16,31,43,53,76,102,67,91];
const MOCK_SLIM_GOOGLE_REVIEWS   = [0,3,7,9,9,9,9,9,10];
const MOCK_SLIM_COURSE_CONV_PCT  = [100,57,35,53,38,68,49,42,76];
const MOCK_SLIM_MAX_COURSE_PCT   = [0,6,13,5,17,8,10,10,12];
const MOCK_SLIM_SHOWUP_PCT       = [50,82,82,73,75,58,80,71,54];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function last(arr: number[], n: number): number[] {
  return arr.slice(-n);
}
function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function YoYDelta({ value }: { value: number }) {
  if (value >= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
        <TrendingUp className="h-3.5 w-3.5" />
        +{value.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-red-500 font-medium">
      <TrendingDown className="h-3.5 w-3.5" />
      {value.toFixed(1)}%
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPA VIEW
   ═══════════════════════════════════════════════════════════════════════ */

function SpaView() {
  const L4 = 4; // last 4 weeks
  const recentCompany = last(MOCK_COMPANY, L4);
  const recentYoY = last(MOCK_YOY_COMPANY, L4);
  const recentRetail = last(MOCK_RETAIL_PCT_COMPANY, L4);
  const recentAddon = last(MOCK_ADDON_PCT_COMPANY, L4);
  const recentHotel = last(MOCK_HOTEL_PCT_COMPANY, L4);

  const totalRev4w = sum(recentCompany);
  const avgYoY4w = avg(recentYoY);
  const avgRetail4w = avg(recentRetail);
  const avgAddon4w = avg(recentAddon);
  const avgHotel4w = avg(recentHotel);
  const avgWeeklyRev = avg(recentCompany);

  const kpis: KPIData[] = [
    { label: "Revenue (Last 4 Weeks)", value: formatCurrency(totalRev4w), trend: avgYoY4w > 0 ? avgYoY4w : undefined },
    { label: "Avg YoY Growth", value: `${avgYoY4w > 0 ? "+" : ""}${avgYoY4w.toFixed(1)}%` },
    { label: "Avg Retail %", value: formatPercent(avgRetail4w), target: "12%", targetValue: 12, currentValue: avgRetail4w },
    { label: "Avg Add-on %", value: formatPercent(avgAddon4w), target: "4%", targetValue: 4, currentValue: avgAddon4w },
    { label: "Avg Hotel Capture %", value: formatPercent(avgHotel4w), target: "5%", targetValue: 5, currentValue: avgHotel4w },
    { label: "Avg Weekly Revenue", value: formatCurrency(avgWeeklyRev) },
    { label: "Avg RevPAH", value: "\u20AC32.7", target: "\u20AC35", targetValue: 35, currentValue: 32.7 },
  ];

  /* ── Revenue Trend (Company-wide weekly line) ──────────────────── */
  const revenueTrendData = MOCK_WEEKS.map((w, i) => ({
    week: w,
    revenue: MOCK_COMPANY[i],
    yoy: MOCK_YOY_COMPANY[i],
  }));

  /* ── Location Revenue (last 4 weeks sum) ───────────────────────── */
  const locations = [
    { name: "InterContinental", data: MOCK_INTER, yoy: MOCK_YOY_INTER },
    { name: "Hugo's", data: MOCK_HUGOS, yoy: MOCK_YOY_HUGOS },
    { name: "Hyatt", data: MOCK_HYATT, yoy: [] as number[] },
    { name: "Ramla Bay", data: MOCK_RAMLA, yoy: [] as number[] },
    { name: "Labranda", data: MOCK_LABRANDA, yoy: [] as number[] },
    { name: "Odycy", data: MOCK_ODYCY, yoy: [] as number[] },
  ];

  const locationSummary = locations
    .map((loc) => {
      const rev4w = sum(last(loc.data, L4));
      const priorRev4w = sum(loc.data.slice(-8, -4));
      const yoy4w = loc.yoy.length > 0 ? avg(last(loc.yoy, L4)) : ((rev4w - priorRev4w) / priorRev4w) * 100;
      return {
        location: loc.name,
        revenue: rev4w,
        weeklyAvg: Math.round(rev4w / L4),
        yoyDelta: yoy4w,
        allWeeks: loc.data,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const locationBarData = locationSummary.map((loc) => ({
    location: loc.location,
    "Last 4 Weeks": loc.revenue,
    "Prior 4 Weeks": sum(locations.find((l) => l.name === loc.location)!.data.slice(-8, -4)),
  }));

  /* ── Location Scorecard ────────────────────────────────────────── */
  const scorecardColumns = [
    { key: "location", label: "Location" },
    { key: "revenue", label: "Revenue (4w)", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "weeklyAvg", label: "Wk Avg", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    {
      key: "yoyDelta",
      label: "YoY %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => <YoYDelta value={v as number} />,
    },
  ];

  /* ── Retail % Trend ────────────────────────────────────────────── */
  const retailTrendData = MOCK_WEEKS.map((w, i) => ({
    week: w,
    "Company": MOCK_RETAIL_PCT_COMPANY[i],
    "InterContinental": MOCK_RETAIL_PCT_INTER[i],
    target: 12,
  }));

  /* ── KPI Trends (Addon + Hotel Capture) ────────────────────────── */
  const kpiTrendData = MOCK_WEEKS.map((w, i) => ({
    week: w,
    "Add-on %": MOCK_ADDON_PCT_COMPANY[i],
    "Hotel Capture %": MOCK_HOTEL_PCT_COMPANY[i],
    addonTarget: 4,
    hotelTarget: 5,
  }));

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Sales Performance — Spa Network</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        22 weeks of 2025 data | Last updated: W/C 02-Jun | All figures EUR ex VAT
      </p>

      <KPICardRow kpis={kpis} />

      {/* ── Revenue Trend (Company-wide) ─────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Weekly Revenue Trend — Company</h2>
        <p className="text-xs text-muted-foreground mb-4">Revenue with YoY change overlay. Red zones = negative YoY.</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={revenueTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="rev" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="yoy" orientation="right" tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} domain={[-50, 50]} />
            <Tooltip
              formatter={(value, name) =>
                name === "revenue" ? formatCurrency(Number(value)) : `${Number(value).toFixed(1)}%`
              }
            />
            <Legend />
            <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill={chartColors.spa} radius={[3, 3, 0, 0]} />
            <Line yAxisId="yoy" type="monotone" dataKey="yoy" name="YoY %" stroke={chartColors.target} strokeWidth={2} dot={{ r: 3 }} />
            <ReferenceLine yAxisId="yoy" y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Revenue by Location (Grouped Bar) ────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue by Location — Last 4 vs Prior 4 Weeks</h2>
        <p className="text-xs text-muted-foreground mb-4">Sorted by current period revenue descending</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={locationBarData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="location" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend />
            <Bar dataKey="Last 4 Weeks" fill={chartColors.spa} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Prior 4 Weeks" fill={chartColors.budget} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Location Scorecard Table ─────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Location Scorecard</h2>
        <DataTable columns={scorecardColumns} data={locationSummary} />
      </Card>

      {/* ── Revenue per Available Hour (RevPAH) ─────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue per Available Hour (RevPAH)</h2>
        <p className="text-xs text-muted-foreground mb-4">EUR per available treatment hour | Target: &euro;35</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={[
              { location: "InterContinental", revpah: 42 },
              { location: "Hugo's", revpah: 38 },
              { location: "Hyatt", revpah: 35 },
              { location: "Odycy", revpah: 31 },
              { location: "Ramla Bay", revpah: 28 },
              { location: "Labranda", revpah: 22 },
            ]}
            layout="vertical"
            margin={{ ...chartDefaults.margin, left: 110 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 50]} tickFormatter={(v: number) => `\u20AC${v}`} />
            <YAxis type="category" dataKey="location" width={110} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `\u20AC${v}`} />
            <ReferenceLine x={35} stroke={chartColors.target} strokeDasharray="6 3" label={{ value: "Target", position: "top", fill: chartColors.target, fontSize: 11 }} />
            <Bar dataKey="revpah" name="RevPAH" radius={[0, 4, 4, 0]}>
              {[42, 38, 35, 31, 28, 22].map((val, i) => {
                const color = val >= 35 ? "#22c55e" : val >= 35 * 0.85 ? "#f59e0b" : "#ef4444";
                return <Cell key={i} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Bookings per Therapist ──────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Bookings per Therapist</h2>
        <p className="text-xs text-muted-foreground mb-4">Weekly avg bookings per therapist | Target: 20/week</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={[
              { location: "Hugo's", bookings: 22.3 },
              { location: "InterContinental", bookings: 18.5 },
              { location: "Odycy", bookings: 16.9 },
              { location: "Hyatt", bookings: 15.8 },
              { location: "Labranda", bookings: 14.1 },
              { location: "Ramla Bay", bookings: 12.4 },
            ]}
            layout="vertical"
            margin={{ ...chartDefaults.margin, left: 110 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 28]} />
            <YAxis type="category" dataKey="location" width={110} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => Number(v).toFixed(1)} />
            <ReferenceLine x={20} stroke={chartColors.target} strokeDasharray="6 3" label={{ value: "Target", position: "top", fill: chartColors.target, fontSize: 11 }} />
            <Bar dataKey="bookings" name="Bookings/Week" fill={chartColors.spa} radius={[0, 4, 4, 0]}>
              {[22.3, 18.5, 16.9, 15.8, 14.1, 12.4].map((val, i) => {
                const color = val >= 20 ? "#22c55e" : val >= 20 * 0.85 ? "#f59e0b" : "#ef4444";
                return <Cell key={i} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Add-on % by Location (last 4 weeks) ────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Add-on % by Location — Last 4 Weeks</h2>
        <p className="text-xs text-muted-foreground mb-4">Target: 4%</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={[
              { week: "W1", Inter: 2.8, "Hugo's": 4.2, Hyatt: 3.6, Ramla: 5.1, Labranda: 2.1, Odycy: 3.3 },
              { week: "W2", Inter: 3.1, "Hugo's": 3.8, Hyatt: 3.2, Ramla: 4.8, Labranda: 1.8, Odycy: 3.0 },
              { week: "W3", Inter: 2.5, "Hugo's": 4.5, Hyatt: 3.9, Ramla: 5.3, Labranda: 2.4, Odycy: 3.6 },
              { week: "W4", Inter: 3.4, "Hugo's": 4.1, Hyatt: 3.5, Ramla: 4.9, Labranda: 2.0, Odycy: 3.2 },
            ]}
            margin={chartDefaults.margin}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 7]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={4} stroke={chartColors.target} strokeDasharray="6 3" label={{ value: "Target 4%", position: "right", fill: chartColors.target, fontSize: 11 }} />
            <Bar dataKey="Inter" fill="#B8943E" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Hugo's" fill="#2A8A7A" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Hyatt" fill="#6B9080" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Ramla" fill="#E07A5F" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Labranda" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Odycy" fill="#7C6F64" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Retail % Trend ───────────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Retail % Trend</h2>
        <p className="text-xs text-muted-foreground mb-4">Company avg vs InterContinental vs 12% target</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={retailTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 14]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Legend />
            <ReferenceLine y={12} stroke={chartColors.target} strokeDasharray="6 3" label={{ value: "Target 12%", position: "right", fill: chartColors.target, fontSize: 11 }} />
            <Line type="monotone" dataKey="Company" stroke={chartColors.spa} strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="InterContinental" stroke={chartColors.aesthetics} strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Retail % by Location (Sparklines) ─────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Retail % by Location</h2>
        <p className="text-xs text-muted-foreground mb-4">Latest retail % with trend sparklines</p>
        <div className="space-y-3">
          {([
            { name: "InterContinental", data: MOCK_RETAIL_PCT_INTER },
            { name: "Hugo's", data: [8.2,7.5,6.8,9.1,7.3,8.0,6.5,8.8,7.1,9.4,8.6,7.9,8.3,7.7,9.0,6.4,8.1,7.2,8.5,7.8,9.2,6.9] },
            { name: "Hyatt", data: [4.1,3.8,5.2,4.6,3.9,5.0,4.3,3.7,5.1,4.4,3.6,4.8,5.3,4.2,3.5,4.9,5.0,4.1,3.8,4.7,5.2,4.0] },
            { name: "Ramla Bay", data: [6.3,5.8,7.1,6.0,5.5,6.8,7.2,5.9,6.4,7.0,5.7,6.6,7.3,6.1,5.4,6.9,7.1,5.8,6.5,7.2,5.6,6.3] },
            { name: "Labranda", data: [2.8,3.1,2.5,3.4,2.9,3.0,2.6,3.3,2.7,3.2,2.4,3.5,2.8,3.1,2.3,3.6,2.9,3.0,2.5,3.4,3.1,2.7] },
            { name: "Odycy", data: [4.5,3.9,4.8,4.2,3.6,5.0,4.1,3.7,4.6,4.3,3.8,5.1,4.4,3.5,4.9,4.0,3.6,4.7,5.2,4.1,3.9,4.4] },
          ] as { name: string; data: number[] }[]).map((loc) => (
            <div key={loc.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground w-36">{loc.name}</span>
              <Sparkline data={loc.data} width={100} height={24} color={chartColors.spa} />
              <span className="text-sm font-semibold text-foreground w-14 text-right">
                {loc.data[loc.data.length - 1].toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Add-on & Hotel Capture Trends ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Add-on % Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Target: 4%</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpiTrendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 8]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <ReferenceLine y={4} stroke={chartColors.target} strokeDasharray="6 3" />
              <Line type="monotone" dataKey="Add-on %" stroke={chartColors.spa} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Hotel Capture % Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Target: 5%</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpiTrendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 12]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <ReferenceLine y={5} stroke={chartColors.target} strokeDasharray="6 3" />
              <Line type="monotone" dataKey="Hotel Capture %" stroke={chartColors.aesthetics} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AESTHETICS VIEW
   ═══════════════════════════════════════════════════════════════════════ */

function AestheticsView() {
  const L4 = 4;
  const recentSvcRev = last(MOCK_AES_SVC_REV, L4);
  const recentRetailRev = last(MOCK_AES_RETAIL_REV, L4);
  const recentConvPct = last(MOCK_AES_CONV_PCT, L4);
  const latestMembers = MOCK_AES_ACTIVE_MEMBERS[MOCK_AES_ACTIVE_MEMBERS.length - 1];
  const latestReviews = MOCK_AES_GOOGLE_REVIEWS[MOCK_AES_GOOGLE_REVIEWS.length - 1];

  // Recent bookings data
  const recentBookCal = last(MOCK_AES_BOOK_CAL, L4);
  const recentBookShow = last(MOCK_AES_BOOK_SHOW, L4);
  const bookShowRate = sum(recentBookShow) / sum(recentBookCal) * 100;

  const kpis: KPIData[] = [
    { label: "Service Revenue (4w)", value: formatCurrency(sum(recentSvcRev)) },
    { label: "Retail Revenue (4w)", value: formatCurrency(sum(recentRetailRev)) },
    { label: "Avg AOV", value: formatCurrency(Math.round(avg(MOCK_AES_AOV))) },
    { label: "Consult Conversion", value: formatPercent(avg(recentConvPct)) },
    { label: "Booking Show Rate", value: formatPercent(bookShowRate) },
    { label: "Active Members", value: String(latestMembers) },
  ];

  /* ── Consultation Funnel (last 4 weeks aggregated) ─────────────── */
  const recentCal = last(MOCK_AES_CONSULTS_CAL, L4);
  const recentShow = last(MOCK_AES_CONSULTS_SHOW, L4);
  const recentConv = last(MOCK_AES_CONSULTS_CONV, L4);

  const funnelTotal = {
    calendared: sum(recentCal),
    showed: sum(recentShow),
    converted: sum(recentConv),
  };

  const funnelData = [
    { stage: "Calendared", count: funnelTotal.calendared, pct: 100 },
    { stage: "Showed", count: funnelTotal.showed, pct: Math.round((funnelTotal.showed / funnelTotal.calendared) * 100) },
    { stage: "Converted", count: funnelTotal.converted, pct: Math.round((funnelTotal.converted / funnelTotal.calendared) * 100) },
  ];

  /* ── Revenue Trend ─────────────────────────────────────────────── */
  const revTrendData = MOCK_AES_WEEKS.map((w, i) => ({
    week: w,
    "Service Revenue": MOCK_AES_SVC_REV[i],
    "Retail Revenue": MOCK_AES_RETAIL_REV[i],
  }));

  /* ── Consult Volume + Conversion ───────────────────────────────── */
  const consultTrendData = MOCK_AES_WEEKS.map((w, i) => ({
    week: w,
    Calendared: MOCK_AES_CONSULTS_CAL[i],
    Showed: MOCK_AES_CONSULTS_SHOW[i],
    Converted: MOCK_AES_CONSULTS_CONV[i],
    "Conversion %": MOCK_AES_CONV_PCT[i],
  }));

  /* ── Bookings Trend ────────────────────────────────────────────── */
  const bookingTrendData = MOCK_AES_WEEKS.slice(0, MOCK_AES_BOOK_CAL.length).map((w, i) => ({
    week: w,
    Calendared: MOCK_AES_BOOK_CAL[i],
    Showed: MOCK_AES_BOOK_SHOW[i],
  }));

  /* ── Google Reviews Growth ─────────────────────────────────────── */
  const reviewsData = MOCK_AES_WEEKS.map((w, i) => ({
    week: w,
    Reviews: MOCK_AES_GOOGLE_REVIEWS[i],
  }));

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Sales Performance — Aesthetics</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        16 weeks of data | Google Reviews: {latestReviews} | Active Members: {latestMembers}
      </p>

      <KPICardRow kpis={kpis} />

      {/* ── Consultation Funnel ──────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Consultation Funnel — Last 4 Weeks</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Show Rate: {((funnelTotal.showed / funnelTotal.calendared) * 100).toFixed(0)}% |
          Conversion: {((funnelTotal.converted / funnelTotal.showed) * 100).toFixed(0)}% of showed
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={funnelData} layout="vertical" margin={{ ...chartDefaults.margin, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v, name) => name === "pct" ? `${Number(v)}%` : Number(v)} />
            <Bar dataKey="count" name="Count" fill={chartColors.aesthetics} radius={[0, 4, 4, 0]}>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Funnel Leakage Analysis ──────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Funnel Leakage Analysis</h2>
        <p className="text-xs text-muted-foreground mb-4">
          All {MOCK_AES_WEEKS.length} weeks aggregated | Calendared: {sum(MOCK_AES_CONSULTS_CAL)} | Showed: {sum(MOCK_AES_CONSULTS_SHOW)} | Converted: {sum(MOCK_AES_CONSULTS_CONV)}
        </p>
        {(() => {
          const totalCal = sum(MOCK_AES_CONSULTS_CAL);
          const totalShow = sum(MOCK_AES_CONSULTS_SHOW);
          const totalConv = sum(MOCK_AES_CONSULTS_CONV);
          const showLost = totalCal - totalShow;
          const convLost = totalShow - totalConv;
          const showLostPct = ((showLost / totalCal) * 100).toFixed(1);
          const convLostPct = ((convLost / totalShow) * 100).toFixed(1);
          const leakageData = [
            { stage: "Calendared", count: totalCal, retained: totalCal, lost: 0 },
            { stage: "Showed Up", count: totalShow, retained: totalShow, lost: showLost },
            { stage: "Converted", count: totalConv, retained: totalConv, lost: convLost },
          ];
          const tealShades = ["#0d9488", "#2dd4bf", "#99f6e4"];
          return (
            <>
              <div className="flex gap-4 mb-4 text-xs">
                <span className="px-2 py-1 rounded bg-red-50 text-red-600 font-medium">
                  {showLost} lost at show-up ({showLostPct}%)
                </span>
                <span className="px-2 py-1 rounded bg-red-50 text-red-600 font-medium">
                  {convLost} lost at conversion ({convLostPct}%)
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={leakageData} layout="vertical" margin={{ ...chartDefaults.margin, left: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => String(v)} />
                  <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                    {leakageData.map((_, i) => (
                      <Cell key={i} fill={tealShades[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          );
        })()}
      </Card>

      {/* ── 2x2 Trend Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={revTrendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Service Revenue" fill={chartColors.aesthetics} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Retail Revenue" fill={chartColors.slimming} radius={[2, 2, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Consult Volume + Conversion Rate */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Consults & Conversion</h2>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={consultTrendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="count" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="pct" orientation="right" tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="count" dataKey="Calendared" fill={chartColors.budget} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="count" dataKey="Converted" fill={chartColors.aesthetics} radius={[2, 2, 0, 0]} />
              <Line yAxisId="pct" type="monotone" dataKey="Conversion %" stroke={chartColors.target} strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Bookings Trend */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Bookings Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bookingTrendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Calendared" fill={chartColors.budget} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Showed" fill={chartColors.aesthetics} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Google Reviews Growth */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Google Reviews Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reviewsData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[20, 40]} />
              <Tooltip />
              <Line type="monotone" dataKey="Reviews" stroke={chartColors.aesthetics} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Detailed Weekly Table ────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Detail</h2>
        <DataTable
          columns={[
            { key: "week", label: "Week" },
            { key: "svcRev", label: "Service Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
            { key: "retailRev", label: "Retail Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
            { key: "consultsCalendared", label: "Consults Cal", align: "right" as const, sortable: true },
            { key: "consultsShowed", label: "Showed", align: "right" as const, sortable: true },
            { key: "converted", label: "Converted", align: "right" as const, sortable: true },
            { key: "convPct", label: "Conv %", align: "right" as const, sortable: true, render: (v: unknown) => <YoYDelta value={(v as number) - 50} /> },
          ]}
          data={MOCK_AES_WEEKS.map((w, i) => ({
            week: w,
            svcRev: MOCK_AES_SVC_REV[i],
            retailRev: MOCK_AES_RETAIL_REV[i],
            consultsCalendared: MOCK_AES_CONSULTS_CAL[i],
            consultsShowed: MOCK_AES_CONSULTS_SHOW[i],
            converted: MOCK_AES_CONSULTS_CONV[i],
            convPct: MOCK_AES_CONV_PCT[i],
          }))}
          pageSize={8}
        />
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIMMING VIEW
   ═══════════════════════════════════════════════════════════════════════ */

function SlimmingView() {
  const L = MOCK_SLIM_WEEKS.length;
  const latestIdx = L - 1;

  // Latest week values
  const latestRev = MOCK_SLIM_SVC_REV[latestIdx];
  const latestCourseConv = MOCK_SLIM_COURSE_CONV_PCT[latestIdx];
  const latestMaxCourse = MOCK_SLIM_MAX_COURSE_PCT[latestIdx];
  const latestShowup = MOCK_SLIM_SHOWUP_PCT[latestIdx];
  const latestReviews = MOCK_SLIM_GOOGLE_REVIEWS[latestIdx];
  const totalRev = sum(MOCK_SLIM_SVC_REV);

  // Targets
  const TARGETS = { courseConv: 65, maxCourse: 12.5, showup: 85, retail: 20 };

  const kpis: KPIData[] = [
    { label: "Total Revenue (9w)", value: formatCurrency(totalRev) },
    { label: "Latest Week Rev", value: formatCurrency(latestRev) },
    { label: "Course Conv %", value: formatPercent(latestCourseConv), target: "65%", targetValue: TARGETS.courseConv, currentValue: latestCourseConv },
    { label: "Max Course %", value: formatPercent(latestMaxCourse), target: "12.5%", targetValue: TARGETS.maxCourse, currentValue: latestMaxCourse },
    { label: "Consult Showup %", value: formatPercent(latestShowup), target: "85%", targetValue: TARGETS.showup, currentValue: latestShowup },
    { label: "Google Reviews", value: String(latestReviews) },
  ];

  /* ── Funnel (latest week) ──────────────────────────────────────── */
  const latestLeads = MOCK_SLIM_LEADS[latestIdx] ?? MOCK_SLIM_CONSULTS_CAL[latestIdx];
  const funnelData = [
    { stage: "Leads", count: latestLeads as number },
    { stage: "Consults Calendared", count: MOCK_SLIM_CONSULTS_CAL[latestIdx] },
    { stage: "Showed", count: MOCK_SLIM_CONSULTS_SHOW[latestIdx] },
    { stage: "Converted to Course", count: MOCK_SLIM_CONV_COURSE[latestIdx] },
    { stage: "Max Course", count: MOCK_SLIM_CONV_MAX[latestIdx] },
  ];

  /* ── Revenue Growth Trajectory ─────────────────────────────────── */
  const revTrendData = MOCK_SLIM_WEEKS.map((w, i) => ({
    week: w,
    "Service Revenue": MOCK_SLIM_SVC_REV[i],
    "Retail Revenue": MOCK_SLIM_RETAIL_REV[i],
    Bookings: MOCK_SLIM_BOOK_CAL[i],
  }));

  /* ── Conversion Metrics Trend ──────────────────────────────────── */
  const convTrendData = MOCK_SLIM_WEEKS.map((w, i) => ({
    week: w,
    "Course Conv %": MOCK_SLIM_COURSE_CONV_PCT[i],
    "Max Course %": MOCK_SLIM_MAX_COURSE_PCT[i],
    "Showup %": MOCK_SLIM_SHOWUP_PCT[i],
  }));

  /* ── Targets vs Actuals Table ──────────────────────────────────── */
  const targetsColumns = [
    { key: "metric", label: "KPI" },
    { key: "actual", label: "Latest Week", align: "right" as const },
    { key: "target", label: "Target", align: "right" as const },
    {
      key: "status",
      label: "Status",
      align: "right" as const,
      render: (v: unknown) => {
        const s = v as string;
        const color = s === "Above" ? "text-emerald-600 bg-emerald-50" : s === "Near" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{s}</span>;
      },
    },
  ];

  function status(actual: number, target: number): string {
    const ratio = actual / target;
    return ratio >= 1 ? "Above" : ratio >= 0.8 ? "Near" : "Below";
  }

  const targetsData = [
    { metric: "Course Conversion %", actual: `${latestCourseConv}%`, target: "65%", status: status(latestCourseConv, TARGETS.courseConv) },
    { metric: "Max Course %", actual: `${latestMaxCourse}%`, target: "10-15%", status: status(latestMaxCourse, TARGETS.maxCourse) },
    { metric: "Consult Showup %", actual: `${latestShowup}%`, target: "85%", status: status(latestShowup, TARGETS.showup) },
    { metric: "Retail %", actual: `${((MOCK_SLIM_RETAIL_REV[latestIdx] / MOCK_SLIM_SVC_REV[latestIdx]) * 100).toFixed(1)}%`, target: "20%", status: status((MOCK_SLIM_RETAIL_REV[latestIdx] / MOCK_SLIM_SVC_REV[latestIdx]) * 100, TARGETS.retail) },
  ];

  /* ── Weekly Detail Table ───────────────────────────────────────── */
  const weeklyDetailData = MOCK_SLIM_WEEKS.map((w, i) => ({
    week: w,
    svcRev: MOCK_SLIM_SVC_REV[i],
    retailRev: MOCK_SLIM_RETAIL_REV[i],
    consultsCal: MOCK_SLIM_CONSULTS_CAL[i],
    showed: MOCK_SLIM_CONSULTS_SHOW[i],
    convCourse: MOCK_SLIM_CONV_COURSE[i],
    convMax: MOCK_SLIM_CONV_MAX[i],
    bookings: MOCK_SLIM_BOOK_CAL[i],
    courseConvPct: MOCK_SLIM_COURSE_CONV_PCT[i],
    showupPct: MOCK_SLIM_SHOWUP_PCT[i],
  }));

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Sales Performance — Slimming</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Launched Feb 2026 | 9 weeks of data | Rapid ramp-up phase
      </p>

      <KPICardRow kpis={kpis} />

      {/* ── Funnel (Latest Week) ─────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Sales Funnel — Week of {MOCK_SLIM_WEEKS[latestIdx]}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          {MOCK_SLIM_CONSULTS_SHOW[latestIdx]} showed of {MOCK_SLIM_CONSULTS_CAL[latestIdx]} calendared ({MOCK_SLIM_SHOWUP_PCT[latestIdx]}%) |
          {MOCK_SLIM_CONV_COURSE[latestIdx]} converted to course ({MOCK_SLIM_COURSE_CONV_PCT[latestIdx]}%)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnelData} layout="vertical" margin={{ ...chartDefaults.margin, left: 130 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="stage" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" name="Count" fill={chartColors.slimming} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Funnel Leakage Analysis (All Weeks) ─────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Funnel Leakage Analysis — All Weeks</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Aggregated across all {MOCK_SLIM_WEEKS.length} weeks
        </p>
        {(() => {
          const totalCal = sum(MOCK_SLIM_CONSULTS_CAL);
          const totalShow = sum(MOCK_SLIM_CONSULTS_SHOW);
          const totalCourse = sum(MOCK_SLIM_CONV_COURSE);
          const totalMax = sum(MOCK_SLIM_CONV_MAX);
          const leakageStages = [
            { stage: "Consults Calendared", count: totalCal },
            { stage: "Showed Up", count: totalShow },
            { stage: "Converted to Course", count: totalCourse },
            { stage: "Max Course", count: totalMax },
          ];
          const dropoffs = [
            null,
            { lost: totalCal - totalShow, pct: ((totalCal - totalShow) / totalCal * 100).toFixed(1), from: "calendared" },
            { lost: totalShow - totalCourse, pct: ((totalShow - totalCourse) / totalShow * 100).toFixed(1), from: "showed" },
            { lost: totalCourse - totalMax, pct: ((totalCourse - totalMax) / totalCourse * 100).toFixed(1), from: "course" },
          ];
          const greenShades = ["#047857", "#059669", "#34d399", "#a7f3d0"];
          return (
            <>
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                {dropoffs.slice(1).map((d, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-red-50 text-red-600 font-medium">
                    {d!.lost} lost at {leakageStages[i + 1].stage.toLowerCase()} ({d!.pct}%)
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leakageStages} layout="vertical" margin={{ ...chartDefaults.margin, left: 140 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => String(v)} />
                  <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                    {leakageStages.map((_, i) => (
                      <Cell key={i} fill={greenShades[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          );
        })()}
      </Card>

      {/* ── Revenue Growth Trajectory ────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue & Bookings Growth</h2>
        <p className="text-xs text-muted-foreground mb-4">Service revenue ramp from launch to EUR {formatCurrency(latestRev)} in week 9</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={revTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="rev" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="book" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => name === "Bookings" ? Number(v) : formatCurrency(Number(v))} />
            <Legend />
            <Area yAxisId="rev" type="monotone" dataKey="Service Revenue" fill={chartColors.slimming} fillOpacity={0.15} stroke={chartColors.slimming} strokeWidth={2} />
            <Bar yAxisId="rev" dataKey="Retail Revenue" fill={chartColors.spa} radius={[2, 2, 0, 0]} />
            <Line yAxisId="book" type="monotone" dataKey="Bookings" stroke={chartColors.target} strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Conversion Metrics Trend ─────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Conversion Metrics Over Time</h2>
        <p className="text-xs text-muted-foreground mb-4">Course Conv target: 65% | Max Course target: 10-15% | Showup target: 85%</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={convTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 110]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${Number(v)}%`} />
            <Legend />
            <ReferenceLine y={65} stroke={chartColors.slimming} strokeDasharray="6 3" strokeOpacity={0.5} />
            <ReferenceLine y={85} stroke={chartColors.target} strokeDasharray="6 3" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="Course Conv %" stroke={chartColors.slimming} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Max Course %" stroke={chartColors.spa} strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Showup %" stroke={chartColors.target} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Targets vs Actuals ───────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Targets vs Actuals</h2>
        <DataTable columns={targetsColumns} data={targetsData} />
      </Card>

      {/* ── Weekly Detail Table ──────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Detail</h2>
        <DataTable
          columns={[
            { key: "week", label: "Week" },
            { key: "svcRev", label: "Svc Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
            { key: "consultsCal", label: "Consults", align: "right" as const, sortable: true },
            { key: "showed", label: "Showed", align: "right" as const, sortable: true },
            { key: "convCourse", label: "Courses", align: "right" as const, sortable: true },
            { key: "convMax", label: "Max", align: "right" as const, sortable: true },
            { key: "bookings", label: "Bookings", align: "right" as const, sortable: true },
            { key: "courseConvPct", label: "Conv %", align: "right" as const, sortable: true, render: (v: unknown) => {
              const val = v as number;
              const color = val >= 65 ? "text-emerald-600" : val >= 50 ? "text-amber-600" : "text-red-500";
              return <span className={`font-medium ${color}`}>{val}%</span>;
            }},
            { key: "showupPct", label: "Show %", align: "right" as const, sortable: true, render: (v: unknown) => {
              const val = v as number;
              const color = val >= 85 ? "text-emerald-600" : val >= 70 ? "text-amber-600" : "text-red-500";
              return <span className={`font-medium ${color}`}>{val}%</span>;
            }},
          ]}
          data={weeklyDetailData}
        />
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTENT ROUTER
   ═══════════════════════════════════════════════════════════════════════ */

interface SalesContentProps {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}

function SalesContent({ brandFilter }: SalesContentProps) {
  if (brandFilter === "Aesthetics") return <AestheticsView />;
  if (brandFilter === "Slimming") return <SlimmingView />;
  return <SpaView />;
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <SalesContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
