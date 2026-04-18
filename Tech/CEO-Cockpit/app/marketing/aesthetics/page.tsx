"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CIChat } from "@/components/ci/CIChat";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ---------- channel colors ---------- */

const CHANNEL_COLORS: Record<string, string> = {
  Google: "#4285F4",
  Meta: "#1877F2",
  Influencer: "#E1306C",
  Email: "#8B5CF6",
};

/* ---------- mock data ---------- */

const MONTHLY_SPEND = {
  Google: 600,
  Meta: 2000,
  Influencer: 800,
  Email: 300,
};

const spendPieData = Object.entries(MONTHLY_SPEND).map(([name, value]) => ({
  name,
  value,
}));

const weeklySpendData = [
  { week: "W1", Google: 150, Meta: 500, Influencer: 200, Email: 75 },
  { week: "W2", Google: 145, Meta: 520, Influencer: 190, Email: 70 },
  { week: "W3", Google: 160, Meta: 480, Influencer: 210, Email: 80 },
  { week: "W4", Google: 145, Meta: 500, Influencer: 200, Email: 75 },
];

const metaCampaigns = [
  {
    campaign: "Botox Malta - Lookalike",
    cpl: 14.2,
    dailyBudget: 25,
    actualSpend: 23.8,
    totalSpend: 712,
    totalLeads: 50,
    ctr: 2.1,
    cpm: 18.5,
    frequency: 1.8,
    attributedRevenue: 7350,
  },
  {
    campaign: "Lip Filler Free Consult",
    cpl: 12.8,
    dailyBudget: 30,
    actualSpend: 28.5,
    totalSpend: 854,
    totalLeads: 67,
    ctr: 2.6,
    cpm: 16.2,
    frequency: 1.5,
    attributedRevenue: 9800,
  },
  {
    campaign: "Body Contouring - Interest",
    cpl: 18.4,
    dailyBudget: 20,
    actualSpend: 19.2,
    totalSpend: 576,
    totalLeads: 31,
    ctr: 1.7,
    cpm: 21.3,
    frequency: 2.1,
    attributedRevenue: 4650,
  },
  {
    campaign: "Laser Hair Removal - Retarget",
    cpl: 11.5,
    dailyBudget: 15,
    actualSpend: 14.8,
    totalSpend: 443,
    totalLeads: 39,
    ctr: 3.2,
    cpm: 14.8,
    frequency: 2.4,
    attributedRevenue: 5720,
  },
  {
    campaign: "Anti-Aging Facial - DPA",
    cpl: 15.9,
    dailyBudget: 18,
    actualSpend: 17.1,
    totalSpend: 512,
    totalLeads: 32,
    ctr: 1.9,
    cpm: 19.7,
    frequency: 1.9,
    attributedRevenue: 4690,
  },
  {
    campaign: "Free Consultation - Broad",
    cpl: 13.1,
    dailyBudget: 22,
    actualSpend: 21.3,
    totalSpend: 638,
    totalLeads: 49,
    ctr: 2.3,
    cpm: 17.1,
    frequency: 1.6,
    attributedRevenue: 7180,
  },
];

const googleCampaigns = [
  {
    campaign: "Botox Malta - Brand",
    cpl: 10.2,
    dailyBudget: 8,
    totalLeads: 14,
    totalAdSpend: 143,
    avgCpc: 3.8,
    ctr: 8.4,
    conversions: 12,
    conversionRate: 14.2,
    expectedRevenue: 2940,
    blendedRoas: 20.6,
  },
  {
    campaign: "Lip Filler Malta",
    cpl: 14.8,
    dailyBudget: 10,
    totalLeads: 11,
    totalAdSpend: 163,
    avgCpc: 4.5,
    ctr: 6.1,
    conversions: 8,
    conversionRate: 10.8,
    expectedRevenue: 1960,
    blendedRoas: 12.0,
  },
  {
    campaign: "Aesthetics Clinic Near Me",
    cpl: 12.5,
    dailyBudget: 6,
    totalLeads: 8,
    totalAdSpend: 100,
    avgCpc: 3.2,
    ctr: 7.3,
    conversions: 7,
    conversionRate: 12.5,
    expectedRevenue: 1715,
    blendedRoas: 17.2,
  },
  {
    campaign: "Body Contouring Malta",
    cpl: 16.3,
    dailyBudget: 7,
    totalLeads: 6,
    totalAdSpend: 98,
    avgCpc: 5.1,
    ctr: 5.2,
    conversions: 5,
    conversionRate: 8.9,
    expectedRevenue: 1225,
    blendedRoas: 12.5,
  },
  {
    campaign: "Laser Hair Removal",
    cpl: 11.7,
    dailyBudget: 5,
    totalLeads: 7,
    totalAdSpend: 82,
    avgCpc: 3.4,
    ctr: 7.8,
    conversions: 6,
    conversionRate: 11.5,
    expectedRevenue: 1470,
    blendedRoas: 17.9,
  },
];

/* ---------- content component ---------- */

function AestheticsMarketingContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  /* --- Section 1: Top-Level KPIs --- */
  const topKpis = useMemo<KPIData[]>(
    () => [
      {
        label: "Total Leads Generated",
        value: "62",
        trend: 8.3,
        target: "70/wk",
        targetValue: 70,
        currentValue: 62,
      },
      {
        label: "Total Consultations",
        value: "17",
        trend: 5.1,
        target: "25% of leads",
        targetValue: 16,
        currentValue: 17,
      },
      {
        label: "Total Bookings",
        value: "13",
        trend: 12.4,
      },
      {
        label: "Total Marketing Expenditure",
        value: formatCurrency(3700),
        trend: -2.1,
      },
      {
        label: "Blended Revenue",
        value: formatCurrency(4280),
        trend: 6.7,
      },
      {
        label: "YoY Revenue Growth %",
        value: "14.2%",
        trend: 3.5,
      },
    ],
    []
  );

  /* --- Section 3: Performance KPIs --- */
  const performanceKpis = useMemo<KPIData[]>(() => {
    const totalMetaSpend = metaCampaigns.reduce((s, c) => s + c.totalSpend, 0);
    const totalMetaRevenue = metaCampaigns.reduce(
      (s, c) => s + c.attributedRevenue,
      0
    );
    const totalGoogleSpend = googleCampaigns.reduce(
      (s, c) => s + c.totalAdSpend,
      0
    );
    const totalGoogleRevenue = googleCampaigns.reduce(
      (s, c) => s + c.expectedRevenue,
      0
    );
    const totalSpend = totalMetaSpend + totalGoogleSpend;
    const totalRevenue = totalMetaRevenue + totalGoogleRevenue;
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const googleRoas =
      totalGoogleSpend > 0 ? totalGoogleRevenue / totalGoogleSpend : 0;
    const metaRoas =
      totalMetaSpend > 0 ? totalMetaRevenue / totalMetaSpend : 0;

    const emailAttributedRevenue = 1240;
    const totalBlendedRevenue = 4280;
    const emailPct =
      totalBlendedRevenue > 0
        ? (emailAttributedRevenue / totalBlendedRevenue) * 100
        : 0;

    return [
      {
        label: "Blended ROAS",
        value: `${blendedRoas.toFixed(1)}x`,
        target: "5.0x",
        targetValue: 5,
        currentValue: blendedRoas,
      },
      {
        label: "Google ROAS",
        value: `${googleRoas.toFixed(1)}x`,
        target: "6.0x",
        targetValue: 6,
        currentValue: googleRoas,
      },
      {
        label: "Meta ROAS",
        value: `${metaRoas.toFixed(1)}x`,
        target: "4.0x",
        targetValue: 4,
        currentValue: metaRoas,
      },
      {
        label: "Email Attributed Revenue %",
        value: formatPercent(emailPct),
        target: "30%",
        targetValue: 30,
        currentValue: emailPct,
      },
      {
        label: "Total Email Subscribers",
        value: "2,814",
        trend: 3.2,
      },
      {
        label: "Pop-up Capture Rate",
        value: "4.1%",
        target: "5%",
        targetValue: 5,
        currentValue: 4.1,
      },
      {
        label: "Campaign Attributed Revenue",
        value: formatCurrency(820),
      },
      {
        label: "Flow Attributed Revenue",
        value: formatCurrency(420),
      },
    ];
  }, []);

  /* --- Section 4: Meta Ads Table --- */
  const metaColumns = [
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
  ];

  const metaTotalAttributed = metaCampaigns.reduce(
    (s, c) => s + c.attributedRevenue,
    0
  );
  const metaExpectedRevenue = Math.round(metaTotalAttributed * 1.15);

  /* --- Section 5: Google Ads Table --- */
  const googleColumns = [
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
  ];

  const googleTotalRevenue = googleCampaigns.reduce(
    (s, c) => s + c.expectedRevenue,
    0
  );
  const googleExpectedRevenue = Math.round(googleTotalRevenue * 1.15);
  const googleTotalSpend = googleCampaigns.reduce(
    (s, c) => s + c.totalAdSpend,
    0
  );

  /* --- Spend pie tooltip --- */
  const totalMonthlySpend = Object.values(MONTHLY_SPEND).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Aesthetics Marketing Dashboard
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Carisma Aesthetics — consult-driven medical aesthetics performance
        </p>
      </div>

      {/* Section 1: Top-Level KPIs */}
      <KPICardRow kpis={topKpis} />

      {/* Section 2: Marketing Spend Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Marketing Spend Breakdown
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Channel Split (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(props: any) =>
                    `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {spendPieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHANNEL_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${formatCurrency(Number(value))} (${((Number(value) / totalMonthlySpend) * 100).toFixed(1)}%)`,
                    "Spend",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Weekly Spend by Channel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weeklySpendData}
                margin={chartDefaults.margin}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    String(name),
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="Google"
                  stackId="spend"
                  fill={CHANNEL_COLORS.Google}
                />
                <Bar
                  dataKey="Meta"
                  stackId="spend"
                  fill={CHANNEL_COLORS.Meta}
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
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Section 3: Performance KPIs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance KPIs
        </h2>
        <KPICardRow kpis={performanceKpis} />
      </Card>

      {/* Section 4: Meta Ads Deep Dive */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Meta Ads — Active Campaigns
        </h2>
        <DataTable columns={metaColumns} data={metaCampaigns} />
        <div
          className="mt-4 p-4 rounded-lg"
          style={{ backgroundColor: `${chartColors.aesthetics}10` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Attributed Revenue
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: chartColors.aesthetics }}
              >
                {formatCurrency(metaTotalAttributed)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                Expected Revenue (incl. 15% unattributed)
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: chartColors.aesthetics }}
              >
                {formatCurrency(metaExpectedRevenue)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 5: Google Ads Deep Dive */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Google Ads — Campaign Performance
        </h2>
        <DataTable columns={googleColumns} data={googleCampaigns} />
        <div className="mt-4 rounded-lg border-2 border-dashed p-4 text-center" style={{ borderColor: "#4285F4", backgroundColor: "#4285F410" }}>
          <p className="text-sm text-gray-600">Expected Revenue (1.15x pipeline multiplier)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#4285F4" }}>
            {formatCurrency(googleExpectedRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {formatCurrency(googleTotalRevenue)} total expected revenue
          </p>
        </div>
      </Card>

      {/* Section 6: CI Chat */}
      <CIChat />
    </>
  );
}

/* ---------- page export ---------- */

export default function AestheticsMarketingPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <AestheticsMarketingContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          brandFilter={brandFilter}
        />
      )}
    </DashboardShell>
  );
}
