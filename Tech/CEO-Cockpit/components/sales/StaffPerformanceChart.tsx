"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/charts/config";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StaffEntry {
  name: string;
  revenue: number;
}

interface StaffTab {
  key: string;
  label: string;
  data: StaffEntry[];
  color: string;
}

interface StaffPerformanceChartProps {
  title?: string;
  subtitle?: string;
  tabs: StaffTab[];
  icon?: React.ReactNode;
}

/** Gradient palette: top performer is full color, lower performers fade */
function gradientColor(hex: string, ratio: number): string {
  // Parse hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Blend toward white based on ratio (1.0 = full color, 0.0 = white)
  const t = 0.35 + ratio * 0.65; // range from 35% to 100% intensity
  const nr = Math.round(r * t + 255 * (1 - t));
  const ng = Math.round(g * t + 255 * (1 - t));
  const nb = Math.round(b * t + 255 * (1 - t));

  return `rgb(${nr}, ${ng}, ${nb})`;
}

function StaffBarChart({ data, color }: { data: StaffEntry[]; color: string }) {
  const maxRev = data[0]?.revenue ?? 1;

  return (
    <ResponsiveContainer width="100%" height={data.length * 48 + 40}>
      <BarChart
        data={data}
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
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Bar
          dataKey="revenue"
          radius={[0, 4, 4, 0]}
          barSize={28}
          label={{
            position: "right",
            formatter: (v: unknown) => formatCurrency(Number(v)),
            fontSize: 11,
            fill: "#6b7280",
          }}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={gradientColor(color, entry.revenue / maxRev)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StaffPerformanceChart({
  title = "Staff Performance",
  subtitle,
  tabs,
  icon,
}: StaffPerformanceChartProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  if (tabs.length === 0) return null;

  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-4 ml-8">{subtitle}</p>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <StaffBarChart data={tab.data} color={tab.color} />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

export type { StaffEntry, StaffTab, StaffPerformanceChartProps };
