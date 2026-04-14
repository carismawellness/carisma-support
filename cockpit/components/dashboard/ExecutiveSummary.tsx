"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPIData } from "@/components/dashboard/KPICardRow";

interface ExecutiveSummaryProps {
  page: string;
  dateFrom: Date;
  dateTo: Date;
  brandFilter: string | null;
  kpiSnapshot: KPIData[];
  isDataLoading: boolean;
}

export function ExecutiveSummary({
  page,
  dateFrom,
  dateTo,
  brandFilter,
  kpiSnapshot,
  isDataLoading,
}: ExecutiveSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (isDataLoading || kpiSnapshot.length === 0) return;

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/ci/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          dateFrom: dateFrom.toISOString().split("T")[0],
          dateTo: dateTo.toISOString().split("T")[0],
          brandFilter,
          kpiSnapshot,
        }),
      });

      if (res.status === 503) {
        setSummary(null);
        setError(false);
        return;
      }

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError(true);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, brandFilter, kpiSnapshot, isDataLoading]);

  // Auto-generate when filters change and data is ready
  useEffect(() => {
    if (!isDataLoading && kpiSnapshot.length > 0) {
      fetchSummary();
    }
  }, [fetchSummary, isDataLoading, kpiSnapshot.length]);

  return (
    <div className="rounded-xl border border-gold/20 bg-gradient-to-r from-gold-bg to-white dark:from-[#1E2818] dark:to-[#162535] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-gold/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
          </div>
          <h2 className="text-sm font-semibold text-charcoal tracking-wide uppercase">
            Executive Summary
          </h2>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading || isDataLoading}
          className="text-text-secondary hover:text-gold transition-colors disabled:opacity-40"
          title="Regenerate summary"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", loading && "animate-spin")}
          />
        </button>
      </div>

      {loading && !summary && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Analyzing your data...
        </div>
      )}

      {error && !summary && (
        <p className="text-sm text-text-secondary">
          Unable to generate summary.{" "}
          <button
            onClick={fetchSummary}
            className="text-gold hover:underline"
          >
            Try again
          </button>
        </p>
      )}

      {summary && (
        <p
          className={cn(
            "text-sm leading-relaxed text-charcoal/90",
            loading && "opacity-50"
          )}
        >
          {summary}
        </p>
      )}

      {!loading && !error && !summary && kpiSnapshot.length === 0 && (
        <p className="text-sm text-text-secondary">
          Loading data to generate summary...
        </p>
      )}
    </div>
  );
}
