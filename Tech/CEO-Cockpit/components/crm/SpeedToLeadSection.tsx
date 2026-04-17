"use client";

import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  chartDefaults,
  formatMinutes,
  formatPercent,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { format } from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CrmDailyRow {
  date: string;
  brand_id: number;
  speed_to_lead_median_min: number | null;
  speed_to_lead_mean_min: number | null;
  total_leads: number | null;
  leads_meta: number | null;
  conversion_rate_pct: number | null;
  appointments_booked: number | null;
  total_calls: number | null;
}

interface StlDistRow {
  date: string;
  brand_id: number;
  bucket: string;
  count: number;
  pct: number;
}

interface CrmByRepRow {
  date: string;
  brand_id: number;
  staff_id: number;
  leads_assigned: number | null;
  calls_made: number | null;
  speed_to_lead_avg_min: number | null;
  conversion_rate_pct: number | null;
  appointments_booked: number | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BUCKET_ORDER = ["<1min", "1-3min", "3-5min", "5-15min", "15-30min", "30min+"];
const BUCKET_COLORS = ["#16A34A", "#22C55E", "#86EFAC", "#FDE047", "#FB923C", "#DC2626"];
const STL_TARGET_MIN = 5;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stlColor(minutes: number): string {
  if (minutes <= 3) return "text-emerald-600";
  if (minutes <= 5) return "text-emerald-500";
  if (minutes <= 10) return "text-amber-500";
  if (minutes <= 15) return "text-orange-500";
  return "text-red-600";
}

function stlGrade(minutes: number): string {
  if (minutes <= 1) return "A+";
  if (minutes <= 3) return "A";
  if (minutes <= 5) return "B";
  if (minutes <= 10) return "C";
  if (minutes <= 15) return "D";
  return "F";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SpeedToLeadSection({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data: crmDaily, loading: crmLoading } = useKPIData<CrmDailyRow>({
    table: "crm_daily",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: stlDist, loading: distLoading } = useKPIData<StlDistRow>({
    table: "speed_to_lead_distribution",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: byRep, loading: repLoading } = useKPIData<CrmByRepRow>({
    table: "crm_by_rep",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const loading = crmLoading || distLoading || repLoading;

  // --- Compute KPIs ---
  const medianValues = crmDaily
    .map((r) => r.speed_to_lead_median_min)
    .filter((v): v is number => v !== null && v > 0);
  const meanValues = crmDaily
    .map((r) => r.speed_to_lead_mean_min)
    .filter((v): v is number => v !== null && v > 0);

  const overallMedian = median(medianValues);
  const overallMean = mean(meanValues);
  const underTarget = medianValues.filter((v) => v <= STL_TARGET_MIN).length;
  const totalLeads = crmDaily.reduce((sum, r) => sum + (r.total_leads ?? 0), 0);

  // --- Distribution buckets ---
  const bucketTotals: Record<string, number> = {};
  for (const b of BUCKET_ORDER) bucketTotals[b] = 0;
  for (const row of stlDist) {
    if (bucketTotals[row.bucket] !== undefined) {
      bucketTotals[row.bucket] += row.count;
    }
  }
  const totalDistCount = Object.values(bucketTotals).reduce((a, b) => a + b, 0);
  const distChartData = BUCKET_ORDER.map((bucket) => ({
    bucket,
    count: bucketTotals[bucket],
    pct: totalDistCount > 0 ? Math.round((bucketTotals[bucket] / totalDistCount) * 100) : 0,
  }));

  const under5 = (bucketTotals["<1min"] ?? 0) + (bucketTotals["1-3min"] ?? 0) + (bucketTotals["3-5min"] ?? 0);
  const pctUnder5 = totalDistCount > 0 ? (under5 / totalDistCount) * 100 : 0;

  // --- Daily trend ---
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  const dailyByDate: Record<string, Record<string, number | null>> = {};
  for (const row of crmDaily) {
    const d = row.date;
    if (!dailyByDate[d]) dailyByDate[d] = {};
    const slug = brandIdToSlug[row.brand_id] ?? `brand_${row.brand_id}`;
    dailyByDate[d][slug] = row.speed_to_lead_median_min;
  }

  const trendData = Object.entries(dailyByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, brands]) => ({
      date: format(new Date(date), "MMM dd"),
      Spa: brands["spa"] ?? null,
      Aesthetics: brands["aesthetics"] ?? null,
      Slimming: brands["slimming"] ?? null,
    }));

  // --- Per-brand summary ---
  const brandSummaries = ["spa", "aesthetics", "slimming"].map((slug) => {
    const bid = brandMap[slug];
    const brandRows = crmDaily.filter((r) => r.brand_id === bid);
    const meds = brandRows
      .map((r) => r.speed_to_lead_median_min)
      .filter((v): v is number => v !== null && v > 0);
    const brandDist = stlDist.filter((r) => r.brand_id === bid);
    const brandTotal = brandDist.reduce((s, r) => s + r.count, 0);
    const brandUnder5 = brandDist
      .filter((r) => ["<1min", "1-3min", "3-5min"].includes(r.bucket))
      .reduce((s, r) => s + r.count, 0);

    return {
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      median: median(meds),
      totalLeads: brandRows.reduce((s, r) => s + (r.total_leads ?? 0), 0),
      pctUnder5: brandTotal > 0 ? (brandUnder5 / brandTotal) * 100 : 0,
      grade: stlGrade(median(meds)),
    };
  });

  // --- Rep leaderboard ---
  const repAgg: Record<
    number,
    { staffId: number; brandId: number; totalLeads: number; totalCalls: number; stlSum: number; stlCount: number }
  > = {};
  for (const row of byRep) {
    if (!repAgg[row.staff_id]) {
      repAgg[row.staff_id] = { staffId: row.staff_id, brandId: row.brand_id, totalLeads: 0, totalCalls: 0, stlSum: 0, stlCount: 0 };
    }
    const agg = repAgg[row.staff_id];
    agg.totalLeads += row.leads_assigned ?? 0;
    agg.totalCalls += row.calls_made ?? 0;
    if (row.speed_to_lead_avg_min !== null && row.speed_to_lead_avg_min > 0) {
      agg.stlSum += row.speed_to_lead_avg_min;
      agg.stlCount += 1;
    }
  }

  const repData = Object.values(repAgg)
    .map((r) => ({
      staffId: r.staffId,
      brand: brandIdToSlug[r.brandId] ?? `brand_${r.brandId}`,
      totalLeads: r.totalLeads,
      totalCalls: r.totalCalls,
      avgStl: r.stlCount > 0 ? r.stlSum / r.stlCount : null,
      grade: r.stlCount > 0 ? stlGrade(r.stlSum / r.stlCount) : "-",
    }))
    .filter((r) => r.totalLeads > 0)
    .sort((a, b) => (a.avgStl ?? 999) - (b.avgStl ?? 999));

  const repColumns = [
    { key: "staffId", label: "Rep ID" },
    { key: "brand", label: "Brand", render: (v: unknown) => <span className="capitalize">{String(v)}</span> },
    { key: "totalLeads", label: "Leads", align: "right" as const, sortable: true },
    { key: "totalCalls", label: "Calls", align: "right" as const, sortable: true },
    {
      key: "avgStl", label: "Avg STL (min)", align: "right" as const, sortable: true,
      render: (v: unknown) => {
        const val = Number(v);
        if (!val || isNaN(val)) return <span className="text-text-secondary">-</span>;
        return <span className={`font-bold ${stlColor(val)}`}>{formatMinutes(val)}</span>;
      },
    },
    {
      key: "grade", label: "Grade", align: "center" as const,
      render: (v: unknown) => {
        const g = String(v);
        const colors: Record<string, string> = {
          "A+": "bg-emerald-100 text-emerald-800", A: "bg-emerald-100 text-emerald-700",
          B: "bg-green-100 text-green-700", C: "bg-amber-100 text-amber-700",
          D: "bg-orange-100 text-orange-700", F: "bg-red-100 text-red-700",
        };
        return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${colors[g] ?? "bg-gray-100 text-gray-500"}`}>{g}</span>;
      },
    },
  ];

  // --- KPI cards ---
  const kpis: KPIData[] = [
    { label: "Median STL", value: overallMedian > 0 ? formatMinutes(overallMedian) : "No data", target: `${STL_TARGET_MIN}m`, targetValue: STL_TARGET_MIN, currentValue: overallMedian },
    { label: "Mean STL", value: overallMean > 0 ? formatMinutes(overallMean) : "No data" },
    { label: "Under 5min", value: formatPercent(pctUnder5), target: "80%", targetValue: 80, currentValue: pctUnder5 },
    { label: "Leads (Period)", value: totalLeads.toLocaleString() },
    { label: "Days at Target", value: `${underTarget}/${medianValues.length}`, target: "100%", targetValue: medianValues.length, currentValue: underTarget },
    { label: "Overall Grade", value: overallMedian > 0 ? stlGrade(overallMedian) : "-" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse text-text-secondary">Loading speed-to-lead data...</div>
      </div>
    );
  }

  const hasData = crmDaily.length > 0 || stlDist.length > 0;

  return (
    <>
      {/* Section Header */}
      <div className="flex items-baseline justify-between pt-4 border-t border-border">
        <h2 className="text-xl font-bold text-foreground">Speed to Lead</h2>
        {!hasData && (
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            No data yet — ETL will populate once Zoho workflows are active
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Brand Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandSummaries.map((b) => (
          <Card key={b.slug} className="p-5 border-l-4" style={{ borderLeftColor: chartColors[b.slug as keyof typeof chartColors] ?? "#888" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">{b.label}</h3>
              <span className={`text-xl font-bold ${stlColor(b.median)}`}>{b.grade}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Median STL</span>
                <span className={`text-sm font-bold ${stlColor(b.median)}`}>{b.median > 0 ? formatMinutes(b.median) : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Under 5min</span>
                <span className="text-sm font-semibold text-foreground">{formatPercent(b.pctUnder5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Total Leads</span>
                <span className="text-sm font-semibold text-foreground">{b.totalLeads.toLocaleString()}</span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(b.pctUnder5, 100)}%`,
                    backgroundColor: b.pctUnder5 >= 80 ? "#16A34A" : b.pctUnder5 >= 50 ? "#F59E0B" : "#DC2626",
                  }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-text-secondary">0%</span>
                  <span className="text-xs text-text-secondary">Target: 80%</span>
                  <span className="text-xs text-text-secondary">100%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Distribution + Trend side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STL Distribution Histogram */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Response Time Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value, name) => name === "count" ? [`${value} leads`, "Count"] : [`${value}%`, "Pct"]} />
              <ReferenceLine x="3-5min" stroke="#DC2626" strokeDasharray="6 3" label={{ value: "5min", position: "top", fill: "#DC2626", fontSize: 10 }} />
              <Bar dataKey="count" name="count">
                {distChartData.map((_, i) => (
                  <Cell key={`dist-${i}`} fill={BUCKET_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-2 justify-center text-xs text-text-secondary flex-wrap">
            {BUCKET_ORDER.map((b, i) => (
              <div key={b} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: BUCKET_COLORS[i] }} />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Trend Chart */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Daily Median STL Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData.length > 0 ? trendData : [{ date: "-", Spa: null, Aesthetics: null, Slimming: null }]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis label={{ value: "Min", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <Tooltip formatter={(value) => value !== null && value !== undefined ? formatMinutes(Number(value)) : "No data"} />
              <Legend />
              <ReferenceLine y={STL_TARGET_MIN} stroke="#DC2626" strokeDasharray="6 3" label={{ value: "5min", position: "right", fill: "#DC2626", fontSize: 10 }} />
              {(!brandFilter || brandFilter === "spa") && (
                <Line type="monotone" dataKey="Spa" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: 2 }} connectNulls />
              )}
              {(!brandFilter || brandFilter === "aesthetics") && (
                <Line type="monotone" dataKey="Aesthetics" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: 2 }} connectNulls />
              )}
              {(!brandFilter || brandFilter === "slimming") && (
                <Line type="monotone" dataKey="Slimming" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: 2 }} connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Rep Leaderboard */}
      {repData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Rep Speed-to-Lead Leaderboard</h3>
          <DataTable columns={repColumns} data={repData as unknown as Record<string, unknown>[]} />
        </Card>
      )}

      {/* Benchmarks */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Speed-to-Lead Benchmarks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-text-secondary">Response Time</th>
                <th className="text-center py-2 px-3 font-semibold text-text-secondary">Grade</th>
                <th className="text-left py-2 px-3 font-semibold text-text-secondary">Impact</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: "Under 1 min", grade: "A+", impact: "391% higher conversion vs 1min+ (Velocify)", color: "bg-emerald-100 text-emerald-800" },
                { time: "1 - 3 min", grade: "A", impact: "Optimal zone — lead is still engaged with the ad", color: "bg-emerald-100 text-emerald-700" },
                { time: "3 - 5 min", grade: "B", impact: "Good — within industry best practice", color: "bg-green-100 text-green-700" },
                { time: "5 - 10 min", grade: "C", impact: "Contact rate drops 10x vs first minute", color: "bg-amber-100 text-amber-700" },
                { time: "10 - 15 min", grade: "D", impact: "Lead is likely distracted or comparison shopping", color: "bg-orange-100 text-orange-700" },
                { time: "15+ min", grade: "F", impact: "80% of leads unreachable after 15min (InsideSales)", color: "bg-red-100 text-red-700" },
              ].map((row) => (
                <tr key={row.grade} className="border-t border-border">
                  <td className="py-2 px-3 text-foreground">{row.time}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${row.color}`}>{row.grade}</span>
                  </td>
                  <td className="py-2 px-3 text-text-secondary">{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
