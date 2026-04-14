"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { CIChat } from "@/components/ci/CIChat";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const kpis: KPIData[] = [
  { label: "Total Revenue", value: "€42,350", trend: 8, target: "€45,000", targetValue: 45000, currentValue: 42350 },
  { label: "Blended ROAS", value: "5.2x", trend: 3, target: "5.0x", targetValue: 5, currentValue: 5.2 },
  { label: "Conversion Rate", value: "27.3%", trend: -2, target: "25%", targetValue: 25, currentValue: 27.3 },
  { label: "Company HC%", value: "38.2%", trend: -1, target: "40%", targetValue: 40, currentValue: 38.2 },
  { label: "Speed to Lead", value: "4.2m", trend: 5, target: "5m", targetValue: 5, currentValue: 4.2 },
];

const revenueData = [
  { week: "Week 1", spa: 12400, aesthetics: 8200, slimming: 6800 },
  { week: "Week 2", spa: 13100, aesthetics: 8800, slimming: 7200 },
  { week: "Week 3", spa: 11800, aesthetics: 9400, slimming: 7600 },
  { week: "Week 4", spa: 14200, aesthetics: 9800, slimming: 8000 },
];

const deptHealthData = [
  { department: "Marketing", score: 85 },
  { department: "Sales", score: 72 },
  { department: "Finance", score: 95 },
  { department: "HR", score: 80 },
  { department: "Operations", score: 68 },
];

export default function CEOPage() {
  return (
    <DashboardShell>
      {() => (
        <>
          <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
          <KPICardRow kpis={kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Brand</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData} margin={chartDefaults.margin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend />
                  <Line type="monotone" dataKey="spa" name="Spa" stroke={chartColors.spa} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="aesthetics" name="Aesthetics" stroke={chartColors.aesthetics} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                  <Line type="monotone" dataKey="slimming" name="Slimming" stroke={chartColors.slimming} strokeWidth={chartDefaults.strokeWidth} dot={{ r: chartDefaults.dotRadius }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Health</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={deptHealthData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke={chartColors.spa} fill={chartColors.spa} fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <AlertFeed />
          <CIChat />
        </>
      )}
    </DashboardShell>
  );
}
