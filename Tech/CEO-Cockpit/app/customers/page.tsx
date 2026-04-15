"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import { Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ── Static seed-derived KPIs ─────────────────────────────────── */

const kpis: KPIData[] = [
  { label: "Total Customers", value: "44" },
  { label: "Avg CLV", value: "€1,575", trend: 0 },
  { label: "Retention Rate", value: "77.3%", trend: 0, target: "80%", targetValue: 80, currentValue: 77.3 },
  { label: "Avg Visits", value: "6.8" },
];

/* ── CLV by Brand ─────────────────────────────────────────────── */

const clvByBrand = [
  { brand: "Spa", avgCLV: 774 },
  { brand: "Aesthetics", avgCLV: 2236 },
  { brand: "Slimming", avgCLV: 1546 },
];

/* ── Visit Frequency Distribution ─────────────────────────────── */

const visitDistribution = [
  { bucket: "1", count: 6 },
  { bucket: "2-3", count: 10 },
  { bucket: "4-6", count: 8 },
  { bucket: "7-10", count: 8 },
  { bucket: "10+", count: 12 },
];

/* ── Top 10 Customers ─────────────────────────────────────────── */

const topCustomerColumns = [
  { key: "name", label: "Name" },
  { key: "brand", label: "Brand" },
  { key: "location", label: "Location" },
  {
    key: "totalSpend",
    label: "Total Spend",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => formatCurrency(v as number),
  },
  { key: "visits", label: "Visits", align: "right" as const, sortable: true },
  { key: "lastVisit", label: "Last Visit" },
];

const topCustomers = [
  { name: "Simone Ellul", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 6200, visits: 16, lastVisit: "2026-04-08" },
  { name: "Francesca Brincat", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 5600, visits: 14, lastVisit: "2026-04-01" },
  { name: "Stephanie Azzopardi", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 4800, visits: 12, lastVisit: "2026-04-03" },
  { name: "Rosanne Caruana", brand: "Slimming", location: "Slimming Clinic", totalSpend: 4200, visits: 18, lastVisit: "2026-04-10" },
  { name: "Michelle Muscat", brand: "Slimming", location: "Slimming Clinic", totalSpend: 3600, visits: 15, lastVisit: "2026-04-05" },
  { name: "Daniela Buttigieg", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 3200, visits: 8, lastVisit: "2026-03-25" },
  { name: "Claudia Mallia", brand: "Slimming", location: "Slimming Clinic", totalSpend: 3000, visits: 13, lastVisit: "2026-04-11" },
  { name: "Elaine Bezzina", brand: "Slimming", location: "Slimming Clinic", totalSpend: 2800, visits: 12, lastVisit: "2026-03-30" },
  { name: "Lorraine Sammut", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 2800, visits: 7, lastVisit: "2026-03-20" },
  { name: "Vanessa Calleja", brand: "Aesthetics", location: "Aesthetics Clinic", totalSpend: 2400, visits: 6, lastVisit: "2026-04-09" },
];

export default function CustomersPage() {
  return (
    <DashboardShell>
      {() => (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Customer Retention &amp; CLV</h1>
          <KPICardRow kpis={kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CLV by Brand */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Avg CLV by Brand
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clvByBrand} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="avgCLV" name="Avg CLV" fill={chartColors.aesthetics} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Visit Frequency Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Visit Frequency Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitDistribution} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" label={{ value: "Visits", position: "insideBottom", offset: -2 }} />
                  <YAxis label={{ value: "Customers", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Customers" fill={chartColors.spa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Retention Cohort Placeholder */}
          <Card className="p-6">
            <div className="flex items-center gap-3 text-gray-500">
              <Info className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                Cohort analysis will be available when Fresha/Lapis integration is active.
                Once connected, this section will display monthly retention cohorts with
                drop-off rates per brand and location.
              </p>
            </div>
          </Card>

          {/* Top 10 Customers Table */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Customers by Lifetime Spend
            </h2>
            <DataTable columns={topCustomerColumns} data={topCustomers} />
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
