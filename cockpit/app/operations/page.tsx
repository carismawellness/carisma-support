"use client";

import { useMemo } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ---------- types ---------- */

interface OpsRow {
  week_start: string;
  location_id: number;
  brand_id: number;
  google_reviews_count: number;
  google_reviews_avg: number;
  complaints_count: number;
}

interface ConsultRow {
  week_start: string;
  brand_id: number;
  consults_booked: number;
  consults_attended: number;
  showup_pct: number;
  conversions: number;
  conversion_pct: number;
  aov: number;
  course_conversions: number;
  course_conversion_pct: number;
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

/* ---------- page content ---------- */

function OperationsContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { data: opsData, loading: opsLoading } = useKPIData<OpsRow>({
    table: "operations_weekly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: consultData, loading: consultLoading } = useKPIData<ConsultRow>({
    table: "consult_funnel",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const loading = opsLoading || consultLoading;

  /* KPIs */
  const kpis = useMemo<KPIData[]>(() => {
    const avgRating = avg(opsData.map((r) => Number(r.google_reviews_avg)));
    const complaints = sum(opsData.map((r) => Number(r.complaints_count)));

    const aesRows = consultData.filter((r) => r.brand_id === 2);
    const slimRows = consultData.filter((r) => r.brand_id === 3);

    const consultConvAes = avg(aesRows.map((r) => Number(r.conversion_pct)));
    const showupSlim = avg(slimRows.map((r) => Number(r.showup_pct)));
    const aovAes = avg(aesRows.map((r) => Number(r.aov)));
    const showupAes = avg(aesRows.map((r) => Number(r.showup_pct)));

    return [
      { label: "Avg Google Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "—" },
      { label: "Complaints", value: String(complaints) },
      { label: "Consult Conv Aes", value: `${consultConvAes.toFixed(0)}%`, target: "50%", targetValue: 50, currentValue: consultConvAes },
      { label: "Show-up Slim", value: `${showupSlim.toFixed(0)}%`, target: "85%", targetValue: 85, currentValue: showupSlim },
      { label: "AOV Aes", value: aovAes > 0 ? formatCurrency(aovAes) : "—", target: "€245", targetValue: 245, currentValue: aovAes },
      { label: "Show-up Aes", value: `${showupAes.toFixed(0)}%`, target: "85%", targetValue: 85, currentValue: showupAes },
    ];
  }, [opsData, consultData]);

  /* Reviews trend by week (grouped by location placeholder) */
  const reviewsTrend = useMemo(() => {
    const byWeek = new Map<string, OpsRow[]>();
    for (const r of opsData) {
      if (!byWeek.has(r.week_start)) byWeek.set(r.week_start, []);
      byWeek.get(r.week_start)!.push(r);
    }
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, rows]) => ({
        week,
        avgRating: avg(rows.map((r) => Number(r.google_reviews_avg))),
        totalReviews: sum(rows.map((r) => Number(r.google_reviews_count))),
      }));
  }, [opsData]);

  /* Consult Funnel chart data (with course conversions) */
  const funnelChart = useMemo(() => {
    const brands = [2, 3]; // Aesthetics & Slimming
    const stages = ["Booked", "Attended", "Converted", "Course Conv."];
    return stages.map((stage) => {
      const row: Record<string, string | number> = { stage };
      for (const bid of brands) {
        const rows = consultData.filter((r) => r.brand_id === bid);
        const name = BRAND_NAMES[bid];
        if (stage === "Booked") row[name] = sum(rows.map((r) => Number(r.consults_booked)));
        else if (stage === "Attended") row[name] = sum(rows.map((r) => Number(r.consults_attended)));
        else if (stage === "Converted") row[name] = sum(rows.map((r) => Number(r.conversions)));
        else if (stage === "Course Conv.") row[name] = sum(rows.map((r) => Number(r.course_conversions)));
      }
      return row;
    });
  }, [consultData]);

  /* Course conversion rates */
  const courseConvRates = useMemo(() => {
    return [2, 3].map((bid) => {
      const rows = consultData.filter((r) => r.brand_id === bid);
      return {
        brand: BRAND_NAMES[bid],
        courseConversions: sum(rows.map((r) => Number(r.course_conversions))),
        courseConvPct: avg(rows.map((r) => Number(r.course_conversion_pct))),
      };
    });
  }, [consultData]);

  /* Location scorecard */
  const scorecardColumns = [
    { key: "location_id", label: "Location ID" },
    { key: "rating", label: "Rating", align: "right" as const, sortable: true },
    { key: "reviews", label: "Reviews", align: "right" as const, sortable: true },
    { key: "complaints", label: "Complaints", align: "right" as const, sortable: true },
  ];

  const scorecardData = useMemo(() => {
    const byLoc = new Map<number, OpsRow[]>();
    for (const r of opsData) {
      if (!byLoc.has(r.location_id)) byLoc.set(r.location_id, []);
      byLoc.get(r.location_id)!.push(r);
    }
    return Array.from(byLoc.entries()).map(([locId, rows]) => ({
      location_id: locId,
      rating: Number(avg(rows.map((r) => Number(r.google_reviews_avg))).toFixed(1)),
      reviews: sum(rows.map((r) => Number(r.google_reviews_count))),
      complaints: sum(rows.map((r) => Number(r.complaints_count))),
    }));
  }, [opsData]);

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
        <p className="text-gray-500">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
      <KPICardRow kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Google Reviews Trend</h2>
          {reviewsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reviewsTrend} margin={chartDefaults.margin}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[4.0, 5.0]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="Avg Rating"
                  stroke={chartColors.spa}
                  strokeWidth={chartDefaults.strokeWidth}
                  dot={{ r: chartDefaults.dotRadius }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No reviews data for this period.</p>
          )}
        </Card>

        {/* Consult Funnel with Course Conversions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Consult Funnel</h2>
          {funnelChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnelChart} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Aesthetics" fill={chartColors.aesthetics} />
                  <Bar dataKey="Slimming" fill={chartColors.slimming} />
                </BarChart>
              </ResponsiveContainer>
              {/* Course conversion summary */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                {courseConvRates.map((c) => (
                  <div key={c.brand} className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {c.brand} Course Conv.
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {c.courseConversions}
                      <span className="text-sm text-gray-500 ml-1">
                        ({c.courseConvPct.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No consult funnel data for this period.</p>
          )}
        </Card>
      </div>

      {/* Location Scorecard */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Scorecard</h2>
        {scorecardData.length > 0 ? (
          <DataTable columns={scorecardColumns} data={scorecardData} />
        ) : (
          <p className="text-sm text-gray-500">No location data for this period.</p>
        )}
      </Card>
      <CIChat />
    </>
  );
}

export default function OperationsPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <OperationsContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
