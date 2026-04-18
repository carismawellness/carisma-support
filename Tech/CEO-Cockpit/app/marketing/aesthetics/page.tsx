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

const BRAND_COLOR = "#2A8A7A";

/* ---------- mock data ---------- */

const META_CAMPAIGNS = [
  { campaign: "Botox Malta - Lookalike", cpl: 14.20, dailyBudget: 25, actualSpend: 23.80, totalSpend: 712, totalLeads: 50, ctr: 2.1, cpm: 18.50, frequency: 1.8, attributedRevenue: 7350, peakCtr: 2.3 },
  { campaign: "Lip Filler Free Consult", cpl: 12.80, dailyBudget: 30, actualSpend: 28.50, totalSpend: 854, totalLeads: 67, ctr: 2.6, cpm: 16.20, frequency: 1.5, attributedRevenue: 9800, peakCtr: 2.8 },
  { campaign: "Body Contouring - Interest", cpl: 18.40, dailyBudget: 20, actualSpend: 19.20, totalSpend: 576, totalLeads: 31, ctr: 1.7, cpm: 21.30, frequency: 2.1, attributedRevenue: 4650, peakCtr: 2.2 },
  { campaign: "Laser Hair Removal - Retarget", cpl: 11.50, dailyBudget: 15, actualSpend: 14.80, totalSpend: 443, totalLeads: 39, ctr: 3.2, cpm: 14.80, frequency: 2.4, attributedRevenue: 5720, peakCtr: 3.8 },
  { campaign: "Anti-Aging Facial - DPA", cpl: 15.90, dailyBudget: 18, actualSpend: 17.10, totalSpend: 512, totalLeads: 32, ctr: 1.9, cpm: 19.70, frequency: 1.9, attributedRevenue: 4690, peakCtr: 2.1 },
  { campaign: "Free Consultation - Broad", cpl: 13.10, dailyBudget: 22, actualSpend: 21.30, totalSpend: 638, totalLeads: 49, ctr: 2.3, cpm: 17.10, frequency: 1.6, attributedRevenue: 7180, peakCtr: 2.5 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Botox Malta - Brand", cpl: 10.20, dailyBudget: 8, totalLeads: 14, totalAdSpend: 143, avgCpc: 3.80, ctr: 8.4, conversions: 12, conversionRate: 14.2, expectedRevenue: 2940, blendedRoas: 20.6 },
  { campaign: "Lip Filler Malta", cpl: 14.80, dailyBudget: 10, totalLeads: 11, totalAdSpend: 163, avgCpc: 4.50, ctr: 6.1, conversions: 8, conversionRate: 10.8, expectedRevenue: 1960, blendedRoas: 12.0 },
  { campaign: "Aesthetics Clinic Near Me", cpl: 12.50, dailyBudget: 6, totalLeads: 8, totalAdSpend: 100, avgCpc: 3.20, ctr: 7.3, conversions: 7, conversionRate: 12.5, expectedRevenue: 1715, blendedRoas: 17.2 },
  { campaign: "Body Contouring Malta", cpl: 16.30, dailyBudget: 7, totalLeads: 6, totalAdSpend: 98, avgCpc: 5.10, ctr: 5.2, conversions: 5, conversionRate: 8.9, expectedRevenue: 1225, blendedRoas: 12.5 },
  { campaign: "Laser Hair Removal", cpl: 11.70, dailyBudget: 5, totalLeads: 7, totalAdSpend: 82, avgCpc: 3.40, ctr: 7.8, conversions: 6, conversionRate: 11.5, expectedRevenue: 1470, blendedRoas: 17.9 },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

/* ---------- content component ---------- */

function AestheticsMarketingContent({
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
    { label: "Blended ROAS", value: "4.6x", target: "4.0x", targetValue: 4.0, currentValue: 4.6 },
    { label: "CPL", value: "\u20AC14.20" },
    { label: "Lead-to-Close %", value: "19%" },
    { label: "Rebooking Rate %", value: "38%" },
    { label: "LTV/CAC Ratio", value: "5.2x", target: "3.0x", targetValue: 3.0, currentValue: 5.2 },
    { label: "Total Leads", value: "62" },
    { label: "Total Consultations", value: "17" },
    { label: "Total Bookings", value: "13" },
  ], []);

  /* --- Section 3: Email Marketing KPIs --- */
  const emailKpis = useMemo<KPIData[]>(() => [
    { label: "Email ROAS", value: "38x" },
    { label: "Total Subscribers", value: "2,814" },
    { label: "Pop-up Capture Rate", value: "4.1%" },
    { label: "Campaign Revenue", value: formatCurrency(3420) },
    { label: "Flow Revenue", value: formatCurrency(1890) },
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
        <h1 className="text-2xl font-bold text-gray-900">Aesthetics Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Carisma Aesthetics — consult-driven medical aesthetics performance
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
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(4280)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(3750)}</p>
            <p className="text-sm font-medium text-green-600 mt-0.5">+14.1% YoY</p>
          </div>
          {/* Wix Revenue */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Wix Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(890)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(720)}</p>
            <p className="text-sm font-medium text-green-600 mt-0.5">+23.6% YoY</p>
          </div>
          {/* Total Marketing Spend */}
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Marketing Spend</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(925)}</p>
            <p className="text-sm text-gray-400 mt-1">Last year: {formatCurrency(810)}</p>
            <p className="text-sm font-medium text-red-600 mt-0.5">+14.2% YoY</p>
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
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>3.8x</p>
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
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>6.2x</p>
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
          <p className="text-xs text-gray-500 mt-1">Based on {formatCurrency(googleTotalRevenue)} total expected revenue</p>
        </div>
      </Card>

      {/* Section 6: CIChat */}
      <CIChat />
    </>
  );
}

/* ---------- page export ---------- */

export default function AestheticsMarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <AestheticsMarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
