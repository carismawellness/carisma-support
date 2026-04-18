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

function getRoasColor(roas: number): string {
  if (roas >= 5) return "#22C55E";
  if (roas >= 3) return "#F59E0B";
  return "#EF4444";
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
      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">LY: {lastYear}</p>
      <p className={`text-xs font-semibold mt-0.5 ${positive ? "text-green-600" : "text-red-600"}`}>
        {yoyLabel} YoY
      </p>
    </Card>
  );
}

/* ---------- Aggregate Metric Box ---------- */

function AggregateBox({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div
      className="rounded-lg border-2 p-4 text-center"
      style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl md:text-2xl font-bold mt-1" style={{ color: valueColor ?? BRAND_COLOR }}>{value}</p>
    </div>
  );
}

/* ---------- Email Progress Bar ---------- */

function EmailRateBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
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
  const totalFatigued = metaFatigue.fatigued + googleFatigue.fatigued;
  const anyFatigued = totalFatigued > 0;

  /* --- Meta Ads --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name", render: (v: unknown) => (
      <button className="text-left font-medium underline decoration-dotted underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: BRAND_COLOR }}>{v as string}</button>
    ) },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "costPerShow", label: "Cost/Show", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => {
      const spend = row.totalSpend as number;
      const leads = row.totalLeads as number;
      return `€${(spend / (leads * 0.65)).toFixed(2)}`;
    } },
    { key: "costPerResult", label: "Cost/Result", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => {
      const spend = row.totalSpend as number;
      const leads = row.totalLeads as number;
      return `€${(spend / (leads * 0.65 * 0.55)).toFixed(2)}`;
    } },
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
        const color = status.label === "Fatigued" ? "#EF4444" : status.label === "Watch" ? "#F59E0B" : "#22C55E";
        return { name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign, cpl: c.cpl, color };
      }),
  []);

  const metaTotalAttributed = META_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);
  const metaTotalSpend = META_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const metaExpectedRoasNum = metaTotalSpend > 0 ? metaExpectedRevenue / metaTotalSpend : 0;
  const metaExpectedRoas = metaExpectedRoasNum.toFixed(1);

  /* --- Google Ads --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name", render: (v: unknown) => (
      <button className="text-left font-medium underline decoration-dotted underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: BRAND_COLOR }}>{v as string}</button>
    ) },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "costPerShow", label: "Cost/Show", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => {
      const spend = row.totalSpend as number;
      const leads = row.totalLeads as number;
      return `€${(spend / (leads * 0.65)).toFixed(2)}`;
    } },
    { key: "costPerResult", label: "Cost/Result", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => {
      const spend = row.totalSpend as number;
      const leads = row.totalLeads as number;
      return `€${(spend / (leads * 0.65 * 0.55)).toFixed(2)}`;
    } },
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
        const color = status.label === "Fatigued" ? "#EF4444" : status.label === "Watch" ? "#F59E0B" : "#22C55E";
        return { name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign, cpl: c.cpl, color };
      }),
  []);

  const googleTotalAttributed = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalAttributed * 1.15);
  const googleTotalSpend = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const googleExpectedRoasNum = googleTotalSpend > 0 ? googleExpectedRevenue / googleTotalSpend : 0;
  const googleExpectedRoas = googleExpectedRoasNum.toFixed(1);

  /* --- Profitability Matrix --- */
  const profitabilityData = useMemo(() => {
    const allCampaigns = [
      ...META_CAMPAIGNS.map((c) => ({ ...c, channel: "Meta" as const })),
      ...GOOGLE_CAMPAIGNS.map((c) => ({ ...c, channel: "Google" as const })),
    ];
    return allCampaigns
      .map((c) => {
        const costPerShow = c.totalSpend / (c.totalLeads * 0.65);
        const costPerResult = c.totalSpend / (c.totalLeads * 0.65 * 0.55);
        const netExpectedRevenue = Math.round(c.attributedRevenue * 1.15);
        const roas = c.totalSpend > 0 ? c.attributedRevenue / c.totalSpend : 0;
        const profit = c.attributedRevenue - c.totalSpend;
        const profitabilityPct = c.totalSpend > 0 ? ((c.attributedRevenue - c.totalSpend) / c.totalSpend) * 100 : 0;
        const recommendation = roas >= 5 ? "Scale" : roas >= 3 ? "Maintain" : roas >= 2 ? "Optimize" : "Pause";
        return {
          campaign: c.campaign,
          channel: c.channel,
          totalLeads: c.totalLeads,
          totalSpend: c.totalSpend,
          cpl: c.cpl,
          costPerShow,
          costPerResult,
          attributedRevenue: c.attributedRevenue,
          netExpectedRevenue,
          roas,
          profit,
          profitabilityPct,
          recommendation,
        };
      })
      .sort((a, b) => b.profitabilityPct - a.profitabilityPct);
  }, []);

  const profitabilityTotals = useMemo(() => {
    const totalLeads = profitabilityData.reduce((s, c) => s + c.totalLeads, 0);
    const totalSpend = profitabilityData.reduce((s, c) => s + c.totalSpend, 0);
    const totalRevenue = profitabilityData.reduce((s, c) => s + c.attributedRevenue, 0);
    const totalProfit = totalRevenue - totalSpend;
    const totalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const totalProfitPct = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;
    return { totalLeads, totalSpend, totalRevenue, totalProfit, totalRoas, totalProfitPct };
  }, [profitabilityData]);

  const profitabilityColumns = [
    { key: "campaign", label: "Campaign", render: (v: unknown) => (
      <button className="text-left font-medium underline decoration-dotted underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: BRAND_COLOR }}>{v as string}</button>
    ) },
    { key: "channel", label: "Channel", render: (v: unknown) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(v as string) === "Meta" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{v as string}</span>
    ) },
    { key: "totalLeads", label: "Leads", align: "right" as const, sortable: true },
    { key: "totalSpend", label: "Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "costPerShow", label: "Cost/Show", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "costPerResult", label: "Cost/Booking", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "attributedRevenue", label: "Revenue", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "netExpectedRevenue", label: "Net Exp. Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "roas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => {
      const val = v as number;
      return <span style={{ color: getRoasColor(val), fontWeight: 600 }}>{val.toFixed(1)}x</span>;
    } },
    { key: "profit", label: "Profit", align: "right" as const, sortable: true, render: (v: unknown) => {
      const val = v as number;
      return <span style={{ color: val >= 0 ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{formatCurrency(val)}</span>;
    } },
    { key: "profitabilityPct", label: "Profit %", align: "right" as const, sortable: true, render: (v: unknown) => {
      const val = v as number;
      return <span style={{ color: val >= 0 ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{val.toFixed(0)}%</span>;
    } },
    { key: "recommendation", label: "Action", align: "center" as const, render: (v: unknown) => {
      const rec = v as string;
      const styles: Record<string, string> = {
        Scale: "bg-green-50 text-green-700 border-green-200",
        Maintain: "bg-blue-50 text-blue-700 border-blue-200",
        Optimize: "bg-amber-50 text-amber-700 border-amber-200",
        Pause: "bg-red-50 text-red-700 border-red-200",
      };
      return <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${styles[rec] ?? ""}`}>{rec}</span>;
    } },
  ];

  /* --- Email data --- */
  const emailCampaignRev = 6840;
  const emailFlowRev = 3120;
  const emailTotalRev = emailCampaignRev + emailFlowRev;
  const campaignPct = Math.round((emailCampaignRev / emailTotalRev) * 100);
  const flowPct = 100 - campaignPct;

  return (
    <>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Spa Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          {formatDateRangeLabel(dateFrom, dateTo)} · All marketing channels for Carisma Spa &amp; Wellness
        </p>
      </div>

      {/* Ad Fatigue Alert Banner */}
      {anyFatigued && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center justify-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-semibold text-red-700">Creative Fatigue Alert: {totalFatigued} campaign{totalFatigued !== 1 ? "s" : ""} need attention</span>
        </div>
      )}

      {/* Section 1: Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <HeroKPICard label="Revenue" value={formatCurrency(9847)} lastYear={formatCurrency(8620)} yoyLabel="+14.2%" positive />
        <HeroKPICard label="Wix Revenue" value={formatCurrency(1240)} lastYear={formatCurrency(1080)} yoyLabel="+14.8%" positive />
        <HeroKPICard label="Total Marketing Spend" value={formatCurrency(655)} lastYear={formatCurrency(601)} yoyLabel="+8.5%" positive={false} />
        <HeroKPICard label="Meta Blended CPL" value="€7.80" lastYear="€8.40" yoyLabel="-7.1%" positive />
        <HeroKPICard label="Google Blended CPC" value="€1.85" lastYear="€2.10" yoyLabel="-11.9%" positive />
        <HeroKPICard label="Rebooking Rate" value="44%" lastYear="40%" yoyLabel="+10.0%" positive />
      </div>

      {/* Section 2: Meta Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Meta Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Meta ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>4.1x</p>
          </div>
        </div>

        {/* Fatigue Summary + CPL Chart */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">CPL by Campaign (Best to Worst)</h3>
            <span className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">{metaFatigue.healthy} Healthy</span>
              {" | "}
              <span className="text-amber-600 font-medium">{metaFatigue.watch} Watch</span>
              {" | "}
              <span className="text-red-600 font-medium">{metaFatigue.fatigued} Fatigued</span>
            </span>
          </div>
          <div className="h-[160px] md:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metaCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {metaCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList dataKey="cpl" position="right" formatter={(v) => `€${Number(v).toFixed(2)}`} style={{ fontSize: 11, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={metaColumns} data={META_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Meta Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Meta" value={formatCurrency(metaExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(metaTotalSpend)} />
          <AggregateBox label="Expected ROAS" value={`${metaExpectedRoas}x`} valueColor={getRoasColor(metaExpectedRoasNum)} />
        </div>
      </Card>

      {/* Section 3: Google Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>7.4x</p>
          </div>
        </div>

        {/* Fatigue Summary + CPL Chart */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-700">CPL by Campaign (Best to Worst)</h3>
            <span className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">{googleFatigue.healthy} Healthy</span>
              {" | "}
              <span className="text-amber-600 font-medium">{googleFatigue.watch} Watch</span>
              {" | "}
              <span className="text-red-600 font-medium">{googleFatigue.fatigued} Fatigued</span>
            </span>
          </div>
          <div className="h-[150px] md:h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={googleCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {googleCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList dataKey="cpl" position="right" formatter={(v) => `€${Number(v).toFixed(2)}`} style={{ fontSize: 11, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Google Aggregate Metrics */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Google" value={formatCurrency(googleExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(googleTotalSpend)} />
          <AggregateBox label="Expected ROAS" value={`${googleExpectedRoas}x`} valueColor={getRoasColor(googleExpectedRoasNum)} />
        </div>
      </Card>

      {/* Section 4: Email Marketing */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>

        {/* Top row: Campaign Revenue vs Flow Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-3 md:p-5 border-2" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(emailCampaignRev)}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${campaignPct}%`, backgroundColor: BRAND_COLOR }} />
              </div>
              <span className="text-xs font-medium text-gray-500">{campaignPct}% of total</span>
            </div>
          </Card>
          <Card className="p-3 md:p-5 border-2" style={{ borderColor: "#8B7A4A" }}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flow Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(emailFlowRev)}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${flowPct}%`, backgroundColor: "#8B7A4A" }} />
              </div>
              <span className="text-xs font-medium text-gray-500">{flowPct}% of total</span>
            </div>
          </Card>
        </div>

        {/* Middle row: Key rates as progress bars */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <EmailRateBar label="Open Rate" value={38.4} max={60} color="#22C55E" />
          <EmailRateBar label="Click Rate" value={4.2} max={10} color={BRAND_COLOR} />
          <EmailRateBar label="Unsubscribe Rate" value={0.3} max={2} color="#EF4444" />
        </div>

        {/* Bottom row: Accent cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 border border-green-200">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Email ROAS</p>
            <p className="text-xl md:text-2xl font-bold text-green-700 mt-1">42x</p>
          </Card>
          <Card className="p-4" style={{ backgroundColor: `${BRAND_COLOR}15`, borderColor: BRAND_COLOR, borderWidth: 1 }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: BRAND_COLOR }}>Total Subscribers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">4,527</p>
          </Card>
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Pop-up Capture Rate</p>
            <p className="text-xl md:text-2xl font-bold text-blue-700 mt-1">3.2%</p>
          </Card>
        </div>
      </Card>

      {/* Section 5: Profitability Matrix */}
      <Card className="p-3 md:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profitability Matrix</h2>
          <p className="text-sm text-gray-500 mt-0.5">Cross-channel campaign profitability analysis with budget scaling recommendations</p>
        </div>

        <DataTable columns={profitabilityColumns} data={profitabilityData as unknown as Record<string, unknown>[]} />

        {/* Summary Row */}
        <div className="mt-4 rounded-lg border-2 p-4" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}08` }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Total Campaigns</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{profitabilityData.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Total Leads</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{profitabilityTotals.totalLeads}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Total Spend</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(profitabilityTotals.totalSpend)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(profitabilityTotals.totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Blended ROAS</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: getRoasColor(profitabilityTotals.totalRoas) }}>{profitabilityTotals.totalRoas.toFixed(1)}x</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium uppercase">Total Profit</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: profitabilityTotals.totalProfit >= 0 ? "#22C55E" : "#EF4444" }}>{formatCurrency(profitabilityTotals.totalProfit)}</p>
            </div>
          </div>
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
