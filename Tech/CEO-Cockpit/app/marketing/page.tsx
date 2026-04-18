"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import { formatCurrency } from "@/lib/charts/config";
import { formatDateRangeLabel } from "@/lib/utils/mock-date-filter";

/* ---------- date-scale helpers ---------- */

const MOCK_DATA_PERIOD_DAYS = 30;

function scaleValue(value: number, scale: number): number {
  return Math.round(value * scale);
}

/* ---------- brand colours ---------- */

const BRAND = {
  spa:        { name: "Spa",        color: "#B79E61" },
  aesthetics: { name: "Aesthetics", color: "#96B2B2" },
  slimming:   { name: "Slimming",   color: "#8EB093" },
} as const;

type BrandKey = keyof typeof BRAND;
const BRAND_KEYS: BrandKey[] = ["spa", "aesthetics", "slimming"];

/* ---------- helpers ---------- */

function BrandDot({ brand }: { brand: BrandKey }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full shrink-0"
      style={{ backgroundColor: BRAND[brand].color }}
    />
  );
}

function roasColor(value: number): string {
  if (value >= 5) return "text-green-600";
  if (value >= 3) return "text-amber-600";
  return "text-red-600";
}

/* ---------- Section 1 – Cross-Brand KPI data ---------- */

interface KPIRow {
  metric: string;
  spa: string;
  aesthetics: string;
  slimming: string;
}

const CROSS_BRAND_KPIS: KPIRow[] = [
  { metric: "Revenue",      spa: formatCurrency(9847),  aesthetics: formatCurrency(4280),  slimming: formatCurrency(1480) },
  { metric: "Total Spend",  spa: formatCurrency(2760),  aesthetics: formatCurrency(3735),  slimming: formatCurrency(1737) },
  { metric: "Blended ROAS", spa: "5.2x",                aesthetics: "4.6x",                slimming: "2.8x" },
  { metric: "CPL",          spa: "€7.80",               aesthetics: "€14.20",              slimming: "€18.50" },
  { metric: "CPC",          spa: "€1.85",               aesthetics: "€3.80",               slimming: "€2.60" },
];

/* ---------- Section 2 – Creative fatigue data ---------- */

interface FatigueSummary {
  brand: BrandKey;
  fatigued: number;
  watch: number;
  healthy: number;
}

const FATIGUE_DATA: FatigueSummary[] = [
  { brand: "spa",        fatigued: 1, watch: 1, healthy: 4 },
  { brand: "aesthetics", fatigued: 0, watch: 1, healthy: 5 },
  { brand: "slimming",   fatigued: 0, watch: 1, healthy: 4 },
];

/* ---------- Section 3 – Channel data by brand ---------- */

interface ChannelRow {
  metric: string;
  spa: string;
  aesthetics: string;
  slimming: string;
  /** numeric ROAS values for color-coding (only for ROAS rows) */
  roasValues?: { spa: number; aesthetics: number; slimming: number };
}

interface ChannelSection {
  channel: string;
  rows: ChannelRow[];
}

const CHANNEL_BY_BRAND: ChannelSection[] = [
  {
    channel: "Meta Ads",
    rows: [
      { metric: "Expected Revenue", spa: formatCurrency(15064), aesthetics: formatCurrency(45441), slimming: formatCurrency(24323) },
      { metric: "Ad Spend",         spa: formatCurrency(2760),  aesthetics: formatCurrency(3735),  slimming: formatCurrency(1737) },
      { metric: "Expected ROAS",    spa: "5.5x",                aesthetics: "12.2x",               slimming: "14.0x",
        roasValues: { spa: 5.5, aesthetics: 12.2, slimming: 14.0 } },
    ],
  },
  {
    channel: "Google Ads",
    rows: [
      { metric: "Expected Revenue", spa: formatCurrency(10604), aesthetics: formatCurrency(10707), slimming: formatCurrency(11385) },
      { metric: "Ad Spend",         spa: formatCurrency(1087),  aesthetics: formatCurrency(586),   slimming: formatCurrency(575) },
      { metric: "Expected ROAS",    spa: "9.8x",                aesthetics: "18.3x",               slimming: "19.8x",
        roasValues: { spa: 9.8, aesthetics: 18.3, slimming: 19.8 } },
    ],
  },
  {
    channel: "Email",
    rows: [
      { metric: "Revenue",     spa: formatCurrency(9960), aesthetics: formatCurrency(5310), slimming: formatCurrency(1920) },
      { metric: "Subscribers", spa: "4,527",               aesthetics: "2,814",              slimming: "812" },
      { metric: "ROAS",        spa: "42x",                 aesthetics: "38x",                slimming: "28x",
        roasValues: { spa: 42, aesthetics: 38, slimming: 28 } },
    ],
  },
];

/* ---------- reusable brand table component ---------- */

function BrandTable({
  rows,
  colorCodeRoas,
}: {
  rows: { metric: string; spa: string; aesthetics: string; slimming: string; roasValues?: { spa: number; aesthetics: number; slimming: number } }[];
  colorCodeRoas?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 pr-4 font-medium text-muted-foreground w-[180px]">Metric</th>
            {BRAND_KEYS.map((key) => (
              <th key={key} className="py-3 px-4 text-right font-medium">
                <span className="inline-flex items-center gap-2 justify-end">
                  <BrandDot brand={key} />
                  {BRAND[key].name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric} className="border-b last:border-b-0">
              <td className="py-3 pr-4 text-muted-foreground">{row.metric}</td>
              {BRAND_KEYS.map((key) => {
                const isRoas = colorCodeRoas && row.roasValues;
                const colorClass = isRoas ? roasColor(row.roasValues![key]) : "";
                return (
                  <td key={key} className={`py-3 px-4 text-right font-bold ${colorClass}`}>
                    {row[key]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className="space-y-6 md:space-y-10">
      {/* -- Page header -- */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Marketing Master</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateRangeLabel(dateFrom, dateTo)} · Cross-brand marketing performance overview
        </p>
      </div>

      {/* -- Section 1: Cross-Brand KPI Table -- */}
      <section>
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Cross-Brand KPIs</h2>
          <BrandTable rows={CROSS_BRAND_KPIS} />
        </Card>
      </section>

      {/* -- Section 2: Creative Fatigue by Brand (Prominent) -- */}
      <section>
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold mb-4 md:mb-6 text-center">Creative Fatigue by Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {FATIGUE_DATA.map((f) => {
              const b = BRAND[f.brand];
              const total = f.healthy + f.watch + f.fatigued;
              const healthyPct = (f.healthy / total) * 100;
              const watchPct = (f.watch / total) * 100;
              const fatiguedPct = (f.fatigued / total) * 100;

              return (
                <div key={f.brand} className="flex flex-col items-center gap-4">
                  {/* Brand label */}
                  <div className="flex items-center gap-2">
                    <BrandDot brand={f.brand} />
                    <span className="font-semibold text-base">{b.name}</span>
                  </div>

                  {/* Stacked horizontal bar */}
                  <div className="w-full h-6 rounded-full overflow-hidden flex bg-muted">
                    {healthyPct > 0 && (
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${healthyPct}%` }}
                        title={`${f.healthy} Healthy`}
                      />
                    )}
                    {watchPct > 0 && (
                      <div
                        className="h-full bg-amber-400 transition-all"
                        style={{ width: `${watchPct}%` }}
                        title={`${f.watch} Watch`}
                      />
                    )}
                    {fatiguedPct > 0 && (
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${fatiguedPct}%` }}
                        title={`${f.fatigued} Fatigued`}
                      />
                    )}
                  </div>

                  {/* Counts */}
                  <div className="flex items-center gap-3 text-xs font-medium flex-wrap justify-center">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      {f.healthy} Healthy
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      {f.watch} Watch
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      {f.fatigued} Fatigued
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* -- Section 3: Channel Aggregates by Brand -- */}
      <section className="space-y-4 md:space-y-6">
        <h2 className="text-lg font-semibold">Channel Performance by Brand</h2>
        {CHANNEL_BY_BRAND.map((ch) => (
          <Card key={ch.channel} className="p-3 md:p-6">
            <h3 className="font-semibold mb-4">{ch.channel}</h3>
            <BrandTable rows={ch.rows} colorCodeRoas />
          </Card>
        ))}
      </section>

      {/* -- Section 4: CIChat -- */}
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
