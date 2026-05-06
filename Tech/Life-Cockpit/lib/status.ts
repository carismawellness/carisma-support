/**
 * Shared status semantics. Single source of truth for the green/amber/red
 * traffic-light system used across module pages.
 */

export type Status = "green" | "amber" | "red" | "neutral";

export const STATUS_DOT: Record<Status, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  neutral: "bg-muted-foreground",
};

export const STATUS_BG: Record<Status, string> = {
  green: "bg-emerald-50 border-emerald-200",
  amber: "bg-amber-50 border-amber-200",
  red: "bg-red-50 border-red-200",
  neutral: "border-border",
};

export const STATUS_TEXT: Record<Status, string> = {
  green: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-700",
  neutral: "text-muted-foreground",
};

export const STATUS_BAR: Record<Status, string> = {
  green: "bg-emerald-600",
  amber: "bg-amber-500",
  red: "bg-red-500",
  neutral: "bg-muted",
};

const STATUS_LABEL: Record<Status, string> = {
  green: "On track",
  amber: "Watch",
  red: "Action required",
  neutral: "Neutral",
};

/**
 * Threshold helper. Higher-is-better unless `inverse` is true (e.g. body fat %, RHR).
 */
export function statusFromValue(
  value: number,
  green: number,
  amber: number,
  inverse = false
): Status {
  if (inverse) {
    if (value <= green) return "green";
    if (value <= amber) return "amber";
    return "red";
  }
  if (value >= green) return "green";
  if (value >= amber) return "amber";
  return "red";
}

/**
 * Progress (0..1) → status. Used for goal/OKR/streak bars.
 */
export function statusFromProgress(progress: number): Status {
  if (progress >= 0.75) return "green";
  if (progress >= 0.4) return "amber";
  return "red";
}

export function statusLabel(s: Status): string {
  return STATUS_LABEL[s];
}
