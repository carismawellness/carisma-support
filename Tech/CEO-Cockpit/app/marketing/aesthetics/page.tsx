"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  formatCurrency,
} from "@/lib/charts/config";
import { formatDateRangeLabel } from "@/lib/utils/mock-date-filter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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
  { label: "Revenue", value: "€4,280", lastYear: "€3,750", yoy: "+14.1%", yoyPositive: true },
  { label: "Wix Revenue", value: "€890", lastYear: "€720", yoy: "+23.6%", yoyPositive: true },
  { label: "Total Marketing Spend", value: "€925", lastYear: "€810", yoy: "+14.2%", yoyPositive: false },
  { label: "Meta Blended CPL", value: "€14.20", lastYear: "€15.80", yoy: "-10.1%", yoyPositive: true },
  { label: "Google Blended CPC", value: "€3.80", lastYear: "€4.30", yoy: "-11.6%", yoyPositive: true },
  { label: "Rebooking Rate", value: "38%", lastYear: "34%", yoy: "+11.8%", yoyPositive: true },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string; barColor: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700", barColor: "#EF4444" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700", barColor: "#F59E0B" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700", barColor: "#22C55E" };
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

function roasColor(roas: number): string {
  if (roas >= 5) return "text-green-600";
  if (roas >= 3) return "text-amber-600";
  return "text-red-600";
}

/* ---------- Aggregate Metric Box ---------- */

function AggregateBox({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div
      className={`rounded-lg border-2 p-4 text-center ${className ?? ""}`}
      style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLOR }}>{value}</p>
    </div>
  );
}

/* ---------- Email Progress Bar ---------- */

function EmailRateBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100">
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: BRAND_COLOR }}
        />
      </div>
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
  const totalFatigued = metaFatigue.fatigued + googleFatigue.fatigued;
  const totalWatch = metaFatigue.watch + googleFatigue.watch;

  /* --- Meta Ads --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const metaCplChartData = useMemo(() =>
    [...META_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => {
        const status = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
        return {
          name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign,
          cpl: c.cpl,
          fullName: c.campaign,
          barColor: status.barColor,
        };
      }),
  []);

  const metaTotalAttributed = META_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);
  const metaTotalSpend = META_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const metaExpectedRoas = metaTotalSpend > 0 ? (metaExpectedRevenue / metaTotalSpend).toFixed(1) : "0";
  const metaExpectedRoasNum = parseFloat(metaExpectedRoas);

  /* --- Google Ads --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const googleCplChartData = useMemo(() =>
    [...GOOGLE_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => {
        const status = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
        return {
          name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign,
          cpl: c.cpl,
          fullName: c.campaign,
          barColor: status.barColor,
        };
      }),
  []);

  const googleTotalAttributed = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalAttributed * 1.15);
  const googleTotalSpend = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const googleExpectedRoas = googleTotalSpend > 0 ? (googleExpectedRevenue / googleTotalSpend).toFixed(1) : "0";
  const googleExpectedRoasNum = parseFloat(googleExpectedRoas);

  /* --- Email data --- */
  const emailCampaignRevenue = 3420;
  const emailFlowRevenue = 1890;
  const emailTotalRevenue = emailCampaignRevenue + emailFlowRevenue;
  const campaignPct = Math.round((emailCampaignRevenue / emailTotalRevenue) * 100);
  const flowPct = 100 - campaignPct;

  return (
    <>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Aesthetics Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          {formatDateRangeLabel(dateFrom, dateTo)} · Carisma Aesthetics — consult-driven performance
        </p>
      </div>

      {/* Ad Fatigue Alert Banner */}
      {(totalFatigued > 0 || totalWatch > 0) && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-red-700">
            Creative Fatigue Alert: {totalFatigued + totalWatch} campaigns need attention
          </span>
        </div>
      )}

      {/* Section 1: Hero KPIs with YoY */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {HERO_KPIS.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">LY: {kpi.lastYear}</p>
            <p className={`text-xs font-semibold mt-0.5 ${kpi.yoyPositive ? "text-green-600" : "text-red-600"}`}>
              {kpi.yoy} YoY
            </p>
          </Card>
        ))}
      </div>

      {/* Consultation Funnel KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Leads</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">62</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Consultations</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">17</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">13</p>
        </Card>
      </div>

      {/* Section 2: Meta Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Meta Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Meta ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>3.8x</p>
          </div>
        </div>

        {/* Fatigue summary counts */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />{metaFatigue.healthy} Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{metaFatigue.watch} Watch</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{metaFatigue.fatigued} Fatigued</span>
        </div>

        {/* CPL by Campaign - Horizontal Bar with fatigue coloring */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <div className="h-[160px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metaCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {metaCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.barColor} />
                  ))}
                  <LabelList dataKey="cpl" position="right" formatter={(v) => `€${Number(v).toFixed(2)}`} style={{ fontSize: 11, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={metaColumns} data={META_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Channel Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Meta" value={formatCurrency(metaExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(metaTotalSpend)} />
          <div
            className="rounded-lg border-2 p-4 text-center"
            style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}
          >
            <p className="text-sm text-gray-600">Expected ROAS</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 ${roasColor(metaExpectedRoasNum)}`}>{metaExpectedRoas}x</p>
          </div>
        </div>
      </Card>

      {/* Section 3: Google Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>6.2x</p>
          </div>
        </div>

        {/* Fatigue summary counts */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />{googleFatigue.healthy} Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{googleFatigue.watch} Watch</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{googleFatigue.fatigued} Fatigued</span>
        </div>

        {/* CPL by Campaign - Horizontal Bar with fatigue coloring */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <div className="h-[150px] md:h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={googleCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {googleCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.barColor} />
                  ))}
                  <LabelList dataKey="cpl" position="right" formatter={(v) => `€${Number(v).toFixed(2)}`} style={{ fontSize: 11, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Channel Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Google" value={formatCurrency(googleExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(googleTotalSpend)} />
          <div
            className="rounded-lg border-2 p-4 text-center"
            style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}
          >
            <p className="text-sm text-gray-600">Expected ROAS</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 ${roasColor(googleExpectedRoasNum)}`}>{googleExpectedRoas}x</p>
          </div>
        </div>
      </Card>

      {/* Section 4: Email Marketing */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>

        {/* Top: Campaign Revenue + Flow Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="p-3 md:p-5 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(emailCampaignRevenue)}</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="h-2 w-8 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
              {campaignPct}% of total
            </div>
          </Card>
          <Card className="p-3 md:p-5 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flow Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(emailFlowRevenue)}</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="h-2 w-8 rounded-full" style={{ backgroundColor: `${BRAND_COLOR}80` }} />
              {flowPct}% of total
            </div>
          </Card>
        </div>

        {/* Middle: Key Rates as Progress Bars */}
        <div className="space-y-4 mb-6">
          <EmailRateBar label="Open Rate" value={35.2} max={100} />
          <EmailRateBar label="Click Rate" value={3.8} max={10} />
          <EmailRateBar label="Unsubscribe Rate" value={0.4} max={2} />
        </div>

        {/* Bottom: Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email ROAS</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">38x</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Subscribers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">2,814</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pop-up Capture Rate</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">4.1%</p>
          </Card>
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
