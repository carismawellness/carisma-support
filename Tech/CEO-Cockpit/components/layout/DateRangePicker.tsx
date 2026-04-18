"use client";

import { useState } from "react";
import { format, subDays, startOfWeek, startOfMonth, startOfYear, startOfQuarter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  onChange: (from: Date, to: Date) => void;
}

const presets = [
  { label: "7d", fn: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "30d", fn: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "90d", fn: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This Month", fn: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "This Quarter", fn: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: "YTD", fn: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex text-xs text-text-secondary hover:text-gold hover:bg-gold-bg"
          onClick={() => {
            const range = preset.fn();
            onChange(range.from, range.to);
          }}
        >
          {preset.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center justify-start gap-2 rounded-lg border border-warm-border bg-white px-2 md:px-3 py-1.5 text-left text-xs md:text-sm font-normal text-charcoal hover:border-gold/30 transition-colors"
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gold shrink-0" />
          <span className="truncate">
            {format(from, "MMM d")} - {format(to, "MMM d, yyyy")}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-1 p-2 border-b border-border md:hidden">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="text-xs flex-1 text-text-secondary hover:text-gold hover:bg-gold-bg"
                onClick={() => {
                  const range = preset.fn();
                  onChange(range.from, range.to);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={{ from, to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onChange(range.from, range.to);
                setOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
