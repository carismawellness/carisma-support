"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/dashboard/DataTable";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { CrmByRepRow } from "@/lib/types/crm";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusBadge(
  value: number,
  good: boolean,
): React.ReactNode {
  const color = good
    ? "bg-emerald-100 text-emerald-800"
    : "bg-red-100 text-red-800";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${color}`}
    >
      {formatPercent(value)}
    </span>
  );
}

interface AggregatedRep {
  staff_id: number;
  brand: string;
  team_type: string;
  total_sales: number;
  dials: number;
  bookings: number;
  conversion_rate_pct: number;
  deposit_pct: number;
  missed_pct: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmployeeTable({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const { data, loading } = useKPIData<CrmByRepRow>({
    table: "crm_by_rep",
    dateFrom,
    dateTo,
    brandFilter,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // --- Brand ID -> slug mapping ---
  const brandIdToSlug: Record<number, string> = {};
  for (const [slug, id] of Object.entries(brandMap)) {
    brandIdToSlug[id] = slug;
  }

  // --- Aggregate by staff_id ---
  const repMap: Record<
    number,
    {
      staffId: number;
      brandId: number;
      teamType: string;
      totalSales: number;
      dials: number;
      bookings: number;
      convSum: number;
      convCount: number;
      depSum: number;
      depCount: number;
      missedSum: number;
      missedCount: number;
    }
  > = {};

  for (const row of data) {
    if (!repMap[row.staff_id]) {
      repMap[row.staff_id] = {
        staffId: row.staff_id,
        brandId: row.brand_id,
        teamType: row.team_type ?? "-",
        totalSales: 0,
        dials: 0,
        bookings: 0,
        convSum: 0,
        convCount: 0,
        depSum: 0,
        depCount: 0,
        missedSum: 0,
        missedCount: 0,
      };
    }
    const agg = repMap[row.staff_id];
    agg.totalSales += row.total_sales ?? 0;
    agg.dials += row.dials ?? 0;
    agg.bookings += row.bookings ?? 0;
    if (row.conversion_rate_pct !== null) {
      agg.convSum += row.conversion_rate_pct;
      agg.convCount++;
    }
    if (row.deposit_pct !== null) {
      agg.depSum += row.deposit_pct;
      agg.depCount++;
    }
    if (row.missed_pct !== null) {
      agg.missedSum += row.missed_pct;
      agg.missedCount++;
    }
  }

  const tableData: AggregatedRep[] = Object.values(repMap).map((r) => ({
    staff_id: r.staffId,
    brand: brandIdToSlug[r.brandId] ?? `brand_${r.brandId}`,
    team_type: r.teamType === "sdr" ? "SDR" : r.teamType === "chat" ? "Chat" : r.teamType,
    total_sales: r.totalSales,
    dials: r.dials,
    bookings: r.bookings,
    conversion_rate_pct: r.convCount > 0 ? r.convSum / r.convCount : 0,
    deposit_pct: r.depCount > 0 ? r.depSum / r.depCount : 0,
    missed_pct: r.missedCount > 0 ? r.missedSum / r.missedCount : 0,
  }));

  const columns = [
    { key: "staff_id", label: "Name" },
    {
      key: "brand",
      label: "Brand",
      render: (v: unknown) => (
        <span className="capitalize">{String(v)}</span>
      ),
    },
    { key: "team_type", label: "Role" },
    {
      key: "total_sales",
      label: "Total Sales",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) => formatCurrency(Number(v) || 0),
    },
    {
      key: "dials",
      label: "Dials",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "bookings",
      label: "Bookings",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "conversion_rate_pct",
      label: "Conv %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) >= 20),
    },
    {
      key: "deposit_pct",
      label: "Deposit %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) >= 70),
    },
    {
      key: "missed_pct",
      label: "Missed %",
      align: "right" as const,
      sortable: true,
      render: (v: unknown) =>
        statusBadge(Number(v) || 0, (Number(v) || 0) <= 12),
    },
  ];

  // --- Agent detail chart ---
  const agentDailyData = selectedAgent
    ? data
        .filter((r) => r.staff_id === selectedAgent)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({
          date: format(new Date(r.date), "MMM dd"),
          Sales: r.total_sales ?? 0,
          Bookings: r.bookings ?? 0,
          "Conv %": r.conversion_rate_pct ?? 0,
          "Deposit %": r.deposit_pct ?? 0,
          "Missed %": r.missed_pct ?? 0,
        }))
    : [];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Employee Performance
        </h3>
        <DataTable
          columns={columns}
          data={tableData as unknown as Record<string, unknown>[]}
          onRowClick={(row) => {
            const id = row.staff_id as number;
            setSelectedAgent(selectedAgent === id ? null : id);
          }}
        />
      </Card>

      {/* Agent Detail */}
      {selectedAgent !== null && agentDailyData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">
              Agent #{selectedAgent} - Daily Breakdown
            </h3>
            <button
              className="text-sm text-text-secondary hover:text-foreground"
              onClick={() => setSelectedAgent(null)}
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales + Bookings bar chart */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Sales & Bookings
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agentDailyData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sales" fill={chartColors.spa} />
                  <Bar dataKey="Bookings" fill={chartColors.aesthetics} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion / Deposit / Missed line chart */}
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Rate Metrics
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={agentDailyData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(value) => formatPercent(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Conv %"
                    stroke={chartColors.aesthetics}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Deposit %"
                    stroke={chartColors.spa}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Missed %"
                    stroke={chartColors.target}
                    strokeWidth={chartDefaults.strokeWidth}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
