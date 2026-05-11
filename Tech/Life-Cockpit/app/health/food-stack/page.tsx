"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import {
  foodStackBlocks,
  foodStackAllItems,
  foodStackPrimaryKPIs,
  foodStackSecondaryKPIs,
  type KPITarget,
} from "@/lib/seed/health/food-stack";
import { cn } from "@/lib/utils";

interface DayState {
  checks: Record<string, boolean>;
  kpis: Record<string, number>;
}

const todayKey = () => new Date().toLocaleDateString("en-CA");
const storageKey = (date: string) => `food-stack:${date}`;

function emptyDayState(): DayState {
  return { checks: {}, kpis: {} };
}

function loadState(date: string): DayState {
  if (typeof window === "undefined") return emptyDayState();
  try {
    const raw = window.localStorage.getItem(storageKey(date));
    if (!raw) return emptyDayState();
    const parsed = JSON.parse(raw);
    return {
      checks: parsed.checks ?? {},
      kpis: parsed.kpis ?? {},
    };
  } catch {
    return emptyDayState();
  }
}

function saveState(date: string, state: DayState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(date), JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function kpiHit(kpi: KPITarget, value: number): boolean {
  if (kpi.inverse) return value <= kpi.target;
  return value >= kpi.target;
}

function isItemHit(state: DayState, itemId: string): boolean {
  return !!state.checks[itemId];
}

function dayCompletionPct(state: DayState): number {
  const itemTotal = foodStackAllItems.length;
  const kpiTotal = foodStackPrimaryKPIs.length;
  const itemsHit = foodStackAllItems.filter((i) => isItemHit(state, i.id)).length;
  const kpisHit = foodStackPrimaryKPIs.filter((k) => kpiHit(k, state.kpis[k.id] ?? 0)).length;
  const total = itemTotal + kpiTotal;
  return total ? (itemsHit + kpisHit) / total : 0;
}

function loadLast7(): { date: string; pct: number }[] {
  if (typeof window === "undefined") return [];
  const out: { date: string; pct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA");
    out.push({ date: key, pct: dayCompletionPct(loadState(key)) });
  }
  return out;
}

export default function FoodStackPage() {
  const [hydrated, setHydrated] = useState(false);
  const [date, setDate] = useState<string>(todayKey());
  const [state, setState] = useState<DayState>(emptyDayState());
  const [last7, setLast7] = useState<{ date: string; pct: number }[]>([]);

  useEffect(() => {
    setHydrated(true);
    const t = todayKey();
    setDate(t);
    setState(loadState(t));
    setLast7(loadLast7());
  }, []);

  useEffect(() => {
    if (hydrated) saveState(date, state);
  }, [date, state, hydrated]);

  const itemsHit = foodStackAllItems.filter((i) => isItemHit(state, i.id)).length;
  const itemsTotal = foodStackAllItems.length;
  const kpisHit = foodStackPrimaryKPIs.filter((k) => kpiHit(k, state.kpis[k.id] ?? 0)).length;
  const totalHit = itemsHit + kpisHit;
  const totalSlots = itemsTotal + foodStackPrimaryKPIs.length;
  const pct = totalSlots ? Math.round((totalHit / totalSlots) * 100) : 0;
  const remaining = totalSlots - totalHit;

  const last7Avg = useMemo(
    () => Math.round((last7.reduce((s, d) => s + d.pct, 0) / Math.max(1, last7.length)) * 100),
    [last7]
  );

  const toggleItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      checks: { ...prev.checks, [id]: !prev.checks[id] },
    }));
  };

  const setKpi = (id: string, raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setState((prev) => {
      const next = { ...prev.kpis };
      if (value === undefined) delete next[id];
      else next[id] = value;
      return { ...prev, kpis: next };
    });
  };

  const resetDay = () => setState(emptyDayState());

  const status: "green" | "amber" | "red" = pct >= 90 ? "green" : pct >= 65 ? "amber" : "red";
  const touchedCount = Object.keys(state.checks).length + Object.keys(state.kpis).length;
  const decision = !hydrated
    ? "Loading today's checklist…"
    : touchedCount === 0
      ? "Fresh day — start with the AM self-care block, then Superbowl + supplements at 12:00."
      : remaining === 0
        ? "Perfect day hit. Lock it in."
        : `${remaining} item${remaining === 1 ? "" : "s"} left — next: ${nextItemToHit(state)}.`;

  return (
    <ModuleShell pillarId="health" moduleSlug="food-stack" decision={decision}>
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Today" value={`${totalHit}/${totalSlots}`} status={status} delta={`${pct}% complete`} big />
        <StatCard label="Items left" value={remaining} status={remaining === 0 ? "green" : "amber"} />
        <StatCard label="Date" value={date.slice(5)} caption={new Date(date).toLocaleDateString("en-GB", { weekday: "long" })} />
        <StatCard label="7-day avg" value={`${last7Avg}%`} caption="Rolling completion" />
      </div>

      {/* Primary KPIs — numeric inputs */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Daily macros</p>
          <p className="text-[10px] text-muted-foreground">Targets from your Food Stack tab</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {foodStackPrimaryKPIs.map((k) => {
            const value = state.kpis[k.id] ?? 0;
            const hit = kpiHit(k, value);
            const targetPct = Math.min(100, (value / k.target) * 100);
            return (
              <div key={k.id} className={cn("rounded-md border p-3", hit ? "border-emerald-300 bg-emerald-50" : "border-border bg-card")}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={state.kpis[k.id] ?? ""}
                    onChange={(e) => setKpi(k.id, e.target.value)}
                    placeholder="0"
                    aria-label={`${k.label} (${k.unit})`}
                    className="w-20 text-2xl font-bold tabular-nums bg-transparent border-b border-border focus:outline-none focus:border-emerald-500 px-0 py-0.5"
                  />
                  <span className="text-xs text-muted-foreground">/ {k.target} {k.unit}</span>
                </div>
                <div className="h-1.5 bg-muted rounded mt-2">
                  <div
                    className={cn("h-full rounded", hit ? "bg-emerald-500" : targetPct > 0 ? "bg-amber-400" : "bg-muted")}
                    style={{ width: `${targetPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary KPIs — reference only */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
            {foodStackSecondaryKPIs.map((k) => (
              <span key={k.id}>
                <span className="font-medium text-foreground">{k.label}:</span>{" "}
                {k.inverse ? `< ${k.target} ${k.unit}` : `${k.target} ${k.unit}`}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Last 7 days strip */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last 7 days</p>
          <button
            type="button"
            onClick={resetDay}
            className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Reset today
          </button>
        </div>
        <div className="flex gap-1.5">
          {last7.map((d) => {
            const isToday = d.date === todayKey();
            const colorClass =
              d.pct >= 0.9 ? "bg-emerald-500" : d.pct >= 0.65 ? "bg-amber-500" : d.pct > 0 ? "bg-red-400" : "bg-muted";
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className={cn("w-full h-12 rounded relative overflow-hidden", isToday && "ring-2 ring-emerald-600 ring-offset-1")}>
                  <div className="absolute inset-0 bg-muted" />
                  <div className={cn("absolute bottom-0 left-0 right-0", colorClass)} style={{ height: `${Math.max(d.pct * 100, 4)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.date.slice(8)}</span>
              </div>
            );
          })}
        </div>
        {hydrated && last7.length > 0 && last7.every((d) => d.pct === 0) && (
          <p className="text-[11px] text-muted-foreground mt-2">Your last 7 days will fill in as you go.</p>
        )}
      </Card>

      {/* Time-blocked checklist */}
      <div className="space-y-4">
        {foodStackBlocks.map((block) => {
          const blockHits = block.items.filter((i) => isItemHit(state, i.id)).length;
          const allHit = blockHits === block.items.length;
          return (
            <Card key={block.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-xs font-semibold tabular-nums", allHit ? "text-emerald-600" : "text-muted-foreground")}>
                    {block.time}
                  </span>
                  <h3 className="text-sm font-semibold">{block.title}</h3>
                </div>
                <span className="text-[11px] text-muted-foreground">{blockHits}/{block.items.length}</span>
              </div>
              <ul className="space-y-2">
                {block.items.map((item) => {
                  const hit = isItemHit(state, item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-pressed={hit}
                        className={cn(
                          "w-full flex items-start gap-3 rounded-md border p-3 text-left transition-colors min-h-[52px]",
                          hit ? "border-emerald-300 bg-emerald-50" : "border-border bg-card hover:bg-accent active:bg-accent"
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 mt-0.5 inline-flex items-center justify-center h-6 w-6 rounded-md border",
                            hit ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-background"
                          )}
                        >
                          {hit && <Check className="h-4 w-4" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block text-sm font-medium", hit && "line-through text-muted-foreground")}>{item.label}</span>
                          {item.detail && <span className="block text-[11px] text-muted-foreground">{item.detail}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Sourced from your Food Stack tab in the Health Sheet (last sync 2026-05-11). Daily state stored locally per device; Phase 2 syncs via Supabase and feeds into Body Composition + Biological Age.
      </p>
    </ModuleShell>
  );
}

function nextItemToHit(state: DayState): string {
  for (const block of foodStackBlocks) {
    for (const item of block.items) {
      if (!state.checks[item.id]) {
        return `${block.time} · ${item.label}`;
      }
    }
  }
  for (const kpi of foodStackPrimaryKPIs) {
    if (!kpiHit(kpi, state.kpis[kpi.id] ?? 0)) {
      return `${kpi.label} (${state.kpis[kpi.id] ?? 0} / ${kpi.target} ${kpi.unit})`;
    }
  }
  return "all hit";
}
