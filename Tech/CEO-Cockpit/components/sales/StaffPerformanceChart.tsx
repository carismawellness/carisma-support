"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface StaffMember {
  name: string;
  serviceRevenue: number;
  retailRevenue: number;
}

interface StaffPerformanceChartProps {
  title?: string;
  subtitle?: string;
  data: StaffMember[];
  serviceColor: string;
  retailColor: string;
  icon?: React.ReactNode;
}

export function StaffPerformanceChart({
  title = "Staff Performance",
  subtitle,
  data,
  serviceColor,
  retailColor,
  icon,
}: StaffPerformanceChartProps) {
  if (data.length === 0) return null;

  // Sort by total descending, compute retail %
  const chartData = [...data]
    .map((d) => {
      const total = d.serviceRevenue + d.retailRevenue;
      return {
        name: d.name,
        "Service Revenue": d.serviceRevenue,
        "Retail Revenue": d.retailRevenue,
        retailPct: total > 0 ? ((d.retailRevenue / total) * 100).toFixed(0) : "0",
      };
    })
    .sort(
      (a, b) =>
        b["Service Revenue"] +
        b["Retail Revenue"] -
        (a["Service Revenue"] + a["Retail Revenue"])
    );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-4 ml-8">{subtitle}</p>
      )}

      <ResponsiveContainer width="100%" height={chartData.length * 48 + 50}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0ede8"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCurrency(v)}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="Service Revenue"
            stackId="total"
            fill={serviceColor}
            radius={[0, 0, 0, 0]}
            barSize={28}
          />
          <Bar
            dataKey="Retail Revenue"
            stackId="total"
            fill={retailColor}
            radius={[0, 4, 4, 0]}
            barSize={28}
          >
            <LabelList
              dataKey="retailPct"
              content={(props) => {
                const { x, width, y, height, value } = props as Record<string, unknown>;
                const w = Number(width);
                if (!value || w < 20) return <></>;
                return (
                  <text
                    x={Number(x) + w / 2}
                    y={Number(y) + Number(height) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill="white"
                  >
                    {String(value)}%
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export type { StaffMember, StaffPerformanceChartProps };
