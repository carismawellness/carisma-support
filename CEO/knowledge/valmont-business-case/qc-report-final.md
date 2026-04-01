# Valmont Business Case -- Final QC Report

**Prepared by:** QC Analyst (Final Pass)
**Date:** 26 March 2026
**Documents Reviewed:**
1. `forecast-model-final.md` -- Final Forecast Model & Distribution Proposal
2. `retail-analysis.md` -- Polished Retail Analysis
3. `market-research.md` -- Polished Market Research
4. `qc-report.md` -- Original QC Report (reference)

---

## Overall Verdict: CONDITIONAL PASS

The document has improved dramatically from the original version. Every critical issue identified in the first QC report has been addressed: treatment revenue is separated, EBITDA margins are within industry norms, TAM capture is below 25%, the conservative scenario is genuinely conservative, and the arithmetic errors in probability-weighted calculations have been largely corrected. The presentation quality is professional and appropriate for a Swiss luxury house.

However, **three issues must be fixed before this goes to a Google Sheet or pitch deck:**

1. **Section 6 shows Upside Year 2 product revenue as EUR 370,000, while Section B4 (the detailed P&L) shows EUR 340,000.** This EUR 30,000 discrepancy between the executive summary and the detailed model would be caught by any analyst and would undermine trust in the entire document.

2. **The minimum purchase commitment comparison table (B7, line 283-289) compares commitments (at distributor cost) against retail revenue figures, creating an apples-to-oranges comparison.** Specifically, the Year 2 commitment of EUR 80,000 (at cost) actually exceeds the conservative Year 2 Valmont purchases of EUR 66,560. The text claims commitments are "below conservative projections" which is not true for Year 1-2 or in aggregate.

3. **Internal inconsistency in probability-weighted expected values.** Section 6 shows Y1 Expected = EUR 56K and Y2 = EUR 218K. The Scenario Comparison section shows Y1 = EUR 47K and Y2 = EUR 210K. The document cannot present two different "expected" values for the same metric.

---

## Critical Issues Remaining (Must Fix Before Sending)

### CRITICAL-1: Upside Year 2 Revenue Mismatch (Section 6 vs B4)

**Location:** Section 6 (line 259) shows Upside Year 2 = EUR 370,000. Section B4 (line 548) shows Upside Year 2 = EUR 340,000. The quarterly phasing in B6 (line 648) also totals EUR 340,000.

**Root Cause:** Section 6 appears to contain a stale number from a prior revision. The detailed model (B4) and quarterly phasing (B6) agree on EUR 340,000.

**Fix:** Change Section 6 Upside Year 2 from EUR 370,000 to EUR 340,000. This also affects the Upside 3-Year Total (should be EUR 1,001,000, which the document already shows correctly, so the table row for Year 2 is the only fix needed). Also update the Valmont Product Purchases table (Section 6, line 268) -- Upside Year 2 shows EUR 271K. Verify: B7 shows EUR 270,700. These are consistent (rounding). However, if the Upside Y2 revenue was EUR 370K in Section 6's mind, then the "EUR 271K" figure may also need checking. Since B4 COGS for Upside Y2 = EUR 198,700 and treatment product cost = EUR 72,000, total = EUR 270,700 -- this is derived from the correct EUR 340K revenue. So the purchases line is correct and only the revenue line in Section 6 needs fixing.

### CRITICAL-2: Minimum Purchase Commitment vs Conservative Projections

**Location:** Section 6 (lines 282-289) and Section B7 (lines 693-702).

**Problem:** The commitment table in Section 6 compares EUR 80,000 Year 2 minimum purchase (at distributor cost) against "conservative projection of EUR 88K in product revenue." But EUR 88K is retail revenue, not distributor cost. The actual conservative Year 2 Valmont purchases (B7) = EUR 66,560. This means the commitment exceeds what Carisma would purchase in the conservative scenario by EUR 13,440.

Similarly for Year 1: commitment EUR 35,000 vs conservative purchases EUR 12,295. Year 3: commitment EUR 120,000 vs conservative purchases EUR 131,000 (commitment below).

Three-year: commitment EUR 235,000 vs conservative 3-year purchases EUR 209,855. Commitment exceeds conservative by EUR 25,145.

**Why this matters:** Carisma is telling Valmont "commitments are below our most conservative projections" (line 289). This is not true for Years 1-2 or in aggregate. A sharp analyst would compare commitments to the B7 conservative purchase figures and see the mismatch. This does not kill the deal -- but it erodes credibility.

**Fix options:**
1. **Best option:** Acknowledge honestly that Year 1-2 commitments exceed conservative purchase projections, framing this as deliberate (inventory buildup, commitment signal). Year 3 and onward provide the floor. This is actually a strength -- it shows Carisma is willing to take inventory risk.
2. **Alternative:** Lower the Y1 commitment to EUR 25K and Y2 to EUR 65K. But this weakens Carisma's negotiating position.

### CRITICAL-3: Duplicate Expected Value Tables

**Location:** Section 6 (lines 260-261) and Scenario Comparison (lines 907-913).

**Problem:** Two different probability-weighted "Expected" values appear in the document:

| Metric | Section 6 | Scenario Comparison | Arithmetic Result |
|---|---|---|---|
| Y1 Product Revenue | EUR 56K | EUR 47K | EUR 55,625 |
| Y2 Product Revenue | EUR 218K | EUR 210K | EUR 210,000 |
| Y3 Product Revenue | EUR 375K | EUR 375K | EUR 375,000 |
| 3-Year Total | Not shown | EUR 632K | EUR 640,625 |

Section 6's Y1 (EUR 56K) is close to the arithmetic result (EUR 55,625). The Scenario Comparison Y1 (EUR 47K) is materially lower. Section 6's Y2 (EUR 218K) does not match the arithmetic result (EUR 210K).

**Fix:** Pick one set of numbers. The arithmetic says Y1 = EUR 55,625, Y2 = EUR 210,000, Y3 = EUR 375,000, 3-Year = EUR 640,625. Present these consistently in both locations, with appropriate rounding (EUR 56K / EUR 210K / EUR 375K / EUR 641K). Remove or update the calculation verification note in the Scenario Comparison section to match.

---

## Minor Issues (Nice to Fix)

### MINOR-1: Conservative P&L Presented Twice (B2)

Section B2 presents the full conservative P&L (EBITDA of -108% to -28%) and then immediately presents a "Revised Conservative with Realistic OpEx Scaling" with different numbers (-51% to -2%). A polished document should present one definitive version. The scaled-down version is more realistic and should replace the original entirely.

### MINOR-2: Market Research Revenue Benchmarks Slightly Stale

The market research document (Section 4) shows "Base Case 3-Year Total Purchases: EUR 479K" while the final forecast model shows EUR 486K. The difference is small (EUR 7K) but suggests the market research was not updated to match the final forecast. Either align the numbers or add a note that the forecast model supersedes the market research estimates.

### MINOR-3: B7 Probability-Weighted Valmont Purchases Minor Arithmetic Errors

- Y2 Expected: Arithmetic gives EUR 164,455; document shows EUR 159,205. Difference: EUR 5,250.
- Y3 Expected: Arithmetic gives EUR 286,680; document shows EUR 285,180. Difference: EUR 1,500.
- 3-Year Expected: Arithmetic gives EUR 490,076; document shows EUR 483,326. Difference: EUR 6,750.

These are small relative errors (1-3%) but they are errors nonetheless. For a document going to a luxury house known for precision, the arithmetic should be exact.

### MINOR-4: Seasonality Weights

Section B1.5 shows April at 10.0% with note "April rounding adjusted to ensure exact 100.0% total." Verified sum: 5.8 + 5.1 + 7.9 + 10.0 + 7.7 + 8.9 + 9.0 + 7.8 + 11.4 + 8.8 + 10.3 + 7.3 = 100.0%. This has been fixed from the original. **Resolved.**

### MINOR-5: No Explicit ex-VAT Statement in Forecast Model

The retail analysis clearly states "All EUR figures are ex VAT." The forecast model does not have an equivalent declaration. Adding a one-line note in Section B1 would close this gap.

### MINOR-6: Location-Level Build (B11) Variance

The location-level Year 2 revenue build (B11) sums to EUR 100,743 for own-spa retail, while the P&L (B3) shows EUR 95,000. The document acknowledges this (line 858) as "conservatism in the P&L model versus the bottom-up build." This is acceptable but slightly untidy.

---

## Scorecard

| # | Check | Verdict | Notes |
|---|---|---|---|
| **A. QC Issues Fixed** | | | |
| 1 | Treatment revenue separated from product P&L | **PASS** | Clean separation. Treatment in B8 only. |
| 2 | EBITDA margins within industry norms (6-22%) | **PASS** | Conservative: -2% to -51%. Base: -29% to +2.5%. Upside: -8% to 10%. All credible. |
| 3 | TAM capture below 25% | **PASS** | Conservative 7.8%, Base 17.0%, Upside 24.9%. |
| 4 | Conservative genuinely conservative | **PASS** | Never profitable on distribution alone. Near break-even by Y3 with scaled OpEx. |
| 5 | Probability-weighted calculations correct | **PARTIAL** | Major errors fixed. Minor inconsistencies remain between Section 6 and Scenario Comparison. See CRITICAL-3. |
| **B. Cross-Document Consistency** | | | |
| 6 | Forecast matches retail analysis source data | **PASS** | All key metrics (5.4%, EUR 2,402 weekly, EUR 3.78M budget) verified. |
| 7 | Market research figures match forecast | **PARTIAL** | Core market data matches. Revenue benchmarks in market research slightly stale (EUR 479K vs EUR 486K). |
| 8 | Location counts consistent (10+ spas) | **PASS** | All three documents aligned on 10 current + INA Spa = 11 from May 2026. |
| 9 | EUR figures consistently ex-VAT | **PARTIAL** | Retail analysis declares ex-VAT. Forecast model and market research lack explicit statement. |
| **C. Arithmetic Verification** | | | |
| 10 | Revenue - COGS = Gross Profit (3 rows) | **PASS** | All three spot checks verified exactly. |
| 11 | Gross Profit - OpEx = EBITDA (3 rows) | **PASS** | All three spot checks verified exactly. |
| 12 | Year 1 monthly totals = annual figures | **PASS** | All three scenarios (Conservative, Base, Upside) verified line by line. |
| 13 | Valmont Purchase Schedule ties to P&L COGS | **PASS** | All resale COGS match exactly. Treatment product costs match. Totals verified. |
| **D. Credibility Assessment** | | | |
| 14 | Credible to Valmont commercial team | **PASS** | Product-only P&L with modest margins is believable. Valmont purchases table is clean. |
| 15 | Conservative definitely achievable | **PASS** | EUR 4,375/month across 3 locations in Y1 is modest. Never profitable -- honest. |
| 16 | Base Case realistic stretch target | **PASS** | EUR 382K Y3 product revenue with 10 captive locations is achievable at Valmont price points. |
| 17 | Upside ambitious but not delusional | **PASS** | 24.9% TAM capture is high but defensible given captive distribution. Borderline. |
| 18 | Minimum purchase commitments below conservative | **PARTIAL** | Y3 commitment below conservative. Y1-2 and 3-year total commitments EXCEED conservative purchases. See CRITICAL-2. |
| **E. Presentation Quality** | | | |
| 19 | Free of jargon, agent references, draft artifacts | **PASS** | Clean throughout. Professional tone. No AI/agent markers. |
| 20 | Pitch section scannable in 5 minutes | **PASS** | Table-driven structure. Clear headers. Scannable proposal format. |
| 21 | Tables consistently formatted | **PASS** | Consistent EUR prefix, percentage format, parentheses for negatives, bold for totals. |
| 22 | Tone appropriate for Swiss luxury house | **PASS** | Measured, data-driven, respectful of brand positioning. Appropriate restraint. |
| **F. Final Red Flags** | | | |
| 23 | Nothing amateurish | **PARTIAL** | Two conservative P&L versions in B2 is slightly confusing. Otherwise clean. |
| 24 | No inconsistencies a sharp analyst would catch | **FAIL** | Section 6 vs B4 Upside Y2 EUR 30K discrepancy. Duplicate expected values. Commitment table apples-to-oranges comparison. |
| 25 | No missing elements for distributor application | **PARTIAL** | Core elements present. Legal entity details, banking references, and insurance specifics absent (acceptable for initial proposal stage). |

**Summary: 16 PASS | 6 PARTIAL | 3 FAIL (Checks 5, 18, 24)**

---

## Final Assessment

The document has been transformed from a CONDITIONAL PASS with 12 failed checks to a strong submission with only 3 failures -- all of which are fixable in under 30 minutes. The fundamental restructuring (separating treatment revenue, grounding EBITDA margins, building a genuinely conservative scenario) was executed well. The arithmetic in the detailed P&L sections is clean. The presentation is professional and appropriate for the audience.

**The three critical fixes are:**
1. Correct the Upside Year 2 revenue in Section 6 from EUR 370,000 to EUR 340,000.
2. Rewrite the minimum purchase commitment comparison to honestly acknowledge Y1-2 commitments exceed conservative purchase projections (and frame this as a deliberate show of confidence).
3. Reconcile the two sets of probability-weighted expected values into one consistent set.

Once these three items are corrected, the document is ready for Google Sheet creation and pitch deck assembly. The underlying financial model is sound, the narrative is compelling, and the tone is right for Valmont.

---

*Final QC Report | 26 March 2026 | QC Analyst (Final Pass)*
*Conclusion: Three targeted fixes will bring this document to submission quality. The core model, narrative, and presentation are strong.*
