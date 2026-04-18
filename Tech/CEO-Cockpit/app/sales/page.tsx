"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Company-wide aggregated from all brands
   Realistic EUR values based on existing weekly spa data + AES + SLIM
   ═══════════════════════════════════════════════════════════════════════ */

// Current period totals (rolling 4 weeks)
const KPI_DATA = {
  totalNetRevenue: { value: 218_640, yoy: 4.2 },
  servicesRevenue: { value: 199_430, yoy: 3.8 },
  retailRevenue: { value: 12_180, pctOfTotal: 5.6, yoy: 8.1 },
  addonRevenue: { value: 7_030, pctOfTotal: 3.2, yoy: -2.4 },
  avgRevenuePerHour: { value: 34.7, yoy: 6.3 },
  spaClubMembers: { value: 142, yoy: 12.7 },
  hotelGuestCapture: { value: 5.8, yoy: 1.2 },
  localGuestPct: { value: 38.4, yoy: -2.6 },
};

// Revenue by Hotel — stacked breakdown (current period)
const HOTEL_REVENUE_DATA = [
  {
    hotel: "InterContinental",
    services: 42_890,
    retail: 3_620,
    addon: 1_840,
    lastYearTotal: 51_200,
  },
  {
    hotel: "Hugo's",
    services: 48_370,
    retail: 3_150,
    addon: 1_680,
    lastYearTotal: 49_800,
  },
  {
    hotel: "Hyatt",
    services: 22_940,
    retail: 1_280,
    addon: 920,
    lastYearTotal: 27_100,
  },
  {
    hotel: "Ramla Bay",
    services: 27_160,
    retail: 1_840,
    addon: 1_350,
    lastYearTotal: 25_900,
  },
  {
    hotel: "Labranda",
    services: 15_090,
    retail: 980,
    addon: 620,
    lastYearTotal: 18_400,
  },
  {
    hotel: "Odycy",
    services: 16_240,
    retail: 1_310,
    addon: 620,
    lastYearTotal: 15_200,
  },
];

// AOV by location
const AOV_DATA = [
  { hotel: "InterContinental", aov: 78, lastYearAov: 82 },
  { hotel: "Hugo's", aov: 72, lastYearAov: 68 },
  { hotel: "Hyatt", aov: 65, lastYearAov: 69 },
  { hotel: "Ramla Bay", aov: 58, lastYearAov: 54 },
  { hotel: "Labranda", aov: 52, lastYearAov: 55 },
  { hotel: "Odycy", aov: 61, lastYearAov: 57 },
];

// Staff performance — Service revenue (top 10)
const STAFF_SERVICE_REV = [
  { name: "Maria Camilleri", revenue: 14_820 },
  { name: "Josef Borg", revenue: 13_540 },
  { name: "Daniela Vella", revenue: 12_970 },
  { name: "Claire Galea", revenue: 11_680 },
  { name: "Anna Zammit", revenue: 10_930 },
  { name: "Lara Farrugia", revenue: 10_210 },
  { name: "Stefan Micallef", revenue: 9_870 },
  { name: "Rachel Attard", revenue: 9_340 },
  { name: "Josianne Spiteri", revenue: 8_760 },
  { name: "Noel Grech", revenue: 8_420 },
];

// Staff performance — Retail revenue (top 10)
const STAFF_RETAIL_REV = [
  { name: "Claire Galea", revenue: 2_180 },
  { name: "Maria Camilleri", revenue: 1_940 },
  { name: "Lara Farrugia", revenue: 1_620 },
  { name: "Anna Zammit", revenue: 1_410 },
  { name: "Daniela Vella", revenue: 1_280 },
  { name: "Josianne Spiteri", revenue: 1_150 },
  { name: "Rachel Attard", revenue: 980 },
  { name: "Stefan Micallef", revenue: 740 },
  { name: "Josef Borg", revenue: 520 },
  { name: "Noel Grech", revenue: 360 },
];

/* ═══════════════════════════════════════════════════════════════════════
   CHART HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function yoyPct(current: number, lastYear: number): number {
  if (lastYear === 0) return 0;
  return ((current - lastYear) / lastYear) * 100;
}

const hotelChartData = HOTEL_REVENUE_DATA.map((h) => {
  const currentTotal = h.services + h.retail + h.addon;
  return {
    hotel: h.hotel,
    Services: h.services,
    Retail: h.retail,
    "Add-ons": h.addon,
    "Last Year Total": h.lastYearTotal,
    yoyPct: yoyPct(currentTotal, h.lastYearTotal),
  };
});

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ═══════════════════════════════════════════════════════════════════════ */

function HotelRevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-6 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   YOY LABEL ON BARS
   ═══════════════════════════════════════════════════════════════════════ */

interface BarLabelProps {
  x?: string | number;
  width?: string | number;
  y?: string | number;
  index?: number;
}

function renderYoYLabel(props: BarLabelProps) {
  const { x: rawX = 0, width: rawW = 0, y: rawY = 0, index = 0 } = props;
  const x = Number(rawX);
  const width = Number(rawW);
  const y = Number(rawY);
  const entry = hotelChartData[index];
  if (!entry) return null;
  const pct = entry.yoyPct;
  const isPositive = pct >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isPositive ? "#059669" : "#dc2626"}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AOV LABEL
   ═══════════════════════════════════════════════════════════════════════ */

function renderAovLabel(props: BarLabelProps) {
  const { x: rawX = 0, width: rawW = 0, y: rawY = 0, index = 0 } = props;
  const x = Number(rawX);
  const width = Number(rawW);
  const y = Number(rawY);
  const entry = AOV_DATA[index];
  if (!entry) return null;
  const pct = yoyPct(entry.aov, entry.lastYearAov);
  const isPositive = pct >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isPositive ? "#059669" : "#dc2626"}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          {/* ── Page Header ─────────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Sales Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Company-wide performance across all brands and locations | All
              figures EUR ex VAT
            </p>
          </div>

          {/* ── KPI Summary Cards (8 cards, 4 per row) ──────────────── */}
          <SalesKPIGrid>
            <SalesKPICard
              label="Total Net Revenue"
              value={formatCurrency(KPI_DATA.totalNetRevenue.value)}
              yoyChange={KPI_DATA.totalNetRevenue.yoy}
            />
            <SalesKPICard
              label="Services Revenue"
              value={formatCurrency(KPI_DATA.servicesRevenue.value)}
              yoyChange={KPI_DATA.servicesRevenue.yoy}
            />
            <SalesKPICard
              label="Retail Revenue"
              value={formatCurrency(KPI_DATA.retailRevenue.value)}
              subtitle={`${KPI_DATA.retailRevenue.pctOfTotal}% of total`}
              yoyChange={KPI_DATA.retailRevenue.yoy}
            />
            <SalesKPICard
              label="Add-on Revenue"
              value={formatCurrency(KPI_DATA.addonRevenue.value)}
              subtitle={`${KPI_DATA.addonRevenue.pctOfTotal}% of total`}
              yoyChange={KPI_DATA.addonRevenue.yoy}
            />
            <SalesKPICard
              label="Avg Revenue / Available Hour"
              value={`\u20AC${KPI_DATA.avgRevenuePerHour.value.toFixed(1)}`}
              yoyChange={KPI_DATA.avgRevenuePerHour.yoy}
            />
            <SalesKPICard
              label="Spa Club Memberships"
              value={KPI_DATA.spaClubMembers.value.toLocaleString()}
              yoyChange={KPI_DATA.spaClubMembers.yoy}
            />
            <SalesKPICard
              label="Hotel Guest Capture Rate"
              value={formatPercent(KPI_DATA.hotelGuestCapture.value)}
              yoyChange={KPI_DATA.hotelGuestCapture.yoy}
              yoyIsDelta
            />
            <SalesKPICard
              label="Local Guest %"
              value={formatPercent(KPI_DATA.localGuestPct.value)}
              yoyChange={KPI_DATA.localGuestPct.yoy}
              yoyIsDelta
            />
          </SalesKPIGrid>

          {/* ── Revenue by Hotel (Stacked Bar + Line) ────────────────── */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Revenue by Hotel
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Stacked current period vs last year total line overlay | YoY delta
              shown above each bar
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart
                data={hotelChartData}
                margin={{ top: 24, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis
                  dataKey="hotel"
                  tick={{ fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    `${(v / 1000).toFixed(0)}k`
                  }
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<HotelRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="square"
                />
                <Bar
                  dataKey="Services"
                  stackId="revenue"
                  fill={chartColors.spa}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Retail"
                  stackId="revenue"
                  fill={chartColors.aesthetics}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Add-ons"
                  stackId="revenue"
                  fill={chartColors.slimming}
                  radius={[3, 3, 0, 0]}
                  label={renderYoYLabel}
                />
                <Line
                  type="monotone"
                  dataKey="Last Year Total"
                  stroke={chartColors.target}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: chartColors.target }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* ── Average Order Value by Location ─────────────────────── */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Average Order Value by Location
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Current period AOV vs last year | YoY delta shown above each bar
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart
                data={AOV_DATA}
                margin={{ top: 24, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis
                  dataKey="hotel"
                  tick={{ fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v: number) => `\u20AC${v}`}
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(v, name) =>
                    [`\u20AC${v}`, name === "aov" ? "Current AOV" : "Last Year AOV"]
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="aov"
                  name="Current AOV"
                  fill={chartColors.spa}
                  radius={[3, 3, 0, 0]}
                  label={renderAovLabel}
                />
                <Line
                  type="monotone"
                  dataKey="lastYearAov"
                  name="Last Year AOV"
                  stroke={chartColors.target}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: chartColors.target }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* ── Staff Performance ────────────────────────────────── */}
          <StaffPerformanceChart
            title="Staff Performance"
            subtitle="Top 10 — current period (EUR)"
            tabs={[
              { key: "service", label: "Service Revenue", data: STAFF_SERVICE_REV, color: chartColors.spa },
              { key: "retail", label: "Retail Revenue", data: STAFF_RETAIL_REV, color: chartColors.aesthetics },
            ]}
          />

          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
