# Budgets vs Actuals — Knowledge Base

## Quick Reference

| Key | Value |
|-----|-------|
| **Spreadsheet** | `1q_aqO9QpCaRoqhOI0Fd41YPO7NMrRAlv5EjShmZK6RM` |
| **Sheet Name** | Revenue Improved |
| **Sheet ID** | `856432233` |
| **Original Sheet** | Revenue (sheetId: `1379984830`) |
| **Created** | 2026-03-26 |
| **Total Revenue (2025)** | EUR 3,300,050 |
| **CAGR (2014-2025)** | 15.6% |
| **Hotels Tracked** | 10 (8 hotels + Aesthetics + SPA CLUB) |

---

## Files in This Knowledge Base

| File | Description | Use When |
|------|-------------|----------|
| `bcg_strategy_analysis.md` | BCG Growth-Share Matrix analysis, portfolio classification, concentration risk, implementation priorities | Strategic planning, hotel portfolio decisions, growth strategy |
| `goldman_sachs_analysis.md` | Investment banking metrics, valuation scenarios, revenue bridge, institutional-grade KPIs | Financial reporting, board presentations, M&A preparation |
| `excel_design_specification.md` | Complete visual design spec (colors, fonts, layout, API patterns) | Rebuilding or extending the Revenue Improved sheet |
| `qc_report.md` | Quality control validation, data accuracy scores, issues found and resolved | Verifying data integrity, understanding known issues |

---

## Key Data Points

### Revenue Trajectory
- 2014: EUR 673,694 (3 hotels)
- 2019: EUR 1,466,361 (4 hotels, pre-COVID peak)
- 2020: EUR 590,662 (COVID impact, -59.7%)
- 2024: EUR 2,549,050 (9 locations)
- 2025: EUR 3,300,050 (10+ locations, projected)

### BCG Portfolio Classification (2025)
- **Stars:** InterContinental, Hugo's, Aesthetics
- **Cash Cows:** Hyatt, Ramla
- **Question Marks:** Riviera, Sunny Coast, Excelsior
- **Dogs:** Novotel, SPA CLUB

### Valuation Context (Goldman Sachs)
- Conservative: EUR 3.8M (1.5x revenue)
- Base Case: EUR 6.4M (2.5x revenue)
- Upside: EUR 8.9M (3.5x revenue)
- Forward: EUR 8.3M (2.5x 2025P revenue)

### Concentration Risk (HHI)
- 2014: 0.428 (Highly Concentrated)
- 2024: 0.174 (Moderately Concentrated)
- 2025: 0.138 (Approaching Unconcentrated)

---

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | #1B3A4B | Title bar, primary headers |
| Midnight Teal | #2C5F6E | Section headers |
| Muted Gold | #B8943E | Accents, KPI highlights |
| Growth Green | #2D8B55 | Positive variance |
| Decline Red | #C23B3B | Negative variance |
| Warm Sand | #F5F0E8 | Alternating row banding |
| Pearl White | #FAFAF8 | Primary background |
| Stone Gray | #E8E4DD | Column headers |

### Sheet Structure (247 rows, 16 sections)
1. Title Bar (1-3)
2. KPI Dashboard — 6 cards (5-12)
3. Annual Revenue Trend — 2014-2025 (15-29)
4. Monthly Performance Matrix — 2025 actuals/targets (32-49)
5. Hotel Portfolio Analysis — 10 hotels (52-69)
6. Seasonality Analysis — monthly indexes (72-88)
7. Historical Monthly Detail — Group (90-106)
8. InterContinental Detail (108-122)
9. Hugo's Detail (124-139)
10. Hyatt Detail (141-156)
11. Ramla Detail (158-174)
12. BCG Portfolio Matrix (176-197)
13. Goldman Sachs Metrics (199-218)
14. Tourism Benchmark (220-233)
15. Strategic Priorities (235-247)

---

## How to Use This Knowledge Base

### For Future Revenue Analysis Tasks
1. Read this README for quick context
2. Reference `bcg_strategy_analysis.md` for strategic frameworks and BCG classifications
3. Reference `goldman_sachs_analysis.md` for financial metrics, formulas, and valuation context
4. Reference `excel_design_specification.md` for visual design patterns and Google Sheets API specifications
5. Use the spreadsheet ID and sheet ID above to access the live sheet

### For Building Similar Sheets
1. Follow the design system (color palette, typography, layout patterns)
2. Use the progressive disclosure pattern (CEO view at top, detail below)
3. Apply the same conditional formatting rules
4. Follow the KPI card pattern for dashboard sections

### For Updating the Revenue Sheet
1. Use the Google Sheets MCP tools with the spreadsheet ID above
2. Reference the sheet ID `856432233` for all batchUpdate operations
3. Follow the column layout (A=gutter, B=labels, C-O=data, P=totals, Q=gutter)
4. Maintain the alternating row banding (Pearl White / Warm Sand)

---

## Lessons Learned

### Google Sheets API Gotchas
1. **0-indexed vs A1 notation:** API row indices are 0-based; A1 rows are 1-based. Row 34 in A1 = index 33
2. **Text-as-number:** Values stored as text strings don't respond to number formatting. Must rewrite as numeric values
3. **Formula injection:** Text starting with "+" is interpreted as a formula. Use safe text alternatives
4. **Format application order:** Apply number formats AFTER writing data, and target exact column ranges
5. **First-row formatting:** When applying batch formatting to a range, verify the first row is included (off-by-one errors are common)

---

*Knowledge base created 2026-03-26 | Three expert sub-agents (BCG, Goldman Sachs, Excel Design) + QC Agent*
