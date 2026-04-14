"use client";

import { useState } from "react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
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
  { label: "This Week", fn: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
  { label: "This Month", fn: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
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
          className="text-xs text-text-secondary hover:text-gold hover:bg-gold-bg"
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
            "inline-flex items-center justify-start gap-2 rounded-lg border border-warm-border bg-white px-3 py-1.5 text-left text-sm font-normal text-charcoal hover:border-gold/30 transition-colors"
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gold" />
          {format(from, "MMM d")} - {format(to, "MMM d, yyyy")}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
