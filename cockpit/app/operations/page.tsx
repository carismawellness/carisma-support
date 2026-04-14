"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { FreshnessIndicator } from "@/components/dashboard/FreshnessIndicator";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency, formatPercent } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { ExportMenu } from "@/components/dashboard/ExportMenu";
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

/* ── Mock fallbacks ────────────────────────────────────────── */

const mockKpis: KPIData[] = [
  { label: "Avg Google Rating", value: "4.6", trend: 1, sparkline: [4.4, 4.5, 4.5, 4.6] },
  { label: "Complaints", value: "3", trend: -25, sparkline: [6, 5, 4, 3], lowerIsBetter: true },
  { label: "Consult Conv Aes", value: "52%", trend: 4, target: "50%", targetValue: 50, currentValue: 52, sparkline: [46, 48, 50, 52] },
  { label: "Show-up Slim", value: "83%", trend: -2, target: "85%", targetValue: 85, currentValue: 83, sparkline: [86, 85, 84, 83] },
  { label: "AOV Aes", value: "€258", trend: 5, target: "€245", targetValue: 245, currentValue: 258, sparkline: [235, 242, 250, 258] },
];

const mockReviewsTrend = [
  { week: "Week 1", sliema: 4.7, stjulians: 4.5, valletta: 4.6, mosta: 4.4 },
  { week: "Week 2", sliema: 4.6, stjulians: 4.6, valletta: 4.5, mosta: 4.5 },
  { week: "Week 3", sliema: 4.7, stjulians: 4.5, valletta: 4.7, mosta: 4.4 },
  { week: "Week 4", sliema: 4.8, stjulians: 4.6, valletta: 4.6, mosta: 4.5 },
];

const mockConsultFunnel = [
  { stage: "Booked", aesthetics: 120, slimming: 95 },
  { stage: "Attended", aesthetics: 98, slimming: 79 },
  { stage: "Converted", aesthetics: 62, slimming: 48 },
];

const scorecardColumns = [
  { key: "location", label: "Location" },
  { key: "rating", label: "Rating", align: "right" as const, sortable: true },
  { key: "reviews", label: "Reviews", align: "right" as const, sortable: true },
  { key: "complaints", label: "Complaints", align: "right" as const, sortable: true },
  { key: "notes", label: "Notes" },
];

const mockScorecardData = [
  { location: "Sliema", rating: 4.8, reviews: 42, complaints: 0, notes: "Top performer" },
  { location: "St Julian's", rating: 4.6, reviews: 38, complaints: 1, notes: "Wait time feedback" },
  { location: "Valletta", rating: 4.6, reviews: 35, complaints: 0, notes: "Steady" },
  { location: "Mosta", rating: 4.5, reviews: 28, complaints: 1, notes: "Parking mentioned" },
  { location: "Qormi", rating: 4.4, reviews: 22, complaints: 1, notes: "Staff courtesy flag" },
  { location: "Fgura", rating: 4.3, reviews: 18, complaints: 0, notes: "New location ramp-up" },
];

export default function OperationsPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: opsData, loading: opsLoading, lastUpdated: opsLastUpdated } = useKPIData<{
          week_start: string;
          google_reviews_avg: number;
          google_reviews_count: number;
          complaints_count: number;
          location_id: string;
          location_name: string;
        }>({ table: "operations_weekly", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const { data: consultData, loading: consultLoading } = useKPIData<{
          week_start: string;
          stage: string;
          aesthetics: number;
          slimming: number;
        }>({ table: "consult_funnel", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const isLoading = opsLoading || consultLoading;

        /* ── Compute KPIs ── */
        const avgRating = opsData.length > 0
          ? opsData.reduce((s, r) => s + (r.google_reviews_avg || 0), 0) / opsData.length
          : 0;
        const totalReviews = opsData.reduce((s, r) => s + (r.google_reviews_count || 0), 0);
        const totalComplaints = opsData.reduce((s, r) => s + (r.complaints_count || 0), 0);

        const computedKpis: KPIData[] = isLoading || opsData.length === 0 ? mockKpis : [
          { label: "Avg Google Rating", value: avgRating.toFixed(1) },
          { label: "Total Reviews", value: totalReviews.toLocaleString() },
          { label: "Complaints", value: totalComplaints.toLocaleString() },
          {
            label: "Consult Conv Aes",
            value: consultData.length > 0 ? "See funnel" : "—",
            target: "50%",
            targetValue: 50,
            currentValue: 52,
          },
        ];

        /* ── Reviews trend by location over weeks ── */
        const reviewsChart = isLoading || opsData.length === 0 ? mockReviewsTrend : (() => {
          const weekLocMap = new Map<string, Record<string, number>>();
          for (const row of opsData) {
            const week = row.week_start;
            if (!weekLocMap.has(week)) {
              weekLocMap.set(week, {});
            }
            const entry = weekLocMap.get(week)!;
            const loc = (row.location_name || row.location_id || "unknown").toLowerCase().replace(/[^a-z]/g, "");
            entry[loc] = row.google_reviews_avg || 0;
          }
          return Array.from(weekLocMap.entries()).map(([week, locs]) => ({
            week,
            ...locs,
          }));
        })();

        /* ── Consult funnel chart ── */
        const consultChart = isLoading || consultData.length === 0 ? mockConsultFunnel : consultData;

        /* ── Scorecard table from ops data ── */
        const scorecardTable = isLoading || opsData.length === 0 ? mockScorecardData : (() => {
          const locMap = new Map<string, {
            location: string;
            rating: number;
            reviews: number;
            complaints: number;
            count: number;
          }>();
          for (const row of opsData) {
            const name = row.location_name || row.location_id || "Unknown";
            if (!locMap.has(name)) {
              locMap.set(name, { location: name, rating: 0, reviews: 0, complaints: 0, count: 0 });
            }
            const entry = locMap.get(name)!;
            entry.rating += row.google_reviews_avg || 0;
            entry.reviews += row.google_reviews_count || 0;
            entry.complaints += row.complaints_count || 0;
            entry.count += 1;
          }
          return Array.from(locMap.values()).map((loc) => ({
            location: loc.location,
            rating: loc.count > 0 ? Number((loc.rating / loc.count).toFixed(1)) : 0,
            reviews: loc.reviews,
            complaints: loc.complaints,
            notes: "",
          }));
        })();

        /* ── Derive location keys for reviews lines ── */
        const reviewsLocationKeys = isLoading || opsData.length === 0
          ? ["sliema", "stjulians", "valletta", "mosta"]
          : (() => {
              const keys = new Set<string>();
              for (const row of opsData) {
                const loc = (row.location_name || row.location_id || "unknown").toLowerCase().replace(/[^a-z]/g, "");
                keys.add(loc);
              }
              return Array.from(keys).slice(0, 4);
            })();

        const lineColors = [chartColors.spa, chartColors.aesthetics, chartColors.slimming, "#8B5CF6"];

        return (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-charcoal">Operations Dashboard</h1>
              <ExportMenu pageTitle="Operations" kpiData={computedKpis as unknown as Record<string, unknown>[]} />
            </div>
            <ExecutiveSummary
              page="Operations"
              dateFrom={dateFrom}
              dateTo={dateTo}
              brandFilter={brandFilter}
              kpiSnapshot={computedKpis}
              isDataLoading={isLoading}
            />
            <KPICardRow kpis={computedKpis} lastUpdated={opsLastUpdated} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Google Reviews Trend</h2>
                  <FreshnessIndicator lastUpdated={opsLoading ? null : (opsData.length > 0 ? new Date(opsData[opsData.length - 1].week_start) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reviewsChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[4.0, 5.0]} />
                    <Tooltip />
                    <Legend />
                    {reviewsLocationKeys.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key.charAt(0).toUpperCase() + key.slice(1)}
                        stroke={lineColors[i % lineColors.length]}
                        strokeWidth={chartDefaults.strokeWidth}
                        dot={{ r: chartDefaults.dotRadius }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Consult Funnel</h2>
                  <FreshnessIndicator lastUpdated={consultLoading ? null : (consultData.length > 0 ? new Date(consultData[consultData.length - 1].week_start) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consultChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aesthetics" name="Aesthetics" fill={chartColors.aesthetics} />
                    <Bar dataKey="slimming" name="Slimming" fill={chartColors.slimming} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Location Scorecard</h2>
                <FreshnessIndicator lastUpdated={opsLoading ? null : (opsData.length > 0 ? new Date(opsData[opsData.length - 1].week_start) : null)} />
              </div>
              <DataTable columns={scorecardColumns} data={scorecardTable} />
            </Card>
          </>
        );
      }}
    </DashboardShell>
  );
}
