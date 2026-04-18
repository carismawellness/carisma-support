"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import { BookingMixRow } from "@/lib/types/crm";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PIE_COLORS = ["#B8943E", "#2A8A7A", "#6B9080", "#E07A5F", "#4A90D9", "#9CA3AF"];

const BRANDS = [
  { slug: "spa", label: "Spa" },
  { slug: "aesthetics", label: "Aesthetics" },
  { slug: "slimming", label: "Slimming" },
] as const;

/* ------------------------------------------------------------------ */
/*  Custom label                                                       */
/* ------------------------------------------------------------------ */

function renderLabel({
  name,
  value,
  cx,
  x,
  y,
}: {
  name?: string;
  value?: number;
  cx?: number;
  x?: number;
  y?: number;
}) {
  const anchor = (x ?? 0) > (cx ?? 0) ? "start" : "end";
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      className="text-[10px] fill-current text-text-secondary"
    >
      {name}: {value}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookingMix({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  const { brandMap } = useLookups();

  const { data, loading } = useKPIData<BookingMixRow>({
    table: "crm_booking_mix",
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

  // Group by brand + treatment, sum counts
  const byBrand: Record<string, Record<string, number>> = {};
  for (const row of data) {
    const slug = brandIdToSlug[row.brand_id] ?? `brand_${row.brand_id}`;
    if (!byBrand[slug]) byBrand[slug] = {};
    byBrand[slug][row.treatment_name] =
      (byBrand[slug][row.treatment_name] ?? 0) + row.count;
  }

  // Determine which brands to show
  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b.slug === brandFilter)
    : BRANDS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {visibleBrands.map((brand) => {
        const treatments = byBrand[brand.slug] ?? {};
        const pieData = Object.entries(treatments)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        return (
          <Card key={brand.slug} className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Booking Mix &mdash; {brand.label}
            </h3>
            {pieData.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">
                No data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={2}
                    label={renderLabel}
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        );
      })}
    </div>
  );
}
