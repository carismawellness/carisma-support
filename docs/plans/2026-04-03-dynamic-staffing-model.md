# Dynamic Staffing Model — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Carisma Spa Staffing Model to show demand-adjusted (dynamic) headcount per month per location, clearly distinguishing core permanent staff from seasonal contract workers, plus a new portfolio-level "Dynamic Staffing Plan" summary sheet.

**Architecture:**
- A new tool `tools/rebuild_dynamic_staffing.py` modifies the existing Excel workbook in-place using `openpyxl`.
- It adds a new "Dynamic Staffing Plan" sheet (inserted after "Staffing Model") and appends a "DYNAMIC STAFFING MODEL" section to each of the 9 monthly location sheets.
- The existing 35%/40% model sections are preserved untouched — the dynamic layer is additive.

**Tech Stack:** Python 3, openpyxl, existing build_staffing_model.py style helpers replicated inline.

---

## Key Design Decisions

### Core vs Seasonal split logic
For each location, the minimum therapist floor (off-peak month count) = **Core staff** (permanent contracts).
Any therapists above the core floor in peak months = **Seasonal staff** (fixed-term contracts, typically April–October).

| Location | Core T (perm) | Peak T | Max Seasonal |
|---|---|---|---|
| Intercontinental | 5 | 8 | 3 seasonal |
| Hugos | 4 | 8 | 4 seasonal |
| Ramla | 3 | 5 | 2 seasonal |
| Hyatt | 2 | 4 | 2 seasonal |
| Excelsior | 2 | 4 | 2 seasonal |
| Riviera | 2 | 3 | 1 seasonal |
| Sunny Coast | 2 | 3 | 1 seasonal |
| Novotel | 1 | 3 | 2 seasonal |
| Sliema | 5 | 7 | 2 seasonal (+ 3 immediate hires needed) |

### Optimal T calculation
```
treatments_needed = revenue × (1 - 0.055) / 85
t_implied = treatments_needed / 111.1   # 111.1 tx/therapist/month at 80% util
t_optimal = max(floor_min, ceil(t_implied × 1.20))  # 20% scheduling buffer
```
Where 111.1 = 8h shift × 80% util × 60/75 min per tx × 21.7 working days/month.

### Colour coding in monthly sheets
- **Navy/Teal** rows = core permanent staff (always rostered)
- **Orange `#E67E22`** rows = seasonal contract staff (peak only, Apr–Oct)
- **Red alert** = Sliema understaffing (immediate action needed)

### New "Dynamic Staffing Plan" sheet layout
1. Portfolio header
2. Seasonal hiring calendar (heatmap: green=core only, amber=seasonal active, red=understaffed)
3. Per-location annual savings vs fixed model
4. Key actions panel (Sliema urgency, Riviera reduction, etc.)

---

## Task 1: Create the tool skeleton

**Files:**
- Create: `tools/rebuild_dynamic_staffing.py`

**Step 1:** Create file with constants, style helpers, and model assumptions (mirror build_staffing_model.py palette exactly).

```python
"""
rebuild_dynamic_staffing.py
Modifies: hr/Carisma Spa Staffing Model.xlsx  (in-place, keeps all existing sheets)
Adds:
  • "Dynamic Staffing Plan" sheet — portfolio-level seasonal hiring calendar + savings
  • Dynamic section appended to each of the 9 monthly location sheets
"""
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import math, os

# ── Palette (mirrors build_staffing_model.py exactly) ──
NAVY       = "1B3A4B"
GOLD       = "B8943E"
WHITE      = "FFFFFF"
BLACK      = "000000"
LIGHT_BLUE = "D6E4F0"
GREEN_BG   = "D4EFDF"
ORANGE_BG  = "FAD7A0"   # Seasonal worker highlight
ORANGE_FNT = "E67E22"   # Seasonal label font
RED_BG     = "FADBD8"   # Understaffing alert
RED_FNT    = "C0392B"
TEAL       = "2C5F77"
DARK_GREEN = "1B7A3B"

# ── Model assumptions (matches existing model) ──
T_LOADED       = round(1500 * 1.118)   # 1677
R_LOADED       = round(1400 * 1.118)   # 1565
RM_PER_SITE    = round(round(2500 * 1.118) / 3)  # 932 (1/3 of 2795)
RETAIL_PCT     = 0.055
TREAT_COMM     = 0.045
RETAIL_COMM    = 0.15
RM_REV_COMM    = 0.005
AVG_TX_REV     = 85
AVG_TX_MIN     = 75
SHIFT_HRS      = 8
UTIL_TARGET    = 0.80
WORK_DAYS_MO   = 21.7
BUFFER         = 1.20

TX_PER_T = (SHIFT_HRS * UTIL_TARGET * 60 / AVG_TX_MIN) * WORK_DAYS_MO  # 111.1

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
SEASONAL_IDX = [0.80,0.85,0.90,0.95,1.00,1.10,1.20,1.25,1.10,1.00,0.90,0.95]

# ── Style helpers ──
def _thin():
    s = Side(style="thin", color="AAAAAA")
    return Border(left=s, right=s, top=s, bottom=s)

def _hdr(cell, text, bg=NAVY, fg=WHITE, bold=True, sz=10, wrap=False):
    cell.value = text
    cell.font = Font(bold=bold, color=fg, size=sz)
    cell.fill = PatternFill("solid", start_color=bg)
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=wrap)
    cell.border = _thin()

def _lbl(cell, text, bold=False, align="left", color=BLACK, sz=10, bg=WHITE):
    cell.value = text
    cell.font = Font(bold=bold, color=color, size=sz)
    cell.fill = PatternFill("solid", start_color=bg)
    cell.alignment = Alignment(horizontal=align, vertical="center")
    cell.border = _thin()

def _num(cell, value, fmt="#,##0", bold=False, color=BLACK, bg=WHITE):
    cell.value = value
    cell.font = Font(bold=bold, color=color, size=10)
    cell.fill = PatternFill("solid", start_color=bg)
    cell.alignment = Alignment(horizontal="right", vertical="center")
    cell.number_format = fmt
    cell.border = _thin()
```

**Step 2:** Add the `optimal_t(revenue, floor_min)` function:

```python
def optimal_t(revenue, floor_min):
    """Demand-implied therapist count with 20% buffer, floored at minimum."""
    tx_needed = revenue * (1 - RETAIL_PCT) / AVG_TX_REV
    t_raw = tx_needed / TX_PER_T
    return max(floor_min, math.ceil(t_raw * BUFFER))
```

**Step 3:** Add `hc_cost(revenue, t, r, rm_frac)` function matching existing model exactly:

```python
def hc_cost(revenue, t, r, rm_frac=0.33):
    fixed  = t * T_LOADED + r * R_LOADED + round(rm_frac * round(2500 * 1.118))
    var    = (round(revenue * (1 - RETAIL_PCT) * TREAT_COMM) +
              round(revenue * RETAIL_PCT * RETAIL_COMM) +
              (round(revenue * RM_REV_COMM) if rm_frac > 0 else 0))
    return fixed, var, fixed + var
```

---

## Task 2: Define location metadata

**Step 1:** Add the location config dict to the tool:

```python
# Per-location config for dynamic model
# floor_min = core permanent therapist count
# fixed_t   = current fixed model therapist count (from existing sheet)
# r = receptionists (unchanged), rm = RM fraction (unchanged)
LOCATIONS = [
    {"sheet": "Inter Monthly",       "name": "Intercontinental", "annual_rev": 593700,
     "floor_min": 5, "fixed_t": 9,  "r": 2, "rm": 0.33,
     "core_names": ["T1 — Isabelle","T2 — Margaux","T3 — Chiara","T4 — Eleni","T5 — Priya"],
     "seasonal_names": ["T6 — Sofia (seasonal)","T7 — Anya (seasonal)","T8 — Leila (seasonal)"],
     "action": None},

    {"sheet": "Hugos Monthly",        "name": "Hugos",            "annual_rev": 570552,
     "floor_min": 4, "fixed_t": 9,  "r": 2, "rm": 0.33,
     "core_names": ["T1 — Lucia","T2 — Amara","T3 — Valentina","T4 — Hana"],
     "seasonal_names": ["T5 — Renata (seasonal)","T6 — Zara (seasonal)","T7 — Fatima (seasonal)","T8 — Ingrid (seasonal)"],
     "action": None},

    {"sheet": "Ramla Monthly",        "name": "Ramla",            "annual_rev": 358632,
     "floor_min": 3, "fixed_t": 5,  "r": 2, "rm": 0.33,
     "core_names": ["T1 — Maria","T2 — Sofia","T3 — Elena"],
     "seasonal_names": ["T4 — Isabelle (seasonal)","T5 — Natalia (seasonal)"],
     "action": None},

    {"sheet": "Hyatt Monthly",        "name": "Hyatt",            "annual_rev": 304296,
     "floor_min": 2, "fixed_t": 4,  "r": 1, "rm": 0.33,
     "core_names": ["T1 — Amara","T2 — Lucia"],
     "seasonal_names": ["T3 — Priya (seasonal)","T4 — Lena (seasonal)"],
     "action": None},

    {"sheet": "Excelsior Monthly",    "name": "Excelsior",        "annual_rev": 291156,
     "floor_min": 2, "fixed_t": 4,  "r": 1, "rm": 0.33,
     "core_names": ["T1 — Valentina","T2 — Miriam"],
     "seasonal_names": ["T3 — Fatima (seasonal)","T4 — Chiara (seasonal)"],
     "action": None},

    {"sheet": "Riviera Monthly",      "name": "Riviera",          "annual_rev": 239232,
     "floor_min": 2, "fixed_t": 4,  "r": 1, "rm": 0.33,
     "core_names": ["T1 — Maya","T2 — Sofia"],
     "seasonal_names": ["T3 — Elena (seasonal)"],
     "action": "Reduce fixed headcount from 4T to 2T permanent + 1 seasonal. Annual saving: €21,801."},

    {"sheet": "Sunny Coast Monthly",  "name": "Sunny Coast",      "annual_rev": 218448,
     "floor_min": 2, "fixed_t": 3,  "r": 1, "rm": 0.33,
     "core_names": ["T1 — Natasha","T2 — Priya"],
     "seasonal_names": ["T3 — Irene (seasonal)"],
     "action": None},

    {"sheet": "Novotel Monthly",      "name": "Novotel",          "annual_rev": 168000,
     "floor_min": 1, "fixed_t": 2,  "r": 0, "rm": 0.33,
     "core_names": ["T1 — Chiara"],
     "seasonal_names": ["T2 — Bianca (seasonal)","T3 — (new hire, seasonal)"],
     "action": None},

    {"sheet": "Sliema Monthly",       "name": "Sliema",           "annual_rev": 500000,
     "floor_min": 5, "fixed_t": 2,  "r": 1, "rm": 0.33,
     "core_names": ["T1 — Amara","T2 — Rania","T3 — (hire now)","T4 — (hire now)","T5 — (hire now)"],
     "seasonal_names": ["T6 — (seasonal)","T7 — (seasonal)"],
     "action": "URGENT: Hire 3 permanent therapists immediately. Currently leaving ~€6,000+/month revenue on the table due to capacity constraints."},
]
```

---

## Task 3: Build the Dynamic Staffing Plan summary sheet

**Step 1:** Add function `build_dynamic_summary(wb)` that creates the new sheet.

The sheet structure:
- Row 1: Title header (Navy, merged A:O)
- Row 2: Subtitle with portfolio saving figure
- Row 4: Seasonal hiring calendar heatmap (locations as rows, months as columns)
- Below: Action items table for flagged locations

**Heatmap cell logic:**
- Core only months: green (`D4EFDF`)
- Seasonal active months: amber (`FAD7A0`) — show "Core+N seasonal"
- Understaffed months: red (`FADBD8`) — show "⚠ +N needed"

**Step 2:** Add per-location annual savings table below the heatmap.

---

## Task 4: Append dynamic section to each monthly sheet

**Step 1:** Add function `append_dynamic_section(ws, loc)` that:

1. Finds the last used row in the sheet (after existing 35%/40% sections)
2. Appends a 3-row spacer + gold section header: `"DYNAMIC STAFFING MODEL  —  Demand-Adjusted Headcount by Month"`
3. Writes a column header row: Month | Revenue | Budget 35% | Optimal T | Core T | Seasonal T | Dynamic HC Cost | Saving vs Fixed | Status
4. Writes 12 data rows (Jan–Dec) with:
   - Core T count in teal text
   - Seasonal T count in orange text (0 if off-peak)
   - Dynamic HC Cost = hc_cost(revenue, optimal_t, r, rm)
   - Saving = fixed_hc_cost - dynamic_hc_cost
   - Status: "● ON CORE" (green) / "▲ SEASONAL ACTIVE" (amber) / "⚠ UNDERSTAFFED" (red)
5. Writes annual summary row
6. Appends a "SEASONAL STAFF ROSTER" section listing core vs seasonal workers with colour coding:
   - Core staff rows: teal/navy background
   - Seasonal staff rows: orange background, "Seasonal — [months active]" in notes column

---

## Task 5: Main execution and file save

```python
def main():
    path = "hr/Carisma Spa Staffing Model.xlsx"
    wb = load_workbook(path)

    # Insert Dynamic Staffing Plan as second sheet (after Staffing Model)
    build_dynamic_summary(wb)
    # Move it to position 1 (0-indexed)
    wb.move_sheet("Dynamic Staffing Plan", offset=-(len(wb.sheetnames)-2))

    # Append dynamic section to each monthly sheet
    for loc in LOCATIONS:
        if loc["sheet"] in wb.sheetnames:
            append_dynamic_section(wb[loc["sheet"]], loc)

    wb.save(path)
    print(f"✓ Saved: {path}")
    print(f"  Sheets: {wb.sheetnames}")

if __name__ == "__main__":
    main()
```

**Run:** `python3 tools/rebuild_dynamic_staffing.py`

---

## Task 6: Verify output

Open `hr/Carisma Spa Staffing Model.xlsx` and check:
- [ ] "Dynamic Staffing Plan" sheet appears as second tab
- [ ] Heatmap shows green/amber/red correctly for all 9 locations × 12 months
- [ ] Sliema shows red throughout and "URGENT" action
- [ ] Riviera shows "action required" note
- [ ] Each monthly sheet has the new dynamic section at the bottom
- [ ] Core staff rows are teal, seasonal rows are orange
- [ ] Annual savings column sums match the €100,620 portfolio figure
- [ ] Existing 35%/40% sections are completely untouched
