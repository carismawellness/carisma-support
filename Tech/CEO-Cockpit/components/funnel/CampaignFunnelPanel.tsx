"use client";

import { Card } from "@/components/ui/card";
import { chartColors } from "@/lib/charts/config";
import {
  overallConversionSeverity,
  severityClasses,
} from "@/lib/funnel/constraint-detection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CampaignRow {
  campaignName: string;
  spend: number;
  cpl: number;
  leads: number;
  booked: number;
  showed: number;
  conversionPct: number;
  showRatePct: number;
  expectedRevenue: number;
}

/* ------------------------------------------------------------------ */
/*  Brands                                                             */
/* ------------------------------------------------------------------ */

const BRANDS = [
  { slug: "spa", label: "Spa" },
  { slug: "aesthetics", label: "Aesthetics" },
  { slug: "slimming", label: "Slimming" },
] as const;

/* ------------------------------------------------------------------ */
/*  Dummy campaign data per brand                                      */
/* ------------------------------------------------------------------ */

const CAMPAIGN_DATA: Record<string, CampaignRow[]> = {
  spa: [
    {
      campaignName: "Deep Tissue Promo",
      spend: 420, cpl: 8.40, leads: 50, booked: 12, showed: 10,
      conversionPct: 20.0, showRatePct: 83.3, expectedRevenue: 1_200,
    },
    {
      campaignName: "Couples Retreat Offer",
      spend: 380, cpl: 9.50, leads: 40, booked: 8, showed: 7,
      conversionPct: 17.5, showRatePct: 87.5, expectedRevenue: 980,
    },
    {
      campaignName: "Hot Stone Weekend",
      spend: 310, cpl: 7.75, leads: 40, booked: 10, showed: 8,
      conversionPct: 20.0, showRatePct: 80.0, expectedRevenue: 960,
    },
    {
      campaignName: "Membership Drive",
      spend: 250, cpl: 12.50, leads: 20, booked: 4, showed: 3,
      conversionPct: 15.0, showRatePct: 75.0, expectedRevenue: 450,
    },
  ],
  aesthetics: [
    {
      campaignName: "Filler Spring Campaign",
      spend: 680, cpl: 11.33, leads: 60, booked: 14, showed: 12,
      conversionPct: 20.0, showRatePct: 85.7, expectedRevenue: 3_600,
    },
    {
      campaignName: "Skinbooster Awareness",
      spend: 520, cpl: 10.40, leads: 50, booked: 10, showed: 8,
      conversionPct: 16.0, showRatePct: 80.0, expectedRevenue: 2_400,
    },
    {
      campaignName: "Botox Reactivation",
      spend: 450, cpl: 9.00, leads: 50, booked: 12, showed: 10,
      conversionPct: 20.0, showRatePct: 83.3, expectedRevenue: 2_500,
    },
    {
      campaignName: "PRP Rejuvenation",
      spend: 380, cpl: 12.67, leads: 30, booked: 6, showed: 5,
      conversionPct: 16.7, showRatePct: 83.3, expectedRevenue: 1_500,
    },
    {
      campaignName: "Google Search Brand",
      spend: 290, cpl: 14.50, leads: 20, booked: 5, showed: 4,
      conversionPct: 20.0, showRatePct: 80.0, expectedRevenue: 1_200,
    },
  ],
  slimming: [
    {
      campaignName: "Body Contouring Hero",
      spend: 550, cpl: 11.00, leads: 50, booked: 11, showed: 9,
      conversionPct: 18.0, showRatePct: 81.8, expectedRevenue: 2_700,
    },
    {
      campaignName: "Summer Ready Programme",
      spend: 480, cpl: 9.60, leads: 50, booked: 10, showed: 8,
      conversionPct: 16.0, showRatePct: 80.0, expectedRevenue: 2_400,
    },
    {
      campaignName: "Fat Freezing Offer",
      spend: 390, cpl: 13.00, leads: 30, booked: 6, showed: 5,
      conversionPct: 16.7, showRatePct: 83.3, expectedRevenue: 1_500,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function showRateSeverity(pct: number): "green" | "amber" | "red" {
  if (pct >= 80) return "green";
  if (pct >= 65) return "amber";
  return "red";
}

/* ------------------------------------------------------------------ */
/*  Consolidating Chart                                                */
/* ------------------------------------------------------------------ */

function CampaignChart({ campaigns, brandColor }: { campaigns: CampaignRow[]; brandColor: string }) {
  const data = campaigns.map((c) => ({
    name: c.campaignName.length > 18 ? c.campaignName.slice(0, 16) + "…" : c.campaignName,
    "Conv %": c.conversionPct,
    "Show %": c.showRatePct,
  }));

  return (
    <div className="h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => `${Number(value).toFixed(1)}%`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Conv %" fill={brandColor} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Show %" fill={brandColor} opacity={0.45} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Campaign Table                                                     */
/* ------------------------------------------------------------------ */

function CampaignTable({ campaigns, brandColor }: { campaigns: CampaignRow[]; brandColor: string }) {
  // Sort by spend descending
  const sorted = [...campaigns].sort((a, b) => b.spend - a.spend);

  // Totals row
  const totalSpend = sorted.reduce((s, c) => s + c.spend, 0);
  const totalLeads = sorted.reduce((s, c) => s + c.leads, 0);
  const totalBooked = sorted.reduce((s, c) => s + c.booked, 0);
  const totalShowed = sorted.reduce((s, c) => s + c.showed, 0);
  const totalExpRev = sorted.reduce((s, c) => s + c.expectedRevenue, 0);
  const avgConv = totalLeads > 0 ? (totalBooked / totalLeads) * 100 : 0;
  const avgShow = totalBooked > 0 ? (totalShowed / totalBooked) * 100 : 0;
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="min-w-[700px] px-4 md:px-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warm-border">
            <th className="text-left py-2 pr-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Campaign
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>
              Conv %
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>
              Show %
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              CPL
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Spend
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Exp. Rev
            </th>
            <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              ROAS
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const convSev = overallConversionSeverity(c.conversionPct);
            const showSev = showRateSeverity(c.showRatePct);
            const roas = c.spend > 0 ? c.expectedRevenue / c.spend : 0;
            const roasSev = roas >= 3 ? "green" : roas >= 2 ? "amber" : "red";

            return (
              <tr key={c.campaignName} className="border-b border-warm-border/50 last:border-0">
                <td className="py-2.5 pr-3 text-sm font-medium text-foreground">
                  {c.campaignName}
                </td>
                <td className="py-2 px-2">
                  <div className={`text-center py-1 rounded-lg ${severityClasses[convSev].bg}`}>
                    <span className={`text-sm font-bold ${severityClasses[convSev].text}`}>
                      {c.conversionPct.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className={`text-center py-1 rounded-lg ${severityClasses[showSev].bg}`}>
                    <span className={`text-sm font-bold ${severityClasses[showSev].text}`}>
                      {c.showRatePct.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center text-sm text-foreground tabular-nums">
                  €{c.cpl.toFixed(2)}
                </td>
                <td className="py-2.5 px-2 text-center text-sm text-foreground tabular-nums">
                  €{c.spend.toLocaleString()}
                </td>
                <td className="py-2.5 px-2 text-center text-sm text-foreground tabular-nums">
                  €{c.expectedRevenue.toLocaleString()}
                </td>
                <td className="py-2 px-2">
                  <div className={`text-center py-1 rounded-lg ${severityClasses[roasSev].bg}`}>
                    <span className={`text-sm font-bold ${severityClasses[roasSev].text}`}>
                      {roas.toFixed(1)}x
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-warm-border">
            <td className="py-2.5 pr-3 text-sm font-semibold text-foreground">Total / Avg</td>
            <td className="py-2 px-2">
              <div className={`text-center py-1 rounded-lg ${severityClasses[overallConversionSeverity(avgConv)].bg}`}>
                <span className={`text-sm font-bold ${severityClasses[overallConversionSeverity(avgConv)].text}`}>
                  {avgConv.toFixed(1)}%
                </span>
              </div>
            </td>
            <td className="py-2 px-2">
              <div className={`text-center py-1 rounded-lg ${severityClasses[showRateSeverity(avgShow)].bg}`}>
                <span className={`text-sm font-bold ${severityClasses[showRateSeverity(avgShow)].text}`}>
                  {avgShow.toFixed(1)}%
                </span>
              </div>
            </td>
            <td className="py-2.5 px-2 text-center text-sm font-semibold text-foreground tabular-nums">
              €{avgCpl.toFixed(2)}
            </td>
            <td className="py-2.5 px-2 text-center text-sm font-semibold text-foreground tabular-nums">
              €{totalSpend.toLocaleString()}
            </td>
            <td className="py-2.5 px-2 text-center text-sm font-semibold text-foreground tabular-nums">
              €{totalExpRev.toLocaleString()}
            </td>
            {(() => {
              const totalRoas = totalSpend > 0 ? totalExpRev / totalSpend : 0;
              const totalRoasSev = totalRoas >= 3 ? "green" : totalRoas >= 2 ? "amber" : "red";
              return (
                <td className="py-2 px-2">
                  <div className={`text-center py-1 rounded-lg ${severityClasses[totalRoasSev].bg}`}>
                    <span className={`text-sm font-bold ${severityClasses[totalRoasSev].text}`}>
                      {totalRoas.toFixed(1)}x
                    </span>
                  </div>
                </td>
              );
            })()}
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CampaignFunnelPanel() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Campaign Drill-Down</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Per-campaign metrics — conversion rate & show rate highlighted
        </p>
      </div>

      <div className="space-y-6">
        {BRANDS.map((brand) => {
          const campaigns = CAMPAIGN_DATA[brand.slug] ?? [];
          const brandColor = chartColors[brand.slug as keyof typeof chartColors] ?? "#888";

          return (
            <Card key={brand.slug} className="p-4 md:p-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: brandColor }}
              >
                {brand.label}
              </h3>

              <CampaignTable campaigns={campaigns} brandColor={brandColor} />
              <CampaignChart campaigns={campaigns} brandColor={brandColor} />
            </Card>
          );
        })}
      </div>
    </section>
  );
}
