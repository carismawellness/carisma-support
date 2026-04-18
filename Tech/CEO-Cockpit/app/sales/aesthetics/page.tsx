"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { FunnelChart } from "@/components/sales/FunnelChart";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { ServiceBreakdownChart } from "@/components/sales/ServiceBreakdownChart";
import {
  chartColors,
  formatCurrency,
} from "@/lib/charts/config";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Aesthetics KPIs
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_AES_CONSULTS_CAL   = [6,6,4,18,15,19,22,26,18,15,18,11,11,23,15,7];
const MOCK_AES_CONSULTS_SHOW  = [10,18,10,10,6,8,14,15,8,7,12,4,4,20,12,3];
const MOCK_AES_CONSULTS_CONV  = [6,10,7,8,4,7,7,11,4,3,5,2,1,10,7,2];
const MOCK_AES_CONV_PCT       = [60,56,70,80,67,88,50,73,50,43,42,50,25,50,58,67];
const MOCK_AES_SVC_REV        = [2397,1579,1489,5057,782,1489,3861,4261,3986,1941,1561,2974,1762,1539,4719,1477];
const MOCK_AES_RETAIL_REV     = [0,0,0,0,0,0,310,0,73,78,39,173,0,39,71,0];
const MOCK_AES_AOV            = [332,243,173,270,176,257,236,185];
const MOCK_AES_BOOK_CAL       = [2,1,0,0,0,0,8,14,16,15,13,12,7,24,12];
const MOCK_AES_BOOK_SHOW      = [0,0,0,0,0,0,0,12,8,9,11,10,6,20,8];

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

function AestheticsContent({ dateFrom, dateTo }: { dateFrom: Date; dateTo: Date }) {
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

  // Funnel data (aggregated)
  const funnelLeads = sum(MOCK_AES_CONSULTS_CAL) + 12; // leads slightly > calendared consults
  const funnelConsults = sum(MOCK_AES_CONSULTS_CAL);
  const funnelBookings = sum(MOCK_AES_CONSULTS_CONV);

  const consultShowRate = (sum(MOCK_AES_CONSULTS_SHOW) / sum(MOCK_AES_CONSULTS_CAL)) * 100;
  const bookShowRate = sum(MOCK_AES_BOOK_SHOW) / sum(MOCK_AES_BOOK_CAL) * 100;

  // Consultation conversion rate
  const avgConvPct = avg(MOCK_AES_CONV_PCT);
  const avgAov = Math.round(avg(MOCK_AES_AOV));

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Sales Performance — Aesthetics
        </h1>
        <p className="text-sm text-muted-foreground">
          All figures EUR ex VAT
        </p>
      </div>

      {/* ── KPI Summary Cards (6 cards) ─────────────────────────────── */}
      <SalesKPIGrid columns={6}>
        <SalesKPICard
          label="Total Net Revenue"
          value={formatCurrency(totalNetRev)}
          subtitle="Services + Retail"
          yoyChange={14.2}
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
