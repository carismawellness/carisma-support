"use client";

import { useState, useMemo } from "react";

export function usePeriodComparison(dateFrom: Date, dateTo: Date) {
  const [enabled, setEnabled] = useState(false);

  const previousPeriod = useMemo(() => {
    const durationMs = dateTo.getTime() - dateFrom.getTime();
    return {
      from: new Date(dateFrom.getTime() - durationMs),
      to: new Date(dateFrom.getTime() - 1), // day before current period starts
    };
  }, [dateFrom, dateTo]);

  return {
    comparisonEnabled: enabled,
    toggleComparison: () => setEnabled(!enabled),
    previousFrom: previousPeriod.from,
    previousTo: previousPeriod.to,
  };
}
