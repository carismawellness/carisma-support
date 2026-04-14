"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useBrandFilter } from "@/lib/hooks/useBrandFilter";

interface DashboardShellProps {
  children: (props: {
    dateFrom: Date;
    dateTo: Date;
    brandFilter: string | null;
  }) => ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { from, to, setRange } = useDateRange();
  const { brand, setBrand } = useBrandFilter();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar
        dateFrom={from}
        dateTo={to}
        onDateChange={setRange}
        brandFilter={brand}
        onBrandChange={setBrand}
      />
      <main className="ml-60 pt-16 p-6 space-y-6">
        {children({ dateFrom: from, dateTo: to, brandFilter: brand })}
      </main>
    </div>
  );
}
