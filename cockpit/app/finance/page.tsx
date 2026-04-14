"use client";

import { useMemo } from "react";
import { subYears, format } from "date-fns";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
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
  ReferenceLine,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types for Supabase rows                                           */
/* ------------------------------------------------------------------ */

interface EbitdaRow {
  month: string;
  brand_id: number;
  revenue: number;
  ebitda: number;
}

interface BudgetRow {
  month: string;
  brand_id: number;
  department: string;
  budgeted: number;
  actual: number;
  variance_pct: number;
}

interface SalesRow {
  week_start: string;
  location_id: number;
  brand_id: number;
  revenue_ex_vat: number;
}

interface HrRow {
  week_start: string;
  location_id: number;
  brand_id: number;
  hc_pct: number;
  total_salary_cost: number;
  revenue: number;
}

interface LocationRow {
  id: number;
  slug: string;
  name: string;
  opened_date: string | null;
}

/* ------------------------------------------------------------------ */
/*  Brand ID → name map                                               */
/* ------------------------------------------------------------------ */

const BRAND_NAMES: Record<number, string> = { 1: "spa", 2: "aesthetics", 3: "slimming" };

/* ------------------------------------------------------------------ */
/*  Inner component — can call hooks                                   */
/* ------------------------------------------------------------------ */

function FinanceContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* --- Prior-year date range for YoY -------------------------------- */
  const priorFrom = useMemo(() => subYears(dateFrom, 1), [dateFrom]);
  const priorTo = useMemo(() => subYears(dateTo, 1), [dateTo]);

  /* --- Data hooks --------------------------------------------------- */
  const { data: ebitdaData, loading: ebitdaLoading } = useKPIData<EbitdaRow>({
    table: "ebitda_monthly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "month",
  });

  const { data: budgetData, loading: budgetLoading } = useKPIData<BudgetRow>({
    table: "budget_vs_actual",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "month",
  });

  const { data: salesData, loading: salesLoading } = useKPIData<SalesRow>({
    table: "sales_weekly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: priorSalesData, loading: priorSalesLoading } = useKPIData<SalesRow>({
    table: "sales_weekly",
    dateFrom: priorFrom,
    dateTo: priorTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: hrData, loading: hrLoading } = useKPIData<HrRow>({
    table: "hr_weekly",
    dateFrom,
    dateTo,
    brandFilter,
    dateColumn: "week_start",
  });

  const { data: locationsData, loading: locationsLoading } = useKPIData<LocationRow>({
    table: "locations",
    dateFrom: new Date("2000-01-01"),
    dateTo: new Date("2099-12-31"),
    brandFilter: null,
    dateColumn: "opened_date",
  });

  const loading =
    ebitdaLoading ||
    budgetLoading ||
    salesLoading ||
    priorSalesLoading ||
    hrLoading ||
    locationsLoading;

  /* --- Derived: location name map ----------------------------------- */
  const locationMap = useMemo(() => {
    const map = new Map<number, LocationRow>();
    for (const loc of locationsData) {
      map.set(loc.id, loc);
    }
    return map;
  }, [locationsData]);

  /* --- Derived: revenue per location (current & prior) -------------- */
  const revenueByLocation = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of salesData) {
      map.set(row.location_id, (map.get(row.location_id) ?? 0) + Number(row.revenue_ex_vat));
    }
    return map;
  }, [salesData]);

  const priorRevenueByLocation = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of priorSalesData) {
      map.set(row.location_id, (map.get(row.location_id) ?? 0) + Number(row.revenue_ex_vat));
    }
    return map;
  }, [priorSalesData]);

  /* --- Derived: HC% per location (latest) --------------------------- */
  const hcByLocation = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of hrData) {
      // Take the latest value per location (data is sorted ascending by week_start)
      map.set(row.location_id, Number(row.hc_pct));
    }
    return map;
  }, [hrData]);

  /* --- Derived: salary cost per location ---------------------------- */
  const salaryCostByLocation = useMemo(() => {
    const map = new Map<number, number>();
    for (const row of hrData) {
      map.set(row.location_id, (map.get(row.location_id) ?? 0) + Number(row.total_salary_cost));
    }
    return map;
  }, [hrData]);

  /* --- Location revenue table data ---------------------------------- */
  const locationTableData = useMemo(() => {
    const rows: { location: string; revenue: number; yoy: number; hc: number }[] = [];
    for (const [locId, revenue] of revenueByLocation) {
      const loc = locationMap.get(locId);
      const priorRevenue = priorRevenueByLocation.get(locId);
      const yoy =
        priorRevenue && priorRevenue > 0
          ? ((revenue - priorRevenue) / priorRevenue) * 100
          : 0;
      const hc = hcByLocation.get(locId) ?? 0;
      rows.push({
        location: loc?.name ?? `Location ${locId}`,
        revenue,
        yoy: Math.round(yoy * 10) / 10,
        hc: Math.round(hc * 10) / 10,
      });
    }
    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [revenueByLocation, priorRevenueByLocation, hcByLocation, locationMap]);

  /* --- EBITDA trend chart data -------------------------------------- */
  const ebitdaChartData = useMemo(() => {
    const byMonth = new Map<string, Record<string, string | number>>();
    for (const row of ebitdaData) {
      const month = format(new Date(row.month), "MMM");
      const brand = BRAND_NAMES[row.brand_id] ?? "other";
      const entry = byMonth.get(month) ?? ({ month } as Record<string, string | number>);
      entry[brand] = Number(row.ebitda);
      byMonth.set(month, entry);
    }
    return Array.from(byMonth.values());
  }, [ebitdaData]);

  /* --- Budget vs Actual chart data (uses correct `budgeted` column) - */
  const budgetChartData = useMemo(() => {
    const byDept = new Map<string, { department: string; budgeted: number; actual: number }>();
    for (const row of budgetData) {
      const existing = byDept.get(row.department);
      if (existing) {
        existing.budgeted += Number(row.budgeted);
        existing.actual += Number(row.actual);
      } else {
        byDept.set(row.department, {
          department: row.department,
          budgeted: Number(row.budgeted),
          actual: Number(row.actual),
        });
      }
    }
    return Array.from(byDept.values());
  }, [budgetData]);

  /* --- KPI cards ---------------------------------------------------- */
  const kpis = useMemo<KPIData[]>(() => {
    const totalEbitda = ebitdaData.reduce((sum, r) => sum + Number(r.ebitda), 0);
    const totalRevenue = salesData.reduce((sum, r) => sum + Number(r.revenue_ex_vat), 0);
    const totalBudgeted = budgetData.reduce((sum, r) => sum + Number(r.budgeted), 0);
    const totalActual = budgetData.reduce((sum, r) => sum + Number(r.actual), 0);
    const budgetVariance =
      totalBudgeted > 0 ? ((totalActual - totalBudgeted) / totalBudgeted) * 100 : 0;
    const revVsBudget =
      totalBudgeted > 0 ? ((totalRevenue - totalBudgeted) / totalBudgeted) * 100 : 0;

    const latestHcValues = Array.from(hcByLocation.values());
    const avgHc =
      latestHcValues.length > 0
        ? latestHcValues.reduce((s, v) => s + v, 0) / latestHcValues.length
        : 0;

    return [
      { label: "EBITDA", value: formatCurrency(totalEbitda), trend: 0 },
      {
        label: "Rev vs Budget",
        value: `${revVsBudget >= 0 ? "+" : ""}${revVsBudget.toFixed(1)}%`,
        trend: revVsBudget > 0 ? 1 : revVsBudget < 0 ? -1 : 0,
      },
      {
        label: "Company HC%",
        value: formatPercent(avgHc),
        trend: avgHc < 40 ? 1 : -1,
        target: "40%",
        targetValue: 40,
        currentValue: avgHc,
      },
      {
        label: "Budget Variance",
        value: `${budgetVariance >= 0 ? "+" : ""}${budgetVariance.toFixed(1)}%`,
        trend: budgetVariance < 0 ? 1 : budgetVariance > 0 ? -1 : 0,
      },
    ];
  }, [ebitdaData, salesData, budgetData, hcByLocation]);

  /* --- SSG: Same-Store Growth chart data ----------------------------- */
  const ssgChartData = useMemo(() => {
    const cutoffDate = subYears(dateTo, 1);

    // Determine mature location IDs
    const matureIds = new Set<number>();
    for (const loc of locationsData) {
      if (loc.opened_date && new Date(loc.opened_date) <= cutoffDate) {
        matureIds.add(loc.id);
      }
    }

    // Group current sales by month
    const totalByMonth = new Map<string, number>();
    const matureByMonth = new Map<string, number>();
    for (const row of salesData) {
      const month = format(new Date(row.week_start), "yyyy-MM");
      const rev = Number(row.revenue_ex_vat);
      totalByMonth.set(month, (totalByMonth.get(month) ?? 0) + rev);
      if (matureIds.has(row.location_id)) {
        matureByMonth.set(month, (matureByMonth.get(month) ?? 0) + rev);
      }
    }

    // Group prior sales by month
    const priorTotalByMonth = new Map<string, number>();
    const priorMatureByMonth = new Map<string, number>();
    for (const row of priorSalesData) {
      // Shift the prior month forward 1 year for alignment
      const adjustedDate = new Date(row.week_start);
      adjustedDate.setFullYear(adjustedDate.getFullYear() + 1);
      const month = format(adjustedDate, "yyyy-MM");
      const rev = Number(row.revenue_ex_vat);
      priorTotalByMonth.set(month, (priorTotalByMonth.get(month) ?? 0) + rev);
      if (matureIds.has(row.location_id)) {
        priorMatureByMonth.set(month, (priorMatureByMonth.get(month) ?? 0) + rev);
      }
    }

    // Build chart series
    const months = Array.from(totalByMonth.keys()).sort();
    return months.map((month) => {
      const totalCurrent = totalByMonth.get(month) ?? 0;
      const totalPrior = priorTotalByMonth.get(month) ?? 0;
      const matureCurrent = matureByMonth.get(month) ?? 0;
      const maturePrior = priorMatureByMonth.get(month) ?? 0;

      const totalGrowth =
        totalPrior > 0 ? ((totalCurrent - totalPrior) / totalPrior) * 100 : 0;
      const ssg =
        maturePrior > 0 ? ((matureCurrent - maturePrior) / maturePrior) * 100 : 0;

      return {
        month: format(new Date(month + "-01"), "MMM yyyy"),
        totalGrowth: Math.round(totalGrowth * 10) / 10,
        ssg: Math.round(ssg * 10) / 10,
      };
    });
  }, [salesData, priorSalesData, locationsData, dateTo]);

  /* --- Mature vs New location labels -------------------------------- */
  const locationMaturityInfo = useMemo(() => {
    const cutoffDate = subYears(dateTo, 1);
    const info: { name: string; status: "Mature" | "New" }[] = [];
    for (const loc of locationsData) {
      const isMature = loc.opened_date && new Date(loc.opened_date) <= cutoffDate;
      info.push({ name: loc.name, status: isMature ? "Mature" : "New" });
    }
    return info;
  }, [locationsData, dateTo]);

  /* --- Contribution Margin per location ----------------------------- */
  const contributionMarginData = useMemo(() => {
    const rows: {
      location: string;
      revenue: number;
      salaryCost: number;
      margin: number;
      marginPct: number;
    }[] = [];

    for (const [locId, revenue] of revenueByLocation) {
      const loc = locationMap.get(locId);
      const salaryCost = salaryCostByLocation.get(locId) ?? 0;
      const margin = revenue - salaryCost;
      const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

      rows.push({
        location: loc?.name ?? `Location ${locId}`,
        revenue,
        salaryCost,
        margin,
        marginPct: Math.round(marginPct * 10) / 10,
      });
    }

    return rows.sort((a, b) => b.marginPct - a.marginPct);
  }, [revenueByLocation, salaryCostByLocation, locationMap]);

  /* --- Table columns ------------------------------------------------ */
  const locationColumns = [
    { key: "location", label: "Location" },
    {
      key: "revenue",
      label: "Revenue",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => formatCurrency(v as number),
    },
    {
      key: "yoy",
      label: "YoY %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => `${v}%`,
    },
    {
      key: "hc",
      label: "HC%",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => `${v}%`,
    },
  ];

  /* --- Margin bar color helper -------------------------------------- */
  function getMarginColor(pct: number): string {
    if (pct > 20) return "#22C55E";
    if (pct >= 10) return "#F59E0B";
    return "#EF4444";
  }

  /* --- Render ------------------------------------------------------- */
  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-500">Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
      <KPICardRow kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EBITDA Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">EBITDA Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ebitdaChartData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="spa"
                name="Spa"
                stroke={chartColors.spa}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
              <Line
                type="monotone"
                dataKey="aesthetics"
                name="Aesthetics"
                stroke={chartColors.aesthetics}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
              <Line
                type="monotone"
                dataKey="slimming"
                name="Slimming"
                stroke={chartColors.slimming}
                strokeWidth={chartDefaults.strokeWidth}
                dot={{ r: chartDefaults.dotRadius }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Budget vs Actual — uses correct `budgeted` column */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetChartData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="budgeted" name="Budget" fill={chartColors.budget} />
              <Bar dataKey="actual" name="Actual" fill={chartColors.spa} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue by Location with real YoY and HC% */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Location</h2>
        <DataTable columns={locationColumns} data={locationTableData} />
      </Card>

      {/* Same-Store Growth (SSG) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Total Growth vs Same-Store Growth
        </h2>
        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          {locationMaturityInfo.map((loc) => (
            <span key={loc.name} className="flex items-center gap-1">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  loc.status === "Mature" ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              {loc.name}{" "}
              <span className="text-gray-400">({loc.status})</span>
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ssgChartData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v: number) => `${v}%`} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="totalGrowth"
              name="Total Growth"
              stroke={chartColors.spa}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: chartDefaults.dotRadius }}
            />
            <Line
              type="monotone"
              dataKey="ssg"
              name="Same-Store Growth"
              stroke={chartColors.slimming}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: chartDefaults.dotRadius }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Contribution Margin per Location */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contribution Margin by Location
        </h2>
        <ResponsiveContainer width="100%" height={Math.max(300, contributionMarginData.length * 48)}>
          <BarChart
            data={contributionMarginData}
            layout="vertical"
            margin={{ ...chartDefaults.margin, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v: number) => `${v}%`} />
            <YAxis type="category" dataKey="location" width={100} />
            <Tooltip
              formatter={(value) => `${Number(value)}%`}
              labelFormatter={(label) => `${label}`}
            />
            <ReferenceLine x={20} stroke="#22C55E" strokeDasharray="3 3" label="20%" />
            <ReferenceLine x={10} stroke="#F59E0B" strokeDasharray="3 3" label="10%" />
            <Bar dataKey="marginPct" name="Margin %">
              {contributionMarginData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getMarginColor(entry.marginPct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export                                                        */
/* ------------------------------------------------------------------ */

export default function FinancePage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <FinanceContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
