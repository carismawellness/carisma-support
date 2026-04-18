"use client";

import { Card } from "@/components/ui/card";
import { useKPIData } from "@/lib/hooks/useKPIData";
import { useLookups } from "@/lib/hooks/useLookups";
import { BookingMixRow } from "@/lib/types/crm";
import { chartColors } from "@/lib/charts/config";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PIE_COLORS = [
  "#B79E61", "#96B2B2", "#8EB093", "#E07A5F", "#4A90D9",
  "#9CA3AF", "#C084FC", "#F472B6", "#34D399", "#FBBF24",
];

const BRANDS = [
  { slug: "spa", label: "Spa" },
  { slug: "aesthetics", label: "Aesthetics" },
  { slug: "slimming", label: "Slimming" },
] as const;

/* ------------------------------------------------------------------ */
/*  Dummy data for brands without real booking mix                     */
/* ------------------------------------------------------------------ */

const DUMMY_BOOKING_MIX: Record<string, { name: string; value: number }[]> = {
  spa: [
    { name: "Deep Tissue Massage", value: 42 },
    { name: "Hot Stone Therapy", value: 28 },
    { name: "Aromatherapy", value: 22 },
    { name: "Facial Treatment", value: 18 },
    { name: "Body Wrap", value: 14 },
    { name: "Couples Massage", value: 11 },
    { name: "Reflexology", value: 8 },
  ],
  aesthetics: [
    { name: "Filler", value: 45 },
    { name: "Skinbooster", value: 38 },
    { name: "Botox", value: 32 },
    { name: "PRP", value: 18 },
    { name: "Laser Hair Removal", value: 15 },
    { name: "Chemical Peel", value: 12 },
    { name: "Microneedling", value: 9 },
  ],
  slimming: [
    { name: "Body Contouring", value: 35 },
    { name: "Fat Freezing", value: 28 },
    { name: "Cavitation", value: 22 },
    { name: "Lymphatic Drainage", value: 16 },
    { name: "Consultation", value: 12 },
    { name: "RF Skin Tightening", value: 10 },
  ],
};

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
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

  const visibleBrands = brandFilter
    ? BRANDS.filter((b) => b.slug === brandFilter)
    : BRANDS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {visibleBrands.map((brand) => {
        const treatments = byBrand[brand.slug] ?? {};
        let items = Object.entries(treatments)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Use dummy data if no real treatment data or if data looks like
        // person names (ETL not yet mapping treatment_name correctly)
        const looksLikeNames = items.length > 0 && items.every((t) => !t.name.includes(" ") || /^[A-Z][a-z]+ [A-Z]?[a-z]+$/.test(t.name));
        const isDummy = items.length === 0 || looksLikeNames;
        if (isDummy) {
          items = DUMMY_BOOKING_MIX[brand.slug] ?? [];
        }

        const total = items.reduce((s, t) => s + t.value, 0);

        return (
          <Card key={brand.slug} className="p-3 md:p-6 relative">
            {isDummy && (
              <span className="absolute top-2 right-3 text-[10px] uppercase tracking-wider text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded">
                sample
              </span>
            )}
            <h3 className="text-base font-semibold text-foreground mb-4">
              {brand.label}
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">
                No data
              </p>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 8).map((item, i) => {
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-secondary truncate mr-2">{item.name}</span>
                        <span className="font-semibold text-foreground flex-shrink-0">
                          {item.value} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {items.length > 8 && (
                  <p className="text-xs text-text-secondary text-center mt-2">
                    +{items.length - 8} more treatments
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
