/**
 * Salary Master — sync Location column across all monthly (C) tabs
 *
 * Source of truth: "Apr 26 (C)"
 * Target tabs:     every other "{Mon} {YY} (C)" tab (including hidden ones)
 * Scope:           rows where "Active emp" column === "Active"
 *
 * Sheet ID: 1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w
 *
 * Behaviour:
 *  - Detects "Location" and "Active" columns by HEADER_ROW=7 header text
 *    (case-insensitive). If "Location" header is missing on a target tab,
 *    inserts a new column C and labels it "Location" before syncing.
 *  - Match key: column A (staff number) first; falls back to normalised name in col B.
 *
 * Functions:
 *  - previewLocationSync() — dry run, logs everything that would change
 *  - applyLocationSync()   — writes changes (inserts columns + updates locations)
 */

const SOURCE_TAB = "Apr 26 (C)";
const HEADER_ROW = 7;
const DATA_START_ROW = 8;

const COL_A_NUM = 1;
const COL_B_STAFF = 2;
const LOCATION_HEADER = "Location";
const ACTIVE_HEADER_KEYWORDS = ["active emp", "active"]; // matched in order

const TAB_PATTERN = /^(\w{3,9})\s+(\d{2})\s+\(C\)$/;

// Scope: only sync these specific monthly tabs (Apr 26 is the source — excluded).
// Covers Jan 2025 → Mar 2026 inclusive, plus May 2026. Older tabs are left untouched.
const TARGET_TAB_NAMES = [
  "January 25 (C)", "February 25 (C)", "March 25 (C)", "April 25 (C)",
  "May 25 (C)", "June 25 (C)", "July 25 (C)", "Aug 25 (C)",
  "Sep 25 (C)", "Oct 25 (C)", "Nov 25 (C)", "Dec 25 (C)",
  "Jan 26 (C)", "Feb 26 (C)", "Mar 26 (C)", "May 26 (C)"
];
const TARGET_TAB_SET = (function () {
  const s = {};
  for (let i = 0; i < TARGET_TAB_NAMES.length; i++) s[TARGET_TAB_NAMES[i]] = true;
  return s;
})();

function normaliseName(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function findHeaderColumn(headers, predicate) {
  for (let i = 0; i < headers.length; i++) {
    if (predicate(String(headers[i] || "").trim().toLowerCase())) {
      return i + 1; // 1-based
    }
  }
  return -1;
}

function detectColumns(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 6);
  const headers = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0];

  const locationCol = findHeaderColumn(headers, h => h === LOCATION_HEADER.toLowerCase());
  let activeCol = -1;
  for (const kw of ACTIVE_HEADER_KEYWORDS) {
    activeCol = findHeaderColumn(headers, h => h.indexOf(kw) === 0 || h === kw);
    if (activeCol !== -1) break;
  }
  return { locationCol, activeCol, headers };
}

function ensureLocationColumn(sheet) {
  const det = detectColumns(sheet);
  if (det.locationCol !== -1) {
    return { locationCol: det.locationCol, activeCol: det.activeCol, inserted: false };
  }
  // Insert new col C, label it "Location"
  sheet.insertColumnBefore(3);
  sheet.getRange(HEADER_ROW, 3).setValue(LOCATION_HEADER);
  // Re-detect Active column (it has shifted +1 if it was at col >= 3)
  const det2 = detectColumns(sheet);
  return { locationCol: 3, activeCol: det2.activeCol, inserted: true };
}

function buildSourceMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName(SOURCE_TAB);
  if (!src) throw new Error("Source tab not found: " + SOURCE_TAB);

  const det = detectColumns(src);
  if (det.locationCol === -1) {
    throw new Error("Source tab '" + SOURCE_TAB + "' has no 'Location' header in row " + HEADER_ROW);
  }

  const lastRow = src.getLastRow();
  if (lastRow < DATA_START_ROW) throw new Error("Source tab has no data rows");

  const lastCol = Math.max(src.getLastColumn(), det.locationCol);
  const values = src.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, lastCol).getValues();

  const byNum = {};
  const byName = {};
  let mapped = 0;

  for (const row of values) {
    const num = row[COL_A_NUM - 1];
    const name = row[COL_B_STAFF - 1];
    const loc = String(row[det.locationCol - 1] || "").trim();
    if (!loc) continue;
    if (num !== "" && num !== null && num !== undefined) {
      byNum[String(num).trim()] = loc;
      mapped++;
    }
    const nk = normaliseName(name);
    if (nk) byName[nk] = loc;
  }

  Logger.log("Source map built from " + SOURCE_TAB + " (Location at col " + det.locationCol + "): " + mapped + " rows.");
  return { byNum, byName };
}

function syncTabLocations(sheet, map, dryRun) {
  const tabName = sheet.getName();
  const lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) {
    return { tab: tabName, activeRows: 0, updates: 0, unchanged: 0, missing: 0, columnInserted: false };
  }

  // Detect current header positions on the actual sheet (no shift assumed yet).
  const detected = detectColumns(sheet);
  let readActiveCol = detected.activeCol;       // where Active currently lives (pre-insert)
  let readLocationCol = detected.locationCol;   // -1 if Location header doesn't exist yet
  let writeLocationCol;                          // where we'll write Location values
  let columnInserted = false;

  if (detected.locationCol === -1) {
    columnInserted = true;
    writeLocationCol = 3; // new col C
    if (!dryRun) {
      // Mutate the sheet: insert new col C, then re-detect (Active will have shifted +1)
      const res = ensureLocationColumn(sheet);
      readActiveCol = res.activeCol;
      readLocationCol = res.locationCol;
      writeLocationCol = res.locationCol;
    }
    // In dry-run we DO NOT shift: data is read from the unmutated sheet, so
    // readActiveCol stays at its pre-insert position and readLocationCol stays -1.
  } else {
    writeLocationCol = detected.locationCol;
  }

  if (readActiveCol === -1) {
    Logger.log("WARN " + tabName + ": no 'Active' header found in row " + HEADER_ROW + " — cannot filter active rows, skipping tab.");
    return { tab: tabName, activeRows: 0, updates: 0, unchanged: 0, missing: 0, columnInserted: columnInserted, skipped: "no_active_header" };
  }

  const lastCol = Math.max(sheet.getLastColumn(), writeLocationCol, readActiveCol);
  const values = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, lastCol).getValues();

  const newLocations = [];
  let activeRows = 0;
  let missing = 0;
  let unchanged = 0;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const active = String(row[readActiveCol - 1] || "").trim().toLowerCase();
    if (active !== "active") continue;
    activeRows++;

    const num = row[COL_A_NUM - 1];
    const nameKey = normaliseName(row[COL_B_STAFF - 1]);
    let target = null;
    let key = null;

    if (num !== "" && num !== null && num !== undefined) {
      const k = String(num).trim();
      if (map.byNum[k]) { target = map.byNum[k]; key = "#" + k; }
    }
    if (!target && nameKey && map.byName[nameKey]) {
      target = map.byName[nameKey];
      key = nameKey;
    }

    if (!target) { missing++; continue; }

    const oldLoc = readLocationCol === -1 ? "" : String(row[readLocationCol - 1] || "").trim();
    if (oldLoc === target) { unchanged++; continue; }

    newLocations.push({
      rowIndex: DATA_START_ROW + i,
      oldLoc: oldLoc,
      newLoc: target,
      key: key
    });
  }

  if (!dryRun && newLocations.length > 0) {
    for (const u of newLocations) {
      sheet.getRange(u.rowIndex, writeLocationCol).setValue(u.newLoc);
    }
  }

  Logger.log(
    tabName + ": locCol=" + writeLocationCol +
    (columnInserted ? " (NEW)" : "") +
    " activeCol=" + readActiveCol +
    " active=" + activeRows +
    " updates=" + newLocations.length +
    " unchanged=" + unchanged +
    " missing-from-source=" + missing
  );
  if (newLocations.length > 0) {
    const sample = newLocations.slice(0, 5)
      .map(u => "  row " + u.rowIndex + " [" + u.key + "]: '" + u.oldLoc + "' → '" + u.newLoc + "'")
      .join("\n");
    Logger.log("Sample changes:\n" + sample);
  }

  return {
    tab: tabName,
    activeRows: activeRows,
    updates: newLocations.length,
    unchanged: unchanged,
    missing: missing,
    columnInserted: columnInserted
  };
}

function _run(dryRun) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = buildSourceMap();
  const sheets = ss.getSheets();
  const results = [];

  for (const sheet of sheets) {
    const name = sheet.getName();
    if (!TAB_PATTERN.test(name)) continue;
    if (name === SOURCE_TAB) continue;
    if (!TARGET_TAB_SET[name]) continue;
    results.push(syncTabLocations(sheet, map, dryRun));
  }

  const totals = results.reduce((acc, r) => ({
    tabs: acc.tabs + 1,
    activeRows: acc.activeRows + r.activeRows,
    updates: acc.updates + r.updates,
    unchanged: acc.unchanged + r.unchanged,
    missing: acc.missing + r.missing,
    columnsInserted: acc.columnsInserted + (r.columnInserted ? 1 : 0)
  }), { tabs: 0, activeRows: 0, updates: 0, unchanged: 0, missing: 0, columnsInserted: 0 });

  Logger.log("");
  Logger.log("=== " + (dryRun ? "DRY RUN" : "APPLIED") + " — SUMMARY ===");
  Logger.log("Tabs processed: " + totals.tabs);
  Logger.log("Tabs needing new Location col C: " + totals.columnsInserted);
  Logger.log("Active rows scanned: " + totals.activeRows);
  Logger.log("Location updates: " + totals.updates);
  Logger.log("Already correct: " + totals.unchanged);
  Logger.log("Active staff not in source map: " + totals.missing);
  return { totals: totals, perTab: results };
}

function previewLocationSync() {
  return _run(true);
}

function applyLocationSync() {
  return _run(false);
}

// ----------------------------------------------------------------
// Web App wrapper — lets us invoke preview/apply via HTTPS with a token.
// Deploy as Web App: Execute as=Me, Who has access=Anyone.
// Call with ?token=<TOKEN>&fn=preview|apply
// ----------------------------------------------------------------

const WEBAPP_TOKEN = "19faa2f93ade49c1e8a2971722fd06ee6493a9a99d83f173";

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.token !== WEBAPP_TOKEN) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "unauthorised" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  let result;
  try {
    if (params.fn === "apply") {
      result = applyLocationSync();
    } else if (params.fn === "probe") {
      result = probeTabs();
    } else {
      result = previewLocationSync();
    }
  } catch (err) {
    result = { error: String(err), stack: err && err.stack };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

// Diagnostic: list each (C) tab's row 5-8 contents (header zone + first data row)
function probeTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const out = [];
  for (const sheet of sheets) {
    const name = sheet.getName();
    if (!TAB_PATTERN.test(name)) continue;
    const lastRow = sheet.getLastRow();
    const lastCol = Math.min(sheet.getLastColumn(), 8);
    if (lastRow < 5 || lastCol < 1) {
      out.push({ tab: name, lastRow: lastRow, lastCol: sheet.getLastColumn(), note: "too small" });
      continue;
    }
    const endRow = Math.min(lastRow, 9);
    const vals = sheet.getRange(5, 1, endRow - 5 + 1, lastCol).getValues();
    out.push({
      tab: name,
      lastRow: lastRow,
      lastCol: sheet.getLastColumn(),
      rows5to9: vals
    });
  }
  return out;
}
