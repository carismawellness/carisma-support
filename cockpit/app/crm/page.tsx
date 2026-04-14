"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
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

interface CrmDaily {
  date: string;
  brand_id: number;
  leads: number;
  calls: number;
  appointments: number;
  sales: number;
  speed_to_lead_min: number;
  conversion_rate: number;
  deposit_pct: number;
  meta_leads: number;
  crm_leads: number;
}

interface CrmByRep {
  date: string;
  brand_id: number;
  rep_name: string;
  calls: number;
  bookings: number;
  conversions: number;
  conversion_rate: number;
  speed_to_lead_min: number;
}

const funnelColors = [chartColors.spa, chartColors.aesthetics, chartColors.slimming, "#8B5CF6"];

const repColumns = [
  { key: "rep_name", label: "Rep" },
  { key: "calls", label: "Calls", align: "right" as const, sortable: true },
  { key: "bookings", label: "Bookings", align: "right" as const, sortable: true },
  { key: "conversions", label: "Conversions", align: "right" as const, sortable: true },
  { key: "conversion_rate", label: "Conv. Rate", align: "right" as const, sortable: true, render: (v: unknown) => `${Number(v).toFixed(1)}%` },
  { key: "speed_to_lead_min", label: "STL", align: "right" as const, sortable: true, render: (v: unknown) => `${Number(v).toFixed(1)}m` },
];

export default function CRMPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: crmData, loading: crmLoading } = useKPIData<CrmDaily>({
          table: "crm_daily",
          dateFrom,
          dateTo,
          brandFilter,
          dateColumn: "date",
        });

        const { data: repData, loading: repLoading } = useKPIData<CrmByRep>({
          table: "crm_by_rep",
          dateFrom,
          dateTo,
          brandFilter,
          dateColumn: "date",
        });

        const loading = crmLoading || repLoading;

        // Aggregate CRM daily data
        const totalLeads = crmData.reduce((s, r) => s + (r.leads ?? 0), 0);
        const totalCalls = crmData.reduce((s, r) => s + (r.calls ?? 0), 0);
        const totalAppointments = crmData.reduce((s, r) => s + (r.appointments ?? 0), 0);
        const totalSales = crmData.reduce((s, r) => s + (r.sales ?? 0), 0);
        const avgConv = crmData.length > 0
          ? crmData.reduce((s, r) => s + (r.conversion_rate ?? 0), 0) / crmData.length
          : 0;
        const avgStl = crmData.length > 0
          ? crmData.reduce((s, r) => s + (r.speed_to_lead_min ?? 0), 0) / crmData.length
          : 0;
        const avgDeposit = crmData.length > 0
          ? crmData.reduce((s, r) => s + (r.deposit_pct ?? 0), 0) / crmData.length
          : 0;
        const totalMetaLeads = crmData.reduce((s, r) => s + (r.meta_leads ?? 0), 0);
        const totalCrmLeads = crmData.reduce((s, r) => s + (r.crm_leads ?? 0), 0);

        const kpis: KPIData[] = [
          { label: "Speed to Lead", value: loading ? "..." : `${avgStl.toFixed(1)}m`, target: "5m", targetValue: 5, currentValue: avgStl },
          { label: "Conversion Rate", value: loading ? "..." : `${avgConv.toFixed(1)}%`, target: "25%", targetValue: 25, currentValue: avgConv },
          { label: "Deposit %", value: loading ? "..." : `${avgDeposit.toFixed(0)}%` },
          { label: "Total Calls", value: loading ? "..." : String(totalCalls) },
          { label: "Meta vs CRM", value: loading ? "..." : `${totalMetaLeads}/${totalCrmLeads}` },
        ];

        // STL distribution buckets from raw data
        const stlBuckets = [
          { bucket: "<1m", min: 0, max: 1 },
          { bucket: "1-3m", min: 1, max: 3 },
          { bucket: "3-5m", min: 3, max: 5 },
          { bucket: "5-15m", min: 5, max: 15 },
          { bucket: "15-30m", min: 15, max: 30 },
          { bucket: "30m+", min: 30, max: Infinity },
        ];

        // For STL distribution, use the daily averages as an approximation
        // Each day's STL goes into a bucket weighted by the day's lead count
        const stlDistribution = stlBuckets.map((b) => ({
          bucket: b.bucket,
          count: crmData.filter(
            (r) => (r.speed_to_lead_min ?? 0) >= b.min && (r.speed_to_lead_min ?? 0) < b.max
          ).length,
        }));

        const funnelData = [
          { stage: "Leads", value: totalLeads },
          { stage: "Calls", value: totalCalls },
          { stage: "Appointments", value: totalAppointments },
          { stage: "Sales", value: totalSales },
        ];

        // Aggregate rep data: group by rep_name and sum
        const repAgg = repData.reduce<Record<string, { rep_name: string; calls: number; bookings: number; conversions: number; totalRate: number; totalStl: number; count: number }>>((acc, r) => {
          if (!acc[r.rep_name]) {
            acc[r.rep_name] = { rep_name: r.rep_name, calls: 0, bookings: 0, conversions: 0, totalRate: 0, totalStl: 0, count: 0 };
          }
          acc[r.rep_name].calls += r.calls ?? 0;
          acc[r.rep_name].bookings += r.bookings ?? 0;
          acc[r.rep_name].conversions += r.conversions ?? 0;
          acc[r.rep_name].totalRate += r.conversion_rate ?? 0;
          acc[r.rep_name].totalStl += r.speed_to_lead_min ?? 0;
          acc[r.rep_name].count += 1;
          return acc;
        }, {});

        const repTableData = Object.values(repAgg).map((r) => ({
          rep_name: r.rep_name,
          calls: r.calls,
          bookings: r.bookings,
          conversions: r.conversions,
          conversion_rate: r.count > 0 ? r.totalRate / r.count : 0,
          speed_to_lead_min: r.count > 0 ? r.totalStl / r.count : 0,
        }));

        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <KPICardRow kpis={kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Speed to Lead Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stlDistribution} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Leads" fill={chartColors.spa} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} layout="vertical" margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="stage" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Count">
                      {funnelData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={funnelColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rep Leaderboard</h2>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <DataTable columns={repColumns} data={repTableData} />
              )}
            </Card>
            <CIChat />
          </>
        );
      }}
    </DashboardShell>
  );
}
