"""
Register consolidated CFO office agents on Paperclip.
5 direct CFO reports + 2 critical sub-agents = 7 total.

Structure:
  CFO
  ├── Financial Controller         (owns books + controls)
  │   └── Bookkeeper               (daily GL entries)
  ├── Reconciliation & Treasury    (bank recon + payments + AR/AP + cash)
  ├── Payroll & Compliance         (payroll + VAT + Malta statutory)
  │   └── Government Forms Manager (Malta government form submissions)
  ├── FP&A & Reporting             (KPI reporting + budgeting + forecasting)
  └── Commercial Finance           (commercial decisions + cost control + procurement)
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
# (slug, title, icon, capabilities, parent_key)
# parent_key = UUID string or slug resolved at runtime
# -----------------------------------------------------------------

WAVE_1 = [  # Direct CFO reports
    (
        "financial-controller",
        "Financial Controller",
        "cog",
        "Owns the financial foundation of Carisma Wellness Group — books and controls. Manages the Bookkeeper sub-agent for daily Zoho Books entries across 3 brands and 10 locations. Owns month-end close (target day 5), management accounts, chart of accounts integrity, and the internal controls programme. Nothing enters the management accounts without Financial Controller sign-off. Spot-checks manager handovers and maintains the fraud/discount tracker.",
        CFO_ID,
    ),
    (
        "reconciliation-treasury-manager",
        "Reconciliation & Treasury Manager",
        "git-branch",
        "The consolidated cash and payments spine of Carisma. Owns bank reconciliation (BOV, Fyorin, Moneybase, Kraken), payment processor reconciliation (Stripe, PayPal, Acquiring — including manual processing fee posting), AR collections (hotel room charge invoicing, membership dunning, DSO target 30 days), AP payment runs (weekly), and treasury (daily cash position, 4-week rolling forecast, 2-month minimum coverage). Alerts CFO immediately if any account falls below minimum threshold.",
        CFO_ID,
    ),
    (
        "payroll-compliance-manager",
        "Payroll & Compliance Manager",
        "shield",
        "Owns every obligation Carisma has to its people and the Malta government. Monthly payroll for 80-110 headcount: posts journal to Zoho Books, submits FS5 for authorisation, sends Dr. Walter calculations. Malta statutory: FS3/FS5/FS7 annual (January), provisional tax (August), director social security. VAT returns on Malta's staggered schedule: Dec/Jan/Feb to CLA (file April), Jun/Jul/Aug to CSA (file Oct), Sep/Oct/Nov to CSA (file Jan). Manages Government Forms Manager sub-agent. Zero tolerance for late filings.",
        CFO_ID,
    ),
    (
        "fpa-reporting-manager",
        "FP&A & Reporting Manager",
        "radar",
        "The forward-looking intelligence engine of the CFO office. Reporting: weekly KPI scorecard for CEO/CFO check-ins, monthly KPI sheet (Fraud list, Spa general P&L, 10-location P&L, Aesthetics P&L), EBITDA dashboard — all from Zoho Books and Fresha. Planning: annual budget for 3 brands and 10 locations, rolling 12-month forecast updated monthly, quarterly reforecast, 3-year plan, monthly variance analysis with root-cause commentary. KPI sheet and EBITDA dashboard must be ready by day 7.",
        CFO_ID,
    ),
    (
        "commercial-finance-manager",
        "Commercial Finance Manager",
        "rocket",
        "Strategic and commercial edge of the CFO office — three roles in one. (1) Commercial Partner: investment cases for new locations (IRR, breakeven, payback), hotel partnership economics, acquisition modelling (INA Spa and future targets), marketing ROI, treatment/membership pricing — nothing strategic goes forward without sign-off. (2) Cost Control: monthly COGS per treatment (target 30% of revenue), Phytomer monthly sales report (contractual), wastage monitoring (flag >3% per location). (3) Procurement: preferred supplier register, POs above EUR 500, annual renegotiation (5% savings target). No contract above EUR 5,000/year without CFO approval.",
        CFO_ID,
    ),
]

WAVE_2 = [  # Sub-agents
    (
        "bookkeeper",
        "Bookkeeper",
        "database",
        "Executes the daily and monthly bookkeeping cycle in Zoho Books for all 3 Carisma brands and 10 locations. Owns: z-report revenue recording, POST BOX transaction entry, Zoho subscription double-count reversals, Stripe/PayPal/Acquiring processing fee entries, monthly cheque postings, Moneybase and Kraken trading log entries, and Purest Solutions sales segregation. Prepares the monthly trial balance for Financial Controller review.",
        "financial-controller",
    ),
    (
        "government-forms-manager",
        "Government Forms Manager",
        "file-code",
        "Handles all Malta government statutory form submissions for Carisma Wellness Group. Owns: FS3, FS5, FS7 annual cycle to CSA (January deadline). Provisional tax payment (August). Director social security for Mustafa, Mert, and Bilgi. Tax returns for all 3rd-country national employees (reviewed with Mustafa before submission). Disability foundation annual filing (January — recovers 25% of qualifying salaries). Micro-invest scheme application and prior-year redemption. Director travel reimbursements (EUR 140/day cap). Maintains hard-deadline statutory calendar.",
        "payroll-compliance-manager",
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
    print("CFO OFFICE — CONSOLIDATED AGENT REGISTRATION (7 agents)")
    print(f"Company: {COMPANY_ID}")
    print(f"CFO:     {CFO_ID}")
    print(f"{'='*60}\n")

    # WAVE 1: Direct CFO reports
    print("WAVE 1 — 5 direct CFO reports\n")
    for slug, title, icon, capabilities, parent_id in WAVE_1:
        name = slug
        try:
            agent_id, _ = register_agent(name, title, icon, capabilities, parent_id)
            registered[slug] = agent_id
            save_registration(slug, name, title, icon, capabilities, parent_id, agent_id, "CFO")
            print(f"  ✓  {title:<45} {agent_id}")
        except Exception as e:
            errors.append((slug, str(e)))
            print(f"  ✗  {title:<45} ERROR: {e}")

    # WAVE 2: Sub-agents
    print(f"\nWAVE 2 — 2 critical sub-agents\n")
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

    print("Agent ID map:")
    for slug, aid in registered.items():
        print(f"  {slug}: {aid}")


if __name__ == "__main__":
    main()
