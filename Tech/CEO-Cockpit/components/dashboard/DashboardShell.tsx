"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: (props: {
    dateFrom: Date;
    dateTo: Date;
    brandFilter: string | null;
  }) => ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { from, to, setRange } = useDateRange();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <TopBar
        dateFrom={from}
        dateTo={to}
        onDateChange={setRange}
        onMobileMenuOpen={() => setMobileOpen(true)}
        sidebarCollapsed={collapsed}
      />
      <main
        className={cn(
          "pt-14 p-3 md:p-6 space-y-4 md:space-y-6 transition-all duration-200",
          "ml-0",
          collapsed ? "lg:ml-[4.5rem]" : "lg:ml-60"
        )}
      >
        {children({ dateFrom: from, dateTo: to, brandFilter: null })}
      </main>
    </div>
  );
}
