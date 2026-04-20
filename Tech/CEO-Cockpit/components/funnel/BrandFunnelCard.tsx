"use client";

import { Card } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { ConstraintBadge } from "./ConstraintBadge";
import {
  detectConstraint,
  overallConversionSeverity,
  leadsPerAgentSeverity,
  severityClasses,
  OVERALL_CONVERSION_BENCHMARK,
  LEADS_PER_DAY_PER_AGENT_MIN,
  type FunnelStage,
  type Constraint,
} from "@/lib/funnel/constraint-detection";
import { chartColors } from "@/lib/charts/config";

/* ------------------------------------------------------------------ */
/*  HSL helper (same pattern as existing FunnelChart)                  */
/* ------------------------------------------------------------------ */

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/* ------------------------------------------------------------------ */
/*  Brand funnel definitions (dummy data)                              */
/* ------------------------------------------------------------------ */

const BRAND_LABELS: Record<string, string> = {
  spa: "Spa",
  aesthetics: "Aesthetics",
  slimming: "Slimming",
};

/** Spa: Lead → Booked → Showed */
const SPA_STAGES: FunnelStage[] = [
  { label: "Lead", value: 420, conversionPct: null },
  { label: "Booked", value: 96, conversionPct: 22.9 },
  { label: "Showed", value: 82, conversionPct: 85.4 },
];

/** Aesthetics: Lead → Booked → Showed */
const AESTHETICS_STAGES: FunnelStage[] = [
  { label: "Lead", value: 580, conversionPct: null },
  { label: "Booked", value: 50, conversionPct: 8.6 },
  { label: "Showed", value: 42, conversionPct: 84.0 },
];

/** Slimming: Lead → Booked → Showed + course split */
const SLIMMING_STAGES: FunnelStage[] = [
  { label: "Lead", value: 340, conversionPct: null },
  { label: "Booked", value: 28, conversionPct: 8.2 },
  { label: "Showed", value: 24, conversionPct: 85.7 },
];

const SLIMMING_SPLIT = [
  { label: "Regular Course", value: 16, conversionPct: 66.7 },
  { label: "Max Course", value: 8, conversionPct: 33.3 },
];

const BRAND_FUNNELS: Record<string, { stages: FunnelStage[]; split?: { label: string; value: number; conversionPct: number }[]; agentCount: number }> = {
  spa: { stages: SPA_STAGES, agentCount: 3 },
  aesthetics: { stages: AESTHETICS_STAGES, agentCount: 4 },
  slimming: { stages: SLIMMING_STAGES, split: SLIMMING_SPLIT, agentCount: 2 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface BrandFunnelCardProps {
  brand: string;
  dateFrom: Date;
  dateTo: Date;
}

export function BrandFunnelCard({ brand, dateFrom, dateTo }: BrandFunnelCardProps) {
  const funnel = BRAND_FUNNELS[brand];
  if (!funnel) return null;

  const { stages, split, agentCount } = funnel;
  const color = chartColors[brand as keyof typeof chartColors] ?? "#888";
  const { h, s } = hexToHsl(color);

  // Metrics
  const topValue = stages[0]?.value ?? 0;
  const bottomValue = stages[stages.length - 1]?.value ?? 0;
  const overallConversion = topValue > 0 ? (bottomValue / topValue) * 100 : 0;
  const daysInPeriod = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const leadsPerDayPerAgent = agentCount > 0 ? topValue / daysInPeriod / agentCount : 0;

  const constraint = detectConstraint(stages);
  const convSeverity = overallConversionSeverity(overallConversion);
  const leadsSeverity = leadsPerAgentSeverity(leadsPerDayPerAgent);

  const maxValue = stages[0]?.value ?? 1;

  return (
    <Card className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-base font-bold"
            style={{ color }}
          >
            {BRAND_LABELS[brand] ?? brand}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {topValue.toLocaleString()} leads &rarr; {bottomValue.toLocaleString()} completed
          </p>
        </div>
        <ConstraintBadge constraint={constraint} />
      </div>

      {/* KPI pills */}
      <div className="flex gap-3 mb-5">
        <div className={`flex-1 text-center py-2 rounded-lg ${severityClasses[convSeverity].bg}`}>
          <p className={`text-lg font-bold ${severityClasses[convSeverity].text}`}>
            {overallConversion.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Conv Rate (target {OVERALL_CONVERSION_BENCHMARK}%)
          </p>
        </div>
        <div className={`flex-1 text-center py-2 rounded-lg ${severityClasses[leadsSeverity].bg}`}>
          <p className={`text-lg font-bold ${severityClasses[leadsSeverity].text}`}>
            {leadsPerDayPerAgent.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Leads/day/agent (min {LEADS_PER_DAY_PER_AGENT_MIN})
          </p>
        </div>
      </div>

      {/* Funnel bars */}
      <div className="space-y-1">
        {stages.map((stage, i) => {
          const widthPct = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const displayWidth = Math.max(widthPct, 20);
          const lightness = 40 + (i / Math.max(stages.length - 1, 1)) * 30;
          const bgColor = `hsl(${h}, ${s}%, ${lightness}%)`;
          const textColor = lightness < 55 ? "white" : "#1f2937";
          const dropOff = i > 0 ? stages[i - 1].value - stage.value : 0;

          return (
            <div key={stage.label}>
              {i > 0 && dropOff > 0 && (
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    {dropOff.toLocaleString()} lost &middot; {stage.conversionPct?.toFixed(1)}%
                  </span>
                  <ArrowDown className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <div className="flex justify-center">
                <div
                  className="relative rounded-lg px-3 py-2.5 transition-all duration-300"
                  style={{ width: `${displayWidth}%`, backgroundColor: bgColor, minHeight: 40 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate" style={{ color: textColor }}>
                      {stage.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: textColor }}>
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slimming split */}
      {split && split.length > 0 && (
        <div className="pt-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ backgroundColor: `hsl(${h}, ${s}%, 80%)` }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `hsl(${h}, ${s}%, 40%)` }}>
              Split
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: `hsl(${h}, ${s}%, 80%)` }} />
          </div>
          <div className="flex gap-4">
            {split.map((branch) => (
              <div key={branch.label} className="flex-1">
                <div
                  className="relative h-14 rounded-xl flex items-center justify-between px-4"
                  style={{
                    background: `linear-gradient(135deg, hsl(${h}, ${s}%, 40%), hsl(${h}, ${s}%, 55%))`,
                    boxShadow: `0 4px 12px hsla(${h}, ${s}%, 40%, 0.3)`,
                  }}
                >
                  <div className="absolute -top-3 left-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm bg-white border"
                      style={{ color, borderColor: `${color}33` }}
                    >
                      {branch.label}
                    </span>
                  </div>
                  <span className="text-white font-bold text-xl mt-1">{branch.value}</span>
                  <span className="text-white/80 text-sm font-medium mt-1">
                    {branch.conversionPct.toFixed(0)}% conv
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
