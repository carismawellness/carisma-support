"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
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

const kpis: KPIData[] = [
  { label: "EBITDA", value: "€18,200", trend: 6 },
  { label: "Rev vs Budget", value: "+4.2%", trend: 4 },
  { label: "Company HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Marketing ROI", value: "5.2x", trend: 3 },
  { label: "Budget Variance", value: "-2.1%", trend: 2 },
];

const ebitdaData = [
  { month: "Jan", spa: 6200, aesthetics: 4800, slimming: 3400 },
  { month: "Feb", spa: 6500, aesthetics: 5100, slimming: 3600 },
  { month: "Mar", spa: 6800, aesthetics: 5400, slimming: 3800 },
  { month: "Apr", spa: 7200, aesthetics: 5800, slimming: 4100 },
];

const budgetActualData = [
  { department: "Marketing", budget: 5000, actual: 4820 },
  { department: "Operations", budget: 12000, actual: 12400 },
  { department: "HR", budget: 8500, actual: 8200 },
  { department: "Admin", budget: 3000, actual: 3150 },
];

const locationColumns = [
  { key: "location", label: "Location" },
  { key: "revenue", label: "Revenue", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
  { key: "yoy", label: "YoY %", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
  { key: "hc", label: "HC%", align: "right" as const, sortable: true, render: (v: unknown) => `${v}%` },
];

const locationData = [
  { location: "Sliema", revenue: 9200, yoy: 12, hc: 42.1 },
  { location: "St Julian's", revenue: 8400, yoy: 8, hc: 38.5 },
  { location: "Valletta", revenue: 7600, yoy: 15, hc: 36.2 },
  { location: "Mosta", revenue: 6200, yoy: 5, hc: 40.8 },
  { location: "Qormi", revenue: 5800, yoy: -2, hc: 35.4 },
  { location: "Fgura", revenue: 5150, yoy: 3, hc: 37.1 },
];

export default function FinancePage() {
  return (
    <DashboardShell>
      {() => (
        <>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <KPICardRow kpis={kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">EBITDA Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ebitdaData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="spa" name="Spa" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="aesthetics" name="Aesthetics" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="slimming" name="Slimming" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetActualData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill={chartColors.budget} />
                  <Bar dataKey="actual" name="Actual" fill={chartColors.spa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Location</h2>
            <DataTable columns={locationColumns} data={locationData} />
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
