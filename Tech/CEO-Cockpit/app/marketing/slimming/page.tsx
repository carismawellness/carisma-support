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

const BRAND_COLOR = "#8EB093";

/* ---------- mock data ---------- */

const META_CAMPAIGNS = [
  { campaign: "Body Sculpting Malta - Lookalike", cpl: 18.40, dailyBudget: 15, actualSpend: 14.20, totalSpend: 412, totalLeads: 22, ctr: 2.1, cpm: 8.90, frequency: 1.8, attributedRevenue: 4950, peakCtr: 2.3 },
  { campaign: "Weight Loss Free Consult", cpl: 15.20, dailyBudget: 20, actualSpend: 18.50, totalSpend: 547, totalLeads: 36, ctr: 2.8, cpm: 7.40, frequency: 1.5, attributedRevenue: 7200, peakCtr: 3.0 },
  { campaign: "Summer Body Ready - Interest", cpl: 22.30, dailyBudget: 10, actualSpend: 9.80, totalSpend: 268, totalLeads: 12, ctr: 1.6, cpm: 10.20, frequency: 2.1, attributedRevenue: 2700, peakCtr: 2.1 },
  { campaign: "Slimming Course - Retarget", cpl: 12.80, dailyBudget: 8, actualSpend: 7.60, totalSpend: 192, totalLeads: 15, ctr: 3.4, cpm: 6.80, frequency: 2.8, attributedRevenue: 3375, peakCtr: 4.4 },
  { campaign: "Medical Weight Loss - Broad", cpl: 24.50, dailyBudget: 12, actualSpend: 11.40, totalSpend: 318, totalLeads: 13, ctr: 1.4, cpm: 11.50, frequency: 1.3, attributedRevenue: 2925, peakCtr: 1.5 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Slimming Malta - Brand", cpl: 12.40, dailyBudget: 5, totalLeads: 8, totalAdSpend: 99, avgCpc: 1.85, ctr: 8.2, conversions: 6, conversionRate: 12.5, expectedRevenue: 2700, blendedRoas: 27.3 },
  { campaign: "Weight Loss Clinic Malta", cpl: 18.60, dailyBudget: 8, totalLeads: 11, totalAdSpend: 205, avgCpc: 3.20, ctr: 4.1, conversions: 7, conversionRate: 6.8, expectedRevenue: 3150, blendedRoas: 15.4 },
  { campaign: "Body Sculpting Near Me", cpl: 15.80, dailyBudget: 6, totalLeads: 9, totalAdSpend: 142, avgCpc: 2.60, ctr: 5.3, conversions: 5, conversionRate: 8.2, expectedRevenue: 2250, blendedRoas: 15.8 },
  { campaign: "Fat Reduction Malta", cpl: 21.50, dailyBudget: 5, totalLeads: 6, totalAdSpend: 129, avgCpc: 3.80, ctr: 3.5, conversions: 4, conversionRate: 5.9, expectedRevenue: 1800, blendedRoas: 14.0 },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

/* ---------- content component ---------- */

function SlimmingMarketingContent({
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
    { label: "Blended ROAS", value: "2.8x", target: "3.0x", targetValue: 3.0, currentValue: 2.8 },
    { label: "CPL", value: "\u20AC18.50" },
    { label: "Lead-to-Close %", value: "22%" },
    { label: "Rebooking Rate %", value: "52%" },
    { label: "LTV/CAC Ratio", value: "3.4x", target: "3.0x", targetValue: 3.0, currentValue: 3.4 },
    { label: "Total Leads", value: "18" },
    { label: "Total Consultations", value: "10" },
    { label: "Total Bookings", value: "6" },
  ], []);

  /* --- Section 3: Email Marketing KPIs --- */
  const emailKpis = useMemo<KPIData[]>(() => [
    { label: "Email ROAS", value: "28x" },
    { label: "Total Subscribers", value: "812" },
    { label: "Pop-up Capture Rate", value: "2.8%" },
    { label: "Campaign Revenue", value: formatCurrency(1240) },
    { label: "Flow Revenue", value: formatCurrency(680) },
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

  const googleTotalRevenue = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.expectedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalRevenue * 1.15);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Slimming Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Carisma Slimming — course-based model, launched Feb 2026
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
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(1480)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: N/A</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">New Brand</span>
          </div>
          {/* Wix Revenue */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Wix Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(340)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: N/A</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">New Brand</span>
          </div>
          {/* Total Marketing Spend */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Marketing Spend</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(525)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: N/A</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">New Brand</span>
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
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>2.4x</p>
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
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={metaCplChartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `\u20AC${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(value) => `\u20AC${Number(value).toFixed(2)}`} />
              <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                {metaCplChartData.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLOR} fillOpacity={1 - i * 0.15} />
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
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>3.6x</p>
          </div>
        </div>

        {/* CPL by Campaign - Horizontal Bar */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={googleCplChartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `\u20AC${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
              <Tooltip formatter={(value) => `\u20AC${Number(value).toFixed(2)}`} />
              <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                {googleCplChartData.map((_, i) => (
                  <Cell key={i} fill={BRAND_COLOR} fillOpacity={1 - i * 0.18} />
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
          <p className="text-xs text-gray-500 mt-1">Based on {formatCurrency(googleTotalRevenue)} total expected revenue</p>
        </div>
      </Card>

      {/* Section 6: CIChat */}
      <CIChat />
    </>
  );
}

/* ---------- page export ---------- */

export default function SlimmingMarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <SlimmingMarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
