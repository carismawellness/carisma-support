/**
 * Carisma Cockpit — Weekly KPI Sheet → Supabase ETL
 *
 * This Google Apps Script runs inside the Weekly KPI Google Sheet.
 * It detects new week columns and pushes data to Supabase automatically.
 *
 * SETUP (one-time):
 * 1. Open the Weekly KPI Sheet in Google Sheets
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire file
 * 4. Update SUPABASE_URL and SUPABASE_KEY below
 * 5. Click "Run" on testConnection() to verify
 * 6. Go to Triggers (clock icon) → Add Trigger:
 *    - Function: onEditTrigger
 *    - Event source: From spreadsheet
 *    - Event type: On edit
 *    (Also add a time-driven trigger for syncLatestWeek, daily at 6am as backup)
 *
 * NO EXTERNAL AUTH REQUIRED — runs as the sheet owner.
 */

// ============================================================
// CONFIGURATION — Update these values
// ============================================================

const SUPABASE_URL = "https://praceahubcvbrewuqejh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNlYWh1YmN2YnJld3VxZWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NTEzOCwiZXhwIjoyMDkxNzQxMTM4fQ.sp3c1FogKB9Dr4xlNBAZEr3QMEKH9XKQiu-RgJe12us";

// Tab-to-table mapping: which sheet tabs map to which Supabase tables
// Each entry defines: tabName, supabaseTable, rowMapping (metric names → row numbers)
const TAB_CONFIG = [
  {
    tabName: "Revenue",
    supabaseTable: "weekly_revenue",
    headerRow: 1,        // Row containing week date headers
    dataStartCol: 3,     // Column where week data starts (C = 3)
    metrics: [
      // { rowNum, metricName, locationOrBrand }
      // These will be filled in after we inspect the actual sheet structure
      // Example:
      // { row: 3, metric: "revenue_ex_vat", location: "InterContinental" },
      // { row: 4, metric: "revenue_ex_vat", location: "Hugos" },
    ]
  },
  {
    tabName: "EBITDA",
    supabaseTable: "weekly_ebitda",
    headerRow: 1,
    dataStartCol: 3,
    metrics: []
  },
  {
    tabName: "CRM",
    supabaseTable: "weekly_crm",
    headerRow: 1,
    dataStartCol: 3,
    metrics: []
  },
  {
    tabName: "Operations",
    supabaseTable: "weekly_operations",
    headerRow: 1,
    dataStartCol: 3,
    metrics: []
  }
];

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Find the latest (rightmost) week column with data
 */
function findLatestWeekColumn(sheet, headerRow) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];

  // Walk backwards to find last non-empty header
  for (let i = headers.length - 1; i >= 0; i--) {
    if (headers[i] !== "" && headers[i] !== null) {
      return { col: i + 1, header: headers[i] };
    }
  }
  return null;
}

/**
 * Parse a week header into a date string (YYYY-MM-DD)
 * Handles formats like "23-Mar", "23/03/2026", Date objects, etc.
 */
function parseWeekDate(header) {
  if (header instanceof Date) {
    return Utilities.formatDate(header, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  const str = String(header).trim();

  // Format: "23-Mar" or "23-Mar-26"
  const shortMatch = str.match(/^(\d{1,2})[-/](\w{3})(?:[-/](\d{2,4}))?$/);
  if (shortMatch) {
    const day = shortMatch[1];
    const monthStr = shortMatch[2];
    const year = shortMatch[3] ? (shortMatch[3].length === 2 ? "20" + shortMatch[3] : shortMatch[3]) : new Date().getFullYear();
    const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
    const monthNum = months[monthStr];
    if (monthNum !== undefined) {
      const d = new Date(year, monthNum, parseInt(day));
      return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }

  // Format: "2026-03-23" (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Try native Date parse as fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  return null;
}

/**
 * Clean a cell value: handle #REF!, empty, convert to number
 */
function cleanValue(val) {
  if (val === "" || val === null || val === undefined) return null;
  if (typeof val === "string") {
    if (val.includes("#REF") || val.includes("#N/A") || val.includes("#DIV")) return null;
    // Remove currency symbols and commas
    val = val.replace(/[€$£,\s]/g, "");
    if (val === "" || val === "-") return null;
  }
  const num = Number(val);
  return isNaN(num) ? null : num;
}

/**
 * Upsert rows into Supabase
 */
function supabaseUpsert(table, rows, conflictColumns) {
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
// GENERIC SYNC — Works for any tab with "metric rows × week columns"
// ============================================================

/**
 * Sync all data from a specific column (week) to Supabase.
 * Reads ALL rows and transposes them into Supabase records.
 *
 * This is the generic version — it reads the entire tab and creates
 * one Supabase row per non-empty cell in the target column.
 */
function syncColumnGeneric(tabName, supabaseTable, colIndex, weekDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    Logger.log("Tab not found: " + tabName);
    return null;
  }

  const lastRow = sheet.getLastRow();
  // Read metric labels (column A) and the target week column
  const labels = sheet.getRange(1, 1, lastRow, 1).getValues();
  const values = sheet.getRange(1, colIndex, lastRow, 1).getValues();

  const rows = [];
  for (let i = 0; i < lastRow; i++) {
    const label = String(labels[i][0]).trim();
    const val = cleanValue(values[i][0]);

    if (label && val !== null) {
      rows.push({
        week_start: weekDate,
        metric: label,
        value: val,
        tab: tabName
      });
    }
  }

  if (rows.length > 0) {
    const result = supabaseUpsert(supabaseTable, rows, "week_start,metric,tab");
    Logger.log("Synced " + rows.length + " rows from " + tabName + " week " + weekDate);
    return result;
  }

  return { count: 0 };
}

// ============================================================
// MAIN SYNC FUNCTIONS
// ============================================================

/**
 * Sync the latest week from ALL configured tabs.
 * Call this manually or set as a daily cron trigger.
 */
function syncLatestWeek() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];

  for (const config of TAB_CONFIG) {
    const sheet = ss.getSheetByName(config.tabName);
    if (!sheet) {
      Logger.log("Skipping tab (not found): " + config.tabName);
      continue;
    }

    const latest = findLatestWeekColumn(sheet, config.headerRow);
    if (!latest) {
      Logger.log("No week columns found in: " + config.tabName);
      continue;
    }

    const weekDate = parseWeekDate(latest.header);
    if (!weekDate) {
      Logger.log("Could not parse date from header: " + latest.header);
      continue;
    }

    Logger.log("Syncing " + config.tabName + " → " + config.supabaseTable + " | Week: " + weekDate + " (col " + latest.col + ")");
    const result = syncColumnGeneric(config.tabName, config.supabaseTable, latest.col, weekDate);
    results.push({ tab: config.tabName, week: weekDate, ...result });
  }

  Logger.log("Sync complete: " + JSON.stringify(results));
  return results;
}

/**
 * Sync ALL weeks (full backfill) from a specific tab.
 * Use this once to populate Supabase with historical data.
 */
function backfillAllWeeks(tabName, supabaseTable, headerRow, dataStartCol) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];

  let total = 0;
  for (let col = dataStartCol - 1; col < headers.length; col++) {
    if (!headers[col]) continue;
    const weekDate = parseWeekDate(headers[col]);
    if (!weekDate) continue;

    const result = syncColumnGeneric(tabName, supabaseTable, col + 1, weekDate);
    if (result) total += result.count || 0;

    // Avoid quota limits
    Utilities.sleep(200);
  }

  Logger.log("Backfill complete for " + tabName + ": " + total + " total rows");
}

/**
 * Backfill ALL configured tabs (run once).
 */
function backfillAll() {
  for (const config of TAB_CONFIG) {
    Logger.log("Backfilling: " + config.tabName);
    backfillAllWeeks(config.tabName, config.supabaseTable, config.headerRow, config.dataStartCol);
  }
}

// ============================================================
// TRIGGERS
// ============================================================

/**
 * On-edit trigger: when someone edits the sheet, check if it's
 * in a week column and sync that column's data.
 */
function onEditTrigger(e) {
  if (!e) return;

  const sheet = e.source.getActiveSheet();
  const tabName = sheet.getName();

  // Find if this tab is in our config
  const config = TAB_CONFIG.find(c => c.tabName === tabName);
  if (!config) return; // Not a monitored tab

  const col = e.range.getColumn();
  if (col < config.dataStartCol) return; // Editing labels, not data

  // Get the week date from this column's header
  const header = sheet.getRange(config.headerRow, col).getValue();
  const weekDate = parseWeekDate(header);
  if (!weekDate) return;

  // Debounce: wait 2 seconds for batch edits
  Utilities.sleep(2000);

  // Sync this column
  syncColumnGeneric(config.tabName, config.supabaseTable, col, weekDate);
}

// ============================================================
// DISCOVERY — Run this first to see your sheet structure
// ============================================================

/**
 * List all tabs and their structure. Run this first to understand
 * your sheet layout, then update TAB_CONFIG accordingly.
 */
function discoverSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  const report = [];
  for (const sheet of sheets) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    // Read first 3 rows to understand structure
    const sampleRows = Math.min(lastRow, 5);
    const sampleCols = Math.min(lastCol, 10);
    const sample = sheet.getRange(1, 1, sampleRows, sampleCols).getValues();

    report.push({
      tab: name,
      rows: lastRow,
      cols: lastCol,
      sampleHeaders: sample[0],
      sampleRow1: sample.length > 1 ? sample[1] : [],
      sampleRow2: sample.length > 2 ? sample[2] : []
    });
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

// ============================================================
// TEST FUNCTIONS
// ============================================================

/**
 * Test Supabase connection. Run this first to verify credentials.
 */
function testConnection() {
  const url = SUPABASE_URL + "/rest/v1/";
  const options = {
    method: "get",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();

  if (code === 200) {
    Logger.log("SUCCESS: Supabase connection works!");
  } else {
    Logger.log("ERROR " + code + ": " + response.getContentText());
  }
}

/**
 * Test sync: preview what would be sent without writing to Supabase.
 */
function testPreview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  Logger.log("Spreadsheet: " + ss.getName());
  Logger.log("Tabs: " + sheets.map(s => s.getName()).join(", "));

  // Try to find latest week in first configured tab
  for (const config of TAB_CONFIG) {
    const sheet = ss.getSheetByName(config.tabName);
    if (!sheet) {
      Logger.log("Tab '" + config.tabName + "' not found. Available: " + sheets.map(s => s.getName()).join(", "));
      continue;
    }

    const latest = findLatestWeekColumn(sheet, config.headerRow);
    Logger.log("Tab: " + config.tabName + " | Latest column: " + JSON.stringify(latest));
  }
}
