"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { FreshnessIndicator } from "@/components/dashboard/FreshnessIndicator";
import { DataTable } from "@/components/dashboard/DataTable";
import { RevenueForecast } from "@/components/dashboard/RevenueForecast";
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
  { label: "EBITDA", value: "€18,200", trend: 6, trendMoM: 10, sparkline: [15400, 16200, 17500, 18200] },
  { label: "Rev vs Budget", value: "+4.2%", trend: 4, sparkline: [1.8, 2.5, 3.6, 4.2] },
  { label: "Company HC%", value: "38.2%", trend: -1, trendMoM: -3, target: "40%", targetValue: 40, currentValue: 38.2, sparkline: [41.0, 39.8, 38.9, 38.2], lowerIsBetter: true },
  { label: "Marketing ROI", value: "5.2x", trend: 3, sparkline: [4.6, 4.9, 5.0, 5.2] },
  { label: "Budget Variance", value: "-2.1%", trend: 2, trendMoM: 5, sparkline: [-4.5, -3.8, -2.9, -2.1], lowerIsBetter: true },
];

const mockEbitdaData = [
  { month: "Jan", spa: 6200, aesthetics: 4800, slimming: 3400 },
  { month: "Feb", spa: 6500, aesthetics: 5100, slimming: 3600 },
  { month: "Mar", spa: 6800, aesthetics: 5400, slimming: 3800 },
  { month: "Apr", spa: 7200, aesthetics: 5800, slimming: 4100 },
];

const mockBudgetActualData = [
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

const mockLocationData = [
  { location: "Sliema", revenue: 9200, yoy: 12, hc: 42.1 },
  { location: "St Julian's", revenue: 8400, yoy: 8, hc: 38.5 },
  { location: "Valletta", revenue: 7600, yoy: 15, hc: 36.2 },
  { location: "Mosta", revenue: 6200, yoy: 5, hc: 40.8 },
  { location: "Qormi", revenue: 5800, yoy: -2, hc: 35.4 },
  { location: "Fgura", revenue: 5150, yoy: 3, hc: 37.1 },
];

/* ── Brand ID mapping ──────────────────────────────────────── */

const brandNameMap: Record<number, string> = { 1: "spa", 2: "aesthetics", 3: "slimming" };

export default function FinancePage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => {
        const { data: ebitdaData, loading: ebitdaLoading, lastUpdated: ebitdaLastUpdated } = useKPIData<{
          month: string;
          revenue: number;
          ebitda: number;
          ebitda_margin_pct: number;
          brand_id: number;
        }>({ table: "ebitda_monthly", dateFrom, dateTo, brandFilter, dateColumn: "month" });

        const { data: budgetData, loading: budgetLoading } = useKPIData<{
          month: string;
          department: string;
          budget: number;
          actual: number;
        }>({ table: "budget_vs_actual", dateFrom, dateTo, brandFilter, dateColumn: "month" });

        const { data: salesData, loading: salesLoading } = useKPIData<{
          week_start: string;
          revenue_ex_vat: number;
          location_id: string;
          location_name: string;
        }>({ table: "sales_weekly", dateFrom, dateTo, brandFilter, dateColumn: "week_start" });

        const isLoading = ebitdaLoading || budgetLoading || salesLoading;

        /* ── Compute KPIs ── */
        const totalRevenue = ebitdaData.reduce((s, r) => s + (r.revenue || 0), 0);
        const totalEbitda = ebitdaData.reduce((s, r) => s + (r.ebitda || 0), 0);
        const ebitdaMargin = totalRevenue > 0 ? (totalEbitda / totalRevenue) * 100 : 0;
        const totalBudget = budgetData.reduce((s, r) => s + (r.budget || 0), 0);
        const totalActual = budgetData.reduce((s, r) => s + (r.actual || 0), 0);
        const budgetVariance = totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0;

        const computedKpis: KPIData[] = isLoading || ebitdaData.length === 0 ? mockKpis : [
          { label: "Revenue", value: formatCurrency(totalRevenue) },
          { label: "EBITDA", value: formatCurrency(totalEbitda) },
          {
            label: "EBITDA Margin",
            value: formatPercent(ebitdaMargin),
          },
          {
            label: "Budget Variance",
            value: `${budgetVariance >= 0 ? "+" : ""}${budgetVariance.toFixed(1)}%`,
          },
        ];

        /* ── EBITDA trend chart ── */
        const ebitdaChart = isLoading || ebitdaData.length === 0 ? mockEbitdaData : (() => {
          const monthMap = new Map<string, { month: string; spa: number; aesthetics: number; slimming: number }>();
          for (const row of ebitdaData) {
            const key = row.month;
            if (!monthMap.has(key)) {
              monthMap.set(key, { month: key, spa: 0, aesthetics: 0, slimming: 0 });
            }
            const entry = monthMap.get(key)!;
            const brand = brandNameMap[row.brand_id] as "spa" | "aesthetics" | "slimming";
            if (brand) entry[brand] += row.ebitda || 0;
          }
          return Array.from(monthMap.values());
        })();

        /* ── Budget vs Actual chart ── */
        const budgetChart = isLoading || budgetData.length === 0 ? mockBudgetActualData : (() => {
          const deptMap = new Map<string, { department: string; budget: number; actual: number }>();
          for (const row of budgetData) {
            if (!deptMap.has(row.department)) {
              deptMap.set(row.department, { department: row.department, budget: 0, actual: 0 });
            }
            const entry = deptMap.get(row.department)!;
            entry.budget += row.budget || 0;
            entry.actual += row.actual || 0;
          }
          return Array.from(deptMap.values());
        })();

        /* ── Location revenue table ── */
        const locationTable = isLoading || salesData.length === 0 ? mockLocationData : (() => {
          const locMap = new Map<string, { location: string; revenue: number }>();
          for (const row of salesData) {
            const name = row.location_name || row.location_id || "Unknown";
            if (!locMap.has(name)) {
              locMap.set(name, { location: name, revenue: 0 });
            }
            locMap.get(name)!.revenue += row.revenue_ex_vat || 0;
          }
          return Array.from(locMap.values()).map((loc) => ({
            ...loc,
            yoy: 0,  // YoY requires prior period data — keep as 0 for now
            hc: 0,   // HC% comes from hr_weekly — keep as 0 for now
          }));
        })();

        return (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-charcoal">Finance Dashboard</h1>
              <ExportMenu pageTitle="Finance" kpiData={computedKpis as unknown as Record<string, unknown>[]} />
            </div>
            <ExecutiveSummary
              page="Finance"
              dateFrom={dateFrom}
              dateTo={dateTo}
              brandFilter={brandFilter}
              kpiSnapshot={computedKpis}
              isDataLoading={isLoading}
            />
            <KPICardRow kpis={computedKpis} lastUpdated={ebitdaLastUpdated} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">EBITDA Trend</h2>
                  <FreshnessIndicator lastUpdated={ebitdaLoading ? null : (ebitdaData.length > 0 ? new Date(ebitdaData[ebitdaData.length - 1].month) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ebitdaChart} margin={chartDefaults.margin}>
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

              <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-charcoal">Budget vs Actual</h2>
                  <FreshnessIndicator lastUpdated={budgetLoading ? null : (budgetData.length > 0 ? new Date(budgetData[budgetData.length - 1].month) : null)} />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetChart} margin={chartDefaults.margin}>
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

            <RevenueForecast
              salesData={salesData}
              loading={salesLoading}
            />

            <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal">Revenue by Location</h2>
                <FreshnessIndicator lastUpdated={salesLoading ? null : (salesData.length > 0 ? new Date(salesData[salesData.length - 1].week_start) : null)} />
              </div>
              <DataTable columns={locationColumns} data={locationTable} />
            </Card>
          </>
        );
      }}
    </DashboardShell>
  );
}
