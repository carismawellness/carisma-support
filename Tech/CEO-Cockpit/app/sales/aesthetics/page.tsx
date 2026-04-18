"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { FunnelChart } from "@/components/sales/FunnelChart";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from "recharts";
import { TrendingUp, UserCheck } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Aesthetics Weekly KPIs
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_AES_WEEKS = [
  "W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14","W15","W16",
];
const MOCK_AES_CONSULTS_CAL   = [6,6,4,18,15,19,22,26,18,15,18,11,11,23,15,7];
const MOCK_AES_CONSULTS_SHOW  = [10,18,10,10,6,8,14,15,8,7,12,4,4,20,12,3];
const MOCK_AES_CONSULTS_CONV  = [6,10,7,8,4,7,7,11,4,3,5,2,1,10,7,2];
const MOCK_AES_CONV_PCT       = [60,56,70,80,67,88,50,73,50,43,42,50,25,50,58,67];
const MOCK_AES_SVC_REV        = [2397,1579,1489,5057,782,1489,3861,4261,3986,1941,1561,2974,1762,1539,4719,1477];
const MOCK_AES_RETAIL_REV     = [0,0,0,0,0,0,310,0,73,78,39,173,0,39,71,0];
const MOCK_AES_AOV            = [332,243,173,270,176,257,236,185];
const MOCK_AES_ACTIVE_MEMBERS = [6,6,5,5,4,2,1,0,1,2,3,3,3,4,5,5];
const MOCK_AES_BOOK_CAL       = [2,1,0,0,0,0,8,14,16,15,13,12,7,24,12];
const MOCK_AES_BOOK_SHOW      = [0,0,0,0,0,0,0,12,8,9,11,10,6,20,8];

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
   THERAPIST PERFORMANCE DATA (mock — sorted descending)
   ═══════════════════════════════════════════════════════════════════════ */

const THERAPIST_SERVICE_REV = [
  { name: "Dr. Elisa Grech", revenue: 14200 },
  { name: "Dr. Martina Vella", revenue: 11850 },
  { name: "Kyra Camilleri", revenue: 9400 },
  { name: "Daniela Borg", revenue: 7600 },
  { name: "Leanne Farrugia", revenue: 5900 },
  { name: "Anthea Zammit", revenue: 4350 },
  { name: "Jade Attard", revenue: 3100 },
];

const THERAPIST_RETAIL_REV = [
  { name: "Kyra Camilleri", revenue: 2850 },
  { name: "Daniela Borg", revenue: 2200 },
  { name: "Leanne Farrugia", revenue: 1750 },
  { name: "Anthea Zammit", revenue: 1400 },
  { name: "Jade Attard", revenue: 980 },
  { name: "Dr. Elisa Grech", revenue: 620 },
  { name: "Dr. Martina Vella", revenue: 410 },
];

const THERAPIST_PACKAGE_REV = [
  { name: "Dr. Elisa Grech", revenue: 8600 },
  { name: "Kyra Camilleri", revenue: 6900 },
  { name: "Dr. Martina Vella", revenue: 5400 },
  { name: "Leanne Farrugia", revenue: 4200 },
  { name: "Daniela Borg", revenue: 3800 },
  { name: "Anthea Zammit", revenue: 2100 },
  { name: "Jade Attard", revenue: 1500 },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function AestheticsContent({ dateFrom, dateTo }: { dateFrom: Date; dateTo: Date }) {
  const L4 = 4;
  const recentConvPct = last(MOCK_AES_CONV_PCT, L4);
  const latestMembers = MOCK_AES_ACTIVE_MEMBERS[MOCK_AES_ACTIVE_MEMBERS.length - 1];

  const totalSvcRev = sum(MOCK_AES_SVC_REV);
  const totalRetailRev = sum(MOCK_AES_RETAIL_REV);
  const totalNetRev = totalSvcRev + totalRetailRev;
  const retailPctOfTotal = (totalRetailRev / totalNetRev) * 100;

  // Avg Revenue per Available Hour (mock: ~40 avail hours/week, 16 weeks)
  const avgRevPerHour = totalSvcRev / (40 * 16);

  // Repeat customer % (mock)
  const repeatCustomerCount = 47;
  const totalCustomers = 86;
  const repeatPct = (repeatCustomerCount / totalCustomers) * 100;

  // Funnel data (last 4 weeks aggregated)
  const recentCal = last(MOCK_AES_CONSULTS_CAL, L4);
  const recentShow = last(MOCK_AES_CONSULTS_SHOW, L4);
  const recentConv = last(MOCK_AES_CONSULTS_CONV, L4);
  const recentBookCal = last(MOCK_AES_BOOK_CAL, L4);
  const recentBookShow = last(MOCK_AES_BOOK_SHOW, L4);

  const funnelLeads = sum(recentCal) + 12; // leads slightly > calendared consults
  const funnelConsults = sum(recentCal);
  const funnelBookings = sum(recentConv);

  const consultShowRate = (sum(recentShow) / sum(recentCal)) * 100;
  const bookShowRate = sum(recentBookShow) / sum(recentBookCal) * 100;

  // Revenue Trend data
  const revTrendData = MOCK_AES_WEEKS.map((w, i) => ({
    week: w,
    "Service Revenue": MOCK_AES_SVC_REV[i],
    "Retail Revenue": MOCK_AES_RETAIL_REV[i],
  }));

  // Consults & Conversion data
  const consultTrendData = MOCK_AES_WEEKS.map((w, i) => ({
    week: w,
    Calendared: MOCK_AES_CONSULTS_CAL[i],
    Converted: MOCK_AES_CONSULTS_CONV[i],
    "Conversion %": MOCK_AES_CONV_PCT[i],
  }));

  // AOV trend data
  const aovData = MOCK_AES_AOV.map((v, i) => ({
    week: `W${i + 1}`,
    AOV: v,
  }));

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Sales Performance — Aesthetics
        </h1>
        <p className="text-sm text-muted-foreground">
          16 weeks of data | All figures EUR ex VAT | Last updated: W16
        </p>
      </div>

      {/* ── KPI Summary Cards (6 cards) ─────────────────────────────── */}
      <SalesKPIGrid>
        <SalesKPICard
          label="Total Net Revenue"
          value={formatCurrency(totalNetRev)}
          subtitle="Services + Retail"
          yoyChange={14.2}
        />
        <SalesKPICard
          label="Services Revenue"
          value={formatCurrency(totalSvcRev)}
          subtitle={`${MOCK_AES_WEEKS.length} weeks`}
          yoyChange={12.8}
        />
        <SalesKPICard
          label="Retail Revenue"
          value={formatCurrency(totalRetailRev)}
          subtitle={`${retailPctOfTotal.toFixed(1)}% of total`}
          yoyChange={-8.3}
        />
        <SalesKPICard
          label="Rev / Available Hour"
          value={`\u20AC${avgRevPerHour.toFixed(0)}`}
          subtitle="Per treatment hour"
          yoyChange={6.1}
        />
        <SalesKPICard
          label="Active Members"
          value={String(latestMembers)}
          subtitle="Current membership"
          yoyChange={-16.7}
        />
        <SalesKPICard
          label="Repeat Customer %"
          value={`${repeatPct.toFixed(0)}%`}
          subtitle={`${repeatCustomerCount} of ${totalCustomers} clients`}
          yoyChange={4.5}
        />
      </SalesKPIGrid>

      {/* ── Sales Funnel ────────────────────────────────────────────── */}
      <FunnelChart
        title="Sales Funnel — Last 4 Weeks"
        subtitle={`Consultation show rate: ${consultShowRate.toFixed(0)}% | Booking show rate: ${bookShowRate.toFixed(0)}%`}
        color="#2A8A7A"
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

      {/* ── Consultation Conversion Rate (prominent) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-teal-50/50 to-white">
          <UserCheck className="h-8 w-8 text-teal-600 mb-2" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Consultation Conversion Rate
          </p>
          <p className="text-4xl font-bold text-teal-700 tracking-tight">
            {avg(recentConvPct).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last 4 weeks avg | All-time: {avg(MOCK_AES_CONV_PCT).toFixed(0)}%
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 mt-2">
            <TrendingUp className="h-3 w-3" />
            +5.2% vs LY
          </span>
        </Card>

        {/* ── Average Order Value ─────────────────────────────────── */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Average Order Value</h2>
          <p className="text-3xl font-bold text-foreground mb-1">
            {formatCurrency(Math.round(avg(MOCK_AES_AOV)))}
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={aovData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis hide domain={[0, 400]} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="AOV" fill={chartColors.aesthetics} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Service Revenue Breakdown ───────────────────────────── */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Service Revenue Breakdown</h2>
          <div className="space-y-2.5">
            {SERVICE_BREAKDOWN.map((svc) => (
              <div key={svc.service} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">
                  {svc.service}
                </span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${svc.pct}%`,
                      background: `linear-gradient(90deg, #2A8A7A, #3db5a0)`,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-16 text-right">
                  {formatCurrency(svc.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Therapist Performance (tabbed) ───────────────────────── */}
      <StaffPerformanceChart
        title="Therapist Performance"
        subtitle="Last 4 weeks (EUR) — sorted by revenue descending"
        tabs={[
          { key: "service", label: "Service", data: THERAPIST_SERVICE_REV, color: chartColors.aesthetics },
          { key: "retail", label: "Retail", data: THERAPIST_RETAIL_REV, color: chartColors.spa },
          { key: "packages", label: "Packages", data: THERAPIST_PACKAGE_REV, color: chartColors.target },
        ]}
      />

      {/* ── Revenue Trend Chart ──────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Trend</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Service revenue (teal) + Retail revenue (light teal) | Weekly
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={revTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="Service Revenue"
              fill={chartColors.aesthetics}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="Retail Revenue"
              fill="#5ccdb8"
              radius={[3, 3, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Consults & Conversion Chart ──────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Consultations & Conversion</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Calendared vs Converted with conversion % overlay
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={consultTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="count" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="pct"
              orientation="right"
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="count"
              dataKey="Calendared"
              fill="#5ccdb8"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="count"
              dataKey="Converted"
              fill={chartColors.aesthetics}
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="pct"
              type="monotone"
              dataKey="Conversion %"
              stroke={chartColors.target}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Weekly Detail Table ──────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Detail</h2>
        <DataTable
          columns={[
            { key: "week", label: "Week" },
            {
              key: "svcRev",
              label: "Service Rev",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => formatCurrency(v as number),
            },
            {
              key: "retailRev",
              label: "Retail Rev",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => formatCurrency(v as number),
            },
            {
              key: "consultsCalendared",
              label: "Consults Cal",
              align: "right" as const,
              sortable: true,
            },
            {
              key: "consultsShowed",
              label: "Showed",
              align: "right" as const,
              sortable: true,
            },
            {
              key: "converted",
              label: "Converted",
              align: "right" as const,
              sortable: true,
            },
            {
              key: "convPct",
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
                return (
                  <span className={`font-medium ${color}`}>{val}%</span>
                );
              },
            },
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
