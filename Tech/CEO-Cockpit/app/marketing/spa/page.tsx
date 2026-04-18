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

const BRAND_COLOR = "#B79E61";

/* ---------- mock data ---------- */

const META_CAMPAIGNS = [
  { campaign: "Spa Packages - Lookalike", cpl: 9.20, dailyBudget: 25, totalSpend: 680, totalLeads: 74, ctr: 2.8, cpm: 14.50, frequency: 1.9, attributedRevenue: 3420, peakCtr: 3.0 },
  { campaign: "Couples Massage - Interest", cpl: 11.50, dailyBudget: 20, totalSpend: 540, totalLeads: 47, ctr: 2.1, cpm: 16.20, frequency: 2.3, attributedRevenue: 2180, peakCtr: 2.6 },
  { campaign: "Hotel Guest Welcome - Retarget", cpl: 6.80, dailyBudget: 15, totalSpend: 420, totalLeads: 62, ctr: 4.2, cpm: 9.80, frequency: 3.1, attributedRevenue: 2840, peakCtr: 5.8 },
  { campaign: "Deep Tissue - Broad", cpl: 13.40, dailyBudget: 18, totalSpend: 490, totalLeads: 37, ctr: 1.6, cpm: 18.40, frequency: 2.0, attributedRevenue: 1560, peakCtr: 1.8 },
  { campaign: "Prenatal Spa - Interest", cpl: 10.90, dailyBudget: 12, totalSpend: 340, totalLeads: 31, ctr: 2.4, cpm: 12.60, frequency: 1.7, attributedRevenue: 1420, peakCtr: 2.6 },
  { campaign: "Spring Refresh - Seasonal", cpl: 8.60, dailyBudget: 10, totalSpend: 290, totalLeads: 34, ctr: 3.1, cpm: 11.20, frequency: 1.5, attributedRevenue: 1680, peakCtr: 3.2 },
];

const GOOGLE_CAMPAIGNS = [
  { campaign: "Spa Malta - Brand", cpl: 5.40, dailyBudget: 15, totalLeads: 48, totalSpend: 259, ctr: 8.2, cpm: 9.40, frequency: 1.4, attributedRevenue: 2940, peakCtr: 9.0 },
  { campaign: "Couples Massage Malta", cpl: 7.80, dailyBudget: 12, totalLeads: 31, totalSpend: 242, ctr: 5.6, cpm: 11.80, frequency: 1.8, attributedRevenue: 1820, peakCtr: 6.2 },
  { campaign: "Hotel Spa Near Me", cpl: 6.20, dailyBudget: 10, totalLeads: 38, totalSpend: 236, ctr: 6.4, cpm: 10.20, frequency: 1.6, attributedRevenue: 2380, peakCtr: 7.1 },
  { campaign: "Spa Packages Malta", cpl: 8.90, dailyBudget: 8, totalLeads: 22, totalSpend: 196, ctr: 4.8, cpm: 13.60, frequency: 2.1, attributedRevenue: 1260, peakCtr: 5.4 },
  { campaign: "Relaxation Massage Valletta", cpl: 9.60, dailyBudget: 6, totalLeads: 16, totalSpend: 154, ctr: 4.1, cpm: 14.80, frequency: 2.4, attributedRevenue: 840, peakCtr: 5.0 },
];

/* ---------- helpers ---------- */

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700" };
}

function getFatigueSummary(campaigns: { frequency: number; ctr: number; peakCtr: number }[]) {
  let healthy = 0, watch = 0, fatigued = 0;
  campaigns.forEach((c) => {
    const s = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
    if (s.label === "Healthy") healthy++;
    else if (s.label === "Watch") watch++;
    else fatigued++;
  });
  return { healthy, watch, fatigued };
}

/* ---------- Hero KPI Card ---------- */

function HeroKPICard({
  label,
  value,
  lastYear,
  yoyLabel,
  positive,
}: {
  label: string;
  value: string;
  lastYear: string;
  yoyLabel: string;
  positive: boolean;
}) {
  return (
    <Card className="p-4 relative">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">LY: {lastYear}</p>
      <p className={`text-xs font-semibold mt-0.5 ${positive ? "text-green-600" : "text-red-600"}`}>
        {yoyLabel} YoY
      </p>
    </Card>
  );
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

function SpaMarketingContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* --- Fatigue checks --- */
  const metaFatigue = useMemo(() => getFatigueSummary(META_CAMPAIGNS), []);
  const googleFatigue = useMemo(() => getFatigueSummary(GOOGLE_CAMPAIGNS), []);
  const anyFatigued = metaFatigue.fatigued > 0 || googleFatigue.fatigued > 0;

  /* --- Section 4: Meta Ads --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Revenue", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
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

  /* --- Section 5: Google Ads --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `\u20AC${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Revenue", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
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

  /* --- Email aggregate --- */
  const emailCampaignRev = 6840;
  const emailFlowRev = 3120;
  const emailExpectedRevenue = Math.round((emailCampaignRev + emailFlowRev) * 1.15);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spa Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Weekly performance across all marketing channels for Carisma Spa &amp; Wellness
        </p>
      </div>

      {/* Section 1: Hero KPIs */}
      <div className="relative">
        {anyFatigued && (
          <span className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            Ad Fatigue Alert
          </span>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <HeroKPICard label="Revenue" value={formatCurrency(9847)} lastYear={formatCurrency(8620)} yoyLabel="+14.2%" positive />
          <HeroKPICard label="Wix Revenue" value={formatCurrency(1240)} lastYear={formatCurrency(1080)} yoyLabel="+14.8%" positive />
          <HeroKPICard label="Total Marketing Spend" value={formatCurrency(655)} lastYear={formatCurrency(601)} yoyLabel="+8.5%" positive={false} />
          <HeroKPICard label="Meta Blended CPL" value="\u20AC7.80" lastYear="\u20AC8.40" yoyLabel="-7.1%" positive />
          <HeroKPICard label="Google Blended CPC" value="\u20AC1.85" lastYear="\u20AC2.10" yoyLabel="-11.9%" positive />
          <HeroKPICard label="Rebooking Rate" value="44%" lastYear="40%" yoyLabel="+10.0%" positive />
        </div>
      </div>

      {/* Section 2: Meta Ads */}
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
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <span className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">{metaFatigue.healthy} Healthy</span>
              {" | "}
              <span className="text-amber-600 font-medium">{metaFatigue.watch} Watch</span>
              {" | "}
              <span className="text-red-600 font-medium">{metaFatigue.fatigued} Fatigued</span>
            </span>
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

        {/* Meta Aggregate Metrics */}
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
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>7.4x</p>
          </div>
        </div>

        {/* Creative Fatigue Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">Creative Fatigue</h3>
            <span className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">{googleFatigue.healthy} Healthy</span>
              {" | "}
              <span className="text-amber-600 font-medium">{googleFatigue.watch} Watch</span>
              {" | "}
              <span className="text-red-600 font-medium">{googleFatigue.fatigued} Fatigued</span>
            </span>
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

        {/* Google Aggregate Metrics */}
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
          {[
            { label: "Email ROAS", value: "42x" },
            { label: "Total Subscribers", value: "4,527" },
            { label: "Pop-up Capture Rate", value: "3.2%" },
            { label: "Open Rate", value: "38.4%" },
            { label: "Click Rate", value: "4.2%" },
            { label: "Unsubscribe Rate", value: "0.3%" },
            { label: "Campaign Revenue", value: formatCurrency(emailCampaignRev) },
            { label: "Flow Revenue", value: formatCurrency(emailFlowRev) },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Email Aggregate Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Email" value={formatCurrency(emailExpectedRevenue)} />
          <AggregateBox label="Expected Subscribers (next month)" value="4,890" />
          <AggregateBox label="Expected ROAS" value="42x" />
        </div>
      </Card>

      {/* Section 5: CIChat */}
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
