import { createServerSupabaseClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface KPITarget {
  department: string;
  metric_name: string;
  target_value: number;
  comparison: "lt" | "gt" | "eq" | "between";
  brand_id: number | null;
  is_active: boolean;
}

/* ------------------------------------------------------------------ */
/* Server-side loaders (call from API routes / server components)      */
/* ------------------------------------------------------------------ */

/** Fetch all active KPI targets from the `kpi_targets` table. */
export async function loadTargets(): Promise<KPITarget[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("kpi_targets")
    .select("department, metric_name, target_value, comparison, brand_id, is_active")
    .eq("is_active", true);

  if (error) {
    console.error("[lookups] loadTargets error:", error.message);
    return [];
  }
  return (data as KPITarget[]) || [];
}

/**
 * Find the numeric target for a metric.
 * Tries brand-specific first, falls back to global (brand_id IS NULL).
 */
export function getTarget(
  targets: KPITarget[],
  metric: string,
  brandId?: number,
): number | undefined {
  if (brandId !== undefined) {
    const brandSpecific = targets.find(
      (t) => t.metric_name === metric && t.brand_id === brandId,
    );
    if (brandSpecific) return brandSpecific.target_value;
  }

  const global = targets.find(
    (t) => t.metric_name === metric && t.brand_id === null,
  );
  return global?.target_value;
}

/** Return the comparison direction for a metric. */
export function getTargetDirection(
  targets: KPITarget[],
  metric: string,
): KPITarget["comparison"] | undefined {
  const target = targets.find((t) => t.metric_name === metric);
  return target?.comparison;
}

/** Load brands table and return a slug -> id map. */
export async function loadBrands(): Promise<Record<string, number>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name");

  if (error) {
    console.error("[lookups] loadBrands error:", error.message);
    return {};
  }

  const map: Record<string, number> = {};
  for (const row of data || []) {
    map[row.slug as string] = row.id as number;
  }
  return map;
}

/** Load locations table and return an id -> name map. */
export async function loadLocations(): Promise<Record<number, string>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, name");

  if (error) {
    console.error("[lookups] loadLocations error:", error.message);
    return {};
  }

  const map: Record<number, string> = {};
  for (const row of data || []) {
    map[row.id as number] = row.name as string;
  }
  return map;
}

/** Format all targets into a human-readable string for LLM prompts. */
export function formatTargetsForPrompt(targets: KPITarget[]): string {
  if (targets.length === 0) return "No targets configured.";

  const lines = targets.map((t) => {
    const dirLabel =
      t.comparison === "lt"
        ? "<"
        : t.comparison === "gt"
          ? ">"
          : t.comparison === "eq"
            ? "="
            : "between";
    const brandLabel = t.brand_id ? `(brand_id=${t.brand_id})` : "(global)";
    return `${t.metric_name} ${brandLabel}: ${dirLabel} ${t.target_value}`;
  });

  return lines.join("\n");
}
