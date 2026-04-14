import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  Headphones,
  PiggyBank,
  Users,
  UserRound,
  Settings,
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
  { slug: "sales", label: "Sales", icon: DollarSign, path: "/sales" },
  { slug: "crm", label: "CRM", icon: Headphones, path: "/crm" },
  { slug: "marketing", label: "Marketing", icon: Megaphone, path: "/marketing" },
  { slug: "finance", label: "Finance", icon: PiggyBank, path: "/finance" },
  { slug: "hr", label: "HR", icon: Users, path: "/hr" },
  { slug: "operations", label: "Operations", icon: Settings, path: "/operations" },
  { slug: "customers", label: "Customers", icon: UserRound, path: "/customers" },
];
