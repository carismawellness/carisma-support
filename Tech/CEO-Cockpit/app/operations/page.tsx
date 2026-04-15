"use client";

import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults } from "@/lib/charts/config";
import {
  ComposedChart,
  Bar,
  Line,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  REAL DATA — Weekly KPI Sheet, Operations (2024)                    */
/* ------------------------------------------------------------------ */

const MOCK_WEEKS = [
  "25-Mar", "1-Apr", "8-Apr", "15-Apr", "22-Apr", "29-Apr",
  "6-May", "13-May", "20-May", "27-May", "3-Jun", "10-Jun",
];

interface LocationData {
  name: string;
  shortName: string;
  avgScore: number;
  cumulative: number[];
  color: string;
}

const MOCK_LOCATIONS: LocationData[] = [
  { name: "InterContinental", shortName: "Inter",    avgScore: 4.5, cumulative: [159,162,162,163,166,168,173,176,181,186,189,190], color: "#1B3A4B" },
  { name: "Hugo's",           shortName: "Hugos",    avgScore: 4.8, cumulative: [109,112,114,115,119,122,129,132,137,142,146,151], color: "#2A8A7A" },
  { name: "Hyatt",            shortName: "Hyatt",    avgScore: 4.8, cumulative: [44,47,54,55,56,56,58,60,60,61,62,64],            color: "#B8943E" },
  { name: "Ramla Bay",        shortName: "Ramla",    avgScore: 4.9, cumulative: [47,55,65,68,72,77,82,85,88,90,98,99],            color: "#E07A5F" },
  { name: "Riviera",          shortName: "Riviera",  avgScore: 4.9, cumulative: [12,12,15,17,19,21,23,27,28,30,32,32],            color: "#6B9080" },
  { name: "Odycy",            shortName: "Odycy",    avgScore: 4.8, cumulative: [21,25,30,35,38,43,50,54,61,69,72,76],            color: "#7C3AED" },
  { name: "Excelsior",        shortName: "Excel",    avgScore: 4.8, cumulative: [35,37,38,40,41,43,45,46,48,49,51,52],            color: "#DC2626" },
  { name: "Novotel",          shortName: "Novo",     avgScore: 4.8, cumulative: [28,30,31,33,34,36,37,39,40,42,43,45],            color: "#0EA5E9" },
  { name: "Aesthetics Clinic",shortName: "Aes",      avgScore: 4.8, cumulative: [21,21,21,21,24,24,27,30,32,33,34,36],            color: "#D946EF" },
  { name: "Slimming Clinic",  shortName: "Slim",     avgScore: 4.9, cumulative: [0,0,0,0,0,3,7,9,9,9,10,10],                     color: "#14B8A6" },
];

const MOCK_COMPANY_CUMULATIVE = [476,501,530,547,569,593,631,658,684,711,737,755];
const MOCK_COMPLAINTS = [0,0,1,1,0,1,0,2,0,0,1,1];

const MOCK_SENTIMENT = [
  { theme: "Staff friendliness", positive: 45, neutral: 8, negative: 2, total: 55 },
  { theme: "Treatment quality", positive: 42, neutral: 6, negative: 3, total: 51 },
  { theme: "Ambiance & cleanliness", positive: 38, neutral: 12, negative: 5, total: 55 },
  { theme: "Value for money", positive: 22, neutral: 15, negative: 8, total: 45 },
  { theme: "Booking experience", positive: 18, neutral: 10, negative: 12, total: 40 },
  { theme: "Wait times", positive: 10, neutral: 14, negative: 16, total: 40 },
  { theme: "Parking & access", positive: 8, neutral: 18, negative: 14, total: 40 },
];
const MOCK_MAINTENANCE_OPEN = [11,10,8,5,5,5,7,8,8,9,9,8];
const MOCK_MAINTENANCE_DONE = [2,3,3,5,2,4,2,2,3,3,5];

/* ------------------------------------------------------------------ */
/*  Derived Data                                                       */
/* ------------------------------------------------------------------ */

/** Compute weekly new reviews from cumulative */
function weeklyFromCumulative(cum: number[]): number[] {
  return cum.slice(1).map((v, i) => v - cum[i]);
}

/** Score color: green 4.8+, amber 4.5-4.7, red <4.5 */
function scoreColor(score: number): string {
  if (score >= 4.8) return "#22C55E";
  if (score >= 4.5) return "#F59E0B";
  return "#EF4444";
}

/* ------------------------------------------------------------------ */
/*  Operations Content                                                 */
/* ------------------------------------------------------------------ */

function OperationsContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  void dateFrom;
  void dateTo;
  void brandFilter;

  /* --- Computed values --- */
  const latestTotal = MOCK_COMPANY_CUMULATIVE[MOCK_COMPANY_CUMULATIVE.length - 1];
  const companyWeekly = weeklyFromCumulative(MOCK_COMPANY_CUMULATIVE);
  const avgWeeklyVelocity = +(companyWeekly.reduce((a, b) => a + b, 0) / companyWeekly.length).toFixed(1);

  // Weighted average score (weighted by latest cumulative count)
  const totalReviewsForWeight = MOCK_LOCATIONS.reduce((s, l) => s + l.cumulative[l.cumulative.length - 1], 0);
  const weightedAvg = +(MOCK_LOCATIONS.reduce((s, l) => s + l.avgScore * l.cumulative[l.cumulative.length - 1], 0) / totalReviewsForWeight).toFixed(2);

  const last4Complaints = MOCK_COMPLAINTS.slice(-4).reduce((a, b) => a + b, 0);
  const prev4Complaints = MOCK_COMPLAINTS.slice(-8, -4).reduce((a, b) => a + b, 0);
  const latestMaintenance = MOCK_MAINTENANCE_OPEN[MOCK_MAINTENANCE_OPEN.length - 1];
  const prevMaintenance = MOCK_MAINTENANCE_OPEN[MOCK_MAINTENANCE_OPEN.length - 2];

  /* --- KPI Cards --- */
  const kpis: KPIData[] = [
    {
      label: "Total Reviews",
      value: latestTotal.toLocaleString(),
      trend: 1,
    },
    {
      label: "Avg Rating",
      value: `${weightedAvg} ★`,
      target: "4.5",
      targetValue: 4.5,
      currentValue: weightedAvg,
    },
    {
      label: "Complaints (4wk)",
      value: String(last4Complaints),
      trend: last4Complaints > prev4Complaints ? -1 : 1,
    },
    {
      label: "Open Maintenance",
      value: String(latestMaintenance),
      trend: latestMaintenance <= prevMaintenance ? 1 : -1,
    },
    {
      label: "Review Velocity",
      value: `${avgWeeklyVelocity}/wk`,
      trend: 1,
    },
  ];

  /* --- Section 1: Reviews by Location (horizontal bar + score dot) --- */
  const locationBarData = [...MOCK_LOCATIONS]
    .map((loc) => ({
      location: loc.name,
      totalReviews: loc.cumulative[loc.cumulative.length - 1],
      avgScore: loc.avgScore,
      color: loc.color,
    }))
    .sort((a, b) => b.totalReviews - a.totalReviews);

  /* --- Section 2: Cumulative growth trajectory per location --- */
  const growthData = MOCK_WEEKS.map((week, wi) => {
    const row: Record<string, string | number> = { week };
    for (const loc of MOCK_LOCATIONS) {
      row[loc.shortName] = loc.cumulative[wi];
    }
    row["Total"] = MOCK_COMPANY_CUMULATIVE[wi];
    return row;
  });

  /* --- Section 3: Stacked weekly velocity --- */
  const velocityWeeks = MOCK_WEEKS.slice(1); // 11 weeks of delta
  const velocityData = velocityWeeks.map((week, wi) => {
    const row: Record<string, string | number> = { week };
    for (const loc of MOCK_LOCATIONS) {
      const weekly = weeklyFromCumulative(loc.cumulative);
      row[loc.shortName] = weekly[wi];
    }
    return row;
  });

  /* --- Section 4: Operational issues --- */
  const complaintsData = MOCK_WEEKS.map((week, i) => ({
    week,
    complaints: MOCK_COMPLAINTS[i],
  }));

  const maintenanceData = MOCK_WEEKS.map((week, i) => ({
    week,
    open: MOCK_MAINTENANCE_OPEN[i],
    done: i < MOCK_MAINTENANCE_DONE.length ? MOCK_MAINTENANCE_DONE[i] : null,
  }));

  /* --- Section 5: Location Scorecard --- */
  const scorecardData = MOCK_LOCATIONS.map((loc) => {
    const weekly = weeklyFromCumulative(loc.cumulative);
    const avgVelocity = +(weekly.reduce((a, b) => a + b, 0) / weekly.length).toFixed(1);
    const lastWeek = weekly[weekly.length - 1];
    return {
      location: loc.name,
      totalReviews: loc.cumulative[loc.cumulative.length - 1],
      avgScore: loc.avgScore,
      velocity: avgVelocity,
      lastWeek: lastWeek >= 0 ? `+${lastWeek}` : String(lastWeek),
    };
  });

  const scorecardColumns = [
    { key: "location", label: "Location" },
    { key: "totalReviews", label: "Total Reviews", align: "right" as const, sortable: true },
    {
      key: "avgScore",
      label: "Avg Score",
      align: "right" as const,
      sortable: true,
      render: (value: unknown) => {
        const v = Number(value);
        return (
          <span style={{ color: scoreColor(v), fontWeight: 600 }}>
            {v.toFixed(1)} ★
          </span>
        );
      },
    },
    { key: "velocity", label: "Avg/Week", align: "right" as const, sortable: true },
    { key: "lastWeek", label: "Last Week", align: "right" as const },
  ];

  /* --- Growth rate labels for trajectory chart --- */
  const locationGrowthRates = MOCK_LOCATIONS.map((loc) => {
    const first = loc.cumulative[0];
    const last = loc.cumulative[loc.cumulative.length - 1];
    const pctGrowth = (((last - first) / first) * 100).toFixed(0);
    return { name: loc.shortName, rate: `+${pctGrowth}%` };
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Operations Dashboard</h1>
      <KPICardRow kpis={kpis} />

      {/* Section 1: Reviews by Location — Primary Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Reviews by Location
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Cumulative Google reviews and average score per location
        </p>
        <ResponsiveContainer width="100%" height={440}>
          <ComposedChart
            data={locationBarData}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="location"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Avg Score") return [Number(value).toFixed(1) + " ★", name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar
              dataKey="totalReviews"
              name="Total Reviews"
              radius={[0, 4, 4, 0]}
              barSize={24}
            >
              {locationBarData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="avgScore"
              name="Avg Score"
              stroke={chartColors.target}
              strokeWidth={0}
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: { avgScore: number } };
                const color = scoreColor(payload.avgScore);
                return (
                  <g key={`dot-${cx}-${cy}`}>
                    <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.2} />
                    <circle cx={cx} cy={cy} r={6} fill={color} />
                    <text x={cx + 16} y={cy + 4} fontSize={11} fontWeight={600} fill={color}>
                      {payload.avgScore}
                    </text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 2: Review Growth Trajectory */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Review Growth Trajectory
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          Cumulative reviews over 12 weeks — steepest lines = fastest growers
        </p>
        <div className="flex flex-wrap gap-4 mb-3 text-xs">
          {locationGrowthRates.map((l) => {
            const loc = MOCK_LOCATIONS.find((m) => m.shortName === l.name)!;
            return (
              <span key={l.name} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: loc.color }} />
                <span className="text-muted-foreground">{loc.name}</span>
                <span className="font-semibold" style={{ color: loc.color }}>{l.rate}</span>
              </span>
            );
          })}
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={growthData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {MOCK_LOCATIONS.map((loc, i) => (
              <Line
                key={loc.shortName}
                type="monotone"
                dataKey={loc.shortName}
                name={loc.name}
                stroke={loc.color}
                strokeWidth={2}
                strokeDasharray={i % 2 === 1 ? "5 3" : undefined}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 3: Weekly Review Velocity — Stacked */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Weekly New Reviews
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          New reviews per week, stacked by location — contribution to total growth
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={velocityData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {MOCK_LOCATIONS.map((loc) => (
              <Bar
                key={loc.shortName}
                dataKey={loc.shortName}
                name={loc.name}
                stackId="velocity"
                fill={loc.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 4: Operational Issues — Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Complaints
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Weekly complaint count — target: zero
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={complaintsData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} domain={[0, 3]} />
              <Tooltip />
              <ReferenceLine y={0} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Target", fill: "#22C55E", fontSize: 10 }} />
              <Bar
                dataKey="complaints"
                name="Complaints"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                barSize={20}
              >
                {complaintsData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.complaints === 0 ? "#D1FAE5" : "#EF4444"}
                    fillOpacity={entry.complaints === 0 ? 0.5 : 0.85}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Maintenance: Open vs Done */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Maintenance Requests
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Open backlog vs completed — gap = unresolved
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={maintenanceData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="open"
                name="Open Requests"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#F59E0B" }}
              />
              <Line
                type="monotone"
                dataKey="done"
                name="Completed"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#22C55E" }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section 5: Location Scorecard Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Location Scorecard
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Performance summary — sortable by any metric
        </p>
        <DataTable
          columns={scorecardColumns}
          data={scorecardData as unknown as Record<string, unknown>[]}
        />
      </Card>

      {/* Section 6: Review Sentiment Analysis */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Review Sentiment Analysis
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          AI-extracted themes from recent reviews — placeholder for Google Business Profile API integration
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={MOCK_SENTIMENT}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="theme"
              width={160}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="positive" name="Positive" stackId="sentiment" fill="#22C55E" radius={[0, 0, 0, 0]} barSize={22} />
            <Bar dataKey="neutral" name="Neutral" stackId="sentiment" fill="#94A3B8" radius={[0, 0, 0, 0]} barSize={22} />
            <Bar dataKey="negative" name="Negative" stackId="sentiment" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 rounded-md border border-border bg-muted/50 px-4 py-3">
          <p className="text-sm text-muted-foreground italic">
            Connect Google Business Profile API for real-time sentiment extraction
          </p>
        </div>
      </Card>

      <CIChat />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Export                                                         */
/* ------------------------------------------------------------------ */

export default function OperationsPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <OperationsContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
