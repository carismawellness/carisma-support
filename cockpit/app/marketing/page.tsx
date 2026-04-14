"use client";

import { useMemo } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  ComposedChart,
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ---------- types ---------- */

interface GrowthRow {
  week_start: string;
  brand_id: number;
  marketing_spend_google: number;
  marketing_spend_meta: number;
  marketing_spend_influencer: number;
  marketing_spend_email: number;
  marketing_spend_content: number;
  roas_google: number;
  roas_meta: number;
  roas_overall: number;
  cpl: number;
  cpl_google: number;
  cpl_meta: number;
  cac: number;
  cpa: number;
  email_attributed_revenue: number;
  active_email_subscribers: number;
  web_to_lead_pct: number;
  lead_to_consult_pct: number;
  consult_to_booking_pct: number;
  lead_to_booking_pct: number;
  total_leads: number;
  google_leads: number;
  meta_leads: number;
  maltese_web_traffic: number;
}

interface MarketingRow {
  date: string;
  brand_id: number;
  platform: string;
  spend: number;
  leads: number;
  cpl: number;
  roas: number;
  impressions: number;
  clicks: number;
}

interface SalesRow {
  week_start: string;
  brand_id: number;
  revenue_ex_vat: number;
}

interface GA4Row {
  date: string;
  brand_id: number;
  sessions: number;
  new_users: number;
  bounce_rate_pct: number;
}

interface GSCRow {
  date: string;
  brand_id: number;
  clicks: number;
  impressions: number;
  avg_position: number;
}

/* ---------- helpers ---------- */

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

function avg(arr: number[]): number {
  const valid = arr.filter((v) => v != null && !isNaN(Number(v)));
  return valid.length ? sum(valid) / valid.length : 0;
}

const BRAND_NAMES: Record<number, string> = { 1: "Spa", 2: "Aesthetics", 3: "Slimming" };
const CPL_TARGETS: Record<number, number> = { 1: 8, 2: 12, 3: 10 };

/* ---------- page ---------- */

function MarketingContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* --- data hooks --- */
  const { data: growthData, loading: growthLoading } = useKPIData<GrowthRow>({
    table: "growth_weekly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: marketingData, loading: mktLoading } = useKPIData<MarketingRow>({
    table: "marketing_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: salesData } = useKPIData<SalesRow>({
    table: "sales_weekly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: ga4Data, loading: ga4Loading } = useKPIData<GA4Row>({
    table: "ga4_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: gscData, loading: gscLoading } = useKPIData<GSCRow>({
    table: "gsc_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const hasGrowth = growthData.length > 0;
  const loading = growthLoading || mktLoading;

  /* --- KPI computations --- */
  const kpis = useMemo<KPIData[]>(() => {
    const totalSpend = hasGrowth
      ? sum(
          growthData.map(
            (r) =>
              Number(r.marketing_spend_google) +
              Number(r.marketing_spend_meta) +
              Number(r.marketing_spend_influencer) +
              Number(r.marketing_spend_email) +
              Number(r.marketing_spend_content)
          )
        )
      : sum(marketingData.map((r) => Number(r.spend)));

    const totalLeads = hasGrowth
      ? sum(growthData.map((r) => Number(r.total_leads)))
      : sum(marketingData.map((r) => Number(r.leads)));

    const blendedCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;

    const blendedROAS = hasGrowth
      ? avg(growthData.map((r) => Number(r.roas_overall)))
      : (() => {
          const totalRev = sum(marketingData.map((r) => Number(r.roas) * Number(r.spend)));
          return totalSpend > 0 ? totalRev / totalSpend : 0;
        })();

    const totalRevenue = sum(salesData.map((r) => Number(r.revenue_ex_vat)));
    const mer = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    const emailRev = hasGrowth
      ? sum(growthData.map((r) => Number(r.email_attributed_revenue)))
      : 0;
    const emailPct = totalRevenue > 0 ? (emailRev / totalRevenue) * 100 : 0;

    return [
      { label: "Total Spend", value: formatCurrency(totalSpend) },
      { label: "Blended ROAS", value: `${blendedROAS.toFixed(1)}x`, target: "5.0x", targetValue: 5, currentValue: blendedROAS },
      { label: "Blended CPL", value: formatCurrency(blendedCPL) },
      { label: "MER", value: `${mer.toFixed(1)}x`, target: ">8x", targetValue: 8, currentValue: mer },
      {
        label: "Email Revenue %",
        value: hasGrowth ? formatPercent(emailPct) : "N/A",
        ...(hasGrowth ? { target: "35%", targetValue: 35, currentValue: emailPct } : {}),
      },
    ];
  }, [growthData, marketingData, salesData, hasGrowth]);

  /* --- Section 1: Spend & ROAS by Channel (weekly) --- */
  const spendRoasChart = useMemo(() => {
    if (hasGrowth) {
      const byWeek = new Map<string, GrowthRow[]>();
      for (const r of growthData) {
        const w = r.week_start;
        if (!byWeek.has(w)) byWeek.set(w, []);
        byWeek.get(w)!.push(r);
      }
      return Array.from(byWeek.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, rows]) => ({
          week,
          Google: sum(rows.map((r) => Number(r.marketing_spend_google))),
          Meta: sum(rows.map((r) => Number(r.marketing_spend_meta))),
          Influencer: sum(rows.map((r) => Number(r.marketing_spend_influencer))),
          Email: sum(rows.map((r) => Number(r.marketing_spend_email))),
          "ROAS Google": avg(rows.map((r) => Number(r.roas_google))),
          "ROAS Meta": avg(rows.map((r) => Number(r.roas_meta))),
          "ROAS Overall": avg(rows.map((r) => Number(r.roas_overall))),
        }));
    }
    // fallback: marketing_daily grouped by week/platform
    const byWeek = new Map<string, MarketingRow[]>();
    for (const r of marketingData) {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay() + 1);
      const key = weekStart.toISOString().slice(0, 10);
      if (!byWeek.has(key)) byWeek.set(key, []);
      byWeek.get(key)!.push(r);
    }
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, rows]) => {
        const google = rows.filter((r) => r.platform?.toLowerCase().includes("google"));
        const meta = rows.filter((r) => r.platform?.toLowerCase().includes("meta") || r.platform?.toLowerCase().includes("facebook"));
        const totalSpend = sum(rows.map((r) => Number(r.spend)));
        const totalRev = sum(rows.map((r) => Number(r.roas) * Number(r.spend)));
        return {
          week,
          Google: sum(google.map((r) => Number(r.spend))),
          Meta: sum(meta.map((r) => Number(r.spend))),
          Influencer: 0,
          Email: 0,
          "ROAS Google": (() => {
            const gs = sum(google.map((r) => Number(r.spend)));
            const gr = sum(google.map((r) => Number(r.roas) * Number(r.spend)));
            return gs > 0 ? gr / gs : 0;
          })(),
          "ROAS Meta": (() => {
            const ms = sum(meta.map((r) => Number(r.spend)));
            const mr = sum(meta.map((r) => Number(r.roas) * Number(r.spend)));
            return ms > 0 ? mr / ms : 0;
          })(),
          "ROAS Overall": totalSpend > 0 ? totalRev / totalSpend : 0,
        };
      });
  }, [growthData, marketingData, hasGrowth]);

  /* --- Section 2: CPL & CAC by Brand --- */
  const cplCacByBrand = useMemo(() => {
    if (hasGrowth) {
      const brands = [1, 2, 3];
      return brands.map((bid) => {
        const rows = growthData.filter((r) => r.brand_id === bid);
        return {
          brand: BRAND_NAMES[bid],
          CPL: avg(rows.map((r) => Number(r.cpl))),
          CAC: avg(rows.map((r) => Number(r.cac))),
          target: CPL_TARGETS[bid],
        };
      });
    }
    // fallback
    const brands = [1, 2, 3];
    return brands.map((bid) => {
      const rows = marketingData.filter((r) => r.brand_id === bid);
      const totalSpend = sum(rows.map((r) => Number(r.spend)));
      const totalLeads = sum(rows.map((r) => Number(r.leads)));
      return {
        brand: BRAND_NAMES[bid],
        CPL: totalLeads > 0 ? totalSpend / totalLeads : 0,
        CAC: 0,
        target: CPL_TARGETS[bid],
      };
    });
  }, [growthData, marketingData, hasGrowth]);

  /* --- Section 3: Conversion Funnel (Aes/Slim) --- */
  const funnelData = useMemo(() => {
    if (!hasGrowth) return [];
    return [2, 3].map((bid) => {
      const rows = growthData.filter((r) => r.brand_id === bid);
      const traffic = sum(rows.map((r) => Number(r.maltese_web_traffic)));
      const leads = sum(rows.map((r) => Number(r.total_leads)));
      const webToLead = avg(rows.map((r) => Number(r.web_to_lead_pct)));
      const leadToConsult = avg(rows.map((r) => Number(r.lead_to_consult_pct)));
      const consultToBook = avg(rows.map((r) => Number(r.consult_to_booking_pct)));
      return {
        brand: BRAND_NAMES[bid],
        brandId: bid,
        stages: [
          { stage: "Web Traffic", value: traffic },
          { stage: "Leads", value: leads, rate: webToLead },
          { stage: "Consults", value: Math.round(leads * (leadToConsult / 100)), rate: leadToConsult },
          { stage: "Bookings", value: Math.round(leads * (leadToConsult / 100) * (consultToBook / 100)), rate: consultToBook },
        ],
      };
    });
  }, [growthData, hasGrowth]);

  /* --- Section 4: Email & Subscribers --- */
  const emailChart = useMemo(() => {
    if (!hasGrowth) return [];
    const byWeek = new Map<string, GrowthRow[]>();
    for (const r of growthData) {
      if (!byWeek.has(r.week_start)) byWeek.set(r.week_start, []);
      byWeek.get(r.week_start)!.push(r);
    }
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, rows]) => ({
        week,
        subscribers: sum(rows.map((r) => Number(r.active_email_subscribers))),
        revenue: sum(rows.map((r) => Number(r.email_attributed_revenue))),
      }));
  }, [growthData, hasGrowth]);

  /* --- Section 5: Campaign Table from marketing_daily --- */
  const campaignColumns = [
    { key: "platform", label: "Platform" },
    { key: "spend", label: "Spend", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "leads", label: "Leads", align: "right" as const, sortable: true },
    { key: "cpl", label: "CPL", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
    { key: "roas", label: "ROAS", align: "right" as const, sortable: true, render: (v: unknown) => `${(v as number).toFixed(1)}x` },
  ];

  const campaignRows = useMemo(() => {
    const byPlatform = new Map<string, MarketingRow[]>();
    for (const r of marketingData) {
      const p = r.platform || "Other";
      if (!byPlatform.has(p)) byPlatform.set(p, []);
      byPlatform.get(p)!.push(r);
    }
    return Array.from(byPlatform.entries()).map(([platform, rows]) => {
      const totalSpend = sum(rows.map((r) => Number(r.spend)));
      const totalLeads = sum(rows.map((r) => Number(r.leads)));
      const totalRev = sum(rows.map((r) => Number(r.roas) * Number(r.spend)));
      return {
        platform,
        spend: totalSpend,
        leads: totalLeads,
        cpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
        roas: totalSpend > 0 ? totalRev / totalSpend : 0,
      };
    });
  }, [marketingData]);

  /* --- Section 6: Organic Performance --- */
  const organicKpis = useMemo<KPIData[]>(() => {
    const sessions = sum(ga4Data.map((r) => Number(r.sessions)));
    const newUsers = sum(ga4Data.map((r) => Number(r.new_users)));
    const bounceRate = avg(ga4Data.map((r) => Number(r.bounce_rate_pct)));
    const gscClicks = sum(gscData.map((r) => Number(r.clicks)));
    const gscImpressions = sum(gscData.map((r) => Number(r.impressions)));
    const avgPos = avg(gscData.map((r) => Number(r.avg_position)));
    return [
      { label: "Sessions", value: sessions.toLocaleString() },
      { label: "New Users", value: newUsers.toLocaleString() },
      { label: "Bounce Rate", value: formatPercent(bounceRate) },
      { label: "GSC Clicks", value: gscClicks.toLocaleString() },
      { label: "GSC Impressions", value: gscImpressions.toLocaleString() },
      { label: "Avg Position", value: avgPos.toFixed(1) },
    ];
  }, [ga4Data, gscData]);

  const sessionsChart = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const r of ga4Data) {
      const d = r.date;
      byDate.set(d, (byDate.get(d) || 0) + Number(r.sessions));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sessions]) => ({ date, sessions }));
  }, [ga4Data]);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-gray-500">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>

      {/* KPI Row */}
      <KPICardRow kpis={kpis} />

      {/* Section 1: Spend & ROAS by Channel */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Spend &amp; ROAS by Channel
        </h2>
        {spendRoasChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={spendRoasChart} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis
                yAxisId="spend"
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <YAxis
                yAxisId="roas"
                orientation="right"
                tickFormatter={(v: number) => `${v}x`}
              />
              <Tooltip
                formatter={(value, name) => {
                  const v = Number(value);
                  const n = String(name);
                  return n.startsWith("ROAS") ? `${v.toFixed(1)}x` : formatCurrency(v);
                }}
              />
              <Legend />
              <Bar yAxisId="spend" dataKey="Google" stackId="spend" fill={chartColors.spa} />
              <Bar yAxisId="spend" dataKey="Meta" stackId="spend" fill={chartColors.aesthetics} />
              <Bar yAxisId="spend" dataKey="Influencer" stackId="spend" fill={chartColors.slimming} />
              <Bar yAxisId="spend" dataKey="Email" stackId="spend" fill="#8B5CF6" />
              <Line yAxisId="roas" type="monotone" dataKey="ROAS Google" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} strokeDasharray="5 5" dot={{ r: chartDefaults.dotRadius }} />
              <Line yAxisId="roas" type="monotone" dataKey="ROAS Meta" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} strokeDasharray="5 5" dot={{ r: chartDefaults.dotRadius }} />
              <Line yAxisId="roas" type="monotone" dataKey="ROAS Overall" stroke={chartColors.target} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500">No spend data available for this period.</p>
        )}
      </Card>

      {/* Section 2: CPL & CAC by Brand */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          CPL &amp; CAC by Brand
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cplCacByBrand} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brand" />
            <YAxis tickFormatter={(v: number) => `€${v}`} />
            <Tooltip formatter={(v) => `€${Number(v).toFixed(2)}`} />
            <Legend />
            <Bar dataKey="CPL" fill={chartColors.spa} />
            <Bar dataKey="CAC" fill={chartColors.aesthetics} />
            <Bar dataKey="target" name="CPL Target" fill={chartColors.budget} />
            <ReferenceLine y={8} stroke={chartColors.spa} strokeDasharray="3 3" label="Spa €8" />
            <ReferenceLine y={12} stroke={chartColors.aesthetics} strokeDasharray="3 3" label="Aes €12" />
            <ReferenceLine y={10} stroke={chartColors.slimming} strokeDasharray="3 3" label="Slim €10" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Conversion Funnel (Aes/Slim) */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conversion Funnel
          </h2>
          {funnelData.length > 0 ? (
            <div className="space-y-6">
              {funnelData.map((f) => (
                <div key={f.brandId}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {f.brand}
                  </h3>
                  <div className="space-y-2">
                    {f.stages.map((s) => {
                      const maxVal = f.stages[0].value || 1;
                      const widthPct = Math.max((s.value / maxVal) * 100, 8);
                      const color = f.brandId === 2 ? chartColors.aesthetics : chartColors.slimming;
                      return (
                        <div key={s.stage} className="flex items-center gap-3">
                          <span className="w-24 text-xs text-gray-600 text-right">
                            {s.stage}
                          </span>
                          <div className="flex-1 relative">
                            <div
                              className="h-7 rounded flex items-center px-2"
                              style={{ width: `${widthPct}%`, backgroundColor: color }}
                            >
                              <span className="text-xs text-white font-medium">
                                {s.value.toLocaleString()}
                                {s.rate != null ? ` (${s.rate.toFixed(1)}%)` : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Funnel data requires growth_weekly records for Aesthetics and Slimming.
            </p>
          )}
        </Card>

        {/* Section 4: Email & Subscribers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Email &amp; Subscribers
          </h2>
          {emailChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={emailChart} margin={chartDefaults.margin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis
                  yAxisId="subs"
                  tickFormatter={(v: number) => v.toLocaleString()}
                />
                <YAxis
                  yAxisId="rev"
                  orientation="right"
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="subs"
                  type="monotone"
                  dataKey="subscribers"
                  name="Active Subscribers"
                  stroke={chartColors.spa}
                  strokeWidth={chartDefaults.strokeWidth}
                  dot={{ r: chartDefaults.dotRadius }}
                />
                <Bar
                  yAxisId="rev"
                  dataKey="revenue"
                  name="Email Revenue"
                  fill={chartColors.aesthetics}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">
              Email data requires growth_weekly records.
            </p>
          )}
        </Card>
      </div>

      {/* Section 5: Campaign Performance Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Performance by Platform
        </h2>
        {campaignRows.length > 0 ? (
          <DataTable columns={campaignColumns} data={campaignRows} />
        ) : (
          <p className="text-sm text-gray-500">No campaign data for this period.</p>
        )}
      </Card>

      {/* Section 6: Organic Performance (GA4 + GSC) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Organic Performance
        </h2>
        {ga4Loading || gscLoading ? (
          <p className="text-sm text-gray-500">Loading organic data...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {organicKpis.map((k) => (
                <div key={k.label} className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {k.label}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{k.value}</p>
                </div>
              ))}
            </div>
            {sessionsChart.length > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sessionsChart} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke={chartColors.spa}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </Card>

      <CIChat />
    </>
  );
}

export default function MarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <MarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
