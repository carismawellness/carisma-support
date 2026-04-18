"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  formatMinutes,
  formatPercent,
} from "@/lib/charts/config";
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
}

interface StlDistRow {
  date: string;
  brand_id: number;
  bucket: string;
  count: number;
  pct: number;
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

const BRANDS = ["spa", "aesthetics", "slimming"] as const;
const BRAND_LABELS: Record<string, string> = { spa: "Spa", aesthetics: "Aesthetics", slimming: "Slimming" };

/* ------------------------------------------------------------------ */
/*  Dummy per-brand distribution data                                  */
/* ------------------------------------------------------------------ */

const DUMMY_BRAND_STL: Record<string, { median: number; mean: number; totalLeads: number; dist: Record<string, number> }> = {
  spa: { median: 3.2, mean: 4.1, totalLeads: 155, dist: { "<1min": 18, "1-3min": 42, "3-5min": 38, "5-15min": 32, "15-30min": 16, "30min+": 9 } },
  aesthetics: { median: 4.8, mean: 6.3, totalLeads: 268, dist: { "<1min": 22, "1-3min": 55, "3-5min": 62, "5-15min": 68, "15-30min": 38, "30min+": 23 } },
  slimming: { median: 6.1, mean: 8.4, totalLeads: 132, dist: { "<1min": 8, "1-3min": 19, "3-5min": 24, "5-15min": 38, "15-30min": 26, "30min+": 17 } },
};

/* ------------------------------------------------------------------ */
/*  Dummy per-rep data                                                 */
/* ------------------------------------------------------------------ */

const DUMMY_REP_STL = [
  { name: "Daniella Borg", brand: "aesthetics", totalLeads: 42, medianStl: 2.1, meanStl: 3.8, dist: { "<1min": 12, "1-3min": 14, "3-5min": 8, "5-15min": 5, "15-30min": 2, "30min+": 1 } },
  { name: "Joanne Camilleri", brand: "spa", totalLeads: 38, medianStl: 3.4, meanStl: 6.2, dist: { "<1min": 6, "1-3min": 11, "3-5min": 10, "5-15min": 7, "15-30min": 3, "30min+": 1 } },
  { name: "Maria Vella", brand: "slimming", totalLeads: 35, medianStl: 4.8, meanStl: 8.6, dist: { "<1min": 3, "1-3min": 8, "3-5min": 9, "5-15min": 8, "15-30min": 4, "30min+": 3 } },
  { name: "Carmen Grech", brand: "spa", totalLeads: 31, medianStl: 5.2, meanStl: 11.4, dist: { "<1min": 2, "1-3min": 6, "3-5min": 7, "5-15min": 9, "15-30min": 4, "30min+": 3 } },
  { name: "Nicole Zammit", brand: "aesthetics", totalLeads: 28, medianStl: 6.7, meanStl: 14.2, dist: { "<1min": 1, "1-3min": 4, "3-5min": 5, "5-15min": 8, "15-30min": 6, "30min+": 4 } },
  { name: "Katya Farrugia", brand: "slimming", totalLeads: 24, medianStl: 8.3, meanStl: 18.7, dist: { "<1min": 1, "1-3min": 2, "3-5min": 4, "5-15min": 7, "15-30min": 5, "30min+": 5 } },
  { name: "Lara Spiteri", brand: "spa", totalLeads: 19, medianStl: 12.1, meanStl: 24.6, dist: { "<1min": 0, "1-3min": 1, "3-5min": 3, "5-15min": 5, "15-30min": 6, "30min+": 4 } },
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

function pctUnder5(dist: Record<string, number>): number {
  const under = (dist["<1min"] ?? 0) + (dist["1-3min"] ?? 0) + (dist["3-5min"] ?? 0);
  const total = BUCKET_ORDER.reduce((s, b) => s + (dist[b] ?? 0), 0);
  return total > 0 ? (under / total) * 100 : 0;
}

/* ------------------------------------------------------------------ */
/*  Distribution Bar (compact, reusable)                               */
/* ------------------------------------------------------------------ */

function DistributionBar({
  dist,
  height = "h-6",
  showCounts = false,
}: {
  dist: Record<string, number>;
  height?: string;
  showCounts?: boolean;
}) {
  const total = BUCKET_ORDER.reduce((s, b) => s + (dist[b] ?? 0), 0);
  if (total === 0) return <div className={`${height} bg-gray-100 rounded`} />;

  return (
    <div className={`flex ${height} rounded overflow-hidden`}>
      {BUCKET_ORDER.map((bucket, i) => {
        const count = dist[bucket] ?? 0;
        const widthPct = (count / total) * 100;
        if (count === 0) return null;
        return (
          <div
            key={bucket}
            className="relative flex items-center justify-center"
            style={{ width: `${widthPct}%`, backgroundColor: BUCKET_COLORS[i], minWidth: count > 0 ? "14px" : 0 }}
            title={`${bucket}: ${count} (${Math.round(widthPct)}%)`}
          >
            {showCounts && <span className="text-white text-[10px] font-bold drop-shadow-sm">{count}</span>}
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

  const loading = crmLoading || distLoading;

  /* ── Per-brand computed data (real or dummy) ─────────────────────── */
  const visibleBrands = brandFilter ? BRANDS.filter((b) => b === brandFilter) : [...BRANDS];

  const brandData = useMemo(() => {
    return visibleBrands.map((slug) => {
      const bid = brandMap[slug];
      const brandRows = crmDaily.filter((r) => r.brand_id === bid);
      const hasData = brandRows.length > 0 && brandRows.some((r) => (r.speed_to_lead_median_min ?? 0) > 0);

      if (!hasData) {
        const dummy = DUMMY_BRAND_STL[slug];
        return { slug, ...dummy, grade: stlGrade(dummy.median), isDummy: true };
      }

      const meds = brandRows.map((r) => r.speed_to_lead_median_min).filter((v): v is number => v !== null && v > 0);
      const means = brandRows.map((r) => r.speed_to_lead_mean_min).filter((v): v is number => v !== null && v > 0);
      const median = calcMedian(meds);
      const mean = calcMean(means);
      const totalLeads = brandRows.reduce((s, r) => s + (r.total_leads ?? 0), 0);

      const brandDistRows = stlDist.filter((r) => r.brand_id === bid);
      const dist: Record<string, number> = {};
      for (const b of BUCKET_ORDER) dist[b] = 0;
      for (const row of brandDistRows) {
        if (dist[row.bucket] !== undefined) dist[row.bucket] += row.count;
      }

      return { slug, median, mean, totalLeads, dist, grade: stlGrade(median), isDummy: false };
    });
  }, [crmDaily, stlDist, brandMap, visibleBrands]);

  /* ── Overall stats ──────────────────────────────────────────────── */
  const overallMedian = calcMedian(brandData.map((b) => b.median).filter((v) => v > 0));
  const overallMean = calcMean(brandData.map((b) => b.mean).filter((v) => v > 0));
  const allDist: Record<string, number> = {};
  for (const b of BUCKET_ORDER) allDist[b] = 0;
  for (const bd of brandData) {
    for (const b of BUCKET_ORDER) allDist[b] += bd.dist[b] ?? 0;
  }
  const totalLeads = brandData.reduce((s, b) => s + b.totalLeads, 0);
  const isDummy = brandData.every((b) => b.isDummy);

  /* ── Per-rep data (sorted) ──────────────────────────────────────── */
  const sortedRepData = useMemo(() => {
    const filtered = brandFilter
      ? DUMMY_REP_STL.filter((r) => r.brand === brandFilter)
      : [...DUMMY_REP_STL];
    return filtered.sort((a, b) => {
      let cmp = 0;
      if (repSortBy === "median") cmp = a.medianStl - b.medianStl;
      else if (repSortBy === "name") cmp = a.name.localeCompare(b.name);
      else cmp = b.totalLeads - a.totalLeads;
      return repSortAsc ? cmp : -cmp;
    });
  }, [brandFilter, repSortBy, repSortAsc]);

  if (loading) {
    return <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />;
  }

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 1: Speed to Lead by Brand                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-4 md:p-6 relative">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-foreground">Speed to Lead by Brand</h2>
          <div className="flex items-center gap-2">
            {isDummy && (
              <span className="text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">sample</span>
            )}
            <button
              onClick={() => setShowTimeFilter(!showTimeFilter)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border hover:bg-muted transition-colors"
            >
              <Clock className="h-3 w-3" />
              {businessHoursFrom}:00–{businessHoursTo}:00
              {showTimeFilter ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Median response time per brand — target: under {STL_TARGET_MIN}min
        </p>

        {/* Time Filter */}
        {showTimeFilter && (
          <div className="mb-5 p-3 bg-gray-50 rounded-lg border">
            <div className="flex flex-wrap gap-2 mb-3">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setBusinessHoursFrom(preset.from); setBusinessHoursTo(preset.to); setActivePreset(preset.label); }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    activePreset === preset.label ? "bg-foreground text-white border-foreground" : "bg-white text-foreground border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select value={businessHoursFrom} onChange={(e) => { setBusinessHoursFrom(Number(e.target.value)); setActivePreset(""); }} className="border rounded px-2 py-1 text-xs bg-white">
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
              </select>
              <span className="text-muted-foreground text-xs">to</span>
              <select value={businessHoursTo} onChange={(e) => { setBusinessHoursTo(Number(e.target.value)); setActivePreset(""); }} className="border rounded px-2 py-1 text-xs bg-white">
                {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
              <div className="flex-1 ml-3 hidden md:block">
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-emerald-200 border-x border-emerald-400"
                    style={{ left: `${(businessHoursFrom / 24) * 100}%`, width: `${((businessHoursTo - businessHoursFrom) / 24) * 100}%` }}
                  />
                  {[0, 6, 12, 18, 24].map((h) => (
                    <div key={h} className="absolute top-0 h-full flex items-end" style={{ left: `${(h / 24) * 100}%` }}>
                      <span className="text-[8px] text-muted-foreground -translate-x-1/2">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brand cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brandData.map((b) => {
            const under5 = pctUnder5(b.dist);
            return (
              <div
                key={b.slug}
                className="p-4 rounded-xl border-l-4"
                style={{ borderLeftColor: chartColors[b.slug as keyof typeof chartColors] ?? "#888" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                    {BRAND_LABELS[b.slug]}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${gradeColor(b.grade)}`}>{b.grade}</span>
                </div>

                {/* Big median */}
                <div className="text-center mb-3">
                  <p className={`text-3xl font-black ${stlColor(b.median)}`}>
                    {b.median > 0 ? formatMinutes(b.median) : "-"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Median</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Mean</p>
                    <p className={`text-sm font-bold ${stlColor(b.mean)}`}>
                      {b.mean > 0 ? formatMinutes(b.mean) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">&lt;5min</p>
                    <p className={`text-sm font-bold ${under5 >= 80 ? "text-emerald-600" : under5 >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {formatPercent(under5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Leads</p>
                    <p className="text-sm font-bold text-foreground">{b.totalLeads}</p>
                  </div>
                </div>

                {/* Distribution bar */}
                <DistributionBar dist={b.dist} height="h-5" showCounts={false} />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 justify-center text-[10px] text-text-secondary flex-wrap mt-3">
          {BUCKET_ORDER.map((b, i) => (
            <div key={b} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: BUCKET_COLORS[i] }} />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 2: Speed to Lead by Rep (compact)                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-foreground">Speed to Lead by Rep</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Sort:</span>
            {(["median", "name", "leads"] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (repSortBy === key) setRepSortAsc(!repSortAsc);
                  else { setRepSortBy(key); setRepSortAsc(key === "median"); }
                }}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors flex items-center gap-0.5 ${
                  repSortBy === key ? "bg-foreground text-white border-foreground" : "bg-white text-foreground border-gray-200 hover:bg-gray-50"
                }`}
              >
                {key === "median" ? "STL" : key === "name" ? "Name" : "Leads"}
                {repSortBy === key && (repSortAsc ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />)}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Per-rep median, grade, and distribution</p>

        <div className="space-y-2">
          {sortedRepData.map((rep) => {
            const grade = stlGrade(rep.medianStl);
            const under5 = pctUnder5(rep.dist);
            return (
              <div key={rep.name} className={`flex items-center gap-3 p-2.5 rounded-lg border ${stlBgColor(rep.medianStl)}`}>
                {/* Grade + Name */}
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${gradeColor(grade)}`}>{grade}</span>
                <div className="w-[120px] shrink-0">
                  <p className="text-xs font-semibold text-foreground truncate">{rep.name}</p>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: chartColors[rep.brand as keyof typeof chartColors] ?? "#888" }}>
                    {rep.brand}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-3 shrink-0 text-center">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Med</p>
                    <p className={`text-xs font-bold ${stlColor(rep.medianStl)}`}>{formatMinutes(rep.medianStl)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Mean</p>
                    <p className={`text-xs font-bold ${stlColor(rep.meanStl)}`}>{formatMinutes(rep.meanStl)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">&lt;5m</p>
                    <p className={`text-xs font-bold ${under5 >= 80 ? "text-emerald-600" : under5 >= 50 ? "text-amber-500" : "text-red-500"}`}>{under5.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Leads</p>
                    <p className="text-xs font-bold text-foreground">{rep.totalLeads}</p>
                  </div>
                </div>

                {/* Distribution bar */}
                <div className="flex-1 min-w-0">
                  <DistributionBar dist={rep.dist} height="h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  SECTION 3: General Speed to Lead (compact overview)          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Card className="p-4 md:p-5">
        <h3 className="text-base font-semibold text-foreground mb-3">Overall Speed to Lead</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Median</p>
            <p className={`text-xl font-black ${stlColor(overallMedian)}`}>
              {overallMedian > 0 ? formatMinutes(overallMedian) : "-"}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mean</p>
            <p className={`text-xl font-black ${stlColor(overallMean)}`}>
              {overallMean > 0 ? formatMinutes(overallMean) : "-"}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Under 5min</p>
            <p className={`text-xl font-black ${pctUnder5(allDist) >= 80 ? "text-emerald-600" : pctUnder5(allDist) >= 50 ? "text-amber-500" : "text-red-500"}`}>
              {formatPercent(pctUnder5(allDist))}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Leads</p>
            <p className="text-xl font-black text-foreground">{totalLeads.toLocaleString()}</p>
          </div>
        </div>

        {/* Overall distribution bar */}
        <DistributionBar dist={allDist} height="h-7" showCounts />

        {/* Benchmarks (compact) */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Benchmarks</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { time: "<1min", grade: "A+", note: "391% higher conv", color: "#16A34A" },
              { time: "1-3min", grade: "A", note: "Lead still engaged", color: "#22C55E" },
              { time: "3-5min", grade: "B", note: "Industry best practice", color: "#86EFAC" },
              { time: "5-10min", grade: "C", note: "10x drop in contact", color: "#FDE047" },
              { time: "10-15min", grade: "D", note: "Lead comparing options", color: "#FB923C" },
              { time: "15min+", grade: "F", note: "80% unreachable", color: "#DC2626" },
            ].map((b) => (
              <div key={b.grade} className="p-2 rounded-lg border text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-xs font-bold text-foreground">{b.time}</span>
                </div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${gradeColor(b.grade)}`}>{b.grade}</span>
                <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{b.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
