"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface HqEbitdaData {
  revenue: number;
  cogs: number;
  wages: number;
  advertising: number;
  rent: number;
  utilities: number;
  sga: number;
  ebitda: number;
  lastSyncedAt: string | null;
}

export interface UseHqEbitdaResult {
  data: HqEbitdaData;
  isFetching: boolean;
  isSyncing: boolean;
  syncError: string | null;
  missingMonths: string[];
  triggerSync: (force?: boolean) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthsInRange(dateFrom: Date, dateTo: Date): string[] {
  const months: string[] = [];
  const d   = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
  const end = new Date(dateTo.getFullYear(),   dateTo.getMonth(),   1);
  while (d <= end) {
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const EMPTY: HqEbitdaData = {
  revenue: 0, cogs: 0, wages: 0, advertising: 0,
  rent: 0, utilities: 0, sga: 0, ebitda: 0, lastSyncedAt: null,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHqEbitda(dateFrom: Date, dateTo: Date): UseHqEbitdaResult {
  const supabase     = createClient();

  const fromStr      = toDateStr(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1));
  const toStr        = toDateStr(new Date(dateTo.getFullYear(),   dateTo.getMonth(),   1));
  const allMonths    = monthsInRange(dateFrom, dateTo);

  // ── Fetch from hq_ebitda_monthly ──────────────────────────────────────────
  const { data: rows, isFetching } = useQuery({
    queryKey: ["hq-ebitda", fromStr, toStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hq_ebitda_monthly")
        .select("month, revenue, cogs, wages, advertising, rent, utilities, sga, zoho_synced_at")
        .gte("month", fromStr)
        .lte("month", toStr)
        .order("month");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 0,
  });

  // ── Missing months ────────────────────────────────────────────────────────
  type HqRow = {
    month: string; revenue: number; cogs: number; wages: number;
    advertising: number; rent: number; utilities: number; sga: number;
    zoho_synced_at: string | null;
  };

  const presentMonths = new Set((rows ?? []).map((r: HqRow) => r.month));
  const missingMonths = allMonths.filter(m => !presentMonths.has(m));

  // Sync is owned by useSpaEbitda: the /api/etl/zoho-spa-transactions route
  // writes BOTH spa_ebitda_monthly and hq_ebitda_monthly in a single call,
  // and the SPA hook invalidates the hq-ebitda query on success.
  // triggerSync here is a no-op to avoid double-firing the same ETL.

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const data = (rows ?? []).reduce<HqEbitdaData>((acc, row: HqRow) => {
    acc.revenue     += row.revenue     ?? 0;
    acc.cogs        += row.cogs        ?? 0;
    acc.wages       += row.wages       ?? 0;
    acc.advertising += row.advertising ?? 0;
    acc.rent        += row.rent        ?? 0;
    acc.utilities   += row.utilities   ?? 0;
    acc.sga         += row.sga         ?? 0;
    if (row.zoho_synced_at && (!acc.lastSyncedAt || row.zoho_synced_at > acc.lastSyncedAt)) {
      acc.lastSyncedAt = row.zoho_synced_at;
    }
    return acc;
  }, { ...EMPTY });

  const costs  = data.cogs + data.wages + data.advertising + data.rent + data.utilities + data.sga;
  data.ebitda  = Math.round(data.revenue - costs);
  data.revenue = Math.round(data.revenue);
  data.cogs    = Math.round(data.cogs);
  data.wages   = Math.round(data.wages);
  data.advertising = Math.round(data.advertising);
  data.rent    = Math.round(data.rent);
  data.utilities = Math.round(data.utilities);
  data.sga     = Math.round(data.sga);

  return {
    data: rows?.length ? data : EMPTY,
    isFetching,
    isSyncing:    false,
    syncError:    null,
    missingMonths,
    triggerSync:  () => { /* no-op: handled by useSpaEbitda */ },
  };
}
