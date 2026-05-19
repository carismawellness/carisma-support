import { ZohoBooksClient } from "./zoho-client";
import { upsert, select } from "./supabase-etl";
import { fetchTransactionLines, TxnLine } from "./zoho-line-extractor";
import {
  COA_MAP,
  LOCATION_MAP,
  detectLocation,
  detectLineFromName,
  loadSpaCoaFromSupabase,
} from "./spa-ebitda";

// Per-line, tag-aware EBITDA ETL for the SPA Zoho org.
//
// Replaces the broken reports/profitandloss?tag_option_id=X pipeline: Zoho EU
// silently ignores that filter, so the old ETL could never read true HQ vs venue
// allocations. This module pulls every invoice / bill / expense / creditnote /
// vendorcredit / journal line, applies the per-line reporting tag for primary
// allocation, and falls back to the CoA split rule only for untagged lines.
//
// Writes monthly aggregates to `spa_ebitda_monthly` (venues 1–8) and
// `hq_ebitda_monthly` (HQ totals). All rent / wages / laundry / salary-supplement
// fallback behaviour from the previous runSpaEbitdaMonth is preserved verbatim.

// ── Tag option name → internal slug ─────────────────────────────────────────
// Source: discovered from Zoho on 2026-05-20 — "Cost Centre- Spas" tag group.
// "Unallocated" intentionally maps to null so it's treated as untagged.

const TAG_NAME_TO_SLUG: Record<string, string | null> = {
  excelsior:    "excelsior",
  hq:           "hq",
  hugos:        "hugos",
  hyatt:        "hyatt",
  inter:        "intercontinental",
  labranda:     "labranda",
  novotel:      "novotel",
  ramla:        "ramla",
  "sunny coast": "sunny_coast",
  unallocated:  null,
};

const VENUE_SLUGS = [
  "intercontinental", "hugos", "hyatt", "ramla",
  "labranda", "sunny_coast", "excelsior", "novotel",
] as const;
type VenueSlug = (typeof VENUE_SLUGS)[number];
const ALL_LOCATION_IDS = Object.values(LOCATION_MAP);

const VALID_LINES = new Set(["revenue", "cogs", "wages", "advertising", "rent", "utilities", "sga"]);

// Direct salary accounts → location id (used as denominator for salary_cost splits)
const SALARY_RATIO_ACCOUNTS: Record<string, number> = {
  "30001":  1, "30002":  2, "30003":  3, "30005":  4,
  "30006":  5, "30004":  6, "602221": 7, "602222": 8,
};

const LAUNDRY_ACCOUNTS = new Set(["611514", "611520"]);

const BENCHMARK_RENT_MONTHLY: Record<number, number> = {
  1: 5100.00, 2: 1000.00, 3: 1407.00, 4: 1000.00,
  5: 1000.00, 6:  944.44, 7: 2500.00, 8:    0.00,
};

const SUPP_SLUG_TO_LOC: Record<string, number> = {
  inter:     1, hugos:     2, hyatt:     3, ramla:     4,
  labranda:  5, odycy:     6, excelsior: 7, novotel:   8,
};

const UI_KEY_TO_LOC: Record<string, string> = {
  inter:     "intercontinental",
  hugos:     "hugos",
  hyatt:     "hyatt",
  ramla:     "ramla",
  labranda:  "labranda",
  odycy:     "sunny_coast",
  excelsior: "excelsior",
  novotel:   "novotel",
  hq:        "hq",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

type LocMap = Record<number, number>;
function emptyLocTotals(): LocMap {
  return Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, 0]));
}

type LineTotals = Record<string, number>;
function emptyLineTotals(): LineTotals {
  return { revenue: 0, cogs: 0, wages: 0, advertising: 0, rent: 0, utilities: 0, sga: 0 };
}

function daysInMonth(year: number, month: number): number { return new Date(year, month, 0).getDate(); }
function prevMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

function tagsToSlug(tags: TxnLine["tags"]): string | null {
  for (const t of tags) {
    const norm = normalizeTagName(t.tag_option_name);
    if (norm in TAG_NAME_TO_SLUG) return TAG_NAME_TO_SLUG[norm];
  }
  return null;
}

function distribute(
  rule: string,
  amount: number,
  locRevenue: LocMap, totalRevenue: number,
  locSalary: LocMap,  totalSalary: number,
): LocMap {
  if (rule in LOCATION_MAP) {
    const res = emptyLocTotals();
    res[LOCATION_MAP[rule]] = amount;
    return res;
  }
  if (rule === "equal") {
    return Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, amount / ALL_LOCATION_IDS.length]));
  }
  if (rule === "sales_ratio") {
    const denom = totalRevenue || 1;
    return Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, amount * (locRevenue[id] ?? 0) / denom]));
  }
  if (rule === "salary_cost") {
    const denom = totalSalary || 1;
    return Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, amount * (locSalary[id] ?? 0) / denom]));
  }
  if (rule.startsWith("custom:")) {
    const config: Record<string, number> = JSON.parse(rule.slice(7));
    const res = emptyLocTotals();
    const totalPct = Object.values(config).reduce((a, b) => a + b, 0) || 100;
    for (const [uiKey, pct] of Object.entries(config)) {
      const locKey = UI_KEY_TO_LOC[uiKey];
      if (locKey && locKey in LOCATION_MAP) {
        res[LOCATION_MAP[locKey]] += amount * (pct / totalPct);
      }
    }
    return res;
  }
  return Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, amount / ALL_LOCATION_IDS.length]));
}

async function monthAlreadySynced(monthKey: string): Promise<boolean> {
  try {
    const rows = await select("spa_ebitda_monthly", { month: monthKey });
    return rows.length > 0;
  } catch { return false; }
}

// ── Core month runner ────────────────────────────────────────────────────────

export type SpaRunResult = {
  spaRowsUpserted: number;
  hqRowsUpserted:  number;
  log:             string[];
};

export async function runSpaEbitdaMonthFromTransactions(
  client: ZohoBooksClient,
  year: number,
  month: number,
  opts: {
    force?:            boolean;
    coaMap?:           Record<string, [string, string]>;
    fromDateOverride?: string;
    toDateOverride?:   string;
    preLoadedLines?:   TxnLine[];  // for multi-month runs that share one pull
  } = {},
): Promise<SpaRunResult> {
  const log: string[] = [];
  const monthDays = daysInMonth(year, month);
  const fromDate  = opts.fromDateOverride ?? `${year}-${String(month).padStart(2, "0")}-01`;
  const toDate    = opts.toDateOverride   ?? `${year}-${String(month).padStart(2, "0")}-${String(monthDays).padStart(2, "0")}`;
  const monthKey  = `${year}-${String(month).padStart(2, "0")}-01`;

  const fromD = new Date(fromDate);
  const toD   = new Date(toDate);
  const periodDays = Math.round((toD.getTime() - fromD.getTime()) / 86400000) + 1;

  if (!opts.force && await monthAlreadySynced(monthKey)) {
    log.push(`${monthKey}: cached — skipping`);
    return { spaRowsUpserted: 0, hqRowsUpserted: 0, log };
  }

  // ── 1. Pull all transaction lines for the period ─────────────────────────
  let lines: TxnLine[];
  if (opts.preLoadedLines) {
    lines = opts.preLoadedLines.filter(l => l.date >= fromDate && l.date <= toDate);
    log.push(`${monthKey}: using ${lines.length} pre-loaded line(s) in window`);
  } else {
    log.push(`${monthKey}: pulling transactions from Zoho (${fromDate}..${toDate})…`);
    const pull = await fetchTransactionLines(client, fromDate, toDate);
    log.push(...pull.log.map(s => `  ${s}`));
    lines = pull.lines.filter(l => l.date >= fromDate && l.date <= toDate);
  }
  if (!lines.length) {
    log.push(`${monthKey}: no transaction lines in window`);
    return { spaRowsUpserted: 0, hqRowsUpserted: 0, log };
  }

  const coaMap = opts.coaMap ?? (await loadSpaCoaFromSupabase()) ?? COA_MAP;

  // ── 2. Per-line CoA lookup + EBITDA line + initial classification ────────
  type Classified = {
    line:    string;             // EBITDA line: revenue/cogs/wages/...
    rule:    string;             // CoA split rule (e.g. "sales_ratio", "hugos", "equal")
    tagSlug: string | null;      // direct allocation slug from line tag (hq or one of 8 venues) — wins over rule
    code:    string;
    amount:  number;
    section: TxnLine["section"];
  };

  const classified: Classified[] = [];
  let droppedUnmapped = 0, droppedExcluded = 0, droppedZero = 0;
  for (const ln of lines) {
    if (ln.amount === 0) { droppedZero++; continue; }

    let rule: string, line: string;
    if (ln.account_code && ln.account_code in coaMap) {
      [rule, line] = coaMap[ln.account_code];
    } else if (ln.section === "income") {
      rule = "sales_ratio"; line = "revenue";
    } else {
      rule = "equal"; line = detectLineFromName(ln.account_name, ln.section);
    }
    if (line.startsWith("sga_")) line = "sga";
    if (line === "excluded") { droppedExcluded++; continue; }
    if (!VALID_LINES.has(line)) { droppedExcluded++; continue; }

    const tagSlug = tagsToSlug(ln.tags);
    // Name-based override (e.g. "Rent - Hugo's Hotels" without a tag) — applies
    // only when the line itself has no usable tag.
    const nameLoc = tagSlug ? null : detectLocation(ln.account_name);

    classified.push({
      line,
      rule:    nameLoc ?? rule,
      tagSlug,
      code:    ln.account_code,
      amount:  ln.amount,
      section: ln.section,
    });
  }

  if (droppedUnmapped || droppedExcluded || droppedZero) {
    log.push(`${monthKey}: classify: ${classified.length} kept; dropped ${droppedExcluded} excluded, ${droppedZero} zero`);
  }

  // ── 3. Bases for sales_ratio / salary_cost splits ────────────────────────
  // Revenue base: any classified revenue line allocated to a direct venue (tag
  // OR rule). HQ revenue is excluded from the SPA venue ratio (it has its own
  // bucket).
  const locRevenue = emptyLocTotals();
  for (const c of classified) {
    if (c.line !== "revenue") continue;
    let slug: string | null = null;
    if (c.tagSlug && c.tagSlug !== "hq") slug = c.tagSlug;
    else if (c.tagSlug === "hq") continue;  // HQ revenue not in venue base
    else if (c.rule in LOCATION_MAP) slug = c.rule;
    if (slug && slug in LOCATION_MAP) locRevenue[LOCATION_MAP[slug]] += c.amount;
  }
  const totalRevenue = Math.max(Object.values(locRevenue).reduce((a, b) => a + b, 0), 1);

  // Salary base: sum of the 8 direct salary accounts.
  const locSalary = emptyLocTotals();
  for (const c of classified) {
    if (c.code in SALARY_RATIO_ACCOUNTS) {
      locSalary[SALARY_RATIO_ACCOUNTS[c.code]] += c.amount;
    }
  }
  const totalSalary = Math.max(Object.values(locSalary).reduce((a, b) => a + b, 0), 1);

  // ── 4. Allocate every line: tag wins, otherwise CoA rule ─────────────────
  const venueTotals: Record<number, LineTotals> = {};
  for (const id of ALL_LOCATION_IDS) venueTotals[id] = emptyLineTotals();
  const hqTotals: LineTotals = emptyLineTotals();
  const laundryTotals = emptyLocTotals();

  for (const c of classified) {
    // Tag-driven allocation
    if (c.tagSlug === "hq") {
      hqTotals[c.line] += c.amount;
      if (LAUNDRY_ACCOUNTS.has(c.code)) {
        // Laundry tracking is venue-only (no HQ laundry column). Skip.
      }
      continue;
    }
    if (c.tagSlug && c.tagSlug in LOCATION_MAP) {
      venueTotals[LOCATION_MAP[c.tagSlug]][c.line] += c.amount;
      if (LAUNDRY_ACCOUNTS.has(c.code)) laundryTotals[LOCATION_MAP[c.tagSlug]] += c.amount;
      continue;
    }

    // No usable tag → apply rule
    if (c.rule === "hq") {
      hqTotals[c.line] += c.amount;
      continue;
    }
    const dist = distribute(c.rule, c.amount, locRevenue, totalRevenue, locSalary, totalSalary);
    for (const [locId, share] of Object.entries(dist)) {
      const id = Number(locId);
      venueTotals[id][c.line] += share;
      if (LAUNDRY_ACCOUNTS.has(c.code)) laundryTotals[id] += share;
    }
  }

  // ── 5. Wages fallback (prorate from previous month if abnormally low) ────
  const WAGE_ZERO_THRESHOLD = 100;
  const WAGE_LOW_FRACTION   = 0.35;
  const totalZohoWages = ALL_LOCATION_IDS.reduce((s, id) => s + venueTotals[id].wages, 0);
  const [prevY, prevM] = prevMonth(year, month);
  const prevKey  = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const prevDays = daysInMonth(prevY, prevM);

  try {
    const prevEbitda   = await select("spa_ebitda_monthly", { month: prevKey });
    const prevSuppRows = await select("salary_supplement_monthly", { month: prevKey, is_frozen: "true" });

    const prevSuppByLoc: Record<number, number> = Object.fromEntries(ALL_LOCATION_IDS.map(id => [id, 0]));
    let centrePrev = 0;
    for (const sr of prevSuppRows) {
      const slug = sr.spa_slug as string;
      const amt  = Number(sr.amount ?? 0);
      if (slug in SUPP_SLUG_TO_LOC) prevSuppByLoc[SUPP_SLUG_TO_LOC[slug]] += amt;
      else if (slug === "hq") centrePrev += amt;
    }
    if (centrePrev > 0 && totalSalary > 0) {
      for (const id of ALL_LOCATION_IDS) prevSuppByLoc[id] += centrePrev * locSalary[id] / totalSalary;
    } else if (centrePrev > 0) {
      for (const id of ALL_LOCATION_IDS) prevSuppByLoc[id] += centrePrev / ALL_LOCATION_IDS.length;
    }

    const prevZohoWagesByLoc: Record<number, number> = {};
    let prevTotalZohoWages = 0;
    for (const pr of prevEbitda) {
      const locId = Number(pr.location_id);
      if (locId in venueTotals) {
        const w = Math.max(0, Number(pr.wages ?? 0) - (prevSuppByLoc[locId] ?? 0));
        prevZohoWagesByLoc[locId] = w;
        prevTotalZohoWages += w;
      }
    }

    const useFallback =
      totalZohoWages < WAGE_ZERO_THRESHOLD ||
      (prevTotalZohoWages > 0 && totalZohoWages < prevTotalZohoWages * WAGE_LOW_FRACTION);

    if (useFallback && prevEbitda.length) {
      for (const id of ALL_LOCATION_IDS) {
        const w = prevZohoWagesByLoc[id] ?? 0;
        venueTotals[id].wages = (w / prevDays) * periodDays;
      }
      log.push(`Wages fallback: Zoho €${totalZohoWages.toFixed(0)} < ${WAGE_LOW_FRACTION * 100}% of ${prevKey} €${prevTotalZohoWages.toFixed(0)} — using ${prevKey} prorated ${periodDays}/${prevDays} days`);
    }
  } catch (e) {
    log.push(`Warning: wage fallback failed: ${e}`);
  }

  // ── 6. Rent fallback (previous month → benchmark → proration) ─────────────
  const RENT_ZERO_THRESHOLD = 1;
  const prevRentByLoc: Record<number, number> = {};
  try {
    const prevRows = await select("spa_ebitda_monthly", { month: prevKey });
    for (const pr of prevRows) {
      const locId = Number(pr.location_id);
      if (locId in venueTotals) prevRentByLoc[locId] = Number(pr.rent ?? 0);
    }
  } catch (e) {
    log.push(`Warning: could not load previous month rent: ${e}`);
  }

  let rentFallbackCount = 0, rentBenchmarkCount = 0;
  for (const id of ALL_LOCATION_IDS) {
    const currentRent = venueTotals[id].rent;
    const prevRent    = prevRentByLoc[id] ?? 0;
    const benchmark   = BENCHMARK_RENT_MONTHLY[id] ?? 0;
    if (currentRent < RENT_ZERO_THRESHOLD && prevRent > 0) {
      venueTotals[id].rent = (prevRent / prevDays) * periodDays;
      rentFallbackCount++;
    } else if (currentRent < RENT_ZERO_THRESHOLD && prevRent <= 0 && benchmark > 0) {
      venueTotals[id].rent = (benchmark / monthDays) * periodDays;
      rentBenchmarkCount++;
    } else if (currentRent >= RENT_ZERO_THRESHOLD && periodDays < monthDays) {
      venueTotals[id].rent = (currentRent / monthDays) * periodDays;
    }
  }
  if (rentFallbackCount)  log.push(`Rent fallback: ${rentFallbackCount} locations used ${prevKey} prorated`);
  if (rentBenchmarkCount) log.push(`Rent benchmark: ${rentBenchmarkCount} locations used hardcoded benchmark`);

  // ── 7. Laundry fallback ───────────────────────────────────────────────────
  const LAUNDRY_ZERO_THRESHOLD = 10;
  const LAUNDRY_LOW_FRACTION   = 0.35;
  const totalZohoLaundry = Object.values(laundryTotals).reduce((a, b) => a + b, 0);
  try {
    const prevLaundryRows = await select("spa_ebitda_monthly", { month: prevKey });
    const prevLaundryByLoc: Record<number, number> = {};
    let prevTotalLaundry = 0;
    for (const pr of prevLaundryRows) {
      const locId = Number(pr.location_id);
      if (locId in venueTotals) {
        const l = Number(pr.laundry ?? 0);
        prevLaundryByLoc[locId] = l;
        prevTotalLaundry += l;
      }
    }
    const useLaundryFallback =
      totalZohoLaundry < LAUNDRY_ZERO_THRESHOLD ||
      (prevTotalLaundry > 0 && totalZohoLaundry < prevTotalLaundry * LAUNDRY_LOW_FRACTION);

    if (useLaundryFallback && prevTotalLaundry > 0) {
      for (const id of ALL_LOCATION_IDS) {
        const fallbackL = (prevLaundryByLoc[id] ?? 0) / prevDays * periodDays;
        const delta     = fallbackL - laundryTotals[id];
        venueTotals[id].sga += delta;
        laundryTotals[id] = fallbackL;
      }
      log.push(`Laundry fallback: Zoho €${totalZohoLaundry.toFixed(0)} < ${LAUNDRY_LOW_FRACTION * 100}% of ${prevKey} — using ${prevKey} prorated`);
    }
  } catch (e) {
    log.push(`Warning: laundry fallback failed: ${e}`);
  }

  // ── 8. Salary supplement (frozen monthly entries → wages) ────────────────
  try {
    let suppRows = await select("salary_supplement_monthly", { month: monthKey, is_frozen: "true" });
    let suppDays = monthDays;
    if (!suppRows.length) {
      const pk = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
      suppRows = await select("salary_supplement_monthly", { month: pk, is_frozen: "true" });
      suppDays = daysInMonth(prevY, prevM);
      if (suppRows.length) log.push(`Supplement: no frozen data for ${monthKey}, using ${pk}`);
    }
    if (suppRows.length) {
      let centreSupplement = 0;
      let assignedCount    = 0;
      for (const sr of suppRows) {
        const slug = sr.spa_slug as string;
        if (!slug) continue;
        const prorated = Number(sr.amount ?? 0) / suppDays * periodDays;
        if (slug in SUPP_SLUG_TO_LOC) {
          venueTotals[SUPP_SLUG_TO_LOC[slug]].wages += prorated;
          assignedCount++;
        } else if (slug === "hq") {
          centreSupplement += prorated;
          assignedCount++;
        }
      }
      if (centreSupplement > 0 && totalSalary > 0) {
        for (const id of ALL_LOCATION_IDS) {
          venueTotals[id].wages += centreSupplement * locSalary[id] / totalSalary;
        }
      } else if (centreSupplement > 0) {
        for (const id of ALL_LOCATION_IDS) {
          venueTotals[id].wages += centreSupplement / ALL_LOCATION_IDS.length;
        }
      }
      log.push(`Supplement: ${assignedCount} rows added to wages (${periodDays}/${suppDays} day proration)`);
    }
  } catch (e) {
    log.push(`Warning: could not load salary supplement: ${e}`);
  }

  // ── 9. Upsert SPA venue rows + HQ row ────────────────────────────────────
  const nowTs = new Date().toISOString();
  const spaRows = ALL_LOCATION_IDS.map(id => {
    const d = venueTotals[id];
    return {
      month:          monthKey,
      location_id:    id,
      revenue:        +d.revenue.toFixed(2),
      cogs:           +d.cogs.toFixed(2),
      wages:          +d.wages.toFixed(2),
      advertising:    +d.advertising.toFixed(2),
      rent:           +d.rent.toFixed(2),
      utilities:      +d.utilities.toFixed(2),
      sga:            +d.sga.toFixed(2),
      laundry:        +(laundryTotals[id] ?? 0).toFixed(2),
      total:          +(d.revenue - d.cogs - d.wages - d.advertising - d.rent - d.utilities - d.sga).toFixed(2),
      zoho_synced_at: nowTs,
    };
  });

  const spaCount = await upsert("spa_ebitda_monthly", spaRows as Record<string, unknown>[], "month,location_id");

  const hqRow = {
    month:          monthKey,
    source:         "spa",
    revenue:        +hqTotals.revenue.toFixed(2),
    cogs:           +hqTotals.cogs.toFixed(2),
    wages:          +hqTotals.wages.toFixed(2),
    advertising:    +hqTotals.advertising.toFixed(2),
    rent:           +hqTotals.rent.toFixed(2),
    utilities:      +hqTotals.utilities.toFixed(2),
    sga:            +hqTotals.sga.toFixed(2),
    zoho_synced_at: nowTs,
  };
  const hqCount = await upsert("hq_ebitda_monthly", [hqRow as Record<string, unknown>], "month,source");

  log.push(`${monthKey}: ${spaCount} spa rows + ${hqCount} hq row(s) upserted`);
  return { spaRowsUpserted: spaCount, hqRowsUpserted: hqCount, log };
}
