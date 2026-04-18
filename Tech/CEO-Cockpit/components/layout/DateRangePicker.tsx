"use client";

import { useState, useMemo } from "react";
import { format, subDays, startOfMonth, startOfYear, startOfQuarter, isSameDay } from "date-fns";
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
  { label: "MTD", fn: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "QTD", fn: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: "YTD", fn: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

function isPresetActive(preset: (typeof presets)[number], from: Date, to: Date) {
  const range = preset.fn();
  return isSameDay(range.from, from) && isSameDay(range.to, to);
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const activePreset = useMemo(
    () => presets.find((p) => isPresetActive(p, from, to))?.label ?? null,
    [from, to]
  );

  return (
    <div className="flex items-center gap-0.5">
      <div className="hidden md:flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150",
              activePreset === preset.label
                ? "bg-white text-gold-dark shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/60"
            )}
            onClick={() => {
              const range = preset.fn();
              onChange(range.from, range.to);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center justify-start gap-2 rounded-lg border px-2.5 md:px-3 py-1.5",
            "text-left text-xs md:text-sm font-medium transition-all duration-150",
            "bg-white shadow-sm hover:shadow",
            "border-border hover:border-gold/40",
            "text-foreground",
            "md:ml-1.5"
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-gold shrink-0" />
          <span className="truncate">
            {format(from, "MMM d")} – {format(to, "MMM d, yyyy")}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-1 p-2 border-b border-border md:hidden">
            {presets.map((preset) => (
              <button
                key={preset.label}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                  activePreset === preset.label
                    ? "bg-gold/10 text-gold-dark"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => {
                  const range = preset.fn();
                  onChange(range.from, range.to);
                  setOpen(false);
                }}
              >
                {preset.label}
              </button>
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
