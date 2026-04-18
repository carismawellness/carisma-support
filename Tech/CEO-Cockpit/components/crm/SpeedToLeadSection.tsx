"use client";

import { useState, useMemo } from "react";
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
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

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

const TIME_PRESETS = [
  { label: "All Hours", from: 0, to: 24 },
  { label: "Business Hours (8-18)", from: 8, to: 18 },
  { label: "Morning (8-12)", from: 8, to: 12 },
  { label: "Afternoon (12-18)", from: 12, to: 18 },
  { label: "Extended (7-20)", from: 7, to: 20 },
];

/* ------------------------------------------------------------------ */
/*  Dummy per-rep data (until real ETL data flows)                     */
/* ------------------------------------------------------------------ */

const DUMMY_REP_STL = [
  {
    name: "Daniella Borg",
    brand: "aesthetics",
    totalLeads: 42,
    medianStl: 2.1,
    meanStl: 3.8,
    dist: { "<1min": 12, "1-3min": 14, "3-5min": 8, "5-15min": 5, "15-30min": 2, "30min+": 1 },
  },
  {
    name: "Joanne Camilleri",
    brand: "spa",
    totalLeads: 38,
    medianStl: 3.4,
    meanStl: 6.2,
    dist: { "<1min": 6, "1-3min": 11, "3-5min": 10, "5-15min": 7, "15-30min": 3, "30min+": 1 },
  },
  {
    name: "Maria Vella",
    brand: "slimming",
    totalLeads: 35,
    medianStl: 4.8,
    meanStl: 8.6,
    dist: { "<1min": 3, "1-3min": 8, "3-5min": 9, "5-15min": 8, "15-30min": 4, "30min+": 3 },
  },
  {
    name: "Carmen Grech",
    brand: "spa",
    totalLeads: 31,
    medianStl: 5.2,
    meanStl: 11.4,
    dist: { "<1min": 2, "1-3min": 6, "3-5min": 7, "5-15min": 9, "15-30min": 4, "30min+": 3 },
  },
  {
    name: "Nicole Zammit",
    brand: "aesthetics",
    totalLeads: 28,
    medianStl: 6.7,
    meanStl: 14.2,
    dist: { "<1min": 1, "1-3min": 4, "3-5min": 5, "5-15min": 8, "15-30min": 6, "30min+": 4 },
  },
  {
    name: "Katya Farrugia",
    brand: "slimming",
    totalLeads: 24,
    medianStl: 8.3,
    meanStl: 18.7,
    dist: { "<1min": 1, "1-3min": 2, "3-5min": 4, "5-15min": 7, "15-30min": 5, "30min+": 5 },
  },
  {
    name: "Lara Spiteri",
    brand: "spa",
    totalLeads: 19,
    medianStl: 12.1,
    meanStl: 24.6,
    dist: { "<1min": 0, "1-3min": 1, "3-5min": 3, "5-15min": 5, "15-30min": 6, "30min+": 4 },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function calcMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcMean(values: number[]): number {
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

function stlBgColor(minutes: number): string {
  if (minutes <= 3) return "bg-emerald-50 border-emerald-200";
  if (minutes <= 5) return "bg-green-50 border-green-200";
  if (minutes <= 10) return "bg-amber-50 border-amber-200";
  if (minutes <= 15) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

function stlGrade(minutes: number): string {
  if (minutes <= 1) return "A+";
  if (minutes <= 3) return "A";
  if (minutes <= 5) return "B";
  if (minutes <= 10) return "C";
  if (minutes <= 15) return "D";
  return "F";
}

function gradeColor(g: string): string {
  const colors: Record<string, string> = {
    "A+": "bg-emerald-100 text-emerald-800",
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-green-100 text-green-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };
  return colors[g] ?? "bg-gray-100 text-gray-500";
}

function meanStatusLabel(min: number): { label: string; color: string } {
  if (min <= 3) return { label: "Excellent", color: "text-emerald-600" };
  if (min <= 5) return { label: "Good", color: "text-emerald-500" };
  if (min <= 15) return { label: "Needs Improvement", color: "text-amber-500" };
  if (min <= 60) return { label: "Critical", color: "text-red-500" };
  return { label: "Critical", color: "text-red-600" };
}

function medianStatusLabel(min: number): { label: string; color: string } {
  if (min <= 3) return { label: "Excellent", color: "text-emerald-600" };
  if (min <= 5) return { label: "Good", color: "text-emerald-500" };
  if (min <= 10) return { label: "Acceptable", color: "text-amber-500" };
  return { label: "Slow", color: "text-red-500" };
}

/* ------------------------------------------------------------------ */
/*  Distribution Bar (reusable)                                        */
/* ------------------------------------------------------------------ */

function DistributionBar({
  dist,
  height = "h-8",
  showCounts = true,
}: {
  dist: Record<string, number>;
  height?: string;
  showCounts?: boolean;
}) {
  const total = BUCKET_ORDER.reduce((s, b) => s + (dist[b] ?? 0), 0);
  if (total === 0) return <div className={`${height} bg-gray-100 rounded-lg`} />;

  return (
    <div className={`flex ${height} rounded-lg overflow-hidden shadow-inner`}>
      {BUCKET_ORDER.map((bucket, i) => {
        const count = dist[bucket] ?? 0;
        const widthPct = (count / total) * 100;
        if (count === 0) return null;
        return (
          <div
            key={bucket}
            className="relative flex items-center justify-center transition-all"
            style={{
              width: `${widthPct}%`,
              backgroundColor: BUCKET_COLORS[i],
              minWidth: "20px",
            }}
            title={`${bucket}: ${count} leads (${Math.round(widthPct)}%)`}
          >
            {showCounts && (
              <span className="text-white text-xs font-bold drop-shadow-sm">
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
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
  /* ── State ───────────────────────────────────────────────────────── */
  const [businessHoursFrom, setBusinessHoursFrom] = useState(8);
  const [businessHoursTo, setBusinessHoursTo] = useState(18);
  const [activePreset, setActivePreset] = useState("Business Hours (8-18)");
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const [repSortBy, setRepSortBy] = useState<"median" | "name" | "leads">("median");
  const [repSortAsc, setRepSortAsc] = useState(true);

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

  const overallMedian = calcMedian(medianValues);
  const overallMean = calcMean(meanValues);
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
      median: calcMedian(meds),
      totalLeads: brandRows.reduce((s, r) => s + (r.total_leads ?? 0), 0),
      pctUnder5: brandTotal > 0 ? (brandUnder5 / brandTotal) * 100 : 0,
      grade: stlGrade(calcMedian(meds)),
    };
  });

  // --- KPI cards ---
  const kpis: KPIData[] = [
    { label: "Median STL", value: overallMedian > 0 ? formatMinutes(overallMedian) : "No data", target: `${STL_TARGET_MIN}m`, targetValue: STL_TARGET_MIN, currentValue: overallMedian },
    { label: "Mean STL", value: overallMean > 0 ? formatMinutes(overallMean) : "No data" },
    { label: "Under 5min", value: formatPercent(pctUnder5), target: "80%", targetValue: 80, currentValue: pctUnder5 },
    { label: "Leads (Period)", value: totalLeads.toLocaleString() },
    { label: "Days at Target", value: `${underTarget}/${medianValues.length}`, target: "100%", targetValue: medianValues.length, currentValue: underTarget },
    { label: "Overall Grade", value: overallMedian > 0 ? stlGrade(overallMedian) : "-" },
  ];

  // --- Dummy fallback ---
  const DUMMY_DIST_DATA: Record<string, number> = {
    "<1min": 5, "1-3min": 8, "3-5min": 7, "5-15min": 6, "15-30min": 4, "30min+": 3,
  };
  const DUMMY_MEDIAN = 3.8;
  const DUMMY_MEAN = 12.4;
  const DUMMY_TOTAL = 33;

  const displayDistMap = totalDistCount > 0 ? bucketTotals : DUMMY_DIST_DATA;
  const displayDistData = totalDistCount > 0 ? distChartData : BUCKET_ORDER.map((b) => ({
    bucket: b, count: DUMMY_DIST_DATA[b], pct: Math.round((DUMMY_DIST_DATA[b] / DUMMY_TOTAL) * 100),
  }));
  const displayMedian = overallMedian > 0 ? overallMedian : DUMMY_MEDIAN;
  const displayMean = overallMean > 0 ? overallMean : DUMMY_MEAN;
  const isDummy = totalDistCount === 0 && overallMedian === 0;

  const meanStatus = meanStatusLabel(displayMean);
  const medianStatus = medianStatusLabel(displayMedian);

  // --- Per-rep data (sorted) ---
  const sortedRepData = useMemo(() => {
    const data = [...DUMMY_REP_STL];
    const filtered = brandFilter
      ? data.filter((r) => r.brand === brandFilter)
      : data;
    return filtered.sort((a, b) => {
      let cmp = 0;
      if (repSortBy === "median") cmp = a.medianStl - b.medianStl;
      else if (repSortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (repSortBy === "leads") cmp = b.totalLeads - a.totalLeads;
      return repSortAsc ? cmp : -cmp;
    });
  }, [brandFilter, repSortBy, repSortAsc]);

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
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO: Speed to Lead — Central Metric                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-4 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none" />

        <div className="relative">
          {/* Header + Time Filter */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Speed to Lead
              </h2>
              <span className="text-muted-foreground cursor-help" title="Response time to new leads">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDummy && (
                <span className="text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-2 py-1 rounded">
                  sample
                </span>
              )}
              <button
                onClick={() => setShowTimeFilter(!showTimeFilter)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
              >
                <Clock className="h-3.5 w-3.5" />
                {businessHoursFrom}:00 – {businessHoursTo}:00
                {showTimeFilter ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Time-of-Day Filter Panel */}
          {showTimeFilter && (
            <div className="mb-6 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Business Hours Filter</p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Only include leads received during these hours. Leads outside this window are excluded from STL calculations.
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setBusinessHoursFrom(preset.from);
                      setBusinessHoursTo(preset.to);
                      setActivePreset(preset.label);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activePreset === preset.label
                        ? "bg-foreground text-white border-foreground"
                        : "bg-white text-foreground border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom time range */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">From</label>
                  <select
                    value={businessHoursFrom}
                    onChange={(e) => {
                      setBusinessHoursFrom(Number(e.target.value));
                      setActivePreset("");
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">To</label>
                  <select
                    value={businessHoursTo}
                    onChange={(e) => {
                      setBusinessHoursTo(Number(e.target.value));
                      setActivePreset("");
                    }}
                    className="border rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visual time bar */}
                <div className="flex-1 ml-4 hidden md:block">
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 h-full bg-emerald-100 border-x-2 border-emerald-400 transition-all"
                      style={{
                        left: `${(businessHoursFrom / 24) * 100}%`,
                        width: `${((businessHoursTo - businessHoursFrom) / 24) * 100}%`,
                      }}
                    />
                    {/* Hour markers */}
                    {[0, 6, 12, 18, 24].map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 h-full flex items-end"
                        style={{ left: `${(h / 24) * 100}%` }}
                      >
                        <span className="text-[9px] text-muted-foreground -translate-x-1/2 pb-0.5">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-6">
            Response time to new leads — filtering {businessHoursFrom}:00 to {businessHoursTo}:00 only
          </p>

          {/* Big Mean + Median side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 rounded-2xl bg-white border-2 border-gray-100 shadow-sm">
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${meanStatus.color}`}>
                {meanStatus.label}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                Average
              </p>
              <p className={`text-5xl md:text-6xl font-black tracking-tight ${stlColor(displayMean)}`}>
                {displayMean >= 60
                  ? `${(displayMean / 60).toFixed(1)}h`
                  : `${displayMean.toFixed(1)}m`}
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white border-2 border-gray-100 shadow-sm">
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${medianStatus.color}`}>
                {medianStatus.label}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                Median
              </p>
              <p className={`text-5xl md:text-6xl font-black tracking-tight ${stlColor(displayMedian)}`}>
                {formatMinutes(displayMedian)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Less sensitive to outliers
              </p>
            </div>
          </div>

          {/* Horizontal distribution bar */}
          <div className="mb-4">
            <DistributionBar dist={displayDistMap} height="h-10" showCounts />
          </div>

          {/* Legend */}
          <div className="flex gap-4 justify-center text-xs text-text-secondary flex-wrap">
            {BUCKET_ORDER.map((b, i) => (
              <div key={b} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: BUCKET_COLORS[i] }} />
                <span className="font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  PER-REP STL Distribution                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Speed to Lead by Rep</h3>
          {isDummy && (
            <span className="text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-2 py-1 rounded">
              sample
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Individual distribution with median and grade for each sales rep — sorted by fastest median first
        </p>

        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          {(["median", "name", "leads"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (repSortBy === key) {
                  setRepSortAsc(!repSortAsc);
                } else {
                  setRepSortBy(key);
                  setRepSortAsc(key === "median");
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
                repSortBy === key
                  ? "bg-foreground text-white border-foreground"
                  : "bg-white text-foreground border-gray-200 hover:bg-gray-50"
              }`}
            >
              {key === "median" ? "Median STL" : key === "name" ? "Name" : "Leads"}
              {repSortBy === key && (
                repSortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {/* Rep cards with distribution bars */}
        <div className="space-y-3">
          {sortedRepData.map((rep) => {
            const grade = stlGrade(rep.medianStl);
            const total = BUCKET_ORDER.reduce((s, b) => s + (rep.dist[b as keyof typeof rep.dist] ?? 0), 0);
            const under5Count =
              (rep.dist["<1min"] ?? 0) +
              (rep.dist["1-3min"] ?? 0) +
              (rep.dist["3-5min"] ?? 0);
            const under5Pct = total > 0 ? (under5Count / total) * 100 : 0;

            return (
              <div
                key={rep.name}
                className={`p-4 rounded-xl border-2 transition-all ${stlBgColor(rep.medianStl)}`}
              >
                {/* Top row: name, brand, stats */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${gradeColor(grade)}`}>
                      {grade}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{rep.name}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded"
                      style={{
                        color: chartColors[rep.brand as keyof typeof chartColors] ?? "#888",
                        backgroundColor: `${chartColors[rep.brand as keyof typeof chartColors] ?? "#888"}15`,
                      }}
                    >
                      {rep.brand}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Median</p>
                      <p className={`text-base font-bold ${stlColor(rep.medianStl)}`}>
                        {formatMinutes(rep.medianStl)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Mean</p>
                      <p className={`text-base font-bold ${stlColor(rep.meanStl)}`}>
                        {formatMinutes(rep.meanStl)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Leads</p>
                      <p className="text-base font-bold text-foreground">{rep.totalLeads}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">&lt;5min</p>
                      <p className={`text-base font-bold ${under5Pct >= 80 ? "text-emerald-600" : under5Pct >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        {under5Pct.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Distribution bar */}
                <DistributionBar dist={rep.dist} height="h-7" showCounts />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 justify-center text-xs text-text-secondary flex-wrap mt-4 pt-3 border-t">
          {BUCKET_ORDER.map((b, i) => (
            <div key={b} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUCKET_COLORS[i] }} />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Brand Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandSummaries.map((b) => (
          <Card key={b.slug} className="p-3 md:p-5 border-l-4" style={{ borderLeftColor: chartColors[b.slug as keyof typeof chartColors] ?? "#888" }}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Response Time Distribution</h3>
          <div className="h-[220px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayDistData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value, name) => name === "count" ? [`${value} leads`, "Count"] : [`${value}%`, "Pct"]} />
              <ReferenceLine x="3-5min" stroke="#DC2626" strokeDasharray="6 3" label={{ value: "5min", position: "top", fill: "#DC2626", fontSize: 10 }} />
              <Bar dataKey="count" name="count">
                {displayDistData.map((_, i) => (
                  <Cell key={`dist-${i}`} fill={BUCKET_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-3 md:p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Daily Median STL Trend</h3>
          <div className="h-[220px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData.length > 0 ? trendData : [{ date: "-", Spa: null, Aesthetics: null, Slimming: null }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          </div>
        </Card>
      </div>

      {/* Benchmarks */}
      <Card className="p-3 md:p-6">
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
