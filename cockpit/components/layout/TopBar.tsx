"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Sun, Moon, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { BrandFilter } from "./BrandFilter";

interface TopBarProps {
  dateFrom: Date;
  dateTo: Date;
  onDateChange: (from: Date, to: Date) => void;
  brandFilter: string | null;
  onBrandChange: (brand: string | null) => void;
  alertCount?: number;
  sidebarCollapsed?: boolean;
  onMobileMenuOpen?: () => void;
}

export function TopBar({
  dateFrom,
  dateTo,
  onDateChange,
  brandFilter,
  onBrandChange,
  alertCount = 0,
  sidebarCollapsed = false,
  onMobileMenuOpen,
}: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { dark, toggle } = useTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="h-16 bg-white dark:bg-[#162535] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between px-4 lg:px-6 fixed top-0 right-0 z-30 transition-all duration-200 left-0 lg:left-[var(--sidebar-width)]"
      style={{ "--sidebar-width": sidebarCollapsed ? "4.5rem" : "15rem" } as React.CSSProperties}
    >
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Hamburger menu - mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-text-secondary hover:text-charcoal"
          onClick={onMobileMenuOpen}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-xs font-medium text-text-secondary tracking-wide hidden lg:inline">
          Carisma Intelligence
        </span>
        {/* Date picker hidden on mobile */}
        <div className="hidden lg:block">
          <DateRangePicker from={dateFrom} to={dateTo} onChange={onDateChange} />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <BrandFilter selected={brandFilter} onChange={onBrandChange} />
        <Button variant="ghost" size="icon" onClick={toggle} className="text-text-secondary hover:text-charcoal">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-charcoal">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
              {alertCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-text-secondary hover:text-charcoal">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
