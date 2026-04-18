"use client";

import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/DataTable";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import { CrmByRepRow } from "@/lib/types/crm";
import { chartColors, formatCurrency } from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RepLeaderboard({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data, loading } = useKPIData<CrmByRepRow>({
    table: "crm_by_rep",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="animate-pulse text-text-secondary">Loading...</div>
    );
  }

  // Build brand_id -> slug lookup
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  // Aggregate by staff_id
  const repAgg: Record<
    number,
    {
      staffId: number;
      brandId: number;
      totalSales: number;
      activeDays: Set<string>;
      totalBookings: number;
    }
  > = {};

  for (const row of data) {
    if (!repAgg[row.staff_id]) {
      repAgg[row.staff_id] = {
        staffId: row.staff_id,
        brandId: row.brand_id,
        totalSales: 0,
        activeDays: new Set(),
        totalBookings: 0,
      };
    }
    const agg = repAgg[row.staff_id];
    agg.totalSales += row.total_sales ?? 0;
    agg.totalBookings += row.bookings ?? 0;
    if (row.total_sales !== null && row.total_sales > 0) {
      agg.activeDays.add(row.date);
    }
  }

  const repData = Object.values(repAgg)
    .map((r) => {
      const days = r.activeDays.size || 1;
      return {
        staffId: r.staffId,
        brandSlug: brandIdToSlug[r.brandId] ?? "spa",
        totalSales: r.totalSales,
        avgDaily: r.totalSales / days,
        totalBookings: r.totalBookings,
        salesPerBooking:
          r.totalBookings > 0 ? r.totalSales / r.totalBookings : 0,
      };
    })
    .filter((r) => r.totalSales > 0)
    .sort((a, b) => b.totalSales - a.totalSales);

  // Chart data (top 15)
  const chartData = repData.slice(0, 15).map((r) => ({
    name: `Rep ${r.staffId}`,
    totalSales: r.totalSales,
    brandSlug: r.brandSlug,
  }));

  // Table columns
  const columns = [
    { key: "staffId", label: "Rep" },
    {
      key: "totalSales",
      label: "Total Sales",
      sortable: true,
      align: "right" as const,
      render: (v: unknown) => formatCurrency(Number(v) || 0),
    },
    {
      key: "avgDaily",
      label: "Avg Daily",
      sortable: true,
      align: "right" as const,
      render: (v: unknown) => formatCurrency(Number(v) || 0),
    },
    {
      key: "totalBookings",
      label: "Bookings",
      sortable: true,
      align: "right" as const,
    },
    {
      key: "salesPerBooking",
      label: "Sales/Booking",
      align: "right" as const,
      render: (v: unknown) => formatCurrency(Number(v) || 0),
    },
  ];

  if (repData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Rep Leaderboard
        </h3>
        <p className="text-sm text-text-secondary text-center py-8">
          No data
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal bar chart */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Rep Leaderboard &mdash; Total Sales
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 36, 200)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="totalSales" name="Total Sales" barSize={20}>
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={
                    chartColors[entry.brandSlug as keyof typeof chartColors] ??
                    chartColors.spa
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Data table */}
      <Card className="p-6">
        <DataTable
          columns={columns}
          data={repData as unknown as Record<string, unknown>[]}
        />
      </Card>
    </div>
  );
}
