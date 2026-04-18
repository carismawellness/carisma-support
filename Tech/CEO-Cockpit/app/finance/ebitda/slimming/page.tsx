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
const REV =       [0,0,0,0,3803,0,6502,7418,8957,1894,5000,4000];
const WAGES =     [0,0,0,0,360,360,360,360,360,360,360,360];
const ADVERTISING=[0,0,0,0,0,1037,769,710,513,505,500,400];
const EBITDA =    [0,0,0,0,3443,-1397,5373,6348,8084,1029,4140,3240];

/* ------------------------------------------------------------------ */
/*  COMPUTED TOTALS (May–Dec only)                                     */
/* ------------------------------------------------------------------ */

const ACTIVE_START = 4; // May index
const sum = (arr: number[]) => arr.slice(ACTIVE_START).reduce((a, b) => a + b, 0);

const totalRev = sum(REV);
const totalWages = sum(WAGES);
const totalAdvertising = sum(ADVERTISING);
const totalEBITDA = sum(EBITDA);
const margin = Math.round((totalEBITDA / totalRev) * 1000) / 10;
const activeMonths = REV.slice(ACTIVE_START).filter((r) => r > 0).length;

/* ------------------------------------------------------------------ */
/*  COST STRUCTURE CHART DATA                                          */
/* ------------------------------------------------------------------ */

const wagesPct = Math.round((totalWages / totalRev) * 1000) / 10;
const adPct = Math.round((totalAdvertising / totalRev) * 1000) / 10;
const ebitdaPctBar = Math.round((totalEBITDA / totalRev) * 1000) / 10;

const costStructureData = [
  {
    name: "Slimming",
    wages: wagesPct,
    advertising: adPct,
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
    wages: { label: "Wages & Salaries", total: totalWages },
    advertising: { label: "Advertising & Marketing", total: totalAdvertising },
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

function SlimmingEBITDAContent() {
  /* KPI Cards */
  const kpis: KPIData[] = [
    { label: "Total EBITDA (2025)", value: formatCurrency(totalEBITDA) },
    { label: "EBITDA Margin", value: `${margin}%`, target: "30%", targetValue: 30, currentValue: margin },
    { label: "Total Revenue", value: formatCurrency(totalRev) },
    { label: "Active Months", value: `${activeMonths}` },
  ];

  /* P&L percentage helper */
  const pctOf = (v: number) => `${(Math.round((v / totalRev) * 1000) / 10).toFixed(1)}%`;

  return (
    <>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Slimming — EBITDA Deep Dive</h1>
        <p className="text-sm text-muted-foreground mt-1">2025 | Operations started May 2025</p>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* P&L Summary Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profit &amp; Loss Summary — May to Dec 2025</h2>
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
            <Bar dataKey="wages" stackId="stack" fill="#F59E0B" name="Wages & Salaries" />
            <Bar dataKey="advertising" stackId="stack" fill="#8B5CF6" name="Advertising & Marketing" />
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
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Wages</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Advertising</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">EBITDA</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">EBITDA %</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.slice(ACTIVE_START).map((month, idx) => {
                const i = idx + ACTIVE_START;
                // Skip months where both revenue and EBITDA are 0
                if (REV[i] === 0 && EBITDA[i] === 0) return null;
                const monthMargin = REV[i] > 0
                  ? Math.round((EBITDA[i] / REV[i]) * 1000) / 10
                  : EBITDA[i] < 0 ? -100 : 0;
                const badgeClass =
                  monthMargin < 0
                    ? "bg-red-100 text-red-800"
                    : monthMargin >= 30
                    ? "bg-emerald-100 text-emerald-800"
                    : monthMargin >= 20
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800";
                return (
                  <tr key={month} className="border-b border-border">
                    <td className="py-2 px-3 font-medium text-foreground">{month}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(REV[i])}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(WAGES[i])}</td>
                    <td className="py-2 px-3 text-right text-foreground">{formatCurrency(ADVERTISING[i])}</td>
                    <td className={`py-2 px-3 text-right font-bold ${EBITDA[i] >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(EBITDA[i])}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {monthMargin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="border-t-2 border-border font-bold">
                <td className="py-2 px-3 text-foreground">Total</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalRev)}</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalWages)}</td>
                <td className="py-2 px-3 text-right text-foreground">{formatCurrency(totalAdvertising)}</td>
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

export default function SlimmingEBITDAPage() {
  return (
    <DashboardShell>
      {() => <SlimmingEBITDAContent />}
    </DashboardShell>
  );
}
