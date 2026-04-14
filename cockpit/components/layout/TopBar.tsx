"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
}

export function TopBar({
  dateFrom,
  dateTo,
  onDateChange,
  brandFilter,
  onBrandChange,
  alertCount = 0,
}: TopBarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-30">
      <DateRangePicker from={dateFrom} to={dateTo} onChange={onDateChange} />
      <div className="flex items-center gap-4">
        <BrandFilter selected={brandFilter} onChange={onBrandChange} />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  );
}
