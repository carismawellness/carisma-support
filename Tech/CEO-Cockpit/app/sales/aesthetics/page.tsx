"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { FunnelChart } from "@/components/sales/FunnelChart";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { ServiceBreakdownChart } from "@/components/sales/ServiceBreakdownChart";
import { useMemo, useState } from "react";
import {
  chartColors,
  formatCurrency,
} from "@/lib/charts/config";
import {
  weekLabelsToDateObjects,
  getFilteredIndices,
  filterByIndices,
  sumFiltered,
  formatDateRangeLabel,
  filteredCountLabel,
} from "@/lib/utils/mock-date-filter";
import { AlertTriangle, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LabelList,
  Cell,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Aesthetics KPIs
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_AES_WEEKS = [
  "05-Jan","12-Jan","19-Jan","26-Jan",
  "02-Feb","09-Feb","16-Feb","23-Feb",
  "02-Mar","09-Mar","16-Mar","23-Mar",
  "30-Mar","06-Apr","13-Apr","20-Apr",
];
const MOCK_AES_CONSULTS_CAL   = [6,6,4,18,15,19,22,26,18,15,18,11,11,23,15,7];
const MOCK_AES_CONSULTS_SHOW  = [10,18,10,10,6,8,14,15,8,7,12,4,4,20,12,3];
const MOCK_AES_CONSULTS_CONV  = [6,10,7,8,4,7,7,11,4,3,5,2,1,10,7,2];
const MOCK_AES_CONV_PCT       = [60,56,70,80,67,88,50,73,50,43,42,50,25,50,58,67];
const MOCK_AES_SVC_REV        = [2397,1579,1489,5057,782,1489,3861,4261,3986,1941,1561,2974,1762,1539,4719,1477];
const MOCK_AES_RETAIL_REV     = [0,0,0,0,0,0,310,0,73,78,39,173,0,39,71,0];
const MOCK_AES_AOV            = [332,243,173,270,176,257,236,185];
const MOCK_AES_BOOK_CAL       = [2,1,0,0,0,0,8,14,16,15,13,12,7,24,12,18];
const MOCK_AES_BOOK_SHOW      = [0,0,0,0,0,0,0,12,8,9,11,10,6,20,8,14];

const WEEK_DATES = weekLabelsToDateObjects(MOCK_AES_WEEKS, 2026);

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/* ═══════════════════════════════════════════════════════════════════════
   SERVICE REVENUE BREAKDOWN DATA
   ═══════════════════════════════════════════════════════════════════════ */

const SERVICE_BREAKDOWN = [
  { service: "Botox", revenue: 12400, pct: 30.2 },
  { service: "Dermal Fillers", revenue: 9800, pct: 23.9 },
  { service: "Skin Rejuvenation", revenue: 6200, pct: 15.1 },
  { service: "Chemical Peels", revenue: 4100, pct: 10.0 },
  { service: "Microneedling", revenue: 3600, pct: 8.8 },
  { service: "Laser Treatments", revenue: 2900, pct: 7.1 },
  { service: "Other", revenue: 2000, pct: 4.9 },
];

/* ═══════════════════════════════════════════════════════════════════════
   PRACTITIONER PERFORMANCE DATA (mock — sorted descending)
   ═══════════════════════════════════════════════════════════════════════ */

const PRACTITIONER_DATA = [
  { name: "Dr. Elisa Grech", serviceRevenue: 14200, retailRevenue: 620 },
  { name: "Dr. Martina Vella", serviceRevenue: 11850, retailRevenue: 410 },
  { name: "Kyra Camilleri", serviceRevenue: 9400, retailRevenue: 2850 },
  { name: "Daniela Borg", serviceRevenue: 7600, retailRevenue: 2200 },
  { name: "Leanne Farrugia", serviceRevenue: 5900, retailRevenue: 1750 },
  { name: "Anthea Zammit", serviceRevenue: 4350, retailRevenue: 1400 },
  { name: "Jade Attard", serviceRevenue: 3100, retailRevenue: 980 },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   TARGETS — Aesthetics Clinic
   ═══════════════════════════════════════════════════════════════════════ */

const DEFAULT_AES_TARGETS = {
  weeklyRevenue: 4500,
  monthlyRevenue: 18000,
  consultationsPerWeek: 20,
  conversionRate: 65,
  retailPct: 5,
};

function AestheticsContent({ dateFrom, dateTo }: { dateFrom: Date; dateTo: Date }) {
  /* ── Targets state (editable) ────────────────────────────────────── */
  const [targets, setTargets] = useState(DEFAULT_AES_TARGETS);
  const [editingTargets, setEditingTargets] = useState(false);
  const [draftTargets, setDraftTargets] = useState(DEFAULT_AES_TARGETS);

  /* ── Filtered indices based on date range ──────────────────────────── */
  const filteredIdx = useMemo(
    () => getFilteredIndices(WEEK_DATES, dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const L = filteredIdx.length;

  const totalSvcRev = useMemo(() => sumFiltered(MOCK_AES_SVC_REV, filteredIdx), [filteredIdx]);
  const totalRetailRev = useMemo(() => sumFiltered(MOCK_AES_RETAIL_REV, filteredIdx), [filteredIdx]);
  const totalNetRev = totalSvcRev + totalRetailRev;
  const retailPctOfTotal = totalNetRev > 0 ? (totalRetailRev / totalNetRev) * 100 : 0;

  // Avg Revenue per Available Hour (mock: ~40 avail hours/week)
  const avgRevPerHour = L > 0 ? totalSvcRev / (40 * L) : 0;

  // Repeat customer % (mock)
  const repeatCustomerCount = 47;
  const totalCustomers = 86;
  const repeatPct = (repeatCustomerCount / totalCustomers) * 100;

  // Funnel data (aggregated for filtered range)
  const funnelConsults = useMemo(() => sumFiltered(MOCK_AES_CONSULTS_CAL, filteredIdx), [filteredIdx]);
  const funnelLeads = funnelConsults + Math.round(L * 0.75);
  const funnelBookings = useMemo(() => sumFiltered(MOCK_AES_CONSULTS_CONV, filteredIdx), [filteredIdx]);

  const filteredShows = useMemo(() => sumFiltered(MOCK_AES_CONSULTS_SHOW, filteredIdx), [filteredIdx]);
  const consultShowRate = funnelConsults > 0 ? (filteredShows / funnelConsults) * 100 : 0;
  const filteredBookCal = useMemo(() => sumFiltered(MOCK_AES_BOOK_CAL, filteredIdx), [filteredIdx]);
  const filteredBookShow = useMemo(() => sumFiltered(MOCK_AES_BOOK_SHOW, filteredIdx), [filteredIdx]);
  const bookShowRate = filteredBookCal > 0 ? filteredBookShow / filteredBookCal * 100 : 0;

  // Booking rate: bookings / shows
  const bookingRate = filteredShows > 0 ? (funnelBookings / filteredShows) * 100 : 0;

  // Revenue lost to no-shows: estimated revenue per show × no-shows
  const noShows = funnelConsults - filteredShows;
  const avgRevenuePerShow = filteredShows > 0 ? totalSvcRev / filteredShows : 0;
  const revenueLostToNoShows = Math.round(noShows * avgRevenuePerShow * (bookingRate / 100));

  // Consultation conversion rate
  const filteredConvPcts = useMemo(() => filterByIndices(MOCK_AES_CONV_PCT, filteredIdx), [filteredIdx]);
  const avgConvPct = filteredConvPcts.length > 0 ? avg(filteredConvPcts) : 0;
  const avgAov = Math.round(avg(MOCK_AES_AOV));

  /* ── Target calculations ─────────────────────────────────────────── */
  const revenueTarget = targets.weeklyRevenue * L;
  const revenuePct = revenueTarget > 0 ? (totalNetRev / revenueTarget) * 100 : 0;
  const consultsTarget = targets.consultationsPerWeek * L;
  const consultsPct = consultsTarget > 0 ? (funnelConsults / consultsTarget) * 100 : 0;
  const convTarget = targets.conversionRate;
  const convPct = convTarget > 0 ? (avgConvPct / convTarget) * 100 : 0;
  const retailTarget = targets.retailPct;

  /* ── Subtitle ──────────────────────────────────────────────────────── */
  const subtitle = useMemo(() => {
    const weekCount = filteredCountLabel(L, "week");
    const range = formatDateRangeLabel(dateFrom, dateTo);
    return `${range} · ${weekCount} · All figures EUR ex VAT`;
  }, [L, dateFrom, dateTo]);

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Sales Performance — Aesthetics
        </h1>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* ── KPI Summary Cards (8 cards in 4 cols) ─────────────────────── */}
      <SalesKPIGrid columns={4}>
        <SalesKPICard
          label="Total Net Revenue"
          value={formatCurrency(totalNetRev)}
          subtitle="Services + Retail"
          yoyChange={14.2}
        />
        <SalesKPICard
          label="Consultation Conv %"
          value={`${avgConvPct.toFixed(0)}%`}
          subtitle="Avg across all periods"
          yoyChange={5.2}
        />
        <SalesKPICard
          label="Avg Order Value"
          value={formatCurrency(avgAov)}
          subtitle="Across all consultations"
          yoyChange={3.8}
        />
        <SalesKPICard
          label="Repeat Customer %"
          value={`${repeatPct.toFixed(0)}%`}
          subtitle={`${repeatCustomerCount} of ${totalCustomers} clients`}
          yoyChange={4.5}
        />
      </SalesKPIGrid>

      {/* ── Booking Rate & Show Rate Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-3 md:p-5 text-center border-l-4" style={{ borderLeftColor: chartColors.aesthetics }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Show Rate</p>
          <p className="text-3xl font-bold" style={{ color: chartColors.aesthetics }}>{consultShowRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{filteredShows} showed of {funnelConsults} calendared</p>
        </Card>
        <Card className="p-3 md:p-5 text-center border-l-4" style={{ borderLeftColor: "#059669" }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Booking Rate</p>
          <p className="text-3xl font-bold text-emerald-600">{bookingRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{funnelBookings} booked of {filteredShows} showed</p>
        </Card>
        <Card className="p-3 md:p-5 text-center border-l-4 border-red-400 bg-red-50/50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-xs uppercase tracking-wider text-red-600 font-medium">Revenue Lost to No-Shows</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(revenueLostToNoShows)}</p>
          <p className="text-xs text-muted-foreground mt-1">{noShows} no-shows &times; {formatCurrency(Math.round(avgRevenuePerShow * (bookingRate / 100)))} est. per conversion</p>
        </Card>
      </div>

      {/* ── Sales Funnel ────────────────────────────────────────────── */}
      <FunnelChart
        title="Sales Funnel"
        subtitle={`Consultation show rate: ${consultShowRate.toFixed(0)}% | Booking show rate: ${bookShowRate.toFixed(0)}%`}
        color={chartColors.aesthetics}
        stages={[
          { label: "New Leads", value: funnelLeads, showRate: consultShowRate },
          {
            label: "Consultations",
            value: funnelConsults,
            conversionRate: (funnelConsults / funnelLeads) * 100,
            showRate: consultShowRate,
          },
          {
            label: "Bookings",
            value: funnelBookings,
            conversionRate: (funnelBookings / funnelConsults) * 100,
          },
        ]}
      />

      {/* ── Practitioner Performance ────────────────────────────────── */}
      <StaffPerformanceChart
        title="Practitioner Performance"
        subtitle="Service + Retail revenue (EUR)"
        data={PRACTITIONER_DATA}
        serviceColor={chartColors.aesthetics}
        retailColor={chartColors.spa}
      />

      {/* ── Service Revenue Breakdown ───────────────────────────────── */}
      <ServiceBreakdownChart
        title="Service Revenue Breakdown"
        data={SERVICE_BREAKDOWN}
        color={chartColors.aesthetics}
      />

      {/* ── Targets Section ─────────────────────────────────────────── */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" style={{ color: chartColors.aesthetics }} />
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
              <label className="text-xs text-muted-foreground block mb-1">Retail % of Total</label>
              <input type="number" value={draftTargets.retailPct} onChange={(e) => setDraftTargets({ ...draftTargets, retailPct: Number(e.target.value) })} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          Performance against targets for {L} week{L !== 1 ? "s" : ""} selected. Targets scale proportionally with date range.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Revenue", actual: totalNetRev, target: revenueTarget, format: (v: number) => formatCurrency(v), pct: revenuePct },
            { label: "Consultations", actual: funnelConsults, target: consultsTarget, format: (v: number) => String(v), pct: consultsPct },
            { label: "Conversion Rate", actual: avgConvPct, target: convTarget, format: (v: number) => `${v.toFixed(0)}%`, pct: convPct },
            { label: "Retail %", actual: retailPctOfTotal, target: retailTarget, format: (v: number) => `${v.toFixed(1)}%`, pct: retailTarget > 0 ? (retailPctOfTotal / retailTarget) * 100 : 0 },
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

export default function AestheticsSalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <AestheticsContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
