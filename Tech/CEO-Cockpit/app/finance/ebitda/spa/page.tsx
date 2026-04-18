"use client";

import { useState } from "react";
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
  CartesianGrid,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface MonthlyPL {
  revenue: number;
  salaries: number;
  sga: number;
  rent: number;
}

interface SpaLocation {
  id: string;
  name: string;
  color: string;
  years: string[];
  data: (MonthlyPL | null)[];
}

type YearFilter = "2024" | "2025" | "All";

/* ------------------------------------------------------------------ */
/*  DATA — 8 Spa Locations, Jan 2024 – Dec 2025 (24 months)           */
/* ------------------------------------------------------------------ */

function buildData(
  rev: (number | null)[],
  sal: (number | null)[],
  sga: (number | null)[],
  rent: (number | null)[]
): (MonthlyPL | null)[] {
  return rev.map((r, i) => {
    if (r === null || sal[i] === null || sga[i] === null || rent[i] === null) return null;
    return { revenue: r, salaries: sal[i]!, sga: sga[i]!, rent: rent[i]! };
  });
}

const LOCATIONS: SpaLocation[] = [
  {
    id: "inter",
    name: "InterContinental",
    color: "#1B3A4B",
    years: ["2024", "2025"],
    data: buildData(
      [38806,46282,52520,51826,48362,47792,49712,54569,53577,52550,46854,35540, 36040,45313,49185,48561,49080,42226,50103,60745,55492,59595,53433,43700],
      [18214,15252,17674,15803,13796,13936,13845,15315,11190,13384,13901,11687, 13151,12099,23048,18814,19153,22455,22736,22120,20955,23982,25689,19000],
      [4690,3295,416,495,143,484,556,586,487,533,1246,2548, 2914,1965,1453,1735,1792,1603,1586,1536,1630,1654,1995,1800],
      [4400,4400,4400,4400,4400,4400,5100,5100,5100,5100,5100,5100, 5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100],
    ),
  },
  {
    id: "hugos",
    name: "Hugo's",
    color: "#96B2B2",
    years: ["2024", "2025"],
    data: buildData(
      [39581,42237,47242,44581,41316,27918,28886,35135,44014,46741,51718,39818, 43373,48550,61182,57333,49058,43157,40712,45157,47571,60531,47660,36500],
      [11971,12210,13883,12319,11346,11769,11716,11145,11405,10809,10855,10913, 13708,27739,28752,21535,20266,18415,18104,19822,17528,21600,19583,15000],
      [753,0,0,1669,1494,3038,3503,979,1249,1592,35,1245, 1618,1648,1731,1993,1993,1993,1052,1353,1482,1679,1365,1200],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0],
    ),
  },
  {
    id: "hyatt",
    name: "Hyatt",
    color: "#B79E61",
    years: ["2024", "2025"],
    data: buildData(
      [18623,28490,34882,25968,23240,24483,28983,25934,27200,26186,24628,20627, 23517,30813,29519,24622,25531,22240,23569,24503,24445,24688,22335,20700],
      [7444,7314,9763,7749,8877,10833,9429,6198,8772,9134,5597,6527, 10837,7808,9973,10404,10787,11182,10403,11771,13491,8678,10078,9000],
      [0,0,0,0,0,0,0,0,0,0,0,33, 39,25,25,25,165,258,47,134,81,397,66,100],
      [0,0,0,0,0,0,0,0,0,0,0,0, 1366,1366,1366,1366,1366,1366,1407,1407,1407,1407,1407,1407],
    ),
  },
  {
    id: "ramla",
    name: "Ramla",
    color: "#8EB093",
    years: ["2024", "2025"],
    data: buildData(
      [13911,23373,23672,23883,24343,22418,20569,20430,23952,22530,21930,17767, 21261,24740,29739,27299,32358,25052,27269,33298,33907,49210,34970,29800],
      [3477,3145,2910,2945,5306,6069,5066,5047,7602,7806,9216,8603, 10117,6209,5272,11526,13114,15310,13630,8946,16985,11914,13566,12000],
      [0,0,0,603,0,0,0,0,0,0,0,279, 238,320,348,448,448,448,331,252,310,399,264,300],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0],
    ),
  },
  {
    id: "labranda",
    name: "Labranda",
    color: "#E07A5F",
    years: ["2024", "2025"],
    data: buildData(
      [8939,9049,12329,13659,20261,16006,16652,15518,13717,18301,18949,13188, 12637,13483,16739,17967,19812,20423,23015,27132,28589,23819,20133,15100],
      [5304,5536,8568,4928,5528,1637,6051,3677,6252,4099,7060,7565, 2714,2920,7425,8115,9745,5567,4438,8406,13328,10903,7313,6000],
      [1582,1115,823,1100,866,689,731,724,698,851,702,730, 705,697,766,741,715,715,819,881,722,775,777,700],
      [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000, 1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],
    ),
  },
  {
    id: "sunny",
    name: "Sunny Coast",
    color: "#4A90D9",
    years: ["2024", "2025"],
    data: buildData(
      [8488,10958,11558,17890,17408,17000,20711,19279,19624,20456,19926,15877, 10154,12312,12923,15724,19948,17615,21755,24891,28589,27076,20775,11600],
      [11587,8572,8210,8156,8422,10126,8745,7522,6490,5871,6013,8621, 6804,9089,4550,6495,7610,8146,8481,7188,12232,17011,12836,8500],
      [621,399,155,157,361,384,157,168,185,119,119,413, 535,483,603,495,526,372,380,461,439,676,451,400],
      [2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833, 1097,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833],
    ),
  },
  {
    id: "excelsior",
    name: "Excelsior",
    color: "#7C3AED",
    years: ["2025"],
    data: buildData(
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,21495,22574,25634,24960,24192,20000],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,2708,10663,15772,12780,13038,11000],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,0,0,0,0,0,0],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,0,0,0,0,0,0],
    ),
  },
  {
    id: "novotel",
    name: "Novotel",
    color: "#DC2626",
    years: ["2025"],
    data: buildData(
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,3325,14194,10700],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,0,1447,1200],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,392,205,200],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,0,0,0],
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function getIndices(year: YearFilter): [number, number] {
  if (year === "2024") return [0, 12];
  if (year === "2025") return [12, 24];
  return [0, 24];
}

function sumField(loc: SpaLocation, start: number, end: number, field: keyof MonthlyPL): number {
  let total = 0;
  for (let i = start; i < end; i++) {
    const m = loc.data[i];
    if (m) total += m[field];
  }
  return total;
}

function activeMonths(loc: SpaLocation, start: number, end: number): number {
  let count = 0;
  for (let i = start; i < end; i++) {
    if (loc.data[i]) count++;
  }
  return count;
}

function pctOf(part: number, whole: number): string {
  if (whole === 0) return "0.0%";
  return `${(Math.round((part / whole) * 1000) / 10).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  CUSTOM TOOLTIP FOR STACKED BAR                                     */
/* ------------------------------------------------------------------ */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CostStructureTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function SpaEBITDAContent() {
  const [year, setYear] = useState<YearFilter>("2025");
  const [start, end] = getIndices(year);

  /* ---- Consolidated totals ---- */
  let totalRev = 0;
  let totalSal = 0;
  let totalSga = 0;
  let totalRent = 0;
  let activeLocCount = 0;

  const locSummaries = LOCATIONS.map((loc) => {
    const rev = sumField(loc, start, end, "revenue");
    const sal = sumField(loc, start, end, "salaries");
    const sga = sumField(loc, start, end, "sga");
    const rent = sumField(loc, start, end, "rent");
    const ebitda = rev - sal - sga - rent;
    const months = activeMonths(loc, start, end);

    totalRev += rev;
    totalSal += sal;
    totalSga += sga;
    totalRent += rent;
    if (months > 0) activeLocCount++;

    return { loc, rev, sal, sga, rent, ebitda, months };
  });

  const totalEbitda = totalRev - totalSal - totalSga - totalRent;
  const margin = totalRev > 0 ? Math.round((totalEbitda / totalRev) * 1000) / 10 : 0;

  /* ---- YoY growth (only for 2025 filter) ---- */
  let yoyGrowth: number | null = null;
  if (year === "2025") {
    let rev2024 = 0;
    LOCATIONS.forEach((loc) => {
      rev2024 += sumField(loc, 0, 12, "revenue");
    });
    if (rev2024 > 0) {
      yoyGrowth = Math.round(((totalRev - rev2024) / rev2024) * 1000) / 10;
    }
  }

  /* ---- KPI Cards ---- */
  const kpis: KPIData[] = [
    { label: "Spa Total Revenue", value: formatCurrency(totalRev) },
    { label: "Spa Total EBITDA", value: formatCurrency(totalEbitda) },
    { label: "Spa EBITDA Margin", value: `${margin.toFixed(1)}%`, target: "40%", targetValue: 40, currentValue: margin },
    { label: "Active Locations", value: `${activeLocCount}` },
  ];

  if (year === "2025" && yoyGrowth !== null) {
    kpis.push({ label: "vs 2024 Revenue", value: `${yoyGrowth >= 0 ? "+" : ""}${yoyGrowth.toFixed(1)}%`, trend: yoyGrowth });
  }

  /* ---- 100% Stacked Cost Structure Data ---- */
  const costStructureData = locSummaries
    .filter((s) => s.months > 0)
    .map((s) => {
      const r = s.rev || 1;
      return {
        name: s.loc.name,
        Wages: Math.round((s.sal / r) * 1000) / 10,
        "SG&A": Math.round((s.sga / r) * 1000) / 10,
        Rent: Math.round((s.rent / r) * 1000) / 10,
        EBITDA: Math.round((s.ebitda / r) * 1000) / 10,
      };
    });

  return (
    <>
      {/* Title & Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spa — EBITDA Deep Dive</h1>
          <p className="text-sm text-muted-foreground mt-1">Per-location P&amp;L breakdown | 8 hotel spa locations</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {(["2024", "2025", "All"] as YearFilter[]).map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                year === y
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Per-Location P&L Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locSummaries
          .filter((s) => s.months > 0)
          .map((s) => {
            const ebitdaMargin = s.rev > 0 ? Math.round((s.ebitda / s.rev) * 1000) / 10 : 0;
            const badgeClass =
              ebitdaMargin >= 50
                ? "bg-emerald-100 text-emerald-800"
                : ebitdaMargin >= 30
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800";

            return (
              <Card
                key={s.loc.id}
                className="p-6 border-l-4"
                style={{ borderLeftColor: s.loc.color }}
              >
                <h3 className="text-lg font-semibold text-foreground">{s.loc.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.months} months active</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-1 px-2 font-semibold text-muted-foreground">Line Item</th>
                        <th className="text-right py-1 px-2 font-semibold text-muted-foreground">Amount (EUR)</th>
                        <th className="text-right py-1 px-2 font-semibold text-muted-foreground">% of Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Net Revenue */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 font-bold text-foreground">Net Revenue</td>
                        <td className="py-1.5 px-2 text-right font-bold text-foreground">{formatCurrency(s.rev)}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-foreground">100.0%</td>
                      </tr>
                      {/* Wages & Salaries */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">Wages &amp; Salaries</td>
                        <td className="py-1.5 px-2 text-right text-foreground">({formatCurrency(s.sal)})</td>
                        <td className="py-1.5 px-2 text-right text-foreground">{pctOf(s.sal, s.rev)}</td>
                      </tr>
                      {/* SG&A */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">SG&amp;A</td>
                        <td className="py-1.5 px-2 text-right text-foreground">({formatCurrency(s.sga)})</td>
                        <td className="py-1.5 px-2 text-right text-foreground">{pctOf(s.sga, s.rev)}</td>
                      </tr>
                      {/* Rent */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">Rent</td>
                        <td className="py-1.5 px-2 text-right text-foreground">
                          {s.rent > 0 ? `(${formatCurrency(s.rent)})` : "\u2014"}
                        </td>
                        <td className="py-1.5 px-2 text-right text-foreground">
                          {s.rent > 0 ? pctOf(s.rent, s.rev) : "\u2014"}
                        </td>
                      </tr>
                      {/* Advertising & Marketing */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">Advertising &amp; Marketing</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                      </tr>
                      {/* Utilities */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">Utilities</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                      </tr>
                      {/* COGS */}
                      <tr className="border-b border-border">
                        <td className="py-1.5 px-2 text-foreground">COGS</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                        <td className="py-1.5 px-2 text-right text-muted-foreground">&mdash;</td>
                      </tr>
                      {/* EBITDA */}
                      <tr className="border-b border-border">
                        <td className={`py-1.5 px-2 font-bold ${s.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}>EBITDA</td>
                        <td className={`py-1.5 px-2 text-right font-bold ${s.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatCurrency(s.ebitda)}
                        </td>
                        <td className="py-1.5 px-2 text-right" />
                      </tr>
                      {/* EBITDA % */}
                      <tr>
                        <td className="py-1.5 px-2 font-bold text-foreground">EBITDA %</td>
                        <td className="py-1.5 px-2 text-right" />
                        <td className="py-1.5 px-2 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                            {ebitdaMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
      </div>

      {/* 100% Stacked Cost Structure Comparison */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Allocation by Location</h2>
        <p className="text-sm text-muted-foreground mb-4">Cost structure comparison across all spa locations</p>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={costStructureData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip content={<CostStructureTooltip />} />
            <Legend />
            <Bar dataKey="Wages" stackId="stack" fill="#F59E0B" name="Wages" />
            <Bar dataKey="SG&A" stackId="stack" fill="#8B5CF6" name="SG&A" />
            <Bar dataKey="Rent" stackId="stack" fill="#9CA3AF" name="Rent" />
            <Bar dataKey="EBITDA" stackId="stack" fill="#22C55E" name="EBITDA" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* CI Chat */}
      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function SpaEBITDAPage() {
  return (
    <DashboardShell>
      {() => <SpaEBITDAContent />}
    </DashboardShell>
  );
}
