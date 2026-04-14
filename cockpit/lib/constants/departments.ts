import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  PiggyBank,
  Users,
  Settings,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface Department {
  slug: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const departments: Department[] = [
  { slug: "ceo", label: "CEO", icon: LayoutDashboard, path: "/ceo" },
  { slug: "marketing", label: "Marketing", icon: Megaphone, path: "/marketing" },
  { slug: "sales", label: "Sales", icon: DollarSign, path: "/sales" },
  { slug: "finance", label: "Finance", icon: PiggyBank, path: "/finance" },
  { slug: "hr", label: "HR", icon: Users, path: "/hr" },
  { slug: "operations", label: "Operations", icon: Settings, path: "/operations" },
  { slug: "data", label: "Data", icon: Database, path: "/data" },
];
