import { deleteWhere, insertRows } from "./supabase-etl";

const SHEET_ID    = "1j6tz8k8TRSulB35Sg4X1xSlcV_JLf-8QKx-32UUkoBc";
const DEFAULT_VAT = 0.18;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Google OAuth ──────────────────────────────────────────────────────────────

let cachedAccessToken: string | null = null;

async function getGoogleAccessToken(): Promise<string> {
  if (cachedAccessToken) return cachedAccessToken;
  const clientId     = process.env.GOOGLE_SHEETS_CLIENT_ID     ?? process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN ?? process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials not set in env");
  }
  const params = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type:    "refresh_token",
  });
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    params,
  });
  if (!resp.ok) throw new Error(`Google token refresh failed: ${resp.status}`);
  const data = await resp.json() as Record<string, unknown>;
  cachedAccessToken = data.access_token as string;
  return cachedAccessToken;
}

// ── Spreadsheet metadata: list all actual tab names ───────────────────────────

async function listTabNames(): Promise<string[]> {
  const token = await getGoogleAccessToken();
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`;
  const resp  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) return [];
  const data  = await resp.json() as { sheets?: Array<{ properties?: { title?: string } }> };
  return (data.sheets ?? []).map(s => s.properties?.title ?? "").filter(Boolean);
}

// ── Sheet fetch via Sheets API v4 ─────────────────────────────────────────────

// tabCandidates generates the naming patterns we look for; we match these
// case-insensitively against the spreadsheet's actual tab list.
function tabCandidates(year: number, month: number): string[] {
  const m  = MONTH_NAMES[month - 1];
  const ab = m.slice(0, 3);  // "Feb", "Apr", …
  const yy = String(year).slice(2);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of [m, ab]) {
    for (const yr of [yy, String(year)]) {
      for (const prefix of ["Sales", "Sale"]) {
        const c = `${prefix} ${name} ${yr}`;
        if (!seen.has(c)) { seen.add(c); out.push(c); }
      }
    }
  }
  return out;
}

async function fetchTab(tab: string): Promise<{ rows: Record<string, string>[]; headers: string[] } | null> {
  const token  = await getGoogleAccessToken();
  const range  = encodeURIComponent(`'${tab}'!A:Z`);
  const url    = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`;
  const resp   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) return null;
  const data   = await resp.json() as { values?: string[][] };
  const values = data.values ?? [];
  if (values.length < 2) return null;
  // Normalise headers to lowercase; deduplicate with _2, _3 suffix so later
  // columns (e.g. a second "sale of") don't silently overwrite earlier ones.
  const seen = new Map<string, number>();
  const headers = values[0].map(h => {
    const k = h.trim().toLowerCase();
    const n = (seen.get(k) ?? 0) + 1;
    seen.set(k, n);
    return n === 1 ? k : `${k}_${n}`;
  });
  const rows = values.slice(1).map(row => {
    const padded = [...row, ...Array(Math.max(0, headers.length - row.length)).fill("")];
    return Object.fromEntries(headers.map((h, i) => [h, padded[i] ?? ""]));
  });
  return { rows, headers };
}

async function fetchBestTab(
  year: number,
  month: number,
  log: string[],
  allTabs: string[],
): Promise<{ rows: Record<string, string>[]; tabName: string; headers: string[] } | null> {
  const candidates = tabCandidates(year, month);

  // Case-insensitive lookup against the spreadsheet's actual tab names.
  // This handles naming variations (casing, spacing) without guessing.
  function findActual(candidate: string): string | null {
    return allTabs.find(t => t.toLowerCase().trim() === candidate.toLowerCase().trim()) ?? null;
  }

  // First pass: prefer the tab that has a "paid" or "client" column (new sheet format)
  for (const candidate of candidates) {
    const actualTab = findActual(candidate);
    if (!actualTab) continue;
    const result = await fetchTab(actualTab);
    if (!result) continue;
    log.push(`  Found tab '${actualTab}' — columns: [${result.headers.join(", ")}]`);
    if (result.headers.includes("paid") || result.headers.includes("client")) return { rows: result.rows, tabName: actualTab, headers: result.headers };
    log.push(`  (tab '${actualTab}' has no paid/client column — checking next candidate)`);
  }

  // Second pass: fall back to the first matching tab that has any data
  for (const candidate of candidates) {
    const actualTab = findActual(candidate);
    if (!actualTab) continue;
    const result = await fetchTab(actualTab);
    if (result && result.rows.length) return { rows: result.rows, tabName: actualTab, headers: result.headers };
  }

  return null;
}

// ── Date parsing ──────────────────────────────────────────────────────────────

function parseDate(raw: string, fallbackYear: number, fallbackMonth: number): string | null {
  raw = raw.trim().replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
  // D/M/YYYY
  let m = raw.match(/^(\d{1,2})[/\-.\\](\d{1,2})[/\-.\\](\d{4})$/);
  if (m) {
    try { return new Date(+m[3], +m[2] - 1, +m[1]).toISOString().slice(0, 10); } catch { /* */ }
  }
  // D/M
  m = raw.match(/^(\d{1,2})[/\-.\\](\d{1,2})$/);
  if (m) {
    try { return new Date(fallbackYear, +m[2] - 1, +m[1]).toISOString().slice(0, 10); } catch { /* */ }
  }
  // day only
  m = raw.match(/^(\d{1,2})$/);
  if (m) {
    try { return new Date(fallbackYear, fallbackMonth - 1, +m[1]).toISOString().slice(0, 10); } catch { /* */ }
  }
  // "5 April" or "April 5"
  for (let idx = 0; idx < MONTH_NAMES.length; idx++) {
    const mn = MONTH_NAMES[idx];
    const patterns = [
      new RegExp(`^${mn.slice(0, 3)}\\w*\\s+(\\d{1,2})`, "i"),
      new RegExp(`^(\\d{1,2})\\s+${mn.slice(0, 3)}\\w*`, "i"),
    ];
    for (const pat of patterns) {
      const mo = raw.match(pat);
      if (mo) {
        try { return new Date(fallbackYear, idx, +mo[1]).toISOString().slice(0, 10); } catch { /* */ }
      }
    }
  }
  return null;
}

// ── Row processor ─────────────────────────────────────────────────────────────

function col(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) { const v = row[k]; if (v) return v.trim(); }
  return "";
}

function processTab(tab: string, rawRows: Record<string, string>[], year: number, month: number): Record<string, unknown>[] {
  const monthKey = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const results: Record<string, unknown>[] = [];

  for (const row of rawRows) {
    const customer   = col(row, "client") || null;
    if (!customer) continue;
    const service    = col(row, "weight loss", "treatments", "medical consultation", "products") || null;
    const dateRaw    = col(row, "date");
    const priceRaw   = col(row, "paid");
    const notePerson = col(row, "sale of") || null;

    if (!priceRaw || priceRaw === "-") continue;
    const priceInc = Math.abs(parseFloat(priceRaw.replace(/[€$,]/g, "").trim()));
    if (!isFinite(priceInc) || priceInc === 0) continue;

    const rate    = DEFAULT_VAT;
    const priceEx = +(priceInc / (1 + rate)).toFixed(2);
    const svcDate = parseDate(dateRaw, year, month);

    results.push({
      sheet_tab:       tab,
      month:           monthKey,
      date_of_service: svcDate,
      invoice:         null,
      customer,
      service_product: service,
      price_inc_vat:   +priceInc.toFixed(2),
      vat_rate:        rate,
      price_ex_vat:    priceEx,
      payment_method:  null,
      sales_staff:     null,
      note_person:     notePerson,
    });
  }
  return results;
}

// ── Date range helpers ────────────────────────────────────────────────────────

function monthsInRange(dateFrom: Date, dateTo: Date): [number, number][] {
  const months: [number, number][] = [];
  let y = dateFrom.getFullYear(), m = dateFrom.getMonth() + 1;
  const ey = dateTo.getFullYear(), em = dateTo.getMonth() + 1;
  while (y < ey || (y === ey && m <= em)) {
    months.push([y, m]);
    if (++m > 12) { m = 1; y++; }
  }
  return months;
}

// ── Main run ──────────────────────────────────────────────────────────────────

export async function runAestheticsSales(
  dateFrom: string,
  dateTo: string,
): Promise<{ rowsInserted: number; tabs: string[]; log: string[] }> {
  // Force a fresh OAuth token each run so stale cached tokens don't cause failures
  cachedAccessToken = null;

  const log: string[] = [];
  const months = monthsInRange(new Date(dateFrom), new Date(dateTo));
  let totalRows = 0;
  const processed: string[] = [];

  // Fetch the spreadsheet's actual tab names once so we can match case-insensitively
  const allTabs = await listTabNames();
  log.push(`Spreadsheet tabs: [${allTabs.join(", ")}]`);

  for (const [year, month] of months) {
    const label    = `${MONTH_NAMES[month - 1]} ${year}`;
    const monthKey = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    log.push(`Fetching ${label}…`);
    const found = await fetchBestTab(year, month, log, allTabs);
    if (!found) { log.push(`  ${label}: no tab found — skipping`); continue; }
    const { rows: rawRows, tabName } = found;
    const rows = processTab(tabName, rawRows, year, month);
    if (!rows.length) { log.push(`  ${tabName}: 0 usable rows — skipping`); continue; }
    // Delete ALL rows for this month (regardless of tab name) so stale data
    // from any previously-used tab name is always replaced with fresh data.
    await deleteWhere("aesthetics_sales_daily", { month: monthKey });
    const n = await insertRows("aesthetics_sales_daily", rows);
    totalRows += n;
    processed.push(tabName);
    log.push(`  ${tabName}: ${n} rows inserted`);
  }

  log.push(`Done — ${totalRows} total rows inserted across ${processed.length} tab(s).`);
  return { rowsInserted: totalRows, tabs: processed, log };
}
