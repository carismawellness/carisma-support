"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  formatCurrency,
} from "@/lib/charts/config";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  AlertTriangle,
  Star,
  ClipboardCheck,
  UserSearch,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — REVIEW DATA
   ═══════════════════════════════════════════════════════════════════════ */

const REVIEW_LOCATIONS = [
  { name: "InterContinental", short: "Inter",  totalReviews: 190, avgScore: 4.5, prevScore: 4.4, color: "#1B3A4B" },
  { name: "Hugo's",           short: "Hugos",  totalReviews: 151, avgScore: 4.8, prevScore: 4.7, color: "#96B2B2" },
  { name: "Ramla Bay",        short: "Ramla",  totalReviews: 99,  avgScore: 4.9, prevScore: 4.8, color: "#E07A5F" },
  { name: "Hyatt",            short: "Hyatt",  totalReviews: 64,  avgScore: 4.8, prevScore: 4.7, color: "#B79E61" },
  { name: "Excelsior",        short: "Excel",  totalReviews: 52,  avgScore: 4.8, prevScore: 4.6, color: "#6366F1" },
  { name: "Novotel",          short: "Novo",   totalReviews: 45,  avgScore: 4.8, prevScore: 4.5, color: "#0EA5E9" },
  { name: "Labranda",         short: "Labr",   totalReviews: 36,  avgScore: 4.7, prevScore: 4.6, color: "#9CA3AF" },
  { name: "Sunny",            short: "Sunny",  totalReviews: 32,  avgScore: 4.9, prevScore: 4.9, color: "#7C6F64" },
  { name: "Carisma Aesthetics", short: "Aes",  totalReviews: 36,  avgScore: 4.8, prevScore: 4.7, color: "#96B2B2" },
  { name: "Carisma Slimming",   short: "Slim", totalReviews: 10,  avgScore: 4.9, prevScore: 4.9, color: "#8EB093" },
];

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — DILIGENCE AUDIT DATA (Latest Period)
   ═══════════════════════════════════════════════════════════════════════ */

interface DiligenceRow {
  location: string;
  totalSales: number;
  deleted: number;
  deletedPct: number;
  cancelled: number;
  cancelledPct: number;
  complementary: number;
  complementaryPct: number;
  cashSales: number;
  cashPct: number;
  discountedCash: number;
  discountedCashPct: number;
  unattended: number;
}

const DILIGENCE_DATA: DiligenceRow[] = [
  { location: "Inter",     totalSales: 38828, deleted: 9924, deletedPct: 26, cancelled: 1419, cancelledPct: 4, complementary: 1587, complementaryPct: 4, cashSales: 5047, cashPct: 13, discountedCash: 0, discountedCashPct: 0, unattended: 29 },
  { location: "Hugos",     totalSales: 39561, deleted: 14931, deletedPct: 38, cancelled: 1102, cancelledPct: 3, complementary: 1583, complementaryPct: 4, cashSales: 6330, cashPct: 16, discountedCash: 0, discountedCashPct: 0, unattended: 24 },
  { location: "Hyatt",     totalSales: 18039, deleted: 7880, deletedPct: 44, cancelled: 562, cancelledPct: 3, complementary: 218, complementaryPct: 1, cashSales: 1263, cashPct: 7, discountedCash: 0, discountedCashPct: 0, unattended: 4 },
  { location: "Ramla",     totalSales: 15332, deleted: 4929, deletedPct: 32, cancelled: 613, cancelledPct: 4, complementary: 567, complementaryPct: 4, cashSales: 1687, cashPct: 11, discountedCash: 1533, discountedCashPct: 10, unattended: 16 },
  { location: "Labranda",  totalSales: 9026,  deleted: 0,    deletedPct: 0,  cancelled: 0,   cancelledPct: 0, complementary: 144, complementaryPct: 2, cashSales: 1625, cashPct: 18, discountedCash: 0, discountedCashPct: 0, unattended: 0 },
  { location: "Sunny",     totalSales: 8316,  deleted: 2341, deletedPct: 28, cancelled: 250, cancelledPct: 3, complementary: 0,   complementaryPct: 0, cashSales: 2578, cashPct: 31, discountedCash: 0, discountedCashPct: 0, unattended: 6 },
  { location: "Excelsior", totalSales: 22967, deleted: 4823, deletedPct: 21, cancelled: 459, cancelledPct: 2, complementary: 230, complementaryPct: 1, cashSales: 1378, cashPct: 6, discountedCash: 459, discountedCashPct: 2, unattended: 6 },
  { location: "Novotel",   totalSales: 18679, deleted: 3175, deletedPct: 17, cancelled: 374, cancelledPct: 2, complementary: 374, complementaryPct: 2, cashSales: 1308, cashPct: 7, discountedCash: 747, discountedCashPct: 4, unattended: 2 },
  { location: "C. Aesthetics",totalSales: 12400, deleted: 1240, deletedPct: 10, cancelled: 248, cancelledPct: 2, complementary: 124, complementaryPct: 1, cashSales: 868, cashPct: 7, discountedCash: 0, discountedCashPct: 0, unattended: 0 },
  { location: "C. Slimming",  totalSales: 10566, deleted: 845,  deletedPct: 8,  cancelled: 211, cancelledPct: 2, complementary: 106, complementaryPct: 1, cashSales: 634, cashPct: 6, discountedCash: 0, discountedCashPct: 0, unattended: 0 },
];

const DILIGENCE_THRESHOLDS = {
  deletedPct: 10,
  cancelledPct: 5,
  complementaryPct: 2,
  cashPct: 12,
  discountedCashPct: 5,
  unattended: 0,
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — FACILITY STANDARDS DATA
   ═══════════════════════════════════════════════════════════════════════ */

interface StandardsRow {
  location: string;
  score: number;
  issues: string[];
}

const FACILITY_STANDARDS: StandardsRow[] = [
  { location: "InterContinental", score: 92, issues: [] },
  { location: "Hugo's",           score: 88, issues: ["Treatment room towel replacement frequency below standard"] },
  { location: "Hyatt",            score: 95, issues: [] },
  { location: "Ramla Bay",        score: 78, issues: ["Pool area cleanliness flagged", "Changing room maintenance overdue"] },
  { location: "Excelsior",        score: 91, issues: [] },
  { location: "Novotel",          score: 73, issues: ["Sauna temperature not meeting standard", "Lighting in corridor needs repair", "Product expiry labels not checked"] },
  { location: "Labranda",         score: 81, issues: ["Equipment calibration overdue"] },
  { location: "Sunny",            score: 86, issues: ["Ventilation system scheduled for maintenance"] },
  { location: "Carisma Aesthetics", score: 94, issues: [] },
  { location: "Carisma Slimming",   score: 90, issues: [] },
];

const MYSTERY_GUEST: StandardsRow[] = [
  { location: "InterContinental", score: 89, issues: ["Front desk wait time exceeded 3 minutes"] },
  { location: "Hugo's",           score: 93, issues: [] },
  { location: "Hyatt",            score: 91, issues: [] },
  { location: "Ramla Bay",        score: 72, issues: ["No welcome drink offered", "Therapist didn't introduce themselves", "Post-treatment recommendations missing"] },
  { location: "Excelsior",        score: 88, issues: ["Upselling opportunity missed at checkout"] },
  { location: "Novotel",          score: 68, issues: ["Incorrect booking details at check-in", "Music not playing in treatment room", "No follow-up call post-visit", "Retail area not pointed out"] },
  { location: "Labranda",         score: 79, issues: ["Consent form not explained properly", "No escort to treatment room"] },
  { location: "Sunny",            score: 82, issues: ["Locker allocation disorganized"] },
  { location: "Carisma Aesthetics", score: 87, issues: ["Consultation room booking overlap noted"] },
  { location: "Carisma Slimming",   score: 83, issues: ["Waiting area comfort below standard", "Measurement tools not calibrated"] },
];

/* ═══════════════════════════════════════════════════════════════════════
   COMPLIANCE CATEGORIES (Aggregate)
   ═══════════════════════════════════════════════════════════════════════ */

const COMPLIANCE_CATEGORIES = [
  { category: "Hygiene & Sanitation", score: 94 },
  { category: "Product & Equipment", score: 87 },
  { category: "Ambiance & Comfort", score: 82 },
  { category: "Staff Presentation", score: 91 },
  { category: "Safety & Emergency", score: 96 },
  { category: "Client Communication", score: 79 },
  { category: "Booking & Admin", score: 85 },
  { category: "Retail & Merchandising", score: 76 },
];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function scoreColor(score: number): string {
  if (score >= 4.8) return "#22C55E";
  if (score >= 4.5) return "#F59E0B";
  return "#EF4444";
}

function complianceColor(score: number): string {
  if (score >= 85) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function complianceBg(score: number): string {
  if (score >= 85) return "bg-emerald-50 text-emerald-800";
  if (score >= 60) return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-800";
}

function pctColor(value: number, threshold: number): string {
  if (value <= threshold) return "text-emerald-600";
  if (value <= threshold * 1.5) return "text-amber-600";
  return "text-red-600";
}


/* ═══════════════════════════════════════════════════════════════════════
   MAIN CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function OperationsContent({
  dateFrom,
  dateTo,
}: {
  dateFrom: Date;
  dateTo: Date;
}) {
  void dateFrom;
  void dateTo;

  /* ── Computed Review KPIs ─────────────────────────────────────────── */
  const totalReviews = REVIEW_LOCATIONS.reduce((s, l) => s + l.totalReviews, 0);
  const weightedAvg = +(
    REVIEW_LOCATIONS.reduce((s, l) => s + l.avgScore * l.totalReviews, 0) / totalReviews
  ).toFixed(2);
  const weightedPrevAvg = +(
    REVIEW_LOCATIONS.reduce((s, l) => s + l.prevScore * l.totalReviews, 0) / totalReviews
  ).toFixed(2);
  const ratingDelta = +(weightedAvg - weightedPrevAvg).toFixed(2);
  const reviewVelocity = 25.4; // avg new reviews per week across all locations
  const complaints4wk = 3;
  const maintenanceOpen = 8;

  /* ── Facility & Mystery Guest Aggregates ──────────────────────────── */
  const avgFacility = Math.round(avg(FACILITY_STANDARDS.map((s) => s.score)));
  const avgMystery = Math.round(avg(MYSTERY_GUEST.map((s) => s.score)));

  /* ── KPI Cards ────────────────────────────────────────────────────── */
  const kpis: KPIData[] = [
    { label: "Total Reviews", value: totalReviews.toLocaleString(), trend: 1 },
    { label: "Avg Rating", value: `${weightedAvg} ★`, target: "4.5", targetValue: 4.5, currentValue: weightedAvg },
    { label: "Rating Change", value: `${ratingDelta > 0 ? "+" : ""}${ratingDelta}`, trend: ratingDelta >= 0 ? 1 : -1 },
    { label: "Review Velocity", value: `${reviewVelocity}/wk`, trend: 1 },
    { label: "Complaints (4wk)", value: String(complaints4wk), trend: -1 },
    { label: "Open Maintenance", value: String(maintenanceOpen), trend: 1 },
    { label: "Facility Std %", value: `${avgFacility}%`, target: "85%", targetValue: 85, currentValue: avgFacility },
    { label: "Mystery Guest %", value: `${avgMystery}%`, target: "85%", targetValue: 85, currentValue: avgMystery },
  ];

  /* ── Review chart data ────────────────────────────────────────────── */
  const reviewBarData = [...REVIEW_LOCATIONS]
    .sort((a, b) => b.totalReviews - a.totalReviews);

  const ratingBarData = [...REVIEW_LOCATIONS]
    .sort((a, b) => b.avgScore - a.avgScore || b.totalReviews - a.totalReviews);

  /* ── Facility & Mystery bar data ──────────────────────────────────── */
  const facilityBarData = [...FACILITY_STANDARDS].sort((a, b) => a.score - b.score);
  const mysteryBarData = [...MYSTERY_GUEST].sort((a, b) => a.score - b.score);

  /* ── Compliance category data ─────────────────────────────────────── */
  const complianceBarData = [...COMPLIANCE_CATEGORIES].sort((a, b) => a.score - b.score);

  /* ── Diligence totals ─────────────────────────────────────────────── */
  const diligenceTotals = {
    totalSales: DILIGENCE_DATA.reduce((s, d) => s + d.totalSales, 0),
    deleted: DILIGENCE_DATA.reduce((s, d) => s + d.deleted, 0),
    cancelled: DILIGENCE_DATA.reduce((s, d) => s + d.cancelled, 0),
    complementary: DILIGENCE_DATA.reduce((s, d) => s + d.complementary, 0),
    cashSales: DILIGENCE_DATA.reduce((s, d) => s + d.cashSales, 0),
    discountedCash: DILIGENCE_DATA.reduce((s, d) => s + d.discountedCash, 0),
    unattended: DILIGENCE_DATA.reduce((s, d) => s + d.unattended, 0),
  };
  const totPct = (n: number) => diligenceTotals.totalSales > 0 ? Math.round((n / diligenceTotals.totalSales) * 100) : 0;

  return (
    <>
      {/* ═══════ HEADER ═══════════════════════════════════════════════ */}
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Operations Dashboard</h1>
      <KPICardRow kpis={kpis} />

      {/* ═══════ REVIEWS — AVG RATING BY LOCATION ════════════════════ */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Star className="h-5 w-5 text-[#B79E61]" />
          <h2 className="text-lg font-semibold text-foreground">Average Rating by Location</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Google review scores — green &ge;4.8, amber 4.5-4.7, red &lt;4.5</p>
        <div className="h-[380px] md:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ratingBarData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[4, 5]} tick={{ fontSize: 11 }} tickFormatter={(v: number) => v.toFixed(1)} />
              <YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)} ★`, "Rating"]} />
              <Bar dataKey="avgScore" name="Avg Rating" radius={[0, 4, 4, 0]} barSize={22}>
                {ratingBarData.map((entry, i) => (
                  <Cell key={i} fill={scoreColor(entry.avgScore)} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="avgScore"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, value } = props as Record<string, unknown>;
                    if (!x || !width || !y || !height) return <></>;
                    return (
                      <text
                        x={(x as number) + (width as number) + 8}
                        y={(y as number) + (height as number) / 2 + 4}
                        fontSize={12}
                        fontWeight={700}
                        fill={scoreColor(value as number)}
                      >
                        {(value as number).toFixed(1)} ★
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════ REVIEWS — TOTAL REVIEWS BY LOCATION ═════════════════ */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Total Reviews by Location</h2>
        <p className="text-sm text-muted-foreground mb-4">Cumulative Google reviews — {totalReviews} company-wide</p>
        <div className="h-[380px] md:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reviewBarData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="totalReviews" name="Total Reviews" radius={[0, 4, 4, 0]} barSize={22}>
                {reviewBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="totalReviews"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, value } = props as Record<string, unknown>;
                    if (!x || !width || !y || !height) return <></>;
                    return (
                      <text
                        x={(x as number) + (width as number) + 6}
                        y={(y as number) + (height as number) / 2 + 4}
                        fontSize={12}
                        fontWeight={600}
                        fill="#374151"
                      >
                        {String(value)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════ DILIGENCE AUDIT TABLE ════════════════════════════════ */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-5 w-5 text-[#B79E61]" />
          <h2 className="text-lg font-semibold text-foreground">Diligence Audit</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Financial compliance by location — numbers with percentages. Red highlights threshold breaches.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-warm-border bg-muted/30">
                <th className="text-left py-2.5 px-3 font-semibold text-foreground sticky left-0 bg-muted/30 min-w-[160px]">Metric</th>
                {DILIGENCE_DATA.map((d) => (
                  <th key={d.location} className="text-center py-2.5 px-2 font-semibold text-foreground min-w-[90px]">
                    {d.location}
                  </th>
                ))}
                <th className="text-center py-2.5 px-3 font-bold text-foreground bg-muted/50 min-w-[100px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Total Sales */}
              <tr className="border-b border-warm-border/50 bg-muted/10">
                <td className="py-2 px-3 font-semibold text-foreground sticky left-0 bg-muted/10">Total Sales</td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2 font-medium text-foreground">
                    {formatCurrency(d.totalSales)}
                  </td>
                ))}
                <td className="text-center py-2 px-3 font-bold text-foreground bg-muted/20">
                  {formatCurrency(diligenceTotals.totalSales)}
                </td>
              </tr>
              {/* Deleted */}
              <tr className="border-b border-warm-border/50">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-white">
                  Total Deleted
                  <span className="text-xs text-muted-foreground ml-1">(&lt;10%)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className="text-foreground">{d.deleted.toLocaleString()}</span>
                    <span className={cn("ml-1 text-xs font-semibold", pctColor(d.deletedPct, DILIGENCE_THRESHOLDS.deletedPct))}>
                      {d.deletedPct}%
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className="font-medium">{diligenceTotals.deleted.toLocaleString()}</span>
                  <span className={cn("ml-1 text-xs font-semibold", pctColor(totPct(diligenceTotals.deleted), DILIGENCE_THRESHOLDS.deletedPct))}>
                    {totPct(diligenceTotals.deleted)}%
                  </span>
                </td>
              </tr>
              {/* Cancelled */}
              <tr className="border-b border-warm-border/50">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-white">
                  Total Cancelled
                  <span className="text-xs text-muted-foreground ml-1">(&lt;5%)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className="text-foreground">{d.cancelled.toLocaleString()}</span>
                    <span className={cn("ml-1 text-xs font-semibold", pctColor(d.cancelledPct, DILIGENCE_THRESHOLDS.cancelledPct))}>
                      {d.cancelledPct}%
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className="font-medium">{diligenceTotals.cancelled.toLocaleString()}</span>
                  <span className={cn("ml-1 text-xs font-semibold", pctColor(totPct(diligenceTotals.cancelled), DILIGENCE_THRESHOLDS.cancelledPct))}>
                    {totPct(diligenceTotals.cancelled)}%
                  </span>
                </td>
              </tr>
              {/* Complementary */}
              <tr className="border-b border-warm-border/50">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-white">
                  Total Complementary
                  <span className="text-xs text-muted-foreground ml-1">(~2%)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className="text-foreground">{d.complementary.toLocaleString()}</span>
                    <span className={cn("ml-1 text-xs font-semibold", pctColor(d.complementaryPct, DILIGENCE_THRESHOLDS.complementaryPct))}>
                      {d.complementaryPct}%
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className="font-medium">{diligenceTotals.complementary.toLocaleString()}</span>
                  <span className={cn("ml-1 text-xs font-semibold", pctColor(totPct(diligenceTotals.complementary), DILIGENCE_THRESHOLDS.complementaryPct))}>
                    {totPct(diligenceTotals.complementary)}%
                  </span>
                </td>
              </tr>
              {/* Cash Sales */}
              <tr className="border-b border-warm-border/50 bg-red-50/20">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-red-50/20">
                  Total Cash Sales
                  <span className="text-xs text-muted-foreground ml-1">(&lt;12%)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className="text-foreground">{d.cashSales.toLocaleString()}</span>
                    <span className={cn("ml-1 text-xs font-bold", pctColor(d.cashPct, DILIGENCE_THRESHOLDS.cashPct))}>
                      {d.cashPct}%
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className="font-medium">{diligenceTotals.cashSales.toLocaleString()}</span>
                  <span className={cn("ml-1 text-xs font-bold", pctColor(totPct(diligenceTotals.cashSales), DILIGENCE_THRESHOLDS.cashPct))}>
                    {totPct(diligenceTotals.cashSales)}%
                  </span>
                </td>
              </tr>
              {/* Discounted Cash */}
              <tr className="border-b border-warm-border/50">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-white">
                  Total Discounted Cash
                  <span className="text-xs text-muted-foreground ml-1">(&lt;5%)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className="text-foreground">{d.discountedCash.toLocaleString()}</span>
                    <span className={cn("ml-1 text-xs font-semibold", pctColor(d.discountedCashPct, DILIGENCE_THRESHOLDS.discountedCashPct))}>
                      {d.discountedCashPct}%
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className="font-medium">{diligenceTotals.discountedCash.toLocaleString()}</span>
                  <span className={cn("ml-1 text-xs font-semibold", pctColor(totPct(diligenceTotals.discountedCash), DILIGENCE_THRESHOLDS.discountedCashPct))}>
                    {totPct(diligenceTotals.discountedCash)}%
                  </span>
                </td>
              </tr>
              {/* Unattended */}
              <tr className="border-b border-warm-border/50 bg-amber-50/20">
                <td className="py-2 px-3 font-medium text-foreground sticky left-0 bg-amber-50/20">
                  Total Unattended
                  <span className="text-xs text-muted-foreground ml-1">(must be 0)</span>
                </td>
                {DILIGENCE_DATA.map((d) => (
                  <td key={d.location} className="text-center py-2 px-2">
                    <span className={cn(
                      "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
                      d.unattended === 0 ? "bg-emerald-100 text-emerald-700" : d.unattended <= 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    )}>
                      {d.unattended}
                    </span>
                  </td>
                ))}
                <td className="text-center py-2 px-3 bg-muted/20">
                  <span className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold",
                    diligenceTotals.unattended === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {diligenceTotals.unattended}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Alerts for threshold breaches */}
        {(() => {
          const alerts: string[] = [];
          for (const d of DILIGENCE_DATA) {
            if (d.cashPct > DILIGENCE_THRESHOLDS.cashPct) alerts.push(`${d.location}: Cash at ${d.cashPct}% (>${DILIGENCE_THRESHOLDS.cashPct}%)`);
            if (d.deletedPct > DILIGENCE_THRESHOLDS.deletedPct) alerts.push(`${d.location}: Deleted at ${d.deletedPct}% (>${DILIGENCE_THRESHOLDS.deletedPct}%)`);
            if (d.unattended > 10) alerts.push(`${d.location}: ${d.unattended} unattended bookings`);
          }
          if (alerts.length === 0) return null;
          return (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">{alerts.length} Threshold Breaches</span>
              </div>
              <div className="space-y-1">
                {alerts.map((a, i) => (
                  <div key={i} className="text-xs text-red-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* ═══════ COMPLIANCE BY CATEGORY ═══════════════════════════════ */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="h-5 w-5 text-[#B79E61]" />
          <h2 className="text-lg font-semibold text-foreground">Compliance by Category</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Aggregate scores across all locations — green &ge;85%, amber 60-84%, red &lt;60%
        </p>
        <div className="h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={complianceBarData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={160} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
              <Bar dataKey="score" name="Score %" radius={[0, 4, 4, 0]} barSize={24}>
                {complianceBarData.map((entry, i) => (
                  <Cell key={i} fill={complianceColor(entry.score)} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, value } = props as Record<string, unknown>;
                    if (!x || !width || !y || !height) return <></>;
                    return (
                      <text
                        x={(x as number) + (width as number) + 6}
                        y={(y as number) + (height as number) / 2 + 4}
                        fontSize={12}
                        fontWeight={700}
                        fill={complianceColor(value as number)}
                      >
                        {String(value)}%
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ═══════ FACILITY STANDARDS BY LOCATION ══════════════════════ */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="h-5 w-5 text-[#22C55E]" />
          <h2 className="text-lg font-semibold text-foreground">Facility Standards by Location</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Aggregate: {avgFacility}% — green &ge;85%, amber 60-84%, red &lt;60%
        </p>
        <div className="h-[380px] md:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={facilityBarData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="location" width={145} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
              <Bar dataKey="score" name="Facility %" radius={[0, 4, 4, 0]} barSize={22}>
                {facilityBarData.map((entry, i) => (
                  <Cell key={i} fill={complianceColor(entry.score)} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, value } = props as Record<string, unknown>;
                    if (!x || !width || !y || !height) return <></>;
                    return (
                      <text
                        x={(x as number) + (width as number) + 6}
                        y={(y as number) + (height as number) / 2 + 4}
                        fontSize={12}
                        fontWeight={700}
                        fill={complianceColor(value as number)}
                      >
                        {String(value)}%
                      </text>
                    );
                  }}
                />
              </Bar>
              <ReferenceLine x={85} stroke="#94A3B8" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "85%", position: "top", fill: "#94A3B8", fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Issue bullet points for locations below 85% */}
        {facilityBarData.filter((l) => l.score < 85 && l.issues.length > 0).length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Areas Needing Attention</h3>
            {facilityBarData
              .filter((l) => l.score < 85 && l.issues.length > 0)
              .map((loc) => (
                <div key={loc.location} className="rounded-lg border border-amber-200 bg-amber-50/30 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", complianceBg(loc.score))}>{loc.score}%</span>
                    <span className="text-sm font-semibold text-foreground">{loc.location}</span>
                  </div>
                  <ul className="space-y-1 ml-4">
                    {loc.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-muted-foreground list-disc">{issue}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* ═══════ MYSTERY GUEST STANDARDS BY LOCATION ═════════════════ */}
      <Card className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <UserSearch className="h-5 w-5 text-[#7C3AED]" />
          <h2 className="text-lg font-semibold text-foreground">Mystery Guest Standards by Location</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Aggregate: {avgMystery}% — green &ge;85%, amber 60-84%, red &lt;60%
        </p>
        <div className="h-[380px] md:h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mysteryBarData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="location" width={145} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
              <Bar dataKey="score" name="Mystery Guest %" radius={[0, 4, 4, 0]} barSize={22}>
                {mysteryBarData.map((entry, i) => (
                  <Cell key={i} fill={complianceColor(entry.score)} fillOpacity={0.85} />
                ))}
                <LabelList
                  dataKey="score"
                  position="right"
                  content={(props) => {
                    const { x, y, width, height, value } = props as Record<string, unknown>;
                    if (!x || !width || !y || !height) return <></>;
                    return (
                      <text
                        x={(x as number) + (width as number) + 6}
                        y={(y as number) + (height as number) / 2 + 4}
                        fontSize={12}
                        fontWeight={700}
                        fill={complianceColor(value as number)}
                      >
                        {String(value)}%
                      </text>
                    );
                  }}
                />
              </Bar>
              <ReferenceLine x={85} stroke="#94A3B8" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "85%", position: "top", fill: "#94A3B8", fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Issue bullet points for locations below 85% */}
        {mysteryBarData.filter((l) => l.score < 85 && l.issues.length > 0).length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Areas Needing Attention</h3>
            {mysteryBarData
              .filter((l) => l.score < 85 && l.issues.length > 0)
              .map((loc) => (
                <div key={loc.location} className="rounded-lg border border-amber-200 bg-amber-50/30 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", complianceBg(loc.score))}>{loc.score}%</span>
                    <span className="text-sm font-semibold text-foreground">{loc.location}</span>
                  </div>
                  <ul className="space-y-1 ml-4">
                    {loc.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-muted-foreground list-disc">{issue}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function OperationsPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo }) => (
        <OperationsContent dateFrom={dateFrom} dateTo={dateTo} />
      )}
    </DashboardShell>
  );
}
