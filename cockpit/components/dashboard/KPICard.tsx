import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  target?: string;
  targetValue?: number;
  currentValue?: number;
  format?: "currency" | "percent" | "number" | "time";
}

export function KPICard({
  label,
  value,
  trend,
  target,
  targetValue,
  currentValue,
}: KPICardProps) {
  const trendColor =
    trend === undefined || trend === 0
      ? "text-text-secondary"
      : trend > 0
        ? "text-emerald-600"
        : "text-red-500";

  const trendBg =
    trend === undefined || trend === 0
      ? "bg-warm-gray"
      : trend > 0
        ? "bg-emerald-50"
        : "bg-red-50";

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const progressPct =
    targetValue && currentValue
      ? Math.min((currentValue / targetValue) * 100, 100)
      : null;

  return (
    <Card className="relative p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-light" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</span>
        {trend !== undefined && (
          <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", trendColor, trendBg)}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-charcoal mb-2">{value}</div>
      {progressPct !== null && (
        <div className="space-y-1.5">
          <div className="h-1.5 bg-warm-gray rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-gold to-gold-light"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {target && <span className="text-[11px] text-text-secondary">Target: {target}</span>}
        </div>
      )}
    </Card>
  );
}
