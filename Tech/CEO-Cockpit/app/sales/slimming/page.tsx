"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CIChat } from "@/components/ci/CIChat";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { FunnelChart } from "@/components/sales/FunnelChart";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { ServiceBreakdownChart } from "@/components/sales/ServiceBreakdownChart";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  weekLabelsToDateObjects,
  getFilteredIndices,
  filterByIndices,
  sumFiltered,
  formatDateRangeLabel,
  filteredCountLabel,
} from "@/lib/utils/mock-date-filter";
import {
  TrendingUp,
  Rocket,
  UserCheck,
  AlertTriangle,
  Target,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Weekly KPIs since Feb 2026 launch
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_SLIM_WEEKS            = ["16-Feb","23-Feb","02-Mar","09-Mar","16-Mar","23-Mar","30-Mar","06-Apr","13-Apr","20-Apr"];
const MOCK_SLIM_SVC_REV          = [798,5347,9623,6521,7596,9065,9944,5277,10566,11240];
const MOCK_SLIM_RETAIL_REV       = [1,77,150,90,0,0,124,0,224,310];
const MOCK_SLIM_LEADS            = [1,600,null,null,null,null,null,null,210,245];
const MOCK_SLIM_CONSULTS_CAL     = [2,34,56,55,63,65,51,34,83,78];
const MOCK_SLIM_CONSULTS_SHOW    = [1,28,46,40,47,38,41,24,45,52];
const MOCK_SLIM_CONV_COURSE      = [1,16,16,21,18,26,20,10,34,38];
const MOCK_SLIM_CONV_MAX         = [0,1,2,1,3,2,2,1,4,5];
const MOCK_SLIM_BOOK_CAL         = [1,16,31,43,53,76,102,67,91,108];
const MOCK_SLIM_COURSE_CONV_PCT  = [100,57,35,53,38,68,49,42,76,73];
const MOCK_SLIM_MAX_COURSE_PCT   = [0,6,13,5,17,8,10,10,12,10];
const MOCK_SLIM_SHOWUP_PCT       = [50,82,82,73,75,58,80,71,54,67];

const WEEK_DATES = weekLabelsToDateObjects(MOCK_SLIM_WEEKS, 2026);

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Practitioner Performance
   ═══════════════════════════════════════════════════════════════════════ */

const PRACTITIONER_DATA = [
  { name: "Maria Vella", serviceRevenue: 3240, retailRevenue: 380 },
  { name: "Katya Borg", serviceRevenue: 2890, retailRevenue: 420 },
  { name: "Daniela Camilleri", serviceRevenue: 2450, retailRevenue: 290 },
  { name: "Joanne Grech", serviceRevenue: 1980, retailRevenue: 210 },
  { name: "Lara Zammit", serviceRevenue: 1650, retailRevenue: 120 },
  { name: "Nadia Farrugia", serviceRevenue: 1420, retailRevenue: 85 },
  { name: "Christine Attard", serviceRevenue: 890, retailRevenue: 180 },
];

const SLIMMING_SERVICE_BREAKDOWN = [
  { service: "Body Contouring", revenue: 22800, pct: 34.7 },
  { service: "Weight Loss Programme", revenue: 16400, pct: 24.9 },
  { service: "Fat Reduction", revenue: 10200, pct: 15.5 },
  { service: "Cellulite Treatment", revenue: 7600, pct: 11.6 },
  { service: "Nutritional Consult", revenue: 5200, pct: 7.9 },
  { service: "Other", revenue: 3537, pct: 5.4 },
];

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

/* ═══════════════════════════════════════════════════════════════════════
   TARGETS — Slimming Clinic
   ═══════════════════════════════════════════════════════════════════════ */

const DEFAULT_SLIM_TARGETS = {
  weeklyRevenue: 10000,
  monthlyRevenue: 40000,
  consultationsPerWeek: 70,
  conversionRate: 65,
  showRate: 75,
};

interface SlimmingContentProps {
  dateFrom: Date;
  dateTo: Date;
}

function SlimmingContent({ dateFrom, dateTo }: SlimmingContentProps) {
  const [targets, setTargets] = useState(DEFAULT_SLIM_TARGETS);
  const [editingTargets, setEditingTargets] = useState(false);
  const [draftTargets, setDraftTargets] = useState(DEFAULT_SLIM_TARGETS);
  /* ── Filtered indices based on date range ──────────────────────────── */
  const filteredIdx = useMemo(
    () => getFilteredIndices(WEEK_DATES, dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const L = filteredIdx.length;
  const latestIdx = filteredIdx.length > 0 ? filteredIdx[filteredIdx.length - 1] : MOCK_SLIM_WEEKS.length - 1;

  // Totals & latest values
  const totalSvcRev = useMemo(() => sumFiltered(MOCK_SLIM_SVC_REV, filteredIdx), [filteredIdx]);
  const totalRetailRev = useMemo(() => sumFiltered(MOCK_SLIM_RETAIL_REV, filteredIdx), [filteredIdx]);
  const avgRevPerHour = L > 0 ? Math.round(totalSvcRev / (L * 40)) : 0;
  const totalActiveMembers = useMemo(() => sumFiltered(MOCK_SLIM_BOOK_CAL, filteredIdx), [filteredIdx]);
  const latestCourseConv = MOCK_SLIM_COURSE_CONV_PCT[latestIdx];
  const latestMaxCourse = MOCK_SLIM_MAX_COURSE_PCT[latestIdx];

  // WoW growth (brand too new for YoY)
  const prevSvcRev = MOCK_SLIM_SVC_REV[latestIdx - 1] || 1;
  const latestSvcRev = MOCK_SLIM_SVC_REV[latestIdx];
  const svcRevGrowth = ((latestSvcRev - prevSvcRev) / prevSvcRev) * 100;

  const prevRetailRev = MOCK_SLIM_RETAIL_REV[latestIdx - 1] || 1;
  const latestRetailRev = MOCK_SLIM_RETAIL_REV[latestIdx];
  const retailRevGrowth = latestRetailRev > 0 ? ((latestRetailRev - prevRetailRev) / prevRetailRev) * 100 : 0;

  // Avg rev per hour growth (compare last 4 weeks vs first 4)
  const filteredSvcRevArr = useMemo(() => filterByIndices(MOCK_SLIM_SVC_REV, filteredIdx), [filteredIdx]);
  const last4SvcRev = sum(filteredSvcRevArr.slice(-4));
  const first4SvcRev = sum(filteredSvcRevArr.slice(0, 4));
  const revPerHourGrowth = first4SvcRev > 0 ? ((last4SvcRev - first4SvcRev) / first4SvcRev) * 100 : 0;

  // Active members growth (bookings ramp)
  const filteredBookings = useMemo(() => filterByIndices(MOCK_SLIM_BOOK_CAL, filteredIdx), [filteredIdx]);
  const last4Bookings = sum(filteredBookings.slice(-4));
  const first4Bookings = sum(filteredBookings.slice(0, 4));
  const bookingsGrowth = first4Bookings > 0 ? ((last4Bookings - first4Bookings) / first4Bookings) * 100 : 0;

  // Conversion deltas (latest vs prior week)
  const prevCourseConv = MOCK_SLIM_COURSE_CONV_PCT[latestIdx - 1] ?? 0;
  const courseConvDelta = latestCourseConv - prevCourseConv;
  const prevMaxCourseVal = MOCK_SLIM_MAX_COURSE_PCT[latestIdx - 1] ?? 0;
  const maxCourseDelta = latestMaxCourse - prevMaxCourseVal;

  // Booking rate & no-show revenue
  const totalConsultsCal = useMemo(() => sumFiltered(MOCK_SLIM_CONSULTS_CAL, filteredIdx), [filteredIdx]);
  const totalConsultsShow = useMemo(() => sumFiltered(MOCK_SLIM_CONSULTS_SHOW, filteredIdx), [filteredIdx]);
  const totalConversions = useMemo(() => sumFiltered(MOCK_SLIM_CONV_COURSE, filteredIdx), [filteredIdx]) + useMemo(() => sumFiltered(MOCK_SLIM_CONV_MAX, filteredIdx), [filteredIdx]);
  const showRate = totalConsultsCal > 0 ? (totalConsultsShow / totalConsultsCal) * 100 : 0;
  const bookingRateVal = totalConsultsShow > 0 ? (totalConversions / totalConsultsShow) * 100 : 0;
  const noShows = totalConsultsCal - totalConsultsShow;
  const avgRevenuePerConversion = totalConversions > 0 ? totalSvcRev / totalConversions : 0;
  const revenueLostToNoShows = Math.round(noShows * avgRevenuePerConversion * (bookingRateVal / 100));

  // Target calculations
  const revenueTarget = targets.weeklyRevenue * L;
  const revenuePct = revenueTarget > 0 ? (totalSvcRev / revenueTarget) * 100 : 0;
  const consultsTarget = targets.consultationsPerWeek * L;
  const consultsPct = consultsTarget > 0 ? (totalConsultsCal / consultsTarget) * 100 : 0;
  const convTarget = targets.conversionRate;
  const filteredShowupPcts = useMemo(() => filterByIndices(MOCK_SLIM_SHOWUP_PCT, filteredIdx), [filteredIdx]);
  const avgShowRate = filteredShowupPcts.length > 0 ? avg(filteredShowupPcts) : 0;
  const filteredCourseConv = useMemo(() => filterByIndices(MOCK_SLIM_COURSE_CONV_PCT, filteredIdx), [filteredIdx]);
  const avgCourseConv = filteredCourseConv.length > 0 ? avg(filteredCourseConv) : 0;

  /* ── Subtitle ──────────────────────────────────────────────────────── */
  const subtitle = useMemo(() => {
    const weekCount = filteredCountLabel(L, "week");
    const range = formatDateRangeLabel(dateFrom, dateTo);
    return `${weekCount} of data · ${range} · Rapid ramp-up trajectory`;
  }, [L, dateFrom, dateTo]);

  /* ── Funnel data ────────────────────────────────────────────────── */
  const leads = (MOCK_SLIM_LEADS[latestIdx] ?? MOCK_SLIM_CONSULTS_CAL[latestIdx]) as number;
  const consultsCal = MOCK_SLIM_CONSULTS_CAL[latestIdx];
  const consultsShow = MOCK_SLIM_CONSULTS_SHOW[latestIdx];
  const totalBookings = MOCK_SLIM_CONV_COURSE[latestIdx] + MOCK_SLIM_CONV_MAX[latestIdx];
  const regularCourse = MOCK_SLIM_CONV_COURSE[latestIdx];
  const maxCourse = MOCK_SLIM_CONV_MAX[latestIdx];

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#8EB093]/10 border border-[#8EB093]/20">
            <Rocket className="h-6 w-6 text-[#8EB093]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Slimming Sales Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Launched Feb 2026 &middot; {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Ramp-up Banner ──────────────────────────────────────────── */}
      <Card className="border-[#8EB093]/30 bg-gradient-to-r from-[#8EB093]/5 via-transparent to-[#B79E61]/5 p-3 md:p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#8EB093]" />
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
              <p className="text-lg font-bold text-[#8EB093]">{formatCurrency(totalSvcRev)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Revenue</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#B79E61]">{avg(MOCK_SLIM_COURSE_CONV_PCT).toFixed(0)}%</p>
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
      <SalesKPIGrid columns={4}>
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
      </SalesKPIGrid>

      {/* ── Booking Rate & Show Rate Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-3 md:p-5 text-center border-l-4" style={{ borderLeftColor: chartColors.slimming }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Show Rate</p>
          <p className="text-3xl font-bold" style={{ color: chartColors.slimming }}>{showRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{totalConsultsShow} showed of {totalConsultsCal} calendared</p>
        </Card>
        <Card className="p-3 md:p-5 text-center border-l-4" style={{ borderLeftColor: "#059669" }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Booking Rate</p>
          <p className="text-3xl font-bold text-emerald-600">{bookingRateVal.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{totalConversions} booked of {totalConsultsShow} showed</p>
        </Card>
        <Card className="p-3 md:p-5 text-center border-l-4 border-red-400 bg-red-50/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-xs uppercase tracking-wider text-red-600 font-medium">Revenue Lost to No-Shows</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(revenueLostToNoShows)}</p>
          <p className="text-xs text-muted-foreground mt-1">{noShows} no-shows &times; {formatCurrency(Math.round(avgRevenuePerConversion * (bookingRateVal / 100)))} est. per conversion</p>
        </Card>
      </div>

      {/* ── Conversion Rates (matching Aesthetics style) ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#8EB093]/10 to-white">
          <UserCheck className="h-8 w-8 text-[#8EB093] mb-2" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Consultation Conversion Rate
          </p>
          <p className="text-4xl font-bold text-[#8EB093] tracking-tight">
            {latestCourseConv}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Target: 65% | Avg: {avg(MOCK_SLIM_COURSE_CONV_PCT).toFixed(0)}%
          </p>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mt-2 ${courseConvDelta >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <TrendingUp className="h-3 w-3" />
            {courseConvDelta > 0 ? "+" : ""}{courseConvDelta}pp WoW
          </span>
        </Card>
        <Card className="p-3 md:p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#B79E61]/10 to-white">
          <Rocket className="h-8 w-8 text-[#B79E61] mb-2" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Max Course Rate
          </p>
          <p className="text-4xl font-bold text-[#B79E61] tracking-tight">
            {latestMaxCourse}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Target: 10-15% | Avg: {avg(MOCK_SLIM_MAX_COURSE_PCT).toFixed(0)}%
          </p>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold mt-2 ${maxCourseDelta >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <TrendingUp className="h-3 w-3" />
            {maxCourseDelta > 0 ? "+" : ""}{maxCourseDelta}pp WoW
          </span>
        </Card>
      </div>

      {/* ── Sales Funnel ────────────────────────────────────────────── */}
      <FunnelChart
        title="Sales Funnel"
        subtitle="Lead to booking conversion with course-type breakdown"
        color={chartColors.slimming}
        stages={[
          { label: "Leads", value: leads },
          { label: "Consults Calendared", value: consultsCal, conversionRate: (consultsCal / leads) * 100 },
          { label: "Consults Attended", value: consultsShow, conversionRate: (consultsShow / consultsCal) * 100, showRate: MOCK_SLIM_SHOWUP_PCT[latestIdx] },
          { label: "Bookings", value: totalBookings, conversionRate: (totalBookings / consultsShow) * 100 },
        ]}
        split={[
          { label: "Regular Course", value: regularCourse, conversionRate: MOCK_SLIM_COURSE_CONV_PCT[latestIdx], color: chartColors.slimming, description: "Standard slimming programme" },
          { label: "Max Course", value: maxCourse, conversionRate: MOCK_SLIM_MAX_COURSE_PCT[latestIdx], color: chartColors.spa, description: "Premium intensive programme (target: 10-15%)" },
        ]}
      />

      {/* ── Practitioner Performance ──────────────────────────────────── */}
      <StaffPerformanceChart
        title="Practitioner Performance"
        subtitle="Service + Retail revenue (EUR)"
        data={PRACTITIONER_DATA}
        serviceColor={chartColors.slimming}
        retailColor={chartColors.spa}
        icon={<UserCheck className="h-5 w-5 text-[#8EB093]" />}
      />

      {/* ── Service Revenue Breakdown ───────────────────────────────── */}
      <ServiceBreakdownChart
        title="Service Revenue Breakdown"
        data={SLIMMING_SERVICE_BREAKDOWN}
        color={chartColors.slimming}
      />

      {/* ── Targets Section ─────────────────────────────────────────── */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: chartColors.slimming }} />
            <h2 className="text-lg font-semibold text-foreground">Targets vs Actual</h2>
          </div>
          <button
            onClick={() => {
              if (editingTargets) {
                setTargets(draftTargets);
                setEditingTargets(false);
              } else {
                setDraftTargets(targets);
                setEditingTargets(true);
              }
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
          >
            {editingTargets ? "Save Targets" : "Edit Targets"}
          </button>
        </div>

        {editingTargets && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Weekly Revenue Target</label>
              <input type="number" value={draftTargets.weeklyRevenue} onChange={(e) => setDraftTargets({ ...draftTargets, weeklyRevenue: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Consultations / Week</label>
              <input type="number" value={draftTargets.consultationsPerWeek} onChange={(e) => setDraftTargets({ ...draftTargets, consultationsPerWeek: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Conversion Rate %</label>
              <input type="number" value={draftTargets.conversionRate} onChange={(e) => setDraftTargets({ ...draftTargets, conversionRate: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Show Rate %</label>
              <input type="number" value={draftTargets.showRate} onChange={(e) => setDraftTargets({ ...draftTargets, showRate: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          Performance against targets for {L} week{L !== 1 ? "s" : ""} selected. Targets scale proportionally with date range.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", actual: totalSvcRev, target: revenueTarget, format: (v: number) => formatCurrency(v), pct: revenuePct },
            { label: "Consultations", actual: totalConsultsCal, target: consultsTarget, format: (v: number) => String(v), pct: consultsPct },
            { label: "Conversion Rate", actual: avgCourseConv, target: convTarget, format: (v: number) => `${v.toFixed(0)}%`, pct: convTarget > 0 ? (avgCourseConv / convTarget) * 100 : 0 },
            { label: "Show Rate", actual: avgShowRate, target: targets.showRate, format: (v: number) => `${v.toFixed(0)}%`, pct: targets.showRate > 0 ? (avgShowRate / targets.showRate) * 100 : 0 },
          ].map((item) => {
            const isOnTrack = item.pct >= 90;
            const isWarning = item.pct >= 70 && item.pct < 90;
            const barColor = isOnTrack ? "#059669" : isWarning ? "#d97706" : "#dc2626";
            return (
              <div key={item.label} className="space-y-2 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isOnTrack ? "bg-green-50 text-green-700" : isWarning ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                    {item.pct.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">{item.format(item.actual)}</p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(item.pct, 100)}%`, backgroundColor: barColor }} />
                </div>
                <p className="text-[11px] text-muted-foreground">Target: {item.format(item.target)}</p>
              </div>
            );
          })}
        </div>
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
