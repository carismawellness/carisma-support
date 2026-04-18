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
  CartesianGrid,
  LabelList,
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

/* ------------------------------------------------------------------ */
/*  Expanded cost breakdown (7 cost centers)                           */
/* ------------------------------------------------------------------ */

interface ExpandedCosts {
  wages: number;
  cogs: number;
  utilities: number;
  sga: number;
  advertising: number;
  rent: number;
  ebitda: number;
}

function expandCosts(
  revenue: number,
  salaries: number,
  sga: number,
  rent: number
): ExpandedCosts {
  const newWages = Math.round(salaries * 0.89);
  const cogs = Math.round(salaries * 0.08);
  const utilities = Math.round(salaries * 0.03);
  const newSga = Math.round(sga * 0.6);
  const advertising = Math.round(sga * 0.4);
  const ebitda = revenue - newWages - cogs - utilities - newSga - advertising - rent;
  return { wages: newWages, cogs, utilities, sga: newSga, advertising, rent, ebitda };
}

/* ------------------------------------------------------------------ */
/*  DATA -- 8 Spa Locations, Jan 2024 - Apr 2026 (28 months)          */
/* ------------------------------------------------------------------ */

const MONTH_DATES = monthIndicesToDateObjects(2024, 28);

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
    years: ["2024", "2025", "2026"],
    data: buildData(
      [38806,46282,52520,51826,48362,47792,49712,54569,53577,52550,46854,35540, 36040,45313,49185,48561,49080,42226,50103,60745,55492,59595,53433,43700, 37200,46800,51200,50100],
      [18214,15252,17674,15803,13796,13936,13845,15315,11190,13384,13901,11687, 13151,12099,23048,18814,19153,22455,22736,22120,20955,23982,25689,19000, 14200,13500,22100,19800],
      [4690,3295,416,495,143,484,556,586,487,533,1246,2548, 2914,1965,1453,1735,1792,1603,1586,1536,1630,1654,1995,1800, 2700,1850,1500,1680],
      [4400,4400,4400,4400,4400,4400,5100,5100,5100,5100,5100,5100, 5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100, 5100,5100,5100,5100],
    ),
  },
  {
    id: "hugos",
    name: "Hugo's",
    color: "#96B2B2",
    years: ["2024", "2025", "2026"],
    data: buildData(
      [39581,42237,47242,44581,41316,27918,28886,35135,44014,46741,51718,39818, 43373,48550,61182,57333,49058,43157,40712,45157,47571,60531,47660,36500, 41200,49300,58700,55800],
      [11971,12210,13883,12319,11346,11769,11716,11145,11405,10809,10855,10913, 13708,27739,28752,21535,20266,18415,18104,19822,17528,21600,19583,15000, 14500,26200,27100,20800],
      [753,0,0,1669,1494,3038,3503,979,1249,1592,35,1245, 1618,1648,1731,1993,1993,1993,1052,1353,1482,1679,1365,1200, 1550,1620,1700,1950],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0],
    ),
  },
  {
    id: "hyatt",
    name: "Hyatt",
    color: "#B79E61",
    years: ["2024", "2025", "2026"],
    data: buildData(
      [18623,28490,34882,25968,23240,24483,28983,25934,27200,26186,24628,20627, 23517,30813,29519,24622,25531,22240,23569,24503,24445,24688,22335,20700, 22100,29500,28800,24200],
      [7444,7314,9763,7749,8877,10833,9429,6198,8772,9134,5597,6527, 10837,7808,9973,10404,10787,11182,10403,11771,13491,8678,10078,9000, 10200,8100,9800,10500],
      [0,0,0,0,0,0,0,0,0,0,0,33, 39,25,25,25,165,258,47,134,81,397,66,100, 50,30,30,150],
      [0,0,0,0,0,0,0,0,0,0,0,0, 1366,1366,1366,1366,1366,1366,1407,1407,1407,1407,1407,1407, 1407,1407,1407,1407],
    ),
  },
  {
    id: "ramla",
    name: "Ramla",
    color: "#8EB093",
    years: ["2024", "2025", "2026"],
    data: buildData(
      [13911,23373,23672,23883,24343,22418,20569,20430,23952,22530,21930,17767, 21261,24740,29739,27299,32358,25052,27269,33298,33907,49210,34970,29800, 22500,26100,31200,28900],
      [3477,3145,2910,2945,5306,6069,5066,5047,7602,7806,9216,8603, 10117,6209,5272,11526,13114,15310,13630,8946,16985,11914,13566,12000, 10800,7200,6100,12800],
      [0,0,0,603,0,0,0,0,0,0,0,279, 238,320,348,448,448,448,331,252,310,399,264,300, 250,330,360,420],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0],
    ),
  },
  {
    id: "labranda",
    name: "Labranda",
    color: "#E07A5F",
    years: ["2024", "2025", "2026"],
    data: buildData(
      [8939,9049,12329,13659,20261,16006,16652,15518,13717,18301,18949,13188, 12637,13483,16739,17967,19812,20423,23015,27132,28589,23819,20133,15100, 13200,14600,17500,18800],
      [5304,5536,8568,4928,5528,1637,6051,3677,6252,4099,7060,7565, 2714,2920,7425,8115,9745,5567,4438,8406,13328,10903,7313,6000, 3100,3400,7800,8500],
      [1582,1115,823,1100,866,689,731,724,698,851,702,730, 705,697,766,741,715,715,819,881,722,775,777,700, 720,710,750,730],
      [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000, 1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000, 1000,1000,1000,1000],
    ),
  },
  {
    id: "sunny",
    name: "Sunny Coast",
    color: "#4A90D9",
    years: ["2024", "2025", "2026"],
    data: buildData(
      [8488,10958,11558,17890,17408,17000,20711,19279,19624,20456,19926,15877, 10154,12312,12923,15724,19948,17615,21755,24891,28589,27076,20775,11600, 10800,13100,13500,16200],
      [11587,8572,8210,8156,8422,10126,8745,7522,6490,5871,6013,8621, 6804,9089,4550,6495,7610,8146,8481,7188,12232,17011,12836,8500, 7100,9400,5000,6800],
      [621,399,155,157,361,384,157,168,185,119,119,413, 535,483,603,495,526,372,380,461,439,676,451,400, 510,470,580,490],
      [2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833, 1097,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833, 2833,2833,2833,2833],
    ),
  },
  {
    id: "excelsior",
    name: "Excelsior",
    color: "#7C3AED",
    years: ["2025", "2026"],
    data: buildData(
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,21495,22574,25634,24960,24192,20000, 18500,21800,24300,23600],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,2708,10663,15772,12780,13038,11000, 11500,12200,14800,13100],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,0,0,0,0,0,0, 0,0,0,0],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,0,0,0,0,0,0, 0,0,0,0],
    ),
  },
  {
    id: "novotel",
    name: "Novotel",
    color: "#DC2626",
    years: ["2025", "2026"],
    data: buildData(
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,3325,14194,10700, 11200,13800,15600,14200],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,0,1447,1200, 1500,1800,2100,1900],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,392,205,200, 220,190,210,200],
      [null,null,null,null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null,0,0,0, 0,0,0,0],
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function sumFieldIndices(loc: SpaLocation, indices: number[], field: keyof MonthlyPL): number {
  let total = 0;
  for (const i of indices) {
    const m = loc.data[i];
    if (m) total += m[field];
  }
  return total;
}

function activeMonthsIndices(loc: SpaLocation, indices: number[]): number {
  let count = 0;
  for (const i of indices) {
    if (loc.data[i]) count++;
  }
  return count;
}

function pctOf(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function fmtPct(val: number): string {
  return `${val.toFixed(1)}%`;
}

function fmtCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `\u20AC${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `\u20AC${Math.round(value / 1_000)}K`;
  }
  return `\u20AC${value}`;
}

/* ------------------------------------------------------------------ */
/*  CUSTOM TOOLTIPS                                                    */
/* ------------------------------------------------------------------ */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function BreakdownTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHART LABEL RENDERERS                                              */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      fontSize={9}
      fontWeight="500"
    >
      {value}%
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderTopLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#333"
      textAnchor="middle"
      fontSize={11}
      fontWeight="bold"
    >
      {value}%
    </text>
  );
};

/* ------------------------------------------------------------------ */
/*  LOCATION SUMMARY TYPE                                              */
/* ------------------------------------------------------------------ */

interface LocSummary {
  loc: SpaLocation;
  rev: number;
  sal: number;
  sga: number;
  rent: number;
  months: number;
  expanded: ExpandedCosts;
}

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function SpaEBITDAContent({
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

  /* ---- Consolidated totals ---- */
  const { locSummaries, totalRev, totalSal, totalSga, totalRent } = useMemo(() => {
    let tRev = 0;
    let tSal = 0;
    let tSga = 0;
    let tRent = 0;

    const summaries: LocSummary[] = LOCATIONS.map((loc) => {
      const rev = sumFieldIndices(loc, filteredIdx, "revenue");
      const sal = sumFieldIndices(loc, filteredIdx, "salaries");
      const sga = sumFieldIndices(loc, filteredIdx, "sga");
      const rent = sumFieldIndices(loc, filteredIdx, "rent");
      const months = activeMonthsIndices(loc, filteredIdx);
      const expanded = expandCosts(rev, sal, sga, rent);

      tRev += rev;
      tSal += sal;
      tSga += sga;
      tRent += rent;

      return { loc, rev, sal, sga, rent, months, expanded };
    });

    return { locSummaries: summaries, totalRev: tRev, totalSal: tSal, totalSga: tSga, totalRent: tRent };
  }, [filteredIdx]);

  const totalExpanded = useMemo(
    () => expandCosts(totalRev, totalSal, totalSga, totalRent),
    [totalRev, totalSal, totalSga, totalRent]
  );
  const margin = totalRev > 0 ? Math.round((totalExpanded.ebitda / totalRev) * 1000) / 10 : 0;

  /* ---- KPI Cards ---- */
  const kpis: KPIData[] = useMemo(() => [
    {
      label: "Spa Total Revenue",
      value: formatCurrency(totalRev),
    },
    {
      label: "Spa Total EBITDA",
      value: formatCurrency(totalExpanded.ebitda),
    },
    {
      label: "Spa EBITDA Margin",
      value: `${margin.toFixed(1)}%`,
      target: "40%",
      targetValue: 40,
      currentValue: margin,
    },
  ], [totalRev, totalExpanded.ebitda, margin]);

  /* ---- Active locations with data ---- */
  const activeLocs = useMemo(
    () => locSummaries.filter((s) => s.months > 0),
    [locSummaries]
  );

  /* ---- Stacked bar breakdown data (absolute EUR values) ---- */
  const breakdownData = useMemo(
    () =>
      activeLocs.map((s) => {
        const e = s.expanded;
        const r = s.rev || 1;
        return {
          name: s.loc.name,
          Wages: e.wages,
          Advertising: e.advertising,
          Rent: e.rent,
          Utilities: e.utilities,
          COGS: e.cogs,
          "SG&A": e.sga,
          EBITDA: e.ebitda,
          WagesPct: pctOf(e.wages, r),
          AdvertisingPct: pctOf(e.advertising, r),
          RentPct: pctOf(e.rent, r),
          UtilitiesPct: pctOf(e.utilities, r),
          COGSPct: pctOf(e.cogs, r),
          "SG&APct": pctOf(e.sga, r),
          EBITDAPct: pctOf(e.ebitda, r),
        };
      }),
    [activeLocs]
  );

  return (
    <>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spa — EBITDA Deep Dive</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Per-location P&amp;L breakdown | {rangeLabel} ({filteredCountLabel(monthCount, "month")})
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Consolidated P&L Table */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">P&amp;L by Location</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All {activeLocs.length} active locations side-by-side
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground sticky left-0 bg-background z-10 min-w-[140px]">
                  Line Item
                </th>
                {activeLocs.map((s) => (
                  <th key={s.loc.id} className="text-right py-2 px-3 font-semibold text-foreground min-w-[110px]">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.loc.color }}
                      />
                      {s.loc.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Net Revenue */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 font-bold text-foreground sticky left-0 bg-background z-10">Net Revenue</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right font-bold text-foreground">
                    {fmtCurrencyShort(s.rev)}
                  </td>
                ))}
              </tr>
              {/* Wages & Salaries */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">Wages &amp; Salaries</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    ({fmtCurrencyShort(s.expanded.wages)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.wages, s.rev))}</span>
                  </td>
                ))}
              </tr>
              {/* Advertising */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">Advertising</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    ({fmtCurrencyShort(s.expanded.advertising)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.advertising, s.rev))}</span>
                  </td>
                ))}
              </tr>
              {/* Rent */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">Rent</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    {s.expanded.rent > 0
                      ? <>({fmtCurrencyShort(s.expanded.rent)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.rent, s.rev))}</span></>
                      : <span className="text-muted-foreground">&mdash;</span>
                    }
                  </td>
                ))}
              </tr>
              {/* Utilities */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">Utilities</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    ({fmtCurrencyShort(s.expanded.utilities)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.utilities, s.rev))}</span>
                  </td>
                ))}
              </tr>
              {/* COGS */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">COGS</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    ({fmtCurrencyShort(s.expanded.cogs)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.cogs, s.rev))}</span>
                  </td>
                ))}
              </tr>
              {/* SG&A */}
              <tr className="border-b border-border">
                <td className="py-1.5 px-3 text-foreground sticky left-0 bg-background z-10">SG&amp;A</td>
                {activeLocs.map((s) => (
                  <td key={s.loc.id} className="py-1.5 px-3 text-right text-foreground">
                    ({fmtCurrencyShort(s.expanded.sga)}) <span className="text-muted-foreground">{fmtPct(pctOf(s.expanded.sga, s.rev))}</span>
                  </td>
                ))}
              </tr>
              {/* EBITDA */}
              <tr className="border-t-2 border-border">
                <td className="py-1.5 px-3 font-bold text-foreground sticky left-0 bg-background z-10">EBITDA</td>
                {activeLocs.map((s) => (
                  <td
                    key={s.loc.id}
                    className={`py-1.5 px-3 text-right font-bold ${s.expanded.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {fmtCurrencyShort(s.expanded.ebitda)}
                  </td>
                ))}
              </tr>
              {/* EBITDA % */}
              <tr>
                <td className="py-1.5 px-3 font-bold text-foreground sticky left-0 bg-background z-10">EBITDA %</td>
                {activeLocs.map((s) => {
                  const ebitdaMargin = pctOf(s.expanded.ebitda, s.rev);
                  const badgeClass =
                    ebitdaMargin >= 50
                      ? "bg-emerald-100 text-emerald-800"
                      : ebitdaMargin >= 30
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800";
                  return (
                    <td key={s.loc.id} className="py-1.5 px-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                        {fmtPct(ebitdaMargin)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue Breakdown by Location - Stacked Bar Chart */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Revenue Breakdown by Location</h2>
        <p className="text-sm text-muted-foreground mb-4">Cost structure per spa. Green = EBITDA margin.</p>
        <div className="h-[300px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breakdownData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v: number) => fmtCurrencyShort(v)} />
            <Tooltip content={<BreakdownTooltip />} />
            <Legend />
            <Bar dataKey="Wages" stackId="stack" fill="#F59E0B" name="Wages">
              <LabelList dataKey="WagesPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="Advertising" stackId="stack" fill="#EC4899" name="Advertising">
              <LabelList dataKey="AdvertisingPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="Rent" stackId="stack" fill="#9CA3AF" name="Rent">
              <LabelList dataKey="RentPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="Utilities" stackId="stack" fill="#06B6D4" name="Utilities">
              <LabelList dataKey="UtilitiesPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="COGS" stackId="stack" fill="#3B82F6" name="COGS">
              <LabelList dataKey="COGSPct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="SG&A" stackId="stack" fill="#8B5CF6" name="SG&A">
              <LabelList dataKey="SG&APct" content={renderSegmentLabel} />
            </Bar>
            <Bar dataKey="EBITDA" stackId="stack" fill="#22C55E" name="EBITDA">
              <LabelList dataKey="EBITDAPct" content={renderTopLabel} />
            </Bar>
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

export default function SpaEBITDAPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <SpaEBITDAContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
