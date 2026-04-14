"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { departments } from "@/lib/constants/departments";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-navy text-white flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-gold font-bold text-xl tracking-wide">COCKPIT</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {departments.map((dept) => {
          const isActive = pathname === dept.path;
          const Icon = dept.icon;
          return (
            <Link
              key={dept.slug}
              href={dept.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gold/20 text-gold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {dept.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
