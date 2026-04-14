"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { CIChat } from "@/components/ci/CIChat";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AppointmentPipeline } from "@/components/dashboard/AppointmentPipeline";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

// Fallback static revenue data (used when Supabase data is empty)
const fallbackRevenueData = [
  { week: "Week 1", spa: 12400, aesthetics: 8200, slimming: 6800 },
  { week: "Week 2", spa: 13100, aesthetics: 8800, slimming: 7200 },
  { week: "Week 3", spa: 11800, aesthetics: 9400, slimming: 7600 },
  { week: "Week 4", spa: 14200, aesthetics: 9800, slimming: 8000 },
];

/** Compute a 0-100 health score from current vs target. */
function healthScore(
  current: number,
  target: number,
  lowerIsBetter: boolean,
): number {
  if (target === 0) return 50;
  const ratio = lowerIsBetter
    ? target / Math.max(current, 0.01)
    : current / target;
  return Math.min(Math.max(Math.round(ratio * 100), 0), 100);
}

/** Average a numeric field across an array of records. */
function avg<T>(data: T[], key: keyof T): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, row) => acc + Number(row[key] ?? 0), 0);
  return sum / data.length;
}

interface SalesRow {
  date: string;
  revenue: number;
  brand_id: number;
}

interface MktRow {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  brand_id: number;
}

interface CrmRow {
  date: string;
  speed_to_lead_min: number;
  conversion_rate: number;
  brand_id: number;
}

interface HrRow {
  date: string;
  headcount_pct: number;
  brand_id: number;
}

export default function CEOPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <CEOContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}

function CEOContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  // Fetch data from all relevant tables
  const { data: salesData } = useKPIData<SalesRow>({
    table: "daily_revenue",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: mktData } = useKPIData<MktRow>({
    table: "daily_marketing",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: crmData } = useKPIData<CrmRow>({
    table: "daily_crm",
    dateFrom,
    dateTo,
    brandFilter,
  });

  const { data: hrData } = useKPIData<HrRow>({
    table: "daily_hr",
    dateFrom,
    dateTo,
    brandFilter,
  });

  // Compute aggregate KPI values
  const totalRevenue = useMemo(
    () => salesData.reduce((sum, r) => sum + (r.revenue ?? 0), 0),
    [salesData],
  );
  const avgRoas = useMemo(() => avg(mktData, "roas"), [mktData]);
  const avgConvRate = useMemo(
    () => avg(crmData, "conversion_rate"),
    [crmData],
  );
  const avgHc = useMemo(() => avg(hrData, "headcount_pct"), [hrData]);
  const avgStl = useMemo(
    () => avg(crmData, "speed_to_lead_min"),
    [crmData],
  );

  // Compute revenue growth score for finance department health
  const revenueGrowthScore = useMemo(() => {
    if (salesData.length < 2) return 50;
    const half = Math.floor(salesData.length / 2);
    const firstHalf = salesData.slice(0, half).reduce((s, r) => s + (r.revenue ?? 0), 0);
    const secondHalf = salesData.slice(half).reduce((s, r) => s + (r.revenue ?? 0), 0);
    if (firstHalf === 0) return 50;
    const growth = secondHalf / firstHalf;
    return Math.min(Math.max(Math.round(growth * 100), 0), 100);
  }, [salesData]);

  // Build KPI cards with drill-down hrefs
  const kpis: KPIData[] = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: totalRevenue > 0 ? formatCurrency(totalRevenue) : "€42,350",
        trend: 8,
        target: "€45,000",
        targetValue: 45000,
        currentValue: totalRevenue > 0 ? totalRevenue : 42350,
        href: "/finance",
      },
      {
        label: "Blended ROAS",
        value: avgRoas > 0 ? `${avgRoas.toFixed(1)}x` : "5.2x",
        trend: 3,
        target: "5.0x",
        targetValue: 5,
        currentValue: avgRoas > 0 ? avgRoas : 5.2,
        href: "/marketing",
      },
      {
        label: "Conversion Rate",
        value: avgConvRate > 0 ? `${avgConvRate.toFixed(1)}%` : "27.3%",
        trend: -2,
        target: "25%",
        targetValue: 25,
        currentValue: avgConvRate > 0 ? avgConvRate : 27.3,
        href: "/sales",
      },
      {
        label: "Company HC%",
        value: avgHc > 0 ? `${avgHc.toFixed(1)}%` : "38.2%",
        trend: -1,
        target: "40%",
        targetValue: 40,
        currentValue: avgHc > 0 ? avgHc : 38.2,
        href: "/hr",
      },
      {
        label: "Speed to Lead",
        value: avgStl > 0 ? `${avgStl.toFixed(1)}m` : "4.2m",
        trend: 5,
        target: "5m",
        targetValue: 5,
        currentValue: avgStl > 0 ? avgStl : 4.2,
        href: "/sales",
      },
    ],
    [totalRevenue, avgRoas, avgConvRate, avgHc, avgStl],
  );

  // Compute department health scores from real data
  const deptHealthData = useMemo(
    () => [
      {
        department: "Marketing",
        score: mktData.length > 0 ? healthScore(avgRoas, 5.0, false) : 50,
      },
      {
        department: "Sales",
        score: crmData.length > 0 ? healthScore(avgStl, 5, true) : 50,
      },
      {
        department: "Finance",
        score: salesData.length > 0 ? revenueGrowthScore : 50,
      },
      {
        department: "HR",
        score: hrData.length > 0 ? healthScore(avgHc, 40, true) : 50,
      },
      {
        department: "Operations",
        score: 50,
      },
    ],
    [mktData.length, crmData.length, salesData.length, hrData.length, avgRoas, avgStl, avgHc, revenueGrowthScore],
  );

  // Revenue chart data — use fetched data grouped by week or fallback
  const revenueChartData = useMemo(() => {
    if (salesData.length === 0) return fallbackRevenueData;

    // Group by week and brand
    const weeks: Record<string, { spa: number; aesthetics: number; slimming: number }> = {};
    for (const row of salesData) {
      const d = new Date(row.date);
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `Week ${weekNum}`;
      if (!weeks[key]) weeks[key] = { spa: 0, aesthetics: 0, slimming: 0 };
      if (row.brand_id === 1) weeks[key].spa += row.revenue ?? 0;
      else if (row.brand_id === 2) weeks[key].aesthetics += row.revenue ?? 0;
      else if (row.brand_id === 3) weeks[key].slimming += row.revenue ?? 0;
    }

    return Object.entries(weeks).map(([week, data]) => ({ week, ...data }));
  }, [salesData]);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
      <KPICardRow kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Brand
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
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

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Department Health
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={deptHealthData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="department" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke={chartColors.spa}
                fill={chartColors.spa}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <AppointmentPipeline />

      <AlertFeed />
      <CIChat />
    </>
  );
}
