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
  { slug: "sales", label: "Sales", icon: DollarSign, path: "/sales" },
  {
    slug: "crm",
    label: "CRM",
    icon: Headphones,
    path: "/crm",
    children: [
      { slug: "speed-to-lead", label: "Speed to Lead", path: "/crm/speed-to-lead", icon: Timer },
    ],
  },
  { slug: "marketing", label: "Marketing", icon: Megaphone, path: "/marketing" },
  { slug: "finance", label: "Finance", icon: PiggyBank, path: "/finance" },
  { slug: "hr", label: "HR", icon: Users, path: "/hr" },
  { slug: "operations", label: "Operations", icon: Settings, path: "/operations" },
  { slug: "brand-standards", label: "Brand Standards", icon: ClipboardCheck, path: "/brand-standards" },
  { slug: "productivity", label: "Productivity", icon: Activity, path: "/productivity" },
];
