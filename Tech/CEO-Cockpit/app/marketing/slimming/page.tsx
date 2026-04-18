"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  formatCurrency,
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
  { campaign: "Body Sculpting Malta - Lookalike", cpl: 18.40, dailyBudget: 15, totalSpend: 412, totalLeads: 22, ctr: 2.1, cpm: 8.90, frequency: 1.8, attributedRevenue: 4950, peakCtr: 2.3 },
  { campaign: "Weight Loss Free Consult", cpl: 15.20, dailyBudget: 20, totalSpend: 547, totalLeads: 36, ctr: 2.8, cpm: 7.40, frequency: 1.5, attributedRevenue: 7200, peakCtr: 3.0 },
  { campaign: "Summer Body Ready - Interest", cpl: 22.30, dailyBudget: 10, totalSpend: 268, totalLeads: 12, ctr: 1.6, cpm: 10.20, frequency: 2.1, attributedRevenue: 2700, peakCtr: 2.1 },
  { campaign: "Slimming Course - Retarget", cpl: 12.80, dailyBudget: 8, totalSpend: 192, totalLeads: 15, ctr: 3.4, cpm: 6.80, frequency: 2.8, attributedRevenue: 3375, peakCtr: 4.4 },
  { campaign: "Medical Weight Loss - Broad", cpl: 24.50, dailyBudget: 12, totalSpend: 318, totalLeads: 13, ctr: 1.4, cpm: 11.50, frequency: 1.3, attributedRevenue: 2925, peakCtr: 1.5 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Slimming Malta - Brand", cpl: 12.40, dailyBudget: 5, totalLeads: 8, totalSpend: 99, ctr: 8.2, cpm: 12.40, frequency: 1.4, attributedRevenue: 2700, peakCtr: 8.8 },
  { campaign: "Weight Loss Clinic Malta", cpl: 18.60, dailyBudget: 8, totalLeads: 11, totalSpend: 205, ctr: 4.1, cpm: 18.20, frequency: 1.6, attributedRevenue: 3150, peakCtr: 4.8 },
  { campaign: "Body Sculpting Near Me", cpl: 15.80, dailyBudget: 6, totalLeads: 9, totalSpend: 142, ctr: 5.3, cpm: 15.60, frequency: 1.3, attributedRevenue: 2250, peakCtr: 5.8 },
  { campaign: "Fat Reduction Malta", cpl: 21.50, dailyBudget: 5, totalLeads: 6, totalSpend: 129, ctr: 3.5, cpm: 20.80, frequency: 1.9, attributedRevenue: 1800, peakCtr: 4.2 },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

function getFatigueCounts(campaigns: { frequency: number; ctr: number; peakCtr: number }[]) {
  let fatigued = 0;
  let watch = 0;
  let healthy = 0;
  campaigns.forEach((c) => {
    const s = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
    if (s.label === "Fatigued") fatigued++;
    else if (s.label === "Watch") watch++;
    else healthy++;
  });
  return { fatigued, watch, healthy };
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
  /* --- Fatigue counts --- */
  const metaFatigue = useMemo(() => getFatigueCounts(META_CAMPAIGNS), []);
  const googleFatigue = useMemo(() => getFatigueCounts(GOOGLE_CAMPAIGNS), []);
  const totalFatigued = metaFatigue.fatigued + googleFatigue.fatigued;
  const totalWatch = metaFatigue.watch + googleFatigue.watch;

  /* --- Section 1: Hero KPIs --- */
  const heroCards = useMemo(() => [
    { label: "Revenue", value: "\u20AC1,480", ly: "N/A" },
    { label: "Wix Revenue", value: "\u20AC340", ly: "N/A" },
    { label: "Total Marketing Spend", value: "\u20AC525", ly: "N/A" },
    { label: "Meta Blended CPL", value: "\u20AC18.50", ly: "N/A" },
    { label: "Google Blended CPC", value: "\u20AC2.60", ly: "N/A" },
    { label: "Rebooking Rate", value: "52%", ly: "N/A" },
  ], []);

  /* --- Email Marketing --- */
  const emailCampaignRev = 1240;
  const emailFlowRev = 680;

  /* --- Meta Ads columns (no Actual Spend) --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
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
  const metaTotalSpend = META_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const metaExpectedRoas = metaTotalSpend > 0 ? (metaExpectedRevenue / metaTotalSpend).toFixed(1) : "0.0";

  /* --- Google Ads --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const googleCplChartData = useMemo(() =>
    [...GOOGLE_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => ({ name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign, cpl: c.cpl, fullName: c.campaign })),
  []);

  const googleTotalAttributed = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalAttributed * 1.15);
  const googleTotalSpend = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const googleExpectedRoas = googleTotalSpend > 0 ? (googleExpectedRevenue / googleTotalSpend).toFixed(1) : "0.0";

  /* --- Email aggregate --- */
  const emailTotalRevenue = emailCampaignRev + emailFlowRev;
  const emailExpectedRevenue = Math.round(emailTotalRevenue * 1.15);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Slimming Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Carisma Slimming — course-based model, launched Feb 2026
        </p>
        {/* Fatigue alert badge */}
        {(totalFatigued > 0 || totalWatch > 0) && (
          <div className="mt-2 flex items-center gap-2">
            {totalFatigued > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {totalFatigued} Fatigued
              </span>
            )}
            {totalWatch > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {totalWatch} Watch
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section 1: Hero KPIs with "New Brand" badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {heroCards.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">LY: {kpi.ly}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              New Brand
            </span>
          </Card>
        ))}
      </div>

      {/* Consultation Funnel */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Funnel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">18</p>
          </div>
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Consultations</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">6</p>
          </div>
        </div>
      </Card>

      {/* Section 2: Meta Ads */}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{metaFatigue.healthy} Healthy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{metaFatigue.watch} Watch</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{metaFatigue.fatigued} Fatigued</span>
            </div>
          </div>
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

        {/* Meta Channel Aggregate */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Revenue in Meta</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(metaExpectedRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Attributed x 1.15</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Ad Spend</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(metaTotalSpend)}</p>
            <p className="text-xs text-gray-500 mt-1">Sum of total spend</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected ROAS</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{metaExpectedRoas}x</p>
            <p className="text-xs text-gray-500 mt-1">Expected Rev / Spend</p>
          </div>
        </div>
      </Card>

      {/* Section 3: Google Ads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>3.6x</p>
          </div>
        </div>

        {/* Creative Fatigue Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{googleFatigue.healthy} Healthy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{googleFatigue.watch} Watch</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{googleFatigue.fatigued} Fatigued</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {GOOGLE_CAMPAIGNS.map((c) => {
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

        {/* Google Channel Aggregate */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Revenue in Google</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(googleExpectedRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Expected x 1.15</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Ad Spend</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(googleTotalSpend)}</p>
            <p className="text-xs text-gray-500 mt-1">Sum of total spend</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected ROAS</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{googleExpectedRoas}x</p>
            <p className="text-xs text-gray-500 mt-1">Expected Rev / Spend</p>
          </div>
        </div>
      </Card>

      {/* Section 4: Email Marketing */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Email ROAS", value: "28x" },
            { label: "Total Subscribers", value: "812" },
            { label: "Pop-up Capture Rate", value: "2.8%" },
            { label: "Open Rate", value: "32.1%" },
            { label: "Click Rate", value: "3.4%" },
            { label: "Unsubscribe Rate", value: "0.5%" },
            { label: "Campaign Revenue", value: formatCurrency(emailCampaignRev) },
            { label: "Flow Revenue", value: formatCurrency(emailFlowRev) },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Email Channel Aggregate */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Revenue in Email</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{formatCurrency(emailExpectedRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Sum x 1.15</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected Subscribers</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>980</p>
            <p className="text-xs text-gray-500 mt-1">Projected growth</p>
          </div>
          <div className="rounded-lg border-2 p-4 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-sm text-gray-600">Expected ROAS</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>28x</p>
            <p className="text-xs text-gray-500 mt-1">Email ROAS</p>
          </div>
        </div>
      </Card>

      {/* Section 5: Fatigue Dashboard */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Creative Fatigue Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700 mb-1">Healthy</p>
            <p className="text-3xl font-bold text-green-700">{metaFatigue.healthy + googleFatigue.healthy}</p>
            <p className="text-xs text-green-600 mt-1">campaigns performing well</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4 text-center">
            <p className="text-sm text-amber-700 mb-1">Watch</p>
            <p className="text-3xl font-bold text-amber-700">{totalWatch}</p>
            <p className="text-xs text-amber-600 mt-1">campaigns to monitor</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="text-sm text-red-700 mb-1">Fatigued</p>
            <p className="text-3xl font-bold text-red-700">{totalFatigued}</p>
            <p className="text-xs text-red-600 mt-1">campaigns need refresh</p>
          </div>
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
