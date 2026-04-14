import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "./Sparkline";
import { RootCauseButton } from "./RootCauseButton";

function TrendBadge({ value, label, lowerIsBetter }: { value: number; label: string; lowerIsBetter?: boolean }) {
  const isPositive = lowerIsBetter ? value < 0 : value > 0;
  const isNeutral = value === 0;

  const color = isNeutral
    ? "text-text-secondary"
    : isPositive
      ? "text-emerald-600"
      : "text-red-500";

  const bg = isNeutral
    ? "bg-warm-gray"
    : isPositive
      ? "bg-emerald-50"
      : "bg-red-50";

  const Icon = isNeutral
    ? Minus
    : value > 0
      ? TrendingUp
      : TrendingDown;

  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full", color, bg)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}% {label}
    </span>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  trendMoM?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
  sparkline?: number[];
  lowerIsBetter?: boolean;
  format?: "currency" | "percent" | "number" | "time";
}

export function KPICard({
  label,
  value,
  trend,
  trendMoM,
  target,
  targetValue,
  currentValue,
  sparkline,
  lowerIsBetter,
}: KPICardProps) {
  const progressPct =
    targetValue && currentValue
      ? Math.min((currentValue / targetValue) * 100, 100)
      : null;

  // Compute the gap between current and target
  const gap =
    targetValue !== undefined && currentValue !== undefined
      ? currentValue - targetValue
      : null;

  // Determine if the gap is "good" (green) or "bad" (red)
  const gapIsGood =
    gap !== null
      ? lowerIsBetter
        ? gap <= 0 // for lower-is-better, being below target is good
        : gap >= 0 // for higher-is-better, being above target is good
      : null;

  // Format gap display — try to match the value format
  const formatGap = (gapValue: number): string => {
    const abs = Math.abs(gapValue);
    if (value.startsWith("€")) return `€${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (value.endsWith("%")) return `${abs.toFixed(1)}%`;
    if (value.endsWith("x")) return `${abs.toFixed(1)}x`;
    if (value.endsWith("m")) return `${abs.toFixed(1)}m`;
    return abs.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <Card className="relative p-4 sm:p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-light" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</span>
        {sparkline && sparkline.length >= 2 && <Sparkline data={sparkline} />}
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-charcoal">{value}</span>
        <div className="flex flex-col items-end gap-0.5">
          {trend !== undefined && <TrendBadge value={trend} label="WoW" lowerIsBetter={lowerIsBetter} />}
          {trendMoM !== undefined && <TrendBadge value={trendMoM} label="MoM" lowerIsBetter={lowerIsBetter} />}
        </div>
      </div>
      {progressPct !== null && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-warm-gray rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-gold to-gold-light"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            {target && <span className="text-[11px] text-text-secondary">{Math.round(progressPct)}% of target</span>}
            {gap !== null && gap !== 0 && (
              <span className={cn("text-[11px] font-medium", gapIsGood ? "text-emerald-600" : "text-red-500")}>
                {formatGap(gap)} {gap > 0 ? "above" : "below"} target
              </span>
            )}
          </div>
        </div>
      )}
      {targetValue !== undefined && currentValue !== undefined && (
        <RootCauseButton
          metric={label}
          currentValue={currentValue}
          target={targetValue}
          department="Cross-department"
        />
      )}
    </Card>
  );
}
