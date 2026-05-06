import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STATUS_BG, type Status } from "@/lib/status";
import { StatusDot } from "@/components/dashboard/status-dot";

export function StatCard({
  label,
  value,
  unit,
  delta,
  status = "neutral",
  caption,
  big,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  status?: Status;
  caption?: string;
  big?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", STATUS_BG[status], className)}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <StatusDot status={status} />
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={cn("font-bold text-foreground", big ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl")}>
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {delta && <p className="text-[11px] text-muted-foreground mt-0.5">{delta}</p>}
      {caption && <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{caption}</p>}
    </Card>
  );
}
