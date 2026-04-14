export const chartColors = {
  spa: "#1B3A4B",
  aesthetics: "#B8943E",
  slimming: "#10B981",
  target: "#EF4444",
  budget: "#6B7280",
} as const;

export const chartDefaults = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  dotRadius: 4,
  animationDuration: 300,
} as const;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMinutes(value: number): string {
  return value < 1 ? `${Math.round(value * 60)}s` : `${value.toFixed(1)}m`;
}
