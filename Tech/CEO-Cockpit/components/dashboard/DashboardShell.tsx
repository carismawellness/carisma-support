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
      />
      <main className={cn("pt-16 p-6 space-y-6 transition-all duration-200", collapsed ? "ml-[4.5rem]" : "ml-60")}>
        {children({ dateFrom: from, dateTo: to, brandFilter: null })}
      </main>
    </div>
  );
}
