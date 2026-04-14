"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CIChatFloat } from "@/components/ci/CIChatFloat";
import { useDateRange } from "@/lib/hooks/useDateRange";
import { useBrandFilter } from "@/lib/hooks/useBrandFilter";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { useAuditLog } from "@/lib/hooks/useAuditLog";
import { usePeriodComparison } from "@/lib/hooks/usePeriodComparison";
import { PeriodComparisonToggle } from "@/components/layout/PeriodComparisonToggle";
import { ShortcutsHelp } from "@/components/layout/ShortcutsHelp";
import { OnboardingTour } from "@/components/layout/OnboardingTour";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

interface DashboardShellProps {
  children: (props: {
    dateFrom: Date;
    dateTo: Date;
    brandFilter: string | null;
    comparison?: {
      enabled: boolean;
      previousFrom: Date;
      previousTo: Date;
    };
  }) => ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { from, to, setRange } = useDateRange();
  const { brand, setBrand } = useBrandFilter();
  const { comparisonEnabled, toggleComparison, previousFrom, previousTo } = usePeriodComparison(from, to);
  useKeyboardShortcuts();
  useAuditLog();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const mainMarginLeft = isDesktop
    ? collapsed ? "4.5rem" : "15rem"
    : "0";

  return (
    <div className="min-h-screen bg-warm-white">
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
        brandFilter={brand}
        onBrandChange={setBrand}
        sidebarCollapsed={collapsed}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />
      <main
        className="pt-16 p-4 lg:p-8 space-y-6 transition-all duration-200"
        style={{ marginLeft: mainMarginLeft }}
      >
        <div className="flex items-center justify-between mb-2">
          <div />
          <PeriodComparisonToggle
            enabled={comparisonEnabled}
            onToggle={toggleComparison}
            previousFrom={previousFrom}
            previousTo={previousTo}
          />
        </div>
        {children({
          dateFrom: from,
          dateTo: to,
          brandFilter: brand,
          comparison: comparisonEnabled
            ? { enabled: true, previousFrom, previousTo }
            : undefined,
        })}
      </main>
      <CIChatFloat />
      <ShortcutsHelp />
      <OnboardingTour />
    </div>
  );
}
