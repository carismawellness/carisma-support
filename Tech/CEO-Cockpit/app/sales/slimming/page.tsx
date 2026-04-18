"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CIChat } from "@/components/ci/CIChat";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { FunnelChart } from "@/components/sales/FunnelChart";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  ComposedChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Bar,
  Line,
  LineChart,
} from "recharts";
import {
  TrendingUp,
  Rocket,
  Users,
  DollarSign,
  Clock,
  Stethoscope,
  UserCheck,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Weekly KPIs since Feb 2026 launch
   ═══════════════════════════════════════════════════════════════════════ */

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
   MOCK DATA — Therapist Performance
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_THERAPIST_SERVICE = [
  { name: "Maria Vella", revenue: 3240 },
  { name: "Katya Borg", revenue: 2890 },
  { name: "Daniela Camilleri", revenue: 2450 },
  { name: "Joanne Grech", revenue: 1980 },
  { name: "Lara Zammit", revenue: 1650 },
  { name: "Nadia Farrugia", revenue: 1420 },
  { name: "Christine Attard", revenue: 890 },
].sort((a, b) => b.revenue - a.revenue);

const MOCK_THERAPIST_RETAIL = [
  { name: "Katya Borg", revenue: 420 },
  { name: "Maria Vella", revenue: 380 },
  { name: "Daniela Camilleri", revenue: 290 },
  { name: "Joanne Grech", revenue: 210 },
  { name: "Christine Attard", revenue: 180 },
  { name: "Lara Zammit", revenue: 120 },
  { name: "Nadia Farrugia", revenue: 85 },
].sort((a, b) => b.revenue - a.revenue);

const MOCK_THERAPIST_PACKAGES = [
  { name: "Maria Vella", revenue: 4800 },
  { name: "Katya Borg", revenue: 4200 },
  { name: "Joanne Grech", revenue: 3600 },
  { name: "Daniela Camilleri", revenue: 3100 },
  { name: "Lara Zammit", revenue: 2700 },
  { name: "Nadia Farrugia", revenue: 2100 },
  { name: "Christine Attard", revenue: 1500 },
].sort((a, b) => b.revenue - a.revenue);

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIMMING CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

interface SlimmingContentProps {
  dateFrom: Date;
  dateTo: Date;
}

function SlimmingContent({ dateFrom, dateTo }: SlimmingContentProps) {
  const L = MOCK_SLIM_WEEKS.length;
  const latestIdx = L - 1;

  // Totals & latest values
  const totalSvcRev = sum(MOCK_SLIM_SVC_REV);
  const totalRetailRev = sum(MOCK_SLIM_RETAIL_REV);
  const avgRevPerHour = Math.round(totalSvcRev / (L * 40)); // ~40 available hours per week
  const totalActiveMembers = sum(MOCK_SLIM_BOOK_CAL); // cumulative bookings as proxy
  const latestCourseConv = MOCK_SLIM_COURSE_CONV_PCT[latestIdx];
  const latestMaxCourse = MOCK_SLIM_MAX_COURSE_PCT[latestIdx];
  const latestShowup = MOCK_SLIM_SHOWUP_PCT[latestIdx];

  // WoW growth (brand too new for YoY)
  const prevSvcRev = MOCK_SLIM_SVC_REV[latestIdx - 1];
  const latestSvcRev = MOCK_SLIM_SVC_REV[latestIdx];
  const svcRevGrowth = ((latestSvcRev - prevSvcRev) / prevSvcRev) * 100;

  const prevRetailRev = MOCK_SLIM_RETAIL_REV[latestIdx - 1] || 1;
  const latestRetailRev = MOCK_SLIM_RETAIL_REV[latestIdx];
  const retailRevGrowth = latestRetailRev > 0 ? ((latestRetailRev - prevRetailRev) / prevRetailRev) * 100 : 0;

  // Avg rev per hour growth (compare last 4 weeks vs first 4)
  const last4SvcRev = sum(MOCK_SLIM_SVC_REV.slice(-4));
  const first4SvcRev = sum(MOCK_SLIM_SVC_REV.slice(0, 4));
  const revPerHourGrowth = ((last4SvcRev - first4SvcRev) / first4SvcRev) * 100;

  // Active members growth (bookings ramp)
  const last4Bookings = sum(MOCK_SLIM_BOOK_CAL.slice(-4));
  const first4Bookings = sum(MOCK_SLIM_BOOK_CAL.slice(0, 4));
  const bookingsGrowth = ((last4Bookings - first4Bookings) / first4Bookings) * 100;

  // Conversion deltas (latest vs prior week)
  const prevCourseConv = MOCK_SLIM_COURSE_CONV_PCT[latestIdx - 1];
  const courseConvDelta = latestCourseConv - prevCourseConv;
  const prevMaxCourseVal = MOCK_SLIM_MAX_COURSE_PCT[latestIdx - 1];
  const maxCourseDelta = latestMaxCourse - prevMaxCourseVal;

  const TARGETS = { courseConv: 65, maxCourse: 12.5, showup: 85 };

  /* ── Funnel data ────────────────────────────────────────────────── */
  const leads = (MOCK_SLIM_LEADS[latestIdx] ?? MOCK_SLIM_CONSULTS_CAL[latestIdx]) as number;
  const consultsCal = MOCK_SLIM_CONSULTS_CAL[latestIdx];
  const consultsShow = MOCK_SLIM_CONSULTS_SHOW[latestIdx];
  const totalBookings = MOCK_SLIM_CONV_COURSE[latestIdx] + MOCK_SLIM_CONV_MAX[latestIdx];
  const regularCourse = MOCK_SLIM_CONV_COURSE[latestIdx];
  const maxCourse = MOCK_SLIM_CONV_MAX[latestIdx];

  /* ── Revenue & Bookings Growth Chart ────────────────────────────── */
  const revTrendData = MOCK_SLIM_WEEKS.map((w, i) => ({
    week: w,
    "Service Revenue": MOCK_SLIM_SVC_REV[i],
    "Retail Revenue": MOCK_SLIM_RETAIL_REV[i],
    Bookings: MOCK_SLIM_BOOK_CAL[i],
  }));

  /* ── Conversion Metrics Trend ───────────────────────────────────── */
  const convTrendData = MOCK_SLIM_WEEKS.map((w, i) => ({
    week: w,
    "Course Conv %": MOCK_SLIM_COURSE_CONV_PCT[i],
    "Max Course %": MOCK_SLIM_MAX_COURSE_PCT[i],
    "Showup %": MOCK_SLIM_SHOWUP_PCT[i],
  }));

  /* ── Weekly Detail Table ────────────────────────────────────────── */
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
    maxCoursePct: MOCK_SLIM_MAX_COURSE_PCT[i],
    showupPct: MOCK_SLIM_SHOWUP_PCT[i],
  }));

  /* ── Targets vs Actuals ─────────────────────────────────────────── */
  function status(actual: number, target: number): string {
    const ratio = actual / target;
    return ratio >= 1 ? "Above" : ratio >= 0.8 ? "Near" : "Below";
  }

  const targetsData = [
    { metric: "Course Conversion %", actual: `${latestCourseConv}%`, target: "65%", status: status(latestCourseConv, TARGETS.courseConv), delta: `${courseConvDelta > 0 ? "+" : ""}${courseConvDelta}pp WoW` },
    { metric: "Max Course %", actual: `${latestMaxCourse}%`, target: "10-15%", status: status(latestMaxCourse, TARGETS.maxCourse), delta: `${maxCourseDelta > 0 ? "+" : ""}${maxCourseDelta}pp WoW` },
    { metric: "Consult Showup %", actual: `${latestShowup}%`, target: "85%", status: status(latestShowup, TARGETS.showup), delta: `${latestShowup - MOCK_SLIM_SHOWUP_PCT[latestIdx - 1] > 0 ? "+" : ""}${latestShowup - MOCK_SLIM_SHOWUP_PCT[latestIdx - 1]}pp WoW` },
    { metric: "Retail %", actual: `${((MOCK_SLIM_RETAIL_REV[latestIdx] / MOCK_SLIM_SVC_REV[latestIdx]) * 100).toFixed(1)}%`, target: "20%", status: status((MOCK_SLIM_RETAIL_REV[latestIdx] / MOCK_SLIM_SVC_REV[latestIdx]) * 100, 20), delta: "" },
  ];

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6B9080]/10 border border-[#6B9080]/20">
            <Rocket className="h-6 w-6 text-[#6B9080]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Slimming Sales Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Launched Feb 2026 &middot; {L} weeks of data &middot; Rapid ramp-up trajectory
            </p>
          </div>
        </div>
      </div>

      {/* ── Ramp-up Banner ──────────────────────────────────────────── */}
      <Card className="border-[#6B9080]/30 bg-gradient-to-r from-[#6B9080]/5 via-transparent to-[#B8943E]/5 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#6B9080]" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Revenue grew {((latestSvcRev / MOCK_SLIM_SVC_REV[0]) * 100 / 100).toFixed(0)}x from launch week to week {L}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(MOCK_SLIM_SVC_REV[0])} &rarr; {formatCurrency(latestSvcRev)} in service revenue | {sum(MOCK_SLIM_BOOK_CAL)} total bookings calendared
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-lg font-bold text-[#6B9080]">{formatCurrency(totalSvcRev)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Revenue</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#B8943E]">{avg(MOCK_SLIM_COURSE_CONV_PCT).toFixed(0)}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Conv Rate</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#E07A5F]">{avg(MOCK_SLIM_SHOWUP_PCT).toFixed(0)}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Show Rate</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── KPI Summary Cards ───────────────────────────────────────── */}
      <SalesKPIGrid>
        <SalesKPICard
          label="Total Service Revenue"
          value={formatCurrency(totalSvcRev)}
          yoyChange={undefined}
          subtitle={`WoW: ${svcRevGrowth > 0 ? "+" : ""}${svcRevGrowth.toFixed(1)}%`}
        />
        <SalesKPICard
          label="Retail Revenue"
          value={formatCurrency(totalRetailRev)}
          yoyChange={undefined}
          subtitle={retailRevGrowth > 0 ? `WoW: +${retailRevGrowth.toFixed(1)}%` : undefined}
        />
        <SalesKPICard
          label="Avg Rev / Available Hr"
          value={formatCurrency(avgRevPerHour)}
          yoyChange={undefined}
          subtitle={`L4W vs F4W: +${revPerHourGrowth.toFixed(0)}%`}
        />
        <SalesKPICard
          label="Total Active Members"
          value={String(totalActiveMembers)}
          yoyChange={undefined}
          subtitle={`L4W vs F4W: +${bookingsGrowth.toFixed(0)}%`}
        />
        <SalesKPICard
          label="Consult-to-Course Conv"
          value={formatPercent(latestCourseConv)}
          yoyChange={undefined}
          subtitle={`Target: 65% | ${courseConvDelta > 0 ? "+" : ""}${courseConvDelta}pp WoW`}
        />
        <SalesKPICard
          label="Max Course Rate"
          value={formatPercent(latestMaxCourse)}
          yoyChange={undefined}
          subtitle={`Target: 12.5% | ${maxCourseDelta > 0 ? "+" : ""}${maxCourseDelta}pp WoW`}
        />
      </SalesKPIGrid>

      {/* ── Sales Funnel ────────────────────────────────────────────── */}
      <FunnelChart
        title={`Sales Funnel — Week of ${MOCK_SLIM_WEEKS[latestIdx]}`}
        subtitle="Lead to booking conversion with course-type breakdown"
        color="#6B9080"
        stages={[
          { label: "Leads", value: leads },
          { label: "Consults Calendared", value: consultsCal, conversionRate: (consultsCal / leads) * 100 },
          { label: "Consults Attended", value: consultsShow, conversionRate: (consultsShow / consultsCal) * 100, showRate: MOCK_SLIM_SHOWUP_PCT[latestIdx] },
          { label: "Bookings", value: totalBookings, conversionRate: (totalBookings / consultsShow) * 100 },
        ]}
        split={[
          { label: "Regular Course", value: regularCourse, conversionRate: MOCK_SLIM_COURSE_CONV_PCT[latestIdx], color: "#6B9080", description: "Standard slimming programme" },
          { label: "Max Course", value: maxCourse, conversionRate: MOCK_SLIM_MAX_COURSE_PCT[latestIdx], color: "#B8943E", description: "Premium intensive programme (target: 10-15%)" },
        ]}
      />

      {/* ── Therapist Performance ──────────────────────────────────── */}
      <StaffPerformanceChart
        title="Therapist Performance"
        subtitle="Latest period (EUR)"
        tabs={[
          { key: "service", label: "Service Sales", data: MOCK_THERAPIST_SERVICE, color: chartColors.slimming },
          { key: "retail", label: "Retail Sales", data: MOCK_THERAPIST_RETAIL, color: chartColors.spa },
          { key: "packages", label: "Package Sales", data: MOCK_THERAPIST_PACKAGES, color: chartColors.target },
        ]}
        icon={<UserCheck className="h-5 w-5 text-[#6B9080]" />}
      />

      {/* ── Revenue & Bookings Growth ───────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <DollarSign className="h-5 w-5 text-[#6B9080]" />
          <h2 className="text-lg font-semibold text-foreground">Revenue & Bookings Growth</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5 ml-8">
          Service revenue ramp from launch &middot; {formatCurrency(MOCK_SLIM_SVC_REV[0])} to {formatCurrency(latestSvcRev)} in {L} weeks
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={revTrendData} margin={chartDefaults.margin}>
            <defs>
              <linearGradient id="svcRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B9080" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6B9080" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="rev"
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="book"
              orientation="right"
              tick={{ fontSize: 11 }}
              label={{ value: "Bookings", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "#9CA3AF" } }}
            />
            <Tooltip
              formatter={(v, name) =>
                name === "Bookings" ? Number(v) : formatCurrency(Number(v))
              }
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              yAxisId="rev"
              type="monotone"
              dataKey="Service Revenue"
              fill="url(#svcRevGrad)"
              stroke={chartColors.slimming}
              strokeWidth={2.5}
            />
            <Bar
              yAxisId="rev"
              dataKey="Retail Revenue"
              fill={chartColors.spa}
              radius={[3, 3, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="book"
              type="monotone"
              dataKey="Bookings"
              stroke={chartColors.target}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartColors.target, strokeWidth: 2, stroke: "#fff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Conversion Metrics Trend ─────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-5 w-5 text-[#6B9080]" />
          <h2 className="text-lg font-semibold text-foreground">Conversion Metrics Over Time</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5 ml-8">
          Course Conv target: 65% &middot; Max Course target: 10-15% &middot; Showup target: 85%
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={convTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 110]}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v) => `${Number(v)}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine
              y={65}
              stroke={chartColors.slimming}
              strokeDasharray="8 4"
              strokeOpacity={0.5}
              label={{ value: "Conv Target 65%", position: "insideTopRight", fill: chartColors.slimming, fontSize: 10 }}
            />
            <ReferenceLine
              y={12.5}
              stroke={chartColors.spa}
              strokeDasharray="8 4"
              strokeOpacity={0.5}
              label={{ value: "Max 12.5%", position: "insideBottomRight", fill: chartColors.spa, fontSize: 10 }}
            />
            <ReferenceLine
              y={85}
              stroke={chartColors.target}
              strokeDasharray="8 4"
              strokeOpacity={0.5}
              label={{ value: "Showup Target 85%", position: "insideTopRight", fill: chartColors.target, fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="Course Conv %"
              stroke={chartColors.slimming}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartColors.slimming, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="Max Course %"
              stroke={chartColors.spa}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartColors.spa, strokeWidth: 2, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="Showup %"
              stroke={chartColors.target}
              strokeWidth={2.5}
              dot={{ r: 4, fill: chartColors.target, strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Targets vs Actuals ───────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="h-5 w-5 text-[#6B9080]" />
          <h2 className="text-lg font-semibold text-foreground">Targets vs Actuals</h2>
        </div>
        <DataTable
          columns={[
            { key: "metric", label: "KPI" },
            { key: "actual", label: "Latest Week", align: "right" as const },
            { key: "target", label: "Target", align: "right" as const },
            { key: "delta", label: "WoW Change", align: "right" as const },
            {
              key: "status",
              label: "Status",
              align: "right" as const,
              render: (v: unknown) => {
                const s = v as string;
                const color =
                  s === "Above"
                    ? "text-emerald-600 bg-emerald-50"
                    : s === "Near"
                      ? "text-amber-600 bg-amber-50"
                      : "text-red-600 bg-red-50";
                return (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                    {s}
                  </span>
                );
              },
            },
          ]}
          data={targetsData}
        />
      </Card>

      {/* ── Weekly Detail Table ──────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-[#6B9080]" />
          <h2 className="text-lg font-semibold text-foreground">Weekly Detail</h2>
        </div>
        <DataTable
          columns={[
            { key: "week", label: "Week" },
            {
              key: "svcRev",
              label: "Svc Rev",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => formatCurrency(v as number),
            },
            {
              key: "retailRev",
              label: "Retail",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => formatCurrency(v as number),
            },
            { key: "consultsCal", label: "Consults", align: "right" as const, sortable: true },
            { key: "showed", label: "Showed", align: "right" as const, sortable: true },
            { key: "convCourse", label: "Courses", align: "right" as const, sortable: true },
            { key: "convMax", label: "Max", align: "right" as const, sortable: true },
            { key: "bookings", label: "Bookings", align: "right" as const, sortable: true },
            {
              key: "courseConvPct",
              label: "Conv %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => {
                const val = v as number;
                const color =
                  val >= 65
                    ? "text-emerald-600"
                    : val >= 50
                      ? "text-amber-600"
                      : "text-red-500";
                return <span className={`font-medium ${color}`}>{val}%</span>;
              },
            },
            {
              key: "maxCoursePct",
              label: "Max %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => {
                const val = v as number;
                const color =
                  val >= 12.5
                    ? "text-emerald-600"
                    : val >= 10
                      ? "text-amber-600"
                      : "text-red-500";
                return <span className={`font-medium ${color}`}>{val}%</span>;
              },
            },
            {
              key: "showupPct",
              label: "Show %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => {
                const val = v as number;
                const color =
                  val >= 85
                    ? "text-emerald-600"
                    : val >= 70
                      ? "text-amber-600"
                      : "text-red-500";
                return <span className={`font-medium ${color}`}>{val}%</span>;
              },
            },
          ]}
          data={weeklyDetailData}
        />
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SlimmingSalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <SlimmingContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
