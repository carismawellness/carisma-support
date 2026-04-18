"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SalesKPICard } from "@/components/sales/SalesKPICard";
import { SalesKPIGrid } from "@/components/sales/SalesKPIGrid";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Company-wide aggregated from all brands
   ═══════════════════════════════════════════════════════════════════════ */

const KPI_DATA = {
  totalNetRevenue: { value: 218_640, yoy: 4.2 },
  servicesRevenue: { value: 199_430, yoy: 3.8 },
  retailRevenue: { value: 12_180, pctOfTotal: 5.6, yoy: 8.1 },
  spaMembers: { value: 847, yoy: 8.3 },
  aestheticsMembers: { value: 86, yoy: 14.2 },
  slimmingMembers: { value: 480 },
};

// Revenue by Brand
const BRAND_REVENUE_DATA = [
  {
    brand: "Spa",
    services: 172_340,
    retail: 10_420,
    lastYearTotal: 168_900,
  },
  {
    brand: "Aesthetics",
    services: 40_880,
    retail: 783,
    lastYearTotal: 35_200,
  },
  {
    brand: "Slimming",
    services: 65_737,
    retail: 666,
    lastYearTotal: 0,
  },
];

// AOV by Brand
const AOV_DATA = [
  { brand: "Spa", aov: 82, lastYearAov: 76 },
  { brand: "Aesthetics", aov: 234, lastYearAov: 218 },
  { brand: "Slimming", aov: 156, lastYearAov: 0 },
];

/* ═══════════════════════════════════════════════════════════════════════
   CHART HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function yoyPct(current: number, lastYear: number): number {
  if (lastYear === 0) return 0;
  return ((current - lastYear) / lastYear) * 100;
}

const brandColorMap: Record<string, string> = {
  Spa: chartColors.spa,
  Aesthetics: chartColors.aesthetics,
  Slimming: chartColors.slimming,
};

const brandChartData = BRAND_REVENUE_DATA.map((b) => {
  const currentTotal = b.services + b.retail;
  return {
    brand: b.brand,
    "Service Revenue": b.services,
    "Retail Revenue": b.retail,
    "Last Year Total": b.lastYearTotal > 0 ? b.lastYearTotal : null,
    yoyPct: b.lastYearTotal > 0 ? yoyPct(currentTotal, b.lastYearTotal) : null,
    total: currentTotal,
    fill: brandColorMap[b.brand],
  };
});

const aovChartData = AOV_DATA.map((b) => ({
  brand: b.brand,
  AOV: b.aov,
  "Last Year AOV": b.lastYearAov > 0 ? b.lastYearAov : null,
  yoyPct: b.lastYearAov > 0 ? yoyPct(b.aov, b.lastYearAov) : null,
  fill: brandColorMap[b.brand],
}));

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM TOOLTIPS
   ═══════════════════════════════════════════════════════════════════════ */

function BrandRevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-6 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function AovTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-6 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium">
            {entry.value != null ? `€${entry.value}` : "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   YOY LABEL RENDERERS
   ═══════════════════════════════════════════════════════════════════════ */

interface LabelProps {
  x?: string | number;
  width?: string | number;
  y?: string | number;
  index?: number;
}

function renderBrandYoYLabel(props: LabelProps) {
  const { x: rawX = 0, width: rawW = 0, y: rawY = 0, index = 0 } = props;
  const x = Number(rawX);
  const width = Number(rawW);
  const y = Number(rawY);
  const entry = brandChartData[index];
  if (!entry || entry.yoyPct === null) return null;
  const pct = entry.yoyPct;
  const isPositive = pct >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isPositive ? "#059669" : "#dc2626"}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </text>
  );
}

function renderAovYoYLabel(props: LabelProps) {
  const { x: rawX = 0, width: rawW = 0, y: rawY = 0, index = 0 } = props;
  const x = Number(rawX);
  const width = Number(rawW);
  const y = Number(rawY);
  const entry = aovChartData[index];
  if (!entry || entry.yoyPct === null) return null;
  const pct = entry.yoyPct;
  const isPositive = pct >= 0;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isPositive ? "#059669" : "#dc2626"}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SalesPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <>
          {/* ── Page Header ─────────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Sales Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Company-wide performance across all brands | All figures EUR ex
              VAT
            </p>
          </div>

          {/* ── Company-wide KPIs ──────────────────────────────────── */}
          <SalesKPIGrid columns={3}>
            <SalesKPICard
              label="Total Net Revenue"
              value={formatCurrency(KPI_DATA.totalNetRevenue.value)}
              yoyChange={KPI_DATA.totalNetRevenue.yoy}
            />
            <SalesKPICard
              label="Services Revenue"
              value={formatCurrency(KPI_DATA.servicesRevenue.value)}
              yoyChange={KPI_DATA.servicesRevenue.yoy}
            />
            <SalesKPICard
              label="Retail Revenue"
              value={formatCurrency(KPI_DATA.retailRevenue.value)}
              subtitle={`${KPI_DATA.retailRevenue.pctOfTotal}% of total`}
              yoyChange={KPI_DATA.retailRevenue.yoy}
            />
          </SalesKPIGrid>

          {/* ── Brand Snapshot (3 cols: Spa | Aesthetics | Slimming) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-3 md:p-5 border-l-4" style={{ borderLeftColor: chartColors.spa }}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Spa</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(BRAND_REVENUE_DATA[0].services + BRAND_REVENUE_DATA[0].retail)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {KPI_DATA.spaMembers.value.toLocaleString()} members
                <span className="text-green-600 font-medium ml-1">+{KPI_DATA.spaMembers.yoy}%</span>
              </p>
            </Card>
            <Card className="p-3 md:p-5 border-l-4" style={{ borderLeftColor: chartColors.aesthetics }}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Aesthetics</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(BRAND_REVENUE_DATA[1].services + BRAND_REVENUE_DATA[1].retail)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {KPI_DATA.aestheticsMembers.value.toLocaleString()} clients
                <span className="text-green-600 font-medium ml-1">+{KPI_DATA.aestheticsMembers.yoy}%</span>
              </p>
            </Card>
            <Card className="p-3 md:p-5 border-l-4" style={{ borderLeftColor: chartColors.slimming }}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">Slimming</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{formatCurrency(BRAND_REVENUE_DATA[2].services + BRAND_REVENUE_DATA[2].retail)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {KPI_DATA.slimmingMembers.value.toLocaleString()} members
                <span className="text-muted-foreground ml-1">Since Feb 2026</span>
              </p>
            </Card>
          </div>

          {/* ── Revenue by Brand (Stacked Bar + Line) ───────────────── */}
          <Card className="p-3 md:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Revenue by Brand
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Service + Retail revenue per brand vs last year total | YoY delta
              shown above each bar
            </p>
            <div className="h-[260px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={brandChartData}
                margin={{ top: 16, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<BrandRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="square"
                />
                <Bar
                  dataKey="Service Revenue"
                  stackId="revenue"
                  fill={chartColors.spa}
                  radius={[0, 0, 0, 0]}
                >
                  <LabelList
                    dataKey="Service Revenue"
                    content={(props) => {
                      const { x, width, y, height, value } = props as Record<string, unknown>;
                      const w = Number(width);
                      if (w < 40) return <></>;
                      return (
                        <text
                          x={Number(x) + w / 2}
                          y={Number(y) + Number(height) / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill="white"
                        >
                          {formatCurrency(Number(value))}
                        </text>
                      );
                    }}
                  />
                </Bar>
                <Bar
                  dataKey="Retail Revenue"
                  stackId="revenue"
                  fill={chartColors.aesthetics}
                  radius={[3, 3, 0, 0]}
                >
                  <LabelList
                    dataKey="total"
                    content={(props) => {
                      const { x, width, y, index } = props as Record<string, unknown>;
                      const entry = brandChartData[Number(index)];
                      if (!entry) return <></>;
                      const pct = entry.yoyPct;
                      const isPositive = pct !== null && pct >= 0;
                      return (
                        <>
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 20}
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight={700}
                            fill="#374151"
                          >
                            {formatCurrency(entry.total)}
                          </text>
                          {pct !== null && (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 6}
                              textAnchor="middle"
                              fontSize={10}
                              fontWeight={600}
                              fill={isPositive ? "#059669" : "#dc2626"}
                            >
                              {isPositive ? "+" : ""}{pct.toFixed(1)}% YoY
                            </text>
                          )}
                        </>
                      );
                    }}
                  />
                </Bar>
                <Line
                  type="monotone"
                  dataKey="Last Year Total"
                  stroke={chartColors.target}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: chartColors.target }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </Card>

          {/* ── Average Order Value by Brand ────────────────────────── */}
          <Card className="p-3 md:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Average Order Value by Brand
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Current period AOV vs last year | YoY delta shown above each bar
            </p>
            <div className="h-[240px] md:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={aovChartData}
                margin={{ top: 16, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="brand" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v: number) => `€${v}`}
                  tick={{ fontSize: 11 }}
                  domain={[0, 280]}
                />
                <Tooltip content={<AovTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar
                  dataKey="AOV"
                  name="Current AOV"
                  fill={chartColors.spa}
                  radius={[3, 3, 0, 0]}
                  label={renderAovYoYLabel}
                />
                <Line
                  type="monotone"
                  dataKey="Last Year AOV"
                  name="Last Year AOV"
                  stroke={chartColors.target}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: chartColors.target }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </Card>

          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
