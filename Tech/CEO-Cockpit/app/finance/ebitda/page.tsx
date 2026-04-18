"use client";

import { useState } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  formatCurrency,
} from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  LOCATION DATA                                                      */
/* ------------------------------------------------------------------ */

type LocationType = "spa" | "clinic";

interface LocationConfig {
  id: string;
  name: string;
  type: LocationType;
  color: string;
  startIndex: number;
}

const LOCATIONS: LocationConfig[] = [
  { id: "inter",      name: "InterContinental", type: "spa",    color: "#1B3A4B", startIndex: 0 },
  { id: "hugos",      name: "Hugo's",           type: "spa",    color: "#96B2B2", startIndex: 0 },
  { id: "hyatt",      name: "Hyatt",            type: "spa",    color: "#B79E61", startIndex: 0 },
  { id: "ramla",      name: "Ramla",            type: "spa",    color: "#8EB093", startIndex: 0 },
  { id: "labranda",   name: "Labranda",         type: "spa",    color: "#E07A5F", startIndex: 0 },
  { id: "sunny",      name: "Sunny Coast",      type: "spa",    color: "#4A90D9", startIndex: 0 },
  { id: "excelsior",  name: "Excelsior",        type: "spa",    color: "#7C3AED", startIndex: 18 },
  { id: "novotel",    name: "Novotel",          type: "spa",    color: "#DC2626", startIndex: 21 },
  { id: "aesthetics", name: "Aesthetics",       type: "clinic", color: chartColors.aesthetics, startIndex: 12 },
  { id: "slimming",   name: "Slimming",         type: "clinic", color: chartColors.slimming, startIndex: 12 },
];

interface MonthlyPL {
  revenue: number;
  salaries: number;
  sga: number;
  rent: number;
  ebitda: number;
  ebitdaPct: number;
}

/* ---- PER-LOCATION MONTHLY DATA (indices 0–11 = 2024, 12–23 = 2025) ---- */

function buildLocationData(): Record<string, (MonthlyPL | null)[]> {
  function buildSpa(
    rev: number[], sal: number[], sga: number[], rent: number[], ebitda: number[],
    startIdx = 0,
  ): (MonthlyPL | null)[] {
    return Array.from({ length: 24 }, (_, i) => {
      if (i < startIdx || i - startIdx >= rev.length) return null;
      const idx = i - startIdx;
      const r = rev[idx]; const e = ebitda[idx];
      return { revenue: r, salaries: sal[idx], sga: sga[idx], rent: rent[idx], ebitda: e, ebitdaPct: r > 0 ? Math.round((e / r) * 100) : 0 };
    });
  }

  return {
    inter: buildSpa(
      [38806,46282,52520,51826,48362,47792,49712,54569,53577,52550,46854,35540, 36040,45313,49185,48561,49080,42226,50103,60745,55492,59595,53433,43700],
      [18214,15252,17674,15803,13796,13936,13845,15315,11190,13384,13901,11687, 13151,12099,23048,18814,19153,22455,22736,22120,20955,23982,25689,19000],
      [4690,3295,416,495,143,484,556,586,487,533,1246,2548, 2914,1965,1453,1735,1792,1603,1586,1536,1630,1654,1995,1800],
      [4400,4400,4400,4400,4400,4400,5100,5100,5100,5100,5100,5100, 5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100,5100],
      [11502,23335,30030,31128,30023,28972,30211,33568,36800,33533,26606,16205, 14875,26149,19584,22912,23035,13068,20681,31989,27807,28859,20649,17800],
    ),
    hugos: buildSpa(
      [39581,42237,47242,44581,41316,27918,28886,35135,44014,46741,51718,39818, 43373,48550,61182,57333,49058,43157,40712,45157,47571,60531,47660,36500],
      [11971,12210,13883,12319,11346,11769,11716,11145,11405,10809,10855,10913, 13708,27739,28752,21535,20266,18415,18104,19822,17528,21600,19583,15000],
      [753,0,0,1669,1494,3038,3503,979,1249,1592,35,1245, 1618,1648,1731,1993,1993,1993,1052,1353,1482,1679,1365,1200],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0],
      [26527,29796,32916,30120,28352,12856,13424,22149,30539,33235,39344,28101, 27397,18518,30054,33210,26242,22788,21036,23378,28019,36729,26192,14961],
    ),
    hyatt: buildSpa(
      [18623,28490,34882,25968,23240,24483,28983,25934,27200,26186,24628,20627, 23517,30813,29519,24622,25531,22240,23569,24503,24445,24688,22335,20700],
      [7444,7314,9763,7749,8877,10833,9429,6198,8772,9134,5597,6527, 10837,7808,9973,10404,10787,11182,10403,11771,13491,8678,10078,9000],
      [0,0,0,0,0,0,0,0,0,0,0,33, 39,25,25,25,165,258,47,134,81,397,66,100],
      [0,0,0,0,0,0,0,0,0,0,0,0, 1366,1366,1366,1366,1366,1366,1407,1407,1407,1407,1407,1407],
      [13716,20835,24556,17623,13925,13359,19189,19076,17668,16247,18168,14572, 10791,21130,17671,12437,12785,9366,11322,10801,9076,13816,10366,6221],
    ),
    ramla: buildSpa(
      [13911,23373,23672,23883,24343,22418,20569,20430,23952,22530,21930,17767, 21261,24740,29739,27299,32358,25052,27269,33298,33907,49210,34970,29800],
      [3477,3145,2910,2945,5306,6069,5066,5047,7602,7806,9216,8603, 10117,6209,5272,11526,13114,15310,13630,8946,16985,11914,13566,12000],
      [0,0,0,603,0,0,0,0,0,0,0,279, 238,320,348,448,448,448,331,252,310,399,264,300],
      [0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0],
      [10263,20004,20403,19939,18855,16230,15272,15070,15973,14385,12202,7633, 10407,17767,23700,14455,17732,7317,11889,22280,15308,35409,19594,12511],
    ),
    labranda: buildSpa(
      [8939,9049,12329,13659,20261,16006,16652,15518,13717,18301,18949,13188, 12637,13483,16739,17967,19812,20423,23015,27132,28589,23819,20133,15100],
      [5304,5536,8568,4928,5528,1637,6051,3677,6252,4099,7060,7565, 2714,2920,7425,8115,9745,5567,4438,8406,13328,10903,7313,6000],
      [1582,1115,823,1100,866,689,731,724,698,851,702,730, 705,697,766,741,715,715,819,881,722,775,777,700],
      [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000, 1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],
      [898,1291,1690,6324,12494,12359,8553,9835,5527,11868,9620,4094, 8111,8759,7441,8024,8238,13411,16672,16745,13452,11055,10957,4389],
    ),
    sunny: buildSpa(
      [8488,10958,11558,17890,17408,17000,20711,19279,19624,20456,19926,15877, 10154,12312,12923,15724,19948,17615,21755,24891,28589,27076,20775,11600],
      [11587,8572,8210,8156,8422,10126,8745,7522,6490,5871,6013,8621, 6804,9089,4550,6495,7610,8146,8481,7188,12232,17011,12836,8500],
      [621,399,155,157,361,384,157,168,185,119,119,413, 535,483,603,495,526,372,380,461,439,676,451,400],
      [2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833, 1097,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833,2833],
      [-6617,-959,192,6418,5525,3454,8553,8328,9659,11158,10477,4033, 1584,-228,4802,5793,8871,6367,9922,14301,12965,6448,4535,350],
    ),
    excelsior: buildSpa(
      [21495,22574,25634,24960,24192,20000],
      [2708,10663,15772,12780,13038,11000],
      [0,0,0,0,0,0],
      [0,0,0,0,0,0],
      [18787,11911,9862,12180,11154,-872],
      18,
    ),
    novotel: buildSpa(
      [3325,14194,10700],
      [0,1447,1200],
      [392,205,200],
      [0,0,0],
      [2933,12542,12536],
      21,
    ),
    aesthetics: (() => {
      const rev =    [15377,16340,19589,18326,22212,20187,19635,19023,30000,24000,68000,63000];
      const ebitda = [4225,2544,4940,4883,8059,7062,5065,9102,13805,6549,8836,10674];
      const ebitdaPct=[27,16,25,27,36,35,26,48,46,27,13,17];
      const wages =  [4918,4980,5531,4189,3323,4510,6025,4162,5500,4500,9000,8000];
      const sga =    [1614,3068,3127,4191,4761,2212,2940,610,2000,2500,4000,3500];
      return Array.from({ length: 24 }, (_, i) => {
        if (i < 12) return null;
        const idx = i - 12;
        return { revenue: rev[idx], salaries: wages[idx], sga: sga[idx], rent: 0, ebitda: ebitda[idx], ebitdaPct: ebitdaPct[idx] };
      });
    })(),
    slimming: (() => {
      const rev =    [0,0,0,0,3803,0,6502,7418,8957,1894,5000,4000];
      const wages =  [0,0,0,0,360,360,360,360,360,360,360,360];
      const ads =    [0,0,0,0,0,1037,769,710,513,505,500,400];
      const ebitda = [0,0,0,0,3443,-1397,5373,6348,8084,1029,4140,3240];
      return Array.from({ length: 24 }, (_, i) => {
        if (i < 12) return null;
        const idx = i - 12;
        const r = rev[idx]; const e = ebitda[idx];
        return { revenue: r, salaries: wages[idx], sga: ads[idx], rent: 0, ebitda: e, ebitdaPct: r > 0 ? Math.round((e / r) * 100) : 0 };
      });
    })(),
  };
}

const LOCATION_DATA = buildLocationData();

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function sumRange(locId: string, start: number, end: number) {
  const data = LOCATION_DATA[locId];
  let revenue = 0, salaries = 0, sga = 0, rent = 0, ebitda = 0;
  for (let i = start; i < end; i++) {
    const d = data[i];
    if (d) {
      revenue += d.revenue;
      salaries += d.salaries;
      sga += d.sga;
      rent += d.rent;
      ebitda += d.ebitda;
    }
  }
  return { revenue, salaries, sga, rent, ebitda, ebitdaPct: revenue > 0 ? Math.round((ebitda / revenue) * 100) : 0 };
}

/* ------------------------------------------------------------------ */
/*  WATERFALL BUILDER                                                  */
/* ------------------------------------------------------------------ */

function buildWaterfall(start: number, end: number) {
  const entries: { name: string; value: number; cumulative: number; start: number; end: number; isTotal?: boolean }[] = [];
  let running = 0;

  // Spa locations sorted by EBITDA desc
  const spaLocs = LOCATIONS.filter(l => l.type === "spa")
    .map(l => ({ name: l.name, ebitda: sumRange(l.id, start, end).ebitda }))
    .sort((a, b) => b.ebitda - a.ebitda);

  for (const loc of spaLocs) {
    const s = running;
    running += loc.ebitda;
    entries.push({ name: loc.name, value: loc.ebitda, cumulative: running, start: s, end: running });
  }

  // Clinics
  for (const loc of LOCATIONS.filter(l => l.type === "clinic")) {
    const totals = sumRange(loc.id, start, end);
    const s = running;
    running += totals.ebitda;
    entries.push({ name: loc.name, value: totals.ebitda, cumulative: running, start: s, end: running });
  }

  // Group Total
  entries.push({ name: "Group EBITDA", value: running, cumulative: running, start: 0, end: running, isTotal: true });

  return entries;
}

/* ------------------------------------------------------------------ */
/*  INNER COMPONENT                                                    */
/* ------------------------------------------------------------------ */

function EBITDAOverviewContent() {
  const [yearFilter, setYearFilter] = useState<"2024" | "2025" | "all">("2025");

  const rangeStart = yearFilter === "2024" ? 0 : yearFilter === "2025" ? 12 : 0;
  const rangeEnd = yearFilter === "2024" ? 12 : 24;
  const yearLabel = yearFilter === "all" ? "2024–2025" : yearFilter;

  /* --- Compute totals per location --------------------------------- */
  const locationTotals = LOCATIONS.map(loc => ({
    ...loc,
    ...sumRange(loc.id, rangeStart, rangeEnd),
  })).filter(l => l.revenue > 0 || l.ebitda !== 0);

  /* --- Brand aggregates -------------------------------------------- */
  const spaTotals = locationTotals.filter(l => l.type === "spa").reduce(
    (acc, l) => ({ revenue: acc.revenue + l.revenue, ebitda: acc.ebitda + l.ebitda }),
    { revenue: 0, ebitda: 0 },
  );
  const aesSummary = sumRange("aesthetics", rangeStart, rangeEnd);
  const slimSummary = sumRange("slimming", rangeStart, rangeEnd);

  const groupRevenue = spaTotals.revenue + aesSummary.revenue + slimSummary.revenue;
  const groupEbitda = spaTotals.ebitda + aesSummary.ebitda + slimSummary.ebitda;
  const groupMargin = groupRevenue > 0 ? Math.round((groupEbitda / groupRevenue) * 100) : 0;

  /* --- YoY comparison (only meaningful when yearFilter is 2025) ----- */
  const priorGroupRev = yearFilter === "2025"
    ? LOCATIONS.reduce((s, l) => s + sumRange(l.id, 0, 12).revenue, 0)
    : 0;
  const priorGroupEbitda = yearFilter === "2025"
    ? LOCATIONS.reduce((s, l) => s + sumRange(l.id, 0, 12).ebitda, 0)
    : 0;
  const revenueYoY = priorGroupRev > 0
    ? Math.round(((groupRevenue - priorGroupRev) / priorGroupRev) * 100) : undefined;
  const ebitdaYoY = priorGroupEbitda > 0
    ? Math.round(((groupEbitda - priorGroupEbitda) / Math.abs(priorGroupEbitda)) * 100) : undefined;

  /* --- KPI cards --------------------------------------------------- */
  const kpis: KPIData[] = [
    { label: `Group EBITDA (${yearLabel})`, value: formatCurrency(groupEbitda), trend: ebitdaYoY },
    { label: "Group EBITDA Margin", value: `${groupMargin}%`, target: "30%", targetValue: 30, currentValue: groupMargin },
    { label: "Group Revenue", value: formatCurrency(groupRevenue), trend: revenueYoY },
    { label: "Active Locations", value: `${locationTotals.length}` },
  ];

  /* --- Waterfall --------------------------------------------------- */
  const waterfallData = buildWaterfall(rangeStart, rangeEnd);

  /* --- P&L table: all locations sorted by EBITDA desc -------------- */
  const pnlRows = [...locationTotals].sort((a, b) => b.ebitda - a.ebitda);
  const pnlTotal = pnlRows.reduce(
    (acc, r) => ({ revenue: acc.revenue + r.revenue, salaries: acc.salaries + r.salaries, sga: acc.sga + r.sga, rent: acc.rent + r.rent, ebitda: acc.ebitda + r.ebitda }),
    { revenue: 0, salaries: 0, sga: 0, rent: 0, ebitda: 0 },
  );

  /* --- Brand cards data -------------------------------------------- */
  const brands = [
    {
      name: "Spa",
      color: chartColors.spa,
      ebitda: spaTotals.ebitda,
      revenue: spaTotals.revenue,
      margin: spaTotals.revenue > 0 ? Math.round((spaTotals.ebitda / spaTotals.revenue) * 100) : 0,
      yoy: yearFilter === "2025"
        ? (() => {
            const prior = LOCATIONS.filter(l => l.type === "spa").reduce((s, l) => s + sumRange(l.id, 0, 12).ebitda, 0);
            return prior > 0 ? Math.round(((spaTotals.ebitda - prior) / Math.abs(prior)) * 100) : undefined;
          })()
        : undefined,
      locations: LOCATIONS.filter(l => l.type === "spa").length,
    },
    {
      name: "Aesthetics",
      color: chartColors.aesthetics,
      ebitda: aesSummary.ebitda,
      revenue: aesSummary.revenue,
      margin: aesSummary.ebitdaPct,
      yoy: undefined, // no prior year
      locations: 1,
    },
    {
      name: "Slimming",
      color: chartColors.slimming,
      ebitda: slimSummary.ebitda,
      revenue: slimSummary.revenue,
      margin: slimSummary.ebitdaPct,
      yoy: undefined,
      locations: 1,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">EBITDA Overview</h1>
          <p className="text-sm text-muted-foreground">Group-wide EBITDA performance across all brands and locations</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["2024", "2025", "all"] as const).map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                yearFilter === y ? "bg-background shadow text-foreground" : "text-text-secondary hover:text-foreground"
              }`}
            >
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICardRow kpis={kpis} />

      {/* Brand Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brands.map(brand => (
          <Card key={brand.name} className="p-6 border-l-4" style={{ borderLeftColor: brand.color }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{brand.name}</h3>
              {brand.yoy !== undefined && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  brand.yoy >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  {brand.yoy >= 0 ? "+" : ""}{brand.yoy}% YoY
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(brand.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">EBITDA</span>
                <span className={`text-sm font-bold ${brand.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(brand.ebitda)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">EBITDA Margin</span>
                <span className={`text-sm font-semibold ${
                  brand.margin >= 30 ? "text-emerald-600" : brand.margin >= 15 ? "text-amber-500" : "text-red-600"
                }`}>
                  {brand.margin}%
                </span>
              </div>
              {brand.name === "Spa" && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Locations</span>
                  <span className="text-sm text-foreground">{brand.locations}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Contribution Waterfall */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Contribution Waterfall</h2>
        <p className="text-xs text-muted-foreground mb-4">How each location contributes to Group EBITDA ({yearLabel})</p>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-40} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `€${Math.round(v / 1000)}k`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const entry = waterfallData.find(d => d.name === label);
                if (!entry) return null;
                return (
                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-foreground text-sm">{entry.name}</p>
                    <p className={`text-sm font-bold ${entry.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {formatCurrency(entry.value)}
                    </p>
                    {!entry.isTotal && (
                      <p className="text-xs text-muted-foreground">Running: {formatCurrency(entry.cumulative)}</p>
                    )}
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
            <Bar dataKey="start" stackId="waterfall" fill="transparent" />
            <Bar dataKey="value" stackId="waterfall" radius={[2, 2, 0, 0]}>
              {waterfallData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isTotal ? "#3B82F6" : entry.value >= 0 ? "#22C55E" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* P&L by Business Unit */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">P&L by Business Unit</h2>
        <p className="text-xs text-muted-foreground mb-4">All locations — {yearLabel}. Sorted by EBITDA.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Wages</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">SG&A</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Rent</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">EBITDA</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">EBITDA %</th>
              </tr>
            </thead>
            <tbody>
              {pnlRows.map(row => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: row.color }} />
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground capitalize">{row.type}</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCurrency(row.revenue)}</td>
                  <td className="py-3 px-4 text-right text-foreground">{formatCurrency(row.salaries)}</td>
                  <td className="py-3 px-4 text-right text-foreground">{row.sga > 0 ? formatCurrency(row.sga) : "—"}</td>
                  <td className="py-3 px-4 text-right text-foreground">{row.rent > 0 ? formatCurrency(row.rent) : "—"}</td>
                  <td className={`py-3 px-4 text-right font-bold ${row.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {formatCurrency(row.ebitda)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.ebitdaPct >= 40 ? "bg-emerald-100 text-emerald-800"
                      : row.ebitdaPct >= 20 ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                      {row.ebitdaPct}%
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="border-t-2 border-border font-bold bg-muted/50">
                <td className="py-3 px-4 text-foreground" colSpan={2}>Group Total</td>
                <td className="py-3 px-4 text-right text-foreground">{formatCurrency(pnlTotal.revenue)}</td>
                <td className="py-3 px-4 text-right text-foreground">{formatCurrency(pnlTotal.salaries)}</td>
                <td className="py-3 px-4 text-right text-foreground">{pnlTotal.sga > 0 ? formatCurrency(pnlTotal.sga) : "—"}</td>
                <td className="py-3 px-4 text-right text-foreground">{pnlTotal.rent > 0 ? formatCurrency(pnlTotal.rent) : "—"}</td>
                <td className={`py-3 px-4 text-right ${pnlTotal.ebitda >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(pnlTotal.ebitda)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    (pnlTotal.revenue > 0 ? Math.round((pnlTotal.ebitda / pnlTotal.revenue) * 100) : 0) >= 30
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {pnlTotal.revenue > 0 ? `${Math.round((pnlTotal.ebitda / pnlTotal.revenue) * 100)}%` : "0%"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function EBITDAPage() {
  return (
    <DashboardShell>
      {() => <EBITDAOverviewContent />}
    </DashboardShell>
  );
}
