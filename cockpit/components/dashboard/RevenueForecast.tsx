"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart } from "@/components/ui/skeleton";
import { chartDefaults, formatCurrency } from "@/lib/charts/config";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastDataPoint {
  period: string;
  actual: number | null;
  forecast: number | null;
}

interface RevenueForecastProps {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}

export function RevenueForecast({
  dateFrom,
  dateTo,
  brandFilter,
}: RevenueForecastProps) {
  const [data, setData] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: in production this would fetch from an API
    const timer = setTimeout(() => {
      setData([
        { period: "Week 1", actual: 10200, forecast: null },
        { period: "Week 2", actual: 11400, forecast: null },
        { period: "Week 3", actual: 10800, forecast: null },
        { period: "Week 4", actual: null, forecast: 11600 },
        { period: "Week 5", actual: null, forecast: 12200 },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, brandFilter]);

  if (loading) {
    return <SkeletonChart height={300} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Revenue Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="var(--color-navy)"
              fill="var(--card)"
              strokeWidth={chartDefaults.strokeWidth}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="var(--color-gold)"
              fill="var(--card)"
              strokeWidth={chartDefaults.strokeWidth}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
