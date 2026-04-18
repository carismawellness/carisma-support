/**
 * Carisma Cockpit — Marketing Budget Calendar Sheet → Supabase ETL
 *
 * This Google Apps Script runs inside the Marketing Budget Calendar Google Sheet.
 * Sheet ID: 1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc
 *
 * Layout: Daily calendar with month columns.
 * - Row 2: Year ("2026")
 * - Row 3: Month names + daily dates (1/1, 1/2, ...)
 * - Row 4: Day names (Thu, Fri, ...)
 * - Row 5+: Brand/Platform sections with campaign names and budget amounts
 *   Structure: Brand header (e.g. "CARISMA SPA") with "Total spend" in col B,
 *   then Platform rows (Meta, Google, etc.) with Name/Budget pairs
 *
 * Tabs: "Calendar '25", "Calendar '26"
 *
 * Target Supabase table: budget_vs_actual
 */

// ============================================================
// CONFIGURATION
// ============================================================

const SUPABASE_URL = "https://praceahubcvbrewuqejh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNlYWh1YmN2YnJld3VxZWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NTEzOCwiZXhwIjoyMDkxNzQxMTM4fQ.sp3c1FogKB9Dr4xlNBAZEr3QMEKH9XKQiu-RgJe12us";

const TAB_CONFIG = [
  { tabName: "Calendar '25", year: 2025 },
  { tabName: "Calendar '26", year: 2026 }
];

// Brand keywords to detect brand sections
const BRAND_MAP = {
  "CARISMA SPA": { brandId: 1, brand: "carisma_spa" },
  "CARISMA AESTHETICS": { brandId: 2, brand: "carisma_aesthetics" },
  "AESTHETICS": { brandId: 2, brand: "carisma_aesthetics" },
  "CARISMA SLIMMING": { brandId: 3, brand: "carisma_slimming" },
  "SLIMMING": { brandId: 3, brand: "carisma_slimming" }
};

// ============================================================
// SHARED UTILITIES
// ============================================================

function cleanValue(val) {
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
// CORE SYNC — Aggregate daily budgets into monthly totals per brand
// ============================================================

function syncTab(tabName, year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    Logger.log("Tab not found: " + tabName);
    return null;
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 5 || lastCol < 3) return { count: 0 };

  // Read entire sheet
  const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  // Row 3 (index 2) has date headers like "1/1", "1/2", etc.
  const dateRow = allData[2] || [];

  // Parse column dates
  const colDates = {};
  for (let c = 2; c < dateRow.length; c++) {
    const dateStr = String(dateRow[c]).trim();
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (match) {
      const month = parseInt(match[1]);
      const day = parseInt(match[2]);
      const d = new Date(year, month - 1, day);
      const monthKey = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM") + "-01";
      colDates[c] = { date: d, monthKey: monthKey, month: month };
    }
  }

  // Walk rows to find brand sections and "Total spend" / "Budget" rows
  let currentBrand = null;
  let currentPlatform = null;

  // Aggregate: { "month|brandId|department" → total }
  const monthlyBudgets = {};

  for (let r = 4; r < lastRow; r++) {
    const row = allData[r];
    const colA = String(row[0] || "").trim().toUpperCase();
    const colB = String(row[1] || "").trim();

    // Detect brand section
    for (const [key, val] of Object.entries(BRAND_MAP)) {
      if (colA.includes(key)) {
        currentBrand = val;
        currentPlatform = null;
        break;
      }
    }

    // Detect platform
    if (colA && !colB) {
      // Platform headers are in col A with nothing useful in col B
    }
    if (colA === "META" || colA === "GOOGLE" || colA === "KLAVIYO" || colA === "OTHER") {
      currentPlatform = colA.toLowerCase();
    }

    // "Budget" rows contain the actual amounts
    if (colB.toLowerCase() === "budget" && currentBrand) {
      for (const [colIdx, dateInfo] of Object.entries(colDates)) {
        const val = cleanValue(row[parseInt(colIdx)]);
        if (val !== null && val > 0) {
          const key = dateInfo.monthKey + "|" + currentBrand.brandId + "|" + (currentPlatform || "total");
          if (!monthlyBudgets[key]) {
            monthlyBudgets[key] = {
              month: dateInfo.monthKey,
              brand_id: currentBrand.brandId,
              department: "marketing",
              platform: currentPlatform || "total",
              budgeted: 0
            };
          }
          monthlyBudgets[key].budgeted += val;
        }
      }
    }

    // "Total spend" rows (brand-level aggregates)
    if (colB.toLowerCase() === "total spend" && currentBrand) {
      for (const [colIdx, dateInfo] of Object.entries(colDates)) {
        const val = cleanValue(row[parseInt(colIdx)]);
        if (val !== null && val > 0) {
          const key = dateInfo.monthKey + "|" + currentBrand.brandId + "|total";
          if (!monthlyBudgets[key]) {
            monthlyBudgets[key] = {
              month: dateInfo.monthKey,
              brand_id: currentBrand.brandId,
              department: "marketing",
              platform: "total",
              budgeted: 0
            };
          }
          monthlyBudgets[key].budgeted += val;
        }
      }
    }
  }

  const rows = Object.values(monthlyBudgets).map(b => ({
    month: b.month,
    brand_id: b.brand_id,
    department: b.department,
    platform: b.platform,
    budgeted: Math.round(b.budgeted * 100) / 100,
    tab: tabName
  }));

  if (rows.length > 0) {
    const result = supabaseUpsert("budget_vs_actual", rows);
    Logger.log("Synced " + rows.length + " budget rows from " + tabName);
    return result;
  }
  return { count: 0 };
}

// ============================================================
// MAIN SYNC FUNCTIONS
// ============================================================

function syncLatestYear() {
  // Sync the most recent calendar tab
  const config = TAB_CONFIG[TAB_CONFIG.length - 1];
  Logger.log("Syncing: " + config.tabName);
  return syncTab(config.tabName, config.year);
}

function backfillAll() {
  const results = [];
  for (const config of TAB_CONFIG) {
    Logger.log("Backfilling: " + config.tabName);
    const result = syncTab(config.tabName, config.year);
    results.push({ tab: config.tabName, ...result });
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
  const config = TAB_CONFIG.find(c => c.tabName === tabName);
  if (!config) return;

  Utilities.sleep(2000);
  syncTab(config.tabName, config.year);
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
  ScriptApp.newTrigger("syncLatestYear")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  Logger.log("Triggers created: onEditTrigger + syncLatestYear daily 6am");
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
    const sampleRows = Math.min(lastRow, 10);
    const sampleCols = Math.min(lastCol, 15);
    const sample = sampleRows > 0 && sampleCols > 0
      ? sheet.getRange(1, 1, sampleRows, sampleCols).getValues()
      : [];
    report.push({ tab: name, rows: lastRow, cols: lastCol, sample: sample });
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Spreadsheet: " + ss.getName());
  for (const config of TAB_CONFIG) {
    const sheet = ss.getSheetByName(config.tabName);
    if (!sheet) {
      Logger.log("Tab '" + config.tabName + "' not found");
      continue;
    }
    Logger.log("Tab: " + config.tabName + " | Rows: " + sheet.getLastRow() + " | Cols: " + sheet.getLastColumn());
  }
}
