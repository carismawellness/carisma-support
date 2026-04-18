/**
 * Carisma Cockpit — Salary Master Sheet → Supabase ETL
 *
 * This Google Apps Script runs inside the Salary Master Google Sheet.
 * Sheet ID: 1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w
 *
 * Layout: Monthly tabs named "{Mon} {YY} (C)" (e.g. "Apr 26 (C)", "Mar 26 (C)").
 * Top rows 1-6: Location summary (InterContinental Total, Hugos Total, etc.)
 * Row 7+: Staff list with columns:
 *   #(A), Staff(B), Cash/Gross(C), Active(D), Base Salary Net(E),
 *   J2 Base Salary Gross(F), Part-time(G), Off days(H), Target reached(I), Extra govt bonus(J)
 *
 * Also has location-level salary totals at top (rows 2-5) for each spa.
 *
 * Target Supabase table: hr_weekly (monthly salary data supplements HC% tracking)
 */

// ============================================================
// CONFIGURATION
// ============================================================

const SUPABASE_URL = "https://praceahubcvbrewuqejh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNlYWh1YmN2YnJld3VxZWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE2NTEzOCwiZXhwIjoyMDkxNzQxMTM4fQ.sp3c1FogKB9Dr4xlNBAZEr3QMEKH9XKQiu-RgJe12us";

// Monthly calculation tabs follow pattern: "{Mon} {YY} (C)"
const CALC_TAB_PATTERN = /^(\w{3,9})\s+(\d{2})\s+\(C\)$/;

// Location names from summary rows (rows 2-5)
const LOCATIONS = [
  "InterContinental", "Hugos", "Hyatt", "Excelsior",
  "Ramla", "Labranda", "Sunny Coast", "Novotel"
];

// Column indices for staff rows (1-based)
const COL = {
  NUMBER: 1,       // A — staff number
  STAFF: 2,        // B — staff name
  CASH_GROSS: 3,   // C — Cash or Gross
  ACTIVE: 4,       // D — Active employee / Past employee
  BASE_NET: 5,     // E — Base Salary (Net)
  BASE_GROSS: 6,   // F — J2 Base salary (Gross)
  PART_TIME: 7,    // G — Part-time
  OFF_DAYS: 8,     // H — Off days
  TARGET: 9,       // I — Target reached
  EXTRA_BONUS: 10  // J — Extra govt bonus
};

const MONTHS = {
  Jan: 0, January: 0, Feb: 1, February: 1, Mar: 2, March: 2,
  Apr: 3, April: 3, May: 4, Jun: 5, June: 5,
  Jul: 6, July: 6, Aug: 7, August: 7, Sep: 8, September: 8,
  Oct: 9, October: 9, Nov: 10, November: 10, Dec: 11, December: 11
};

// ============================================================
// SHARED UTILITIES
// ============================================================

function parseTabMonth(tabName) {
  const match = tabName.match(CALC_TAB_PATTERN);
  if (!match) return null;
  const monthStr = match[1];
  const yearStr = "20" + match[2];
  const monthNum = MONTHS[monthStr];
  if (monthNum === undefined) return null;
  // Return first day of month as YYYY-MM-DD
  const d = new Date(parseInt(yearStr), monthNum, 1);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function cleanValue(val) {
  if (val === "" || val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val.includes("#REF") || val.includes("#N/A") || val.includes("#DIV") || val === "FALSE") return null;
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
// CORE SYNC
// ============================================================

function getCalcTabNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()
    .map(s => s.getName())
    .filter(name => CALC_TAB_PATTERN.test(name));
}

function syncTab(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tabName);
  if (!sheet) return null;

  const monthDate = parseTabMonth(tabName);
  if (!monthDate) return null;

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 7) return { count: 0 };

  // --- Location summary from top rows ---
  // Rows 2-5 contain location totals: col B = name, col D = sales value, col H = second location name
  const summaryData = sheet.getRange(1, 1, 6, Math.min(lastCol, 10)).getValues();
  const locationRows = [];

  for (let i = 1; i <= 4; i++) {
    const row = summaryData[i];
    // Left side location (col B)
    const loc1Name = String(row[1] || "").replace(" Total", "").trim();
    const loc1Sales = cleanValue(row[3]); // col D = "Sales" value
    if (loc1Name && loc1Sales !== null) {
      locationRows.push({
        month: monthDate,
        metric: "total_salary_cost",
        location: loc1Name,
        value: loc1Sales,
        tab: tabName
      });
    }
    // Right side location (col H)
    const loc2Name = String(row[7] || "").replace(" Total", "").trim();
    const loc2Sales = cleanValue(row[8]); // col I
    if (loc2Name && loc2Sales !== null) {
      locationRows.push({
        month: monthDate,
        metric: "total_salary_cost",
        location: loc2Name,
        value: loc2Sales,
        tab: tabName
      });
    }
  }

  // --- Active headcount summary ---
  const staffData = sheet.getRange(8, 1, lastRow - 7, 6).getValues();
  let activeCount = 0;
  let totalBaseSalary = 0;

  for (const row of staffData) {
    const status = String(row[COL.ACTIVE - 1] || "").trim().toLowerCase();
    if (status === "active") {
      activeCount++;
      const salary = cleanValue(row[COL.BASE_NET - 1]);
      if (salary !== null) totalBaseSalary += salary;
    }
  }

  locationRows.push({
    month: monthDate,
    metric: "active_headcount",
    location: "All",
    value: activeCount,
    tab: tabName
  });

  locationRows.push({
    month: monthDate,
    metric: "total_base_salary_net",
    location: "All",
    value: Math.round(totalBaseSalary * 100) / 100,
    tab: tabName
  });

  if (locationRows.length > 0) {
    const result = supabaseUpsert("salary_monthly", locationRows);
    Logger.log("Synced " + locationRows.length + " rows from " + tabName);
    return result;
  }
  return { count: 0 };
}

// ============================================================
// MAIN SYNC FUNCTIONS
// ============================================================

function syncLatestMonth() {
  const tabs = getCalcTabNames();
  if (tabs.length === 0) {
    Logger.log("No calculation tabs found");
    return;
  }
  // First tab is typically the most recent
  const latestTab = tabs[0];
  Logger.log("Syncing latest tab: " + latestTab);
  return syncTab(latestTab);
}

function backfillAll() {
  const tabs = getCalcTabNames();
  Logger.log("Found " + tabs.length + " calc tabs: " + tabs.join(", "));

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
  if (!CALC_TAB_PATTERN.test(tabName)) return;

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
    const sampleCols = Math.min(lastCol, 10);
    const sample = sampleRows > 0 && sampleCols > 0
      ? sheet.getRange(1, 1, sampleRows, sampleCols).getValues()
      : [];
    report.push({ tab: name, rows: lastRow, cols: lastCol, isCalcTab: CALC_TAB_PATTERN.test(name), sample: sample });
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
  const tabs = getCalcTabNames();
  Logger.log("Calc tabs found: " + tabs.join(", "));
  if (tabs.length > 0) {
    Logger.log("Latest: " + tabs[0] + " → month: " + parseTabMonth(tabs[0]));
  }
}
