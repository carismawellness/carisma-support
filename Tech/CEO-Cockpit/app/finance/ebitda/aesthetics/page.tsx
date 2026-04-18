"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import { formatCurrency } from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan 25","Feb 25","Mar 25","Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25"];
const REV =       [15377,16340,19589,18326,22212,20187,19635,19023,30000,24000,68000,63000];
const COGS =      [4620,5748,5991,5063,6069,6403,5605,5149,8000,6500,12000,11000];
const WAGES =     [4918,4980,5531,4189,3323,4510,6025,4162,5500,4500,9000,8000];
const SGA =       [1614,3068,3127,4191,4761,2212,2940,610,2000,2500,4000,3500];
const EBITDA =    [4225,2544,4940,4883,8059,7062,5065,9102,13805,6549,8836,10674];
const EBITDA_PCT =[27,16,25,27,36,35,26,48,46,27,13,17];

/* ------------------------------------------------------------------ */
/*  COMPUTED TOTALS                                                    */
/* ------------------------------------------------------------------ */

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const totalRev = sum(REV);
const totalCOGS = sum(COGS);
const totalWages = sum(WAGES);
const totalSGA = sum(SGA);
const totalEBITDA = sum(EBITDA);
const margin = Math.round((totalEBITDA / totalRev) * 1000) / 10; // one decimal
const otherCosts = totalRev - totalCOGS - totalWages - totalSGA - totalEBITDA;

/* ------------------------------------------------------------------ */
/*  COST STRUCTURE CHART DATA                                          */
/* ------------------------------------------------------------------ */

const cogsPct = Math.round((totalCOGS / totalRev) * 1000) / 10;
const wagesPct = Math.round((totalWages / totalRev) * 1000) / 10;
const sgaPct = Math.round((totalSGA / totalRev) * 1000) / 10;
const otherPct = otherCosts > 0 ? Math.round((otherCosts / totalRev) * 1000) / 10 : 0;
const ebitdaPctBar = Math.round((totalEBITDA / totalRev) * 1000) / 10;

const costStructureData = [
  {
    name: "Aesthetics",
    cogs: cogsPct,
    wages: wagesPct,
    sga: sgaPct,
    ...(otherCosts > 0 ? { other: otherPct } : {}),
    ebitda: ebitdaPctBar,
  },
];

/* ------------------------------------------------------------------ */
/*  CUSTOM TOOLTIP                                                     */
/* ------------------------------------------------------------------ */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CostStructureTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload) return null;
  const labelMap: Record<string, { label: string; total: number }> = {
    cogs: { label: "COGS", total: totalCOGS },
    wages: { label: "Wages & Salaries", total: totalWages },
    sga: { label: "SG&A", total: totalSGA },
    other: { label: "Other Costs", total: otherCosts },
    ebitda: { label: "EBITDA / Profit", total: totalEBITDA },
  };
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
      {payload.map((entry) => {
        const info = labelMap[entry.dataKey];
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-foreground">{info?.label ?? entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}%</span>
            <span className="text-muted-foreground">({formatCurrency(info?.total ?? 0)})</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function AestheticsEBITDAContent() {
  /* KPI Cards */
  const kpis: KPIData[] = [
    { label: "Total EBITDA (2025)", value: formatCurrency(totalEBITDA) },
    { label: "EBITDA Margin", value: `${margin}%`, target: "30%", targetValue: 30, currentValue: margin },
    { label: "Total Revenue", value: formatCurrency(totalRev) },
    { label: "vs Prior Year", value: "N/A (Year 1)" },
  ];

  /* P&L summary rows */
  const pctOf = (v: number) => `${(Math.round((v / totalRev) * 1000) / 10).toFixed(1)}%`;

  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aesthetics — EBITDA Deep Dive</h1>
        <p className="text-sm text-muted-foreground mt-1">Full Year 2025 | Year 1 of operations</p>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* P&L Summary Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profit &amp; Loss Summary — Full Year 2025</h2>
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
                <td className="py-2 px-3 text-right font-bold text-foreground">100.0%</td>
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
              <tr className={`border-b border-border ${totalEBITDA >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                <td className={`py-2 px-3 font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>EBITDA</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(totalEBITDA)}</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-700" : "text-red-700"}`}>{margin.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 100% Stacked Cost Structure Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Allocation — Cost Structure</h2>
        <p className="text-sm text-muted-foreground mb-4">How each euro of revenue is allocated</p>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={costStructureData} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
            <Tooltip content={<CostStructureTooltip />} />
            <Bar dataKey="cogs" stackId="stack" fill="#3B82F6" name="COGS" />
            <Bar dataKey="wages" stackId="stack" fill="#F59E0B" name="Wages & Salaries" />
            <Bar dataKey="sga" stackId="stack" fill="#8B5CF6" name="SG&A" />
            {otherCosts > 0 && <Bar dataKey="other" stackId="stack" fill="#9CA3AF" name="Other Costs" />}
            <Bar dataKey="ebitda" stackId="stack" fill="#22C55E" name="EBITDA / Profit" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Monthly P&L Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Monthly P&amp;L Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Month</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Revenue</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">COGS</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Wages</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">SG&amp;A</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">EBITDA</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">EBITDA %</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month, i) => {
                if (REV[i] === 0) return null;
                const pct = EBITDA_PCT[i];
                const badgeClass =
                  pct >= 30
                    ? "bg-emerald-100 text-emerald-800"
                    : pct >= 20
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800";
                return (
                  <tr key={month} className="border-b border-border">
                    <td className="py-2 px-3 font-medium text-foreground">{month}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(REV[i])}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(COGS[i])}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(WAGES[i])}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(SGA[i])}</td>
                    <td className={`py-2 px-3 text-right font-bold ${EBITDA[i] >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(EBITDA[i])}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="border-t-2 border-border font-bold">
                <td className="py-2 px-3 text-foreground">Total</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalRev)}</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalCOGS)}</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalWages)}</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalSGA)}</td>
                <td className={`py-2 px-3 text-right font-bold ${totalEBITDA >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(totalEBITDA)}
                </td>
                <td className="py-2 px-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    margin >= 30
                      ? "bg-emerald-100 text-emerald-800"
                      : margin >= 20
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {margin.toFixed(1)}%
                  </span>
                </td>
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

export default function AestheticsEBITDAPage() {
  return (
    <DashboardShell>
      {() => <AestheticsEBITDAContent />}
    </DashboardShell>
  );
}
