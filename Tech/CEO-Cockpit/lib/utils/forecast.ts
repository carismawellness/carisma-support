/**
 * Simple linear regression forecast.
 * Takes an array of { x: number, y: number } points and predicts y for future x values.
 */
export function linearForecast(
  data: { x: number; y: number }[],
  futureXValues: number[]
): { x: number; y: number; isProjection: boolean }[] {
  if (data.length < 2) return [];

  const n = data.length;
  const sumX = data.reduce((s, p) => s + p.x, 0);
  const sumY = data.reduce((s, p) => s + p.y, 0);
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = data.reduce((s, p) => s + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const historical = data.map((p) => ({ ...p, isProjection: false }));
  const projections = futureXValues.map((x) => ({
    x,
    y: Math.max(0, slope * x + intercept), // no negative revenue
    isProjection: true,
  }));

  return [...historical, ...projections];
}

/**
 * Calculate confidence interval based on standard error of regression
 */
export function forecastWithConfidence(
  data: { x: number; y: number }[],
  futureXValues: number[],
  confidence: number = 0.8
): { x: number; y: number; yLow: number; yHigh: number; isProjection: boolean }[] {
  if (data.length < 3) return [];

  const n = data.length;
  const sumX = data.reduce((s, p) => s + p.x, 0);
  const sumY = data.reduce((s, p) => s + p.y, 0);
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = data.reduce((s, p) => s + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Standard error of the estimate
  const residuals = data.map((p) => p.y - (slope * p.x + intercept));
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const se = Math.sqrt(sse / (n - 2));

  // Z-score for confidence level (approximation)
  const z = confidence === 0.8 ? 1.28 : confidence === 0.9 ? 1.645 : 1.96;

  const all = [
    ...data.map((p) => ({
      x: p.x,
      y: p.y,
      yLow: p.y,
      yHigh: p.y,
      isProjection: false,
    })),
    ...futureXValues.map((x) => {
      const predicted = Math.max(0, slope * x + intercept);
      const margin = z * se * Math.sqrt(1 + 1 / n);
      return {
        x,
        y: predicted,
        yLow: Math.max(0, predicted - margin),
        yHigh: predicted + margin,
        isProjection: true,
      };
    }),
  ];

  return all;
}
