"use client";

import { Card } from "@/components/ui/card";
import {
  severityClasses,
  severityColor,
  overallConversionSeverity,
  leadsPerAgentSeverity,
  OVERALL_CONVERSION_BENCHMARK,
  LEADS_PER_DAY_PER_AGENT_MIN,
} from "@/lib/funnel/constraint-detection";
import { chartColors } from "@/lib/charts/config";

/* ------------------------------------------------------------------ */
/*  Dummy heatmap data (mirrors BrandFunnelCard calculations)          */
/* ------------------------------------------------------------------ */

interface HeatmapRow {
  metric: string;
  unit: string;
  benchmark: number | null;
  values: Record<string, { value: number; severity: "green" | "amber" | "red" | "off" }>;
}

const BRANDS = ["spa", "aesthetics", "slimming"] as const;
const BRAND_LABELS: Record<string, string> = {
  spa: "Spa",
  aesthetics: "Aesthetics",
  slimming: "Slimming",
};

/** Ad refresh severity: lower days since refresh = better */
function adRefreshSeverity(days: number): "green" | "amber" | "red" {
  if (days <= 14) return "green";
  if (days <= 30) return "amber";
  return "red";
}

const HEATMAP_DATA: HeatmapRow[] = [
  {
    metric: "Ad Refresh",
    unit: "d",
    benchmark: 14,
    values: {
      spa: { value: 8, severity: adRefreshSeverity(8) },
      aesthetics: { value: 22, severity: adRefreshSeverity(22) },
      slimming: { value: 35, severity: adRefreshSeverity(35) },
    },
  },
  {
    metric: "Daily Leads",
    unit: "",
    benchmark: null,
    values: {
      spa: { value: 30, severity: "green" },
      aesthetics: { value: 41, severity: "green" },
      slimming: { value: 24, severity: "amber" },
    },
  },
  {
    metric: "Cost per Lead",
    unit: "",
    benchmark: 12,
    values: {
      spa: { value: 8.90, severity: severityColor(12, 8.90) },
      aesthetics: { value: 11.20, severity: severityColor(12, 11.20) },
      slimming: { value: 13.50, severity: severityColor(12, 13.50) },
    },
  },
  {
    metric: "Speed to Lead",
    unit: "m",
    benchmark: 5,
    values: {
      spa: { value: 3.2, severity: severityColor(5, 3.2) },
      aesthetics: { value: 4.8, severity: severityColor(5, 4.8) },
      slimming: { value: 6.1, severity: severityColor(5, 6.1) },
    },
  },
  {
    metric: "Leads/Day/Agent",
    unit: "",
    benchmark: LEADS_PER_DAY_PER_AGENT_MIN,
    values: {
      spa: { value: 10.0, severity: leadsPerAgentSeverity(10.0) },
      aesthetics: { value: 10.4, severity: leadsPerAgentSeverity(10.4) },
      slimming: { value: 12.1, severity: leadsPerAgentSeverity(12.1) },
    },
  },
  {
    metric: "Booking Conversion",
    unit: "%",
    benchmark: OVERALL_CONVERSION_BENCHMARK,
    values: {
      spa: { value: 18.1, severity: overallConversionSeverity(18.1) },
      aesthetics: { value: 7.2, severity: overallConversionSeverity(7.2) },
      slimming: { value: 7.1, severity: overallConversionSeverity(7.1) },
    },
  },
  {
    metric: "Deposit Rate",
    unit: "%",
    benchmark: 70,
    values: {
      spa: { value: 72.5, severity: severityColor(72.5, 70) },
      aesthetics: { value: 68.1, severity: severityColor(68.1, 70) },
      slimming: { value: 74.3, severity: severityColor(74.3, 70) },
    },
  },
  {
    metric: "Show Rate",
    unit: "%",
    benchmark: 80,
    values: {
      spa: { value: 85.4, severity: severityColor(85.4, 80) },
      aesthetics: { value: 84.0, severity: severityColor(84.0, 80) },
      slimming: { value: 85.7, severity: severityColor(85.7, 80) },
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConstraintHeatmap() {
  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Constraint Heatmap</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          2-second scan: which metrics are off?
        </p>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="min-w-[540px] px-4 md:px-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-border">
              <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">
                Metric
              </th>
              <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                Target
              </th>
              {BRANDS.map((b) => (
                <th
                  key={b}
                  className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider w-28"
                  style={{ color: chartColors[b] }}
                >
                  {BRAND_LABELS[b]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEATMAP_DATA.map((row) => (
              <tr key={row.metric} className="border-b border-warm-border/50 last:border-0">
                <td className="py-2.5 pr-4 text-sm font-medium text-foreground">
                  {row.metric}
                </td>
                <td className="py-2.5 px-2 text-center text-xs text-muted-foreground">
                  {row.benchmark === null
                    ? "-"
                    : row.metric === "Cost per Lead"
                      ? `\u2264\u20AC${row.benchmark}`
                      : row.metric === "Speed to Lead"
                        ? `\u2264${row.benchmark}m`
                        : row.metric === "Ad Refresh"
                          ? `\u2264${row.benchmark}d`
                          : `${row.benchmark}${row.unit}`}
                </td>
                {BRANDS.map((b) => {
                  const cell = row.values[b];
                  if (!cell) {
                    return (
                      <td key={b} className="py-2.5 px-3 text-center text-xs text-muted-foreground">
                        N/A
                      </td>
                    );
                  }

                  // Zero = day off → show gray
                  const isOff = cell.value === 0;
                  const severity = isOff ? "off" : cell.severity;
                  const c = severityClasses[severity];

                  // Format value based on metric type
                  let formatted: string;
                  if (isOff) {
                    formatted = "-";
                  } else if (row.metric === "Daily Leads") {
                    formatted = cell.value.toLocaleString();
                  } else if (row.metric === "Ad Refresh") {
                    formatted = `${cell.value}d`;
                  } else if (row.metric === "Cost per Lead") {
                    formatted = `\u20AC${cell.value.toFixed(2)}`;
                  } else if (row.metric === "Speed to Lead") {
                    formatted = `${cell.value.toFixed(1)}m`;
                  } else if (row.unit === "%") {
                    formatted = `${cell.value.toFixed(1)}%`;
                  } else {
                    formatted = cell.value.toFixed(1);
                  }

                  return (
                    <td key={b} className="py-2.5 px-3">
                      <div className={`text-center py-1.5 rounded-lg ${c.bg}`}>
                        <span className={`text-sm font-bold ${c.text}`}>
                          {formatted}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-warm-border/50">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Legend:</span>
        {(["green", "amber", "red", "off"] as const).map((sev) => (
          <span key={sev} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-sm ${severityClasses[sev].bg} border ${severityClasses[sev].border}`} />
            {sev === "green" ? "On track" : sev === "amber" ? "Watch" : sev === "red" ? "Action needed" : "No data"}
          </span>
        ))}
      </div>
    </Card>
  );
}
