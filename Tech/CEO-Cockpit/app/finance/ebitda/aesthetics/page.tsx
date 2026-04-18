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
import type { Props as LabelProps } from "recharts/types/component/Label";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const REV =       [15377,16340,19589,18326,22212,20187,19635,19023,30000,24000,68000,63000];
const COGS =      [4620,5748,5991,5063,6069,6403,5605,5149,8000,6500,12000,11000];
const WAGES =     [4918,4980,5531,4189,3323,4510,6025,4162,5500,4500,9000,8000];
const SGA =       [1614,3068,3127,4191,4761,2212,2940,610,2000,2500,4000,3500];
const EBITDA =    [4225,2544,4940,4883,8059,7062,5065,9102,13805,6549,8836,10674];
const EBITDA_PCT =[27,16,25,27,36,35,26,48,46,27,13,17];

const MONTH_DATES = monthIndicesToDateObjects(2025, 12);

/* ------------------------------------------------------------------ */
/*  LABEL RENDERERS                                                    */
/* ------------------------------------------------------------------ */

const renderSegmentLabel = (props: LabelProps) => {
  const { x = 0, y = 0, width = 0, height = 0, value } = props as LabelProps & { width: number; height: number };
  if (!value || Math.abs(height as number) < 18) return null;
  return (
    <text
      x={(x as number) + (width as number) / 2}
      y={(y as number) + (height as number) / 2}
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

const renderTopLabel = (props: LabelProps) => {
  const { x = 0, y = 0, width = 0, value } = props as LabelProps & { width: number };
  if (!value) return null;
  return (
    <text
      x={(x as number) + (width as number) / 2}
      y={(y as number) - 8}
      fill="currentColor"
      textAnchor="middle"
      fontSize={12}
      fontWeight="bold"
    >
      EBITDA {value}%
    </text>
  );
};

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
    cogs: "COGS",
    wages: "Wages & Salaries",
    sga: "SG&A",
    other: "Other Costs",
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

function AestheticsEBITDAContent({
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
  const totalCOGS = useMemo(() => sumFiltered(COGS, filteredIdx), [filteredIdx]);
  const totalWages = useMemo(() => sumFiltered(WAGES, filteredIdx), [filteredIdx]);
  const totalSGA = useMemo(() => sumFiltered(SGA, filteredIdx), [filteredIdx]);
  const totalEBITDA = useMemo(() => sumFiltered(EBITDA, filteredIdx), [filteredIdx]);
  const margin = totalRev > 0 ? Math.round((totalEBITDA / totalRev) * 1000) / 10 : 0;
  const otherCosts = totalRev - totalCOGS - totalWages - totalSGA - totalEBITDA;

  /* --- Cost structure chart data ------------------------------------- */
  const cogsPct = totalRev > 0 ? Math.round((totalCOGS / totalRev) * 1000) / 10 : 0;
  const wagesPct = totalRev > 0 ? Math.round((totalWages / totalRev) * 1000) / 10 : 0;
  const sgaPct = totalRev > 0 ? Math.round((totalSGA / totalRev) * 1000) / 10 : 0;
  const otherPct = otherCosts > 0 && totalRev > 0 ? Math.round((otherCosts / totalRev) * 1000) / 10 : 0;
  const ebitdaPctBar = totalRev > 0 ? Math.round((totalEBITDA / totalRev) * 1000) / 10 : 0;

  const verticalBarData = useMemo(() => [
    {
      name: "Aesthetics",
      cogs: totalCOGS,
      wages: totalWages,
      sga: totalSGA,
      ...(otherCosts > 0 ? { other: otherCosts } : {}),
      ebitda: totalEBITDA,
      cogsPct,
      wagesPct,
      sgaPct,
      otherPct,
      ebitdaPct: ebitdaPctBar,
    },
  ], [totalCOGS, totalWages, totalSGA, totalEBITDA, otherCosts, cogsPct, wagesPct, sgaPct, otherPct, ebitdaPctBar]);

  /* KPI Cards */
  const kpis: KPIData[] = useMemo(() => [
    { label: "Total Revenue", value: formatCurrency(totalRev) },
    { label: `Total EBITDA (${filteredCountLabel(monthCount, "month")})`, value: formatCurrency(totalEBITDA) },
    { label: "EBITDA Margin", value: `${margin}%`, target: "30%", targetValue: 30, currentValue: margin },
  ], [totalRev, totalEBITDA, margin, monthCount]);

  /* P&L summary helper */
  const pctOf = (v: number) => totalRev > 0 ? `${(Math.round((v / totalRev) * 1000) / 10).toFixed(1)}%` : "0.0%";

  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aesthetics — EBITDA Deep Dive</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rangeLabel} ({filteredCountLabel(monthCount, "month")})
        </p>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

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
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
                <td className="py-2 px-3 text-right text-muted-foreground">&mdash;</td>
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
                <td className="py-2 px-3 text-right text-foreground">({formatCurrency(totalCOGS)})</td>
                <td className="py-2 px-3 text-right text-foreground">{pctOf(totalCOGS)}</td>
              </tr>
              {/* SG&A */}
              <tr className="border-b border-border">
                <td className="py-2 px-3 text-foreground">SG&amp;A</td>
                <td className="py-2 px-3 text-right text-foreground">({formatCurrency(totalSGA)})</td>
                <td className="py-2 px-3 text-right text-foreground">{pctOf(totalSGA)}</td>
              </tr>
              {/* Other Operating Costs */}
              {otherCosts > 0 && (
                <tr className="border-b border-border">
                  <td className="py-2 px-3 text-foreground">Other Operating Costs</td>
                  <td className="py-2 px-3 text-right text-foreground">({formatCurrency(otherCosts)})</td>
                  <td className="py-2 px-3 text-right text-foreground">{pctOf(otherCosts)}</td>
                </tr>
              )}
              {/* EBITDA */}
              <tr className="border-t-2 border-border">
                <td className={`py-2 px-3 font-bold ${totalEBITDA >= 0 ? "text-emerald-600" : "text-red-600"}`}>EBITDA</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(totalEBITDA)}</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-600" : "text-red-600"}`}>{margin.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Vertical Stacked Bar Chart */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Allocation — Cost Structure</h2>
        <p className="text-sm text-muted-foreground mb-4">Single bar showing how revenue breaks down into costs and profit</p>
        <div className="h-[220px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={verticalBarData} margin={{ top: 24, right: 10, left: 40, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 11 }} />
            <Tooltip content={<VerticalBarTooltip />} />
            <Bar dataKey="cogs" stackId="stack" fill="#3B82F6" name="COGS">
              <LabelList dataKey="cogsPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="wages" stackId="stack" fill="#F59E0B" name="Wages & Salaries">
              <LabelList dataKey="wagesPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="sga" stackId="stack" fill="#8B5CF6" name="SG&A">
              <LabelList dataKey="sgaPct" content={renderSegmentLabel} />
            </Bar>
            {otherCosts > 0 && (
              <Bar dataKey="other" stackId="stack" fill="#9CA3AF" name="Other Costs">
                <LabelList dataKey="otherPct" content={renderSegmentLabel} />
              </Bar>
            )}
            <Bar dataKey="ebitda" stackId="stack" fill="#22C55E" name="EBITDA / Profit">
              <LabelList dataKey="ebitdaPct" content={renderSegmentLabel} />
              <LabelList dataKey="ebitdaPct" content={renderTopLabel} position="top" />
            </Bar>
            <Legend />
          </BarChart>
        </ResponsiveContainer>
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

export default function AestheticsEBITDAPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <AestheticsEBITDAContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
