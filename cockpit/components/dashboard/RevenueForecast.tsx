"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { forecastWithConfidence } from "@/lib/utils/forecast";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface RevenueForecastProps {
  salesData: { week_start: string; revenue_ex_vat: number }[];
  loading: boolean;
}

export function RevenueForecast({ salesData, loading }: RevenueForecastProps) {
  const forecastData = useMemo(() => {
    if (salesData.length < 3) return null;

    // Aggregate by week
    const weekMap = new Map<string, number>();
    for (const row of salesData) {
      weekMap.set(row.week_start, (weekMap.get(row.week_start) || 0) + (row.revenue_ex_vat || 0));
    }

    const weeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const dataPoints = weeks.map(([, rev], i) => ({ x: i, y: rev }));

    // Project 4 more weeks (30 days)
    const futureXs = [weeks.length, weeks.length + 1, weeks.length + 2, weeks.length + 3];
    const forecast = forecastWithConfidence(dataPoints, futureXs, 0.8);

    // Create chart data with week labels
    const baseDate = new Date(weeks[0][0]);
    return forecast.map((point) => {
      const weekDate = new Date(baseDate.getTime() + point.x * 7 * 86400000);
      const label = weekDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      return {
        week: label,
        revenue: Math.round(point.y),
        low: point.isProjection ? Math.round(point.yLow) : undefined,
        high: point.isProjection ? Math.round(point.yHigh) : undefined,
        isProjection: point.isProjection,
      };
    });
  }, [salesData]);

  if (loading || !forecastData) {
    return null; // Don't render if no data
  }

  const lastActual = forecastData.filter((d) => !d.isProjection).pop();
  const lastProjection = forecastData[forecastData.length - 1];

  return (
    <Card className="p-6 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-charcoal">Revenue Forecast (30-day)</h2>
        {lastProjection && lastActual && (
          <div className="text-xs text-text-secondary">
            Projected: <span className="font-semibold text-gold">{formatCurrency(lastProjection.revenue)}</span>
            <span className="mx-1">&middot;</span>
            80% CI: {formatCurrency(lastProjection.low ?? 0)} &ndash; {formatCurrency(lastProjection.high ?? 0)}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={forecastData} margin={chartDefaults.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          {/* Confidence interval band (only shows for projections) */}
          <Area
            type="monotone"
            dataKey="high"
            stroke="none"
            fill={chartColors.spa}
            fillOpacity={0.08}
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="none"
            fill="#FFFFFF"
            fillOpacity={1}
          />
          {/* Main line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={chartColors.spa}
            strokeWidth={2}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: { isProjection: boolean } };
              if (payload?.isProjection) {
                return <circle cx={cx} cy={cy} r={3} fill="white" stroke={chartColors.spa} strokeWidth={1.5} strokeDasharray="2 2" />;
              }
              return <circle cx={cx} cy={cy} r={3} fill={chartColors.spa} />;
            }}
          />
          {/* Divider line between actual and projected */}
          {lastActual && (
            <ReferenceLine
              x={lastActual.week}
              stroke="#B8943E"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: "Forecast", position: "top", fill: "#B8943E", fontSize: 10 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
