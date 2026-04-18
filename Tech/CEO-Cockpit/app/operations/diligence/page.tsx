"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { KPICardRow, KPIData } from "@/components/dashboard/KPICardRow";
import { DataTable } from "@/components/dashboard/DataTable";
import { Card } from "@/components/ui/card";
import { CIChat } from "@/components/ci/CIChat";
import {
  chartColors,
  chartDefaults,
  formatCurrency,
  formatPercent,
} from "@/lib/charts/config";
import {
  LineChart,
  Line,
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
} from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════
   DATA — Diligence Audit from Accounting Master sheet
   Jan 2024 – Feb 2026 (26 months)
   ═══════════════════════════════════════════════════════════════════════ */

const MONTHS = [
  "Jan 24","Feb 24","Mar 24","Apr 24","May 24","Jun 24",
  "Jul 24","Aug 24","Sep 24","Oct 24","Nov 24","Dec 24",
  "Jan 25","Feb 25","Mar 25","Apr 25","May 25","Jun 25",
  "Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25",
  "Jan 26","Feb 26",
];

// Location keys — Excelsior from Jul 25, Novotel from Oct 25
const LOCATIONS = ["Inter","Hugos","Hyatt","Ramla","Labranda","Sunny","Excelsior","Novotel"] as const;
type Location = typeof LOCATIONS[number];

interface MonthData {
  totalSales: number;
  deletedPct: number;
  complimentaryPct: number;
  cashPct: number;
  discountedCashPct: number;
  unattended: number;
}

// Build location data: each location -> array of MonthData (null if location didn't exist that month)
const RAW: Record<Location, (MonthData | null)[]> = {
  Inter: [
    { totalSales:38828, deletedPct:26, complimentaryPct:0, cashPct:13, discountedCashPct:0, unattended:29 },
    { totalSales:53597, deletedPct:27, complimentaryPct:5, cashPct:21, discountedCashPct:2, unattended:12 },
    { totalSales:58579, deletedPct:34, complimentaryPct:3, cashPct:9, discountedCashPct:10, unattended:30 },
    { totalSales:60309, deletedPct:25, complimentaryPct:4, cashPct:13, discountedCashPct:3, unattended:24 },
    { totalSales:49433, deletedPct:36, complimentaryPct:4, cashPct:16, discountedCashPct:5, unattended:29 },
    { totalSales:49221, deletedPct:24, complimentaryPct:3, cashPct:15, discountedCashPct:5, unattended:16 },
    { totalSales:48512, deletedPct:32, complimentaryPct:2, cashPct:14, discountedCashPct:5, unattended:24 },
    { totalSales:62152, deletedPct:22, complimentaryPct:2, cashPct:20, discountedCashPct:1, unattended:5 },
    { totalSales:60804, deletedPct:14, complimentaryPct:3, cashPct:17, discountedCashPct:2, unattended:28 },
    { totalSales:59722, deletedPct:16, complimentaryPct:2, cashPct:14, discountedCashPct:4, unattended:23 },
    { totalSales:51068, deletedPct:19, complimentaryPct:2, cashPct:20, discountedCashPct:9, unattended:25 },
    { totalSales:39977, deletedPct:11, complimentaryPct:5, cashPct:12, discountedCashPct:7, unattended:20 },
    { totalSales:41857, deletedPct:10, complimentaryPct:5, cashPct:12, discountedCashPct:3, unattended:10 },
    { totalSales:52265, deletedPct:26, complimentaryPct:3, cashPct:10, discountedCashPct:6, unattended:26 },
    { totalSales:56467, deletedPct:29, complimentaryPct:4, cashPct:11, discountedCashPct:13, unattended:36 },
    { totalSales:55182, deletedPct:18, complimentaryPct:3, cashPct:15, discountedCashPct:9, unattended:26 },
    { totalSales:55205, deletedPct:22, complimentaryPct:2, cashPct:12, discountedCashPct:6, unattended:16 },
    { totalSales:47561, deletedPct:24, complimentaryPct:3, cashPct:12, discountedCashPct:15, unattended:17 },
    { totalSales:55835, deletedPct:12, complimentaryPct:4, cashPct:9, discountedCashPct:14, unattended:10 },
    { totalSales:69927, deletedPct:9, complimentaryPct:3, cashPct:9, discountedCashPct:5, unattended:20 },
    { totalSales:62246, deletedPct:10, complimentaryPct:1, cashPct:11, discountedCashPct:13, unattended:22 },
    { totalSales:67290, deletedPct:11, complimentaryPct:2, cashPct:20, discountedCashPct:1, unattended:19 },
    { totalSales:57217, deletedPct:17, complimentaryPct:4, cashPct:16, discountedCashPct:10, unattended:24 },
    { totalSales:44200, deletedPct:11, complimentaryPct:2, cashPct:12, discountedCashPct:8, unattended:16 },
    { totalSales:60617, deletedPct:20, complimentaryPct:4, cashPct:8, discountedCashPct:9, unattended:9 },
    { totalSales:60167, deletedPct:30, complimentaryPct:3, cashPct:9, discountedCashPct:7, unattended:10 },
  ],
  Hugos: [
    { totalSales:39561, deletedPct:38, complimentaryPct:4, cashPct:16, discountedCashPct:0, unattended:24 },
    { totalSales:48786, deletedPct:42, complimentaryPct:2, cashPct:10, discountedCashPct:3, unattended:16 },
    { totalSales:53043, deletedPct:30, complimentaryPct:3, cashPct:10, discountedCashPct:0, unattended:26 },
    { totalSales:52845, deletedPct:30, complimentaryPct:3, cashPct:13, discountedCashPct:0, unattended:12 },
    { totalSales:42516, deletedPct:32, complimentaryPct:3, cashPct:12, discountedCashPct:0, unattended:11 },
    { totalSales:27424, deletedPct:23, complimentaryPct:4, cashPct:13, discountedCashPct:0, unattended:1 },
    { totalSales:30527, deletedPct:31, complimentaryPct:1, cashPct:10, discountedCashPct:0, unattended:13 },
    { totalSales:39988, deletedPct:27, complimentaryPct:2, cashPct:12, discountedCashPct:0, unattended:4 },
    { totalSales:50431, deletedPct:20, complimentaryPct:2, cashPct:14, discountedCashPct:0, unattended:7 },
    { totalSales:52215, deletedPct:17, complimentaryPct:2, cashPct:12, discountedCashPct:0, unattended:13 },
    { totalSales:56835, deletedPct:19, complimentaryPct:2, cashPct:18, discountedCashPct:2, unattended:4 },
    { totalSales:45784, deletedPct:25, complimentaryPct:3, cashPct:16, discountedCashPct:9, unattended:16 },
    { totalSales:49061, deletedPct:19, complimentaryPct:4, cashPct:12, discountedCashPct:0, unattended:10 },
    { totalSales:54932, deletedPct:23, complimentaryPct:2, cashPct:10, discountedCashPct:4, unattended:21 },
    { totalSales:70588, deletedPct:20, complimentaryPct:2, cashPct:10, discountedCashPct:0, unattended:29 },
    { totalSales:63695, deletedPct:14, complimentaryPct:5, cashPct:11, discountedCashPct:10, unattended:28 },
    { totalSales:55738, deletedPct:16, complimentaryPct:3, cashPct:15, discountedCashPct:11, unattended:6 },
    { totalSales:46239, deletedPct:14, complimentaryPct:4, cashPct:11, discountedCashPct:0, unattended:10 },
    { totalSales:42962, deletedPct:16, complimentaryPct:6, cashPct:14, discountedCashPct:1, unattended:5 },
    { totalSales:52015, deletedPct:17, complimentaryPct:3, cashPct:18, discountedCashPct:6, unattended:6 },
    { totalSales:53701, deletedPct:17, complimentaryPct:3, cashPct:14, discountedCashPct:17, unattended:1 },
    { totalSales:67792, deletedPct:11, complimentaryPct:3, cashPct:14, discountedCashPct:5, unattended:3 },
    { totalSales:52989, deletedPct:14, complimentaryPct:3, cashPct:13, discountedCashPct:7, unattended:10 },
    { totalSales:41680, deletedPct:14, complimentaryPct:3, cashPct:12, discountedCashPct:13, unattended:5 },
    { totalSales:60200, deletedPct:23, complimentaryPct:2, cashPct:9, discountedCashPct:0, unattended:8 },
    { totalSales:65289, deletedPct:38, complimentaryPct:2, cashPct:8, discountedCashPct:4, unattended:37 },
  ],
  Hyatt: [
    { totalSales:18039, deletedPct:44, complimentaryPct:1, cashPct:7, discountedCashPct:0, unattended:4 },
    { totalSales:32671, deletedPct:36, complimentaryPct:2, cashPct:6, discountedCashPct:2, unattended:1 },
    { totalSales:38340, deletedPct:32, complimentaryPct:3, cashPct:10, discountedCashPct:1, unattended:2 },
    { totalSales:27481, deletedPct:23, complimentaryPct:5, cashPct:7, discountedCashPct:1, unattended:2 },
    { totalSales:24650, deletedPct:28, complimentaryPct:3, cashPct:8, discountedCashPct:0, unattended:1 },
    { totalSales:24471, deletedPct:19, complimentaryPct:3, cashPct:11, discountedCashPct:1, unattended:0 },
    { totalSales:29614, deletedPct:13, complimentaryPct:1, cashPct:13, discountedCashPct:0, unattended:2 },
    { totalSales:29241, deletedPct:13, complimentaryPct:2, cashPct:6, discountedCashPct:0, unattended:0 },
    { totalSales:30245, deletedPct:13, complimentaryPct:2, cashPct:17, discountedCashPct:0, unattended:0 },
    { totalSales:28647, deletedPct:11, complimentaryPct:3, cashPct:11, discountedCashPct:1, unattended:2 },
    { totalSales:27174, deletedPct:21, complimentaryPct:2, cashPct:12, discountedCashPct:7, unattended:3 },
    { totalSales:23240, deletedPct:25, complimentaryPct:2, cashPct:8, discountedCashPct:0, unattended:2 },
    { totalSales:26292, deletedPct:30, complimentaryPct:2, cashPct:6, discountedCashPct:6, unattended:6 },
    { totalSales:34036, deletedPct:32, complimentaryPct:2, cashPct:5, discountedCashPct:12, unattended:12 },
    { totalSales:31968, deletedPct:23, complimentaryPct:0, cashPct:6, discountedCashPct:8, unattended:27 },
    { totalSales:27434, deletedPct:13, complimentaryPct:1, cashPct:11, discountedCashPct:3, unattended:6 },
    { totalSales:28237, deletedPct:17, complimentaryPct:0, cashPct:10, discountedCashPct:0, unattended:2 },
    { totalSales:24212, deletedPct:8, complimentaryPct:1, cashPct:9, discountedCashPct:9, unattended:6 },
    { totalSales:25214, deletedPct:10, complimentaryPct:3, cashPct:14, discountedCashPct:5, unattended:5 },
    { totalSales:26190, deletedPct:11, complimentaryPct:1, cashPct:9, discountedCashPct:14, unattended:1 },
    { totalSales:25775, deletedPct:21, complimentaryPct:1, cashPct:6, discountedCashPct:17, unattended:8 },
    { totalSales:27201, deletedPct:15, complimentaryPct:0, cashPct:9, discountedCashPct:5, unattended:5 },
    { totalSales:24968, deletedPct:17, complimentaryPct:2, cashPct:16, discountedCashPct:9, unattended:22 },
    { totalSales:22302, deletedPct:22, complimentaryPct:2, cashPct:7, discountedCashPct:0, unattended:23 },
    { totalSales:30195, deletedPct:24, complimentaryPct:0, cashPct:5, discountedCashPct:12, unattended:8 },
    { totalSales:27011, deletedPct:31, complimentaryPct:1, cashPct:9, discountedCashPct:9, unattended:7 },
  ],
  Ramla: [
    { totalSales:15332, deletedPct:32, complimentaryPct:4, cashPct:11, discountedCashPct:10, unattended:16 },
    { totalSales:25567, deletedPct:28, complimentaryPct:4, cashPct:12, discountedCashPct:5, unattended:12 },
    { totalSales:26137, deletedPct:22, complimentaryPct:2, cashPct:10, discountedCashPct:2, unattended:14 },
    { totalSales:27011, deletedPct:14, complimentaryPct:4, cashPct:14, discountedCashPct:2, unattended:15 },
    { totalSales:24803, deletedPct:14, complimentaryPct:5, cashPct:22, discountedCashPct:1, unattended:11 },
    { totalSales:21289, deletedPct:14, complimentaryPct:6, cashPct:10, discountedCashPct:0, unattended:9 },
    { totalSales:21921, deletedPct:14, complimentaryPct:1, cashPct:12, discountedCashPct:4, unattended:0 },
    { totalSales:23473, deletedPct:5, complimentaryPct:3, cashPct:12, discountedCashPct:0, unattended:3 },
    { totalSales:27244, deletedPct:9, complimentaryPct:2, cashPct:16, discountedCashPct:0, unattended:6 },
    { totalSales:26383, deletedPct:12, complimentaryPct:3, cashPct:11, discountedCashPct:1, unattended:12 },
    { totalSales:24301, deletedPct:14, complimentaryPct:2, cashPct:14, discountedCashPct:4, unattended:6 },
    { totalSales:19759, deletedPct:16, complimentaryPct:3, cashPct:11, discountedCashPct:0, unattended:3 },
    { totalSales:24342, deletedPct:16, complimentaryPct:8, cashPct:11, discountedCashPct:3, unattended:12 },
    { totalSales:28579, deletedPct:23, complimentaryPct:6, cashPct:9, discountedCashPct:4, unattended:9 },
    { totalSales:33175, deletedPct:14, complimentaryPct:4, cashPct:9, discountedCashPct:1, unattended:9 },
    { totalSales:31088, deletedPct:16, complimentaryPct:3, cashPct:8, discountedCashPct:6, unattended:11 },
    { totalSales:37064, deletedPct:15, complimentaryPct:3, cashPct:10, discountedCashPct:5, unattended:3 },
    { totalSales:27975, deletedPct:14, complimentaryPct:3, cashPct:13, discountedCashPct:2, unattended:10 },
    { totalSales:30382, deletedPct:16, complimentaryPct:2, cashPct:11, discountedCashPct:14, unattended:5 },
    { totalSales:37922, deletedPct:10, complimentaryPct:2, cashPct:15, discountedCashPct:3, unattended:4 },
    { totalSales:38104, deletedPct:5, complimentaryPct:2, cashPct:11, discountedCashPct:4, unattended:11 },
    { totalSales:55022, deletedPct:10, complimentaryPct:1, cashPct:16, discountedCashPct:1, unattended:1 },
    { totalSales:38771, deletedPct:15, complimentaryPct:1, cashPct:9, discountedCashPct:20, unattended:1 },
    { totalSales:32763, deletedPct:12, complimentaryPct:2, cashPct:11, discountedCashPct:7, unattended:5 },
    { totalSales:39981, deletedPct:16, complimentaryPct:2, cashPct:9, discountedCashPct:10, unattended:7 },
    { totalSales:46813, deletedPct:20, complimentaryPct:0, cashPct:5, discountedCashPct:7, unattended:20 },
  ],
  Labranda: [
    { totalSales:9026, deletedPct:0, complimentaryPct:2, cashPct:18, discountedCashPct:0, unattended:0 },
    { totalSales:11207, deletedPct:0, complimentaryPct:2, cashPct:15, discountedCashPct:0, unattended:6 },
    { totalSales:13308, deletedPct:0, complimentaryPct:2, cashPct:13, discountedCashPct:0, unattended:3 },
    { totalSales:15955, deletedPct:0, complimentaryPct:1, cashPct:16, discountedCashPct:0, unattended:1 },
    { totalSales:21017, deletedPct:0, complimentaryPct:1, cashPct:17, discountedCashPct:0, unattended:7 },
    { totalSales:15662, deletedPct:0, complimentaryPct:3, cashPct:19, discountedCashPct:0, unattended:3 },
    { totalSales:16483, deletedPct:0, complimentaryPct:0, cashPct:19, discountedCashPct:0, unattended:1 },
    { totalSales:17391, deletedPct:0, complimentaryPct:1, cashPct:21, discountedCashPct:0, unattended:1 },
    { totalSales:15423, deletedPct:0, complimentaryPct:3, cashPct:14, discountedCashPct:0, unattended:5 },
    { totalSales:19695, deletedPct:0, complimentaryPct:1, cashPct:23, discountedCashPct:0, unattended:1 },
    { totalSales:20485, deletedPct:0, complimentaryPct:3, cashPct:15, discountedCashPct:0, unattended:1 },
    { totalSales:14423, deletedPct:29, complimentaryPct:2, cashPct:19, discountedCashPct:4, unattended:0 },
    { totalSales:13944, deletedPct:16, complimentaryPct:3, cashPct:20, discountedCashPct:4, unattended:3 },
    { totalSales:15425, deletedPct:20, complimentaryPct:2, cashPct:14, discountedCashPct:0, unattended:4 },
    { totalSales:19158, deletedPct:34, complimentaryPct:2, cashPct:9, discountedCashPct:0, unattended:10 },
    { totalSales:20255, deletedPct:23, complimentaryPct:3, cashPct:20, discountedCashPct:4, unattended:5 },
    { totalSales:21516, deletedPct:3, complimentaryPct:2, cashPct:11, discountedCashPct:5, unattended:3 },
    { totalSales:21406, deletedPct:14, complimentaryPct:1, cashPct:13, discountedCashPct:8, unattended:2 },
    { totalSales:23909, deletedPct:13, complimentaryPct:1, cashPct:12, discountedCashPct:3, unattended:1 },
    { totalSales:30170, deletedPct:12, complimentaryPct:0, cashPct:15, discountedCashPct:0, unattended:3 },
    { totalSales:30077, deletedPct:3, complimentaryPct:0, cashPct:23, discountedCashPct:3, unattended:1 },
    { totalSales:26258, deletedPct:8, complimentaryPct:0, cashPct:14, discountedCashPct:0, unattended:6 },
    { totalSales:22513, deletedPct:14, complimentaryPct:0, cashPct:17, discountedCashPct:2, unattended:2 },
    { totalSales:16520, deletedPct:16, complimentaryPct:1, cashPct:7, discountedCashPct:0, unattended:3 },
    { totalSales:19228, deletedPct:22, complimentaryPct:2, cashPct:14, discountedCashPct:0, unattended:0 },
    { totalSales:23841, deletedPct:46, complimentaryPct:1, cashPct:8, discountedCashPct:0, unattended:6 },
  ],
  Sunny: [
    { totalSales:8316, deletedPct:28, complimentaryPct:0, cashPct:31, discountedCashPct:0, unattended:6 },
    { totalSales:12155, deletedPct:26, complimentaryPct:1, cashPct:15, discountedCashPct:0, unattended:4 },
    { totalSales:12795, deletedPct:22, complimentaryPct:1, cashPct:18, discountedCashPct:1, unattended:1 },
    { totalSales:19800, deletedPct:17, complimentaryPct:1, cashPct:15, discountedCashPct:0, unattended:2 },
    { totalSales:17483, deletedPct:19, complimentaryPct:0, cashPct:19, discountedCashPct:0, unattended:1 },
    { totalSales:16924, deletedPct:24, complimentaryPct:1, cashPct:21, discountedCashPct:0, unattended:0 },
    { totalSales:21220, deletedPct:18, complimentaryPct:1, cashPct:12, discountedCashPct:0, unattended:2 },
    { totalSales:21153, deletedPct:15, complimentaryPct:1, cashPct:18, discountedCashPct:0, unattended:0 },
    { totalSales:21413, deletedPct:12, complimentaryPct:1, cashPct:17, discountedCashPct:0, unattended:3 },
    { totalSales:22302, deletedPct:20, complimentaryPct:1, cashPct:18, discountedCashPct:0, unattended:0 },
    { totalSales:21907, deletedPct:15, complimentaryPct:1, cashPct:16, discountedCashPct:0, unattended:0 },
    { totalSales:18116, deletedPct:16, complimentaryPct:0, cashPct:15, discountedCashPct:0, unattended:1 },
    { totalSales:11400, deletedPct:24, complimentaryPct:1, cashPct:8, discountedCashPct:0, unattended:4 },
    { totalSales:14086, deletedPct:19, complimentaryPct:2, cashPct:10, discountedCashPct:0, unattended:1 },
    { totalSales:14078, deletedPct:14, complimentaryPct:1, cashPct:15, discountedCashPct:13, unattended:0 },
    { totalSales:17427, deletedPct:18, complimentaryPct:1, cashPct:10, discountedCashPct:0, unattended:0 },
    { totalSales:22071, deletedPct:5, complimentaryPct:2, cashPct:16, discountedCashPct:2, unattended:0 },
    { totalSales:19261, deletedPct:9, complimentaryPct:1, cashPct:16, discountedCashPct:4, unattended:1 },
    { totalSales:22728, deletedPct:16, complimentaryPct:1, cashPct:15, discountedCashPct:3, unattended:2 },
    { totalSales:27582, deletedPct:23, complimentaryPct:1, cashPct:12, discountedCashPct:0, unattended:3 },
    { totalSales:23968, deletedPct:4, complimentaryPct:1, cashPct:12, discountedCashPct:3, unattended:3 },
    { totalSales:28278, deletedPct:15, complimentaryPct:2, cashPct:8, discountedCashPct:0, unattended:0 },
    { totalSales:21284, deletedPct:11, complimentaryPct:1, cashPct:13, discountedCashPct:0, unattended:2 },
    { totalSales:12782, deletedPct:17, complimentaryPct:1, cashPct:8, discountedCashPct:9, unattended:0 },
    { totalSales:20613, deletedPct:13, complimentaryPct:1, cashPct:12, discountedCashPct:0, unattended:4 },
    { totalSales:21695, deletedPct:20, complimentaryPct:2, cashPct:4, discountedCashPct:0, unattended:1 },
  ],
  Excelsior: [
    null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null,
    { totalSales:24529, deletedPct:11, complimentaryPct:6, cashPct:10, discountedCashPct:0, unattended:1 },
    { totalSales:25511, deletedPct:11, complimentaryPct:5, cashPct:8, discountedCashPct:14, unattended:2 },
    { totalSales:28747, deletedPct:0, complimentaryPct:3, cashPct:11, discountedCashPct:0, unattended:2 },
    { totalSales:28052, deletedPct:23, complimentaryPct:2, cashPct:9, discountedCashPct:0, unattended:7 },
    { totalSales:27210, deletedPct:6, complimentaryPct:1, cashPct:6, discountedCashPct:6, unattended:5 },
    { totalSales:24220, deletedPct:9, complimentaryPct:1, cashPct:9, discountedCashPct:0, unattended:5 },
    { totalSales:22967, deletedPct:21, complimentaryPct:1, cashPct:6, discountedCashPct:2, unattended:6 },
    { totalSales:31435, deletedPct:20, complimentaryPct:1, cashPct:4, discountedCashPct:21, unattended:10 },
  ],
  Novotel: [
    null, null, null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null,
    { totalSales:3663, deletedPct:22, complimentaryPct:0, cashPct:8, discountedCashPct:41, unattended:1 },
    { totalSales:16491, deletedPct:9, complimentaryPct:7, cashPct:11, discountedCashPct:11, unattended:3 },
    { totalSales:12026, deletedPct:14, complimentaryPct:6, cashPct:18, discountedCashPct:14, unattended:4 },
    { totalSales:9552, deletedPct:20, complimentaryPct:2, cashPct:11, discountedCashPct:9, unattended:1 },
    { totalSales:18679, deletedPct:17, complimentaryPct:2, cashPct:7, discountedCashPct:4, unattended:2 },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   THRESHOLDS
   ═══════════════════════════════════════════════════════════════════════ */

const THRESHOLDS = {
  deletedPct: 10,       // Must be <10%
  complimentaryPct: 2,  // Must be ~2%
  cashPct: 12,          // High cash % is suspicious
  discountedCashPct: 5, // Discounted cash should be minimal
  unattended: 0,        // Must be 0
};

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function statusColor(value: number, threshold: number, inverse = false): string {
  const ratio = value / threshold;
  if (inverse) {
    return ratio <= 1 ? "text-emerald-600 bg-emerald-50" : ratio <= 1.5 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  }
  return ratio >= 1 ? "text-red-600 bg-red-50" : ratio >= 0.8 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
}

function StatusBadge({ value, threshold, suffix = "%" }: { value: number; threshold: number; suffix?: string }) {
  const color = statusColor(value, threshold);
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", color)}>
      {value}{suffix}
    </span>
  );
}

const LOC_COLORS: Record<string, string> = {
  Inter: "#B79E61",
  Hugos: "#96B2B2",
  Hyatt: "#8EB093",
  Ramla: "#E07A5F",
  Labranda: "#9CA3AF",
  Sunny: "#7C6F64",
  Excelsior: "#6366F1",
  Novotel: "#EC4899",
};

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD CONTENT
   ═══════════════════════════════════════════════════════════════════════ */

function DiligenceContent() {
  const [selectedMetric, setSelectedMetric] = useState<"cashPct" | "deletedPct" | "complimentaryPct" | "discountedCashPct">("cashPct");

  // Latest month index
  const latestIdx = MONTHS.length - 1;
  const latestMonth = MONTHS[latestIdx];

  // Collect latest month data for all active locations
  const latestData = LOCATIONS.map((loc) => {
    const d = RAW[loc][latestIdx];
    return d ? { location: loc, ...d } : null;
  }).filter(Boolean) as (MonthData & { location: Location })[];

  // Company-wide averages for latest month
  const avgCash = avg(latestData.map((d) => d.cashPct));
  const avgDeleted = avg(latestData.map((d) => d.deletedPct));
  const avgComp = avg(latestData.map((d) => d.complimentaryPct));
  const avgDiscCash = avg(latestData.map((d) => d.discountedCashPct));
  const totalUnattended = latestData.reduce((s, d) => s + d.unattended, 0);
  const totalSales = latestData.reduce((s, d) => s + d.totalSales, 0);

  // Flags: locations breaching thresholds
  const cashFlags = latestData.filter((d) => d.cashPct > THRESHOLDS.cashPct);
  const deletedFlags = latestData.filter((d) => d.deletedPct > THRESHOLDS.deletedPct);
  const compFlags = latestData.filter((d) => d.complimentaryPct > THRESHOLDS.complimentaryPct);

  // Prior month comparison
  const priorIdx = latestIdx - 1;
  const priorData = LOCATIONS.map((loc) => {
    const d = RAW[loc][priorIdx];
    return d ? { location: loc, ...d } : null;
  }).filter(Boolean) as (MonthData & { location: Location })[];
  const priorAvgCash = avg(priorData.map((d) => d.cashPct));

  const kpis: KPIData[] = [
    {
      label: `Total Sales (${latestMonth})`,
      value: formatCurrency(totalSales),
    },
    {
      label: "Avg Cash %",
      value: formatPercent(avgCash),
      target: "<12%",
      targetValue: THRESHOLDS.cashPct,
      currentValue: avgCash,
      trend: priorAvgCash > avgCash ? (priorAvgCash - avgCash) : -(avgCash - priorAvgCash),
    },
    {
      label: "Avg Deleted %",
      value: formatPercent(avgDeleted),
      target: "<10%",
      targetValue: THRESHOLDS.deletedPct,
      currentValue: avgDeleted,
    },
    {
      label: "Avg Complimentary %",
      value: formatPercent(avgComp),
      target: "~2%",
      targetValue: THRESHOLDS.complimentaryPct,
      currentValue: avgComp,
    },
    {
      label: "Avg Disc. Cash %",
      value: formatPercent(avgDiscCash),
      target: "<5%",
    },
    {
      label: "Total Unattended",
      value: String(totalUnattended),
      target: "0",
    },
  ];

  // Build trend data for line charts
  const metricLabels: Record<string, string> = {
    cashPct: "Cash %",
    deletedPct: "Deleted/Cancelled %",
    complimentaryPct: "Complimentary %",
    discountedCashPct: "Discounted Cash %",
  };
  const metricThreshold: Record<string, number> = {
    cashPct: THRESHOLDS.cashPct,
    deletedPct: THRESHOLDS.deletedPct,
    complimentaryPct: THRESHOLDS.complimentaryPct,
    discountedCashPct: THRESHOLDS.discountedCashPct,
  };

  const trendData = MONTHS.map((month, i) => {
    const row: Record<string, string | number | undefined> = { month };
    for (const loc of LOCATIONS) {
      const d = RAW[loc][i];
      if (d) {
        row[loc] = d[selectedMetric];
      }
    }
    return row;
  });

  // Cash % trend specifically (always shown)
  const cashTrendData = MONTHS.map((month, i) => {
    const row: Record<string, string | number | undefined> = { month };
    for (const loc of LOCATIONS) {
      const d = RAW[loc][i];
      if (d) {
        row[loc] = d.cashPct;
      }
    }
    return row;
  });

  // Location scorecard for latest month
  const scorecardData = latestData
    .map((d) => ({
      location: d.location,
      totalSales: d.totalSales,
      cashPct: d.cashPct,
      deletedPct: d.deletedPct,
      complimentaryPct: d.complimentaryPct,
      discountedCashPct: d.discountedCashPct,
      unattended: d.unattended,
    }))
    .sort((a, b) => b.cashPct - a.cashPct);

  // Heatmap data: last 6 months x locations for cash %
  const last6 = MONTHS.slice(-6);
  const heatmapData = LOCATIONS.map((loc) => {
    const row: Record<string, string | number | null> = { location: loc };
    last6.forEach((month, i) => {
      const d = RAW[loc][MONTHS.length - 6 + i];
      row[month] = d ? d.cashPct : null;
    });
    return row;
  }).filter((row) => last6.some((m) => row[m] !== null));

  // Alerts
  const alerts: { severity: "red" | "amber"; message: string }[] = [];
  for (const d of latestData) {
    if (d.cashPct >= 20) alerts.push({ severity: "red", message: `${d.location}: Cash at ${d.cashPct}% — well above 12% threshold` });
    else if (d.cashPct > THRESHOLDS.cashPct) alerts.push({ severity: "amber", message: `${d.location}: Cash at ${d.cashPct}% — above 12% threshold` });
    if (d.deletedPct >= 30) alerts.push({ severity: "red", message: `${d.location}: Deleted at ${d.deletedPct}% — 3x threshold` });
    else if (d.deletedPct > THRESHOLDS.deletedPct) alerts.push({ severity: "amber", message: `${d.location}: Deleted at ${d.deletedPct}% — above 10% threshold` });
    if (d.discountedCashPct >= 15) alerts.push({ severity: "red", message: `${d.location}: Discounted cash at ${d.discountedCashPct}% — very high` });
    if (d.unattended > 10) alerts.push({ severity: "red", message: `${d.location}: ${d.unattended} unattended bookings` });
  }
  alerts.sort((a, b) => (a.severity === "red" ? -1 : 1) - (b.severity === "red" ? -1 : 1));

  // Unattended trend
  const unattendedTrend = MONTHS.map((month, i) => {
    const row: Record<string, string | number | undefined> = { month };
    for (const loc of LOCATIONS) {
      const d = RAW[loc][i];
      if (d) row[loc] = d.unattended;
    }
    return row;
  });

  return (
    <>
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-7 w-7 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diligence Audit</h1>
          <p className="text-sm text-muted-foreground">
            Fraud prevention & compliance tracking | Jan 2024 – {latestMonth} | {LOCATIONS.filter((l) => RAW[l][latestIdx]).length} active locations
          </p>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-red-700">{alerts.length} Active Alerts — {latestMonth}</h2>
          </div>
          <div className="space-y-1.5">
            {alerts.slice(0, 8).map((a, i) => (
              <div key={i} className={cn(
                "flex items-center gap-2 text-xs font-medium px-2 py-1 rounded",
                a.severity === "red" ? "text-red-700 bg-red-100" : "text-amber-700 bg-amber-100"
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", a.severity === "red" ? "bg-red-500" : "bg-amber-500")} />
                {a.message}
              </div>
            ))}
            {alerts.length > 8 && <p className="text-xs text-red-600 pl-4">+{alerts.length - 8} more alerts</p>}
          </div>
        </Card>
      )}

      <KPICardRow kpis={kpis} />

      {/* ── Cash % Trend (Primary Fraud Indicator) ─────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Cash as % of Sales — by Location</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Key fraud indicator. Threshold: &lt;12%. Higher cash ratios warrant investigation.
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={cashTrendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 35]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "Threshold 12%", position: "right", fill: "#ef4444", fontSize: 10 }} />
            {LOCATIONS.map((loc) => {
              const hasData = RAW[loc].some((d) => d !== null);
              if (!hasData) return null;
              return (
                <Line
                  key={loc}
                  type="monotone"
                  dataKey={loc}
                  stroke={LOC_COLORS[loc]}
                  strokeWidth={loc === "Inter" || loc === "Hugos" ? 2.5 : 1.5}
                  dot={{ r: 2 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Cash % Heatmap (Last 6 Months) ─────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Cash % Heatmap — Last 6 Months</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Green: &le;8% | Amber: 9-12% | Red: &gt;12%
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Location</th>
                {last6.map((m) => (
                  <th key={m} className="text-center py-2 px-3 font-medium text-muted-foreground">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.location as string} className="border-b border-warm-border/50">
                  <td className="py-2 px-3 font-medium text-foreground">{row.location as string}</td>
                  {last6.map((m) => {
                    const val = row[m] as number | null;
                    if (val === null) return <td key={m} className="text-center py-2 px-3 text-muted-foreground">—</td>;
                    const bg = val <= 8 ? "bg-emerald-100 text-emerald-800" : val <= 12 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
                    return (
                      <td key={m} className="text-center py-2 px-3">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", bg)}>{val}%</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Metric Selector + Trend ────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{metricLabels[selectedMetric]} — Trend by Location</h2>
            <p className="text-xs text-muted-foreground">Select metric to explore</p>
          </div>
          <div className="flex gap-1">
            {(Object.keys(metricLabels) as (keyof typeof metricLabels)[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as typeof selectedMetric)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  selectedMetric === key
                    ? "bg-gold text-white"
                    : "bg-warm-gray text-text-secondary hover:bg-warm-border"
                )}
              >
                {metricLabels[key]}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={chartDefaults.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={metricThreshold[selectedMetric]} stroke="#ef4444" strokeDasharray="6 3" />
            {LOCATIONS.map((loc) => {
              const hasData = RAW[loc].some((d) => d !== null);
              if (!hasData) return null;
              return (
                <Line key={loc} type="monotone" dataKey={loc} stroke={LOC_COLORS[loc]} strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Location Scorecard ─────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Location Scorecard — {latestMonth}</h2>
        <p className="text-xs text-muted-foreground mb-4">Sorted by cash % descending. Red = breaching threshold.</p>
        <DataTable
          columns={[
            { key: "location", label: "Location" },
            { key: "totalSales", label: "Total Sales", align: "right" as const, sortable: true, render: (v: unknown) => formatCurrency(v as number) },
            {
              key: "cashPct",
              label: "Cash %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.cashPct} />,
            },
            {
              key: "deletedPct",
              label: "Deleted %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.deletedPct} />,
            },
            {
              key: "complimentaryPct",
              label: "Comp %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.complimentaryPct} />,
            },
            {
              key: "discountedCashPct",
              label: "Disc Cash %",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.discountedCashPct} />,
            },
            {
              key: "unattended",
              label: "Unattended",
              align: "right" as const,
              sortable: true,
              render: (v: unknown) => {
                const val = v as number;
                const color = val === 0 ? "text-emerald-600 bg-emerald-50" : val <= 5 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
                return <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", color)}>{val}</span>;
              },
            },
          ]}
          data={scorecardData}
        />
      </Card>

      {/* ── Deleted/Cancelled % Trend ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Deleted/Cancelled % Trend</h2>
          <p className="text-xs text-muted-foreground mb-3">Threshold: &lt;10%</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MONTHS.map((month, i) => {
              const row: Record<string, string | number | undefined> = { month };
              for (const loc of LOCATIONS) { const d = RAW[loc][i]; if (d) row[loc] = d.deletedPct; }
              return row;
            })} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="month" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="6 3" />
              {LOCATIONS.slice(0, 6).map((loc) => (
                <Line key={loc} type="monotone" dataKey={loc} stroke={LOC_COLORS[loc]} strokeWidth={1.5} dot={false} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Unattended Bookings Trend</h2>
          <p className="text-xs text-muted-foreground mb-3">Target: 0 per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHS.slice(-12).map((month, i) => {
              const idx = MONTHS.length - 12 + i;
              const row: Record<string, string | number | undefined> = { month };
              for (const loc of LOCATIONS) { const d = RAW[loc][idx]; if (d) row[loc] = d.unattended; }
              return row;
            })} margin={chartDefaults.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="month" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {LOCATIONS.slice(0, 6).map((loc) => (
                <Bar key={loc} dataKey={loc} fill={LOC_COLORS[loc]} radius={[1, 1, 0, 0]} stackId="a" />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Worst Offenders — Cash % (Bar Chart, Latest Month) ── */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Cash % by Location — {latestMonth}</h2>
        <p className="text-xs text-muted-foreground mb-4">Locations sorted by cash %. Red bars exceed 12% threshold.</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={scorecardData}
            layout="vertical"
            margin={{ ...chartDefaults.margin, left: 90 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" tickFormatter={(v: number) => `${v}%`} domain={[0, 20]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="location" width={90} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <ReferenceLine x={12} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "12%", position: "top", fill: "#ef4444", fontSize: 11 }} />
            <Bar dataKey="cashPct" name="Cash %" radius={[0, 4, 4, 0]}>
              {scorecardData.map((entry, i) => (
                <Cell key={i} fill={entry.cashPct > 12 ? "#ef4444" : entry.cashPct > 8 ? "#f59e0b" : "#22c55e"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Monthly Trend Table (last 6 months, company average) ─ */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Company Averages — Last 12 Months</h2>
        <DataTable
          columns={[
            { key: "month", label: "Month" },
            { key: "totalSales", label: "Total Sales", align: "right" as const, render: (v: unknown) => formatCurrency(v as number) },
            { key: "avgCash", label: "Avg Cash %", align: "right" as const, sortable: true, render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.cashPct} /> },
            { key: "avgDeleted", label: "Avg Deleted %", align: "right" as const, sortable: true, render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.deletedPct} /> },
            { key: "avgComp", label: "Avg Comp %", align: "right" as const, sortable: true, render: (v: unknown) => <StatusBadge value={v as number} threshold={THRESHOLDS.complimentaryPct} /> },
            { key: "totalUnattended", label: "Unattended", align: "right" as const, sortable: true, render: (v: unknown) => {
              const val = v as number;
              const color = val === 0 ? "text-emerald-600 bg-emerald-50" : val <= 10 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
              return <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", color)}>{val}</span>;
            }},
          ]}
          data={MONTHS.slice(-12).map((month, i) => {
            const idx = MONTHS.length - 12 + i;
            const monthData = LOCATIONS.map((loc) => RAW[loc][idx]).filter(Boolean) as MonthData[];
            return {
              month,
              totalSales: monthData.reduce((s, d) => s + d.totalSales, 0),
              avgCash: Math.round(avg(monthData.map((d) => d.cashPct))),
              avgDeleted: Math.round(avg(monthData.map((d) => d.deletedPct))),
              avgComp: Math.round(avg(monthData.map((d) => d.complimentaryPct))),
              totalUnattended: monthData.reduce((s, d) => s + d.unattended, 0),
            };
          })}
        />
      </Card>

      <CIChat />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export default function DiligencePage() {
  return (
    <DashboardShell>
      {() => <DiligenceContent />}
    </DashboardShell>
  );
}
