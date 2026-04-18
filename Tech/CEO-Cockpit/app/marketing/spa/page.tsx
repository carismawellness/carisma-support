"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
} from "@/lib/charts/config";
import {
  BarChart,
  PieChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
} from "recharts";

/* ---------- channel colors ---------- */

const CHANNEL_COLORS = {
  Google: "#4285F4",
  Meta: "#1877F2",
  Influencer: "#E1306C",
  Email: "#8B5CF6",
} as const;

/* ---------- mock data ---------- */

const WEEKLY_DATA = [
  { week: "W6 (Feb 3)", google: 185, meta: 280, influencer: 90, email: 45, revenue: 2180, wixRevenue: 1120 },
  { week: "W7 (Feb 10)", google: 195, meta: 310, influencer: 105, email: 48, revenue: 2340, wixRevenue: 1165 },
  { week: "W8 (Feb 17)", google: 210, meta: 290, influencer: 95, email: 52, revenue: 2270, wixRevenue: 1200 },
  { week: "W9 (Feb 24)", google: 200, meta: 305, influencer: 100, email: 50, revenue: 2420, wixRevenue: 1240 },
  { week: "W10 (Mar 3)", google: 215, meta: 320, influencer: 110, email: 55, revenue: 2510, wixRevenue: 1280 },
  { week: "W11 (Mar 10)", google: 190, meta: 295, influencer: 85, email: 47, revenue: 2190, wixRevenue: 1150 },
  { week: "W12 (Mar 17)", google: 205, meta: 315, influencer: 100, email: 53, revenue: 2450, wixRevenue: 1310 },
  { week: "W13 (Mar 24)", google: 210, meta: 300, influencer: 95, email: 50, revenue: 2480, wixRevenue: 1240 },
];

const CURRENT_WEEK = WEEKLY_DATA[WEEKLY_DATA.length - 1];
const PREV_WEEK = WEEKLY_DATA[WEEKLY_DATA.length - 2];

const META_CAMPAIGNS = [
  { campaign: "Spa Packages - Lookalike", cpl: 9.20, dailyBudget: 25, actualSpend: 22.40, totalSpend: 680, totalLeads: 74, ctr: 2.8, cpm: 14.50, frequency: 1.9, attributedRevenue: 3420 },
  { campaign: "Couples Massage - Interest", cpl: 11.50, dailyBudget: 20, actualSpend: 18.60, totalSpend: 540, totalLeads: 47, ctr: 2.1, cpm: 16.20, frequency: 2.3, attributedRevenue: 2180 },
  { campaign: "Hotel Guest Welcome - Retarget", cpl: 6.80, dailyBudget: 15, actualSpend: 14.20, totalSpend: 420, totalLeads: 62, ctr: 4.2, cpm: 9.80, frequency: 3.1, attributedRevenue: 2840 },
  { campaign: "Deep Tissue - Broad", cpl: 13.40, dailyBudget: 18, actualSpend: 16.80, totalSpend: 490, totalLeads: 37, ctr: 1.6, cpm: 18.40, frequency: 2.0, attributedRevenue: 1560 },
  { campaign: "Prenatal Spa - Interest", cpl: 10.90, dailyBudget: 12, actualSpend: 11.50, totalSpend: 340, totalLeads: 31, ctr: 2.4, cpm: 12.60, frequency: 1.7, attributedRevenue: 1420 },
  { campaign: "Spring Refresh - Seasonal", cpl: 8.60, dailyBudget: 10, actualSpend: 9.80, totalSpend: 290, totalLeads: 34, ctr: 3.1, cpm: 11.20, frequency: 1.5, attributedRevenue: 1680 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Spa Malta - Brand", cpl: 5.40, dailyBudget: 15, totalLeads: 48, totalAdSpend: 259, avgCpc: 1.85, ctr: 8.2, conversions: 42, conversionRate: 12.4, expectedRevenue: 2940, blendedRoas: 11.4 },
  { campaign: "Couples Massage Malta", cpl: 7.80, dailyBudget: 12, totalLeads: 31, totalAdSpend: 242, avgCpc: 2.40, ctr: 5.6, conversions: 26, conversionRate: 8.9, expectedRevenue: 1820, blendedRoas: 7.5 },
  { campaign: "Hotel Spa Near Me", cpl: 6.20, dailyBudget: 10, totalLeads: 38, totalAdSpend: 236, avgCpc: 2.10, ctr: 6.4, conversions: 34, conversionRate: 10.2, expectedRevenue: 2380, blendedRoas: 10.1 },
  { campaign: "Spa Packages Malta", cpl: 8.90, dailyBudget: 8, totalLeads: 22, totalAdSpend: 196, avgCpc: 2.80, ctr: 4.8, conversions: 18, conversionRate: 7.6, expectedRevenue: 1260, blendedRoas: 6.4 },
  { campaign: "Relaxation Massage Valletta", cpl: 9.60, dailyBudget: 6, totalLeads: 16, totalAdSpend: 154, avgCpc: 3.10, ctr: 4.1, conversions: 12, conversionRate: 6.8, expectedRevenue: 840, blendedRoas: 5.5 },
];

/* ---------- content component ---------- */

function SpaMarketingContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* --- Section 1: Top-Level KPIs --- */
  const topKpis = useMemo<KPIData[]>(() => {
    const currentRevenue = CURRENT_WEEK.revenue * 4.1; // ~monthly extrapolation for display context
    const currentWeekSpend = CURRENT_WEEK.google + CURRENT_WEEK.meta + CURRENT_WEEK.influencer + CURRENT_WEEK.email;
    const totalMonthlySpend = WEEKLY_DATA.reduce(
      (acc, w) => acc + w.google + w.meta + w.influencer + w.email,
      0
    );
    const prevWixPct = ((PREV_WEEK.wixRevenue / CURRENT_WEEK.wixRevenue) * 100).toFixed(1);

    return [
      { label: "Revenue (This Week)", value: formatCurrency(9847) },
      { label: "Blended Revenue", value: formatCurrency(11240), target: "€12,000", targetValue: 12000, currentValue: 11240 },
      { label: "Total Marketing Spend", value: formatCurrency(totalMonthlySpend) },
      { label: "YoY Revenue Growth", value: "+14.2%", trend: 14.2 },
      { label: "YoY Marketing Spend Growth", value: "+8.6%", trend: 8.6 },
      { label: "Wix Sales Revenue", value: `€1,240 (prev: ${prevWixPct}%)` },
    ];
  }, []);

  /* --- Section 2: Marketing Spend Breakdown --- */
  const spendPieData = useMemo(() => {
    const totals = WEEKLY_DATA.reduce(
      (acc, w) => ({
        Google: acc.Google + w.google,
        Meta: acc.Meta + w.meta,
        Influencer: acc.Influencer + w.influencer,
        Email: acc.Email + w.email,
      }),
      { Google: 0, Meta: 0, Influencer: 0, Email: 0 }
    );
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, []);

  const spendStackedData = useMemo(() => {
    return WEEKLY_DATA.map((w) => ({
      week: w.week,
      Google: w.google,
      Meta: w.meta,
      Influencer: w.influencer,
      Email: w.email,
    }));
  }, []);

  /* --- Section 3: Performance KPIs --- */
  const performanceKpis = useMemo<KPIData[]>(() => {
    return [
      { label: "Blended ROAS", value: "5.2x", target: "5.0x", targetValue: 5.0, currentValue: 5.2 },
      { label: "Google ROAS", value: "7.4x", target: "6.0x", targetValue: 6.0, currentValue: 7.4 },
      { label: "Meta ROAS", value: "4.1x", target: "4.0x", targetValue: 4.0, currentValue: 4.1 },
      { label: "Email Revenue %", value: "28.4%", target: "35%", targetValue: 35, currentValue: 28.4 },
      { label: "Total Email Subscribers", value: "4,527" },
      { label: "Pop-up Capture Rate", value: "3.2%", target: "4.0%", targetValue: 4.0, currentValue: 3.2 },
      { label: "Campaign Attributed Rev", value: formatCurrency(6840) },
      { label: "Flow Attributed Rev", value: formatCurrency(3120) },
    ];
  }, []);

  /* --- Section 4: Meta Ads Table --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "actualSpend", label: "Actual Spend", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const metaTotalAttributed = META_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);

  /* --- Section 5: Google Ads Table --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Leads", align: "right" as const, sortable: true },
    { key: "totalAdSpend", label: "Ad Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "avgCpc", label: "Avg CPC", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "conversions", label: "Conv.", align: "right" as const, sortable: true },
    { key: "conversionRate", label: "Conv Rate", align: "right" as const, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "expectedRevenue", label: "Expected Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "blendedRoas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}x` },
  ];

  const googleTotalExpectedRev = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.expectedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalExpectedRev * 1.15);

  /* --- Pie chart custom label --- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPieLabel = (props: any) =>
    `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spa Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Weekly performance across all marketing channels for Carisma Spa &amp; Wellness
        </p>
      </div>

      {/* Section 1: Top-Level KPIs */}
      <KPICardRow kpis={topKpis} />

      {/* Section 2: Marketing Spend Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Marketing Spend Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Channel Split (Period Total)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  label={renderPieLabel}
                  animationDuration={chartDefaults.animationDuration}
                >
                  {spendPieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHANNEL_COLORS[entry.name as keyof typeof CHANNEL_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Weekly Spend by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendStackedData} margin={chartDefaults.margin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v: number) => `€${v}`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="Google" stackId="spend" fill={CHANNEL_COLORS.Google} />
                <Bar dataKey="Meta" stackId="spend" fill={CHANNEL_COLORS.Meta} />
                <Bar dataKey="Influencer" stackId="spend" fill={CHANNEL_COLORS.Influencer} />
                <Bar dataKey="Email" stackId="spend" fill={CHANNEL_COLORS.Email} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Section 3: Performance KPIs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance KPIs
        </h2>
        <KPICardRow kpis={performanceKpis} />
      </Card>

      {/* Section 4: Meta Ads Deep Dive */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Meta Ads — Active Campaigns
        </h2>
        <DataTable columns={metaColumns} data={META_CAMPAIGNS as unknown as Record<string, unknown>[]} />
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: chartColors.spa, backgroundColor: `${chartColors.spa}10` }}>
          <p className="text-sm text-gray-600">Expected Revenue (1.15x pipeline multiplier)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: chartColors.spa }}>
            {formatCurrency(metaExpectedRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {formatCurrency(metaTotalAttributed)} total attributed revenue
          </p>
        </div>
      </Card>

      {/* Section 5: Google Ads Deep Dive */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Google Ads — Campaign Performance
        </h2>
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS as unknown as Record<string, unknown>[]} />
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: CHANNEL_COLORS.Google, backgroundColor: `${CHANNEL_COLORS.Google}10` }}>
          <p className="text-sm text-gray-600">Expected Revenue (1.15x pipeline multiplier)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: CHANNEL_COLORS.Google }}>
            {formatCurrency(googleExpectedRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {formatCurrency(googleTotalExpectedRev)} total expected revenue
          </p>
        </div>
      </Card>

      {/* Section 6: CIChat */}
      <CIChat />
    </>
  );
}

/* ---------- page export ---------- */

export default function SpaMarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <SpaMarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
