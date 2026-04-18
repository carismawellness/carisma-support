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
  useTalexioPayslips,
  TalexioEmployee,
  TalexioEmployeeWithTimeLogs,
  TalexioEmployeeWithLeave,
  TalexioEmployeeWithPayslips,
} from "@/lib/hooks/useTalexio";
import {
  BarChart,
  Bar,
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
  LabelList,
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
const HC_PCT_TARGET = 35; // Human capital % target

const PIE_COLORS = [
  chartColors.spa, chartColors.aesthetics, chartColors.slimming,
  "#8B5CF6", "#EC4899", "#06B6D4", "#F59E0B", "#10B981", "#6366F1", "#EF4444",
];

// Productivity colors
const PROD_COLORS = {
  productive: "#22C55E",
  neutral: "#9CA3AF",
  unproductive: "#EF4444",
  idle: "#F59E0B",
};

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

function getHCPctColor(value: number): string {
  if (value <= HC_PCT_TARGET) return chartColors.slimming;
  if (value <= HC_PCT_TARGET * 1.1) return chartColors.aesthetics;
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
// MOCK PRODUCTIVITY DATA (WE360)
// ============================================================

const MOCK_STAFF_PRODUCTIVITY = [
  { name: "Sarah M.", productive: 5.8, neutral: 0.6, unproductive: 0.2, idle: 0.8, emailHrs: 1.4, productivePct: 89 },
  { name: "Abid K.", productive: 5.5, neutral: 0.7, unproductive: 0.3, idle: 0.9, emailHrs: 1.6, productivePct: 84 },
  { name: "Elena P.", productive: 5.4, neutral: 0.8, unproductive: 0.3, idle: 0.9, emailHrs: 1.3, productivePct: 82 },
  { name: "Juli R.", productive: 5.2, neutral: 0.8, unproductive: 0.4, idle: 1.0, emailHrs: 1.1, productivePct: 81 },
  { name: "Rana H.", productive: 5.1, neutral: 0.9, unproductive: 0.4, idle: 1.0, emailHrs: 1.8, productivePct: 78 },
  { name: "Maria C.", productive: 4.9, neutral: 0.9, unproductive: 0.5, idle: 1.1, emailHrs: 2.1, productivePct: 76 },
  { name: "Lisa F.", productive: 4.8, neutral: 1.0, unproductive: 0.5, idle: 1.1, emailHrs: 2.0, productivePct: 75 },
  { name: "Nicci D.", productive: 4.6, neutral: 0.9, unproductive: 0.5, idle: 1.2, emailHrs: 0.9, productivePct: 72 },
  { name: "Jake T.", productive: 4.5, neutral: 1.0, unproductive: 0.6, idle: 1.3, emailHrs: 1.9, productivePct: 71 },
  { name: "Mark S.", productive: 4.3, neutral: 1.0, unproductive: 0.6, idle: 1.4, emailHrs: 2.4, productivePct: 68 },
  { name: "Adeel M.", productive: 3.8, neutral: 0.8, unproductive: 0.7, idle: 1.5, emailHrs: 0.7, productivePct: 58 },
  { name: "Tom B.", productive: 3.5, neutral: 0.7, unproductive: 0.8, idle: 1.6, emailHrs: 0.5, productivePct: 55 },
];

// ============================================================
// TALEXIO DATA PROCESSORS
// ============================================================

function processHeadcount(employees: TalexioEmployee[]) {
  const active = employees.filter((e) => !e.isTerminated);
  const terminated = employees.filter((e) => e.isTerminated);
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
    terminated: terminated.length,
    // Turnover rate: terminated / (active + terminated) * 100
    turnoverRate: employees.length > 0 ? (terminated.length / employees.length) * 100 : 0,
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
    hoursWorked: string;
    status: string;
  }[] = [];

  const clockedInIds = new Set<string>();

  for (const emp of activeWithLogs) {
    for (const log of emp.timeLogs || []) {
      if (log.from && log.from.startsWith(today)) {
        const start = parseTime(log.from);
        const end = log.to ? parseTime(log.to) : new Date();
        const hrs = (end.getTime() - start.getTime()) / 3600000;
        clockedInIds.add(emp.id);
        todayLogs.push({
          name: emp.fullName,
          clockIn: formatTime(log.from),
          clockOut: log.to ? formatTime(log.to) : null,
          clockInRaw: start,
          hoursWorked: hrs.toFixed(1) + "h",
          status: log.to ? "Completed" : "Active",
        });
      }
    }
  }

  todayLogs.sort((a, b) => a.clockInRaw.getTime() - b.clockInRaw.getTime());

  const notClockedIn = activeWithLogs
    .filter((e) => !clockedInIds.has(e.id))
    .map((e) => e.fullName)
    .sort();

  // Lateness analysis
  const EARLY_CUTOFF = 7 * 60 + 15;
  const LATE_CUTOFF = 9 * 60 + 15;

  let onTime = 0;
  let late = 0;
  const lateEmployees: { name: string; clockIn: string; minutesLate: number }[] = [];

  for (const log of todayLogs) {
    const h = log.clockInRaw.getUTCHours();
    const m = log.clockInRaw.getUTCMinutes();
    const mins = h * 60 + m;
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
    totalActive: activeWithLogs.length,
    notClockedIn,
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
  let totalSickHours = 0;
  let totalAllLeaveHours = 0;

  for (const emp of active) {
    for (const le of emp.leaveEntitlements || []) {
      if (le.year !== currentYear) continue;

      const typeName = le.leaveType?.name || "Unknown";
      totalAllLeaveHours += le.entitlement;

      if (!leaveByType[typeName]) {
        leaveByType[typeName] = { name: typeName, totalEntitlement: 0, employeeCount: 0 };
      }
      leaveByType[typeName].totalEntitlement += le.entitlement;
      leaveByType[typeName].employeeCount++;

      if (typeName.toLowerCase().includes("sick")) {
        totalSickHours += le.entitlement;
        sickLeaveByEmployee.push({
          name: emp.fullName,
          entitlement: le.entitlement,
          year: le.year,
        });
      }
    }
  }

  sickLeaveByEmployee.sort((a, b) => b.entitlement - a.entitlement);

  // Leave balances per employee
  const leaveBalances = active.map((emp) => {
    const yearEntitlements = (emp.leaveEntitlements || []).filter((le) => le.year === currentYear);
    const vacation = yearEntitlements.find((le) =>
      le.leaveType.name.toLowerCase().includes("vacation") ||
      le.leaveType.name.toLowerCase().includes("annual")
    );
    const sick = yearEntitlements.find((le) => le.leaveType.name.toLowerCase().includes("sick"));

    return {
      name: emp.fullName,
      vacationHrs: vacation?.entitlement || 0,
      sickHrs: sick?.entitlement || 0,
      totalTypes: yearEntitlements.length,
      totalHrs: yearEntitlements.reduce((s, le) => s + le.entitlement, 0),
    };
  }).sort((a, b) => b.sickHrs - a.sickHrs);

  return {
    leaveByType: Object.values(leaveByType).sort((a, b) => b.totalEntitlement - a.totalEntitlement),
    sickLeaveByEmployee,
    topSickLeaveUsers: sickLeaveByEmployee.slice(0, 10),
    sickLeavePct: totalAllLeaveHours > 0 ? (totalSickHours / totalAllLeaveHours) * 100 : 0,
    leaveBalances,
  };
}

function processPayroll(employees: TalexioEmployeeWithPayslips[]) {
  const now = new Date();
  let latestMonth = "";
  const monthlyTotals: Record<string, { gross: number; net: number; tax: number; headcount: number }> = {};
  const byLocation: Record<string, { gross: number; net: number; headcount: number; revenue: number }> = {};

  for (const emp of employees) {
    if (!emp.payslips) continue;
    for (const slip of emp.payslips) {
      const month = slip.periodFrom.slice(0, 7);
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { gross: 0, net: 0, tax: 0, headcount: 0 };
      }
      monthlyTotals[month].gross += slip.gross || 0;
      monthlyTotals[month].net += slip.net || 0;
      monthlyTotals[month].tax += slip.tax || 0;
      monthlyTotals[month].headcount++;
      if (month > latestMonth) latestMonth = month;
    }
  }

  // Build by-location for the latest month
  for (const emp of employees) {
    if (!emp.payslips) continue;
    for (const slip of emp.payslips) {
      if (slip.periodFrom.slice(0, 7) !== latestMonth) continue;

      const loc = emp.currentPositionSimple?.organisationUnit?.name || "Unknown";
      if (!byLocation[loc]) byLocation[loc] = { gross: 0, net: 0, headcount: 0, revenue: 0 };
      byLocation[loc].gross += slip.gross || 0;
      byLocation[loc].net += slip.net || 0;
      byLocation[loc].headcount++;
    }
  }

  const latestData = monthlyTotals[latestMonth] || { gross: 0, net: 0, tax: 0, headcount: 0 };

  const locationData = Object.entries(byLocation)
    .sort((a, b) => b[1].gross - a[1].gross)
    .map(([name, data]) => ({
      name,
      gross: Math.round(data.gross),
      headcount: data.headcount,
      avgCost: Math.round(data.gross / data.headcount),
    }));

  return {
    latestMonth,
    latestGross: latestData.gross,
    latestNet: latestData.net,
    latestTax: latestData.tax,
    latestHeadcount: latestData.headcount,
    avgCostPerEmployee: latestData.headcount > 0 ? Math.round(latestData.gross / latestData.headcount) : 0,
    locationData,
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
  { key: "hoursWorked", label: "Hours", align: "right" as const },
  {
    key: "status",
    label: "Status",
    align: "right" as const,
    render: (v: unknown) => {
      const s = v as string;
      return s === "Active"
        ? getStatusBadge("Active", "bg-green-100 text-green-800")
        : getStatusBadge("Done", "bg-gray-100 text-gray-600");
    },
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

const leaveBalanceColumns = [
  { key: "name", label: "Employee", sortable: true },
  { key: "vacationHrs", label: "Vacation (hrs)", align: "right" as const, sortable: true },
  {
    key: "sickHrs",
    label: "Sick (hrs)",
    align: "right" as const,
    sortable: true,
    render: (v: unknown) => {
      const hrs = Number(v);
      if (hrs > 80) return getStatusBadge(`${hrs}h`, "bg-red-100 text-red-800");
      if (hrs > 40) return getStatusBadge(`${hrs}h`, "bg-amber-100 text-amber-800");
      return `${hrs}h`;
    },
  },
  { key: "totalTypes", label: "Leave Types", align: "right" as const },
  { key: "totalHrs", label: "Total (hrs)", align: "right" as const, sortable: true },
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
  // Supabase data
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
  const { data: payslipsData, isLoading: payLoading } = useTalexioPayslips();

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

  const payroll = useMemo(() => {
    if (!payslipsData?.employees) return null;
    return processPayroll(payslipsData.employees);
  }, [payslipsData]);

  // RevPAH + Revenue by location
  const { revpahByLocation, revenueByLocationMap, totalRevenue } = useMemo(() => {
    const hoursByLocation: Record<number, number> = {};
    for (const row of utilizationData) {
      hoursByLocation[row.location_id] =
        (hoursByLocation[row.location_id] || 0) + row.available_hours;
    }
    const revByLoc: Record<number, number> = {};
    let totalRev = 0;
    for (const row of salesData) {
      revByLoc[row.location_id] = (revByLoc[row.location_id] || 0) + row.revenue_ex_vat;
      totalRev += row.revenue_ex_vat;
    }
    const locationIds = new Set([
      ...Object.keys(hoursByLocation).map(Number),
      ...Object.keys(revByLoc).map(Number),
    ]);
    const revpah = Array.from(locationIds)
      .filter((id) => hoursByLocation[id] > 0)
      .map((id) => ({
        location: locationNames[id] || `Location ${id}`,
        revpah: Math.round(((revByLoc[id] || 0) / hoursByLocation[id]) * 100) / 100,
        revenue: revByLoc[id] || 0,
      }))
      .sort((a, b) => b.revpah - a.revpah);

    return { revpahByLocation: revpah, revenueByLocationMap: revByLoc, totalRevenue: totalRev };
  }, [utilizationData, salesData]);

  const avgRevPAH = useMemo(() => {
    if (revpahByLocation.length === 0) return 0;
    const sum = revpahByLocation.reduce((acc, r) => acc + r.revpah, 0);
    return Math.round((sum / revpahByLocation.length) * 100) / 100;
  }, [revpahByLocation]);

  // Human Capital % by location: payroll gross / revenue
  const humanCapitalByLocation = useMemo(() => {
    if (!payroll?.locationData) return [];

    return payroll.locationData.map((loc) => {
      // Match location name to revenue data
      // For now, estimate monthly revenue from total revenue / months proportioned by location
      const matchingRevpah = revpahByLocation.find((r) =>
        r.location.toLowerCase().includes(loc.name.toLowerCase().split(" ")[0]) ||
        loc.name.toLowerCase().includes(r.location.toLowerCase().split(" ")[0])
      );
      const monthlyRevenue = matchingRevpah ? matchingRevpah.revenue / 6 : 0; // approximate monthly
      const hcPct = monthlyRevenue > 0 ? (loc.gross / monthlyRevenue) * 100 : 0;

      return {
        name: loc.name,
        hcPct: Math.round(hcPct * 10) / 10,
        payroll: loc.gross,
        revenue: Math.round(monthlyRevenue),
        headcount: loc.headcount,
      };
    }).sort((a, b) => a.hcPct - b.hcPct);
  }, [payroll, revpahByLocation]);

  // Human Capital % by business unit (mock — mapping locations to BUs)
  const humanCapitalByBU = useMemo(() => {
    if (!payroll?.locationData) return [];
    const totalGross = payroll.locationData.reduce((s, l) => s + l.gross, 0);
    const monthlyTotalRevenue = totalRevenue / 6; // approximate monthly

    // Estimate BU splits based on typical ratios
    const buData = [
      { name: "Spa", pctOfPayroll: 0.72, pctOfRevenue: 0.65 },
      { name: "Aesthetics", pctOfPayroll: 0.18, pctOfRevenue: 0.22 },
      { name: "Slimming", pctOfPayroll: 0.10, pctOfRevenue: 0.13 },
    ];

    return buData.map((bu) => {
      const buPayroll = Math.round(totalGross * bu.pctOfPayroll);
      const buRevenue = Math.round(monthlyTotalRevenue * bu.pctOfRevenue);
      const hcPct = buRevenue > 0 ? (buPayroll / buRevenue) * 100 : 0;
      return {
        name: bu.name,
        hcPct: Math.round(hcPct * 10) / 10,
        payroll: buPayroll,
        revenue: buRevenue,
      };
    });
  }, [payroll, totalRevenue]);

  const groupHCPct = useMemo(() => {
    if (!payroll) return 0;
    const monthlyRevenue = totalRevenue / 6;
    return monthlyRevenue > 0 ? (payroll.latestGross / monthlyRevenue) * 100 : 0;
  }, [payroll, totalRevenue]);

  // Revenue per employee
  const revenuePerEmployee = useMemo(() => {
    if (!headcount || totalRevenue === 0) return 0;
    return Math.round(totalRevenue / headcount.totalActive);
  }, [headcount, totalRevenue]);

  // Avg productivity from mock data
  const avgProductivity = useMemo(() => {
    const sum = MOCK_STAFF_PRODUCTIVITY.reduce((s, p) => s + p.productivePct, 0);
    return Math.round(sum / MOCK_STAFF_PRODUCTIVITY.length);
  }, []);

  const revpahLoading = utilizationLoading || salesLoading;
  const talexioLoading = empLoading || tlLoading || leaveLoading || payLoading;

  // Build KPI cards (10 cards)
  const kpis: KPIData[] = [
    {
      label: "Human Capital %",
      value: payLoading || revpahLoading ? "..." : `${groupHCPct.toFixed(1)}%`,
      target: `${HC_PCT_TARGET}%`,
      targetValue: HC_PCT_TARGET,
      currentValue: groupHCPct,
    },
    {
      label: "Monthly Gross Payroll",
      value: payLoading ? "..." : formatCurrency(payroll?.latestGross || 0),
    },
    {
      label: "Avg Cost / Employee",
      value: payLoading ? "..." : formatCurrency(payroll?.avgCostPerEmployee || 0),
    },
    {
      label: "Active Employees",
      value: empLoading ? "..." : String(headcount?.totalActive || 0),
    },
    {
      label: "On-Time %",
      value: tlLoading ? "..." : `${attendance?.onTimePct || 0}%`,
      target: "90%",
      targetValue: 90,
      currentValue: attendance?.onTimePct || 0,
    },
    {
      label: "Sick Leave %",
      value: leaveLoading ? "..." : `${(leave?.sickLeavePct || 0).toFixed(1)}%`,
    },
    {
      label: "Avg Productivity",
      value: `${avgProductivity}%`,
      target: "80%",
      targetValue: 80,
      currentValue: avgProductivity,
    },
    {
      label: "Avg RevPAH",
      value: revpahLoading ? "..." : formatCurrency(avgRevPAH),
      target: `${formatCurrency(REVPAH_TARGET)}/hr`,
      targetValue: REVPAH_TARGET,
      currentValue: avgRevPAH,
    },
    {
      label: "Turnover Rate",
      value: empLoading ? "..." : `${(headcount?.turnoverRate || 0).toFixed(1)}%`,
    },
    {
      label: "Revenue / Employee",
      value: empLoading || revpahLoading ? "..." : formatCurrency(revenuePerEmployee),
    },
  ];

  // Productivity bar chart data (sorted by productive % desc)
  const productivityChartData = [...MOCK_STAFF_PRODUCTIVITY]
    .sort((a, b) => b.productivePct - a.productivePct)
    .map((s) => ({
      name: s.name,
      Productive: s.productive,
      Neutral: s.neutral,
      Unproductive: s.unproductive,
      Idle: s.idle,
      productivePct: s.productivePct,
      totalHrs: (s.productive + s.neutral + s.unproductive + s.idle).toFixed(1),
    }));

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">HR Dashboard</h1>
        {!talexioLoading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live from Talexio
          </span>
        )}
      </div>

      <KPICardRow kpis={kpis} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: Human Capital % — THE HEADLINE METRIC
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Human Capital % by Location</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Payroll as % of revenue — lower is more efficient
          </p>
          {payLoading || revpahLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : humanCapitalByLocation.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={humanCapitalByLocation.length * 48 + 50}>
              <BarChart
                data={humanCapitalByLocation}
                layout="vertical"
                margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v, name) => [`${v}%`, String(name)]}
                  labelFormatter={(label) => {
                    const item = humanCapitalByLocation.find((d) => d.name === label);
                    return item
                      ? `${label} — Payroll: ${formatCurrency(item.payroll)} | Revenue: ${formatCurrency(item.revenue)}`
                      : String(label);
                  }}
                />
                <ReferenceLine
                  x={HC_PCT_TARGET}
                  stroke={chartColors.target}
                  strokeDasharray="3 3"
                  label={{ value: `Target ${HC_PCT_TARGET}%`, position: "top", fill: chartColors.target, fontSize: 11 }}
                />
                <Bar dataKey="hcPct" name="HC %" barSize={28}>
                  {humanCapitalByLocation.map((entry) => (
                    <Cell key={entry.name} fill={getHCPctColor(entry.hcPct)} />
                  ))}
                  <LabelList
                    dataKey="hcPct"
                    content={(props) => {
                      const { x, width, y, height, value } = props as Record<string, unknown>;
                      return (
                        <text
                          x={Number(x) + Number(width) + 6}
                          y={Number(y) + Number(height) / 2}
                          textAnchor="start"
                          dominantBaseline="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill="#374151"
                        >
                          {String(value)}%
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Human Capital % by Business Unit</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Group HC%: {groupHCPct.toFixed(1)}% — Payroll / Revenue by brand
          </p>
          {payLoading || revpahLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={humanCapitalByBU.length * 60 + 50}>
              <BarChart
                data={humanCapitalByBU}
                layout="vertical"
                margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v, name) => [`${v}%`, String(name)]}
                  labelFormatter={(label) => {
                    const item = humanCapitalByBU.find((d) => d.name === label);
                    return item
                      ? `${label} — Payroll: ${formatCurrency(item.payroll)} | Revenue: ${formatCurrency(item.revenue)}`
                      : String(label);
                  }}
                />
                <ReferenceLine
                  x={HC_PCT_TARGET}
                  stroke={chartColors.target}
                  strokeDasharray="3 3"
                />
                <Bar dataKey="hcPct" name="HC %">
                  {humanCapitalByBU.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={[chartColors.spa, chartColors.aesthetics, chartColors.slimming][i]}
                    />
                  ))}
                  <LabelList
                    dataKey="hcPct"
                    content={(props) => {
                      const { x, width, y, height, index } = props as Record<string, unknown>;
                      const entry = humanCapitalByBU[Number(index)];
                      if (!entry) return <></>;
                      return (
                        <text
                          x={Number(x) + Number(width) + 6}
                          y={Number(y) + Number(height) / 2}
                          textAnchor="start"
                          dominantBaseline="middle"
                          fontSize={11}
                          fontWeight={600}
                          fill="#374151"
                        >
                          {entry.hcPct}% — {formatCurrency(entry.payroll)}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: RevPAH by Location
          ══════════════════════════════════════════════════════════════ */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue per Available Hour by Location</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Utilization proxy — target {formatCurrency(REVPAH_TARGET)}/hr
        </p>
        {revpahLoading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
        ) : revpahByLocation.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">No data available</div>
        ) : (
          <div className="h-[220px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revpahByLocation} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis
                dataKey="location"
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 11 }} />
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
                <LabelList
                  dataKey="revpah"
                  position="top"
                  content={(props) => {
                    const { x, width, y, value } = props as Record<string, unknown>;
                    return (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="#374151"
                      >
                        €{Number(value).toFixed(0)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: Attendance Today + Late Arrivals
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Today
            {attendance && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({attendance.clockedInCount} of {attendance.totalActive} clocked in)
              </span>
            )}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : (
            <DataTable
              columns={attendanceColumns}
              data={(attendance?.todayLogs || []) as unknown as Record<string, unknown>[]}
              pageSize={8}
            />
          )}
        </Card>

        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Late Arrivals
            {attendance && attendance.late > 0 && (
              <span className="ml-2 text-sm font-normal text-red-500">
                ({attendance.late} late)
              </span>
            )}
          </h2>
          {tlLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
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

      {/* ── Not Clocked In Today ──────────────────────────────────── */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Not Clocked In Today
          {attendance && (
            <span className="ml-2 text-sm font-normal text-amber-600">
              ({attendance.notClockedIn.length})
            </span>
          )}
        </h2>
        {tlLoading ? (
          <div className="flex items-center justify-center h-[200px] text-gray-500">Loading...</div>
        ) : attendance?.notClockedIn.length === 0 ? (
          <div className="flex items-center justify-center h-[100px] text-green-600 font-medium">
            Everyone clocked in
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {attendance?.notClockedIn.map((name) => (
              <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {name}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: Headcount Breakdown
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Headcount by Position</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(350, (headcount?.byPosition.length || 0) * 30)}>
              <BarChart
                data={headcount?.byPosition.slice(0, 15) || []}
                layout="vertical"
                margin={{ ...chartDefaults.margin, left: 130, right: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={125} />
                <Tooltip />
                <Bar dataKey="count" name="Employees" fill={chartColors.spa} radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Headcount by Location</h2>
          {empLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
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

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: Leave Balances + Sick Leave Flagging
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Balances — {new Date().getFullYear()}
          </h2>
          {leaveLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : (
            <DataTable
              columns={leaveBalanceColumns}
              data={(leave?.leaveBalances || []) as unknown as Record<string, unknown>[]}
              pageSize={10}
            />
          )}
        </Card>

        <Card className="p-3 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sick Leave — Top Users
          </h2>
          {leaveLoading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
          ) : leave?.topSickLeaveUsers.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              No sick leave data for {new Date().getFullYear()}
            </div>
          ) : (
            <DataTable
              columns={sickLeaveColumns}
              data={(leave?.topSickLeaveUsers || []) as unknown as Record<string, unknown>[]}
              pageSize={10}
            />
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: Productivity Leaderboard (Stacked Bar Chart)
          ══════════════════════════════════════════════════════════════ */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Productivity Leaderboard</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Daily hours breakdown — sorted by productive % descending | Target: 80%
        </p>
        <ResponsiveContainer width="100%" height={productivityChartData.length * 40 + 60}>
          <BarChart
            data={productivityChartData}
            layout="vertical"
            margin={{ top: 5, right: 100, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => `${v}h`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => [`${Number(value).toFixed(1)}h`, String(name)]}
              labelFormatter={(label) => {
                const item = productivityChartData.find((d) => d.name === label);
                return item ? `${label} — ${item.productivePct}% productive (${item.totalHrs}h total)` : String(label);
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Productive" stackId="time" fill={PROD_COLORS.productive} barSize={24}>
              <LabelList
                dataKey="Productive"
                content={(props) => {
                  const { x, width, y, height, value } = props as Record<string, unknown>;
                  const w = Number(width);
                  if (w < 25) return <></>;
                  return (
                    <text
                      x={Number(x) + w / 2}
                      y={Number(y) + Number(height) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontWeight={600}
                      fill="white"
                    >
                      {Number(value).toFixed(1)}h
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar dataKey="Neutral" stackId="time" fill={PROD_COLORS.neutral} barSize={24} />
            <Bar dataKey="Unproductive" stackId="time" fill={PROD_COLORS.unproductive} barSize={24} />
            <Bar dataKey="Idle" stackId="time" fill={PROD_COLORS.idle} barSize={24} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="productivePct"
                content={(props) => {
                  const { x, width, y, height, index } = props as Record<string, unknown>;
                  const entry = productivityChartData[Number(index)];
                  if (!entry) return <></>;
                  return (
                    <text
                      x={Number(x) + Number(width) + 6}
                      y={Number(y) + Number(height) / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="#374151"
                    >
                      {entry.productivePct}% — {entry.totalHrs}h
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7: Payroll by Location
          ══════════════════════════════════════════════════════════════ */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Payroll by Location</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Gross payroll — {payroll?.latestMonth
            ? new Date(payroll.latestMonth + "-01").toLocaleDateString("en-MT", { month: "long", year: "numeric" })
            : "Latest month"}
        </p>
        {payLoading ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={(payroll?.locationData.length || 0) * 40 + 50}>
            <BarChart
              data={payroll?.locationData || []}
              layout="vertical"
              margin={{ top: 5, right: 100, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="gross" name="Gross Pay" fill={chartColors.spa} barSize={28} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="gross"
                  content={(props) => {
                    const { x, width, y, height, index } = props as Record<string, unknown>;
                    const entry = (payroll?.locationData || [])[Number(index)];
                    if (!entry) return <></>;
                    return (
                      <text
                        x={Number(x) + Number(width) + 6}
                        y={Number(y) + Number(height) / 2}
                        textAnchor="start"
                        dominantBaseline="middle"
                        fontSize={11}
                        fontWeight={600}
                        fill="#374151"
                      >
                        {formatCurrency(entry.gross)} ({entry.headcount} staff)
                      </text>
                    );
                  }}
                />
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
