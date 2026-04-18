"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  ComposedChart,
  BarChart,
  PieChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const SLIMMING_COLOR = "#6B9080";
const SLIMMING_LIGHT = "#8FB5A3";
const CHANNEL_COLORS: Record<string, string> = {
  Google: "#4285F4",
  Meta: "#1877F2",
  Influencer: "#E1306C",
  Email: "#8B5CF6",
};

/* ═══════════════════════════════════════════════════════════════════════
   MOCK DATA — Slimming Marketing (launched Feb 2026, still ramping)
   ═══════════════════════════════════════════════════════════════════════ */

const MOCK_WEEKS = ["W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13", "W14", "W15", "W16"];

// Weekly leads (growing from ~8 to ~18)
const MOCK_LEADS =     [8, 9, 10, 11, 12, 13, 14, 15, 15, 17, 18];
// Weekly consults
const MOCK_CONSULTS =  [4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 10];
// Weekly bookings (courses booked)
const MOCK_BOOKINGS =  [2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7];
// Weekly revenue (growing from ~800 to ~1500)
const MOCK_REVENUE =   [820, 890, 950, 1050, 1100, 1180, 1250, 1320, 1380, 1420, 1500];

// Monthly spend breakdown (approx weekly = monthly / 4.3)
const MONTHLY_SPEND = {
  Google: 300,
  Meta: 1500,
  Influencer: 200,
  Email: 100,
};
const TOTAL_MONTHLY_SPEND = Object.values(MONTHLY_SPEND).reduce((a, b) => a + b, 0);

// Weekly spend breakdown
const weeklySpendData = MOCK_WEEKS.map((w, i) => {
  const growth = 1 + i * 0.02; // slight growth in spend
  return {
    week: w,
    Google: Math.round((MONTHLY_SPEND.Google / 4.3) * growth),
    Meta: Math.round((MONTHLY_SPEND.Meta / 4.3) * growth),
    Influencer: Math.round((MONTHLY_SPEND.Influencer / 4.3) * growth),
    Email: Math.round((MONTHLY_SPEND.Email / 4.3) * growth),
  };
});

// Pie chart data
const spendPieData = Object.entries(MONTHLY_SPEND).map(([channel, spend]) => ({
  name: channel,
  value: spend,
  pct: ((spend / TOTAL_MONTHLY_SPEND) * 100).toFixed(1),
}));

/* ── Meta Ads Campaigns ── */
const META_CAMPAIGNS = [
  {
    campaign: "Body Sculpting Malta - Lookalike",
    cpl: 18.40,
    dailyBudget: 15,
    actualSpend: 14.20,
    totalSpend: 412,
    totalLeads: 22,
    ctr: 2.1,
    cpm: 8.90,
    frequency: 1.8,
    attributedRevenue: 4950,
  },
  {
    campaign: "Weight Loss Free Consult",
    cpl: 15.20,
    dailyBudget: 20,
    actualSpend: 18.50,
    totalSpend: 547,
    totalLeads: 36,
    ctr: 2.8,
    cpm: 7.40,
    frequency: 1.5,
    attributedRevenue: 7200,
  },
  {
    campaign: "Summer Body Ready - Interest",
    cpl: 22.30,
    dailyBudget: 10,
    actualSpend: 9.80,
    totalSpend: 268,
    totalLeads: 12,
    ctr: 1.6,
    cpm: 10.20,
    frequency: 2.1,
    attributedRevenue: 2700,
  },
  {
    campaign: "Slimming Course - Retarget",
    cpl: 12.80,
    dailyBudget: 8,
    actualSpend: 7.60,
    totalSpend: 192,
    totalLeads: 15,
    ctr: 3.4,
    cpm: 6.80,
    frequency: 2.8,
    attributedRevenue: 3375,
  },
  {
    campaign: "Medical Weight Loss - Broad",
    cpl: 24.50,
    dailyBudget: 12,
    actualSpend: 11.40,
    totalSpend: 318,
    totalLeads: 13,
    ctr: 1.4,
    cpm: 11.50,
    frequency: 1.3,
    attributedRevenue: 2925,
  },
];

/* ── Google Ads Campaigns ── */
const GOOGLE_CAMPAIGNS = [
  {
    campaign: "Slimming Malta - Brand",
    cpl: 12.40,
    dailyBudget: 5,
    totalLeads: 8,
    totalAdSpend: 99,
    avgCpc: 1.85,
    ctr: 8.2,
    conversions: 6,
    conversionRate: 12.5,
    expectedRevenue: 2700,
    blendedRoas: 27.3,
  },
  {
    campaign: "Weight Loss Clinic Malta",
    cpl: 18.60,
    dailyBudget: 8,
    totalLeads: 11,
    totalAdSpend: 205,
    avgCpc: 3.20,
    ctr: 4.1,
    conversions: 7,
    conversionRate: 6.8,
    expectedRevenue: 3150,
    blendedRoas: 15.4,
  },
  {
    campaign: "Body Sculpting Near Me",
    cpl: 15.80,
    dailyBudget: 6,
    totalLeads: 9,
    totalAdSpend: 142,
    avgCpc: 2.60,
    ctr: 5.3,
    conversions: 5,
    conversionRate: 8.2,
    expectedRevenue: 2250,
    blendedRoas: 15.8,
  },
  {
    campaign: "Fat Reduction Malta",
    cpl: 21.50,
    dailyBudget: 5,
    totalLeads: 6,
    totalAdSpend: 129,
    avgCpc: 3.80,
    ctr: 3.5,
    conversions: 4,
    conversionRate: 5.9,
    expectedRevenue: 1800,
    blendedRoas: 14.0,
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function avg(arr: number[]): number {
  return arr.length > 0 ? sum(arr) / arr.length : 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function SlimmingMarketingContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* ── Section 1: Top-Level KPIs ── */
  const topKpis = useMemo<KPIData[]>(() => {
    const totalLeads = sum(MOCK_LEADS);
    const totalConsults = sum(MOCK_CONSULTS);
    const totalBookings = sum(MOCK_BOOKINGS);
    const totalRevenue = sum(MOCK_REVENUE);
    const totalSpend = TOTAL_MONTHLY_SPEND * (MOCK_WEEKS.length / 4.3);

    return [
      {
        label: "Total Leads Generated",
        value: totalLeads.toLocaleString(),
        trend: 12.5,
        target: "15-20/wk",
        targetValue: 17,
        currentValue: MOCK_LEADS[MOCK_LEADS.length - 1],
      },
      {
        label: "Total Consultations",
        value: totalConsults.toLocaleString(),
        trend: 15.0,
      },
      {
        label: "Total Bookings",
        value: totalBookings.toLocaleString(),
        trend: 18.2,
      },
      {
        label: "Total Marketing Expenditure",
        value: formatCurrency(Math.round(totalSpend)),
      },
      {
        label: "Blended Revenue",
        value: formatCurrency(totalRevenue),
        trend: 22.4,
      },
      {
        label: "YoY Revenue Growth",
        value: "New Brand",
      },
    ];
  }, []);

  /* ── Section 3: Performance KPIs ── */
  const performanceKpis = useMemo<KPIData[]>(() => {
    const totalRevenue = sum(MOCK_REVENUE);
    const totalSpend = TOTAL_MONTHLY_SPEND * (MOCK_WEEKS.length / 4.3);
    const metaSpend = MONTHLY_SPEND.Meta * (MOCK_WEEKS.length / 4.3);
    const googleSpend = MONTHLY_SPEND.Google * (MOCK_WEEKS.length / 4.3);
    const metaRevenue = sum(META_CAMPAIGNS.map((c) => c.attributedRevenue));
    const googleRevenue = sum(GOOGLE_CAMPAIGNS.map((c) => c.expectedRevenue));
    const emailRevenue = totalRevenue * 0.08; // 8% email attributed
    const campaignRevenue = metaRevenue + googleRevenue;
    const flowRevenue = emailRevenue * 0.6;
    const campaignEmailRevenue = emailRevenue - flowRevenue;

    return [
      {
        label: "Blended ROAS",
        value: `${(totalRevenue / totalSpend).toFixed(1)}x`,
        target: "3.0x",
        targetValue: 3.0,
        currentValue: totalRevenue / totalSpend,
      },
      {
        label: "Google ROAS",
        value: `${(googleRevenue / googleSpend).toFixed(1)}x`,
        target: "4.0x",
        targetValue: 4.0,
        currentValue: googleRevenue / googleSpend,
      },
      {
        label: "Meta ROAS",
        value: `${(metaRevenue / metaSpend).toFixed(1)}x`,
        target: "3.0x",
        targetValue: 3.0,
        currentValue: metaRevenue / metaSpend,
      },
      {
        label: "Email Revenue %",
        value: formatPercent((emailRevenue / totalRevenue) * 100),
        target: "15%",
        targetValue: 15,
        currentValue: (emailRevenue / totalRevenue) * 100,
      },
      {
        label: "Total Email Subscribers",
        value: "812",
        trend: 28.5,
      },
      {
        label: "Pop-up Capture Rate",
        value: "2.8%",
        target: "3.5%",
        targetValue: 3.5,
        currentValue: 2.8,
      },
      {
        label: "Campaign Attributed Revenue",
        value: formatCurrency(Math.round(campaignEmailRevenue)),
      },
      {
        label: "Flow Attributed Revenue",
        value: formatCurrency(Math.round(flowRevenue)),
      },
    ];
  }, []);

  /* ── Meta Ads table columns ── */
  const metaColumns = useMemo(
    () => [
      { key: "campaign", label: "Campaign Name" },
      {
        key: "cpl",
        label: "CPL",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "dailyBudget",
        label: "Daily Budget",
        align: "right" as const,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "actualSpend",
        label: "Actual Spend",
        align: "right" as const,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "totalSpend",
        label: "Total Spend",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "totalLeads",
        label: "Total Leads",
        align: "right" as const,
        sortable: true,
      },
      {
        key: "ctr",
        label: "CTR",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => `${(v as number).toFixed(1)}%`,
      },
      {
        key: "cpm",
        label: "CPM",
        align: "right" as const,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "frequency",
        label: "Frequency",
        align: "right" as const,
        render: (v: unknown) => (v as number).toFixed(1),
      },
      {
        key: "attributedRevenue",
        label: "Attributed Revenue",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
    ],
    []
  );

  /* ── Google Ads table columns ── */
  const googleColumns = useMemo(
    () => [
      { key: "campaign", label: "Campaign Name" },
      {
        key: "cpl",
        label: "CPL",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "dailyBudget",
        label: "Daily Budget",
        align: "right" as const,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "totalLeads",
        label: "Total Leads",
        align: "right" as const,
        sortable: true,
      },
      {
        key: "totalAdSpend",
        label: "Total Ad Spend",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "avgCpc",
        label: "Avg CPC",
        align: "right" as const,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "ctr",
        label: "CTR",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => `${(v as number).toFixed(1)}%`,
      },
      {
        key: "conversions",
        label: "Conversions",
        align: "right" as const,
        sortable: true,
      },
      {
        key: "conversionRate",
        label: "Conv. Rate",
        align: "right" as const,
        render: (v: unknown) => `${(v as number).toFixed(1)}%`,
      },
      {
        key: "expectedRevenue",
        label: "Expected Revenue",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => formatCurrency(v as number),
      },
      {
        key: "blendedRoas",
        label: "Blended ROAS",
        align: "right" as const,
        sortable: true,
        render: (v: unknown) => `${(v as number).toFixed(1)}x`,
      },
    ],
    []
  );

  /* ── Summary calculations ── */
  const metaTotalAttributed = sum(META_CAMPAIGNS.map((c) => c.attributedRevenue));
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);
  const metaTotalSpend = sum(META_CAMPAIGNS.map((c) => c.totalSpend));
  const metaTotalLeads = sum(META_CAMPAIGNS.map((c) => c.totalLeads));

  const googleTotalRevenue = sum(GOOGLE_CAMPAIGNS.map((c) => c.expectedRevenue));
  const googleExpectedRevenue = Math.round(googleTotalRevenue * 1.15);
  const googleTotalSpend = sum(GOOGLE_CAMPAIGNS.map((c) => c.totalAdSpend));
  const googleTotalLeads = sum(GOOGLE_CAMPAIGNS.map((c) => c.totalLeads));

  return (
    <>
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Marketing Dashboard — Slimming
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Launched Feb 2026 | Course-based model | All figures EUR | Mock data
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         Section 1: Top-Level KPIs
         ══════════════════════════════════════════════════════════════ */}
      <KPICardRow kpis={topKpis} />

      {/* ══════════════════════════════════════════════════════════════
         Section 2: Marketing Spend Breakdown
         ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spend Allocation by Channel
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) =>
                  `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                }
              >
                {spendPieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CHANNEL_COLORS[entry.name] || SLIMMING_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Total monthly spend:{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(TOTAL_MONTHLY_SPEND)}
              </span>
            </p>
          </div>
        </Card>

        {/* Stacked Weekly Bar */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Spend by Channel
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySpendData} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => `\u20AC${v}`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="Meta"
                stackId="spend"
                fill={CHANNEL_COLORS.Meta}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Google"
                stackId="spend"
                fill={CHANNEL_COLORS.Google}
              />
              <Bar
                dataKey="Influencer"
                stackId="spend"
                fill={CHANNEL_COLORS.Influencer}
              />
              <Bar
                dataKey="Email"
                stackId="spend"
                fill={CHANNEL_COLORS.Email}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         Section 3: Performance KPIs
         ══════════════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance KPIs
        </h2>
        <KPICardRow kpis={performanceKpis} />
      </Card>

      {/* ══════════════════════════════════════════════════════════════
         Section 3b: Leads & Revenue Trend
         ══════════════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Leads, Bookings &amp; Revenue Trend
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={MOCK_WEEKS.map((w, i) => ({
              week: w,
              Leads: MOCK_LEADS[i],
              Consults: MOCK_CONSULTS[i],
              Bookings: MOCK_BOOKINGS[i],
              Revenue: MOCK_REVENUE[i],
            }))}
            margin={chartDefaults.margin}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="count"
              tick={{ fontSize: 11 }}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tickFormatter={(v: number) => `\u20AC${v}`}
              tick={{ fontSize: 11 }}
              label={{
                value: "Revenue",
                angle: 90,
                position: "insideRight",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value);
                return String(name) === "Revenue"
                  ? formatCurrency(v)
                  : v.toLocaleString();
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="count"
              dataKey="Leads"
              fill={SLIMMING_LIGHT}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="count"
              dataKey="Bookings"
              fill={SLIMMING_COLOR}
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="Revenue"
              stroke={chartColors.target}
              strokeWidth={chartDefaults.strokeWidth}
              dot={{ r: chartDefaults.dotRadius }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
         Section 4: Meta Ads Deep Dive
         ══════════════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Meta Ads — Active Campaigns
        </h2>
        <DataTable columns={metaColumns} data={META_CAMPAIGNS} />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Spend
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(metaTotalSpend)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Leads
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {metaTotalLeads}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Attributed Revenue
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(metaTotalAttributed)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Expected Revenue (x1.15)
            </p>
            <p className="text-lg font-semibold" style={{ color: SLIMMING_COLOR }}>
              {formatCurrency(metaExpectedRevenue)}
            </p>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
         Section 5: Google Ads Deep Dive
         ══════════════════════════════════════════════════════════════ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Google Ads — Campaign Performance
        </h2>
        <DataTable columns={googleColumns} data={GOOGLE_CAMPAIGNS} />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Spend
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(googleTotalSpend)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Leads
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {googleTotalLeads}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Revenue
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(googleTotalRevenue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Expected Revenue (x1.15)
            </p>
            <p className="text-lg font-semibold" style={{ color: SLIMMING_COLOR }}>
              {formatCurrency(googleExpectedRevenue)}
            </p>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
         Section 6: CIChat
         ══════════════════════════════════════════════════════════════ */}
      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function SlimmingMarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <SlimmingMarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
