"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import { formatCurrency } from "@/lib/charts/config";
import {
  monthIndicesToDateObjects,
  getFilteredIndices,
  sumFiltered,
  formatDateRangeLabel,
  filteredCountLabel,
} from "@/lib/utils/mock-date-filter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const REV =       [0,0,0,0,3803,0,6502,7418,8957,1894,5000,4000, 4500,5200,6800,6100];
const WAGES =     [0,0,0,0,360,360,360,360,360,360,360,360, 400,400,400,400];
const ADVERTISING=[0,0,0,0,0,1037,769,710,513,505,500,400, 450,480,520,490];
const EBITDA =    [0,0,0,0,3443,-1397,5373,6348,8084,1029,4140,3240, 3650,4320,5880,5210];

const MONTH_DATES = monthIndicesToDateObjects(2025, 16);

/* ------------------------------------------------------------------ */
/*  LABEL RENDERERS                                                    */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
const renderSegmentLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || Math.abs(height) < 18) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={11}
      fontWeight="500"
    >
      {value}%
    </text>
  );
};

const renderTopLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="currentColor"
      textAnchor="middle"
      fontSize={12}
      fontWeight="bold"
    >
      EBITDA {value}%
    </text>
  );
};

/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/*  CUSTOM TOOLTIP                                                     */
/* ------------------------------------------------------------------ */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function VerticalBarTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload) return null;
  const labelMap: Record<string, string> = {
    wages: "Wages & Salaries",
    advertising: "Advertising & Marketing",
    ebitda: "EBITDA / Profit",
  };
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{labelMap[entry.dataKey] ?? entry.name}:</span>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function SlimmingEBITDAContent({
  dateFrom,
  dateTo,
}: {
  dateFrom: Date;
  dateTo: Date;
}) {
  /* --- Filtered indices from date range ------------------------------ */
  const filteredIdx = useMemo(
    () => getFilteredIndices(MONTH_DATES, dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const monthCount = filteredIdx.length;
  const rangeLabel = useMemo(() => formatDateRangeLabel(dateFrom, dateTo), [dateFrom, dateTo]);

  /* --- Filtered totals ----------------------------------------------- */
  const totalRev = useMemo(() => sumFiltered(REV, filteredIdx), [filteredIdx]);
  const totalWages = useMemo(() => sumFiltered(WAGES, filteredIdx), [filteredIdx]);
  const totalAdvertising = useMemo(() => sumFiltered(ADVERTISING, filteredIdx), [filteredIdx]);
  const totalEBITDA = useMemo(() => sumFiltered(EBITDA, filteredIdx), [filteredIdx]);
  const margin = totalRev > 0 ? Math.round((totalEBITDA / totalRev) * 1000) / 10 : 0;

  /* --- Cost structure chart data ------------------------------------- */
  const wagesPct = totalRev > 0 ? Math.round((totalWages / totalRev) * 1000) / 10 : 0;
  const adPct = totalRev > 0 ? Math.round((totalAdvertising / totalRev) * 1000) / 10 : 0;
  const ebitdaPctBar = totalRev > 0 ? Math.round((totalEBITDA / totalRev) * 1000) / 10 : 0;

  const costStructureVData = useMemo(() => [
    {
      name: "Slimming",
      wages: totalWages,
      advertising: totalAdvertising,
      ebitda: totalEBITDA,
      wagesPct,
      adPct,
      ebitdaPct: ebitdaPctBar,
    },
  ], [totalWages, totalAdvertising, totalEBITDA, wagesPct, adPct, ebitdaPctBar]);

  /* KPI Cards */
  const kpis: KPIData[] = useMemo(() => [
    { label: `Total Revenue (${filteredCountLabel(monthCount, "month")})`, value: formatCurrency(totalRev) },
    { label: `Total EBITDA (${filteredCountLabel(monthCount, "month")})`, value: formatCurrency(totalEBITDA) },
    { label: "EBITDA Margin", value: `${margin}%`, target: "30%", targetValue: 30, currentValue: margin },
  ], [totalRev, totalEBITDA, margin, monthCount]);

  /* P&L percentage helper */
  const pctOf = (v: number) => totalRev > 0 ? `${(Math.round((v / totalRev) * 1000) / 10).toFixed(1)}%` : "0.0%";

  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Slimming — EBITDA Deep Dive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rangeLabel} ({filteredCountLabel(monthCount, "month")})
        </p>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Vertical Stacked Bar Chart — Revenue Allocation */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Allocation — Cost Structure</h2>
        <p className="text-sm text-muted-foreground mb-4">How each euro of revenue is allocated</p>
        <div className="h-[220px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={costStructureVData} margin={{ top: 28, right: 10, left: 20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} width={80} />
            <Tooltip content={<VerticalBarTooltip />} />
            <Bar dataKey="wages" stackId="stack" fill="#F59E0B" name="Wages & Salaries" barSize={120}>
              <LabelList dataKey="wagesPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="advertising" stackId="stack" fill="#8B5CF6" name="Advertising & Marketing" barSize={120}>
              <LabelList dataKey="adPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="ebitda" stackId="stack" fill="#22C55E" name="EBITDA / Profit" barSize={120}>
              <LabelList dataKey="ebitdaPct" content={renderTopLabel} />
              <LabelList dataKey="ebitdaPct" content={renderSegmentLabel} />
            </Bar>
            <Legend />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </Card>

      {/* P&L Summary Table */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Profit &amp; Loss Summary — {rangeLabel}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Line Item</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Amount (EUR)</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">% of Revenue</th>
              </tr>
            </thead>
            <tbody>
              {/* Net Revenue */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 font-bold text-foreground">Net Revenue</td>
                <td className="py-2 px-3 text-right font-bold text-foreground">{formatCurrency(totalRev)}</td>
                <td className="py-2 px-3 text-right text-foreground" />
              </tr>
              {/* Wages & Salaries */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">Wages &amp; Salaries</td>
                <td className="py-2 px-3 text-right text-foreground">({formatCurrency(totalWages)})</td>
                <td className="py-2 px-3 text-right text-foreground">{pctOf(totalWages)}</td>
              </tr>
              {/* Advertising & Marketing */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">Advertising &amp; Marketing</td>
                <td className="py-2 px-3 text-right text-foreground">({formatCurrency(totalAdvertising)})</td>
                <td className="py-2 px-3 text-right text-foreground">{pctOf(totalAdvertising)}</td>
              </tr>
              {/* Rent */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">Rent</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
              </tr>
              {/* Utilities */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">Utilities</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
              </tr>
              {/* COGS */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">COGS</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
              </tr>
              {/* SG&A */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">SG&amp;A</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
              </tr>
              {/* EBITDA */}
              <tr className="border-t-2 border-border">
                <td className={`py-2 px-3 font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>EBITDA</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(totalEBITDA)}</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>{margin.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* CI Chat */}
      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function SlimmingEBITDAPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <SlimmingEBITDAContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
