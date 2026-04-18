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
  formatPercent,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ---------- constants ---------- */

const BRAND_COLOR = "#B8943E";

/* ---------- mock data ---------- */

const META_CAMPAIGNS = [
  { campaign: "Spa Packages - Lookalike", cpl: 9.20, dailyBudget: 25, actualSpend: 22.40, totalSpend: 680, totalLeads: 74, ctr: 2.8, cpm: 14.50, frequency: 1.9, attributedRevenue: 3420, peakCtr: 3.0 },
  { campaign: "Couples Massage - Interest", cpl: 11.50, dailyBudget: 20, actualSpend: 18.60, totalSpend: 540, totalLeads: 47, ctr: 2.1, cpm: 16.20, frequency: 2.3, attributedRevenue: 2180, peakCtr: 2.6 },
  { campaign: "Hotel Guest Welcome - Retarget", cpl: 6.80, dailyBudget: 15, actualSpend: 14.20, totalSpend: 420, totalLeads: 62, ctr: 4.2, cpm: 9.80, frequency: 3.1, attributedRevenue: 2840, peakCtr: 5.8 },
  { campaign: "Deep Tissue - Broad", cpl: 13.40, dailyBudget: 18, actualSpend: 16.80, totalSpend: 490, totalLeads: 37, ctr: 1.6, cpm: 18.40, frequency: 2.0, attributedRevenue: 1560, peakCtr: 1.8 },
  { campaign: "Prenatal Spa - Interest", cpl: 10.90, dailyBudget: 12, actualSpend: 11.50, totalSpend: 340, totalLeads: 31, ctr: 2.4, cpm: 12.60, frequency: 1.7, attributedRevenue: 1420, peakCtr: 2.6 },
  { campaign: "Spring Refresh - Seasonal", cpl: 8.60, dailyBudget: 10, actualSpend: 9.80, totalSpend: 290, totalLeads: 34, ctr: 3.1, cpm: 11.20, frequency: 1.5, attributedRevenue: 1680, peakCtr: 3.2 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Spa Malta - Brand", cpl: 5.40, dailyBudget: 15, totalLeads: 48, totalAdSpend: 259, avgCpc: 1.85, ctr: 8.2, conversions: 42, conversionRate: 12.4, expectedRevenue: 2940, blendedRoas: 11.4 },
  { campaign: "Couples Massage Malta", cpl: 7.80, dailyBudget: 12, totalLeads: 31, totalAdSpend: 242, avgCpc: 2.40, ctr: 5.6, conversions: 26, conversionRate: 8.9, expectedRevenue: 1820, blendedRoas: 7.5 },
  { campaign: "Hotel Spa Near Me", cpl: 6.20, dailyBudget: 10, totalLeads: 38, totalAdSpend: 236, avgCpc: 2.10, ctr: 6.4, conversions: 34, conversionRate: 10.2, expectedRevenue: 2380, blendedRoas: 10.1 },
  { campaign: "Spa Packages Malta", cpl: 8.90, dailyBudget: 8, totalLeads: 22, totalAdSpend: 196, avgCpc: 2.80, ctr: 4.8, conversions: 18, conversionRate: 7.6, expectedRevenue: 1260, blendedRoas: 6.4 },
  { campaign: "Relaxation Massage Valletta", cpl: 9.60, dailyBudget: 6, totalLeads: 16, totalAdSpend: 154, avgCpc: 3.10, ctr: 4.1, conversions: 12, conversionRate: 6.8, expectedRevenue: 840, blendedRoas: 5.5 },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

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
  /* --- Section 1: Hero Metrics --- */
  const heroKpis = useMemo<KPIData[]>(() => [
    { label: "Blended ROAS", value: "5.2x", target: "5.0x", targetValue: 5.0, currentValue: 5.2 },
    { label: "CPL", value: "\u20AC7.80" },
    { label: "Lead-to-Close %", value: "32%" },
    { label: "Rebooking Rate %", value: "44%" },
    { label: "LTV/CAC Ratio", value: "4.8x", target: "3.0x", targetValue: 3.0, currentValue: 4.8 },
  ], []);

  /* --- Section 3: Email Marketing KPIs --- */
  const emailKpis = useMemo<KPIData[]>(() => [
    { label: "Email ROAS", value: "42x" },
    { label: "Total Subscribers", value: "4,527" },
    { label: "Pop-up Capture Rate", value: "3.2%" },
    { label: "Campaign Revenue", value: formatCurrency(6840) },
    { label: "Flow Revenue", value: formatCurrency(3120) },
  ], []);

  /* --- Section 4: Meta Ads --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "actualSpend", label: "Actual Spend", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const metaCplChartData = useMemo(() =>
    [...META_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => ({ name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign, cpl: c.cpl, fullName: c.campaign })),
  []);

  const metaTotalAttributed = META_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);

  /* --- Section 5: Google Ads --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "totalAdSpend", label: "Total Ad Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "avgCpc", label: "Avg CPC", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "conversions", label: "Conv.", align: "right" as const, sortable: true },
    { key: "conversionRate", label: "Conv Rate", align: "right" as const, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "expectedRevenue", label: "Expected Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "blendedRoas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}x` },
  ];

  const googleCplChartData = useMemo(() =>
    [...GOOGLE_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => ({ name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign, cpl: c.cpl, fullName: c.campaign })),
  []);

  const googleTotalExpectedRev = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.expectedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalExpectedRev * 1.15);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spa Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Weekly performance across all marketing channels for Carisma Spa &amp; Wellness
        </p>
      </div>

      {/* Section 1: Hero Metrics */}
      <KPICardRow kpis={heroKpis} />

      {/* Section 2: Revenue & Spend */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue &amp; Spend</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(9847)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(8620)}</p>
            <p className="text-sm font-medium text-green-600 mt-0.5">+14.2% YoY</p>
          </div>
          {/* Wix Revenue */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Wix Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(1240)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(1080)}</p>
            <p className="text-sm font-medium text-green-600 mt-0.5">+14.8% YoY</p>
          </div>
          {/* Total Marketing Spend */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Marketing Spend</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(655)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(601)}</p>
            <p className="text-sm font-medium text-red-600 mt-0.5">+8.5% YoY</p>
          </div>
        </div>
      </Card>

      {/* Section 3: Email Marketing */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>
        <KPICardRow kpis={emailKpis} />
      </Card>

      {/* Section 4: Meta Ads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Meta Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Meta ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>4.1x</p>
          </div>
        </div>

        {/* Creative Fatigue Indicator */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Creative Fatigue</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {META_CAMPAIGNS.map((c) => {
              const status = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
              return (
                <div key={c.campaign} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${status.bg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.color}`} />
                  <span className="truncate">{c.campaign}</span>
                  <span className="text-xs opacity-70 flex-shrink-0">({c.frequency}x)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CPL by Campaign - Horizontal Bar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metaCplChartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `\u20AC${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(value) => `\u20AC${Number(value).toFixed(2)}`} />
              <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                {metaCplChartData.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLOR} fillOpacity={1 - i * 0.12} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Table */}
        <DataTable columns={metaColumns} data={META_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Expected Revenue */}
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
          <p className="text-sm text-gray-600">Expected Revenue (1.15x pipeline multiplier)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(metaExpectedRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Based on {formatCurrency(metaTotalAttributed)} total attributed revenue</p>
        </div>
      </Card>

      {/* Section 5: Google Ads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>7.4x</p>
          </div>
        </div>

        {/* CPL by Campaign - Horizontal Bar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={googleCplChartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `\u20AC${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(value) => `\u20AC${Number(value).toFixed(2)}`} />
              <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                {googleCplChartData.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLOR} fillOpacity={1 - i * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Table */}
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Expected Revenue */}
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
          <p className="text-sm text-gray-600">Expected Revenue (1.15x pipeline multiplier)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(googleExpectedRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Based on {formatCurrency(googleTotalExpectedRev)} total expected revenue</p>
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
