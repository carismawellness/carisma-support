"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { departments } from "@/lib/constants/departments";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-warm-white flex flex-col fixed left-0 top-0 z-40 border-r border-warm-border">
      <div className="p-6 border-b border-warm-border">
        <h1 className="text-gold font-bold text-xl tracking-wide">Carisma</h1>
        <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-text-secondary mt-0.5">Cockpit</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {departments.map((dept) => {
          const isActive = pathname === dept.path;
          const Icon = dept.icon;
          return (
            <Link
              key={dept.slug}
              href={dept.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "border-l-[3px] border-gold bg-gold-bg text-gold"
                  : "text-text-secondary hover:bg-warm-gray hover:text-charcoal"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-gold" : "text-text-secondary")} />
              {dept.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-warm-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-semibold">
            MG
          </div>
          <div className="text-xs">
            <p className="font-medium text-charcoal">Mert Gulen</p>
            <p className="text-text-secondary">CEO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
