"use client";

import { useMemo } from "react";
import { CIChat } from "@/components/ci/CIChat";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { chartColors, chartDefaults, formatCurrency } from "@/lib/charts/config";
import { useKPIData } from "@/lib/hooks/useKPIData";
import {
  useTalexioEmployees,
  useTalexioTimeLogs,
  useTalexioLeave,
  TalexioEmployee,
  TalexioEmployeeWithTimeLogs,
  TalexioEmployeeWithLeave,
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
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ============================================================
// CONSTANTS
// ============================================================

const locationNames: Record<number, string> = {
  1: "InterContinental",
  2: "Hugo's",
  3: "Hyatt",
  4: "Ramla Bay",
  5: "Labranda",
  6: "Odycy",
  7: "Novotel",
  8: "Excelsior",
};

const REVPAH_TARGET = 35;

// ============================================================
// TYPES
// ============================================================

interface TherapistUtilizationRow {
  week_start: string;
  staff_id: number;
  location_id: number;
  available_hours: number;
  booked_hours: number;
  utilization_pct: number;
  bookings_count: number;
}

interface SalesWeeklyRow {
  week_start: string;
  location_id: number;
  brand_id: number;
  revenue_ex_vat: number;
}

// ============================================================
// HELPERS
// ============================================================

function getRevPAHColor(value: number): string {
  if (value >= REVPAH_TARGET) return chartColors.slimming;
  if (value >= REVPAH_TARGET * 0.9) return chartColors.aesthetics;
  return chartColors.target;
}

function parseTime(isoString: string): Date {
  return new Date(isoString);
}

function formatTime(isoString: string): string {
  return parseTime(isoString).toLocaleTimeString("en-MT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStatusBadge(status: string, className: string) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}

// ============================================================
// TALEXIO DATA PROCESSORS
// ============================================================

function processHeadcount(employees: TalexioEmployee[]) {
  const active = employees.filter((e) => !e.isTerminated);
  const byPosition: Record<string, number> = {};
  const byOrgUnit: Record<string, number> = {};

  for (const e of active) {
    const pos = e.currentPositionSimple?.position?.name || "Unknown";
    const org = e.currentPositionSimple?.organisationUnit?.name || "Unknown";
    byPosition[pos] = (byPosition[pos] || 0) + 1;
    byOrgUnit[org] = (byOrgUnit[org] || 0) + 1;
  }

  return {
    totalActive: active.length,
    totalAll: employees.length,
    terminated: employees.length - active.length,
    byPosition: Object.entries(byPosition)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    byOrgUnit: Object.entries(byOrgUnit)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
  };
}

function processAttendance(employees: TalexioEmployeeWithTimeLogs[]) {
  const today = new Date().toISOString().split("T")[0];
  const activeWithLogs = employees.filter((e) => !e.isTerminated);

  const todayLogs: {
    name: string;
    clockIn: string;
    clockOut: string | null;
    clockInRaw: Date;
    lat: number | null;
    lng: number | null;
  }[] = [];

  for (const emp of activeWithLogs) {
    for (const log of emp.timeLogs || []) {
      if (log.from && log.from.startsWith(today)) {
        todayLogs.push({
          name: emp.fullName,
          clockIn: formatTime(log.from),
          clockOut: log.to ? formatTime(log.to) : null,
          clockInRaw: parseTime(log.from),
          lat: log.locationLatIn,
          lng: log.locationLongIn,
        });
      }
    }
  }

  todayLogs.sort((a, b) => a.clockInRaw.getTime() - b.clockInRaw.getTime());

  // Lateness analysis: consider "on time" if clocked in before 07:15 for early shifts, 09:15 for late shifts
  const EARLY_CUTOFF = 7 * 60 + 15; // 07:15 in minutes
  const LATE_CUTOFF = 9 * 60 + 15; // 09:15 in minutes

  let onTime = 0;
  let late = 0;
  const lateEmployees: { name: string; clockIn: string; minutesLate: number }[] = [];

  for (const log of todayLogs) {
    const h = log.clockInRaw.getUTCHours();
    const m = log.clockInRaw.getUTCMinutes();
    const mins = h * 60 + m;

    // Determine which shift they're on based on clock-in time
    const cutoff = mins < 8 * 60 ? EARLY_CUTOFF : LATE_CUTOFF;

    if (mins <= cutoff) {
      onTime++;
    } else {
      late++;
      lateEmployees.push({
        name: log.name,
        clockIn: log.clockIn,
        minutesLate: mins - cutoff,
      });
    }
  }

  const onTimePct = todayLogs.length > 0 ? Math.round((onTime / todayLogs.length) * 100) : 0;

  return {
    todayLogs,
    clockedInCount: todayLogs.length,
    onTime,
    late,
    onTimePct,
    lateEmployees: lateEmployees.sort((a, b) => b.minutesLate - a.minutesLate),
  };
}

function processLeave(employees: TalexioEmployeeWithLeave[], currentYear: number) {
  const active = employees.filter((e) => !e.isTerminated);
  const leaveByType: Record<string, { name: string; totalEntitlement: number; employeeCount: number }> = {};
  const sickLeaveByEmployee: { name: string; entitlement: number; year: number }[] = [];

  for (const emp of active) {
    for (const le of emp.leaveEntitlements || []) {
      if (le.year !== currentYear) continue;

      const typeName = le.leaveType?.name || "Unknown";

      if (!leaveByType[typeName]) {
        leaveByType[typeName] = { name: typeName, totalEntitlement: 0, employeeCount: 0 };
      }
      leaveByType[typeName].totalEntitlement += le.entitlement;
      leaveByType[typeName].employeeCount++;

      if (typeName.toLowerCase().includes("sick")) {
        sickLeaveByEmployee.push({
          name: emp.fullName,
          entitlement: le.entitlement,
          year: le.year,
        });
      }
    }
  }

  // Sort sick leave by hours (highest first) to flag frequent users
  sickLeaveByEmployee.sort((a, b) => b.entitlement - a.entitlement);

  return {
    leaveByType: Object.values(leaveByType).sort((a, b) => b.totalEntitlement - a.totalEntitlement),
    sickLeaveByEmployee,
    topSickLeaveUsers: sickLeaveByEmployee.slice(0, 10),
  };
}

// ============================================================
// TABLE COLUMNS
// ============================================================

const attendanceColumns = [
  { key: "name", label: "Employee" },
  { key: "clockIn", label: "Clock In", align: "right" as const },
  {
    key: "clockOut",
    label: "Clock Out",
    align: "right" as const,
    render: (v: unknown) => (v ? String(v) : getStatusBadge("Active", "bg-green-100 text-green-800")),
  },
];

const latenessColumns = [
  { key: "name", label: "Employee" },
  { key: "clockIn", label: "Clock In", align: "right" as const },
  {
    key: "minutesLate",
    label: "Minutes Late",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => {
      const mins = Number(v);
      if (mins > 30) return getStatusBadge(`${mins}m`, "bg-red-100 text-red-800");
      if (mins > 15) return getStatusBadge(`${mins}m`, "bg-amber-100 text-amber-800");
      return getStatusBadge(`${mins}m`, "bg-yellow-100 text-yellow-800");
    },
  },
];

const sickLeaveColumns = [
  { key: "name", label: "Employee" },
  {
    key: "entitlement",
    label: "Sick Leave Hours",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => {
      const hrs = Number(v);
      if (hrs > 100) return getStatusBadge(`${hrs}h`, "bg-red-100 text-red-800");
      if (hrs > 50) return getStatusBadge(`${hrs}h`, "bg-amber-100 text-amber-800");
      return `${hrs}h`;
    },
  },
];

// ============================================================
// MAIN CONTENT
// ============================================================

function HRContent({
  dateFrom,
  dateTo,
  brandFilter,
}: {
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
}) {
  // Supabase data (existing)
  const { data: utilizationData, loading: utilizationLoading } =
    useKPIData<TherapistUtilizationRow>({
      table: "therapist_utilization",
      dateFrom,
      dateTo,
      brandFilter,
      dateColumn: "week_start",
    });

  const { data: salesData, loading: salesLoading } =
    useKPIData<SalesWeeklyRow>({
      table: "sales_weekly",
      dateFrom,
      dateTo,
      brandFilter,
      dateColumn: "week_start",
    });

  // Talexio live data
  const { data: employeesData, isLoading: empLoading } = useTalexioEmployees();
  const { data: timeLogsData, isLoading: tlLoading } = useTalexioTimeLogs();
  const { data: leaveData, isLoading: leaveLoading } = useTalexioLeave();

  // Process Talexio data
  const headcount = useMemo(() => {
    if (!employeesData?.employees) return null;
    return processHeadcount(employeesData.employees);
  }, [employeesData]);

  const attendance = useMemo(() => {
    if (!timeLogsData?.employees) return null;
    return processAttendance(timeLogsData.employees);
  }, [timeLogsData]);

  const leave = useMemo(() => {
    if (!leaveData?.employees) return null;
    return processLeave(leaveData.employees, new Date().getFullYear());
  }, [leaveData]);

  // RevPAH calculation (existing)
  const revpahByLocation = useMemo(() => {
    const hoursByLocation: Record<number, number> = {};
    for (const row of utilizationData) {
      hoursByLocation[row.location_id] =
        (hoursByLocation[row.location_id] || 0) + row.available_hours;
    }
    const revenueByLocation: Record<number, number> = {};
    for (const row of salesData) {
      revenueByLocation[row.location_id] =
        (revenueByLocation[row.location_id] || 0) + row.revenue_ex_vat;
    }
    const locationIds = new Set([
      ...Object.keys(hoursByLocation).map(Number),
      ...Object.keys(revenueByLocation).map(Number),
    ]);
    return Array.from(locationIds)
      .filter((id) => hoursByLocation[id] > 0)
      .map((id) => ({
        location: locationNames[id] || `Location ${id}`,
        revpah:
          Math.round(((revenueByLocation[id] || 0) / hoursByLocation[id]) * 100) / 100,
      }))
      .sort((a, b) => b.revpah - a.revpah);
  }, [utilizationData, salesData]);

  const avgRevPAH = useMemo(() => {
    if (revpahByLocation.length === 0) return 0;
    const sum = revpahByLocation.reduce((acc, r) => acc + r.revpah, 0);
    return Math.round((sum / revpahByLocation.length) * 100) / 100;
  }, [revpahByLocation]);

  const revpahLoading = utilizationLoading || salesLoading;
  const talexioLoading = empLoading || tlLoading || leaveLoading;

  // Build KPI cards
  const kpis: KPIData[] = [
    {
      label: "Active Headcount",
      value: empLoading ? "..." : String(headcount?.totalActive || 0),
    },
    {
      label: "Clocked In Today",
      value: tlLoading ? "..." : String(attendance?.clockedInCount || 0),
    },
    {
      label: "On-Time %",
      value: tlLoading ? "..." : `${attendance?.onTimePct || 0}%`,
      target: "90%",
      targetValue: 90,
      currentValue: attendance?.onTimePct || 0,
    },
    {
      label: "Late Today",
      value: tlLoading ? "..." : String(attendance?.late || 0),
    },
    {
      label: "Leave Types",
      value: leaveLoading ? "..." : String(leave?.leaveByType.length || 0),
    },
    {
      label: "Avg RevPAH",
      value: revpahLoading ? "..." : formatCurrency(avgRevPAH),
      target: formatCurrency(REVPAH_TARGET) + "/hr",
      targetValue: REVPAH_TARGET,
      currentValue: avgRevPAH,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        {!talexioLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live from Talexio
          </span>
        )}
      </div>

      <KPICardRow kpis={kpis} />

      {/* Section 1: Attendance Today + Lateness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Today
            {attendance && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({attendance.clockedInCount} clocked in)
              </span>
            )}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : (
            <DataTable
              columns={attendanceColumns}
              data={(attendance?.todayLogs || []) as unknown as Record<string, unknown>[]}
              pageSize={8}
            />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Late Arrivals
            {attendance && attendance.late > 0 && (
              <span className="ml-2 text-sm font-normal text-red-500">
                ({attendance.late} late)
              </span>
            )}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : attendance?.lateEmployees.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-green-600 font-medium">
              Everyone is on time today
            </div>
          ) : (
            <DataTable
              columns={latenessColumns}
              data={(attendance?.lateEmployees || []) as unknown as Record<string, unknown>[]}
              pageSize={8}
            />
          )}
        </Card>
      </div>

      {/* Section 2: Headcount by Position + Org Unit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Headcount by Position</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={headcount?.byPosition.slice(0, 12) || []}
                layout="vertical"
                margin={{ ...chartDefaults.margin, left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={115}
                />
                <Tooltip />
                <Bar dataKey="count" name="Employees" fill={chartColors.spa} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Headcount by Location</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={headcount?.byOrgUnit || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(headcount?.byOrgUnit || []).map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        [
                          chartColors.spa,
                          chartColors.aesthetics,
                          chartColors.slimming,
                          "#8B5CF6",
                          "#EC4899",
                          "#06B6D4",
                          "#F59E0B",
                          "#10B981",
                        ][i % 8]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Section 3: Sick Leave Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Entitlements by Type ({new Date().getFullYear()})
          </h2>
          {leaveLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={leave?.leaveByType || []}
                layout="vertical"
                margin={{ ...chartDefaults.margin, left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={95}
                />
                <Tooltip formatter={(v) => `${v} hrs`} />
                <Bar dataKey="totalEntitlement" name="Total Hours" fill={chartColors.aesthetics} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sick Leave — Top Users
          </h2>
          {leaveLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Loading...
            </div>
          ) : leave?.topSickLeaveUsers.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              No sick leave data for {new Date().getFullYear()}
            </div>
          ) : (
            <DataTable
              columns={sickLeaveColumns}
              data={
                (leave?.topSickLeaveUsers || []) as unknown as Record<string, unknown>[]
              }
              pageSize={10}
            />
          )}
        </Card>
      </div>

      {/* Section 4: RevPAH by Location (existing) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RevPAH by Location</h2>
        {revpahLoading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Loading...
          </div>
        ) : revpahByLocation.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revpahByLocation} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="location"
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(v: number) => `€${v}`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <ReferenceLine
                y={REVPAH_TARGET}
                stroke={chartColors.target}
                strokeDasharray="3 3"
                label={{
                  value: `Target ${formatCurrency(REVPAH_TARGET)}/hr`,
                  position: "right",
                  fill: chartColors.target,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="revpah" name="RevPAH">
                {revpahByLocation.map((entry) => (
                  <Cell key={entry.location} fill={getRevPAHColor(entry.revpah)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <CIChat />
    </>
  );
}

// ============================================================
// PAGE EXPORT
// ============================================================

export default function HRPage() {
  return (
    <DashboardShell>
      {({ dateFrom, dateTo, brandFilter }) => (
        <HRContent dateFrom={dateFrom} dateTo={dateTo} brandFilter={brandFilter} />
      )}
    </DashboardShell>
  );
}
