"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CIChat } from "@/components/ci/CIChat";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
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
import { StaffPerformanceChart } from "@/components/sales/StaffPerformanceChart";
import { ServiceBreakdownChart } from "@/components/sales/ServiceBreakdownChart";
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
} from "recharts";

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

const WEEK_DATES = weekLabelsToDateObjects(MOCK_WEEKS, 2025);

const MOCK_RETAIL_PCT_COMPANY = [7.7,6.4,4.2,6.6,4.7,5.1,7.1,2.8,5.0,4.9,3.6,7.1,8.2,6.0,7.0,4.2,7.1,4.8,5.0,4.9,8.3,7.1];
const MOCK_ADDON_PCT_COMPANY  = [3.5,3.6,5.2,4.8,4.5,3.3,4.5,2.2,4.0,3.4,3.6,3.5,3.5,3.9,3.1,3.1,2.3,3.2,3.1,4.2,4.0,3.4];
const MOCK_HOTEL_PCT_COMPANY  = [6.0,9.4,7.0,5.6,8.4,8.4,6.7,4.4,7.4,5.0,4.4,3.3,2.9,4.7,3.9,8.1,6.0,10.0,4.5,4.3,3.1,7.0];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
function last(arr: number[], n: number): number[] {
  return arr.slice(-n);
}

/* ═══════════════════════════════════════════════════════════════════════
   DERIVED DATA
   ═══════════════════════════════════════════════════════════════════════ */

// Compute revenue splits per hotel (realistic proportions based on actual data)
const SERVICE_SPLIT = 0.87;   // 87% services

// Compute per-hotel breakdowns for stacked bar
const HOTELS = [
  { name: "InterContinental", data: MOCK_INTER },
  { name: "Hugo's", data: MOCK_HUGOS },
  { name: "Hyatt", data: MOCK_HYATT },
  { name: "Ramla Bay", data: MOCK_RAMLA },
  { name: "Labranda", data: MOCK_LABRANDA },
  { name: "Odycy", data: MOCK_ODYCY },
];

// Hotel-level retail and addon percentages (realistic per-location variation)
const HOTEL_RETAIL_PCTS: Record<string, number> = {
  "InterContinental": 0.036,
  "Hugo's": 0.079,
  "Hyatt": 0.044,
  "Ramla Bay": 0.063,
  "Labranda": 0.028,
  "Odycy": 0.042,
};

const HOTEL_ADDON_PCTS: Record<string, number> = {
  "InterContinental": 0.032,
  "Hugo's": 0.041,
  "Hyatt": 0.036,
  "Ramla Bay": 0.049,
  "Labranda": 0.021,
  "Odycy": 0.033,
};

// Last year totals per hotel (derived from YoY percentages where available, estimated otherwise)
const HOTEL_LY_FACTORS: Record<string, number> = {
  "InterContinental": 1.08,
  "Hugo's": 0.92,
  "Hyatt": 1.05,
  "Ramla Bay": 0.94,
  "Labranda": 1.12,
  "Odycy": 0.88,
};

/* ═══════════════════════════════════════════════════════════════════════
   SPA CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function SpaContent({ dateFrom, dateTo }: { dateFrom: Date; dateTo: Date }) {
  /* ── Filtered indices based on date range ──────────────────────────── */
  const filteredIdx = useMemo(
    () => getFilteredIndices(WEEK_DATES, dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const L = filteredIdx.length;
  const L4 = Math.min(4, L);

  // Company-level KPIs — compute LY totals from weekly YoY data
  const totalRev = useMemo(() => sumFiltered(MOCK_COMPANY, filteredIdx), [filteredIdx]);
  // Derive LY total by summing each week's implied LY value: week_rev / (1 + yoy/100)
  const totalRevLY = useMemo(
    () => filteredIdx.reduce((acc, i) => acc + MOCK_COMPANY[i] / (1 + MOCK_YOY_COMPANY[i] / 100), 0),
    [filteredIdx]
  );
  const yoyTotal = ((totalRev - totalRevLY) / totalRevLY) * 100;

  const totalService = Math.round(totalRev * SERVICE_SPLIT);
  const totalServiceLY = Math.round(totalRevLY * 0.89);
  const yoyService = ((totalService - totalServiceLY) / totalServiceLY) * 100;

  const filteredRetailPcts = useMemo(() => filterByIndices(MOCK_RETAIL_PCT_COMPANY, filteredIdx), [filteredIdx]);
  const avgRetailPct = filteredRetailPcts.length > 0 ? avg(filteredRetailPcts) : 0;
  const totalRetail = Math.round(totalRev * (avgRetailPct / 100));
  const avgRetailPctLY = 5.1;
  const totalRetailLY = Math.round(totalRevLY * (avgRetailPctLY / 100));
  const yoyRetail = totalRetailLY > 0 ? ((totalRetail - totalRetailLY) / totalRetailLY) * 100 : 0;

  const filteredAddonPcts = useMemo(() => filterByIndices(MOCK_ADDON_PCT_COMPANY, filteredIdx), [filteredIdx]);
  const avgAddonPct = filteredAddonPcts.length > 0 ? avg(filteredAddonPcts) : 0;
  const totalAddon = Math.round(totalRev * (avgAddonPct / 100));
  const avgAddonPctLY = 3.8;
  const totalAddonLY = Math.round(totalRevLY * (avgAddonPctLY / 100));
  const yoyAddon = totalAddonLY > 0 ? ((totalAddon - totalAddonLY) / totalAddonLY) * 100 : 0;

  // Available hours: ~440 hrs/week across all locations (realistic for 6 spas)
  const totalHours = 440 * L;
  const revPerHour = totalHours > 0 ? totalRev / totalHours : 0;
  const revPerHourLY = totalHours > 0 ? totalRevLY / totalHours : 0;
  const yoyRevPerHour = revPerHourLY > 0 ? ((revPerHour - revPerHourLY) / revPerHourLY) * 100 : 0;

  // Spa Club memberships
  const memberships = 847;
  const membershipsLY = 782;
  const yoyMemberships = ((memberships - membershipsLY) / membershipsLY) * 100;

  // Hotel Guest Capture Rate
  const filteredHotelPcts = useMemo(() => filterByIndices(MOCK_HOTEL_PCT_COMPANY, filteredIdx), [filteredIdx]);
  const avgHotelCapture = filteredHotelPcts.length > 0 ? avg(filteredHotelPcts) : 0;
  const hotelCaptureLY = 5.8;
  const yoyHotelCapture = avgHotelCapture - hotelCaptureLY;

  // Local Guest %
  const localGuestPct = 38.2;
  const localGuestPctLY = 34.5;
  const yoyLocalGuest = localGuestPct - localGuestPctLY;

  /* ── Subtitle ──────────────────────────────────────────────────────── */
  const subtitle = useMemo(() => {
    const weekCount = filteredCountLabel(L, "week");
    const range = formatDateRangeLabel(dateFrom, dateTo);
    return `${weekCount} of data · ${range} · All figures EUR ex VAT`;
  }, [L, dateFrom, dateTo]);

  /* ── Visualization 1: Revenue by Hotel (Stacked Bar + Line) ────── */
  const hotelRevenueData = useMemo(() => HOTELS.map((h) => {
    const filteredData = filterByIndices(h.data, filteredIdx);
    const lastN = filteredData.slice(-L4);
    const total4w = sum(lastN);
    const retailPct = HOTEL_RETAIL_PCTS[h.name];
    const addonPct = HOTEL_ADDON_PCTS[h.name];
    const servicePct = 1 - retailPct - addonPct;
    const lyFactor = HOTEL_LY_FACTORS[h.name];
    const lyTotal = Math.round(total4w * lyFactor);

    return {
      hotel: h.name,
      Service: Math.round(total4w * servicePct),
      Retail: Math.round(total4w * retailPct),
      "Add-on": Math.round(total4w * addonPct),
      "Last Year Total": lyTotal,
      total: total4w,
      yoy: ((total4w - lyTotal) / lyTotal) * 100,
      retailPct: (HOTEL_RETAIL_PCTS[h.name] * 100).toFixed(1),
    };
  }).sort((a, b) => b.total - a.total), [filteredIdx, L4]);

  /* ── Visualization 2: Average Order Value by Location ──────────── */
  const aovData = [
    { hotel: "InterContinental", current: 128, lastYear: 118 },
    { hotel: "Hugo's", current: 112, lastYear: 105 },
    { hotel: "Hyatt", current: 95, lastYear: 91 },
    { hotel: "Ramla Bay", current: 82, lastYear: 86 },
    { hotel: "Labranda", current: 74, lastYear: 68 },
    { hotel: "Odycy", current: 68, lastYear: 62 },
  ];

  /* ── Visualization 3: Service Revenue Breakdown ─────────────────── */
  const spaServiceBreakdown = [
    { service: "Massage Therapy", revenue: 68400, pct: 37.5 },
    { service: "Facials", revenue: 34200, pct: 18.7 },
    { service: "Body Treatments", revenue: 25600, pct: 14.0 },
    { service: "Hydrotherapy", revenue: 18200, pct: 10.0 },
    { service: "Couples Packages", revenue: 14800, pct: 8.1 },
    { service: "Nail Services", revenue: 11400, pct: 6.2 },
    { service: "Other", revenue: 10000, pct: 5.5 },
  ];

  /* ── Visualization 4: Staff Performance ────────────────────────── */
  const staffData = [
    { name: "Maria Vella", serviceRevenue: 14820, retailRevenue: 2560 },
    { name: "Carmen Borg", serviceRevenue: 13450, retailRevenue: 1720 },
    { name: "Joanne Camilleri", serviceRevenue: 12680, retailRevenue: 1980 },
    { name: "Daniela Farrugia", serviceRevenue: 11970, retailRevenue: 2310 },
    { name: "Charlene Grech", serviceRevenue: 11340, retailRevenue: 2840 },
    { name: "Nicole Zammit", serviceRevenue: 10890, retailRevenue: 1870 },
    { name: "Stephanie Galea", serviceRevenue: 10250, retailRevenue: 1650 },
    { name: "Christine Spiteri", serviceRevenue: 9830, retailRevenue: 1350 },
    { name: "Lorraine Debono", serviceRevenue: 9420, retailRevenue: 1120 },
    { name: "Anthea Calleja", serviceRevenue: 8750, retailRevenue: 1480 },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">
        Sales Performance — Spa Network
      </h1>
      <p className="text-sm text-muted-foreground -mt-4">
        {subtitle}
      </p>

      {/* ── KPI Summary Cards ─────────────────────────────────────── */}
      <SalesKPIGrid columns={4}>
        <SalesKPICard
          label="Total Revenue"
          value={formatCurrency(totalRev)}
          yoyChange={yoyTotal}
        />
        <SalesKPICard
          label="Service Revenue"
          value={formatCurrency(totalService)}
          yoyChange={yoyService}
        />
        <SalesKPICard
          label="Retail Revenue"
          value={formatCurrency(totalRetail)}
          yoyChange={yoyRetail}
          subtitle={`${avgRetailPct.toFixed(1)}% of total`}
        />
        <SalesKPICard
          label="Add-on Revenue"
          value={formatCurrency(totalAddon)}
          yoyChange={yoyAddon}
          subtitle={`${avgAddonPct.toFixed(1)}% of total`}
        />
      </SalesKPIGrid>

      {/* ── Viz 1: Revenue by Hotel (Stacked Bar + Line) ──────────── */}
      <Card className="p-3 md:p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Revenue by Hotel
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Stacked by revenue type with last year overlay. Sorted by current
          total descending.
        </p>
        <div className="h-[260px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={hotelRevenueData}
            margin={{ top: 16, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis
              dataKey="hotel"
              tick={{ fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                String(name),
              ]}
              labelFormatter={(label) => {
                const item = hotelRevenueData.find((d) => d.hotel === label);
                return item
                  ? `${label} — Total: ${formatCurrency(item.total)}`
                  : String(label);
              }}
            />
            <Legend />
            <Bar
              dataKey="Service"
              stackId="rev"
              fill={chartColors.spa}
              radius={[0, 0, 0, 0]}
            >
              <LabelList
                dataKey="Service"
                content={(props) => {
                  const { x, width, y, height, value } = props as Record<string, unknown>;
                  const w = Number(width);
                  if (w < 35) return <></>;
                  return (
                    <text
                      x={Number(x) + w / 2}
                      y={Number(y) + Number(height) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontWeight={600}
                      fill="white"
                    >
                      {formatCurrency(Number(value))}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar
              dataKey="Retail"
              stackId="rev"
              fill={chartColors.aesthetics}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Add-on"
              stackId="rev"
              fill={chartColors.slimming}
              radius={[3, 3, 0, 0]}
            >
              <LabelList
                dataKey="total"
                content={(props) => {
                  const { x, width, y, index } = props as Record<string, unknown>;
                  const entry = hotelRevenueData[Number(index)];
                  if (!entry) return <></>;
                  return (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 8}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={700}
                      fill="#374151"
                    >
                      {formatCurrency(entry.total)}
                    </text>
                  );
                }}
              />
            </Bar>
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
        </div>
      </Card>

      {/* ── Viz 2: Average Order Value by Location ────────────────── */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Average Order Value by Location
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Current period AOV vs last year per hotel
        </p>
        <div className="h-[240px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={aovData}
            margin={{ top: 16, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis
              dataKey="hotel"
              tick={{ fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tickFormatter={(v: number) => `\u20AC${v}`}
              tick={{ fontSize: 11 }}
              domain={[0, 160]}
            />
            <Tooltip
              formatter={(value, name) => [
                `\u20AC${Number(value)}`,
                String(name) === "current" ? "This Year" : "Last Year",
              ]}
            />
            <Legend />
            <Bar
              dataKey="current"
              name="This Year"
              fill={chartColors.spa}
              radius={[3, 3, 0, 0]}
              barSize={32}
            >
              <LabelList
                dataKey="current"
                position="top"
                content={(props) => {
                  const { x, width, y, value } = props as Record<string, unknown>;
                  return (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 6}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="#374151"
                    >
                      €{String(value)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Line
              type="monotone"
              dataKey="lastYear"
              name="Last Year"
              stroke={chartColors.target}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 4, fill: chartColors.target }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </Card>

      {/* ── Viz 3: Staff Performance ─────────────────────────────── */}
      <StaffPerformanceChart
        title="Staff Performance"
        subtitle="Top 10 staff (EUR)"
        data={staffData}
        serviceColor={chartColors.spa}
        retailColor={chartColors.aesthetics}
      />

      {/* ── Viz 4: Service Revenue Breakdown ──────────────────────── */}
      <ServiceBreakdownChart
        title="Service Revenue Breakdown"
        data={spaServiceBreakdown}
        color={chartColors.spa}
      />

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SpaSalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => <SpaContent dateFrom={dateFrom} dateTo={dateTo} />}
    </DashboardShell>
  );
}
