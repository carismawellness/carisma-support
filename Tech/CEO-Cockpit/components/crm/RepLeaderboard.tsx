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
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */

interface RepRow {
  name: string;
  brandSlug: string;
  totalSales: number;
  avgDaily: number;
  totalBookings: number;
  salesPerBooking: number;
  conversionPct: number;
}

const DUMMY_REPS: RepRow[] = [
  { name: "Maria Vella", brandSlug: "aesthetics", totalSales: 12480, avgDaily: 891, totalBookings: 42, salesPerBooking: 297, conversionPct: 34.2 },
  { name: "Katrina Borg", brandSlug: "slimming", totalSales: 10950, avgDaily: 782, totalBookings: 38, salesPerBooking: 288, conversionPct: 31.5 },
  { name: "Sarah Camilleri", brandSlug: "spa", totalSales: 9870, avgDaily: 705, totalBookings: 35, salesPerBooking: 282, conversionPct: 28.9 },
  { name: "Anna Grech", brandSlug: "aesthetics", totalSales: 8640, avgDaily: 617, totalBookings: 31, salesPerBooking: 279, conversionPct: 26.1 },
  { name: "Elena Farrugia", brandSlug: "slimming", totalSales: 7820, avgDaily: 559, totalBookings: 28, salesPerBooking: 279, conversionPct: 24.8 },
  { name: "Julia Zammit", brandSlug: "spa", totalSales: 6950, avgDaily: 496, totalBookings: 25, salesPerBooking: 278, conversionPct: 22.3 },
  { name: "Lisa Galea", brandSlug: "aesthetics", totalSales: 6210, avgDaily: 443, totalBookings: 22, salesPerBooking: 282, conversionPct: 20.7 },
  { name: "Diane Attard", brandSlug: "slimming", totalSales: 5480, avgDaily: 391, totalBookings: 19, salesPerBooking: 288, conversionPct: 19.2 },
  { name: "Nicole Mifsud", brandSlug: "spa", totalSales: 4720, avgDaily: 337, totalBookings: 17, salesPerBooking: 278, conversionPct: 17.4 },
  { name: "Claire Spiteri", brandSlug: "aesthetics", totalSales: 3890, avgDaily: 278, totalBookings: 14, salesPerBooking: 278, conversionPct: 15.8 },
];

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

  // Aggregate real data by staff_id
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

  const realData: RepRow[] = Object.values(repAgg)
    .map((r) => {
      const days = r.activeDays.size || 1;
      return {
        name: `Rep ${r.staffId}`,
        brandSlug: brandIdToSlug[r.brandId] ?? "spa",
        totalSales: r.totalSales,
        avgDaily: r.totalSales / days,
        totalBookings: r.totalBookings,
        salesPerBooking: r.totalBookings > 0 ? r.totalSales / r.totalBookings : 0,
        conversionPct: 0,
      };
    })
    .filter((r) => r.totalSales > 0)
    .sort((a, b) => b.totalSales - a.totalSales);

  const hasRealData = realData.length > 0;
  const repData = hasRealData
    ? realData
    : brandFilter
    ? DUMMY_REPS.filter((r) => r.brandSlug === brandFilter)
    : DUMMY_REPS;

  // Chart data (top 10)
  const chartData = repData.slice(0, 10).map((r) => ({
    name: r.name,
    totalSales: r.totalSales,
    brandSlug: r.brandSlug,
  }));

  // Table columns
  const columns = [
    { key: "name", label: "Name" },
    {
      key: "brandSlug",
      label: "Brand",
      render: (v: unknown) => <span className="capitalize">{String(v)}</span>,
    },
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
      render: (v: unknown) => formatCurrency(Math.round(Number(v)) || 0),
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
      render: (v: unknown) => formatCurrency(Math.round(Number(v)) || 0),
    },
  ];

  return (
    <div className="space-y-6 relative">
      {!hasRealData && (
        <div className="absolute top-0 right-0 text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded z-10">
          sample data
        </div>
      )}

      {/* Horizontal bar chart */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Top Reps by Total Sales
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 200)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={95} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="totalSales" name="Total Sales" barSize={22} radius={[0, 4, 4, 0]}>
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
