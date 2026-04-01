"""
Register all CFO office agents on Paperclip.
Runs in dependency order: CFO-level agents first, then sub-agents.
Saves paperclip-registration.json and updates config.json for each agent.
"""

import json
import requests
from pathlib import Path
from datetime import date

BASE_URL = "http://127.0.0.1:3100"
COMPANY_ID = "a5fa2ad1-fb06-4a1c-a690-436bec394e85"
CFO_ID = "00ed4967-2265-4c54-b95e-2f3fc3d1e8fa"
SKILLS_DIR = Path(__file__).parent.parent / ".agents" / "skills"
TODAY = date.today().isoformat()

ADAPTER = {
    "adapterType": "claude_local",
    "adapterConfig": {
        "model": "claude-sonnet-4-6",
    },
}

# -----------------------------------------------------------------
# Agent definitions — (slug, title, icon, capabilities, parent_key)
# parent_key is either a UUID string (known at write time)
# or a slug string (resolved at runtime after that agent is created)
# -----------------------------------------------------------------

WAVE_1 = [  # Direct CFO reports
    (
        "financial-controller",
        "Financial Controller",
        "cog",
        "Quality gate between Bookkeeper daily work and CFO reporting. Owns the month-end close process (target: day 5), chart of accounts integrity, journal entry standards, and the internal controls programme. Reviews spot checks on manager sales handovers, maintains the diligence list, and signs off the management accounts before they reach the CFO. Nothing goes into the management accounts without Financial Controller approval.",
        CFO_ID,
    ),
    (
        "bookkeeper",
        "Bookkeeper",
        "database",
        "Maintains the general ledger and Zoho Books across all 3 Carisma brands and 10 locations. Owns the full daily and monthly bookkeeping cycle: z-report recording, POST BOX transactions, Zoho subscription double-count reversals, Stripe/Paypal/Acquiring processing fee entry, monthly cheque postings, Moneybase and Kraken trading log entry, and Purest Solutions sales segregation. Prepares the trial balance for Financial Controller sign-off.",
        CFO_ID,
    ),
    (
        "reconciliation-manager",
        "Reconciliation Manager",
        "git-branch",
        "Owns the full reconciliation cycle across all Carisma banking, payment processing, and revenue channels. Manages 3 sub-agents: Bank Reconciliation Manager (Fyorin, BOV, Moneybase, Kraken), Payment Processor Reconciliation Manager (Stripe, Paypal, Acquiring), and Revenue Reconciliation Manager (Airbnb/Booking.com, hotel room charges, z-report integrity, Zoho subscription double-count verification). Delivers a weekly reconciliation pack to Dr. Walter and a clean monthly position to the CFO.",
        CFO_ID,
    ),
    (
        "accounts-receivable-manager",
        "Accounts Receivable Manager",
        "target",
        "Owns all accounts receivable across B2B and B2C channels. Chases AR weekly, manages dunning members and failed Zoho subscription payments, sends monthly hotel room charge invoices and the Phytomer monthly sales report, reviews the discount tracker for unauthorised discounts, and maintains an AR ageing report. Targets DSO of 30 days. Escalates 60-day overdue accounts to CFO.",
        CFO_ID,
    ),
    (
        "accounts-payable-manager",
        "Accounts Payable Manager",
        "globe",
        "Manages all outbound supplier payments and accounts payable. Processes supplier invoices in Zoho Books, runs weekly payment runs, manages supplier relationships (hotel partners, Phytomer, CSA Group, Zoho), pays the annual CSA annual return, and maintains an AP ageing report. No payment above EUR 1,000 processed without CFO approval. Targets AP days of 30.",
        CFO_ID,
    ),
    (
        "payroll-statutory-compliance-manager",
        "Payroll & Statutory Compliance Manager",
        "shield",
        "Owns the full payroll and Malta statutory compliance cycle for all 3 Carisma brands. Manages 3 sub-agents: Salary Processing Manager (monthly payroll in Zoho Books, FS5 submission, Dr. Walter calculations), Government Forms Manager (FS3/FS5/FS7, provisional tax, social security for directors, 3rd-country national tax returns), and Benefits & Incentives Manager (disability foundation 25% salary claim, micro-invest, director reimbursements). Zero tolerance for late government filings.",
        CFO_ID,
    ),
    (
        "tax-vat-manager",
        "Tax & VAT Manager",
        "fingerprint",
        "Manages all Malta tax and VAT obligations across all Carisma entities. Owns the staggered quarterly VAT return cycle: Dec/Jan/Feb accounts to CLA (file April), Jun/Jul/Aug accounts to CSA (file Oct), Sep/Oct/Nov accounts to CSA (file Jan). Manages 2 sub-agents: VAT Compliance Manager and Audit Preparation Manager. Tracks CFR deadlines proactively. Zero late filings permitted.",
        CFO_ID,
    ),
    (
        "kpi-reporting-manager",
        "KPI & Reporting Manager",
        "radar",
        "Owns all financial reporting and KPI intelligence. Prepares the weekly KPI scorecard for CEO and CFO check-ins, populates the monthly KPI sheet (Fraud list, Spa general P&L, Spa-level P&L for all 10 locations, Aesthetics P&L), and maintains the EBITDA dashboard. Pulls data from Zoho Books and Fresha. Maintains fraud flags and revenue integrity reporting. Does not process transactions — solely translates data into decision-ready reports.",
        CFO_ID,
    ),
    (
        "treasury-cash-manager",
        "Treasury & Cash Manager",
        "gem",
        "Manages the daily cash position and treasury function across all accounts: BOV, Fyorin, Moneybase, and Kraken. Monitors inflows and outflows, maintains minimum 2-month cash coverage, tracks Moneybase and Kraken trading activity, submits monthly trading logs to Bookkeeper for Zoho Books entry, produces a daily cash position report and a weekly 4-week rolling cash flow forecast. Alerts CFO immediately if any account falls below minimum threshold.",
        CFO_ID,
    ),
    (
        "fpa-manager",
        "FP&A Manager",
        "telescope",
        "Owns all forward-looking financial planning for Carisma Wellness Group. Manages 2 sub-agents: Budget Manager (annual budget for 3 brands and 10 locations) and Forecasting Manager (rolling 12-month forecast, quarterly reforecast, scenario modelling). Produces monthly variance analysis (actuals vs budget with root-cause commentary), full-year landing estimates, and a 3-year strategic financial plan. The CFO's primary tool for proactive rather than reactive financial management.",
        CFO_ID,
    ),
    (
        "commercial-finance-manager",
        "Commercial Finance Manager",
        "rocket",
        "Strategic finance business partner to the CEO. Evaluates every major commercial decision with a rigorous financial case: new spa location openings (revenue ramp, IRR, breakeven), hotel partnership deal economics, acquisition modelling (INA Spa and future targets), marketing channel ROI and LTV/CAC by brand, treatment and membership pricing analysis, and post-investment reviews. Delivers financial models within 5 business days of CEO request. No strategic decision should be made without a Commercial Finance sign-off.",
        CFO_ID,
    ),
    (
        "cost-control-procurement-manager",
        "Cost Control & Procurement Manager",
        "wrench",
        "Owns the cost base and supplier ecosystem across 3 brands and 10 locations. Manages 2 sub-agents: Procurement Manager (supplier contracts, preferred supplier register, POs) and Product Cost Controller (COGS per treatment, Phytomer monthly sales report, product wastage flagging). Produces monthly COGS reports, cost vs budget variance, and a ranked cost reduction opportunity log. All supplier contracts above EUR 5,000/year require this agent's review before signature.",
        CFO_ID,
    ),
]

WAVE_2 = [  # Sub-agents — parent resolved at runtime from WAVE_1 results
    (
        "bank-reconciliation-manager",
        "Bank Reconciliation Manager",
        "lock",
        "Performs monthly reconciliation for all Carisma bank and treasury accounts: BOV (Bank of Valletta), Fyorin, Moneybase, and Kraken. Matches all ledger entries to bank statements, resolves discrepancies, and delivers a complete reconciliation file to the Reconciliation Manager by day 5 of each month. Also performs monthly cash account reconciliation.",
        "reconciliation-manager",
    ),
    (
        "payment-processor-reconciliation-manager",
        "Payment Processor Reconciliation Manager",
        "circuit-board",
        "Reconciles all card and digital payment processor accounts: Stripe, Paypal, and Acquiring. Matches processor settlement reports against Zoho Books entries, manually enters processing fees (which do not auto-post), and maintains a monthly processing fee schedule showing total cost and % of revenue by processor.",
        "reconciliation-manager",
    ),
    (
        "revenue-reconciliation-manager",
        "Revenue Reconciliation Manager",
        "atom",
        "Reconciles all revenue channels against Zoho Books: Airbnb and Booking.com (quarterly), hotel room charges, z-report daily revenue, and Zoho subscription (spa club) revenue. Owns revenue integrity controls — z-report accuracy, Zoho subscription double-count reversal verification, Purest Solutions sales segregation, and manager shift handover spot checks.",
        "reconciliation-manager",
    ),
    (
        "salary-processing-manager",
        "Salary Processing Manager",
        "cpu",
        "Executes the monthly payroll cycle for all Carisma staff (80-110 headcount across 3 brands). Posts payroll journal to Zoho Books, submits FS5 to Mr Mustafa for payment authorisation, confirms FS5 payment for prior month, and sends Dr. Walter payout calculations. Target: payroll posted by day 5, FS5 submitted on time every month.",
        "payroll-statutory-compliance-manager",
    ),
    (
        "government-forms-manager",
        "Government Forms Manager",
        "file-code",
        "Manages all Malta government statutory form submissions. Owns the annual FS3, FS5, FS7 cycle to CSA (January deadline), provisional tax payment (August), director social security payments for Mustafa, Mert, and Bilgi, and tax return submissions for all 3rd-country national employees. Maintains a statutory compliance calendar with hard deadlines. Zero tolerance for late filings.",
        "payroll-statutory-compliance-manager",
    ),
    (
        "benefits-incentives-manager",
        "Benefits & Incentives Manager",
        "star",
        "Manages all employee benefit programmes and government fiscal incentive claims. Owns the annual disability foundation filing (January — recovers 25% of qualifying salaries), micro-invest scheme application and prior year redemption, and director travel reimbursements (legally capped at EUR 140/day). Maximises all eligible Malta government incentives to reduce net payroll cost.",
        "payroll-statutory-compliance-manager",
    ),
    (
        "vat-compliance-manager",
        "VAT Compliance Manager",
        "shield",
        "Manages the quarterly VAT return cycle across all Carisma entities on Malta's staggered schedule: Dec/Jan/Feb accounts to CLA (send end March, file April), Jun/Jul/Aug accounts to CSA (send end Sept, file Oct), Sep/Oct/Nov accounts to CSA (send end Dec, file Jan). Tracks CFR reference numbers, maintains a 3-year rolling compliance history, and ensures accounts packs reach accountants at least 7 days before deadline.",
        "tax-vat-manager",
    ),
    (
        "audit-preparation-manager",
        "Audit Preparation Manager",
        "eye",
        "Manages the annual year-end close and audit preparation cycle. Coordinates book closure with Bookkeeper and Financial Controller, compiles the complete audit pack (financials, bank reconciliations, AR/AP ageing, fixed assets), submits to CSA, and resolves all auditor queries within 5 business days. Also coordinates the annual stock count (first week January) and submits the stock list to CSA by 7th January — a hard deadline.",
        "tax-vat-manager",
    ),
    (
        "budget-manager",
        "Budget Manager",
        "puzzle",
        "Owns the annual budget construction and tracking for Carisma Wellness Group. Builds bottom-up budgets for all 10 locations and 3 brands, consolidates into a group P&L, and distributes budget holder packs to every location manager by January. Updates the monthly budget vs actuals tracker within 7 days of each month-end close. Flags any budget line running more than 10% off plan.",
        "fpa-manager",
    ),
    (
        "forecasting-manager",
        "Forecasting Manager",
        "brain",
        "Maintains the rolling 12-month financial forecast updated monthly with the latest actuals and assumptions. Always shows where the business will land vs where it was planned to land. Runs scenario modelling (base, upside, downside) for new location openings, acquisitions, pricing changes, and headcount moves. Produces quarterly reforecasts and 3-year plan updates. Delivers models within 3 business days of ad-hoc requests.",
        "fpa-manager",
    ),
    (
        "procurement-manager",
        "Procurement Manager",
        "package",
        "Manages the full supplier lifecycle: sourcing, negotiation, contract management, and purchase order processing. Maintains the preferred supplier register with negotiated rates and renewal dates. Ensures all purchases above EUR 500 go through a formal PO and that locations buy only from approved suppliers. Runs annual renegotiation cycle for all major contracts. Reports annual procurement savings vs prior rates.",
        "cost-control-procurement-manager",
    ),
    (
        "product-cost-controller",
        "Product Cost Controller",
        "microscope",
        "Owns COGS analysis for all Carisma treatments and retail products. Calculates fully-loaded product cost per treatment, tracks margin per SKU, reconciles Phytomer product usage against the monthly sales report (a contractual submission to Phytomer), monitors product wastage by location, and flags any abnormal consumption. Produces the margin-per-treatment ranking used by Commercial Finance for pricing decisions.",
        "cost-control-procurement-manager",
    ),
]


def register_agent(name, title, icon, capabilities, reports_to_id):
    payload = {
        "name": name,
        "role": "general",
        "title": title,
        "icon": icon,
        "reportsTo": reports_to_id,
        "capabilities": capabilities,
        **ADAPTER,
    }
    url = f"{BASE_URL}/api/companies/{COMPANY_ID}/agents"
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    agent_id = data.get("id") or data.get("agent", {}).get("id")
    return agent_id, data


def save_registration(slug, name, title, icon, capabilities, reports_to_id, agent_id, reports_to_label):
    skills_path = SKILLS_DIR / slug
    skills_path.mkdir(parents=True, exist_ok=True)

    reg = {
        "_instructions": f"Registered via POST /api/companies/{COMPANY_ID}/agents on {TODAY}. Agent ID: {agent_id}. Reports to {reports_to_label} ({reports_to_id}).",
        "name": name,
        "role": "general",
        "title": title,
        "icon": icon,
        "reportsTo": reports_to_id,
        "capabilities": capabilities,
        **ADAPTER,
    }
    reg_path = skills_path / "paperclip-registration.json"
    with open(reg_path, "w") as f:
        json.dump(reg, f, indent=2)

    config_path = skills_path / "config.json"
    if config_path.exists():
        with open(config_path) as f:
            config = json.load(f)
        config["agent-id"] = agent_id
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)

    return reg_path


def main():
    registered = {}  # slug -> agent_id
    errors = []

    print(f"\n{'='*60}")
    print("CFO OFFICE — PAPERCLIP AGENT REGISTRATION")
    print(f"Company: {COMPANY_ID}")
    print(f"CFO:     {CFO_ID}")
    print(f"{'='*60}\n")

    # WAVE 1: Direct CFO reports
    print("WAVE 1 — Direct CFO reports\n")
    for slug, title, icon, capabilities, parent_id in WAVE_1:
        name = slug  # Paperclip name field
        try:
            agent_id, _ = register_agent(name, title, icon, capabilities, parent_id)
            registered[slug] = agent_id
            save_registration(slug, name, title, icon, capabilities, parent_id, agent_id, "CFO")
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            errors.append((slug, str(e)))
            print(f"  ✗  {title:<45} ERROR: {e}")

    # WAVE 2: Sub-agents
    print(f"\nWAVE 2 — Sub-agents\n")
    for slug, title, icon, capabilities, parent_slug in WAVE_2:
        name = slug
        parent_id = registered.get(parent_slug)
        if not parent_id:
            errors.append((slug, f"Parent '{parent_slug}' not registered — skipping"))
            print(f"  ✗  {title:<45} SKIP (parent '{parent_slug}' missing)")
            continue
        try:
            agent_id, _ = register_agent(name, title, icon, capabilities, parent_id)
            registered[slug] = agent_id
            save_registration(slug, name, title, icon, capabilities, parent_id, agent_id, parent_slug)
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            errors.append((slug, str(e)))
            print(f"  ✗  {title:<45} ERROR: {e}")

    # Summary
    print(f"\n{'='*60}")
    print(f"DONE — {len(registered)} agents registered, {len(errors)} errors")
    if errors:
        print("\nErrors:")
        for slug, msg in errors:
            print(f"  {slug}: {msg}")
    print(f"{'='*60}\n")

    # Print full ID map for reference
    print("Agent ID map:")
    for slug, aid in registered.items():
        print(f"  {slug}: {aid}")


if __name__ == "__main__":
    main()
