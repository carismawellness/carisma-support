import { ZohoBooksClient } from "./zoho-client";
import { upsert, select } from "./supabase-etl";
import { fetchTransactionLines, TxnLine } from "./zoho-line-extractor";
import { loadAestheticsCoaMap } from "./aesthetics-ebitda";

// Per-line, tag-aware EBITDA ETL for the Aesthetics Zoho org (both
// Aesthetics and Slimming departments live in one org). Mirrors the SPA
// orchestrator: tag wins for allocation, then account-name keyword, then
// CoA split rule. Writes monthly rows (one per department) to
// `aesthetics_ebitda_monthly`.

const DEPTS = ["aesthetics", "slimming"] as const;
type Dept = (typeof DEPTS)[number];

// ── Tag option name → dept (Aesthetics org has two single-option groups) ────

const TAG_NAME_TO_DEPT: Record<string, Dept> = {
  "carisma aesthetics": "aesthetics",
  "carisma slimming":   "slimming",
  "aesthetics":         "aesthetics",
  "slimming":           "slimming",
};

// ── Department keyword detection (~90% of Aesthetics-org lines are untagged) ─

const DEPT_KEYWORDS: [string[], Dept][] = [
  [["aesthetics", "aesthetic", " aest ", "clinic"],  "aesthetics"],
  [["slimming", "slim ", "weight loss", "weight-loss"], "slimming"],
];

function detectDept(name: string): Dept | null {
  const low = ` ${name.toLowerCase()} `;
  for (const [keywords, dept] of DEPT_KEYWORDS) {
    if (keywords.some(kw => low.includes(kw))) return dept;
  }
  return null;
}

function tagsToDept(tags: TxnLine["tags"]): Dept | null {
  for (const t of tags) {
    const norm = t.tag_option_name.trim().toLowerCase();
    if (norm in TAG_NAME_TO_DEPT) return TAG_NAME_TO_DEPT[norm];
  }
  return null;
}

// "100% HQ" rule: custom_fixed with hq as the only non-zero key. Lines whose CoA
// rule matches this are routed to hq_ebitda_monthly (source='aesthetics') instead
// of being split between the aesthetics/slimming dept buckets.
function isHqOnlyRule(rule: string): boolean {
  if (!rule.startsWith("custom:")) return false;
  try {
    const cfg = JSON.parse(rule.slice(7)) as Record<string, number>;
    const nonZero = Object.keys(cfg).filter(k => Number(cfg[k]) > 0);
    return nonZero.length === 1 && nonZero[0] === "hq";
  } catch { return false; }
}

// ── Name-based EBITDA line detection (for accounts not in CoA mapping) ──────

function detectLine(name: string, section: string): string {
  const low = name.toLowerCase();
  if (section === "income") return "revenue";
  if (/salary|salaries|wage|overtime|bonus|national insurance|ni |payroll|sick pay/.test(low)) return "wages";
  if (/rent|lease/.test(low)) return "rent";
  if (/electric|water|internet|broadband|telephone|mobile|utility|wifi/.test(low)) return "utilities";
  if (/advertis|marketing|digital|social media|meta ads|google ads|influenc/.test(low)) return "advertising";
  if (section === "cogs" || section === "cost_of_goods_sold") return "cogs";
  return "sga";
}

// ── Benchmark rent ──────────────────────────────────────────────────────────

const BENCHMARK_RENT: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
const RENT_ZERO_THRESHOLD = 1;

function daysInMonth(year: number, month: number): number { return new Date(year, month, 0).getDate(); }
function prevMonth(year: number, month: number): [number, number] {
  return month === 1 ? [year - 1, 12] : [year, month - 1];
}

// ── Marketing spend ratio (Growth Sheet) ─────────────────────────────────────
// Same source/format as aesthetics-ebitda.ts. Inlined to avoid pulling in the
// old ETL's data-fetch path.

const GROWTH_SHEET_ID  = "1JGlBdii7Zu25yha0zrmi72PPH1BFZRdVeGvcig3r6GE";
const GROWTH_SHEET_GID = "335421089";

async function loadMarketingRatio(fromDate: string, toDate: string): Promise<Record<Dept, number>> {
  const equal = { aesthetics: 0.5, slimming: 0.5 };
  try {
    const sheetId  = process.env.GROWTH_SHEET_ID  ?? GROWTH_SHEET_ID;
    const sheetGid = process.env.GROWTH_SHEET_GID ?? GROWTH_SHEET_GID;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return equal;
    const text = await resp.text();
    const rows  = text.split("\n").map(r => r.split(",").map(c => c.replace(/^"|"$/g, "")));
    if (rows.length < 3) return equal;

    const fromD = new Date(fromDate);
    const toD   = new Date(toDate);
    const dateRow = rows[1];
    const relevantCols: number[] = [];
    for (let i = 1; i < dateRow.length; i++) {
      const cell = dateRow[i].trim();
      if (!cell) continue;
      for (const fmt of [
        (s: string) => { const [d, m, y] = s.split("/"); return new Date(`${y}-${m}-${d}`); },
        (s: string) => new Date(s),
      ]) {
        try {
          const d = fmt(cell);
          if (!isNaN(d.getTime())) {
            const weekEnd = new Date(d); weekEnd.setDate(weekEnd.getDate() + 6);
            if (d <= toD && weekEnd >= fromD) { relevantCols.push(i); break; }
          }
        } catch { /* */ }
      }
    }
    if (!relevantCols.length) return equal;

    let currentSection: Dept | null = null;
    const marketingRowIdx: Partial<Record<Dept, number>> = {};
    for (let ri = 0; ri < rows.length; ri++) {
      const label = (rows[ri][0] ?? "").trim();
      if (label.toUpperCase() === "AESTHETICS") currentSection = "aesthetics";
      else if (["SLIMMING", "SLIM", "SLIMMING SECTION"].includes(label.toUpperCase())) currentSection = "slimming";
      else if (currentSection && label.toLowerCase().includes("marketing spend week")) {
        if (!(currentSection in marketingRowIdx)) marketingRowIdx[currentSection] = ri;
      }
    }

    const deptSpend: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
    for (const [dept, ridx] of Object.entries(marketingRowIdx) as [Dept, number][]) {
      const row = rows[ridx];
      for (const ci of relevantCols) {
        if (ci < row.length) {
          const raw = row[ci].trim().replace(/,/g, "").replace(/^[€£$]/g, "");
          deptSpend[dept] += parseFloat(raw) || 0;
        }
      }
    }
    const total = deptSpend.aesthetics + deptSpend.slimming;
    return total > 0 ? { aesthetics: deptSpend.aesthetics / total, slimming: deptSpend.slimming / total } : equal;
  } catch {
    return equal;
  }
}

async function loadSalarySupplementAesth(monthKey: string): Promise<Record<Dept, number>> {
  const result: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
  try {
    const base = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const qs   = new URLSearchParams([
      ["select",   "spa_slug,amount"],
      ["month",    `eq.${monthKey}`],
      ["spa_slug", "in.(aesthetics,slimming)"],
    ]);
    const resp = await fetch(`${base}/rest/v1/salary_supplement_monthly?${qs}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (resp.ok) {
      const rows = await resp.json() as Record<string, unknown>[];
      for (const row of rows) {
        const slug = row.spa_slug as Dept;
        if (slug in result) result[slug] += Number(row.amount ?? 0);
      }
    }
  } catch { /* ignore */ }
  return result;
}

async function loadRevenueBase(fromDate: string, toDate: string): Promise<Record<Dept, number>> {
  const rev: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
  const base = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const tables: [string, Dept][] = [
    ["aesthetics_sales_daily", "aesthetics"],
    ["slimming_sales_daily",   "slimming"],
  ];
  for (const [table, dept] of tables) {
    try {
      const qs   = new URLSearchParams([
        ["select",          "price_ex_vat"],
        ["date_of_service", `gte.${fromDate}`],
        ["date_of_service", `lte.${toDate}`],
      ]);
      const resp = await fetch(`${base}/rest/v1/${table}?${qs}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (resp.ok) {
        const rows = await resp.json() as Record<string, unknown>[];
        rev[dept] = rows.reduce((s, r) => s + Number(r.price_ex_vat ?? 0), 0);
      }
    } catch { /* ignore */ }
  }
  return rev;
}

// ── Distribution ────────────────────────────────────────────────────────────

function distribute(
  rule: string,
  amount: number,
  deptRevenue: Record<Dept, number>, totalRevenue: number,
  deptSalary: Record<Dept, number>,  totalSalary: number,
  deptMarketing: Record<Dept, number> | null, totalMarketing: number,
): Record<Dept, number> {
  if (rule === "aesthetics" || rule === "slimming") {
    return { aesthetics: rule === "aesthetics" ? amount : 0, slimming: rule === "slimming" ? amount : 0 };
  }
  if (rule === "sales_ratio") {
    if (totalRevenue > 0) return { aesthetics: amount * deptRevenue.aesthetics / totalRevenue, slimming: amount * deptRevenue.slimming / totalRevenue };
    return { aesthetics: amount / 2, slimming: amount / 2 };
  }
  if (rule === "salary_ratio") {
    if (totalSalary > 0) return { aesthetics: amount * deptSalary.aesthetics / totalSalary, slimming: amount * deptSalary.slimming / totalSalary };
    return { aesthetics: amount / 2, slimming: amount / 2 };
  }
  if (rule === "marketing_spend_ratio" && deptMarketing && totalMarketing > 0) {
    return { aesthetics: amount * (deptMarketing.aesthetics ?? 0) / totalMarketing, slimming: amount * (deptMarketing.slimming ?? 0) / totalMarketing };
  }
  if (rule.startsWith("custom:")) {
    try {
      const cfg: Record<string, number> = JSON.parse(rule.slice(7));
      const total = DEPTS.reduce((s, d) => s + (cfg[d] ?? 0), 0);
      if (total > 0) return { aesthetics: amount * (cfg.aesthetics ?? 0) / total, slimming: amount * (cfg.slimming ?? 0) / total };
    } catch { /* fallthrough */ }
  }
  return { aesthetics: amount / 2, slimming: amount / 2 };
}

async function monthAlreadySynced(monthKey: string): Promise<boolean> {
  try { return (await select("aesthetics_ebitda_monthly", { month: monthKey })).length > 0; }
  catch { return false; }
}

// ── Core month runner ──────────────────────────────────────────────────────

export type AesthRunResult = { rowsUpserted: number; log: string[] };

export async function runAestheticsEbitdaMonthFromTransactions(
  client: ZohoBooksClient,
  year: number,
  month: number,
  opts: {
    force?:            boolean;
    coaMap?:           Record<string, [string, string]>;
    fromDateOverride?: string;
    toDateOverride?:   string;
    preLoadedLines?:   TxnLine[];
  } = {},
): Promise<AesthRunResult> {
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
    return { rowsUpserted: 0, log };
  }

  // ── 1. Pull lines ────────────────────────────────────────────────────────
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
    return { rowsUpserted: 0, log };
  }

  const coaMap = opts.coaMap ?? (await loadAestheticsCoaMap());

  // ── 2. Per-line classify ─────────────────────────────────────────────────
  const VALID_LINES = new Set(["revenue", "cogs", "wages", "advertising", "rent", "utilities", "sga"]);
  type Classified = {
    line:    string;
    rule:    string;
    tagDept: Dept | null;
    code:    string;
    amount:  number;
    section: TxnLine["section"];
  };

  const classified: Classified[] = [];
  let droppedExcluded = 0, droppedZero = 0;
  for (const ln of lines) {
    if (ln.amount === 0) { droppedZero++; continue; }

    let rule: string, line: string;
    if (ln.account_code && ln.account_code in coaMap) {
      [rule, line] = coaMap[ln.account_code];
      if (line === "excluded") { droppedExcluded++; continue; }
    } else if (ln.section === "income") {
      // unmapped income skipped — revenue comes from sales_daily, not Zoho.
      continue;
    } else {
      rule = "equal"; line = detectLine(ln.account_name, ln.section);
    }
    if (line.startsWith("sga_")) line = "sga";
    if (!VALID_LINES.has(line)) { droppedExcluded++; continue; }

    classified.push({
      line,
      rule,
      tagDept: tagsToDept(ln.tags),
      code:    ln.account_code,
      amount:  ln.amount,
      section: ln.section,
    });
  }
  if (droppedExcluded || droppedZero) {
    log.push(`${monthKey}: classify: ${classified.length} kept; dropped ${droppedExcluded} excluded, ${droppedZero} zero`);
  }

  // ── 3. Bases ─────────────────────────────────────────────────────────────
  const deptRevenue  = await loadRevenueBase(fromDate, toDate);
  const totalRevenue = Math.max(deptRevenue.aesthetics + deptRevenue.slimming, 1);

  // Salary base: wages lines allocated to a direct dept (tag or name keyword
  // or rule).
  const deptSalary: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
  for (const c of classified) {
    if (c.line !== "wages") continue;
    let dept: Dept | null = null;
    if (c.tagDept) dept = c.tagDept;
    else {
      const nameDept = detectDept(c.code);  // codes don't carry names, but safe
      if (nameDept) dept = nameDept;
      else if (c.rule === "aesthetics" || c.rule === "slimming") dept = c.rule;
    }
    if (dept) deptSalary[dept] += c.amount;
  }
  const totalSalary = Math.max(deptSalary.aesthetics + deptSalary.slimming, 1);

  const needsMarketing = classified.some(c => c.rule === "marketing_spend_ratio");
  const deptMarketing  = needsMarketing ? await loadMarketingRatio(fromDate, toDate) : null;
  const totalMarketing = deptMarketing ? deptMarketing.aesthetics + deptMarketing.slimming : 1;

  // ── 4. Allocate every line ───────────────────────────────────────────────
  const totals: Record<Dept, Record<string, number>> = {
    aesthetics: { revenue: 0, cogs: 0, wages: 0, advertising: 0, rent: 0, utilities: 0, sga: 0 },
    slimming:   { revenue: 0, cogs: 0, wages: 0, advertising: 0, rent: 0, utilities: 0, sga: 0 },
  };
  const hqTotals: Record<string, number> = { revenue: 0, cogs: 0, wages: 0, advertising: 0, rent: 0, utilities: 0, sga: 0 };

  for (const c of classified) {
    const dept: Dept | null = c.tagDept;
    // If not tagged, name-based override is rule-level here (rule already
    // baked nameDept in when loaded from CoA mapping). But account_name from
    // CoA cache may still hint — handled by the existing CoA rule.
    if (dept) {
      totals[dept][c.line] += c.amount;
    } else if (c.rule === "aesthetics" || c.rule === "slimming") {
      totals[c.rule][c.line] += c.amount;
    } else if (isHqOnlyRule(c.rule)) {
      hqTotals[c.line] += c.amount;
    } else {
      const dist = distribute(c.rule, c.amount, deptRevenue, totalRevenue, deptSalary, totalSalary, deptMarketing, totalMarketing);
      for (const d of DEPTS) totals[d][c.line] += dist[d];
    }
  }

  // ── 5. Rent fallback ─────────────────────────────────────────────────────
  const [prevY, prevM] = prevMonth(year, month);
  const prevKey  = `${prevY}-${String(prevM).padStart(2, "0")}-01`;
  const prevDays = daysInMonth(prevY, prevM);
  const prevRent: Record<Dept, number> = { aesthetics: 0, slimming: 0 };
  try {
    const prevRows = await select("aesthetics_ebitda_monthly", { month: prevKey });
    for (const pr of prevRows) {
      const dept = pr.department as Dept;
      if (DEPTS.includes(dept)) prevRent[dept] = Number(pr.rent ?? 0);
    }
  } catch { /* ignore */ }

  for (const dept of DEPTS) {
    const cur   = totals[dept].rent;
    const prev  = prevRent[dept];
    const bench = BENCHMARK_RENT[dept];
    if (cur < RENT_ZERO_THRESHOLD && prev > 0) totals[dept].rent = prev / prevDays * periodDays;
    else if (cur < RENT_ZERO_THRESHOLD && prev <= 0 && bench > 0) totals[dept].rent = bench / monthDays * periodDays;
    else if (cur >= RENT_ZERO_THRESHOLD && periodDays < monthDays) totals[dept].rent = cur / monthDays * periodDays;
  }

  // ── 6. Salary supplement ─────────────────────────────────────────────────
  const supplement = await loadSalarySupplementAesth(monthKey);
  for (const dept of DEPTS) {
    if (supplement[dept] > 0) {
      totals[dept].wages += supplement[dept];
      log.push(`Salary supplement [${dept}]: +${supplement[dept].toFixed(2)} added to wages`);
    }
  }

  // ── 7. Upsert ────────────────────────────────────────────────────────────
  const nowTs = new Date().toISOString();
  const rows  = DEPTS.map(dept => ({
    month:          monthKey,
    department:     dept,
    revenue:        +totals[dept].revenue.toFixed(2),
    cogs:           +totals[dept].cogs.toFixed(2),
    wages:          +totals[dept].wages.toFixed(2),
    advertising:    +totals[dept].advertising.toFixed(2),
    rent:           +totals[dept].rent.toFixed(2),
    utilities:      +totals[dept].utilities.toFixed(2),
    sga:            +totals[dept].sga.toFixed(2),
    zoho_synced_at: nowTs,
  }));
  const n = await upsert("aesthetics_ebitda_monthly", rows as Record<string, unknown>[], "month,department");

  // HQ allocations from the Aesthetics org go to hq_ebitda_monthly with
  // source='aesthetics'. The SPA ETL writes the same table with source='spa';
  // useHqEbitda sums all source rows per month for the HQ dashboard.
  const hqRow = {
    month:          monthKey,
    source:         "aesthetics",
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

  log.push(`${monthKey}: ${n} dept rows + ${hqCount} hq row(s) upserted`);
  return { rowsUpserted: n, log };
}
