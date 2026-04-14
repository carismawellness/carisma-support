"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency, formatPercent } from "@/lib/charts/config";
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
  ReferenceLine,
} from "recharts";

interface SalesWeekly {
  week_start: string;
  location_id: number;
  brand_id: number;
  revenue_ex_vat: number;
  revenue_yoy_delta_pct: number;
  retail_pct: number;
  addon_pct: number;
  hotel_capture_pct: number;
}

const locationNames: Record<number, string> = {
  1: "InterContinental",
  2: "Hugo's",
  3: "Hyatt",
  4: "Ramla Bay",
  5: "Labranda",
  6: "Odycy",
  7: "Novotel",
  8: "Excelsior",
  9: "Aesthetics Clinic",
  10: "Slimming Clinic",
};

const locationColumns = [
  { key: "location", label: "Location" },
  { key: "revenue", label: "Revenue", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  { key: "yoy", label: "YoY%", align: "right" as const, sortable: true, render: (v: unknown) => formatPercent(v as number) },
  { key: "retail", label: "Retail%", align: "right" as const, sortable: true, render: (v: unknown) => formatPercent(v as number) },
  { key: "addon", label: "Add-on%", align: "right" as const, sortable: true, render: (v: unknown) => formatPercent(v as number) },
  { key: "hotelCapture", label: "Hotel Capture%", align: "right" as const, sortable: true, render: (v: unknown) => formatPercent(v as number) },
];

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: salesData, loading } = useKPIData<SalesWeekly>({
          table: "sales_weekly",
          dateFrom,
          dateTo,
          brandFilter,
          dateColumn: "week_start",
        });

        // Aggregate by location
        const byLocation = salesData.reduce<
          Record<number, { revenue: number; yoySum: number; retailSum: number; addonSum: number; hotelSum: number; count: number }>
        >((acc, row) => {
          const lid = row.location_id;
          if (!acc[lid]) {
            acc[lid] = { revenue: 0, yoySum: 0, retailSum: 0, addonSum: 0, hotelSum: 0, count: 0 };
          }
          acc[lid].revenue += row.revenue_ex_vat ?? 0;
          acc[lid].yoySum += row.revenue_yoy_delta_pct ?? 0;
          acc[lid].retailSum += row.retail_pct ?? 0;
          acc[lid].addonSum += row.addon_pct ?? 0;
          acc[lid].hotelSum += row.hotel_capture_pct ?? 0;
          acc[lid].count += 1;
          return acc;
        }, {});

        const locationData = Object.entries(byLocation).map(([id, d]) => ({
          locationId: Number(id),
          location: locationNames[Number(id)] ?? `Location ${id}`,
          revenue: d.revenue,
          yoy: d.count > 0 ? d.yoySum / d.count : 0,
          retail: d.count > 0 ? d.retailSum / d.count : 0,
          addon: d.count > 0 ? d.addonSum / d.count : 0,
          hotelCapture: d.count > 0 ? d.hotelSum / d.count : 0,
        }));

        // Global KPIs
        const totalRevenue = salesData.reduce((s, r) => s + (r.revenue_ex_vat ?? 0), 0);
        const avgYoy = salesData.length > 0
          ? salesData.reduce((s, r) => s + (r.revenue_yoy_delta_pct ?? 0), 0) / salesData.length
          : 0;
        const avgRetail = salesData.length > 0
          ? salesData.reduce((s, r) => s + (r.retail_pct ?? 0), 0) / salesData.length
          : 0;
        const avgAddon = salesData.length > 0
          ? salesData.reduce((s, r) => s + (r.addon_pct ?? 0), 0) / salesData.length
          : 0;
        const avgHotel = salesData.length > 0
          ? salesData.reduce((s, r) => s + (r.hotel_capture_pct ?? 0), 0) / salesData.length
          : 0;

        const kpis: KPIData[] = [
          { label: "Total Revenue", value: loading ? "..." : formatCurrency(totalRevenue) },
          { label: "YoY Growth", value: loading ? "..." : formatPercent(avgYoy) },
          { label: "Retail %", value: loading ? "..." : formatPercent(avgRetail), target: "12%", targetValue: 12, currentValue: avgRetail },
          { label: "Add-on %", value: loading ? "..." : formatPercent(avgAddon), target: "4%", targetValue: 4, currentValue: avgAddon },
          { label: "Hotel Capture %", value: loading ? "..." : formatPercent(avgHotel), target: "5%", targetValue: 5, currentValue: avgHotel },
        ];

        // Chart data sorted by location id
        const chartData = [...locationData].sort((a, b) => a.locationId - b.locationId);

        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            <KPICardRow kpis={kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Location</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="revenue" name="Revenue" fill={chartColors.spa} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">YoY Delta by Location</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(v) => formatPercent(Number(v))} />
                    <ReferenceLine y={0} stroke={chartColors.target} strokeDasharray="3 3" label="0%" />
                    <Bar dataKey="yoy" name="YoY %" fill={chartColors.aesthetics} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Retail % by Location</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(v) => formatPercent(Number(v))} />
                    <ReferenceLine y={12} stroke={chartColors.target} strokeDasharray="3 3" label="Target 12%" />
                    <Bar dataKey="retail" name="Retail %" fill={chartColors.slimming} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add-on % by Location</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={chartDefaults.margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(v) => formatPercent(Number(v))} />
                    <ReferenceLine y={4} stroke={chartColors.target} strokeDasharray="3 3" label="Target 4%" />
                    <Bar dataKey="addon" name="Add-on %" fill={chartColors.spa} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Scorecard</h2>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <DataTable columns={locationColumns} data={locationData} />
              )}
            </Card>
            <CIChat />
          </>
        );
      }}
    </DashboardShell>
  );
}
