import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  Headphones,
  PiggyBank,
  Users,
  Settings,
  Activity,
  ClipboardCheck,
  Timer,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Sparkles,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface SubItem {
  slug: string;
  label: string;
  path: string;
  icon?: LucideIcon;
}

export interface Department {
  slug: string;
  label: string;
  icon: LucideIcon;
  path: string;
  children?: SubItem[];
}

export const departments: Department[] = [
  { slug: "ceo", label: "CEO", icon: LayoutDashboard, path: "/ceo" },
  {
    slug: "sales",
    label: "Sales",
    icon: DollarSign,
    path: "/sales",
    children: [
      { slug: "overview", label: "Overview", path: "/sales", icon: DollarSign },
      { slug: "spa", label: "Spa", path: "/sales/spa", icon: Sparkles },
      { slug: "aesthetics", label: "Aesthetics", path: "/sales/aesthetics", icon: Heart },
      { slug: "slimming", label: "Slimming", path: "/sales/slimming", icon: Activity },
    ],
  },
  {
    slug: "crm",
    label: "CRM",
    icon: Headphones,
    path: "/crm",
    children: [
      { slug: "master", label: "Master", path: "/crm", icon: Headphones },
      { slug: "speed-to-lead", label: "Speed to Lead", path: "/crm/speed-to-lead", icon: Timer },
      { slug: "team-kpis", label: "Team KPIs", path: "/crm/team-kpis", icon: BarChart3 },
    ],
  },
  {
    slug: "marketing",
    label: "Marketing",
    icon: Megaphone,
    path: "/marketing",
    children: [
      { slug: "overview", label: "Overview", path: "/marketing", icon: Megaphone },
      { slug: "spa", label: "Spa", path: "/marketing/spa", icon: Sparkles },
      { slug: "aesthetics", label: "Aesthetics", path: "/marketing/aesthetics", icon: Heart },
      { slug: "slimming", label: "Slimming", path: "/marketing/slimming", icon: Activity },
    ],
  },
  {
    slug: "finance",
    label: "Finance",
    icon: PiggyBank,
    path: "/finance",
    children: [
      { slug: "master", label: "Master", path: "/finance", icon: PiggyBank },
      { slug: "ebitda", label: "EBITDA Detail", path: "/finance/ebitda", icon: TrendingUp },
    ],
  },
  {
    slug: "hr",
    label: "HR",
    icon: Users,
    path: "/hr",
    children: [
      { slug: "master", label: "Master", path: "/hr", icon: Users },
      { slug: "productivity", label: "Productivity", path: "/productivity", icon: Activity },
      { slug: "talexio", label: "Talexio Deep Dive", path: "/hr/talexio", icon: Users },
    ],
  },
  {
    slug: "operations",
    label: "Operations",
    icon: Settings,
    path: "/operations",
    children: [
      { slug: "master", label: "Master", path: "/operations", icon: Settings },
      { slug: "diligence", label: "Diligence Audit", path: "/operations/diligence", icon: ShieldAlert },
      { slug: "brand-standards", label: "Brand Standards", path: "/brand-standards", icon: ClipboardCheck },
    ],
  },
];
