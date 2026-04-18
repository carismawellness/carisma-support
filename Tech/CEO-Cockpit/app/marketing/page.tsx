"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import { formatCurrency } from "@/lib/charts/config";

/* ---------- brand colours ---------- */

const BRAND = {
  spa:         { name: "Spa",         color: "#B79E61" },
  aesthetics:  { name: "Aesthetics",  color: "#96B2B2" },
  slimming:    { name: "Slimming",    color: "#8EB093" },
} as const;

/* ---------- Section 1 – Hero KPI data ---------- */

const CPL_KPIS: KPIData[] = [
  { label: "CPL — Spa",         value: "€7.80"  },
  { label: "CPL — Aesthetics",  value: "€14.20" },
  { label: "CPL — Slimming",    value: "€18.50" },
];

const CPC_KPIS: KPIData[] = [
  { label: "CPC — Spa",         value: "€1.85" },
  { label: "CPC — Aesthetics",  value: "€3.80" },
  { label: "CPC — Slimming",    value: "€2.60" },
];

const ROAS_KPIS: KPIData[] = [
  { label: "ROAS — Spa",        value: "5.2x",  target: "5.0x", targetValue: 5.0, currentValue: 5.2 },
  { label: "ROAS — Aesthetics", value: "4.6x",  target: "4.0x", targetValue: 4.0, currentValue: 4.6 },
  { label: "ROAS — Slimming",   value: "2.8x",  target: "3.0x", targetValue: 3.0, currentValue: 2.8 },
];

const SPEND_KPIS: KPIData[] = [
  { label: "Spend — Spa",        value: formatCurrency(2760)  },
  { label: "Spend — Aesthetics", value: formatCurrency(3735)  },
  { label: "Spend — Slimming",   value: formatCurrency(1737)  },
];

const REVENUE_KPIS: KPIData[] = [
  { label: "Revenue — Spa",        value: formatCurrency(9847)  },
  { label: "Revenue — Aesthetics", value: formatCurrency(4280)  },
  { label: "Revenue — Slimming",   value: formatCurrency(1480)  },
];

/* ---------- Section 2 – Creative fatigue data ---------- */

interface FatigueSummary {
  brand: keyof typeof BRAND;
  fatigued: number;
  watch: number;
  healthy: number;
}

const FATIGUE_DATA: FatigueSummary[] = [
  { brand: "spa",        fatigued: 1, watch: 1, healthy: 4 },
  { brand: "aesthetics", fatigued: 0, watch: 1, healthy: 5 },
  { brand: "slimming",   fatigued: 0, watch: 1, healthy: 4 },
];

/* ---------- Section 3 – Channel aggregate data ---------- */

interface ChannelAggregate {
  channel: string;
  metrics: { label: string; value: string }[];
}

const CHANNEL_AGGREGATES: ChannelAggregate[] = [
  {
    channel: "Meta Ads",
    metrics: [
      { label: "Expected Revenue",  value: formatCurrency(35840) },
      { label: "Expected Ad Spend", value: formatCurrency(8232)  },
      { label: "Expected ROAS",     value: "4.4x"                },
    ],
  },
  {
    channel: "Google Ads",
    metrics: [
      { label: "Expected Revenue",  value: formatCurrency(18720) },
      { label: "Expected Ad Spend", value: formatCurrency(2680)  },
      { label: "Expected ROAS",     value: "7.0x"                },
    ],
  },
  {
    channel: "Email (Klaviyo)",
    metrics: [
      { label: "Expected Revenue",     value: formatCurrency(17190) },
      { label: "Expected Subscribers", value: "8,153"               },
      { label: "Expected ROAS",        value: "34x"                 },
    ],
  },
];

/* ---------- content component ---------- */

function MarketingMasterContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  return (
    <div className="space-y-10">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing Master</h1>
        <p className="text-sm text-muted-foreground">
          Cross-brand marketing performance overview
        </p>
      </div>

      {/* ── Section 1: Hero KPIs ── */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">CPL by Brand</h2>
        <KPICardRow kpis={CPL_KPIS} />

        <h2 className="text-lg font-semibold">CPC by Brand</h2>
        <KPICardRow kpis={CPC_KPIS} />

        <h2 className="text-lg font-semibold">Blended ROAS by Brand</h2>
        <KPICardRow kpis={ROAS_KPIS} />

        <h2 className="text-lg font-semibold">Total Spend by Brand</h2>
        <KPICardRow kpis={SPEND_KPIS} />

        <h2 className="text-lg font-semibold">Total Revenue by Brand</h2>
        <KPICardRow kpis={REVENUE_KPIS} />
      </section>

      {/* ── Section 2: Creative Fatigue by Brand ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Creative Fatigue by Brand</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FATIGUE_DATA.map((f) => {
            const b = BRAND[f.brand];
            return (
              <Card key={f.brand} className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="font-medium">{b.name}</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {f.fatigued > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {f.fatigued} Fatigued
                    </span>
                  )}
                  {f.watch > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {f.watch} Watch
                    </span>
                  )}
                  {f.healthy > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {f.healthy} Healthy
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Section 3: Channel Aggregate Metrics ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Channel Aggregate Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNEL_AGGREGATES.map((ch) => (
            <Card key={ch.channel} className="p-5">
              <h3 className="font-medium mb-4">{ch.channel}</h3>
              <dl className="space-y-3">
                {ch.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">{m.label}</dt>
                    <dd className="text-sm font-semibold">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Section 4: CIChat ── */}
      <section>
        <CIChat embedded />
      </section>
    </div>
  );
}

/* ---------- page export ---------- */

export default function MarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <MarketingMasterContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
