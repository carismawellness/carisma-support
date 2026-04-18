/**
 * Carisma Cockpit — CRM Master Sheet → Supabase ETL
 *
 * This Google Apps Script runs inside the CRM Master Google Sheet.
 * Sheet ID: 1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI
 *
 * Layout: "days as columns" — Column B has KPI labels, row 2 has date headers starting col C.
 * Three brand tabs: " Spa", " Aes", " Slm" (note leading spaces).
 *
 * Target Supabase tables: crm_daily, crm_by_rep
 */

// ============================================================
// CONFIGURATION
// ============================================================

const SUPABASE_URL = "https://praceahubcvbrewuqejh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNlYWh1YmN2YnJld3VxZWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NTEzOCwiZXhwIjoyMDkxNzQxMTM4fQ.sp3c1FogKB9Dr4xlNBAZEr3QMEKH9XKQiu-RgJe12us";

// KPI tabs (leading spaces are intentional — they match the actual tab names)
const TAB_CONFIG = [
  { tabName: " Spa", brand: "carisma_spa",        brandId: 1 },
  { tabName: " Aes", brand: "carisma_aesthetics", brandId: 2 },
  { tabName: " Slm", brand: "carisma_slimming",   brandId: 3 }
];

const HEADER_ROW = 2;       // Row containing date headers
const LABEL_COL = 2;        // Column B has metric labels
const DATA_START_COL = 3;   // Column C is where date data starts

// ============================================================
// SHARED UTILITIES
// ============================================================

function parseDate(header) {
  if (header instanceof Date) {
    return Utilities.formatDate(header, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  const str = String(header).trim();
  if (!str) return null;

  // "18 Feb", "18 Feb 26", "18 Feb 2026"
  const dmMatch = str.match(/^(\d{1,2})\s+(\w{3})(?:\s+(\d{2,4}))?$/);
  if (dmMatch) {
    const day = dmMatch[1];
    const monthStr = dmMatch[2];
    const year = dmMatch[3] ? (dmMatch[3].length === 2 ? "20" + dmMatch[3] : dmMatch[3]) : new Date().getFullYear();
    const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const m = months[monthStr];
    if (m !== undefined) {
      const d = new Date(year, m, parseInt(day));
      return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }

  // "23-Mar" or "23-Mar-26"
  const shortMatch = str.match(/^(\d{1,2})[-/](\w{3})(?:[-/](\d{2,4}))?$/);
  if (shortMatch) {
    const day = shortMatch[1];
    const monthStr = shortMatch[2];
    const year = shortMatch[3] ? (shortMatch[3].length === 2 ? "20" + shortMatch[3] : shortMatch[3]) : new Date().getFullYear();
    const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const m = months[monthStr];
    if (m !== undefined) {
      const d = new Date(year, m, parseInt(day));
      return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }

  // ISO "2026-03-23"
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return null;
}

function cleanValue(val) {
  if (val === "" || val === null || val === undefined) return null;
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
// CORE SYNC — Transpose daily column → Supabase rows
// ============================================================

function syncColumn(tabName, brandId, colIndex, dateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    Logger.log("Tab not found: " + tabName);
    return null;
  }

  const lastRow = sheet.getLastRow();
  const labels = sheet.getRange(1, LABEL_COL, lastRow, 1).getValues();
  const values = sheet.getRange(1, colIndex, lastRow, 1).getValues();

  const rows = [];
  for (let i = 0; i < lastRow; i++) {
    const label = String(labels[i][0]).trim();
    const val = cleanValue(values[i][0]);
    if (label && val !== null) {
      rows.push({
        date: dateStr,
        metric: label,
        value: val,
        brand_id: brandId,
        tab: tabName.trim()
      });
    }
  }

  if (rows.length > 0) {
    const result = supabaseUpsert("crm_daily", rows);
    Logger.log("Synced " + rows.length + " rows from " + tabName + " date " + dateStr);
    return result;
  }
  return { count: 0 };
}

// ============================================================
// MAIN SYNC FUNCTIONS
// ============================================================

function findLatestDateColumn(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
  for (let i = headers.length - 1; i >= 0; i--) {
    if (headers[i] !== "" && headers[i] !== null) {
      return { col: i + 1, header: headers[i] };
    }
  }
  return null;
}

function syncLatestDay() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];

  for (const config of TAB_CONFIG) {
    const sheet = ss.getSheetByName(config.tabName);
    if (!sheet) {
      Logger.log("Skipping tab (not found): " + config.tabName);
      continue;
    }
    const latest = findLatestDateColumn(sheet);
    if (!latest) continue;

    const dateStr = parseDate(latest.header);
    if (!dateStr) {
      Logger.log("Could not parse date from header: " + latest.header);
      continue;
    }

    Logger.log("Syncing " + config.tabName + " | Date: " + dateStr + " (col " + latest.col + ")");
    const result = syncColumn(config.tabName, config.brandId, latest.col, dateStr);
    results.push({ tab: config.tabName, date: dateStr, ...result });
  }

  Logger.log("Sync complete: " + JSON.stringify(results));
  return results;
}

function backfillAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const config of TAB_CONFIG) {
    const sheet = ss.getSheetByName(config.tabName);
    if (!sheet) continue;

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];
    let total = 0;

    for (let col = DATA_START_COL - 1; col < headers.length; col++) {
      if (!headers[col]) continue;
      const dateStr = parseDate(headers[col]);
      if (!dateStr) continue;

      const result = syncColumn(config.tabName, config.brandId, col + 1, dateStr);
      if (result) total += result.count || 0;
      Utilities.sleep(200);
    }
    Logger.log("Backfill complete for " + config.tabName + ": " + total + " rows");
  }
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

  const col = e.range.getColumn();
  if (col < DATA_START_COL) return;

  const header = sheet.getRange(HEADER_ROW, col).getValue();
  const dateStr = parseDate(header);
  if (!dateStr) return;

  Utilities.sleep(2000);
  syncColumn(config.tabName, config.brandId, col, dateStr);
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
  ScriptApp.newTrigger("syncLatestDay")
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  Logger.log("Triggers created: onEditTrigger + syncLatestDay daily 6am");
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
    const sampleCols = Math.min(lastCol, 10);
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
    const latest = findLatestDateColumn(sheet);
    Logger.log("Tab: " + config.tabName + " | Latest: " + JSON.stringify(latest));
  }
}
