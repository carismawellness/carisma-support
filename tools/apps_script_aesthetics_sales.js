/**
 * Carisma Cockpit — Aesthetics Sales Sheet → Supabase ETL
 *
 * This Google Apps Script runs inside the Aesthetics Sales (Leticia) Google Sheet.
 * Sheet ID: 1Mr_aRRbRf3ex--WmUJIqXwko7okCyD82KxBOXWYnW24
 *
 * Layout: "rows as transactions" — Monthly tabs named like "Sale April 2026", "Sales March 2026", etc.
 * Columns: Invoice(A), Customer(B), Service(C), Date(D), Price(E), Payment(F), Sales Staff(G),
 *          Note(H), Commission 6%(I), Commission 3%(J), [gap], Retail(L)
 *
 * Target Supabase table: sales_by_rep
 */

// ============================================================
// CONFIGURATION
// ============================================================

const SUPABASE_URL = "https://praceahubcvbrewuqejh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNlYWh1YmN2YnJld3VxZWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NTEzOCwiZXhwIjoyMDkxNzQxMTM4fQ.sp3c1FogKB9Dr4xlNBAZEr3QMEKH9XKQiu-RgJe12us";

const BRAND_ID = 2; // carisma_aesthetics

// Tab name patterns to match (case-insensitive matching used in code)
// Actual tab names: "Sale April 2026", "Sale March 2026", "Sales January 2026", "Sales December 2025", etc.
const SALES_TAB_PATTERN = /^sales?\s/i;

// Column indices (1-based)
const COL = {
  INVOICE: 1,    // A
  CUSTOMER: 2,   // B
  SERVICE: 3,    // C
  DATE: 4,       // D
  PRICE: 5,      // E
  PAYMENT: 6,    // F
  STAFF: 7,      // G — Note: sometimes in H (Note column) based on actual data
  NOTE: 8,       // H — actual staff name often here
  COMM_6: 9,     // I
  COMM_3: 10,    // J
  RETAIL: 12     // L
};

// ============================================================
// SHARED UTILITIES
// ============================================================

function parseDate(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  const str = String(val).trim();
  if (!str) return null;

  // "1/4/2026" or "1/4"
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]);
    const year = slashMatch[3]
      ? (slashMatch[3].length === 2 ? 2000 + parseInt(slashMatch[3]) : parseInt(slashMatch[3]))
      : new Date().getFullYear();
    const d = new Date(year, month - 1, day);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  // "01/04/2026" (DD/MM/YYYY)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return null;
}

function cleanPrice(val) {
  if (val === "" || val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val.includes("#REF") || val.includes("#N/A") || val.includes("#DIV")) return null;
    val = val.replace(/[€$£,\s]/g, "");
    if (val === "" || val === "-") return null;
  }
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function supabaseUpsert(table, rows) {
  if (rows.length === 0) return { count: 0 };
  const url = SUPABASE_URL + "/rest/v1/" + table;
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Prefer": "resolution=merge-duplicates"
    },
    payload: JSON.stringify(rows),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    return { count: rows.length, status: "success" };
  } else {
    Logger.log("Supabase error " + code + ": " + response.getContentText());
    return { count: 0, status: "error", error: response.getContentText() };
  }
}

// ============================================================
// CORE SYNC — Parse transaction rows, aggregate by date + staff
// ============================================================

function getSalesTabNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()
    .map(s => s.getName())
    .filter(name => SALES_TAB_PATTERN.test(name));
}

function syncTab(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { count: 0 };

  // Read all data (skip header row 1)
  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();

  // Aggregate: { "date|staff" → { revenue, bookings_count } }
  const agg = {};

  for (const row of data) {
    const dateVal = parseDate(row[COL.DATE - 1]);
    if (!dateVal) continue;

    const price = cleanPrice(row[COL.PRICE - 1]);
    if (price === null) continue;

    // Staff name is in column H (Note) based on actual data, fallback to column G
    let staff = String(row[COL.NOTE - 1] || row[COL.STAFF - 1] || "").trim();
    if (!staff) staff = "Unknown";

    const key = dateVal + "|" + staff;
    if (!agg[key]) {
      agg[key] = { date: dateVal, staff: staff, revenue: 0, bookings_count: 0 };
    }
    agg[key].revenue += price;
    agg[key].bookings_count += 1;
  }

  const rows = Object.values(agg).map(a => ({
    date: a.date,
    staff_name: a.staff,
    brand_id: BRAND_ID,
    revenue: Math.round(a.revenue * 100) / 100,
    bookings_count: a.bookings_count,
    source_tab: tabName
  }));

  if (rows.length > 0) {
    const result = supabaseUpsert("sales_by_rep", rows);
    Logger.log("Synced " + rows.length + " aggregated rows from " + tabName);
    return result;
  }
  return { count: 0 };
}

// ============================================================
// MAIN SYNC FUNCTIONS
// ============================================================

/**
 * Sync the most recent sales tab (latest month).
 */
function syncLatestMonth() {
  const tabs = getSalesTabNames();
  if (tabs.length === 0) {
    Logger.log("No sales tabs found");
    return;
  }
  // The first sales tab in the sheet is typically the most recent
  const latestTab = tabs[0];
  Logger.log("Syncing latest tab: " + latestTab);
  return syncTab(latestTab);
}

/**
 * Backfill all sales tabs.
 */
function backfillAll() {
  const tabs = getSalesTabNames();
  Logger.log("Found " + tabs.length + " sales tabs: " + tabs.join(", "));

  const results = [];
  for (const tab of tabs) {
    const result = syncTab(tab);
    results.push({ tab: tab, ...result });
    Utilities.sleep(300);
  }
  Logger.log("Backfill complete: " + JSON.stringify(results));
  return results;
}

// ============================================================
// TRIGGERS
// ============================================================

function onEditTrigger(e) {
  if (!e) return;
  const sheet = e.source.getActiveSheet();
  const tabName = sheet.getName();
  if (!SALES_TAB_PATTERN.test(tabName)) return;

  Utilities.sleep(2000);
  syncTab(tabName);
}


// ============================================================
// TRIGGER SETUP (run once from script editor)
// ============================================================

function createTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("onEditTrigger")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  ScriptApp.newTrigger("syncLatestMonth")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  Logger.log("Triggers created: onEditTrigger + syncLatestMonth daily 6am");
  return ScriptApp.getProjectTriggers().map(function(t) { return t.getHandlerFunction(); });
}

// ============================================================
// DISCOVERY & TEST
// ============================================================

function discoverSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const report = [];
  for (const sheet of sheets) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const sampleRows = Math.min(lastRow, 5);
    const sampleCols = Math.min(lastCol, 12);
    const sample = sampleRows > 0 && sampleCols > 0
      ? sheet.getRange(1, 1, sampleRows, sampleCols).getValues()
      : [];
    report.push({ tab: name, rows: lastRow, cols: lastCol, isSalesTab: SALES_TAB_PATTERN.test(name), sample: sample });
  }
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function testConnection() {
  const url = SUPABASE_URL + "/rest/v1/";
  const options = {
    method: "get",
    headers: { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY },
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) {
    Logger.log("SUCCESS: Supabase connection works!");
  } else {
    Logger.log("ERROR " + response.getResponseCode() + ": " + response.getContentText());
  }
}

function testPreview() {
  const tabs = getSalesTabNames();
  Logger.log("Sales tabs found: " + tabs.join(", "));
  if (tabs.length > 0) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tabs[0]);
    Logger.log("Latest tab: " + tabs[0] + " | Rows: " + sheet.getLastRow());
  }
}
