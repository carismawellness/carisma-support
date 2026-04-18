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

function getFatigueStatus(frequency: number, ctr: number, peakCtr: number): { label: string; color: string; bg: string; fill: string } {
  const ctrDrop = (peakCtr - ctr) / peakCtr;
  if (frequency > 3.0 && ctrDrop > 0.2) return { label: "Fatigued", color: "bg-red-500", bg: "bg-red-50 text-red-700", fill: "#ef4444" };
  if (frequency >= 2.0 && ctrDrop >= 0.1) return { label: "Watch", color: "bg-amber-500", bg: "bg-amber-50 text-amber-700", fill: "#f59e0b" };
  return { label: "Healthy", color: "bg-green-500", bg: "bg-green-50 text-green-700", fill: "#22c55e" };
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

function getRoasColor(roas: number): string {
  if (roas >= 5) return "#22c55e";
  if (roas >= 3) return "#f59e0b";
  return "#ef4444";
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

/* ---------- Progress Bar ---------- */

function ProgressMetric({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
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
  const totalHealthy = metaFatigue.healthy + googleFatigue.healthy;

  /* --- Hero KPIs --- */
  const heroCards = useMemo(() => [
    { label: "Revenue", value: "€1,480" },
    { label: "Wix Revenue", value: "€340" },
    { label: "Total Marketing Spend", value: "€525" },
    { label: "Meta Blended CPL", value: "€18.50" },
    { label: "Google Blended CPC", value: "€2.60" },
    { label: "Conversion / Leads", value: "40.7%" },
    { label: "Rebooking Rate", value: "52%" },
  ], []);

  /* --- Email Marketing --- */
  const emailCampaignRev = 1240;
  const emailFlowRev = 680;

  /* --- Meta Ads CPL chart data with fatigue status --- */
  const metaCplChartData = useMemo(() =>
    [...META_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => {
        const status = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
        return {
          name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign,
          cpl: c.cpl,
          fullName: c.campaign,
          fill: status.fill,
          cplLabel: `€${c.cpl.toFixed(2)}`,
        };
      }),
  []);

  /* --- Meta Ads columns --- */
  const metaColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "costPerShow", label: "CP Show", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => { const spend = row.totalSpend as number; const leads = row.totalLeads as number; return leads > 0 ? `€${(spend / (leads * 0.69)).toFixed(2)}` : "—"; } },
    { key: "costPerResult", label: "CP Result", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => { const spend = row.totalSpend as number; const leads = row.totalLeads as number; return leads > 0 ? `€${(spend / (leads * 0.69 * 0.59)).toFixed(2)}` : "—"; } },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const metaTotalAttributed = META_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);
  const metaTotalSpend = META_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const metaExpectedRoasNum = metaTotalSpend > 0 ? metaExpectedRevenue / metaTotalSpend : 0;
  const metaExpectedRoas = metaExpectedRoasNum.toFixed(1);

  /* --- Google Ads CPL chart data with fatigue status --- */
  const googleCplChartData = useMemo(() =>
    [...GOOGLE_CAMPAIGNS]
      .sort((a, b) => a.cpl - b.cpl)
      .map((c) => {
        const status = getFatigueStatus(c.frequency, c.ctr, c.peakCtr);
        return {
          name: c.campaign.length > 25 ? c.campaign.slice(0, 22) + "..." : c.campaign,
          cpl: c.cpl,
          fullName: c.campaign,
          fill: status.fill,
          cplLabel: `€${c.cpl.toFixed(2)}`,
        };
      }),
  []);

  /* --- Google Ads columns --- */
  const googleColumns = [
    { key: "campaign", label: "Campaign Name" },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "dailyBudget", label: "Daily Budget", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalSpend", label: "Total Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "totalLeads", label: "Total Leads", align: "right" as const, sortable: true },
    { key: "costPerShow", label: "CP Show", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => { const spend = row.totalSpend as number; const leads = row.totalLeads as number; return leads > 0 ? `€${(spend / (leads * 0.69)).toFixed(2)}` : "—"; } },
    { key: "costPerResult", label: "CP Result", align: "right" as const, sortable: true, render: (_v: unknown, row: Record<string, unknown>) => { const spend = row.totalSpend as number; const leads = row.totalLeads as number; return leads > 0 ? `€${(spend / (leads * 0.69 * 0.59)).toFixed(2)}` : "—"; } },
    { key: "ctr", label: "CTR", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}%` },
    { key: "cpm", label: "CPM", align: "right" as const, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "frequency", label: "Freq", align: "right" as const, render: (v: unknown) => (v as number).toFixed(1) },
    { key: "attributedRevenue", label: "Attributed Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  ];

  const googleTotalAttributed = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.attributedRevenue, 0);
  const googleExpectedRevenue = Math.round(googleTotalAttributed * 1.15);
  const googleTotalSpend = GOOGLE_CAMPAIGNS.reduce((s, c) => s + c.totalSpend, 0);
  const googleExpectedRoasNum = googleTotalSpend > 0 ? googleExpectedRevenue / googleTotalSpend : 0;
  const googleExpectedRoas = googleExpectedRoasNum.toFixed(1);

  /* --- Profitability Matrix --- */
  const profitabilityData = useMemo(() => {
    const metaRows = META_CAMPAIGNS.map((c) => {
      const roas = c.totalSpend > 0 ? c.attributedRevenue / c.totalSpend : 0;
      const profit = c.attributedRevenue - c.totalSpend;
      const costPerShow = c.totalLeads > 0 ? c.totalSpend / (c.totalLeads * 0.69) : 0;
      const costPerResult = c.totalLeads > 0 ? c.totalSpend / (c.totalLeads * 0.69 * 0.59) : 0;
      const netExpectedRevenue = Math.round(c.attributedRevenue * 1.15);
      const recommendation = roas >= 5 ? "Scale" : roas >= 3 ? "Maintain" : roas >= 2 ? "Optimize" : "Pause";
      return { campaign: c.campaign, channel: "Meta", totalLeads: c.totalLeads, totalSpend: c.totalSpend, cpl: c.cpl, costPerShow, costPerResult, attributedRevenue: c.attributedRevenue, netExpectedRevenue, roas, profit, recommendation };
    });
    const googleRows = GOOGLE_CAMPAIGNS.map((c) => {
      const roas = c.totalSpend > 0 ? c.attributedRevenue / c.totalSpend : 0;
      const profit = c.attributedRevenue - c.totalSpend;
      const costPerShow = c.totalLeads > 0 ? c.totalSpend / (c.totalLeads * 0.69) : 0;
      const costPerResult = c.totalLeads > 0 ? c.totalSpend / (c.totalLeads * 0.69 * 0.59) : 0;
      const netExpectedRevenue = Math.round(c.attributedRevenue * 1.15);
      const recommendation = roas >= 5 ? "Scale" : roas >= 3 ? "Maintain" : roas >= 2 ? "Optimize" : "Pause";
      return { campaign: c.campaign, channel: "Google", totalLeads: c.totalLeads, totalSpend: c.totalSpend, cpl: c.cpl, costPerShow, costPerResult, attributedRevenue: c.attributedRevenue, netExpectedRevenue, roas, profit, recommendation };
    });
    return [...metaRows, ...googleRows].sort((a, b) => b.profit - a.profit);
  }, []);

  const profitabilityTotals = useMemo(() => {
    const totalLeads = profitabilityData.reduce((s, r) => s + r.totalLeads, 0);
    const totalSpend = profitabilityData.reduce((s, r) => s + r.totalSpend, 0);
    const totalAttrRevenue = profitabilityData.reduce((s, r) => s + r.attributedRevenue, 0);
    const totalNetExpected = profitabilityData.reduce((s, r) => s + r.netExpectedRevenue, 0);
    const totalProfit = profitabilityData.reduce((s, r) => s + r.profit, 0);
    const blendedRoas = totalSpend > 0 ? totalAttrRevenue / totalSpend : 0;
    const blendedCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const blendedCpShow = totalLeads > 0 ? totalSpend / (totalLeads * 0.69) : 0;
    const blendedCpResult = totalLeads > 0 ? totalSpend / (totalLeads * 0.69 * 0.59) : 0;
    return { totalLeads, totalSpend, totalAttrRevenue, totalNetExpected, totalProfit, blendedRoas, blendedCpl, blendedCpShow, blendedCpResult };
  }, [profitabilityData]);

  const profitabilityColumns = [
    { key: "campaign", label: "Campaign", render: (v: unknown) => <span className="font-medium cursor-pointer hover:underline" style={{ color: BRAND_COLOR }}>{v as string}</span> },
    { key: "channel", label: "Channel", render: (v: unknown) => <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${(v as string) === "Meta" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{v as string}</span> },
    { key: "totalLeads", label: "Leads", align: "right" as const, sortable: true },
    { key: "totalSpend", label: "Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "costPerShow", label: "CP Show", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "costPerResult", label: "CP Result", align: "right" as const, sortable: true, render: (v: unknown) => `€${(v as number).toFixed(2)}` },
    { key: "attributedRevenue", label: "Attr. Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "netExpectedRevenue", label: "Net Exp. Rev", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "roas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => { const r = v as number; return <span style={{ color: getRoasColor(r), fontWeight: 600 }}>{r.toFixed(1)}x</span>; } },
    { key: "profit", label: "Profit", align: "right" as const, sortable: true, render: (v: unknown) => { const p = v as number; return <span style={{ color: p >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{formatCurrency(p)}</span>; } },
    { key: "recommendation", label: "Action", align: "center" as const, render: (v: unknown) => { const r = v as string; const styles: Record<string, string> = { Scale: "bg-green-100 text-green-800", Maintain: "bg-blue-100 text-blue-800", Optimize: "bg-amber-100 text-amber-800", Pause: "bg-red-100 text-red-800" }; return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${styles[r] ?? ""}`}>{r}</span>; } },
  ];

  return (
    <>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Slimming Marketing Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          {formatDateRangeLabel(dateFrom, dateTo)} · Carisma Slimming — course-based model, launched Feb 2026
        </p>
      </div>

      {/* Ad Fatigue Alert — Prominent Centered Banner */}
      {(totalFatigued > 0 || totalWatch > 0) && (
        <div className={`w-full rounded-xl border-2 px-6 py-4 text-center ${
          totalFatigued > 0
            ? "border-red-200 bg-red-50"
            : "border-amber-200 bg-amber-50"
        }`}>
          <div className="flex items-center justify-center gap-3">
            <span className={`h-3 w-3 rounded-full ${totalFatigued > 0 ? "bg-red-500" : "bg-amber-500"}`} />
            <span className={`text-lg font-bold ${totalFatigued > 0 ? "text-red-700" : "text-amber-700"}`}>
              Ad Fatigue Alert
            </span>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="font-semibold text-red-700">{totalFatigued} Fatigued</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-amber-700">{totalWatch} Watch</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-semibold text-green-700">{totalHealthy} Healthy</span>
            </span>
          </div>
        </div>
      )}

      {/* Section 1: Hero KPIs with "New Brand" badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {heroCards.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">LY: N/A</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              New Brand
            </span>
          </Card>
        ))}
      </div>

      {/* Consultation Funnel */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultation Funnel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Leads</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">18</p>
          </div>
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Consultations</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">10</p>
          </div>
          <div className="border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
            <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">6</p>
          </div>
        </div>
      </Card>

      {/* Section 2: Meta Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Meta Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Meta ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>2.4x</p>
          </div>
        </div>

        {/* Fatigue Summary Counts */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="text-sm font-medium text-gray-700">Creative Fatigue</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /><span className="text-green-600 font-medium">{metaFatigue.healthy} Healthy</span></span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /><span className="text-amber-600 font-medium">{metaFatigue.watch} Watch</span></span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-red-600 font-medium">{metaFatigue.fatigued} Fatigued</span></span>
        </div>

        {/* CPL by Campaign - Fatigue Color Coded + CPL Labels */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <div className="h-[150px] md:h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metaCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {metaCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="cplLabel" position="right" style={{ fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={metaColumns} data={META_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Meta Channel Aggregate */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Meta" value={formatCurrency(metaExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(metaTotalSpend)} />
          <AggregateBox
            label="Expected ROAS"
            value={`${metaExpectedRoas}x`}
            valueColor={getRoasColor(metaExpectedRoasNum)}
          />
        </div>
      </Card>

      {/* Section 3: Google Ads */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Google Ads</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">Google ROAS</p>
            <p className="text-xl font-bold" style={{ color: BRAND_COLOR }}>3.6x</p>
          </div>
        </div>

        {/* Fatigue Summary Counts */}
        <div className="flex items-center gap-3 text-xs mb-4">
          <span className="text-sm font-medium text-gray-700">Creative Fatigue</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /><span className="text-green-600 font-medium">{googleFatigue.healthy} Healthy</span></span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /><span className="text-amber-600 font-medium">{googleFatigue.watch} Watch</span></span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-red-600 font-medium">{googleFatigue.fatigued} Fatigued</span></span>
        </div>

        {/* CPL by Campaign - Fatigue Color Coded + CPL Labels */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">CPL by Campaign (Best to Worst)</h3>
          <div className="h-[140px] md:h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={googleCplChartData} layout="vertical" margin={{ top: 5, right: 50, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `€${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                <Bar dataKey="cpl" name="CPL" radius={[0, 4, 4, 0]}>
                  {googleCplChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="cplLabel" position="right" style={{ fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS as unknown as Record<string, unknown>[]} />

        {/* Google Channel Aggregate */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AggregateBox label="Expected Revenue in Google" value={formatCurrency(googleExpectedRevenue)} />
          <AggregateBox label="Expected Ad Spend" value={formatCurrency(googleTotalSpend)} />
          <AggregateBox
            label="Expected ROAS"
            value={`${googleExpectedRoas}x`}
            valueColor={getRoasColor(googleExpectedRoasNum)}
          />
        </div>
      </Card>

      {/* Section 4: Email Marketing — Redesigned */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Marketing</h2>

        {/* Top: Campaign Revenue + Flow Revenue big cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="p-3 md:p-5 text-center" style={{ borderColor: BRAND_COLOR, borderWidth: 2 }}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Revenue</p>
            <p className="text-3xl font-bold mt-2" style={{ color: BRAND_COLOR }}>€{emailCampaignRev.toLocaleString()}</p>
          </Card>
          <Card className="p-3 md:p-5 text-center" style={{ borderColor: BRAND_COLOR, borderWidth: 2 }}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Flow Revenue</p>
            <p className="text-3xl font-bold mt-2" style={{ color: BRAND_COLOR }}>€{emailFlowRev.toLocaleString()}</p>
          </Card>
        </div>

        {/* Middle: Progress bars for key rates */}
        <div className="space-y-4 mb-6">
          <ProgressMetric label="Open Rate" value={32.1} max={50} color={BRAND_COLOR} />
          <ProgressMetric label="Click Rate" value={3.4} max={10} color={BRAND_COLOR} />
          <ProgressMetric label="Unsubscribe Rate" value={0.5} max={2} color="#ef4444" />
        </div>

        {/* Bottom: Email ROAS, Subscribers, Pop-up */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email ROAS</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">28x</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subscribers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">812</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pop-up Capture</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">2.8%</p>
          </Card>
        </div>
      </Card>

      {/* Section 5: Profitability Matrix */}
      <Card className="p-3 md:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profitability Matrix</h2>
          <p className="text-sm text-gray-500 mt-0.5">Cross-channel campaign profitability with budget scaling recommendations</p>
        </div>

        <DataTable columns={profitabilityColumns} data={profitabilityData as unknown as Record<string, unknown>[]} />

        {/* Summary Totals */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Total Leads</p>
            <p className="text-lg font-bold text-gray-900">{profitabilityTotals.totalLeads}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Total Spend</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(profitabilityTotals.totalSpend)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Blended CPL</p>
            <p className="text-lg font-bold text-gray-900">€{profitabilityTotals.blendedCpl.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Blended ROAS</p>
            <p className="text-lg font-bold" style={{ color: getRoasColor(profitabilityTotals.blendedRoas) }}>{profitabilityTotals.blendedRoas.toFixed(1)}x</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Total Profit</p>
            <p className="text-lg font-bold" style={{ color: profitabilityTotals.totalProfit >= 0 ? "#16a34a" : "#dc2626" }}>{formatCurrency(profitabilityTotals.totalProfit)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Total Attr. Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(profitabilityTotals.totalAttrRevenue)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Net Expected Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(profitabilityTotals.totalNetExpected)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Blended CP Show</p>
            <p className="text-lg font-bold text-gray-900">€{profitabilityTotals.blendedCpShow.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
            <p className="text-xs text-gray-500">Blended CP Result</p>
            <p className="text-lg font-bold text-gray-900">€{profitabilityTotals.blendedCpResult.toFixed(2)}</p>
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
