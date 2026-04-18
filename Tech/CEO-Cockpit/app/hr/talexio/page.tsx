"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import {
  useTalexioEmployees,
  useTalexioTimeLogs,
  useTalexioLeave,
  useTalexioPayslips,
  TalexioEmployee,
  TalexioEmployeeWithTimeLogs,
  TalexioEmployeeWithLeave,
  TalexioEmployeeWithPayslips,
} from "@/lib/hooks/useTalexio";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

const PIE_COLORS = [
  chartColors.spa, chartColors.aesthetics, chartColors.slimming,
  "#8B5CF6", "#EC4899", "#06B6D4", "#F59E0B", "#10B981", "#6366F1", "#EF4444",
];

function parseTime(iso: string): Date { return new Date(iso); }

function formatTime(iso: string): string {
  return parseTime(iso).toLocaleTimeString("en-MT", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getStatusBadge(text: string, cls: string) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls)}>{text}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function TalexioContent() {
  const [rosterSearch, setRosterSearch] = useState("");

  const { data: empData, isLoading: empLoading } = useTalexioEmployees();
  const { data: tlData, isLoading: tlLoading } = useTalexioTimeLogs();
  const { data: leaveData, isLoading: leaveLoading } = useTalexioLeave();
  const { data: payData, isLoading: payLoading } = useTalexioPayslips();

  const anyLoading = empLoading || tlLoading || leaveLoading || payLoading;

  // ── Headcount breakdown ──────────────────────────────────────
  const headcount = useMemo(() => {
    if (!empData?.employees) return null;
    const all = empData.employees;
    const active = all.filter((e) => !e.isTerminated);
    const terminated = all.filter((e) => e.isTerminated);

    const byPosition: Record<string, number> = {};
    const byLocation: Record<string, number> = {};
    for (const e of active) {
      const pos = e.currentPositionSimple?.position?.name || "Unknown";
      const loc = e.currentPositionSimple?.organisationUnit?.name || "Unknown";
      byPosition[pos] = (byPosition[pos] || 0) + 1;
      byLocation[loc] = (byLocation[loc] || 0) + 1;
    }

    return {
      active: active.length,
      terminated: terminated.length,
      total: all.length,
      byPosition: Object.entries(byPosition).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
      byLocation: Object.entries(byLocation).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    };
  }, [empData]);

  // ── Full employee roster ─────────────────────────────────────
  const roster = useMemo(() => {
    if (!empData?.employees) return [];
    return empData.employees
      .filter((e) => !e.isTerminated)
      .map((e) => ({
        name: e.fullName,
        code: e.employeeCode || "—",
        email: e.emailAddress || "—",
        position: e.currentPositionSimple?.position?.name || "—",
        location: e.currentPositionSimple?.organisationUnit?.name || "—",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [empData]);

  const filteredRoster = rosterSearch
    ? roster.filter((r) =>
        r.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        r.position.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        r.location.toLowerCase().includes(rosterSearch.toLowerCase())
      )
    : roster;

  // ── Today's attendance detail ────────────────────────────────
  const attendance = useMemo(() => {
    if (!tlData?.employees) return null;
    const today = new Date().toISOString().split("T")[0];
    const active = tlData.employees.filter((e) => !e.isTerminated);

    const logs: { name: string; clockIn: string; clockOut: string | null; hoursWorked: string; status: string }[] = [];
    const clockedInIds = new Set<string>();

    for (const emp of active) {
      for (const log of emp.timeLogs || []) {
        if (log.from?.startsWith(today)) {
          const start = parseTime(log.from);
          const end = log.to ? parseTime(log.to) : new Date();
          const hrs = (end.getTime() - start.getTime()) / 3600000;
          clockedInIds.add(emp.id);
          logs.push({
            name: emp.fullName,
            clockIn: formatTime(log.from),
            clockOut: log.to ? formatTime(log.to) : "—",
            hoursWorked: hrs.toFixed(1) + "h",
            status: log.to ? "Completed" : "Active",
          });
        }
      }
    }

    logs.sort((a, b) => a.clockIn.localeCompare(b.clockIn));
    const notClockedIn = active.filter((e) => !clockedInIds.has(e.id)).map((e) => e.fullName).sort();

    return { logs, clockedIn: clockedInIds.size, notClockedIn, totalActive: active.length };
  }, [tlData]);

  // ── Leave balances per employee ──────────────────────────────
  const leaveBalances = useMemo(() => {
    if (!leaveData?.employees) return [];
    const year = new Date().getFullYear();
    const active = leaveData.employees.filter((e) => !e.isTerminated);

    return active.map((emp) => {
      const yearEntitlements = (emp.leaveEntitlements || []).filter((le) => le.year === year);
      const vacation = yearEntitlements.find((le) => le.leaveType.name.toLowerCase().includes("vacation") || le.leaveType.name.toLowerCase().includes("annual"));
      const sick = yearEntitlements.find((le) => le.leaveType.name.toLowerCase().includes("sick"));

      return {
        name: emp.fullName,
        vacationHrs: vacation?.entitlement || 0,
        sickHrs: sick?.entitlement || 0,
        totalTypes: yearEntitlements.length,
        totalHrs: yearEntitlements.reduce((s, le) => s + le.entitlement, 0),
      };
    }).sort((a, b) => b.sickHrs - a.sickHrs);
  }, [leaveData]);

  // ── Payroll per employee (latest month) ──────────────────────
  const payroll = useMemo(() => {
    if (!payData?.employees) return { month: "", employees: [], totalGross: 0, totalNet: 0, totalTax: 0, trend: [] };

    let latestMonth = "";
    const monthlyTotals: Record<string, { gross: number; net: number; tax: number; count: number }> = {};

    for (const emp of payData.employees) {
      for (const slip of emp.payslips || []) {
        const m = slip.periodFrom.slice(0, 7);
        if (m > latestMonth) latestMonth = m;
        if (!monthlyTotals[m]) monthlyTotals[m] = { gross: 0, net: 0, tax: 0, count: 0 };
        monthlyTotals[m].gross += slip.gross || 0;
        monthlyTotals[m].net += slip.net || 0;
        monthlyTotals[m].tax += slip.tax || 0;
        monthlyTotals[m].count++;
      }
    }

    const employees = payData.employees
      .map((emp) => {
        const slip = (emp.payslips || []).find((s) => s.periodFrom.slice(0, 7) === latestMonth);
        if (!slip) return null;
        return {
          name: emp.fullName,
          position: emp.currentPositionSimple?.position?.name || "—",
          location: emp.currentPositionSimple?.organisationUnit?.name || "—",
          gross: slip.gross || 0,
          net: slip.net || 0,
          tax: slip.tax || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.gross - a!.gross) as { name: string; position: string; location: string; gross: number; net: number; tax: number }[];

    const latest = monthlyTotals[latestMonth] || { gross: 0, net: 0, tax: 0, count: 0 };

    // Trend: last 6 months
    const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
    const trend = sortedMonths.map((m) => ({
      month: new Date(m + "-01").toLocaleDateString("en-MT", { month: "short", year: "2-digit" }),
      gross: Math.round(monthlyTotals[m].gross),
      net: Math.round(monthlyTotals[m].net),
      tax: Math.round(monthlyTotals[m].tax),
      headcount: monthlyTotals[m].count,
    }));

    return { month: latestMonth, employees, totalGross: latest.gross, totalNet: latest.net, totalTax: latest.tax, trend };
  }, [payData]);

  // ── KPIs ─────────────────────────────────────────────────────
  const kpis: KPIData[] = [
    { label: "Active Employees", value: empLoading ? "..." : String(headcount?.active || 0) },
    { label: "Terminated", value: empLoading ? "..." : String(headcount?.terminated || 0) },
    { label: "Clocked In Today", value: tlLoading ? "..." : String(attendance?.clockedIn || 0) },
    { label: "Not Clocked In", value: tlLoading ? "..." : String(attendance?.notClockedIn.length || 0) },
    { label: "Monthly Gross Payroll", value: payLoading ? "..." : formatCurrency(payroll.totalGross) },
    { label: "Avg Cost/Employee", value: payLoading ? "..." : formatCurrency(payroll.employees.length > 0 ? Math.round(payroll.totalGross / payroll.employees.length) : 0) },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Talexio Deep Dive</h1>
          <p className="text-sm text-muted-foreground">
            Full employee roster, attendance, leave balances & payroll detail
          </p>
        </div>
        {!anyLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live from Talexio
          </span>
        )}
      </div>

      <KPICardRow kpis={kpis} />

      {/* ── Headcount Breakdown ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Headcount by Position</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={headcount?.byPosition.slice(0, 15) || []} layout="vertical" margin={{ ...chartDefaults.margin, left: 130 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={125} />
                <Tooltip />
                <Bar dataKey="count" name="Employees" fill={chartColors.spa} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Headcount by Location</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={headcount?.byLocation || []}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={110}
                  paddingAngle={3}
                  dataKey="count" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(headcount?.byLocation || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Full Employee Roster ────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Employee Roster
            {!empLoading && <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredRoster.length} employees)</span>}
          </h2>
          <input
            type="text"
            placeholder="Search name, position, location..."
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            className="border border-warm-border rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        {empLoading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">Loading...</div>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Name", sortable: true },
              { key: "code", label: "Code" },
              { key: "position", label: "Position", sortable: true },
              { key: "location", label: "Location", sortable: true },
              { key: "email", label: "Email" },
            ]}
            data={filteredRoster}
            pageSize={15}
          />
        )}
      </Card>

      {/* ── Today's Attendance ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Today&apos;s Clock-Ins
            {attendance && <span className="ml-2 text-sm font-normal text-muted-foreground">({attendance.clockedIn} of {attendance.totalActive})</span>}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">Loading...</div>
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Employee" },
                { key: "clockIn", label: "Clock In", align: "right" as const },
                { key: "clockOut", label: "Clock Out", align: "right" as const },
                { key: "hoursWorked", label: "Hours", align: "right" as const },
                {
                  key: "status", label: "Status", align: "right" as const,
                  render: (v: unknown) => {
                    const s = v as string;
                    return s === "Active"
                      ? getStatusBadge("Active", "bg-green-100 text-green-800")
                      : getStatusBadge("Done", "bg-gray-100 text-gray-600");
                  },
                },
              ]}
              data={attendance?.logs || []}
              pageSize={10}
            />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Not Clocked In Today
            {attendance && <span className="ml-2 text-sm font-normal text-amber-600">({attendance.notClockedIn.length})</span>}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">Loading...</div>
          ) : attendance?.notClockedIn.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-green-600 font-medium">Everyone clocked in</div>
          ) : (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {attendance?.notClockedIn.map((name) => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {name}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Leave Balances ─────────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Leave Balances — {new Date().getFullYear()}
        </h2>
        {leaveLoading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">Loading...</div>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Employee", sortable: true },
              { key: "vacationHrs", label: "Vacation (hrs)", align: "right" as const, sortable: true },
              {
                key: "sickHrs", label: "Sick (hrs)", align: "right" as const, sortable: true,
                render: (v: unknown) => {
                  const hrs = Number(v);
                  if (hrs > 80) return getStatusBadge(`${hrs}h`, "bg-red-100 text-red-800");
                  if (hrs > 40) return getStatusBadge(`${hrs}h`, "bg-amber-100 text-amber-800");
                  return `${hrs}h`;
                },
              },
              { key: "totalTypes", label: "Leave Types", align: "right" as const },
              { key: "totalHrs", label: "Total (hrs)", align: "right" as const, sortable: true },
            ]}
            data={leaveBalances}
            pageSize={15}
          />
        )}
      </Card>

      {/* ── Payroll Deep Dive ──────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Payroll Trend (6 Months)</h2>
        <p className="text-xs text-muted-foreground mb-4">Gross, net and tax deductions</p>
        {payLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={payroll.trend} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `\u20AC${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="gross" name="Gross" fill={chartColors.spa} radius={[2, 2, 0, 0]} />
              <Bar dataKey="net" name="Net" fill={chartColors.aesthetics} radius={[2, 2, 0, 0]} />
              <Bar dataKey="tax" name="Tax" fill={chartColors.slimming} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Full Payroll Breakdown
          {payroll.month && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({new Date(payroll.month + "-01").toLocaleDateString("en-MT", { month: "long", year: "numeric" })})
            </span>
          )}
        </h2>
        {payLoading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">Loading...</div>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Employee", sortable: true },
              { key: "position", label: "Position" },
              { key: "location", label: "Location", sortable: true },
              { key: "gross", label: "Gross", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(Number(v)) },
              { key: "net", label: "Net", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(Number(v)) },
              { key: "tax", label: "Tax", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(Number(v)) },
            ]}
            data={payroll.employees}
            pageSize={15}
          />
        )}
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function TalexioPage() {
  return (
    <DashboardShell>
      {() => <TalexioContent />}
    </DashboardShell>
  );
}
