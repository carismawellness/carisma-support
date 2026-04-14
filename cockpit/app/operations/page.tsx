"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { DataTable } from "@/components/dashboard/DataTable";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults } from "@/lib/charts/config";
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

const kpis: KPIData[] = [
  { label: "Avg Google Rating", value: "4.6", trend: 1 },
  { label: "Complaints", value: "3", trend: -25 },
  { label: "Consult Conv Aes", value: "52%", trend: 4, target: "50%", targetValue: 50, currentValue: 52 },
  { label: "Show-up Slim", value: "83%", trend: -2, target: "85%", targetValue: 85, currentValue: 83 },
  { label: "AOV Aes", value: "€258", trend: 5, target: "€245", targetValue: 245, currentValue: 258 },
];

const reviewsTrend = [
  { week: "Week 1", sliema: 4.7, stjulians: 4.5, valletta: 4.6, mosta: 4.4 },
  { week: "Week 2", sliema: 4.6, stjulians: 4.6, valletta: 4.5, mosta: 4.5 },
  { week: "Week 3", sliema: 4.7, stjulians: 4.5, valletta: 4.7, mosta: 4.4 },
  { week: "Week 4", sliema: 4.8, stjulians: 4.6, valletta: 4.6, mosta: 4.5 },
];

const consultFunnel = [
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

const scorecardData = [
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
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
          <KPICardRow kpis={kpis} />
          <ExecutiveSummary department="operations" dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />

          <ErrorBoundary>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Google Reviews Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reviewsTrend} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[4.0, 5.0]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sliema" name="Sliema" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="stjulians" name="St Julian's" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="valletta" name="Valletta" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="mosta" name="Mosta" stroke="#8B5CF6" strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Consult Funnel</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consultFunnel} margin={chartDefaults.margin}>
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
          </ErrorBoundary>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Location Scorecard</h2>
            <DataTable columns={scorecardColumns} data={scorecardData} />
          </Card>
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
