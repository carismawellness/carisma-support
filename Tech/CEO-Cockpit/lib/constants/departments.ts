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
  ShieldAlert,
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
  { slug: "crm", label: "CRM", icon: Headphones, path: "/crm" },
  {
    slug: "marketing",
    label: "Marketing",
    icon: Megaphone,
    path: "/marketing",
    children: [
      { slug: "master", label: "Master", path: "/marketing", icon: Megaphone },
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
      { slug: "ebitda", label: "EBITDA Overview", path: "/finance/ebitda", icon: TrendingUp },
      { slug: "ebitda-spa", label: "EBITDA Spa", path: "/finance/ebitda/spa", icon: Sparkles },
      { slug: "ebitda-aesthetics", label: "EBITDA Aesthetics", path: "/finance/ebitda/aesthetics", icon: Heart },
      { slug: "ebitda-slimming", label: "EBITDA Slimming", path: "/finance/ebitda/slimming", icon: Activity },
    ],
  },
  {
    slug: "hr",
    label: "HR",
    icon: Users,
    path: "/hr",
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
