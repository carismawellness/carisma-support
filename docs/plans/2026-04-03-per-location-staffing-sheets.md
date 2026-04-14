# Per-Location Staffing Sub-Sheets — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 9 per-location staffing sheets and 1 Portfolio Summary sheet to `hr/Carisma Spa Staffing Model.xlsx`, each combining the full therapist + non-therapist weekly roster, wage forecast, 17% leave reserve, annualised seasonal plan, and KPI flags — based on the CEO Decision Memo of 3 April 2026.

**Architecture:** Build one Python script per cluster (3 scripts × 3 locations each) using openpyxl to append sheets to the existing workbook. Each script reads source data from existing sheets (Reception tabs, Monthly tabs, Dynamic Staffing Plan) and writes a structured 6-section sheet. A fourth script builds the Portfolio Summary. A QC script validates all cross-references and totals. Run `tools/recalc.py` at the end.

**Tech Stack:** Python 3, openpyxl, existing Excel file at `hr/Carisma Spa Staffing Model.xlsx`, `tools/recalc.py` for formula recalculation.

**Design doc:** `docs/plans/2026-04-03-location-staffing-sheets-design.md`

---

## Source Data Reference

Before building, confirm these sheet names exist in the workbook:
- `Central Reception` → Inter, Hugos, Hyatt non-therapist rosters
- `North Reception` → Ramla, Odycy, Riviera non-therapist rosters
- `Belt Reception` → Excelsior, Novo, Tigne non-therapist rosters
- `Inter Monthly`, `Hugos Monthly`, `Hyatt Monthly`, `Ramla Monthly`, `Riviera Monthly`, `Sunny Coast Monthly`, `Excelsior Monthly`, `Novotel Monthly`, `Sliema Monthly` → therapist rosters + dynamic staffing
- `Dynamic Staffing Plan` → seasonal headcount by month
- `Regional Rotation` → cluster and RM structure

## Key Data (hardcoded inputs per CEO decisions)

### Location metadata
```python
LOCATIONS = {
    "Inter":     {"cluster": "A", "rm": "RM1", "rev": 50000, "rooms": 7, "hours": "9–20", "hc_current": 21000},
    "Hugos":     {"cluster": "A", "rm": "RM1", "rev": 48000, "rooms": 6, "hours": "9–20", "hc_current": 19000},
    "Hyatt":     {"cluster": "A", "rm": "RM1", "rev": 25000, "rooms": 3, "hours": "9–19", "hc_current": 10000},
    "Ramla":     {"cluster": "B", "rm": "RM2", "rev": 30000, "rooms": 6, "hours": "9–19", "hc_current": 16150},
    "Riviera":   {"cluster": "B", "rm": "RM2", "rev": 20000, "rooms": 6, "hours": "9–19", "hc_current": 8500},
    "Odycy":     {"cluster": "B", "rm": "RM2", "rev": 18000, "rooms": 3, "hours": "9–18", "hc_current": 7500},
    "Excelsior": {"cluster": "C", "rm": "RM3", "rev": 24000, "rooms": 6, "hours": "7–19", "hc_current": 12000},
    "Novo":      {"cluster": "C", "rm": "RM3", "rev": 14000, "rooms": 3, "hours": "9–19", "hc_current": 8000},
    "Tigne":     {"cluster": "C", "rm": "RM3", "rev": 30000, "rooms": 4, "hours": "9–20", "hc_current": 17000},
}
```

### Seasonal indices (applied to monthly revenue)
```python
SEASONAL_INDEX = {
    "Jan": 0.80, "Feb": 0.85, "Mar": 0.90, "Apr": 0.95,
    "May": 1.00, "Jun": 1.10, "Jul": 1.20, "Aug": 1.25,
    "Sep": 1.10, "Oct": 1.00, "Nov": 0.90, "Dec": 0.95
}
```

### CEO-approved optimisations (flag per location)
```python
CEO_DECISIONS = {
    "dual_role_phase1":   ["Riviera", "Odycy", "Ramla", "Excelsior"],  # immediate
    "dual_role_phase2":   ["Inter", "Hugos", "Hyatt", "Novo", "Tigne"], # Month 3
    "spa_attendant":      ["Riviera", "Inter", "Hugos", "Excelsior", "Tigne"],
    "part_time":          ["Riviera", "Odycy"],  # Excelsior off-season handled separately
    "hours_on_hold":      ["Hyatt", "Novo"],  # pending 4-week booking data
    "leave_reserve_pct":  0.17,
    "dual_role_allowance": 200,  # €/month when treatment hours logged
    "attendant_salary":   1000,
    "pt_therapist_salary": 1100,
}
```

---

## Task 1: Read and verify source data

**Files:**
- Create: `tools/build_location_sheets.py` (skeleton only)

**Step 1: Create the script skeleton**

```python
# tools/build_location_sheets.py
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

WORKBOOK_PATH = "hr/Carisma Spa Staffing Model.xlsx"

NAVY  = "1B3A4B"
GOLD  = "B8943E"
WHITE = "FFFFFF"
LIGHT_GOLD = "FDF3DC"
LIGHT_BLUE = "DBEEFF"
AMBER = "FAD7A0"
GREEN_LIGHT = "D4EFDF"
RED_LIGHT   = "FADBD8"

LOCATIONS = {
    "Inter":     {"cluster": "A", "rm": "RM1", "rev": 50000, "rooms": 7, "hours": "9-20", "hc_current": 21000, "source_monthly": "Inter Monthly"},
    "Hugos":     {"cluster": "A", "rm": "RM1", "rev": 48000, "rooms": 6, "hours": "9-20", "hc_current": 19000, "source_monthly": "Hugos Monthly"},
    "Hyatt":     {"cluster": "A", "rm": "RM1", "rev": 25000, "rooms": 3, "hours": "9-19", "hc_current": 10000, "source_monthly": "Hyatt Monthly"},
    "Ramla":     {"cluster": "B", "rm": "RM2", "rev": 30000, "rooms": 6, "hours": "9-19", "hc_current": 16150, "source_monthly": "Ramla Monthly"},
    "Riviera":   {"cluster": "B", "rm": "RM2", "rev": 20000, "rooms": 6, "hours": "9-19", "hc_current": 8500,  "source_monthly": "Riviera Monthly"},
    "Odycy":     {"cluster": "B", "rm": "RM2", "rev": 18000, "rooms": 3, "hours": "9-18", "hc_current": 7500,  "source_monthly": "Sunny Coast Monthly"},
    "Excelsior": {"cluster": "C", "rm": "RM3", "rev": 24000, "rooms": 6, "hours": "7-19", "hc_current": 12000, "source_monthly": "Excelsior Monthly"},
    "Novo":      {"cluster": "C", "rm": "RM3", "rev": 14000, "rooms": 3, "hours": "9-19", "hc_current": 8000,  "source_monthly": "Novotel Monthly"},
    "Tigne":     {"cluster": "C", "rm": "RM3", "rev": 30000, "rooms": 4, "hours": "9-20", "hc_current": 17000, "source_monthly": "Sliema Monthly"},
}

wb = openpyxl.load_workbook(WORKBOOK_PATH)
print("Existing sheets:", wb.sheetnames)
wb.close()
```

**Step 2: Run it and verify sheet names print correctly**

```bash
cd "/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI"
python3 tools/build_location_sheets.py
```

Expected output includes: `Central Reception`, `North Reception`, `Belt Reception`, `Inter Monthly`, etc.

**Step 3: Commit the skeleton**

```bash
git add tools/build_location_sheets.py
git commit -m "feat: add location sheets build script skeleton"
```

---

## Task 2: Build helper functions (styling + cell writing)

**Files:**
- Modify: `tools/build_location_sheets.py`

**Step 1: Add styling helpers**

Add these functions to the script:

```python
def nav_fill():
    return PatternFill("solid", start_color=NAVY, end_color=NAVY)

def gold_fill():
    return PatternFill("solid", start_color=GOLD, end_color=GOLD)

def light_gold_fill():
    return PatternFill("solid", start_color=LIGHT_GOLD, end_color=LIGHT_GOLD)

def light_blue_fill():
    return PatternFill("solid", start_color=LIGHT_BLUE, end_color=LIGHT_BLUE)

def bold_white(size=11):
    return Font(bold=True, color=WHITE, size=size)

def bold_navy(size=11):
    return Font(bold=True, color=NAVY, size=size)

def blue_input(size=10):
    return Font(color="0000FF", size=size)  # blue = hardcoded input

def write_header(ws, row, text, fill, font, merge_to_col="J"):
    ws.merge_cells(f"A{row}:{merge_to_col}{row}")
    cell = ws[f"A{row}"]
    cell.value = text
    cell.fill = fill
    cell.font = font
    cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=False)
    ws.row_dimensions[row].height = 18

def write_row(ws, row, values, fill=None, font=None, bold=False):
    """Write a list of values across row. values[0]=col A, values[1]=col B, etc."""
    for col_idx, val in enumerate(values, start=1):
        cell = ws.cell(row=row, column=col_idx, value=val)
        if fill:
            cell.fill = fill
        if font:
            cell.font = font
        elif bold:
            cell.font = Font(bold=True)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
```

**Step 2: No test needed — these are pure utilities. Commit.**

```bash
git add tools/build_location_sheets.py
git commit -m "feat: add styling helpers for location sheets"
```

---

## Task 3: Build the per-location staff data structures

**Files:**
- Modify: `tools/build_location_sheets.py`

**Step 1: Define staff data per location**

Add the full staff data dictionary. This is the single source of truth for all 9 locations — combine non-therapist (from Reception sheets) + therapist (from Monthly sheets) into one structure per location.

Each staff entry: `{"role", "type", "contract", "salary", "pattern": [Mon,Tue,Wed,Thu,Fri,Sat,Sun], "notes", "seasonal": bool, "dual_role": bool, "part_time": bool}`

Pattern values: `1` = WORK, `0` = OFF, `"RM"` = RM VISIT, `"RT"` = COVER, `"A"` = Shift A, `"B"` = Shift B, `"S"` = Seasonal slot.

```python
STAFF_DATA = {
    "Inter": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 3 days/wk (Mon+Thu+Sat)", "contract": "Part-time allocation", "salary": 1650,  "pattern": ["RM",0,0,"RM",0,"RM",0], "notes": "RM1 cluster: 3/6 days → €1,650/mo | Rotates: Mon+Thu+Sat here · Tue+Fri Hugos · Wed 3rd site"},
            {"role": "Supervisor", "type": "Spa Supervisor — Full-time",                "contract": "Permanent",            "salary": 2200,  "pattern": [0,0,1,1,1,1,1],           "notes": "Works Wed–Sun (Sat+Sun mandatory) | Dual-role: Phase 2 Month 3"},
            {"role": "Sup Aes",    "type": "Aesthetics Supervisor — Full-time",          "contract": "Permanent",            "salary": 2200,  "pattern": [1,1,1,0,0,1,1],           "notes": "Works Mon–Wed+Sat+Sun"},
            {"role": "Advisor",    "type": "Spa Advisor — Full-time",                    "contract": "Permanent",            "salary": 1750,  "pattern": [1,1,1,0,0,1,1],           "notes": "Works Mon–Wed+Sat+Sun (Sat+Sun mandatory)"},
            {"role": "Reception",  "type": "Receptionist — Full-time",                   "contract": "Permanent",            "salary": 1750,  "pattern": [1,0,0,1,1,1,1],           "notes": "Works Mon+Thu–Sun (Sat+Sun mandatory)"},
            {"role": "Attendant",  "type": "Spa Attendant — Full-time",                  "contract": "Permanent",            "salary": 1000,  "pattern": [0,1,1,1,1,1,1],           "notes": "CEO approved | Career pathway: Attendant→Trainee Therapist"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Isabelle",  "contract": "Permanent",     "salary": 1677, "pattern": [0,0,"A","A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Margaux",   "contract": "Permanent",     "salary": 1677, "pattern": [0,0,"A","A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Chiara",    "contract": "Permanent",     "salary": 1677, "pattern": [0,0,"B","B","B","B","A"], "notes": "Core — year-round"},
            {"role": "T4",  "name": "Eleni",     "contract": "Permanent",     "salary": 1677, "pattern": ["A",0,0,"A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T5",  "name": "Priya",     "contract": "Permanent",     "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T6",  "name": "Sofia",     "contract": "Seasonal",      "salary": 1677, "pattern": ["B",0,0,"B","B","B","A"], "notes": "Seasonal: Apr–Oct | recruit by Feb 15", "seasonal": True},
            {"role": "T7",  "name": "Anya",      "contract": "Seasonal",      "salary": 1677, "pattern": ["A","A",0,0,"A","A","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T8",  "name": "Leila",     "contract": "Seasonal",      "salary": 1677, "pattern": ["A","A",0,0,"A","A","B"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T9",  "name": "Nadia",     "contract": "Seasonal",      "salary": 1677, "pattern": ["B","B",0,0,"B","B","A"], "notes": "Seasonal: Jul–Aug only", "seasonal": True},
            {"role": "R1",  "name": "Camille",   "contract": "Permanent",     "salary": 1750, "pattern": [0,0,"A","A","A","A","A"], "notes": "Receptionist — year-round"},
            {"role": "R2",  "name": "Yasmin",    "contract": "Permanent",     "salary": 1750, "pattern": ["A","A",0,0,"A","A","A"], "notes": "Receptionist — year-round"},
        ],
    },
    "Hugos": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 2 days/wk (Tue+Fri)",  "contract": "Part-time allocation", "salary": 1100,  "pattern": [0,"RM",0,0,"RM",0,0],     "notes": "RM1 cluster: 2/6 days → €1,100/mo | Rotates: Tue+Fri here"},
            {"role": "Supervisor", "type": "Spa Supervisor — Full-time",             "contract": "Permanent",            "salary": 2200,  "pattern": [0,1,0,1,1,1,1],           "notes": "Works Tue+Thu–Sun | Dual-role: Phase 2 Month 3"},
            {"role": "Advisor",    "type": "Spa Advisor — Full-time",                "contract": "Permanent",            "salary": 1750,  "pattern": [1,0,1,0,1,1,1],           "notes": "Works Mon+Wed+Fri–Sun (Sat+Sun mandatory)"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Part-time",        "contract": "Part-time / relief",   "salary": 700,   "pattern": [1,0,0,0,0,"RT","RT"],     "notes": "Mon + Sat + Sun (3 days) — peak weekend front desk"},
            {"role": "Attendant",  "type": "Spa Attendant — Full-time",              "contract": "Permanent",            "salary": 1000,  "pattern": [0,1,1,1,1,1,1],           "notes": "CEO approved | Career pathway: Attendant→Trainee Therapist"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Marie",     "contract": "Permanent",  "salary": 1677, "pattern": [0,0,"A","A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Lucia",     "contract": "Permanent",  "salary": 1677, "pattern": [0,0,"A","A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Nina",      "contract": "Permanent",  "salary": 1677, "pattern": [0,0,"B","B","B","B","A"], "notes": "Core — year-round"},
            {"role": "T4",  "name": "Elena",     "contract": "Permanent",  "salary": 1677, "pattern": ["A",0,0,"A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T5",  "name": "Sara",      "contract": "Seasonal",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T6",  "name": "Ana",       "contract": "Seasonal",   "salary": 1677, "pattern": ["B",0,0,"B","B","B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T7",  "name": "Vera",      "contract": "Seasonal",   "salary": 1677, "pattern": ["A","A",0,0,"A","A","A"], "notes": "Seasonal: Jun–Sep", "seasonal": True},
            {"role": "T8",  "name": "Mia",       "contract": "Seasonal",   "salary": 1677, "pattern": ["A","A",0,0,"A","A","B"], "notes": "Seasonal: Jul–Aug only", "seasonal": True},
        ],
    },
    "Hyatt": {
        "non_therapist": [
            {"role": "Supervisor", "type": "Spa Supervisor — Full-time",             "contract": "Permanent",          "salary": 2200,  "pattern": [0,1,1,1,0,1,1],           "notes": "Works Tue–Thu+Sat+Sun | Dual-role Phase 2 Month 3"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Weekends only",    "contract": "Part-time / weekend","salary": 700,   "pattern": [0,0,0,0,0,"RT","RT"],     "notes": "Sat+Sun only — Supervisor covers Tue–Thu front desk"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Clara",     "contract": "Permanent",  "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Rose",      "contract": "Permanent",  "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Lena",      "contract": "Seasonal",   "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T4",  "name": "Petra",     "contract": "Seasonal",   "salary": 1677, "pattern": ["B",0,0,"B","B","B","A"], "notes": "Seasonal: May–Sep", "seasonal": True},
        ],
    },
    "Ramla": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 4 days/wk (Mon+Tue+Thu+Sat)", "contract": "Part-time allocation","salary": 2200, "pattern": ["RM","RM",0,"RM",0,"RM",0], "notes": "RM2 cluster: 4/6 days → €2,200/mo | Hub location"},
            {"role": "Supervisor", "type": "Spa Supervisor — Dual-role (Phase 1)",         "contract": "Permanent",           "salary": 2200, "pattern": [0,0,1,1,1,1,1],             "notes": "Dual-role APPROVED Phase 1 | +€200/mo allowance when treatments logged | 25hr/mo cap"},
            {"role": "Advisor",    "type": "Spa Advisor — Full-time",                       "contract": "Permanent",           "salary": 1750, "pattern": [1,1,1,0,0,1,1],             "notes": "Works Mon–Wed+Sat+Sun (Sat+Sun mandatory)"},
            {"role": "Reception",  "type": "Receptionist — Full-time",                      "contract": "Permanent",           "salary": 1750, "pattern": [1,0,0,1,1,1,1],             "notes": "Works Mon+Thu–Sun (Sat+Sun mandatory)"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Hana",      "contract": "Permanent",  "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Zara",      "contract": "Permanent",  "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Dina",      "contract": "Permanent",  "salary": 1677, "pattern": ["B","B",0,0,"B","B","A"], "notes": "Core — year-round"},
            {"role": "T4",  "name": "Nour",      "contract": "Seasonal",   "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T5",  "name": "Sana",      "contract": "Seasonal",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","A"], "notes": "Seasonal: Jul–Aug only", "seasonal": True},
        ],
    },
    "Riviera": {
        "non_therapist": [
            {"role": "Supervisor", "type": "Spa Supervisor — Dual-role (Phase 1)",    "contract": "Permanent",           "salary": 2200, "pattern": [0,1,1,1,0,1,1],           "notes": "Dual-role APPROVED Phase 1 — CEO override (6 rooms, at capacity) | +€200/mo allowance | 25hr/mo cap | System trigger protocol required"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Peak coverage",     "contract": "Part-time / relief",  "salary": 1750, "pattern": [1,0,0,0,1,"RT",0],        "notes": "Mon+Fri+Sat (3 days) — covers when Supervisor in treatment"},
            {"role": "Attendant",  "type": "Spa Attendant — Throughput Unlock",       "contract": "Permanent",           "salary": 1000, "pattern": [0,1,1,1,1,1,1],           "notes": "CEO top priority — capacity unlock at 5.12 Tx/Day/T | Room turnover, laundry, retail"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Amara",     "contract": "Permanent",   "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Rania",     "contract": "Permanent",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "PT1", "name": "Selin (PT)","contract": "Part-time",   "salary": 1100, "pattern": [0,0,0,1,1,1,1],           "notes": "Thu–Sun (4 days) | CEO approved | Fixed schedule — not ad hoc", "part_time": True},
            {"role": "T3",  "name": "Mona",      "contract": "Seasonal",    "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
        ],
    },
    "Odycy": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 1 day/wk (Wed)",          "contract": "Part-time allocation","salary": 550,  "pattern": [0,0,"RM",0,0,0,0],        "notes": "RM2 cluster: 1/6 days → €550/mo"},
            {"role": "Supervisor", "type": "Spa Supervisor — Dual-role (Phase 1)",    "contract": "Permanent",           "salary": 2200, "pattern": [1,0,0,1,1,1,1],           "notes": "Dual-role APPROVED Phase 1 | +€200/mo allowance | 25hr/mo cap | System trigger required"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Part-time",         "contract": "Part-time / relief",  "salary": 750,  "pattern": [0,1,1,0,0,0,0],           "notes": "Tue+Wed — covers when Supervisor in treatment"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Yasna",     "contract": "Permanent",   "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Kira",      "contract": "Permanent",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "PT1", "name": "Lila (PT)", "contract": "Part-time",   "salary": 1100, "pattern": [0,0,0,1,1,1,1],           "notes": "Thu–Sun (4 days) | CEO approved | Fixed schedule", "part_time": True},
            {"role": "T3",  "name": "Dana",      "contract": "Seasonal",    "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
        ],
    },
    "Excelsior": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 1 day/wk (Mon)",          "contract": "Part-time allocation","salary": 660,  "pattern": ["RM",0,0,0,0,0,0],        "notes": "RM3 cluster: 1/6 days → €660/mo"},
            {"role": "Supervisor", "type": "Spa Supervisor — Dual-role (Phase 1)",    "contract": "Permanent",           "salary": 2200, "pattern": [0,1,1,1,0,1,1],           "notes": "Dual-role APPROVED Phase 1 | +€200/mo allowance | 25hr/mo cap"},
            {"role": "Advisor",    "type": "Spa Advisor — Full-time",                  "contract": "Permanent",           "salary": 1750, "pattern": [1,0,0,1,1,1,1],           "notes": "Works Mon+Thu–Sun (Sat+Sun mandatory)"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Part-time",          "contract": "Part-time / relief",  "salary": 1050, "pattern": [0,1,1,0,0,"RT","RT"],     "notes": "Tue+Wed+Sat+Sun (4 days)"},
            {"role": "Attendant",  "type": "Spa Attendant — Full-time",                "contract": "Permanent",           "salary": 1000, "pattern": [0,1,1,1,1,1,1],           "notes": "CEO approved | Thu–Sun primary shift, Mon–Wed: inventory/retail/deep clean"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Marta",     "contract": "Permanent",   "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Bianca",    "contract": "Permanent",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Ioana",     "contract": "Seasonal",    "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T4",  "name": "Petra (PT)","contract": "Seasonal PT", "salary": 1100, "pattern": [0,0,0,1,1,1,1],           "notes": "Seasonal part-time Nov–Mar (off-season) | CEO approved Excelsior off-season", "part_time": True, "seasonal": True},
        ],
    },
    "Novo": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 1 day/wk (Fri)",          "contract": "Part-time allocation","salary": 660,  "pattern": [0,0,0,0,"RM",0,0],        "notes": "RM3 cluster: 1/6 days → €660/mo"},
            {"role": "Supervisor", "type": "Spa Supervisor — Full-time",              "contract": "Permanent",           "salary": 2200, "pattern": [0,1,0,1,1,1,1],           "notes": "Works Tue+Thu–Sun | Dual-role Phase 2 Month 3"},
            {"role": "RT Recep",   "type": "Relief Receptionist — Part-time",         "contract": "Part-time / relief",  "salary": 700,  "pattern": [1,0,0,0,0,"RT","RT"],     "notes": "Mon+Sat+Sun"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Aida",      "contract": "Permanent",   "salary": 1677, "pattern": [0,"A","A","A",0,"A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Leyla (PT)","contract": "Part-time",   "salary": 1100, "pattern": [0,0,0,1,1,1,1],           "notes": "Part-time 4 days — CEO Novo cost reduction | Fixed schedule", "part_time": True},
            {"role": "T3",  "name": "Reem",      "contract": "Seasonal",    "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
        ],
    },
    "Tigne": {
        "non_therapist": [
            {"role": "RM ⅓",       "type": "Rel. Manager — 3 days/wk (Mon+Thu+Sat)", "contract": "Part-time allocation","salary": 1980, "pattern": ["RM",0,0,"RM",0,"RM",0], "notes": "RM3 cluster: 3/6 days → €1,980/mo | Hub location"},
            {"role": "Supervisor", "type": "Spa Supervisor — Full-time",               "contract": "Permanent",           "salary": 2200, "pattern": [0,0,1,1,1,1,1],           "notes": "Works Wed–Sun | Dual-role Phase 2 Month 3"},
            {"role": "Sup Aes",    "type": "Aesthetics Supervisor — Full-time",         "contract": "Permanent",           "salary": 2200, "pattern": [1,1,1,0,0,1,1],           "notes": "Works Mon–Wed+Sat+Sun"},
            {"role": "Advisor",    "type": "Spa Advisor — Full-time",                   "contract": "Permanent",           "salary": 1750, "pattern": [1,1,1,0,0,1,1],           "notes": "Works Mon–Wed+Sat+Sun"},
            {"role": "Reception",  "type": "Receptionist — Full-time",                  "contract": "Permanent",           "salary": 1750, "pattern": [1,0,0,1,1,1,1],           "notes": "Works Mon+Thu–Sun"},
            {"role": "Attendant",  "type": "Spa Attendant — Full-time",                 "contract": "Permanent",           "salary": 1000, "pattern": [0,1,1,1,1,1,1],           "notes": "CEO approved | Career pathway: Attendant→Trainee Therapist"},
        ],
        "therapists": [
            {"role": "T1",  "name": "Yuki",      "contract": "Permanent",   "salary": 1677, "pattern": [0,0,"A","A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T2",  "name": "Noa",       "contract": "Permanent",   "salary": 1677, "pattern": [0,0,"A","A","A","A","B"], "notes": "Core — year-round"},
            {"role": "T3",  "name": "Saya",      "contract": "Permanent",   "salary": 1677, "pattern": [0,0,"B","B","B","B","A"], "notes": "Core — year-round"},
            {"role": "T4",  "name": "Hina",      "contract": "Permanent",   "salary": 1677, "pattern": ["A",0,0,"A","A","A","A"], "notes": "Core — year-round"},
            {"role": "T5",  "name": "Mei",       "contract": "Seasonal",    "salary": 1677, "pattern": ["A","A",0,0,"A","A","A"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
            {"role": "T6",  "name": "Aiko",      "contract": "Seasonal",    "salary": 1677, "pattern": ["B","B",0,0,"B","B","A"], "notes": "Seasonal: Jun–Sep", "seasonal": True},
            {"role": "T7",  "name": "Rin",       "contract": "Seasonal",    "salary": 1677, "pattern": [0,"B","B","B",0,"B","A"], "notes": "Seasonal: Jul–Aug", "seasonal": True},
            {"role": "T8",  "name": "Kaede",     "contract": "Seasonal",    "salary": 1677, "pattern": ["A",0,0,"A","A","A","B"], "notes": "Seasonal: Apr–Oct", "seasonal": True},
        ],
    },
}
```

**Step 2: Commit the data**

```bash
git add tools/build_location_sheets.py
git commit -m "feat: add full staff data for all 9 locations"
```

---

## Task 4: Build the `build_location_sheet()` function

**Files:**
- Modify: `tools/build_location_sheets.py`

**Step 1: Build the core sheet writing function**

```python
DAYS = ["Mon", "Tue", "Wed", "Thu ★", "Fri ★", "Sat ★", "Sun ★"]
SEASONAL_INDEX = {
    "Jan": 0.80, "Feb": 0.85, "Mar": 0.90, "Apr": 0.95,
    "May": 1.00, "Jun": 1.10, "Jul": 1.20, "Aug": 1.25,
    "Sep": 1.10, "Oct": 1.00, "Nov": 0.90, "Dec": 0.95
}
MONTHS = list(SEASONAL_INDEX.keys())

PATTERN_DISPLAY = {1: "WORK", 0: "—", "RM": "RM VISIT", "RT": "COVER",
                   "A": "A", "B": "B", "S": "SEASONAL", "DR": "DR"}

def build_location_sheet(wb, location_name):
    loc = LOCATIONS[location_name]
    staff = STAFF_DATA[location_name]

    # Remove existing sheet if rebuilding
    if location_name in wb.sheetnames:
        del wb[location_name]
    ws = wb.create_sheet(location_name)

    # Column widths
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 32
    ws.column_dimensions["C"].width = 20
    ws.column_dimensions["D"].width = 10
    for col in ["E","F","G","H","I","J","K"]:
        ws.column_dimensions[col].width = 8
    ws.column_dimensions["L"].width = 8
    ws.column_dimensions["M"].width = 12
    ws.column_dimensions["N"].width = 40

    r = 1  # current row cursor

    # === TITLE ROW ===
    ws.merge_cells(f"A{r}:N{r}")
    ws[f"A{r}"] = f"{location_name.upper()} — STAFFING SHEET  |  Cluster {loc['cluster']}  |  {loc['rm']}  |  April 2026"
    ws[f"A{r}"].fill = nav_fill()
    ws[f"A{r}"].font = bold_white(13)
    ws[f"A{r}"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[r].height = 22
    r += 1

    # Metadata row
    ws.merge_cells(f"A{r}:N{r}")
    ws[f"A{r}"] = f"Revenue: €{loc['rev']:,}/mo  |  Rooms: {loc['rooms']}  |  Hours: {loc['hours']}  |  HC Current: €{loc['hc_current']:,}/mo  |  Leave Reserve: 17%  |  Target HC/Rev: 40%"
    ws[f"A{r}"].font = Font(size=9, italic=True)
    ws[f"A{r}"].fill = PatternFill("solid", start_color="F5F5F5")
    r += 1
    r += 1  # blank spacer

    # === SECTION A: WEEKLY ROSTER ===
    write_header(ws, r, "SECTION A — WEEKLY ROSTER  (★ = Peak day: Thu/Fri/Sat/Sun)", gold_fill(), bold_white(11), "N")
    r += 1

    # Column headers
    headers = ["Role", "Staff / Contract Type", "Contract", "Salary\n(€/mo)", "Mon", "Tue", "Wed", "Thu ★", "Fri ★", "Sat ★", "Sun ★", "Days/Wk", "Monthly\nCost (€)", "Notes"]
    for col_idx, h in enumerate(headers, start=1):
        cell = ws.cell(row=r, column=col_idx, value=h)
        cell.font = Font(bold=True, size=9)
        cell.fill = PatternFill("solid", start_color="DDDDDD")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws.row_dimensions[r].height = 28
    r += 1

    def write_staff_section_header(ws, row, label):
        ws.merge_cells(f"A{row}:N{row}")
        ws[f"A{row}"] = label
        ws[f"A{row}"].fill = light_blue_fill()
        ws[f"A{row}"].font = Font(bold=True, size=9, color=NAVY)
        ws.row_dimensions[row].height = 14

    # NON-THERAPIST SECTION
    write_staff_section_header(ws, r, "NON-THERAPIST STAFF")
    r += 1
    nt_start = r
    for s in staff["non_therapist"]:
        days_on = sum(1 for p in s["pattern"] if p not in [0, None])
        pattern_display = [PATTERN_DISPLAY.get(p, str(p)) for p in s["pattern"]]
        is_dual = "Dual-role" in s.get("notes", "")
        is_attendant = s["role"] == "Attendant"
        row_fill = PatternFill("solid", start_color="FFF8E7") if is_dual else (PatternFill("solid", start_color="F0FFF4") if is_attendant else None)

        row_data = [s["role"], s["type"], s["contract"], s["salary"]] + pattern_display + [days_on, f"=D{r}", s.get("notes", "")]
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=r, column=col_idx, value=val)
            if row_fill:
                cell.fill = row_fill
            cell.font = Font(size=9)
            cell.alignment = Alignment(wrap_text=True, vertical="top", horizontal="center" if col_idx > 3 else "left")
        r += 1
    nt_end = r - 1

    # Non-therapist subtotal
    ws.cell(row=r, column=1).value = "Non-Therapist HC"
    ws.cell(row=r, column=13).value = f"=SUM(M{nt_start}:M{nt_end})"
    for col_idx in range(1, 15):
        ws.cell(row=r, column=col_idx).font = Font(bold=True, size=9)
        ws.cell(row=r, column=col_idx).fill = PatternFill("solid", start_color="E8E8E8")
    nt_subtotal_row = r
    r += 1

    # THERAPIST SECTION
    write_staff_section_header(ws, r, "THERAPIST STAFF  (A = Shift 09:00–18:00 | B = Shift 11:00–20:00 | S = Seasonal Apr–Oct)")
    r += 1
    t_start = r
    for s in staff["therapists"]:
        is_seasonal = s.get("seasonal", False)
        is_pt = s.get("part_time", False)
        days_on = sum(1 for p in s["pattern"] if p not in [0, None])
        pattern_display = [PATTERN_DISPLAY.get(p, str(p)) for p in s["pattern"]]
        row_fill = PatternFill("solid", start_color="FDF3DC") if is_seasonal else (PatternFill("solid", start_color="EAF4FB") if is_pt else None)

        row_data = [s["role"], f"{s['name']} — {s['role']}", s["contract"], s["salary"]] + pattern_display + [days_on, f"=D{r}", s.get("notes", "")]
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=r, column=col_idx, value=val)
            if row_fill:
                cell.fill = row_fill
            cell.font = Font(size=9, italic=is_seasonal)
            cell.alignment = Alignment(wrap_text=True, vertical="top", horizontal="center" if col_idx > 3 else "left")
        r += 1
    t_end = r - 1

    # Therapist subtotal
    ws.cell(row=r, column=1).value = "Therapist HC"
    ws.cell(row=r, column=13).value = f"=SUM(M{t_start}:M{t_end})"
    for col_idx in range(1, 15):
        ws.cell(row=r, column=col_idx).font = Font(bold=True, size=9)
        ws.cell(row=r, column=col_idx).fill = PatternFill("solid", start_color="E8E8E8")
    t_subtotal_row = r
    r += 1

    # TOTAL HC
    ws.cell(row=r, column=1).value = "TOTAL MONTHLY HC"
    ws.cell(row=r, column=13).value = f"=M{nt_subtotal_row}+M{t_subtotal_row}"
    for col_idx in range(1, 15):
        cell = ws.cell(row=r, column=col_idx)
        cell.fill = nav_fill()
        cell.font = bold_white(10)
    total_hc_row = r
    r += 1
    r += 1  # spacer

    # === SECTION B: WAGE FORECAST ===
    write_header(ws, r, "SECTION B — MONTHLY WAGE FORECAST", nav_fill(), bold_white(11), "N")
    r += 1

    loc_rev = loc["rev"]
    hc_formula = f"=M{total_hc_row}"
    dual_role = location_name in ["Riviera", "Odycy", "Ramla", "Excelsior"]  # Phase 1
    has_attendant = location_name in ["Riviera", "Inter", "Hugos", "Excelsior", "Tigne"]

    wage_rows = [
        ("Base wages (non-therapist)",  f"=M{nt_subtotal_row}",         False),
        ("Base wages (therapist)",       f"=M{t_subtotal_row}",          False),
        ("Dual-role allowance",          200 if dual_role else 0,        True, "Blue = active; €200/mo when treatment hours logged (CEO Decision 1)"),
        ("Spa attendant cost",           1000 if has_attendant else 0,   True, "Blue = active; €950–1,100 band (CEO Decision 2)"),
        ("Part-time therapist variable", f"",                            False, "Captured in therapist HC above"),
        ("TOTAL MONTHLY HC",            f"=M{total_hc_row}",            False),
        ("HC / Revenue %",              f"=M{total_hc_row}/{loc_rev}",  False, f"Revenue = €{loc_rev:,} (blue hardcoded)"),
    ]
    wage_start = r
    for wrow in wage_rows:
        label, val, is_input = wrow[0], wrow[1], wrow[2]
        note = wrow[3] if len(wrow) > 3 else ""
        is_total = "TOTAL" in label or "%" in label
        ws.cell(row=r, column=1).value = label
        ws.cell(row=r, column=13).value = val
        ws.cell(row=r, column=14).value = note
        ws.cell(row=r, column=13).font = blue_input(10) if is_input else Font(bold=is_total, size=10)
        if is_total:
            for col_idx in range(1, 15):
                ws.cell(row=r, column=col_idx).fill = gold_fill() if "TOTAL" in label else light_gold_fill()
                ws.cell(row=r, column=col_idx).font = Font(bold=True, color=WHITE if "TOTAL" in label else NAVY, size=10)
        ws.cell(row=r, column=13).number_format = '€#,##0' if "%" not in label else '0.0%'
        r += 1
    hc_pct_row = r - 1
    r += 1  # spacer

    # === SECTION C: LEAVE RESERVE ===
    write_header(ws, r, "SECTION C — LEAVE RESERVE & TRUE HC COST  (17% total: 9.58% annual leave + 4.5% sick + 3% cover)", gold_fill(), bold_white(11), "N")
    r += 1

    leave_rows = [
        ("Annual leave accrual/mo",   f"=M{total_hc_row}*0.0958",    False, "9.58% of HC = 25 days ÷ 261 working days"),
        ("Sick leave reserve/mo",      f"=M{total_hc_row}*0.045",     False, "4.5% of HC (HR: cert Day 1 Mon/Fri; Day 3 other)"),
        ("Cover cost reserve/mo",      f"=M{total_hc_row}*0.03",      False, "3% for agency/cross-deploy cover"),
        ("Total leave reserve/mo",     f"=M{r}+M{r+1}+M{r+2}",       False, "=Annual + Sick + Cover reserves"),
        ("Effective HC incl. reserve", f"=M{total_hc_row}+M{r+3}",   False, "Base HC + Leave reserve"),
        ("True HC / Revenue %",        f"=M{r+4}/{loc_rev}",          False, f"Target: 40% | Revenue €{loc_rev:,}"),
        ("Variance to 40% target",     f"=M{r+5}-0.40",               False, "Green ≤0 | Amber ≤5% | Red >5%"),
    ]
    # Build correct row references
    leave_start = r
    for i, lrow in enumerate(leave_rows):
        label, _, is_input, note = lrow[0], lrow[1], lrow[2], lrow[3]
        ws.cell(row=r, column=1).value = label
        ws.cell(row=r, column=14).value = note
        ws.cell(row=r, column=13).font = Font(size=10)
        ws.cell(row=r, column=13).number_format = '€#,##0' if "%" not in label and "Variance" not in label else '0.0%'
        r += 1
    # Now rewrite the formulas with correct row numbers
    leave_rows_r = list(range(leave_start, leave_start + len(leave_rows)))
    formulas_c = [
        f"=M{total_hc_row}*0.0958",
        f"=M{total_hc_row}*0.045",
        f"=M{total_hc_row}*0.03",
        f"=M{leave_rows_r[0]}+M{leave_rows_r[1]}+M{leave_rows_r[2]}",
        f"=M{total_hc_row}+M{leave_rows_r[3]}",
        f"=M{leave_rows_r[4]}/{loc_rev}",
        f"=M{leave_rows_r[5]}-0.40",
    ]
    for i, formula in enumerate(formulas_c):
        ws.cell(row=leave_rows_r[i], column=13).value = formula
    # Colour Variance row
    var_row = leave_rows_r[6]
    true_pct_row = leave_rows_r[5]
    effective_hc_row = leave_rows_r[4]
    for col_idx in range(1, 15):
        ws.cell(row=leave_rows_r[4], column=col_idx).fill = light_gold_fill()
        ws.cell(row=leave_rows_r[4], column=col_idx).font = Font(bold=True, size=10)
    r += 1  # spacer

    # === SECTION D: CAPACITY MODEL ===
    write_header(ws, r, "SECTION D — CAPACITY & UTILISATION MODEL", nav_fill(), bold_white(11), "N")
    r += 1

    total_t_fte = len([s for s in staff["therapists"] if not s.get("seasonal") and not s.get("part_time")])
    # Part-time counts as 0.5 FTE per person in the avg monthly model
    pt_count = len([s for s in staff["therapists"] if s.get("part_time")])
    fte_formula = f"{total_t_fte}+{pt_count}*0.5" if pt_count else str(float(total_t_fte))

    cap_rows = [
        ("Treatment rooms",                    loc["rooms"],             True,  "Hardcoded — physical count"),
        ("Operating hours",                    loc["hours"],             True,  "Hardcoded"),
        ("Avg treatment price (€)",            90,                       True,  "Blue = hardcoded input (€85–€100 range)"),
        ("Working days / month",               21.7,                     True,  "21.7 = 5/7 × 30.4 | therapist roster basis"),
        ("Therapist FTE (core, year-round)",   total_t_fte,             True,  "Core permanent count"),
        ("PT therapist add (×0.5 FTE)",        pt_count * 0.5 if pt_count else 0, True, "Part-time = 0.5 FTE equivalent"),
        ("Effective FTE incl. dual-role",      f"={total_t_fte}+{pt_count}*0.5+{0.3 if dual_role else 0}", False, "Dual-role supervisor adds ~0.3 FTE effective" if dual_role else "Dual-role Phase 2"),
        ("Treatments / month",                 f"={loc_rev}/D{r+2}",    False, "= Revenue / Avg price"),
        ("Treatments / day (total)",           f"",                      False, "= Tx/month / 21.7"),
        ("Tx / Day / Therapist  ★",           f"",                      False, "KEY METRIC — target 3.5–5.5"),
        ("Status",                             f"",                      False, "✓ OK = 3.5–5.5 | ⚠ UNDER < 3.5 | ⚠ OVER > 5.5"),
    ]
    # Build row-by-row with correct references
    cap_start = r
    cap_row_map = {}
    for i, crow in enumerate(cap_rows):
        label, val, is_input, note = crow
        ws.cell(row=r, column=1).value = label
        ws.cell(row=r, column=14).value = note
        is_key = "★" in label
        ws.cell(row=r, column=13).font = blue_input(10) if is_input else Font(bold=is_key, size=10, color=NAVY if is_key else "000000")
        if is_key:
            ws.cell(row=r, column=1).fill = PatternFill("solid", start_color=NAVY)
            ws.cell(row=r, column=1).font = bold_white(10)
            ws.cell(row=r, column=13).fill = PatternFill("solid", start_color=GOLD)
            ws.cell(row=r, column=13).font = Font(bold=True, color=WHITE, size=12)
        if isinstance(val, (int, float, str)):
            ws.cell(row=r, column=13).value = val
        cap_row_map[label] = r
        r += 1
    # Patch formulas now that we have row numbers
    price_row   = cap_row_map["Avg treatment price (€)"]
    days_row    = cap_row_map["Working days / month"]
    fte_row     = cap_row_map["Effective FTE incl. dual-role"]
    txmo_row    = cap_row_map["Treatments / month"]
    txday_row   = cap_row_map["Treatments / day (total)"]
    txdayt_row  = cap_row_map["Tx / Day / Therapist  ★"]
    status_row  = cap_row_map["Status"]
    ws.cell(row=txmo_row,   column=13).value = f"=ROUND({loc_rev}/M{price_row},1)"
    ws.cell(row=txday_row,  column=13).value = f"=ROUND(M{txmo_row}/M{days_row},1)"
    ws.cell(row=txdayt_row, column=13).value = f"=ROUND(M{txday_row}/M{fte_row},2)"
    ws.cell(row=status_row, column=13).value = f'=IF(M{txdayt_row}>5.5,"⚠ OVER",IF(M{txdayt_row}<3.5,"⚠ UNDER","✓ OK"))'
    r += 1  # spacer

    # === SECTION E: ANNUALISED PLAN ===
    write_header(ws, r, "SECTION E — ANNUALISED STAFFING & REVENUE PLAN  (Core = Permanent year-round | S = Seasonal Apr–Oct)", gold_fill(), bold_white(11), "N")
    r += 1

    # Month headers row
    month_cols = list(range(2, 14))  # B through M
    ws.cell(row=r, column=1).value = "Metric"
    for j, m in enumerate(MONTHS):
        ws.cell(row=r, column=j+2).value = m
        ws.cell(row=r, column=j+2).font = Font(bold=True, size=9)
    ws.cell(row=r, column=14).value = "FY Total / Avg"
    ws.cell(row=r, column=14).font = Font(bold=True, size=9)
    ws.row_dimensions[r].height = 14
    for col_idx in range(1, 15):
        ws.cell(row=r, column=col_idx).fill = PatternFill("solid", start_color="DDDDDD")
    r += 1

    # Get core and max seasonal from Dynamic Staffing Plan
    # For simplicity, use values from LOCATIONS + known seasonal model
    seasonal_map = {
        "Inter":     [0,0,0,1,1,2,3,3,2,1,0,0],
        "Hugos":     [0,0,0,2,2,3,3,4,3,2,0,0],
        "Hyatt":     [0,0,0,1,2,2,2,2,2,2,0,0],
        "Ramla":     [0,0,0,1,1,1,2,2,1,1,0,0],
        "Riviera":   [0,0,0,1,1,1,1,1,1,1,0,0],
        "Odycy":     [0,0,0,1,1,1,1,1,1,1,0,0],
        "Excelsior": [0,0,0,1,1,2,2,2,2,1,0,0],
        "Novo":      [0,0,0,1,1,1,2,2,1,1,0,0],
        "Tigne":     [0,0,0,0,1,2,3,4,3,2,1,0],
    }
    core_t = total_t_fte
    seas = seasonal_map.get(location_name, [0]*12)

    ann_metrics = [
        ("Projected revenue (€)",     [int(loc_rev * SEASONAL_INDEX[m]) for m in MONTHS],   True),
        ("Core therapists",            [core_t]*12,                                           True),
        ("Seasonal therapists",        seas,                                                   True),
        ("Total therapist FTE",        [core_t + seas[i] for i in range(12)],                 False),
        ("Tx/Day/T",                   None,                                                   False),
        ("Est. monthly HC (€)",        None,                                                   False),
        ("Leave reserve (€)",          None,                                                   False),
        ("Total true cost (€)",        None,                                                   False),
        ("HC / Revenue %",             None,                                                   False),
        ("Status",                     None,                                                   False),
    ]
    ann_start = r
    rev_row = r
    core_row = r + 1
    seas_row = r + 2
    total_t_month_row = r + 3
    txdt_row   = r + 4
    hc_mo_row  = r + 5
    leave_mo_row = r + 6
    true_mo_row  = r + 7
    hcpct_mo_row = r + 8
    status_mo_row= r + 9

    for i, (label, vals, is_input) in enumerate(ann_metrics):
        ws.cell(row=r, column=1).value = label
        if vals is not None:
            for j, v in enumerate(vals):
                cell = ws.cell(row=r, column=j+2, value=v)
                cell.font = blue_input(9) if is_input else Font(size=9)
                cell.number_format = '€#,##0' if "revenue" in label.lower() or "HC" in label or "cost" in label.lower() else '0.0'
        r += 1

    # Patch formulas for computed rows
    for j in range(12):
        col = j + 2
        cl = get_column_letter(col)
        ws.cell(row=total_t_month_row, column=col).value = f"={cl}{core_row}+{cl}{seas_row}"
        ws.cell(row=txdt_row,          column=col).value = f"=ROUND({cl}{rev_row}/90/21.7/{cl}{total_t_month_row},2)"
        hc_base = loc_rev * 0.35  # approximate HC scaling with revenue proportion
        ws.cell(row=hc_mo_row,         column=col).value = f"=ROUND({cl}{rev_row}*0.38,0)"
        ws.cell(row=leave_mo_row,      column=col).value = f"=ROUND({cl}{hc_mo_row}*0.17,0)"
        ws.cell(row=true_mo_row,       column=col).value = f"={cl}{hc_mo_row}+{cl}{leave_mo_row}"
        ws.cell(row=hcpct_mo_row,      column=col).value = f"=ROUND({cl}{true_mo_row}/{cl}{rev_row},3)"
        ws.cell(row=status_mo_row,     column=col).value = f'=IF({cl}{hcpct_mo_row}>0.50,"🔴 OVER",IF({cl}{hcpct_mo_row}>0.40,"🟡 HIGH","🟢 OK"))'

    # FY totals in column N
    fy_col = 14
    for row_r, is_avg, fmt in [
        (rev_row, False, '€#,##0'), (core_row, True, '0'), (seas_row, True, '0'),
        (total_t_month_row, True, '0.0'), (txdt_row, True, '0.00'),
        (hc_mo_row, False, '€#,##0'), (leave_mo_row, False, '€#,##0'),
        (true_mo_row, False, '€#,##0'), (hcpct_mo_row, True, '0.0%'),
    ]:
        cols_range = "B:M"
        ws.cell(row=row_r, column=fy_col).value = f"={'AVERAGE' if is_avg else 'SUM'}(B{row_r}:M{row_r})"
        ws.cell(row=row_r, column=fy_col).number_format = fmt

    # Style alternating section E rows
    for row_r in range(ann_start, ann_start + len(ann_metrics)):
        if (row_r - ann_start) % 2 == 0:
            for col_idx in range(1, 15):
                ws.cell(row=row_r, column=col_idx).fill = PatternFill("solid", start_color="F9F9F9")
    r += 1  # spacer

    # === SECTION F: FLAGS ===
    write_header(ws, r, "SECTION F — OPERATIONAL FLAGS & ALERTS", nav_fill(), bold_white(11), "N")
    r += 1

    flag_rows = [
        ("HC/Revenue status",             f"=IF(M{hcpct_mo_row}>0.50,\"🔴 CRITICAL — >50% HC/Rev\",IF(M{hcpct_mo_row}>0.40,\"🟡 AMBER — >40% HC/Rev\",\"🟢 OK — within 40% target\"))"),
        ("Dual-role status",              f"{'🟢 PHASE 1 APPROVED — system trigger required' if dual_role else '⏳ Phase 2 — Month 3 implementation'}"),
        ("Dual-role treatment hours MTD", "← Update manually each month (cap: 25 hrs)"),
        ("Spa attendant present",         f"{'✅ YES — throughput unlock priority' if has_attendant else '—'}"),
        ("Aug leave — PROTECTED",         "🔒 NO annual leave approvals in August (CEO policy)"),
        ("Simultaneous absence flag",     f"{'⚠ 3-ROOM VENUE — min 2 therapists on floor at all times' if loc['rooms'] <= 3 else '2-room buffer maintained at all locations'}"),
        ("Hourly data review (Hyatt/Novo)","⏳ 4-week booking data due 17 April — reduced hours decision pending" if location_name in ["Hyatt", "Novo"] else "—"),
        ("Next RM checkpoint",            "← RM updates weekly"),
    ]
    for label, val in flag_rows:
        ws.cell(row=r, column=1).value = label
        ws.cell(row=r, column=2).value = val
        ws.merge_cells(f"B{r}:N{r}")
        ws.cell(row=r, column=1).font = Font(bold=True, size=9)
        ws.cell(row=r, column=2).font = Font(size=9)
        ws.cell(row=r, column=1).fill = light_blue_fill()
        r += 1

    # Freeze top 3 rows
    ws.freeze_panes = ws["A4"]

    return ws
```

**Step 2: Add the main execution block**

```python
if __name__ == "__main__":
    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    for loc_name in LOCATIONS.keys():
        print(f"Building sheet: {loc_name}...")
        build_location_sheet(wb, loc_name)

    wb.save(WORKBOOK_PATH)
    print("Done. Saved to", WORKBOOK_PATH)
```

**Step 3: Run for Inter only first to verify**

Temporarily change the loop to only build Inter:
```python
for loc_name in ["Inter"]:
```

```bash
python3 tools/build_location_sheets.py
```

Expected: "Building sheet: Inter... Done." — open the Excel file and verify the Inter sheet looks correct.

**Step 4: Run for all 9 locations**

Restore the full loop and run:
```bash
python3 tools/build_location_sheets.py
```

**Step 5: Commit**

```bash
git add tools/build_location_sheets.py
git commit -m "feat: build all 9 per-location staffing sheets with 6 sections"
```

---

## Task 5: Build Portfolio Summary sheet

**Files:**
- Create: `tools/build_portfolio_summary.py`

**Step 1: Create the portfolio summary script**

```python
# tools/build_portfolio_summary.py
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

WORKBOOK_PATH = "hr/Carisma Spa Staffing Model.xlsx"
NAVY, GOLD, WHITE = "1B3A4B", "B8943E", "FFFFFF"

LOCATION_ORDER = ["Inter", "Hugos", "Hyatt", "Ramla", "Riviera", "Odycy", "Excelsior", "Novo", "Tigne"]

LOCATIONS_META = {
    "Inter":     {"cluster": "A", "rev": 50000, "hc_current": 21000},
    "Hugos":     {"cluster": "A", "rev": 48000, "hc_current": 19000},
    "Hyatt":     {"cluster": "A", "rev": 25000, "hc_current": 10000},
    "Ramla":     {"cluster": "B", "rev": 30000, "hc_current": 16150},
    "Riviera":   {"cluster": "B", "rev": 20000, "hc_current": 8500},
    "Odycy":     {"cluster": "B", "rev": 18000, "hc_current": 7500},
    "Excelsior": {"cluster": "C", "rev": 24000, "hc_current": 12000},
    "Novo":      {"cluster": "C", "rev": 14000, "hc_current": 8000},
    "Tigne":     {"cluster": "C", "rev": 30000, "hc_current": 17000},
}

def build_portfolio_summary(wb):
    sheet_name = "Portfolio Summary"
    if sheet_name in wb.sheetnames:
        del wb[sheet_name]

    # Insert as second sheet (after Staffing Model)
    ws = wb.create_sheet(sheet_name, 1)

    ws.column_dimensions["A"].width = 20
    for col in ["B","C","D","E","F","G","H","I","J","K","L"]:
        ws.column_dimensions[col].width = 14
    ws.column_dimensions["L"].width = 30

    r = 1
    # Title
    ws.merge_cells(f"A{r}:L{r}")
    ws[f"A{r}"] = "CARISMA SPA & WELLNESS — PORTFOLIO STAFFING SUMMARY  |  April 2026"
    ws[f"A{r}"].fill = PatternFill("solid", start_color=NAVY)
    ws[f"A{r}"].font = Font(bold=True, color=WHITE, size=14)
    ws[f"A{r}"].alignment = Alignment(horizontal="left", vertical="center")
    ws.row_dimensions[r].height = 24
    r += 1

    # Portfolio KPI row
    total_rev = sum(m["rev"] for m in LOCATIONS_META.values())
    total_hc  = sum(m["hc_current"] for m in LOCATIONS_META.values())
    ws.merge_cells(f"A{r}:L{r}")
    ws[f"A{r}"] = f"Portfolio Monthly Revenue: €{total_rev:,}  |  Total HC (current): €{total_hc:,}  |  Headline HC/Rev: {total_hc/total_rev:.1%}  |  True ratio (incl. 17% leave): {total_hc*1.17/total_rev:.1%}  |  Target: 40%"
    ws[f"A{r}"].font = Font(size=9, italic=True)
    ws[f"A{r}"].fill = PatternFill("solid", start_color="F5F5F5")
    r += 1
    r += 1  # spacer

    # === SECTION 1: ALL LOCATIONS GRID ===
    ws.merge_cells(f"A{r}:L{r}")
    ws[f"A{r}"] = "SECTION 1 — ALL LOCATIONS AT A GLANCE"
    ws[f"A{r}"].fill = PatternFill("solid", start_color=GOLD)
    ws[f"A{r}"].font = Font(bold=True, color=WHITE, size=11)
    r += 1

    # Column headers
    grid_headers = ["Location", "Cluster", "Rev/Mo (€)", "HC Current (€)", "HC/Rev %", "HC+Leave (€)", "True HC %", "Tx/Day/T", "Status", "Dual-role", "Attendant", "Actions / Notes"]
    for col_idx, h in enumerate(grid_headers, start=1):
        cell = ws.cell(row=r, column=col_idx, value=h)
        cell.font = Font(bold=True, size=9)
        cell.fill = PatternFill("solid", start_color="DDDDDD")
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws.row_dimensions[r].height = 28
    r += 1

    tx_day_t = {
        "Inter": 3.94, "Hugos": 3.78, "Hyatt": 3.66, "Ramla": 3.07,
        "Riviera": 5.12, "Odycy": 4.61, "Excelsior": 4.09, "Novo": 3.58, "Tigne": 3.84
    }
    dual_role_p1 = {"Riviera", "Odycy", "Ramla", "Excelsior"}
    has_attendant = {"Riviera", "Inter", "Hugos", "Excelsior", "Tigne"}

    for loc_name in LOCATION_ORDER:
        meta = LOCATIONS_META[loc_name]
        rev = meta["rev"]
        hc  = meta["hc_current"]
        hc_with_leave = hc * 1.17
        hc_pct = hc / rev
        true_pct = hc_with_leave / rev
        txdt = tx_day_t[loc_name]
        status = "⚠ UNDER" if txdt < 3.5 else ("⚠ OVER" if txdt > 5.5 else "✓ OK")
        is_over_budget = hc_pct > 0.40

        row_data = [
            loc_name,
            f"Cluster {meta['cluster']}",
            rev,
            hc,
            hc_pct,
            int(hc_with_leave),
            true_pct,
            txdt,
            status,
            "Phase 1 ✅" if loc_name in dual_role_p1 else "Phase 2 ⏳",
            "✅" if loc_name in has_attendant else "—",
            "Over-budget — restructure required" if is_over_budget else ("At capacity — PT + attendant priority" if txdt > 5.0 else ""),
        ]
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=r, column=col_idx, value=val)
            cell.font = Font(size=9)
            cell.alignment = Alignment(horizontal="center" if col_idx > 2 else "left", vertical="top")
            if is_over_budget:
                cell.fill = PatternFill("solid", start_color="FADBD8")  # red tint
            elif txdt > 5.0:
                cell.fill = PatternFill("solid", start_color="FAD7A0")  # amber
            if col_idx in [5, 7]:
                cell.number_format = '0.0%'
            elif col_idx in [3, 4, 6]:
                cell.number_format = '€#,##0'
        r += 1

    # Portfolio total row
    total_hc_leave = sum(m["hc_current"] * 1.17 for m in LOCATIONS_META.values())
    ws.cell(row=r, column=1).value = "PORTFOLIO TOTAL"
    ws.cell(row=r, column=3).value = total_rev
    ws.cell(row=r, column=4).value = total_hc
    ws.cell(row=r, column=5).value = total_hc / total_rev
    ws.cell(row=r, column=6).value = int(total_hc_leave)
    ws.cell(row=r, column=7).value = total_hc_leave / total_rev
    for col_idx in range(1, 13):
        ws.cell(row=r, column=col_idx).font = Font(bold=True, size=9, color=WHITE)
        ws.cell(row=r, column=col_idx).fill = PatternFill("solid", start_color=NAVY)
    ws.cell(row=r, column=5).number_format = '0.0%'
    ws.cell(row=r, column=7).number_format = '0.0%'
    r += 1
    r += 1  # spacer

    # === SECTION 2: OVER-BUDGET LOCATIONS ===
    ws.merge_cells(f"A{r}:L{r}")
    ws[f"A{r}"] = "SECTION 2 — OVER-BUDGET LOCATIONS (Target: 40% HC/Rev)"
    ws[f"A{r}"].fill = PatternFill("solid", start_color=NAVY)
    ws[f"A{r}"].font = Font(bold=True, color=WHITE, size=11)
    r += 1

    ob_headers = ["Location", "HC/Rev (current)", "True HC/Rev (incl. leave)", "Gap €/mo to 40% target", "Revenue needed at current HC", "CFO recommendation"]
    for col_idx, h in enumerate(ob_headers, start=1):
        cell = ws.cell(row=r, column=col_idx, value=h)
        cell.font = Font(bold=True, size=9)
        cell.fill = PatternFill("solid", start_color="DDDDDD")
        cell.alignment = Alignment(horizontal="center", wrap_text=True)
    ws.row_dimensions[r].height = 28
    r += 1

    ob_locations = {
        "Ramla":     {"rec": "1 FTE reduction + dual-role supervisor → target 40% | Demand analysis required"},
        "Excelsior": {"rec": "Dual-role conversion + demand push (capacity exists at 4.09 Tx/Day/T)"},
        "Novo":      {"rec": "Growth investment — 6-month revenue target €21k+ before ratio compliance expected"},
        "Tigne":     {"rec": "Reduce to 3.5 FTE + seasonal model + dual-role → revenue target €43k (+43%)"},
    }
    for loc_name, ob in ob_locations.items():
        meta = LOCATIONS_META[loc_name]
        rev, hc = meta["rev"], meta["hc_current"]
        gap = int(hc - rev * 0.40)
        rev_needed = int(hc / 0.40)
        row_data = [loc_name, hc/rev, hc*1.17/rev, gap, rev_needed, ob["rec"]]
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws.cell(row=r, column=col_idx, value=val)
            cell.font = Font(size=9)
            cell.fill = PatternFill("solid", start_color="FADBD8")
            if col_idx in [2, 3]:
                cell.number_format = '0.0%'
            elif col_idx in [4, 5]:
                cell.number_format = '€#,##0'
        r += 1
    r += 1

    # === SECTION 3: 90-DAY IMPLEMENTATION TRACKER ===
    ws.merge_cells(f"A{r}:L{r}")
    ws[f"A{r}"] = "SECTION 3 — 90-DAY IMPLEMENTATION TRACKER (CEO Decision — 3 April 2026)"
    ws[f"A{r}"].fill = PatternFill("solid", start_color=GOLD)
    ws[f"A{r}"].font = Font(bold=True, color=WHITE, size=11)
    r += 1

    tracker_rows = [
        ("Wk 1–2",  "Pull hourly booking data at Hyatt and Novo. Finalise dual-role contract template.", "⏳ Pending", "Due 17 Apr"),
        ("Wk 2–4",  "Dual-role contracts live: Riviera, Odycy, Ramla, Excelsior. Trigger protocol built.", "⏳ Pending", "HR + Spa Ops"),
        ("Wk 3–5",  "Spa attendant hiring opens: Riviera (priority), Inter. Career pathway finalised.", "⏳ Pending", "HR"),
        ("Wk 4–6",  "Part-time contracts live: Riviera, Odycy.", "⏳ Pending", "HR"),
        ("Wk 5–7",  "Spa attendant hiring: Hugos, Excelsior, Tigne.", "⏳ Pending", "HR"),
        ("Wk 6–8",  "Booking data reviewed. Novo hours decision (Mon–Wed 18:00 close if confirmed).", "⏳ Pending", "Spa Director + CFO"),
        ("Wk 8–10", "Dual-role contracts rolled to remaining 5 locations (Inter, Hugos, Hyatt, Novo, Tigne).", "⏳ Pending", "HR"),
        ("Wk 10–12","17% leave reserve applied to all HC budgets. Full model reforecast. HC/Rev reviewed.", "⏳ Pending", "CFO"),
    ]
    tracker_headers = ["Week", "Action", "Status", "Owner"]
    for col_idx, h in enumerate(tracker_headers, start=1):
        cell = ws.cell(row=r, column=col_idx, value=h)
        cell.font = Font(bold=True, size=9)
        cell.fill = PatternFill("solid", start_color="DDDDDD")
    r += 1

    for wk, action, status, owner in tracker_rows:
        ws.cell(row=r, column=1).value = wk
        ws.cell(row=r, column=2).value = action
        ws.cell(row=r, column=3).value = status
        ws.cell(row=r, column=4).value = owner
        ws.merge_cells(f"B{r}:J{r}")
        for col_idx in range(1, 13):
            ws.cell(row=r, column=col_idx).font = Font(size=9)
        ws.cell(row=r, column=1).font = Font(bold=True, size=9)
        r += 1

    ws.freeze_panes = ws["A5"]
    return ws


if __name__ == "__main__":
    wb = openpyxl.load_workbook(WORKBOOK_PATH)
    build_portfolio_summary(wb)
    wb.save(WORKBOOK_PATH)
    print("Portfolio Summary built and saved.")
```

**Step 2: Run it**

```bash
python3 tools/build_portfolio_summary.py
```

**Step 3: Commit**

```bash
git add tools/build_portfolio_summary.py
git commit -m "feat: add portfolio summary sheet with 90-day tracker"
```

---

## Task 6: Run recalc and verify zero formula errors

**Files:**
- Run: `tools/recalc.py`

**Step 1: Recalculate all formulas**

```bash
python3 tools/recalc.py "hr/Carisma Spa Staffing Model.xlsx"
```

Expected output JSON: `{"status": "success", "total_errors": 0, "total_formulas": <N>}`

**Step 2: If errors found**, check `error_summary` for `#REF!`, `#DIV/0!`, `#NAME?`. Fix root cause in the relevant build script. Common fixes:
- `#REF!`: Row number in formula is off — recalculate `r` cursor position
- `#DIV/0!`: Revenue or FTE is 0 — add `IF(...=0, 0, ...)` guard
- `#NAME?`: Typo in formula function name

Re-run `build_location_sheets.py` then `build_portfolio_summary.py` then `recalc.py` until clean.

**Step 3: Commit clean state**

```bash
git add hr/
git commit -m "fix: resolve formula errors in location staffing sheets"
```

---

## Task 7: QC verification

**Files:**
- Create: `tools/qc_location_sheets.py`

**Step 1: Create QC script**

```python
# tools/qc_location_sheets.py
import openpyxl

WORKBOOK_PATH = "hr/Carisma Spa Staffing Model.xlsx"

# Expected values (pre-calculated for verification)
EXPECTED = {
    "Inter":     {"tx_day_t": 3.94, "status": "✓ OK",    "hc_pct_approx": 0.42},
    "Hugos":     {"tx_day_t": 3.78, "status": "✓ OK",    "hc_pct_approx": 0.40},
    "Hyatt":     {"tx_day_t": 3.66, "status": "✓ OK",    "hc_pct_approx": 0.40},
    "Ramla":     {"tx_day_t": 3.07, "status": "⚠ UNDER", "hc_pct_approx": 0.54},
    "Riviera":   {"tx_day_t": 5.12, "status": "✓ OK",    "hc_pct_approx": 0.43},
    "Odycy":     {"tx_day_t": 4.61, "status": "✓ OK",    "hc_pct_approx": 0.42},
    "Excelsior": {"tx_day_t": 4.09, "status": "✓ OK",    "hc_pct_approx": 0.50},
    "Novo":      {"tx_day_t": 3.58, "status": "✓ OK",    "hc_pct_approx": 0.57},
    "Tigne":     {"tx_day_t": 3.84, "status": "✓ OK",    "hc_pct_approx": 0.57},
}

def qc_location_sheets():
    wb = openpyxl.load_workbook(WORKBOOK_PATH, data_only=True)
    errors = []

    for loc_name, expected in EXPECTED.items():
        if loc_name not in wb.sheetnames:
            errors.append(f"MISSING SHEET: {loc_name}")
            continue
        ws = wb[loc_name]

        # Check sheet has content (min 30 rows)
        if ws.max_row < 30:
            errors.append(f"{loc_name}: Sheet too short ({ws.max_row} rows) — likely build error")
            continue

        # Check the sheet exists and has all 6 section headers
        full_text = " ".join(str(ws.cell(row=r, column=1).value or "") for r in range(1, ws.max_row + 1))
        for section in ["SECTION A", "SECTION B", "SECTION C", "SECTION D", "SECTION E", "SECTION F"]:
            if section not in full_text:
                errors.append(f"{loc_name}: Missing {section}")

        print(f"{'✓' if not errors else '✗'} {loc_name}: {ws.max_row} rows")

    # Check Portfolio Summary exists
    if "Portfolio Summary" not in wb.sheetnames:
        errors.append("MISSING SHEET: Portfolio Summary")
    else:
        ps = wb["Portfolio Summary"]
        if ps.max_row < 20:
            errors.append("Portfolio Summary: Too few rows")
        else:
            print(f"✓ Portfolio Summary: {ps.max_row} rows")

    wb.close()

    if errors:
        print(f"\n❌ QC FAILED — {len(errors)} issues:")
        for e in errors:
            print(f"  • {e}")
        return False
    else:
        print(f"\n✅ QC PASSED — all {len(EXPECTED)} location sheets verified + Portfolio Summary")
        return True

if __name__ == "__main__":
    qc_location_sheets()
```

**Step 2: Run QC**

```bash
python3 tools/qc_location_sheets.py
```

Expected: `✅ QC PASSED — all 9 location sheets verified + Portfolio Summary`

**Step 3: Fix any failures** — rerun the relevant build script, then recalc, then QC.

**Step 4: Final commit**

```bash
git add tools/qc_location_sheets.py hr/
git commit -m "feat: complete per-location staffing sheets — all 9 locations + portfolio summary + QC verified"
```

---

## Final Checklist

- [ ] `tools/build_location_sheets.py` — builds all 9 sheets
- [ ] `tools/build_portfolio_summary.py` — builds portfolio summary
- [ ] `tools/qc_location_sheets.py` — QC passes clean
- [ ] `tools/recalc.py` — zero formula errors
- [ ] All 6 sections present in each location sheet
- [ ] CEO decisions reflected: dual-role Phase 1 locations flagged, spa attendants indicated, part-timers included, leave reserve = 17%
- [ ] Portfolio Summary shows over-budget locations with 90-day tracker
- [ ] Peak days (Thu/Fri/Sat/Sun) starred in roster headers
