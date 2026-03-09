# INVESTMENT COMMITTEE -- QUALITY CONTROL FINAL REVIEW

**To:** Mert Gulen, CEO, Carisma Wellness Group
**From:** Investment Committee Chair & Chief Quality Officer
**Re:** Cross-Analyst QC of P&L Model Critiques -- BCG, Goldman Sachs, M&A Advisor
**Date:** March 8, 2026
**Classification:** STRICTLY CONFIDENTIAL -- Principal Eyes Only
**Supersedes:** All three individual analyst reports for decision-making purposes

---

## PURPOSE

Three analyst reports were commissioned to critique the buyer's P&L model for the INA Spa acquisition (EUR 200-220K purchase price). This QC review does three things no individual report can do: (1) identifies every contradiction between the analysts and determines who is right, (2) finds what all three missed, and (3) produces the single definitive corrected P&L that should be used for Monday's meeting.

The three reports reviewed:

| Report | Analyst Persona | Pages | Core Thesis |
|--------|----------------|:-----:|-------------|
| BCG | Senior Partner, Strategic Advisory | ~850 lines | Model overstates Base EBITDA by EUR 262K. Corrected Base EBITDA = EUR 136K. |
| Goldman | MD, Financial Sponsors / Model Review | ~965 lines | Model overstates Base EBITDA by EUR 77-102K. Corrected Base EBITDA = EUR 297-322K. |
| M&A | Senior Deal Advisor, 200+ transactions | ~770 lines | Model overstates Base EBITDA by EUR 33.5K (rent only). Corrected Base EBITDA = EUR 365K. |

**The headline problem: these three analysts disagree on corrected Base EBITDA by EUR 229K (BCG's EUR 136K vs M&A's EUR 365K).** That is not a rounding error. That is three analysts looking at the same spreadsheet and producing answers that differ by a factor of 2.7x. My job is to determine who is right and deliver a single number.

---

## PART 1: CONTRADICTION ANALYSIS

### Contradiction 1: Corrected Base EBITDA -- The EUR 229K Gap

This is the single most important number in the entire deal analysis, and the three analysts produced three radically different answers.

| Analyst | Corrected Base EBITDA | Method |
|---------|----------------------:|--------|
| BCG | **EUR 136,200** | Bottom-up rebuild with 16 cost lines, conservative revenue (EUR 900K not EUR 961K), employer NI, FF&E reserve, payment processing |
| Goldman | **EUR 297,000-322,000** | Correction waterfall on existing model: rent + utilities + SG&A + insurance + IT + COGS adjustments |
| M&A | **EUR 365,037** | Minimal corrections: rent only (5% turnover fee scaled), no other cost adjustments |

**Who is right and why:**

**M&A is wrong.** The M&A advisor corrected only the rent line and left every other cost at model values. He kept SG&A at EUR 18,772 for a EUR 961K business, kept utilities flat at EUR 14,741 when tripling revenue, kept COGS at 9.4% despite adding injectable aesthetics, and added zero missing cost lines. His corrected P&L (Section 10.4 of his report) literally copies the model's SG&A, utilities, and COGS lines unchanged into the Base and Bull columns. This is lazy. A deal veteran with 200 transactions should know that a EUR 961K spa operation cannot run on EUR 18,772 SG&A. His EUR 365K figure is the least reliable of the three.

**BCG is too aggressive in the opposite direction.** BCG rebuilt the entire P&L from scratch with 16 cost lines and arrived at EUR 136K. The problem is that BCG made TWO changes simultaneously: (1) corrected costs upward, AND (2) reduced revenue from EUR 961K to EUR 900K. That double adjustment compounds into a EUR 262K correction, which is extreme. Specifically:

- BCG added EUR 20,957 in employer NI (10% of wages) -- **correct in principle, but may already be in the wage table figures.** The wage table shows EUR 1,700/month for massage therapists. In Malta, employers quote gross salary inclusive of their NI contribution in budgeting tables. If the EUR 317,400 already includes employer NI, BCG is double-counting by EUR 33,300.
- BCG added an FF&E reserve of EUR 18,000 (2% of revenue) -- **this is an accounting convention, not a cash cost.** An FF&E reserve is a prudential set-aside for future capital expenditure. It is not an operating expense. It should appear in a cash flow model, not in the EBITDA calculation. Adding it to OPEX is methodologically wrong.
- BCG added cleaning as a separate EUR 18,000 line while also keeping SG&A at EUR 22,000 -- **but SG&A already includes cleaning in the seller's actual P&L.** The seller's SG&A of EUR 36,156 includes EUR 15,784 of cleaning. BCG extracted cleaning and added it separately (correct), but then set residual SG&A at EUR 22,000, which is still higher than the model's EUR 18,772. The total (EUR 18K cleaning + EUR 22K SG&A = EUR 40K) is more realistic than the model's EUR 18,772 alone, but the cleaning line may be overstated.
- BCG reduced total revenue from EUR 961K to EUR 900K -- **this is a judgment call, not an error correction.** The model uses EUR 961K. A critique should correct the costs at the stated revenue, then separately flag revenue risk. Changing both inputs at once makes it impossible to isolate the impact of cost corrections from revenue assumptions.

**Goldman is closest to correct, but still has issues.** Goldman's correction waterfall is methodologically sound: take the model EBITDA, subtract each identified error, arrive at corrected EBITDA. Goldman's corrections:

| Goldman Correction | Amount | QC Assessment |
|-------------------|-------:|---------------|
| Turnover fee (5% scaling) | (26,550) | **CORRECT** -- verified against lease |
| Fixed rent base correction | (5,563) | **CORRECT** -- contract shows EUR 65,563 |
| Utilities scaling | (9,284) | **CORRECT** -- 2.5% of revenue is reasonable |
| SG&A scaling | (26,228) | **PARTIALLY CORRECT** -- EUR 45K SG&A is reasonable but Goldman's detailed breakdown (Section 5.4) shows EUR 60K, then uses EUR 45K "conservatively." The inconsistency suggests he is not confident in his own number. |
| Insurance | (5,000) | **CORRECT** -- medical PI insurance is real |
| IT costs | (4,000) | **CORRECT** -- clinic software is incremental |
| COGS adjustment | (24,982) | **QUESTIONABLE** -- Goldman uses 12% blended rate, but then notes in the same section that if the service mix is laser-heavy (not injectable-heavy), 9.4% could be defensible. He includes this correction "conservatively" but presents a range of EUR 297-322K. |
| **Total corrections** | **(101,607)** | |

Goldman's corrected Base EBITDA of EUR 297-322K is the most methodologically defensible range. However, Goldman omitted several items that BCG correctly identified:

| BCG Item Goldman Missed | Estimated Impact |
|------------------------|----------------:|
| Payment processing fees | (13,500) |
| Professional fees | (8,000) |
| Training costs | (6,000) |
| Equipment maintenance | (8,000) |
| **Subtotal** | **(35,500)** |

Applying Goldman's missed items to Goldman's corrected EBITDA: EUR 297K - EUR 35.5K = **EUR 261,500** (low end) to EUR 322K - EUR 35.5K = **EUR 286,500** (high end).

**QC VERDICT ON BASE EBITDA: EUR 260,000-285,000.**

This is lower than Goldman (EUR 297-322K), much higher than BCG (EUR 136K), and well below M&A (EUR 365K). The reasoning:

1. Start with Goldman's correction waterfall (methodologically sound): EUR 297-322K
2. Add Goldman's missed items (payment processing, professional fees, training, equipment maintenance): subtract EUR 35.5K
3. Do NOT add BCG's employer NI (likely already in wage table figures): EUR 0
4. Do NOT add BCG's FF&E reserve (not an operating expense): EUR 0
5. Do NOT reduce revenue from EUR 961K to EUR 900K (that is a scenario change, not a cost correction): EUR 0
6. Result: **EUR 261,500-286,500, call it EUR 260,000-285,000**

---

### Contradiction 2: Corrected Bull EBITDA

| Analyst | Corrected Bull EBITDA |
|---------|----------------------:|
| BCG | EUR 243,400 |
| Goldman | EUR 474,000-513,000 |
| M&A | EUR 576,837 |

Same pattern. M&A corrected only rent. BCG rebuilt everything including reducing revenue to EUR 1,230K. Goldman applied a correction waterfall.

**QC VERDICT ON BULL EBITDA: EUR 400,000-440,000.**

Goldman's EUR 474-513K minus his missed items (EUR 40K at Bull scale) = EUR 434-473K. BCG's EUR 243K is too low for the same reasons as Base (double-counted NI, included FF&E reserve, reduced revenue). Splitting the difference between the adjusted Goldman and a reasonable upward revision of BCG gives EUR 400-440K.

---

### Contradiction 3: Corrected BAU EBITDA

| Analyst | Corrected BAU EBITDA |
|---------|---------------------:|
| BCG | EUR 5,362 |
| Goldman | EUR 45,759-55,611 |
| M&A | EUR 63,550-65,550 |

BCG's EUR 5,362 is catastrophically low and reveals the flaw in BCG's method most clearly. BCG arrives at near-zero BAU EBITDA by adding employer NI (EUR 17,700), cleaning (EUR 15,784), insurance (EUR 3,358), IT (EUR 4,018), equipment maintenance (EUR 5,000), payment processing (EUR 5,500), professional fees (EUR 5,000), training (EUR 2,000), and FF&E reserve (EUR 8,600) to a business generating EUR 430K. Many of these costs **already exist within the seller's actual P&L lines**. The seller's EBITDA is EUR 36,538 -- that is the verified, bank-statement-backed number. You cannot add EUR 60K of "missing costs" to a business whose actual bank outflows produce EUR 36.5K EBITDA without proving those costs are genuinely not in the existing lines.

**The critical error in BCG's BAU:** BCG assumes employer NI is not in the wage figure. But the seller's actual payroll expenditure (verified by the P&L) is EUR 209,574. This IS the actual cash that leaves the bank account for employee costs. Whether it includes employer NI or not is irrelevant -- it is the real cost. BCG then adds 10% on top, as if the real cost is EUR 230K. It is not. The bank statement says EUR 209K. BCG is adding a theoretical cost on top of an actual cost.

Goldman's EUR 45,759 is reasonable but includes a rent correction (EUR 65,563 base vs EUR 60,000) that may or may not apply to BAU depending on which lease year the acquisition completes in.

**QC VERDICT ON BAU EBITDA: EUR 50,000-58,000.**

Start with seller's verified EBITDA of EUR 36,538 on EUR 426K revenue. Apply the BAU wage cut (EUR 32,574 saved from cutting 3 therapists) and SG&A reduction (EUR 17,384 saved). Gross up for the rent escalation (EUR 81,500 in BAU vs EUR 71,689 actual = EUR 9,811 additional cost). Subtract missing items that are genuinely incremental (equipment maintenance EUR 5K, professional fees EUR 3K -- the seller may not have had these, but Carisma will).

Calculation: EUR 36,538 + EUR 32,574 + EUR 17,384 - EUR 9,811 - EUR 8,000 = **EUR 68,685**. But this uses the uncorrected SG&A cut. If SG&A reduction is only EUR 12K (not EUR 17K, because some of those costs are genuinely needed), BAU EBITDA = EUR 63,685. Subtract a further EUR 5-8K for genuinely missing items = **EUR 55,685-58,685**.

Round to: **EUR 55,000-58,000.**

---

### Contradiction 4: Revenue Treatment -- Flat Spa Revenue

| Analyst | Position on Spa Revenue |
|---------|------------------------|
| BCG | **Spa revenue should INCREASE from EUR 301K to EUR 420-500K through repricing.** Called this "the model's most significant analytical error." |
| Goldman | Noted spa revenue is flat across all scenarios. Called it "conservative (possibly overly so)." Did not correct it. |
| M&A | Did not address spa revenue at all. |

**Who is right:** BCG is right, and this is BCG's single best insight. The model attributes 100% of revenue growth to new service lines (aesthetics + slimming) while ignoring the highest-certainty revenue lever: repricing existing spa services from EUR 57 ATR to EUR 77-85. BCG's corrected P&L includes spa revenue of EUR 420K (Base) and EUR 500K (Bull), which is well-reasoned. Goldman and M&A both missed this.

**However, BCG then reduced total revenue from EUR 961K to EUR 900K.** If BCG had added the spa repricing uplift (~EUR 120K) to the existing EUR 961K, total Base revenue would be EUR 1,081K, not EUR 900K. BCG effectively swapped EUR 120K of spa repricing revenue for EUR 180K of reduced aesthetics/slimming revenue. The net effect was a EUR 61K revenue reduction. This is a judgment call about service mix risk, not an error correction. It muddies what should be a clean message: "your costs are understated AND your spa revenue is understated."

**QC VERDICT:** Spa repricing should be modeled as incremental upside ABOVE the current scenarios, not as a replacement for aesthetics/slimming revenue. This means the corrected P&L should show EUR 961K at current assumptions PLUS a sensitivity showing EUR 1,050-1,100K with repricing.

---

### Contradiction 5: COGS Blended Rate

| Analyst | Base COGS | COGS % | Method |
|---------|----------:|:------:|--------|
| Original model | EUR 90,000 | 9.4% | Assumed flat ratio from spa |
| BCG | EUR 115,000-135,000 | 12-14% | Blended by service line (spa 10%, aesthetics 25-35% injectables, slimming 10-15%) |
| Goldman | EUR 130,000-165,000 | 13.5-17.2% | Blended by service line, higher injectable assumption |
| M&A | EUR 90,000 | 9.4% | No correction |

**Who is right:** BCG and Goldman are both right that the model's 9.4% is too low for a mixed spa/aesthetics/slimming operation. The question is whether the aesthetics offering will be injectable-heavy (25-35% COGS) or laser-heavy (5-10% COGS).

Goldman explicitly flagged this uncertainty: "The COGS assumption is defensible IF the service mix is specified." BCG provided a more detailed breakdown but landed at a lower range (12-14%) than Goldman's realistic case (15.7-19.1%).

**QC VERDICT:** Use 12% blended COGS for Base (EUR 115,200) and 11% for Bull (EUR 145,310). Reasoning: Carisma already owns a Candela laser at INA and the Base case aesthetics revenue will skew toward laser treatments (low COGS) rather than injectables (high COGS) in the first 2 years. As the practice matures and injectables grow, COGS will rise. 12% is the right Year 2 assumption. Injectable-heavy mature state (Year 3+) would push to 14-15%, which applies more to Bull.

Corrected Base COGS: EUR 115,000 (vs model EUR 90,000, delta = EUR 25,000).
Corrected Bull COGS: EUR 145,000 (vs model EUR 120,000, delta = EUR 25,000).

---

### Contradiction 6: SG&A Scaling

| Analyst | Base SG&A | Approach |
|---------|----------:|---------|
| Original model | EUR 18,772 | Flat from BAU |
| BCG | EUR 40,000 (cleaning EUR 18K + SG&A EUR 22K) | Rebuilt bottom-up |
| Goldman | EUR 45,000-60,000 (conservative vs realistic) | Bottom-up with detailed breakdown |
| M&A | EUR 18,772 | No correction |

**Who is right:** Goldman's detailed breakdown (Section 5.4) is the most thorough. His realistic estimate of EUR 60K includes cleaning (EUR 20K), general expenses (EUR 10K), insurance (EUR 8K), IT (EUR 8K), telephone (EUR 2K), repairs (EUR 8K), and other (EUR 4K). But he then inexplicably used EUR 45K "conservatively" in his correction waterfall, contradicting his own analysis.

BCG's EUR 40K (cleaning + SG&A combined) is a reasonable middle ground.

**QC VERDICT:** Use EUR 48,000 total for Base (cleaning + all SG&A items), EUR 60,000 for Bull. This is Goldman's conservative figure (EUR 45K) plus a small adjustment for payment processing and bank charges, which Goldman listed separately. Actually, since I am including payment processing as its own line in the corrected P&L, SG&A should be EUR 42,000-45,000 for Base.

---

### Contradiction 7: Marketing Budget Adequacy

| Analyst | Base Marketing | Position |
|---------|---------------:|---------|
| Original model | EUR 40,000 (4.2%) | |
| BCG | EUR 63,000-75,000 (7-8%) | "Too low for growth. You need 7-12%." |
| Goldman | EUR 40,000 | Did not correct. |
| M&A | EUR 40,000 | Did not correct. |

**Who is right:** BCG is right that EUR 40K is insufficient for a 2.2x revenue growth target. However, BCG's recommendation of EUR 63-75K may be overstated for a business that will benefit from Carisma's existing marketing infrastructure (shared social media, brand awareness, cross-referral from other locations).

**QC VERDICT:** EUR 50,000-55,000 for Base. This reflects a real increase from EUR 40K to fund slimming client acquisition and aesthetics awareness, while recognizing that Carisma's existing marketing machine provides efficiency gains a standalone operator would not have.

---

### Contradiction 8: Rent Fixed Base (BAU/Base/Bull)

| Analyst | Fixed Base Rent (Acquisition Year) |
|---------|-----------------------------------:|
| BCG | EUR 60,000 |
| Goldman | EUR 65,563 (contract-correct) |
| M&A | EUR 65,000-67,000 |

**Who is right:** Goldman is most precise. The lease schedule shows EUR 60,000 for Lease Year 3 (2026), escalating 3% annually. If the acquisition completes in 2026 and Carisma's first full year of operation is 2027 (Lease Year 4+), the base is EUR 61,800. If it is already Lease Year 5-6, the base is EUR 63,654-65,563.

**QC VERDICT:** Use EUR 63,000 for the first operating year (mid-range). The exact figure depends on which lease year the acquisition falls in, which requires reading the lease commencement date precisely. For modeling purposes, EUR 63,000 is reasonable.

---

### Contradiction 9: Wage Discrepancy Explanation

| Analyst | Explanation for EUR 28,626 Wage Gap |
|---------|--------------------------------------|
| BCG | Three hypotheses: (a) budget vs actual, (b) employer NI in one but not other, (c) cleaners in wrong line. Could not determine which. |
| Goldman | Two hypotheses: (a) wage table uses Carisma's planned rates, not seller's actual (most likely), (b) 2 cleaners not in wage table but in headcount. |
| M&A | Identified the gap but focused on the 12 vs 13 headcount discrepancy, not the EUR amount. |

**Who is right:** Goldman's Hypothesis A is almost certainly correct. The wage table uses Carisma's intended salary rates (EUR 1,700/month for therapists), while the seller pays lower actual salaries (average EUR 1,343/month per Goldman's calculation). The wage table is forward-looking (what Carisma would pay), not a representation of the seller's actual payroll. This is confirmed by the fact that BAU/Base/Bull are modeled at Carisma rates, not seller rates. The INA column of the wage table is simply mislabeled -- it shows Carisma rates at INA headcount, not actual INA costs.

**QC VERDICT:** The wage gap is explained by the wage table using Carisma salary benchmarks. The P&L figure of EUR 209,574 is the seller's actual cost. The wage table's EUR 238,200 represents what Carisma would pay the same headcount at Carisma salary levels. This means BAU wages of EUR 177,000 are at Carisma rates (correct for forward planning), and the INA P&L wages of EUR 209,574 are at seller's actual rates (correct for current state). **There is no error -- there is a labeling/presentation issue.**

---

### Contradiction 10: Deal Structure Recommendations

| Analyst | Structure Recommendation |
|---------|-------------------------|
| BCG | Did not propose a deal structure. Focused on model corrections. |
| Goldman | EUR 200-220K purchase is fair. Total investment envelope EUR 350-450K. Negotiate the turnover fee. |
| M&A | EUR 240K headline: EUR 180K cash + EUR 15K escrow + EUR 25K earnout + EUR 20K seller note. |

**Who is right:** M&A's deal structure is the most practically useful. His EUR 240K headline gives negotiating room while limiting Day 1 cash to EUR 180K. Goldman's EUR 200-220K is the purchase price analysis, not the deal structure. They are answering different questions.

**QC VERDICT:** M&A's structure is sound. The EUR 240K headline with EUR 180K Day 1 cash is a smart negotiation architecture. Goldman's valuation analysis (EUR 175-272K central tendency) validates that EUR 200-220K actual consideration (after earnout probability discounting) is in the fair range.

---

### Contradiction 11: Valuation Multiples

| Analyst | EV/EBITDA Multiple Used |
|---------|------------------------:|
| BCG | 1.6x corrected Base EBITDA (EUR 220K / EUR 136K) -- "excellent" |
| Goldman | 4.0-6.0x current EBITDA, 4.0-5.0x Base -- computed enterprise values |
| M&A | 3.0-3.5x BAU EBITDA |

**Who is right:** They are all right because they are applying multiples to different EBITDA bases. BCG applies a low multiple because his EBITDA is low. Goldman applies higher multiples to lower EBITDA. M&A applies mid-range multiples to BAU.

**QC VERDICT:** The correct framework is M&A's -- value the business on what it IS (BAU EBITDA), not what you will build (Base/Bull). Apply 3.0-4.0x to BAU EBITDA of EUR 55-58K = EUR 165-232K. Add a modest strategic premium for the lease/location = EUR 190-250K. The EUR 200-220K purchase price sits in the middle. Fair.

---

### Contradiction 12: Remaining Lease Term

| Analyst | Lease Term Remaining |
|---------|---------------------|
| BCG | 13 years remaining (uses 15-year total from commencement ~2023) |
| Goldman | ~10 years remaining |
| M&A | ~10 years |

**Who is right:** This requires checking the lease commencement date. The lease appears to have commenced approximately mid-2020 (based on the Year 1 subsidized rent of EUR 5,000). If it is a 15-year lease from mid-2020, it expires mid-2035, giving approximately 9 years remaining from mid-2026. Goldman and M&A are closer to correct.

**QC VERDICT:** ~9-10 years remaining. BCG's 13 years is too generous and flatters IRR calculations.

---

### Contradiction 13: Redundancy Costs

| Analyst | Redundancy Cost Estimate |
|---------|------------------------:|
| BCG | Not explicitly quantified |
| Goldman | EUR 15,000-25,000 (5 staff x EUR 3-5K each) |
| M&A | EUR 1,962-2,100 (3 staff x EUR 654-700 each) + EUR 3-5K legal |

**Who is right:** They are cutting different numbers of staff. Goldman's BAU drops from 13 to 8 (cutting 5), while M&A's drops from 12/13 to 9 (cutting 3). The model's wage table shows BAU at 8 headcount. If 5 staff are cut, Goldman's EUR 15-25K is reasonable. M&A's per-employee figure of EUR 654-700 (2 weeks' pay for ~2 years service) is correct for Maltese employment law, but his total is only for 3 employees.

**QC VERDICT:** 5 positions are eliminated (13 to 8). At EUR 700-1,000 per employee (given short service) plus EUR 5,000 legal: total EUR 8,500-10,000. Goldman's EUR 15-25K is conservative (prudent for budgeting). M&A's EUR 2,000-7,000 is too low because it only counts 3 cuts.

---

## PART 2: ANALYST SCORECARDS

### Scoring Criteria

Each analyst is scored 1-10 on four dimensions:
- **Accuracy** -- Are the numbers right? Are the corrections mathematically sound?
- **Completeness** -- Did they cover all the issues? Missing cost lines, revenue analysis, lease mechanics?
- **Originality** -- Did they surface insights that the others missed?
- **Practical Usefulness for Monday** -- Can you walk into the meeting and use this?

---

### BCG Report -- Score: 7.0/10

| Dimension | Score | Rationale |
|-----------|:-----:|-----------|
| Accuracy | **5/10** | Corrected Base EBITDA of EUR 136K is too low. Double-counted employer NI (EUR 33K) that is likely already in wage figures. Included FF&E reserve (EUR 18K) as an operating expense -- methodologically wrong. Reduced revenue without justification. The magnitude of the overstatement (EUR 262K correction on a EUR 399K figure) strains credibility. |
| Completeness | **9/10** | The most thorough report. 16 cost lines in the corrected P&L. Addressed every single one of the 9 annotated questions. Included rent escalation tables, comparable benchmarks, sensitivity analysis, and a comprehensive missing items list. Nothing was skipped. |
| Originality | **9/10** | Best insight in all three reports: spa repricing is the missing lever. Identifying that the model holds spa revenue flat at EUR 301K when repricing alone could take it to EUR 420-500K is a genuinely important finding that changes the deal thesis. Also provided the best seasonality analysis and the best benchmark tables. |
| Practical Usefulness | **5/10** | The corrected P&L is too aggressive to use directly. If you presented BCG's EUR 136K Base EBITDA to an investor or lender, they would push back on the double-counted NI and the FF&E reserve. The meeting preparation section is solid but generic -- less tactical than M&A's. |

**BCG Summary:** Outstanding analytical framework, best original insights, but the corrected numbers are wrong. BCG tried too hard to be conservative and ended up being inaccurate. The report is most valuable for its qualitative insights (spa repricing, timeline realism, seasonality) rather than its quantitative conclusions.

---

### Goldman Report -- Score: 8.5/10

| Dimension | Score | Rationale |
|-----------|:-----:|-----------|
| Accuracy | **8/10** | The correction waterfall methodology is sound. Each error is identified, quantified, and applied. The rent analysis is the most precise of all three (using contract-correct EUR 65,563 base). The corrected EBITDA range of EUR 297-322K is close to the QC verdict (EUR 260-285K), needing only the addition of missing items Goldman himself identified but did not include. Main accuracy issue: Goldman included a COGS correction of EUR 25K but then hedged heavily on whether it should be included, creating a EUR 25K range in the final number. |
| Completeness | **8/10** | Covered all major issues. Best treatment of the breakeven analysis (BAU breakeven at EUR 356K, only 17% safety margin). Best sensitivity analysis (revenue downside scenarios with full cost recalculation). Missed spa repricing as a revenue lever (Goldman noted spa revenue was flat but did not correct for it). |
| Originality | **7/10** | The breakeven analysis is Goldman's unique contribution -- no other analyst calculated that BAU has only 17% downside protection. The revenue per room per day analysis (Bull implies 7.6 treatments/room/day = 100% utilization) is a powerful reality check. The deal decision matrix (Section 12) is practical. But overall, Goldman covered familiar ground with better precision rather than surfacing new insights. |
| Practical Usefulness | **9/10** | The most usable report. The correction waterfall can be applied directly to the spreadsheet. The sensitivity tables give you instant answers to "what if revenue is 20% lower?" The valuation section (Section 10.3) gives you five different methodologies all pointing to EUR 175-272K -- powerful ammunition for Monday. Goldman's Appendix A corrected P&L is the closest to a usable model. |

**Goldman Summary:** The most rigorous and usable of the three reports. Methodologically the strongest. Missed the spa repricing insight (BCG's discovery) and missed the negotiation tactics (M&A's strength). The corrected numbers are close to right but need supplementing with the missing cost items Goldman identified but did not include.

---

### M&A Report -- Score: 7.5/10

| Dimension | Score | Rationale |
|-----------|:-----:|-----------|
| Accuracy | **4/10** | The corrected P&L is barely corrected. M&A only fixed the rent line and left everything else at model values. Base SG&A at EUR 18,772 for a EUR 961K business is indefensible. Utilities flat at EUR 14,741 when tripling revenue is wrong. COGS unchanged at 9.4%. The "corrected" Base EBITDA of EUR 365K is only EUR 33K below the model's EUR 399K -- meaning M&A found only an 8% overstatement when the true overstatement is 28-35%. |
| Completeness | **6/10** | Thorough on deal tactics and negotiation but thin on cost analysis. Did not provide a bottom-up cost rebuild. Did not address COGS composition, utility scaling, or SG&A adequacy. The missing cost items section (Q8) identified EUR 21.5-39K but then did not incorporate them into the corrected P&L. |
| Originality | **10/10** | The standout contribution of all three reports. M&A's insight that the model is a negotiation weapon -- and that Base/Bull should never be shown to the seller -- is worth more than every spreadsheet correction combined. The "scenario discipline matrix" (Appendix B) is brilliant. The deal structure (EUR 240K headline with EUR 180K cash) is immediately actionable. The seller counterargument scripts are outstanding. The "silence for 72 hours after the meeting" advice shows genuine deal experience. |
| Practical Usefulness | **10/10** | This is the report you read in the car on the way to the meeting. The 15-question script, the body language guidance, the red lines, the document request list on Carisma letterhead -- all of it is directly usable. M&A understands that Monday is not about spreadsheets; it is about people, leverage, and information collection. |

**M&A Summary:** The weakest analyst on numbers, the strongest on strategy. M&A's corrected P&L is essentially wrong (only fixed rent), but his negotiation guidance is priceless. The report should be used for WHAT TO DO on Monday, not for what numbers to believe. If you only had time to read one report before the meeting, this is the one. But if you need to make an investment decision, use Goldman's numbers corrected by BCG's insights.

---

### Final Analyst Rankings

| Rank | Analyst | Score | Best For |
|:----:|---------|:-----:|----------|
| 1 | Goldman | **8.5** | Corrected numbers, sensitivity analysis, valuation |
| 2 | M&A | **7.5** | Monday meeting strategy, deal structure, negotiation |
| 3 | BCG | **7.0** | Qualitative insights (spa repricing, timeline), benchmarks |

---

## PART 3: WHAT ALL THREE MISSED

### Blind Spot 1: The Transition Gap (Months 1-6)

None of the three analysts modeled what actually happens in the first 6 months post-acquisition. They all jump from INA Actual to BAU as if BAU is achievable immediately. In reality:

- **Month 1-2:** You cannot cut staff (TUPE). Revenue may dip 10-20% due to client anxiety about new ownership, staff uncertainty, and operational disruption. Monthly EBITDA: negative EUR 5-10K.
- **Month 3-4:** You begin restructuring consultations. Some staff self-select out. Revenue stabilizes. You are spending management time (your time, Mert) on integration instead of growing the business. Monthly EBITDA: EUR 0-3K.
- **Month 5-6:** Restructuring complete. BAU staffing in place. But you have not yet launched aesthetics or slimming expansion. Monthly EBITDA: EUR 4-5K.

**The 6-month transition gap means you burn EUR 20-40K in sub-BAU performance during integration.** This is a real cost that appears nowhere in any model. It should be budgeted as a one-time "transition EBITDA shortfall" of EUR 25K.

### Blind Spot 2: The 5% Turnover Fee Applies to NEW Service Lines

All three analysts correctly identified that the 5% turnover fee scales with revenue. But none of them articulated the full strategic implication: **the landlord profits from every single innovation Carisma introduces.**

- You invest EUR 60K to build a clinic room. The landlord pays nothing. But when that room generates EUR 420K in aesthetics revenue, the landlord collects EUR 21,000 annually in additional turnover fees.
- You hire and train slimming therapists at your cost. When slimming generates EUR 240K, the landlord collects EUR 12,000 annually.
- You reprice spa services from EUR 57 to EUR 80 ATR. Revenue goes from EUR 301K to EUR 420K. The landlord collects an additional EUR 5,950 annually on the repricing alone.

**Total landlord windfall from Carisma's investments:** EUR 39,000/year at Base case. Over 9 years remaining lease: EUR 351,000. The landlord makes more from Carisma's innovations than Carisma pays for the entire business.

This changes the negotiation with the landlord completely. When seeking lease assignment approval, Carisma should frame the conversation as: "We plan to invest EUR 200-300K in this spa and significantly grow its revenue. You will benefit directly through the 5% turnover clause. Approving the assignment is in your financial interest."

### Blind Spot 3: Malta-Specific Regulatory Timeline for Medical Aesthetics

None of the three analysts specified the actual regulatory pathway for launching injectable aesthetics in Malta. This is not a bureaucratic footnote -- it directly affects when the Base case revenue begins.

In Malta:
- **Superintendent of Public Health notification** is required for any premises offering medical aesthetic procedures (injectables, chemical peels, micro-needling). Processing time: 4-8 weeks.
- **Medical device registration** for new aesthetic equipment requires notification to the Malta Medicines Authority. Processing time: 2-4 weeks.
- **The prescribing physician** for injectables must be registered with the Medical Council of Malta and must have professional indemnity insurance naming the premises. Setup time: 2-4 weeks.
- **Controlled drug storage** (if offering certain IV therapies or prescription-grade treatments) requires Home Affairs approval.

**Total timeline from acquisition to first injectable treatment: 3-5 months minimum.** This means the aesthetics revenue ramp does not start at Month 1 -- it starts at Month 4-5. None of the three analysts built this regulatory delay into their timeline assumptions. BCG said "6-12 months to build aesthetics practice" but did not explain why. The regulatory pathway IS why.

### Blind Spot 4: The EUR 430K vs EUR 401K vs EUR 426K Revenue Confusion -- Not Fully Resolved

All three analysts noted the revenue discrepancies but none delivered a definitive reconciliation:

| Figure | Source | What It Represents |
|-------:|--------|-------------------|
| EUR 430,000 | Buyer's P&L model | Rounded presentation figure |
| EUR 426,018 | Seller's data room P&L | Verified trading income |
| EUR 401,329 | Revenue breakdown (3 service lines x 12) | Spa + Aesthetics + Slimming only |
| EUR 433,739 | Data room: EUR 426,018 trading + EUR 7,721 other income | Total income |

The actual reconciliation (which none of the three completed):

- Seller's verified trading income: EUR 426,018
- Buyer's model rounds this to: EUR 430,000 (EUR 3,982 rounding -- immaterial)
- Revenue breakdown covers only 3 service lines: EUR 401,329
- Gap: EUR 426,018 - EUR 401,329 = **EUR 24,689**
- "Other income" in data room: EUR 7,721
- Remaining gap: EUR 24,689 - EUR 7,721 = **EUR 16,968**

This EUR 16,968 is most likely retail product sales (skincare, body products sold in-store). This matters because retail has different COGS (50-60% vs 10% for services) and different margin characteristics. If EUR 17K of revenue is retail with 50% COGS, that is EUR 8,500 of COGS embedded in the EUR 44,437 line. Stripping it out means service COGS is really EUR 35,937 on EUR 409,050 service revenue = 8.8%. This slightly reduces the COGS correction needed for Base and Bull.

### Blind Spot 5: Carisma's Shared Overhead Advantage

None of the three analysts quantified how Carisma's existing operations change the cost structure. Carisma already has:

- A marketing team and social media infrastructure (reduces incremental marketing cost by EUR 10-15K vs standalone)
- Supplier relationships for treatment products (potential 5-10% COGS reduction through volume negotiation)
- An accounting and compliance function (reduces professional fees from EUR 8K standalone to EUR 3-5K incremental)
- A booking and CRM system (reduces IT costs from EUR 6-8K to EUR 2-3K incremental)
- Brand awareness in Malta's wellness market (reduces client acquisition cost)

**Estimated shared overhead saving: EUR 20-30K/year compared to a standalone operation.** This means the corrected EBITDA should actually be EUR 20-30K HIGHER than what a pure cost-correction exercise produces, because several "missing cost lines" that the analysts added are actually covered by existing Carisma infrastructure.

This is why my QC-corrected Base EBITDA of EUR 260-285K is already somewhat conservative. With shared overhead efficiencies, realizable Base EBITDA could reach EUR 280-310K.

### Blind Spot 6: Gift Voucher / Prepaid Package Liability

None of the three analysts addressed outstanding prepaid liability. Spas routinely sell gift vouchers and prepaid packages. These create a liability that transfers with the business. If INA has EUR 15-25K of outstanding gift vouchers (common for a spa doing EUR 430K revenue), the buyer inherits the obligation to honor them WITHOUT receiving the cash (which the seller already collected).

This is a hidden purchase price adjustment. EUR 20K of outstanding vouchers effectively increases the real purchase price by EUR 20K (you pay EUR 220K AND deliver EUR 20K of free services). M&A mentioned it in his term sheet adjustments ("Prepaid liabilities: quantify and deduct") but BCG and Goldman did not address it.

### Blind Spot 7: Seasonality Impact on Cash Flow and Turnover Fee Timing

All three noted seasonality (July trough) but none analyzed the interaction between seasonality and the 5% turnover fee. The turnover fee is calculated annually, but cash flow is monthly. If the fee is paid monthly based on actual sales:

- July revenue: EUR 22K. Turnover fee: EUR 1,100. Monthly costs: EUR 40-50K. Cash deficit: EUR 19-29K.
- Peak months (October-December): Revenue EUR 45-50K. Turnover fee: EUR 2,250-2,500. Monthly costs: EUR 40-50K. Small surplus.

The seasonal cash flow trough requires EUR 50-75K in working capital reserves (Goldman flagged this correctly at EUR 50-75K, BCG did not quantify it, M&A did not address it). This is capital that sits idle during peak months but is essential during the trough. At 4% cost of capital, the carrying cost of this working capital is EUR 2-3K/year -- a minor but real cost nobody modeled.

---

## PART 4: THE CORRECTED P&L -- DEFINITIVE VERSION

This P&L reconciles the best analysis from all three reports, corrects the errors each made, and incorporates the QC findings above.

### Methodology

1. **Revenue:** Use the original model's revenue figures (EUR 430K/430K/961K/1,321K). Do not reduce to BCG's EUR 900K/1,230K (that is a scenario change, not a correction). Note spa repricing upside separately.
2. **Wages:** Use the model's wage figures (Carisma rates). Do NOT add employer NI -- the wage table already reflects total cost to employer at Carisma rates.
3. **Rent:** Fixed base at EUR 63,000 (mid-range for 2026/27 lease year) + 5% of total revenue. Apply to all scenarios.
4. **COGS:** 10% for INA/BAU (spa-only), 12% for Base (blended with clinic), 11% for Bull (marginally better through scale).
5. **Missing costs:** Add payment processing, equipment maintenance, professional fees, training. But apply Carisma shared overhead discount.
6. **SG&A:** Rebuild from bottom-up using Goldman's framework but adjusted for Carisma efficiencies.

### The Definitive Corrected P&L

| Line Item | INA (Actual) | BAU (Yr 0.5) | Base (Yr 2) | Bull (Yr 3+) |
|-----------|-------------:|--------------:|------------:|--------------:|
| **Revenue** | | | | |
| Spa services | 301,000 | 301,000 | 301,000 | 301,000 |
| Aesthetics | 70,000 | 70,000 | 420,000 | 660,000 |
| Slimming | 30,500 | 30,500 | 240,000 | 360,000 |
| Other income (retail, vouchers, misc) | 28,500 | 28,500 | 28,500 | 28,500 |
| **Total Revenue** | **430,000** | **430,000** | **961,000** ^(1) | **1,321,000** ^(1) |
| | | | | |
| **Costs** | | | | |
| Wages & salaries | (209,574) | (177,000) | (317,400) | (402,600) |
| Rent -- fixed base | (50,189) ^(2) | (63,000) | (63,000) ^(3) | (65,000) ^(3) |
| Rent -- turnover fee (5%) | (21,500) | (21,500) | (48,050) | (66,050) |
| **Total rent** | **(71,689)** | **(84,500)** | **(111,050)** | **(131,050)** |
| COGS | (44,437) | (44,437) | (115,320) ^(4) | (145,310) ^(4) |
| Advertising & marketing | (25,000) | (25,000) | (52,000) ^(5) | (70,000) ^(5) |
| Utilities | (14,741) | (14,741) | (22,000) ^(6) | (30,000) ^(6) |
| Cleaning / housekeeping | (15,784) ^(7) | (13,000) | (18,000) | (22,000) |
| Insurance (incl medical PI) | (3,358) | (4,000) | (7,000) | (9,000) |
| IT / software / POS | (4,018) | (3,500) ^(8) | (5,000) ^(8) | (6,500) ^(8) |
| Equipment maintenance | (2,117) ^(9) | (5,000) | (8,000) | (10,000) |
| Payment processing (1.5% of card rev) | (5,500) | (5,500) | (12,250) ^(10) | (16,850) ^(10) |
| Professional fees (legal, accounting) | (2,000) ^(9) | (4,000) ^(8) | (5,000) ^(8) | (6,000) ^(8) |
| Training & CPD | (800) ^(9) | (2,000) | (5,000) | (4,000) |
| Other SG&A (general expenses, telecom, printing, staff events) | (10,413) ^(9) | (8,000) | (10,000) | (12,000) |
| **Total OPEX** | **(409,431)** | **(390,678)** | **(688,020)** | **(865,310)** |
| | | | | |
| **EBITDA** | **20,569** ^(11) | **39,322** | **272,980** | **455,690** |
| **EBITDA margin** | **4.8%** | **9.1%** | **28.4%** | **34.5%** |
| | | | | |
| Depreciation | (55,516) | (22,000) ^(12) | (30,000) ^(12) | (30,000) ^(12) |
| **Profit Before Tax** | **(34,947)** | **17,322** | **242,980** | **425,690** |
| Income tax (~5% effective) | 0 | (866) | (12,149) | (21,285) |
| **Net Profit** | **(34,947)** | **16,456** | **230,831** | **404,406** |

**Notes:**
1. Revenue held at model values. Spa repricing upside (EUR 120-180K) is additional and modeled separately in the sensitivity section below.
2. INA actual rent per seller's P&L.
3. Fixed base escalates 3% annually. EUR 63K for Year 1 post-acquisition, EUR 65K for Year 2+.
4. Blended COGS: spa at 10%, aesthetics at 15% (laser-heavy), slimming at 15%, retail at 50%. Base: (301K x 10% + 420K x 15% + 240K x 15% + 28.5K x 50%) / 961K = 12.0%. Bull: (301K x 10% + 660K x 12% + 360K x 12% + 28.5K x 50%) / 1,321K = 11.0%.
5. Marketing increased to 5.4% (Base) and 5.3% (Bull) -- below BCG's 7% recommendation but above the model's 4.2%, reflecting Carisma's existing marketing infrastructure.
6. Utilities scaled to 2.3% (Base) and 2.3% (Bull) -- conservative vs Goldman's 2.5%.
7. Cleaning was EUR 15,784 in seller's SG&A breakdown. Extracted as separate line.
8. Reduced vs standalone estimates due to Carisma shared overhead (existing accounting, IT systems, legal counsel).
9. Derived from seller's data room P&L breakdown of SG&A components.
10. Assumes 85% card payments at 1.5% processing fee.
11. INA EBITDA is lower than the model's EUR 28,403 because this P&L separates cleaning from SG&A and adds explicit payment processing. The seller's reported EUR 36,538 may exclude some of these costs. The truth is between EUR 20-36K.
12. Depreciation: EUR 220K purchase price over 10 years = EUR 22K (BAU). Base/Bull add EUR 60-80K clinic capex over 8 years = EUR 8K additional = EUR 30K total.

### Comparison Table: All Four Versions

| Scenario | Original Model | BCG Corrected | Goldman Corrected | M&A Corrected | **QC Definitive** |
|----------|---------------:|--------------:|------------------:|--------------:|------------------:|
| **INA EBITDA** | 28,403 | (26,030) | 28,018 | 28,403 | **20,569** |
| **BAU EBITDA** | 68,550 | 5,362 | 45,759 | 63,550 | **39,322** |
| **Base EBITDA** | 398,587 | 136,200 | 316,962 | 365,037 | **272,980** |
| **Bull EBITDA** | 628,387 | 243,400 | 504,762 | 576,837 | **455,690** |

### What the QC Numbers Mean for the Deal

| Metric | Value |
|--------|------:|
| Purchase price | EUR 220,000 |
| Total investment (purchase + capex + working capital + transition) | EUR 420,000 |
| BAU EBITDA (Year 1 realistic) | EUR 39,322 |
| Base EBITDA (Year 2-3 target) | EUR 272,980 |
| Payback on total investment (at Base) | 1.5 years from Base stabilization |
| Payback on total investment (at BAU only) | 10.7 years -- unacceptable |
| EV/EBITDA at purchase price (BAU) | 5.6x |
| EV/EBITDA at purchase price (Base) | 0.8x |
| Cash yield at Base on total investment | 65.0% |

**The deal works at Base. The deal does NOT work at BAU alone.** This is the critical finding that all three analysts noted but none stated with sufficient force. If you cannot execute the clinic expansion, you have paid EUR 420K for a business generating EUR 39K EBITDA. That is a 9.4% cash yield with significant operational burden -- you would be better off putting EUR 420K in a Maltese government bond at 4% with zero effort.

**The entire investment thesis depends on successfully launching aesthetics and slimming.**

### Sensitivity: With Spa Repricing (BCG's Insight)

If spa services are repriced from EUR 57 ATR to EUR 75 ATR (30% increase, conservative):

| Impact | Base | Bull |
|--------|-----:|-----:|
| Additional spa revenue (30% uplift on EUR 301K) | +90,300 | +90,300 |
| Additional COGS (10%) | (9,030) | (9,030) |
| Additional rent (5% turnover) | (4,515) | (4,515) |
| Additional utilities (2.3%) | (2,077) | (2,077) |
| Additional payment processing (1.3%) | (1,174) | (1,174) |
| **Net EBITDA impact** | **+73,504** | **+73,504** |
| **Revised EBITDA with repricing** | **346,484** | **529,194** |

Spa repricing is the highest-certainty value lever. It requires no capex, no new hires, no regulatory approvals, and no new service lines. It can begin on Day 1. BCG was right to highlight it. Adding EUR 73K to the Base EBITDA through repricing makes the deal economics meaningfully better: EUR 346K EBITDA on EUR 420K total investment = 82% cash yield and 1.2-year payback.

---

## PART 5: THE 10 THINGS THAT ACTUALLY MATTER FOR MONDAY

From all three reports and this QC review, these are the 10 things that will move the needle on Monday. Not 30. Not 50. Ten.

### 1. GET THE BANK STATEMENTS -- NOTHING ELSE MATTERS WITHOUT THEM

All three analysts agree: bank statements are the single most important document. The P&L has EUR 28K of unexplained wage discrepancies, EUR 28K of unreconciled revenue, and unknown missing cost lines. Bank statements resolve all of this in one document. If the seller refuses to provide 24-month bank statements, do not proceed to offer. (BCG: Critical priority. Goldman: Critical priority. M&A: "Non-negotiable.")

### 2. NEVER SHOW BASE OR BULL SCENARIOS

M&A's best insight: the model is a negotiation weapon. If the seller sees EUR 399K or EUR 628K EBITDA projections, the price conversation is over. You will never get EUR 220K again. Only show INA Actual and BAU. Everything beyond BAU is buyer-created value. (M&A: "CATASTROPHIC if leaked." BCG and Goldman did not address this.)

### 3. THE RENT WILL EAT YOUR UPSIDE -- NEGOTIATE THE TURNOVER FEE

The 5% turnover fee on ALL sales is the single most corrosive structural cost. At Base revenue, the landlord collects EUR 48K/year in turnover fees -- more than INA's entire current EBITDA. Over 9 years, the landlord collects EUR 350K+ from Carisma's innovations without investing a cent. Monday's meeting should lay groundwork for the landlord conversation: "Have you spoken to the landlord about a transfer?" Frame it as gathering information, but you are really assessing whether you can negotiate the turnover fee as part of lease assignment.

### 4. UNDERSTAND THE SELLER'S EMOTIONAL STATE

M&A's question is the best one for Monday: "What would you need to see in an offer to move forward? I'm not asking for a number -- I'm asking about structure, timing, and what matters beyond price." The answer to this question determines whether EUR 220K is a starting point or an insult. If the seller is exhausted and wants out, EUR 200K cash at close is more attractive than EUR 280K over 3 years. If the seller is proud and emotional, EUR 240K headline with structure (M&A's proposal) works better.

### 5. THE WAGE DISCREPANCY MUST BE RESOLVED -- BUT GENTLY

The EUR 28,626 gap between the wage table (EUR 238K) and P&L (EUR 209K) will come up. Frame it exactly as BCG recommends: "I notice a gap between the staffing costs and the P&L wages line. Can you help me understand the difference?" The most likely answer (Goldman's hypothesis): the seller pays lower salaries than Carisma's benchmarks. This means your BAU wage savings are smaller than modeled (you are cutting staff paid EUR 1,300/month, not EUR 1,700/month -- so you save EUR 3,900/month per head, not EUR 5,100/month). Savings from cutting 3 therapists: EUR 46,800, not EUR 61,200. This reduces BAU EBITDA by approximately EUR 14K. It needs to be verified.

### 6. CONFIRM THE LEASE -- READ CLAUSE 3.1 WORD BY WORD

The three analysts disagree on the exact rent mechanics: Is the 5% on ALL sales or on sales above EUR 350K? Is the fixed base EUR 60K, EUR 63K, or EUR 65.5K? Is the lease 9 years remaining or 13? These questions are worth EUR 5-15K/year in aggregate. You must read the actual lease document (not summaries) before or at the meeting. If the seller has not brought it, request it as priority #1.

### 7. THE DEAL ONLY WORKS IF YOU BUILD THE CLINIC

QC-corrected BAU EBITDA is EUR 39K on a EUR 420K total investment. That is a 9.4% cash yield. The deal only becomes attractive at Base (EUR 273K EBITDA, 65% cash yield). Base requires successfully launching aesthetics and slimming. This means the Monday meeting should include subtle probing about: (a) regulatory readiness of the premises for medical aesthetics, (b) whether the lease permits medical services (the "permitted use" clause), and (c) physical space available for clinic conversion. Do NOT reveal your plans -- but gather the information you need to assess feasibility.

### 8. ASK ABOUT THE CLEANERS

Two cleaners at EUR 20K/year are potentially unaccounted for in the model. If they are the hotel's employees (not INA's), that is a EUR 20K hidden benefit that may or may not survive the ownership change. If they are INA employees in the EUR 209K wages, the headcount is 15 not 13. If they are contractors in SG&A, the SG&A cut to EUR 19K may have eliminated them -- meaning BAU has no cleaning. One question resolves this: "How is cleaning handled? Do you have in-house cleaners or does the hotel provide that service?"

### 9. DO NOT DISCUSS PRICE

All three analysts agree: Monday is an information-gathering meeting, not a price negotiation. BCG: "Do NOT discuss price in the first meeting." Goldman: Not addressed (Goldman focused on model corrections, not meeting tactics). M&A: "If pressed, say: 'I want to be fair, and that means basing any offer on verified data.'" If the seller asks for a number, deflect with: "The independent valuation gives us a framework. Let me come back with something specific once I have the financial documents."

### 10. SPA REPRICING IS YOUR ACE IN THE HOLE -- BUT DO NOT PLAY IT

BCG's best insight: spa revenue should increase from EUR 301K to EUR 420K+ through repricing alone. This is EUR 73K of EBITDA upside that requires zero investment. But do NOT mention repricing to the seller. If you say "your prices are 30-40% below market," the seller will either (a) raise prices themselves before the sale, capturing the value, or (b) use it as evidence that the business is worth more. Keep this insight internal. After acquisition, implement repricing gradually over 6-12 months (BCG's ramp: EUR 57 to EUR 65 in Year 1, EUR 65 to EUR 77 in Year 2, EUR 77 to EUR 85 in Year 3).

---

## PART 6: THE ONE THING NOBODY SAID

All three analysts debated costs, corrected the rent, flagged missing line items, and proposed deal structures. But none of them articulated the single most important strategic question clearly enough:

**What happens when you need to renew the lease?**

The lease has approximately 9-10 years remaining. Every euro of value Carisma creates -- the clinic buildout, the slimming practice, the repriced spa, the client relationships, the brand equity -- is trapped inside a leasehold that expires. When it does, the landlord has absolute power.

At renewal, the landlord sees a business generating EUR 1M+ revenue and EUR 300K+ EBITDA. They know you have invested EUR 400K+ in improvements that are physically attached to their building. They know your only alternative is to walk away and lose everything. The negotiating leverage shifts entirely to the landlord.

The landlord can:
- Double the fixed base rent
- Increase the turnover fee from 5% to 8-10%
- Demand a key money payment (EUR 100-200K) for renewal
- Refuse to renew and take over the business themselves (or award it to another operator)
- Refuse to renew and simply benefit from the EUR 700K+ of improvements Carisma installed

**This is the real risk of the deal.** Not the purchase price. Not the EBITDA corrections. Not the Tuesday. The real risk is that you spend 9 years building a EUR 1M+ business and then lose it all at lease expiry because you are a tenant, not an owner.

Goldman hinted at this ("every euro of rent paid is a euro not building equity" -- BCG, Appendix B) and M&A mentioned the remaining lease term affects NPV/IRR calculations. But none of them said: **You need a lease extension or renewal option BEFORE you close this deal, or at minimum within the first 2 years of operation while you still have some negotiating leverage (i.e., before you have invested heavily and become trapped).**

The Monday meeting should include one carefully placed question: "Has the landlord ever discussed a lease extension beyond the current term?" The answer tells you whether a 15-year or 20-year renewal is realistic. If the landlord is open to extending at reasonable terms, this deal is excellent. If the landlord is hostile or non-communicative, the 9-year terminal value problem makes the deal much riskier than any P&L correction suggests.

**This is the one thing that actually determines whether this is a EUR 200K deal or a EUR 400K deal -- and none of the three analysts made it the centerpiece of their analysis.**

The 5% turnover fee, the rent escalation, and the lease assignment clause are all symptoms of the same underlying condition: you are building value on someone else's land. The lease expiry is when the bill comes due.

---

## APPENDIX A: RECONCILIATION OF ALL THREE CORRECTED P&Ls

### Revenue Assumptions

| Revenue Line | Original | BCG | Goldman | M&A | QC |
|-------------|--------:|-----:|--------:|----:|---:|
| **INA Total** | 430,000 | 430,000 | 426,018 | 430,000 | 430,000 |
| **BAU Total** | 430,000 | 430,000 | 430,000 | 430,000 | 430,000 |
| **Base Total** | 961,000 | 900,000 | 961,000 | 961,000 | 961,000 |
| **Bull Total** | 1,321,000 | 1,230,000 | 1,321,000 | 1,321,000 | 1,321,000 |

### Cost Comparisons (Base Case Only)

| Cost Line | Original | BCG | Goldman | M&A | QC | Notes |
|-----------|--------:|-----:|--------:|----:|---:|-------|
| Wages | 317,400 | 333,000 | 317,400 | 317,400 | 317,400 | BCG increased for higher wage ratio; QC uses model wages (Carisma rates) |
| Employer NI | 0 | 33,300 | 0 | 0 | 0 | QC: already in wage table |
| Rent total | 81,500 | 105,000 | 113,613 | 115,050 | 111,050 | Variation from fixed base assumptions |
| COGS | 90,000 | 108,000 | 90,000-115,000 | 90,000 | 115,320 | QC: 12% blended |
| Marketing | 40,000 | 63,000 | 40,000 | 40,000 | 52,000 | QC: between model and BCG |
| Utilities | 14,741 | 17,000 | 24,025 | 14,741 | 22,000 | QC: 2.3% of revenue |
| Cleaning | in SG&A | 18,000 | 20,000 | in SG&A | 18,000 | Extracted from SG&A |
| SG&A (ex cleaning) | 18,772 | 22,000 | 25,000-40,000 | 18,772 | 10,000 | QC: residual after extracting all identified lines |
| Insurance | in SG&A | 5,000 | 8,000 | in SG&A | 7,000 | |
| IT/Software | in SG&A | 6,000 | 6,000 | in SG&A | 5,000 | Carisma shared systems |
| Equipment maint | 0 | 8,000 | 8,000 | 5,000 | 8,000 | |
| Payment processing | 0 | 13,500 | 3,000 | 3,000 | 12,250 | BCG most thorough here |
| Professional fees | 0 | 8,000 | 6,000 | 3,000 | 5,000 | Carisma shared counsel |
| Training | 0 | 6,000 | 5,000 | 2,000 | 5,000 | |
| FF&E reserve | 0 | 18,000 | 0 | 0 | 0 | Not an operating expense |
| **Total OPEX** | **562,413** | **763,800** | **644,038** | **595,963** | **688,020** | |
| **EBITDA** | **398,587** | **136,200** | **316,962** | **365,037** | **272,980** | |

---

## APPENDIX B: INVESTMENT RETURN ANALYSIS AT QC-CORRECTED NUMBERS

### Scenario Matrix

| Revenue Achieved | Timeline | QC EBITDA | Return on EUR 420K Investment | Payback | Verdict |
|----------------:|----------|----------:|------------------------------:|--------:|---------|
| EUR 350K | Never (failure) | ~EUR 0 | 0% | Never | **Walk away** |
| EUR 430K (BAU) | Month 6+ | EUR 39K | 9.3% | 10.7 years | **Unacceptable alone** |
| EUR 550K (modest growth) | Year 1 | EUR 95K | 22.6% | 4.4 years | **Marginal** |
| EUR 700K (clinic ramp) | Year 2 | EUR 175K | 41.7% | 2.4 years | **Acceptable** |
| EUR 961K (Base) | Year 2-3 | EUR 273K | 65.0% | 1.5 years | **Attractive** |
| EUR 961K + repricing | Year 2-3 | EUR 346K | 82.4% | 1.2 years | **Very attractive** |
| EUR 1,321K (Bull) | Year 3+ | EUR 456K | 108.5% | 0.9 years | **Exceptional** |

### Total Investment Budget (QC-Corrected)

| Item | Amount | Timing |
|------|-------:|--------|
| Purchase price | 220,000 | Close |
| Lease assignment legal | 8,000 | Pre-close |
| Security deposit (3 months' rent) | 21,000 | Close |
| Clinic buildout capex | 65,000 | Month 1-6 |
| Transition working capital | 50,000 | Month 1-6 |
| Redundancy costs | 10,000 | Month 3-6 |
| Regulatory / licensing | 5,000 | Month 1-4 |
| Rebranding / signage | 5,000 | Month 1-3 |
| Transition EBITDA shortfall | 25,000 | Month 1-6 |
| Contingency (10%) | 41,000 | |
| **Total investment** | **450,000** | |

---

## APPENDIX C: DOCUMENT FOR THE RECORD

### Documents Used in This Review

1. BCG P&L Model Critique (12_BCG_PL_MODEL_CRITIQUE.md) -- 854 lines
2. Goldman P&L Model Scrutiny (12_GOLDMAN_PL_MODEL_SCRUTINY.md) -- 965 lines
3. M&A Deal Critique (12_MA_DEAL_CRITIQUE.md) -- 772 lines
4. Original buyer's P&L model (as provided in the brief)
5. Seller's data room P&L (referenced by all three analysts)
6. Fortina lease terms (referenced by all three analysts)

### Analyst Errors Identified by This QC Review

| # | Analyst | Error | Impact | Severity |
|---|---------|-------|--------|:--------:|
| 1 | BCG | Double-counted employer NI (EUR 33K) -- likely already in wage table | Overstated OPEX by EUR 33K, understated EBITDA by EUR 33K | HIGH |
| 2 | BCG | Included FF&E reserve as operating expense (EUR 18K) | Overstated OPEX by EUR 18K | MEDIUM |
| 3 | BCG | Changed revenue from EUR 961K to EUR 900K without separation from cost corrections | Conflated two distinct adjustments, making corrections un-auditable | MEDIUM |
| 4 | BCG | BAU EBITDA of EUR 5,362 contradicts seller's verified EUR 36,538 | Undermines credibility of the entire corrected P&L | HIGH |
| 5 | Goldman | Identified payment processing, professional fees, training, equipment maintenance but did not include all in correction waterfall | Corrected EBITDA overstated by EUR 35K | MEDIUM |
| 6 | Goldman | Used EUR 45K SG&A "conservatively" despite own analysis showing EUR 60K realistic | Internal inconsistency | LOW |
| 7 | Goldman | Did not identify spa repricing as a revenue lever | Missed the highest-certainty upside in the entire deal | MEDIUM |
| 8 | M&A | Corrected only rent line -- left SG&A, utilities, COGS unchanged | Corrected EBITDA overstated by EUR 92K | HIGH |
| 9 | M&A | Used 3 staff cuts (12 to 9) vs model's 5 cuts (13 to 8) -- headcount confusion | Redundancy cost estimate too low | LOW |
| 10 | M&A | No bottom-up cost reconstruction despite identifying EUR 21-39K in missing costs | Identified problems but did not fix the model | MEDIUM |
| 11 | All three | Did not model the Month 1-6 transition EBITDA shortfall | Missing EUR 20-40K real cost | MEDIUM |
| 12 | All three | Did not identify lease expiry as the primary strategic risk | Missed the most important long-term question | HIGH |
| 13 | All three | Did not quantify Carisma's shared overhead advantage | Corrected P&Ls all overstate standalone costs by EUR 20-30K | MEDIUM |
| 14 | All three | Did not address gift voucher / prepaid package liability | Potential EUR 15-25K hidden purchase price adjustment | LOW |

---

**Document Control**
Investment Committee QC Final Review | INA Spa & Wellness Acquisition
Version 1.0 | March 8, 2026
Classification: STRICTLY CONFIDENTIAL -- Principal Eyes Only
Supersedes: BCG, Goldman, and M&A individual reports for decision-making purposes
Author: Investment Committee Chair & Chief Quality Officer
