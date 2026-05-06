"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ModuleShell } from "@/components/dashboard/module-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card } from "@/components/ui/card";
import {
  foodStackSeed,
  foodStackCategories,
  type FoodItem,
} from "@/lib/seed/health/food-stack";
import { cn } from "@/lib/utils";

type CheckState = Record<string, { checked: boolean; numericValue?: number }>;

const todayKey = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
const storageKey = (date: string) => `food-stack:${date}`;

function loadState(date: string): CheckState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(date));
    return raw ? (JSON.parse(raw) as CheckState) : {};
  } catch {
    return {};
  }
}

function saveState(date: string, state: CheckState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(date), JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function isHit(item: FoodItem, entry?: CheckState[string]): boolean {
  if (!entry) return false;
  if (item.target) {
    return (entry.numericValue ?? 0) >= item.target.value;
  }
  return !!entry.checked;
}

/** Last 7 days completion (excluding today) — for the streak/heatmap header. */
function loadLast7(): { date: string; pct: number }[] {
  if (typeof window === "undefined") return [];
  const out: { date: string; pct: number }[] = [];
  const total = foodStackSeed.length;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-CA");
    const state = loadState(key);
    const hits = foodStackSeed.filter((item) => isHit(item, state[item.id])).length;
    out.push({ date: key, pct: total ? hits / total : 0 });
  }
  return out;
}

export default function FoodStackPage() {
  const [hydrated, setHydrated] = useState(false);
  const [date, setDate] = useState<string>(todayKey());
  const [state, setState] = useState<CheckState>({});
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

  const itemsByCat = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    for (const item of foodStackSeed) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, []);

  const total = foodStackSeed.length;
  const hits = foodStackSeed.filter((i) => isHit(i, state[i.id])).length;
  const pct = total ? Math.round((hits / total) * 100) : 0;
  const remaining = total - hits;

  const toggle = (id: string) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), checked: !(prev[id]?.checked ?? false) },
    }));
  };

  const setNumeric = (id: string, raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), numericValue: value },
    }));
  };

  const resetDay = () => setState({});

  const status = pct >= 90 ? "green" : pct >= 65 ? "amber" : "red";
  const touchedCount = Object.keys(state).length;
  const decision = !hydrated
    ? "Loading today's checklist…"
    : touchedCount === 0
      ? "Fresh day — start with greens at breakfast and one fermented item."
      : remaining === 0
        ? "All boxes hit today — full plate, lock it in."
        : `${remaining} item${remaining === 1 ? "" : "s"} left — pick one before the next meal.`;

  return (
    <ModuleShell pillarId="health" moduleSlug="food-stack" decision={decision}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Today" value={`${hits}/${total}`} status={status} delta={`${pct}% complete`} big />
        <StatCard label="Remaining" value={remaining} status={remaining === 0 ? "green" : "amber"} />
        <StatCard label="Date" value={date.slice(5)} caption={new Date(date).toLocaleDateString("en-GB", { weekday: "long" })} />
        <StatCard label="7-day avg" value={`${Math.round((last7.reduce((s, d) => s + d.pct, 0) / Math.max(1, last7.length)) * 100)}%`} caption="Rolling completion" />
      </div>

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

      {/* Checklist by category */}
      <div className="space-y-4">
        {foodStackCategories.map((cat) => {
          const items = itemsByCat.get(cat) ?? [];
          if (items.length === 0) return null;
          const catHits = items.filter((i) => isHit(i, state[i.id])).length;
          return (
            <Card key={cat} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{cat}</h3>
                <span className="text-[11px] text-muted-foreground">{catHits}/{items.length}</span>
              </div>
              <ul className="space-y-2">
                {items.map((item) => {
                  const entry = state[item.id];
                  const hit = isHit(item, entry);
                  if (item.target) {
                    const value = entry?.numericValue ?? 0;
                    const targetPct = Math.min(100, (value / item.target.value) * 100);
                    return (
                      <li key={item.id} className="rounded-md border border-border bg-card p-3">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{item.label}</p>
                            {item.detail && <p className="text-[11px] text-muted-foreground">{item.detail}</p>}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              value={entry?.numericValue ?? ""}
                              onChange={(e) => setNumeric(item.id, e.target.value)}
                              placeholder="0"
                              className="w-20 text-right text-base font-semibold tabular-nums bg-transparent border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              aria-label={`${item.label} (${item.target.unit})`}
                            />
                            <span className="text-xs text-muted-foreground">/ {item.target.value} {item.target.unit}</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded mt-3">
                          <div
                            className={cn("h-full rounded", hit ? "bg-emerald-500" : targetPct > 0 ? "bg-amber-400" : "bg-muted")}
                            style={{ width: `${targetPct}%` }}
                          />
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-pressed={hit}
                        className={cn(
                          "w-full flex items-start gap-3 rounded-md border p-3 text-left transition-colors min-h-[52px]",
                          hit
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-border bg-card hover:bg-accent active:bg-accent"
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
        Daily state stored locally in this browser (per device). Phase 2 will sync via Supabase across devices and feed Body Composition + Biological Age trends.
      </p>
    </ModuleShell>
  );
}
