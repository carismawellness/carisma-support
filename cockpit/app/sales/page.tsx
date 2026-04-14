"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { FreshnessIndicator } from "@/components/dashboard/FreshnessIndicator";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatMinutes, formatPercent } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { ExportMenu } from "@/components/dashboard/ExportMenu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ── Mock fallbacks ────────────────────────────────────────── */

const mockKpis: KPIData[] = [
  { label: "Speed to Lead", value: "4.2m", trend: 5, trendMoM: 10, target: "5m", targetValue: 5, currentValue: 4.2, sparkline: [5.8, 5.1, 4.6, 4.2], lowerIsBetter: true },
  { label: "Conversion Rate", value: "27.3%", trend: 2, trendMoM: 4, target: "25%", targetValue: 25, currentValue: 27.3, sparkline: [24.5, 25.8, 26.9, 27.3] },
  { label: "Deposit %", value: "68%", trend: 4, sparkline: [60, 63, 66, 68] },
  { label: "Total Calls", value: "342", trend: 12, sparkline: [280, 305, 325, 342] },
  { label: "Appointments", value: "198", trend: 8, sparkline: [165, 175, 188, 198] },
];

const mockStlDistribution = [
  { bucket: "<1m", count: 48 },
  { bucket: "1-3m", count: 82 },
  { bucket: "3-5m", count: 65 },
  { bucket: "5-15m", count: 42 },
  { bucket: "15-30m", count: 18 },
  { bucket: "30m+", count: 8 },
];

const mockFunnelData = [
  { stage: "Leads", value: 525 },
  { stage: "Calls", value: 342 },
  { stage: "Appointments", value: 198 },
  { stage: "Sales", value: 143 },
];

const funnelColors = [chartColors.spa, chartColors.aesthetics, chartColors.slimming, "#8B5CF6"];

const repColumns = [
  { key: "rep", label: "Rep" },
  { key: "calls", label: "Calls", align: "right" as const, sortable: true },
  { key: "bookings", label: "Bookings", align: "right" as const, sortable: true },
  { key: "conversions", label: "Conversions", align: "right" as const, sortable: true },
  { key: "rate", label: "Conv. Rate", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
  { key: "stl", label: "STL", align: "right" as const, sortable: true, render: (v: unknown) => `${v}m` },
];

const mockRepData = [
  { rep: "Maria C.", calls: 98, bookings: 52, conversions: 38, rate: 38.8, stl: 2.1 },
  { rep: "Diane S.", calls: 92, bookings: 48, conversions: 35, rate: 38.0, stl: 3.4 },
  { rep: "Jake T.", calls: 85, bookings: 44, conversions: 28, rate: 32.9, stl: 4.8 },
  { rep: "Anna R.", calls: 67, bookings: 32, conversions: 22, rate: 32.8, stl: 5.2 },
];

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: crmData, loading: crmLoading, lastUpdated: crmLastUpdated } = useKPIData<{
          date: string;
          speed_to_lead_median_min: number;
          conversion_rate_pct: number;
          total_calls: number;
          appointments_booked: number;
          total_leads: number;
        }>({ table: "crm_daily", dateFrom, dateTo, brandFilter });

        const { data: repData, loading: repLoading } = useKPIData<{
          date: string;
          rep: string;
          calls: number;
          bookings: number;
          conversions: number;
          rate: number;
          stl: number;
        }>({ table: "crm_by_rep", dateFrom, dateTo, brandFilter });

        const { data: stlData, loading: stlLoading } = useKPIData<{
          date: string;
          bucket: string;
          count: number;
        }>({ table: "speed_to_lead_distribution", dateFrom, dateTo, brandFilter });

        const isLoading = crmLoading || repLoading || stlLoading;

        /* ── Compute KPIs ── */
        const avgStl = crmData.length > 0
          ? crmData.reduce((s, r) => s + (r.speed_to_lead_median_min || 0), 0) / crmData.length
          : 0;
        const avgConv = crmData.length > 0
          ? crmData.reduce((s, r) => s + (r.conversion_rate_pct || 0), 0) / crmData.length
          : 0;
        const totalCalls = crmData.reduce((s, r) => s + (r.total_calls || 0), 0);
        const totalAppointments = crmData.reduce((s, r) => s + (r.appointments_booked || 0), 0);

        const computedKpis: KPIData[] = isLoading || crmData.length === 0 ? mockKpis : [
          {
            label: "Speed to Lead",
            value: formatMinutes(avgStl),
            target: "5m",
            targetValue: 5,
            currentValue: avgStl,
          },
          {
            label: "Conversion Rate",
            value: formatPercent(avgConv),
            target: "25%",
            targetValue: 25,
            currentValue: avgConv,
          },
          { label: "Deposit %", value: "—" },
          { label: "Total Calls", value: totalCalls.toLocaleString() },
          { label: "Appointments", value: totalAppointments.toLocaleString() },
        ];

        /* ── STL Distribution chart ── */
        const stlChart = isLoading || stlData.length === 0 ? mockStlDistribution : stlData;

        /* ── Funnel chart ── */
        const totalLeads = crmData.reduce((s, r) => s + (r.total_leads || 0), 0);
        const funnelChart = isLoading || crmData.length === 0 ? mockFunnelData : [
          { stage: "Leads", value: totalLeads },
          { stage: "Calls", value: totalCalls },
          { stage: "Appointments", value: totalAppointments },
          { stage: "Sales", value: Math.round(totalAppointments * (avgConv / 100)) },
        ];

        /* ── Rep leaderboard ── */
        const repTableData = isLoading || repData.length === 0 ? mockRepData : repData;

        return (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-charcoal">Sales / CRM Dashboard</h1>
              <ExportMenu pageTitle="Sales" kpiData={computedKpis as unknown as Record<string, unknown>[]} />
            </div>
            <ExecutiveSummary
              page="Sales"
              dateFrom={dateFrom}
              dateTo={dateTo}
              brandFilter={brandFilter}
              kpiSnapshot={computedKpis}
              isDataLoading={isLoading}
            />
            <KPICardRow kpis={computedKpis} lastUpdated={crmLastUpdated} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Speed to Lead Distribution</h2>
                  <FreshnessIndicator lastUpdated={stlLoading ? null : (stlData.length > 0 ? new Date(stlData[stlData.length - 1].date) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stlChart} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Leads" fill={chartColors.spa} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Conversion Funnel</h2>
                  <FreshnessIndicator lastUpdated={crmLoading ? null : (crmData.length > 0 ? new Date(crmData[crmData.length - 1].date) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelChart} layout="vertical" margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="stage" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Count">
                      {funnelChart.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={funnelColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Rep Leaderboard</h2>
                <FreshnessIndicator lastUpdated={repLoading ? null : (repData.length > 0 ? new Date(repData[repData.length - 1].date) : null)} />
              </div>
              <DataTable columns={repColumns} data={repTableData} />
            </Card>
          </>
        );
      }}
    </DashboardShell>
  );
}
