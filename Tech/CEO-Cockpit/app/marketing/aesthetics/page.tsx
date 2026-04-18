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

const BRAND_COLOR = "#96B2B2";

/* ---------- mock data ---------- */

const META_CAMPAIGNS = [
  { campaign: "Botox Malta - Lookalike", cpl: 14.20, dailyBudget: 25, totalSpend: 712, totalLeads: 50, ctr: 2.1, cpm: 18.50, frequency: 1.8, attributedRevenue: 7350, peakCtr: 2.3 },
  { campaign: "Lip Filler Free Consult", cpl: 12.80, dailyBudget: 30, totalSpend: 854, totalLeads: 67, ctr: 2.6, cpm: 16.20, frequency: 1.5, attributedRevenue: 9800, peakCtr: 2.8 },
  { campaign: "Body Contouring - Interest", cpl: 18.40, dailyBudget: 20, totalSpend: 576, totalLeads: 31, ctr: 1.7, cpm: 21.30, frequency: 2.1, attributedRevenue: 4650, peakCtr: 2.2 },
  { campaign: "Laser Hair Removal - Retarget", cpl: 11.50, dailyBudget: 15, totalSpend: 443, totalLeads: 39, ctr: 3.2, cpm: 14.80, frequency: 2.4, attributedRevenue: 5720, peakCtr: 3.8 },
  { campaign: "Anti-Aging Facial - DPA", cpl: 15.90, dailyBudget: 18, totalSpend: 512, totalLeads: 32, ctr: 1.9, cpm: 19.70, frequency: 1.9, attributedRevenue: 4690, peakCtr: 2.1 },
  { campaign: "Free Consultation - Broad", cpl: 13.10, dailyBudget: 22, totalSpend: 638, totalLeads: 49, ctr: 2.3, cpm: 17.10, frequency: 1.6, attributedRevenue: 7180, peakCtr: 2.5 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Botox Malta - Brand", cpl: 10.20, dailyBudget: 8, totalLeads: 14, totalSpend: 143, ctr: 8.4, cpm: 22.10, frequency: 1.4, attributedRevenue: 2940, roas: 20.6, peakCtr: 9.0 },
  { campaign: "Lip Filler Malta", cpl: 14.80, dailyBudget: 10, totalLeads: 11, totalSpend: 163, ctr: 6.1, cpm: 19.80, frequency: 1.6, attributedRevenue: 1960, roas: 12.0, peakCtr: 6.8 },
  { campaign: "Aesthetics Clinic Near Me", cpl: 12.50, dailyBudget: 6, totalLeads: 8, totalSpend: 100, ctr: 7.3, cpm: 17.50, frequency: 1.3, attributedRevenue: 1715, roas: 17.2, peakCtr: 7.8 },
  { campaign: "Body Contouring Malta", cpl: 16.30, dailyBudget: 7, totalLeads: 6, totalSpend: 98, ctr: 5.2, cpm: 24.30, frequency: 1.8, attributedRevenue: 1225, roas: 12.5, peakCtr: 5.9 },
  { campaign: "Laser Hair Removal", cpl: 11.70, dailyBudget: 5, totalLeads: 7, totalSpend: 82, ctr: 7.8, cpm: 15.20, frequency: 1.2, attributedRevenue: 1470, roas: 17.9, peakCtr: 8.2 },
];

/* ---------- hero KPI data ---------- */

const HERO_KPIS = [
  { label: "Revenue", value: "\u20AC4,280", lastYear: "\u20AC3,750", yoy: "+14.1%", yoyPositive: true },
  { label: "Wix Revenue", value: "\u20AC890", lastYear: "\u20AC720", yoy: "+23.6%", yoyPositive: true },
  { label: "Total Marketing Spend", value: "\u20AC925", lastYear: "\u20AC810", yoy: "+14.2%", yoyPositive: false },
  { label: "Meta Blended CPL", value: "\u20AC14.20", lastYear: "\u20AC15.80", yoy: "-10.1%", yoyPositive: true },
  { label: "Google Blended CPC", value: "\u20AC3.80", lastYear: "\u20AC4.30", yoy: "-11.6%", yoyPositive: true },
  { label: "Rebooking Rate", value: "38%", lastYear: "34%", yoy: "+11.8%", yoyPositive: true },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

function countFatigueStatuses(campaigns: { frequency: number; ctr: number; peakCtr: number }[]) {
  let healthy = 0, watch = 0, fatigued = 0;
  for (const c of campaigns) {
    const s = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
    if (s.label === "Healthy") healthy++;
    else if (s.label === "Watch") watch++;
    else fatigued++;
  }
  return { healthy, watch, fatigued };
}

/* ---------- Aggregate Metric Box ---------- */

function AggregateBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg border-2 p-4 text-center"
      style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{value}</p>
    </div>
  );
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
  /* --- Fatigue counts --- */
  const metaFatigue = useMemo(() => countFatigueStatuses(META_CAMPAIGNS), []);
  const googleFatigue = useMemo(() => countFatigueStatuses(GOOGLE_CAMPAIGNS), []);
  const totalFatigue = useMemo(() => ({
    healthy: metaFatigue.healthy + googleFatigue.healthy,
    watch: metaFatigue.watch + googleFatigue.watch,
    fatigued: metaFatigue.fatigued + googleFatigue.fatigued,
  }), [metaFatigue, googleFatigue]);

  const hasFatigued = totalFatigue.fatigued > 0;

  /* --- Meta Ads --- */
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
  const metaExpectedRoas = metaTotalSpend > 0 ? (metaExpectedRevenue / metaTotalSpend).toFixed(1) : "0";

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
  const googleExpectedRoas = googleTotalSpend > 0 ? (googleExpectedRevenue / googleTotalSpend).toFixed(1) : "0";

  /* --- Email aggregates --- */
  const emailCampaignRevenue = 3420;
  const emailFlowRevenue = 1890;
  const emailTotalRevenue = emailCampaignRevenue + emailFlowRevenue;
  const emailExpectedRevenue = Math.round(emailTotalRevenue * 1.15);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Aesthetics Marketing Dashboard
          {hasFatigued && (
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {totalFatigue.fatigued} Fatigued
            </span>
          )}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Carisma Aesthetics — consult-driven medical aesthetics performance
        </p>
      </div>

      {/* Section 1: Hero KPIs with YoY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {HERO_KPIS.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">LY: {kpi.lastYear}</p>
            <p className={`text-xs font-semibold mt-0.5 ${kpi.yoyPositive ? "text-green-600" : "text-red-600"}`}>
              {kpi.yoy} YoY
            </p>
          </Card>
        ))}
      </div>

      {/* Consultation Funnel KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">62</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Consultations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">17</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">13</p>
        </Card>
      </div>

      {/* Section 2: Meta Ads */}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />{metaFatigue.healthy} Healthy</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{metaFatigue.watch} Watch</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{metaFatigue.fatigued} Fatigued</span>
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

        {/* Channel Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Meta" value={formatCurrency(metaExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(metaTotalSpend)} />
          <AggregateBox label="Expected ROAS" value={`${metaExpectedRoas}x`} />
        </div>
      </Card>

      {/* Section 3: Google Ads */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>6.2x</p>
          </div>
        </div>

        {/* Creative Fatigue Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />{googleFatigue.healthy} Healthy</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{googleFatigue.watch} Watch</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{googleFatigue.fatigued} Fatigued</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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

        {/* Channel Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Google" value={formatCurrency(googleExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(googleTotalSpend)} />
          <AggregateBox label="Expected ROAS" value={`${googleExpectedRoas}x`} />
        </div>
      </Card>

      {/* Section 4: Email Marketing */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email ROAS</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">38x</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Subscribers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">2,814</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pop-up Capture Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">4.1%</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Open Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">35.2%</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Click Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">3.8%</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unsubscribe Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0.4%</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(emailCampaignRevenue)}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flow Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(emailFlowRevenue)}</p>
          </Card>
        </div>

        {/* Email Channel Aggregate Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Email" value={formatCurrency(emailExpectedRevenue)} />
          <AggregateBox label="Expected Subscribers" value="3,120" />
          <AggregateBox label="Expected ROAS" value="38x" />
        </div>
      </Card>

      {/* Section 5: CIChat */}
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
