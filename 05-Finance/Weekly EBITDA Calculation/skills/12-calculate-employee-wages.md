# 12 — Calculate Employee Wages

## Objective

Calculate total employee wages per spa location using the Salary Master Sheet and Roster, including Malta employer contributions (NI/FSS), and write weekly allocations to the P&L tabs.

## Required Inputs

- Salary Master Sheet: `1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w`
- Roster Tracker: `1f9jN365qmF6u6dP3oacycLKfo1WPvKnVSovgaNXePc0`
- Output spreadsheet: `1WWM7W6S5wtSC-5hdlcuJgW3zbYaO7YRgg4_-Bju4-5s`
- `knowledge/wages-baseline.md` — employee baseline reference

## Execution Steps

### Step 1: Read Staff Master

Read `Staff master!A1:K200` from the Salary Master Sheet.
Key columns:
| Column | Data |
|--------|------|
| A | Employee name |
| B | Role |
| E | Base salary |
| F | Salary update 02/25 (latest salary) |
| H | Cash or gross |
| I | Start Date |
| J | End Date |
| K | Employment status |

**Filter:** Only keep rows where Employment status = "Active"

### Step 2: Determine Current Salary

For each active employee:
1. Check column F (Salary update) first — this is the most recent salary
2. If F is empty or unclear, fall back to column E (Base salary)
3. Parse salary values (remove commas, "GROSS", "NET" text)
4. Note whether employee is paid Gross or Net/Cash (column H)

### Step 3: Read Recent Monthly Tabs

Read the most recent calculated salary tabs for actual payroll data:
- `March 26 (C)` — current month
- `Feb 26 (C)` — previous month
- `Jan 26 (C)` — January

These tabs have the actual calculated salaries including adjustments, commissions, and deductions.

### Step 4: Map Employees to Spa Locations

Read `Roster!A1:Z100` from the Roster Tracker.
Cross-reference employee names to determine spa assignment:
- Inter (InterContinental)
- Hugos
- Hyatt
- Ramla
- Labranda
- Odycy
- Novotel
- Excelsior

Employees not assigned to a spa (Growth, CRM, Management, Aesthetics) → Corporate/HQ.

### Step 5: Calculate Total Employer Cost per Employee

For each employee, calculate total cost to company:

**If paid Gross:**
- Total employer cost = Gross salary × 1.10
- The 10% covers employer NI contribution in Malta

**If paid Net/Cash:**
- Estimated gross = Net salary × 1.25 (rough Net-to-Gross conversion)
- Total employer cost = Estimated gross × 1.10

**Malta Employer Contributions (approximate):**
| Contribution | Rate |
|-------------|------|
| Employer NI (SSC) | ~10% of gross |
| Maternity Fund | 0.3% of gross |
| **Total employer add-on** | **~10.3%** |

### Step 6: Calculate Per-Spa Monthly Total

Group employees by spa location and sum total employer costs.

### Step 7: Convert to Weekly

Weekly wages = Monthly total / 4.33 (average weeks per month)

Apply the same weekly amount across all 12 weeks (wages are roughly constant week-to-week unless there are staff changes).

### Step 8: Write to Output Tabs

Write weekly wages to the "Wages and salaries" row in each section:

| Spa | Target Range |
|-----|-------------|
| INTER | `Spa Detail!B5:M5` |
| HUGOS | `Spa Detail!B16:M16` |
| HYATT | `Spa Detail!B27:M27` |
| RAMLA | `Spa Detail!B38:M38` |
| LABRANDA | `Spa Detail!B49:M49` |
| ODYCY | `Spa Detail!B60:M60` |
| NOVOTEL | `Spa Detail!B71:M71` |
| EXCELSIOR | `Spa Detail!B82:M82` |
| COMPANY WIDE | `Spa Detail!B93:M93` |
| Aesthetics | `Aesthetics P&L!B5:M5` |
| Slimming | `Slimming P&L!B5:G5` |

Also write Spa Company Wide total to: `EBITDA Summary!B5:M5`

### Step 9: Verify

Compare total monthly wages against:
- `PA: Monthly Breakdown` tab in Salary Master Sheet
- `HC Payroll Overview` tab
- Recent monthly salary tabs (Jan/Feb/Mar 26)

## Known Quirks

- Some employees have hourly rates (e.g., "6.35hrs", "8.00hrs") — these need separate calculation based on hours worked
- Salary update column (F) has inconsistent formatting: "1700 - GROSS", "1,500", "GONE", etc.
- Part-time employees, students, and interns may have non-standard salary structures
- Aesthetics staff (Leticia) should be allocated to Aesthetics, not Spa
- Growth team, CRM, Management → Corporate overhead, not individual spas
- Commissions are variable and tracked separately — base wage allocation is sufficient for weekly EBITDA

## Known Issues & Learnings

_No issues logged yet._
