import { cn } from "@/lib/utils";
import { STATUS_DOT, statusLabel, type Status } from "@/lib/status";

/**
 * Accessible status indicator. Renders a colored dot plus a screen-reader-only
 * label so the green/amber/red signal is not color-only.
 */
export function StatusDot({
  status,
  size = "sm",
  className,
}: {
  status: Status;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";
  return (
    <span className={cn("inline-flex items-center", className)}>
      <span
        aria-hidden
        className={cn("inline-block rounded-full", dim, STATUS_DOT[status])}
      />
      <span className="sr-only">{statusLabel(status)}</span>
    </span>
  );
}
