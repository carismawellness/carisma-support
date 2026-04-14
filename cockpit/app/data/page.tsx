"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  Globe,
  Database,
  BarChart3,
  Mail,
  Search,
  Users,
  ShoppingBag,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

/* ── Data source definitions ──────────────────────────────── */

interface DataSource {
  name: string;
  type: "google_sheet" | "api" | "database";
  icon: typeof FileSpreadsheet;
  department: string;
  tables: string[];
  schedule: string;
  status: "active" | "pending" | "error";
  description: string;
  reference?: string;
}

const dataSources: DataSource[] = [
  {
    name: "Weekly KPIs",
    type: "google_sheet",
    icon: FileSpreadsheet,
    department: "All",
    tables: ["sales_weekly", "hr_weekly", "operations_weekly"],
    schedule: "Weekly (Mon 7am)",
    status: "active",
    description: "Master KPI sheet with Sales, HR, Ops tabs. Weeks as columns layout.",
    reference: "1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE",
  },
  {
    name: "CRM Master",
    type: "google_sheet",
    icon: Users,
    department: "Sales",
    tables: ["crm_daily", "crm_by_rep"],
    schedule: "Daily (6am)",
    status: "active",
    description: "CRM KPIs per brand + outbound dials per rep. Tabs: Spa, Aes, Slm.",
    reference: "1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI",
  },
  {
    name: "Monthly KPIs / EBITDA",
    type: "google_sheet",
    icon: TrendingUp,
    department: "Finance",
    tables: ["ebitda_monthly"],
    schedule: "Monthly (1st)",
    status: "active",
    description: "EBITDA summary, brand P&Ls, SG&A allocation, reconciliation.",
    reference: "1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s",
  },
  {
    name: "Aesthetics Sales (Leticia)",
    type: "google_sheet",
    icon: ShoppingBag,
    department: "Sales",
    tables: ["sales_by_rep"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Aesthetics sales log — invoices, services, revenue by staff.",
    reference: "1Mr_aRRbRf3ex--WmUJIqXwko7okCyD82KxBOXWYnW24",
  },
  {
    name: "Slimming Sales",
    type: "google_sheet",
    icon: ShoppingBag,
    department: "Sales",
    tables: ["sales_by_rep"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Slimming sales log — clients, treatments, revenue.",
    reference: "1j6tz8k8TRSulB35Sg4X1xSlcV_JLf-8QKx-32UUkoBc",
  },
  {
    name: "Salary Master",
    type: "google_sheet",
    icon: FileSpreadsheet,
    department: "HR / Finance",
    tables: ["hr_weekly"],
    schedule: "Monthly",
    status: "active",
    description: "Monthly salary totals per location. Supplements HC% calculations.",
    reference: "1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w",
  },
  {
    name: "Marketing Budget Calendar",
    type: "google_sheet",
    icon: FileSpreadsheet,
    department: "Marketing / Finance",
    tables: ["budget_vs_actual"],
    schedule: "Monthly",
    status: "active",
    description: "Budget allocations by department and month.",
    reference: "1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc",
  },
  {
    name: "Meta Ads",
    type: "api",
    icon: Globe,
    department: "Marketing",
    tables: ["marketing_daily"],
    schedule: "Every 6h",
    status: "active",
    description: "Ad spend, impressions, clicks, CPL, ROAS across 3 brand ad accounts.",
  },
  {
    name: "Google Analytics (GA4)",
    type: "api",
    icon: BarChart3,
    department: "Marketing",
    tables: ["ga4_daily"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Sessions, users, bounce rate, conversions per brand property.",
  },
  {
    name: "Google Search Console",
    type: "api",
    icon: Search,
    department: "Marketing",
    tables: ["gsc_daily"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Clicks, impressions, avg position per brand domain.",
  },
  {
    name: "Klaviyo",
    type: "api",
    icon: Mail,
    department: "Marketing",
    tables: ["klaviyo_campaigns"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Email campaign performance — sends, opens, revenue per campaign.",
  },
  {
    name: "Zoho CRM",
    type: "api",
    icon: Users,
    department: "Sales",
    tables: ["speed_to_lead_distribution"],
    schedule: "Every 6h",
    status: "active",
    description: "Lead response time analysis — speed-to-lead distribution buckets.",
  },
  {
    name: "Wix Bookings",
    type: "api",
    icon: ShoppingBag,
    department: "Operations",
    tables: ["ga4_daily"],
    schedule: "Daily (6am)",
    status: "active",
    description: "Booking/conversion counts from Wix, supplements GA4 data.",
  },
  {
    name: "We360",
    type: "api",
    icon: Users,
    department: "HR",
    tables: ["we360_daily"],
    schedule: "Daily (8am)",
    status: "active",
    description: "Employee productivity tracking — active time, idle, productive hours.",
  },
  {
    name: "Supabase (Cockpit DB)",
    type: "database",
    icon: Database,
    department: "All",
    tables: [
      "brands", "locations", "staff", "kpi_targets",
      "sales_weekly", "sales_by_rep", "crm_daily", "crm_by_rep",
      "marketing_daily", "ga4_daily", "gsc_daily", "klaviyo_campaigns",
      "ebitda_monthly", "budget_vs_actual", "hr_weekly", "we360_daily",
      "therapist_utilization", "operations_weekly", "consult_funnel",
      "speed_to_lead_distribution", "ci_alerts", "ci_chat_history", "profiles",
    ],
    schedule: "Real-time",
    status: "active",
    description: "Central PostgreSQL warehouse. All ETL data lands here. RLS-protected.",
  },
];

const typeColors: Record<string, string> = {
  google_sheet: "bg-green-50 text-green-700 border-green-200",
  api: "bg-blue-50 text-blue-700 border-blue-200",
  database: "bg-purple-50 text-purple-700 border-purple-200",
};

const typeLabels: Record<string, string> = {
  google_sheet: "Google Sheet",
  api: "API",
  database: "Database",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export default function DataPage() {
  const sheetSources = dataSources.filter((s) => s.type === "google_sheet");
  const apiSources = dataSources.filter((s) => s.type === "api");
  const dbSources = dataSources.filter((s) => s.type === "database");

  return (
    <DashboardShell>
      {() => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Data Sources</h1>
              <p className="text-sm text-text-secondary mt-1">
                {dataSources.length} sources feeding {dataSources.reduce((s, d) => s + d.tables.length, 0)} database tables
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={typeColors.google_sheet}>
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                {sheetSources.length} Sheets
              </Badge>
              <Badge variant="outline" className={typeColors.api}>
                <Globe className="h-3 w-3 mr-1" />
                {apiSources.length} APIs
              </Badge>
              <Badge variant="outline" className={typeColors.database}>
                <Database className="h-3 w-3 mr-1" />
                {dbSources.length} Database
              </Badge>
            </div>
          </div>

          {/* Google Sheets */}
          <Card className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-border bg-warm-white">
              <h2 className="text-base font-semibold text-charcoal flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-gold" />
                Google Sheets
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-warm-white/50">
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Source</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Department</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Target Tables</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Schedule</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheetSources.map((src) => (
                  <TableRow key={src.name} className="hover:bg-gold-bg/30">
                    <TableCell>
                      <div>
                        <div className="font-medium text-charcoal text-sm flex items-center gap-1.5">
                          {src.name}
                          {src.reference && (
                            <ExternalLink className="h-3 w-3 text-text-secondary" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{src.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{src.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {src.tables.map((t) => (
                          <span key={t} className="inline-flex text-[11px] px-1.5 py-0.5 rounded bg-warm-gray text-text-secondary font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{src.schedule}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[src.status]}>
                        {src.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* API Sources */}
          <Card className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-border bg-warm-white">
              <h2 className="text-base font-semibold text-charcoal flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" />
                API Sources
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-warm-white/50">
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Source</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Department</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Target Tables</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Schedule</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiSources.map((src) => (
                  <TableRow key={src.name} className="hover:bg-gold-bg/30">
                    <TableCell>
                      <div>
                        <div className="font-medium text-charcoal text-sm">{src.name}</div>
                        <p className="text-xs text-text-secondary mt-0.5">{src.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{src.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {src.tables.map((t) => (
                          <span key={t} className="inline-flex text-[11px] px-1.5 py-0.5 rounded bg-warm-gray text-text-secondary font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{src.schedule}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[src.status]}>
                        {src.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Database */}
          <Card className="rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-warm-border overflow-hidden">
            <div className="px-6 py-4 border-b border-warm-border bg-warm-white">
              <h2 className="text-base font-semibold text-charcoal flex items-center gap-2">
                <Database className="h-4 w-4 text-gold" />
                Central Database
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {dbSources[0].tables.map((table) => (
                  <div
                    key={table}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warm-white border border-warm-border text-sm"
                  >
                    <Database className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span className="font-mono text-xs text-charcoal truncate">{table}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-secondary mt-4">
                Supabase PostgreSQL &middot; eu-west-1 (Ireland) &middot; Row-Level Security enabled &middot; {dbSources[0].tables.length} tables
              </p>
            </div>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
