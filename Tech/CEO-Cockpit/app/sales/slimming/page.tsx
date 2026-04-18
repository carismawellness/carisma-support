"use client";

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
  TrendingUp,
  Rocket,
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
const MOCK_SLIM_COURSE_CONV_PCT  = [100,57,35,53,38,68,49,42,76];
const MOCK_SLIM_MAX_COURSE_PCT   = [0,6,13,5,17,8,10,10,12];
const MOCK_SLIM_SHOWUP_PCT       = [50,82,82,73,75,58,80,71,54];

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
              Launched Feb 2026 &middot; {L} weeks of data &middot; Rapid ramp-up trajectory
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
