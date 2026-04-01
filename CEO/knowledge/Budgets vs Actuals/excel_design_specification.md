# Revenue Improved -- Complete Design Specification

## Carisma Wellness Group | Revenue Dashboard & Analysis Sheet

**Document version:** 1.0
**Last updated:** 2026-03-26
**Target platform:** Google Sheets (built via batchUpdate API)
**Currency:** EUR (all values standardized to Euro)

---

## 1. Overall Sheet Architecture

### Design Philosophy
Progressive disclosure layout: most important information at top, increasing detail as you scroll down. A CEO should never need to scroll past Row 30.

### Column Layout (A-Q, 17 columns)
- A: 12px left gutter
- B: 180px row labels
- C-O: 105px data columns
- P: 120px last data column (totals/summaries)
- Q: 12px right gutter

### Section Map

| Section | Rows | Description |
|---------|------|-------------|
| Title Bar | 1-3 | Company name, sheet title, last updated |
| KPI Dashboard | 5-13 | 6 KPI cards in 3x2 grid |
| Annual Revenue Trend | 15-30 | Year-by-year totals with growth |
| Monthly Performance | 32-50 | Current year monthly actuals vs target vs prior year |
| Hotel Portfolio | 52-70 | Per-hotel breakdown and rankings |
| Seasonality | 72-88 | Monthly seasonality indexes |
| Historical Detail | 90-250+ | Full 12-year monthly data by hotel |
| BCG Portfolio Matrix | 176-197 | Growth-share classification |
| Goldman Sachs Metrics | 199-218 | Financial metrics and valuation |
| Tourism Benchmark | 220-233 | Carisma vs Malta tourism growth |
| Strategic Priorities | 235-247 | Recommendations and priorities |

### Frozen: Rows 1-3, Columns A-B

---

## 2. Color Palette

### Primary Palette
| Name | Hex | Usage |
|------|-----|-------|
| Deep Navy | #1B3A4B | Primary headers, title bar |
| Midnight Teal | #2C5F6E | Section headers |
| Muted Gold | #B8943E | Accent, KPI highlights |
| Warm Sand | #F5F0E8 | Alternating row background |
| Pearl White | #FAFAF8 | Primary background |
| Stone Gray | #E8E4DD | Column headers, borders |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Growth Green | #2D8B55 | Positive variance |
| Decline Red | #C23B3B | Negative variance |
| Caution Amber | #D4940A | Warning |
| Neutral Gray | #7A7A7A | Secondary text |

### Card Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| Card BG Cool | #F0F4F7 | KPI cards 1, 3, 5 |
| Card BG Warm | #FBF8F3 | KPI cards 2, 4, 6 |
| Card BG Accent | #F5EFE0 | Emphasis, total rows |

---

## 3. Typography & Formatting

### Font Hierarchy
| Level | Font | Size | Weight | Color |
|-------|------|------|--------|-------|
| H1 Sheet Title | Roboto | 18pt | Bold | White on Navy |
| H2 Subtitle | Roboto | 10pt | Normal | White on Navy |
| H3 Section Title | Roboto | 12pt | Bold | White on Teal |
| H4 Sub-header | Roboto | 10pt | Bold | Navy on Stone |
| Body Data | Roboto Mono | 10pt | Normal | #1A1A1A |
| Body Labels | Roboto | 10pt | Normal | #555555 |
| KPI Value | Roboto | 20pt | Bold | #1A1A1A |
| KPI Label | Roboto | 9pt | Normal | #7A7A7A |

### Number Formats
| Type | Pattern | Example |
|------|---------|---------|
| Currency large | #,##0 | 3,300,050 |
| Currency symbol | EUR #,##0 | EUR 3,300,050 |
| Currency euro | EUR#,##0 | EUR3,300,050 |
| Percentage | 0.0% | 17.4% |
| Index | 0.00 | 1.35 |
| Year | 0 | 2025 |

### Alignment Rules
- Section/column headers: LEFT/CENTER + MIDDLE
- Currency values: RIGHT + MIDDLE
- Percentages: CENTER + MIDDLE
- Row labels: LEFT + MIDDLE

---

## 4. Section-by-Section Design

### Section 1: Title Bar (Rows 1-3)
- Row 1: 50px, Deep Navy, "REVENUE DASHBOARD" 18pt bold white
- Row 2: 8px, Muted Gold accent strip
- Row 3: 30px, Deep Navy, subtitle 10pt white

### Section 2: KPI Dashboard (Rows 5-13)
6 cards in 3x2 grid:
1. Total Revenue 2025 (EUR 3,300,050)
2. Revenue CAGR 11yr (15.6%)
3. Best Month 2025 (EUR 358,015, November)
4. Active Locations (10)
5. YTD vs Target (109.3%)
6. Avg Monthly Revenue (EUR 275,004)

### Section 3: Annual Revenue Trend (Rows 15-30)
2014-2025 data with: Year, Total Revenue, YoY Growth, YoY EUR, Hotels, Avg/Hotel, Best Hotel, Individual hotel columns

### Section 4: Monthly Performance (Rows 32-50)
2025 actual vs 2025 target vs 2024 actual with variance columns and status indicators

### Section 5: Hotel Portfolio (Rows 52-70)
Per-hotel: 2025 YTD, 2024 Full Year, YoY Change, % of Group, Rank, Monthly heatmap

### Section 6: Seasonality (Rows 72-88)
Monthly indexes: 2022-2025 values, 3-yr avg, seasonality index, peak/trough classification

### Section 7: Historical Detail (Rows 90-174)
Group totals + individual hotel monthly history (InterCon, Hugo's, Hyatt, Ramla)

### Section 8+: Strategic Analysis (Rows 176-247)
BCG Matrix, Goldman Sachs Metrics, Tourism Benchmark, Strategic Priorities

---

## 5. Conditional Formatting Rules

1. **Positive/Negative Variance** — Green/Red text for growth/variance columns
2. **Variance Background** — Green/red background for EUR variance cells
3. **Target Status** — "On Track" green, "Behind" red, "At Risk" amber
4. **Revenue Heatmap** — White-to-Teal gradient for hotel portfolio monthly data
5. **Seasonality Color Scale** — Red (0.60) to White (1.00) to Green (1.40)
6. **Revenue Data Bars** — Gold gradient for hotel YTD column
7. **COVID Year Muting** — Gray italic for 2020 row
8. **Future Month Styling** — Gray italic for months with no data yet

---

## 6. Google Sheets API Specifications

### Key API Patterns Used
- `updateSheetProperties` — Title, tab color, frozen rows/columns
- `updateDimensionProperties` — Column widths, row heights
- `mergeCells` — Title bar, KPI cards, section headers
- `repeatCell` — Formatting application
- `addBanding` — Alternating row colors
- `addConditionalFormatRule` — Boolean and gradient rules
- `setDataValidation` — Status column dropdowns
- `addProtectedRange` — Header protection

### Implementation Order
1. Sheet structure (merges, widths, heights)
2. Formatting (backgrounds, text, borders, numbers)
3. Banding (alternating rows)
4. Conditional formatting
5. Formulas and data references
6. Data validation
7. Protected ranges
8. Frozen rows/columns

---

## Appendix: Data Mapping

### Key Data Sources (Original -> Improved)
- Annual totals from original Revenue sheet (converted $ to EUR)
- Hotel names standardized (INTER -> InterContinental, etc.)
- YoY growth and tourism comparison data preserved
- All 12 years of monthly data mapped to consistent format

### Hotel Name Standardization
| Original | Standardized | Short Code |
|----------|-------------|------------|
| INTER | InterContinental | INTER |
| HUGO'S | Hugo's Boutique Hotel | HUGOS |
| HYATT | Hyatt Regency | HYATT |
| RAMLA | Ramla Bay | RAMLA |
| RIVIERA | AX Odycy / Riviera | RIVIERA |
| SUNNY | Sunny Coast | SUNNY |
| EXCELSIOR | Grand Hotel Excelsior | EXCEL |
| NOVOTEL | Novotel | NOVO |

---

*Full specification including exact RGB values, API JSON templates, and merge coordinates available in the original 1,753-line document.*
