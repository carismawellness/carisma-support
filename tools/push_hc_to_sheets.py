#!/usr/bin/env python3
"""Push HC Cost Analysis data into the Salary Master Google Sheet as new tabs."""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# --- Auth ---
SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"
TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
SPREADSHEET_ID = "1AAnfm-SAYso6RpJhbdhJbTbcGDH1Ftlk0FHBPHfN98w"

with open(SECRETS_PATH) as f:
    secrets = json.load(f)["installed"]
with open(TOKEN_PATH) as f:
    token_data = json.load(f)

creds = Credentials(
    token=token_data["access_token"],
    refresh_token=token_data["refresh_token"],
    token_uri="https://oauth2.googleapis.com/token",
    client_id=secrets["client_id"],
    client_secret=secrets["client_secret"],
    scopes=["https://www.googleapis.com/auth/spreadsheets"],
)

# Refresh if expired
if not creds.valid:
    creds.refresh(Request())
    # Save refreshed token back
    new_token = {
        "access_token": creds.token,
        "expires_in": 3599,
        "refresh_token": creds.refresh_token,
        "scope": token_data.get("scope", ""),
        "token_type": "Bearer",
        "refresh_token_expires_in": token_data.get("refresh_token_expires_in", 0),
    }
    with open(TOKEN_PATH, "w") as f:
        json.dump(new_token, f, indent=2)
    print("Token refreshed and saved.")

service = build("sheets", "v4", credentials=creds)
sheets_api = service.spreadsheets()

# --- Get existing sheet titles ---
meta = sheets_api.get(spreadsheetId=SPREADSHEET_ID).execute()
existing_titles = {s["properties"]["title"] for s in meta["sheets"]}
print(f"Existing tabs: {len(existing_titles)}")

# --- Define all tabs to create ---
HC_PREFIX = "HC "  # Prefix all new tabs so they're grouped

tabs_data = {}

# ============================================================
# TAB 1: HC Executive Summary
# ============================================================
tabs_data[f"{HC_PREFIX}Executive Summary"] = [
    ["HC Cost Optimization: 35% vs 40% Analysis"],
    ["Date: 8 March 2026"],
    ["Scope: All 8 hotel spas across Malta"],
    [""],
    ["KEY FINDING: 40% is the only responsible Year 1 target."],
    ["Cutting to 35% immediately produces EUR 47K LESS net benefit than 40%."],
    [""],
    ["Metric", "35% Target", "40% Target", "Current State"],
    ["Total headcount", "46 (3 RMs + 43 on-site)", "52 (3 RMs + 49 on-site)", "~62"],
    ["Monthly loaded payroll", "EUR 79,354", "EUR 90,244", "EUR 111,000"],
    ["Annual loaded payroll", "EUR 952K", "EUR 1,083K", "EUR 1,332K"],
    ["Gross annual savings", "EUR 380K", "EUR 249K", "—"],
    ["Revenue loss (capacity + walk-ins)", "-EUR 126K", "-EUR 41K", "—"],
    ["Turnover/redundancy costs", "-EUR 64K", "-EUR 10K", "—"],
    ["NET annual benefit", "EUR 212K", "EUR 259K", "Baseline"],
    [""],
    ["RECOMMENDED GLIDE PATH"],
    ["Phase", "Timeline", "Target HC%", "Headcount", "How"],
    ["Phase 1", "Month 0-6", "40%", "52", "Restructure: 3 RMs, hub/spoke model, 10 redundancies"],
    ["Phase 2", "Month 6-12", "37%", "49", "Revenue growth (10-15% YoY) reduces HC% organically"],
    ["Phase 3", "Month 12-18", "35%", "45-47", "Natural attrition + continued growth"],
    [""],
    ["Cumulative 2-year savings:"],
    ["Glide path (40% → 35%)", "EUR 259K (Y1) + EUR 335K (Y2) = EUR 594K"],
    ["Immediate 35%", "EUR 212K (Y1) + EUR 300K (Y2) = EUR 512K"],
    ["Glide path advantage", "+EUR 82K over 2 years with less operational risk"],
]

# ============================================================
# TAB 2: HC Monthly Revenue
# ============================================================
tabs_data[f"{HC_PREFIX}Monthly Revenue"] = [
    ["Monthly Revenue by Hotel (EUR, Services ex-VAT)"],
    [""],
    ["Month", "Inter", "Hugos", "Hyatt", "Ramla", "Riviera", "Odycy", "Excelsior", "Novotel", "TOTAL"],
    ["Jan 25", 36890, 44411, 23492, 20792, 11381, 9661, "", "", 146627],
    ["Feb 25", 43283, 47851, 27685, 24924, 12873, 11950, "", "", 168566],
    ["Mar 25", 50300, 57034, 27747, 26617, 15403, 12098, "", "", 189198],
    ["Apr 25", 45332, 56849, 22679, 26530, 17442, 14637, "", "", 183469],
    ["May 25", 48798, 46791, 24002, 30780, 17999, 18652, "", "", 187022],
    ["Jun 25", 40584, 37041, 21047, 23004, 18094, 16260, "", "", 156029],
    ["Jul 25", 47586, 38302, 21844, 25274, 20859, 19741, 20990, "", 194597],
    ["Aug 25", 57295, 42479, 22055, 31313, 25032, 22435, 21625, "", 222236],
    ["Sep 25", 51920, 44564, 21490, 32455, 25774, 20616, 24634, "", 221454],
    ["Oct 25", 57277, 56213, 23536, 46327, 21434, 23337, 24708, 3104, 255936],
    ["Nov 25", 49655, 46415, 22371, 32425, 19079, 18050, 22223, 14143, 224362],
    ["Dec 25", 36377, 36026, 18794, 28304, 13928, 11084, 20356, 10301, 175170],
    ["Jan 26", 50578, 52052, 25734, 34501, 15468, 17600, 19553, 8019, 223505],
    [""],
    ["AVERAGES"],
    ["", "Inter", "Hugos", "Hyatt", "Ramla", "Riviera", "Odycy", "Excelsior", "Novotel", "TOTAL"],
    ["12M Avg (Jan-Dec 25)", 47125, 46165, 23062, 29062, 18274, 16543, 22423, 8892, 202388],
    ["Recent 6M Avg", 50517, 46292, 22330, 34221, 20119, 18854, 21916, 8892, 220444],
    ["Peak Month", "57,295 (Aug)", "57,034 (Mar)", "27,747 (Mar)", "46,327 (Oct)", "25,774 (Sep)", "23,337 (Oct)", "24,708 (Oct)", "14,143 (Nov)", "255,936 (Oct)"],
    ["Low Month", "36,377 (Dec)", "36,026 (Dec)", "18,794 (Dec)", "20,792 (Jan)", "11,381 (Jan)", "9,661 (Jan)", "19,553 (Jan26)", "3,104 (Oct)", "146,627 (Jan)"],
    ["Seasonality Index", "1.57x", "1.58x", "1.48x", "2.23x", "2.27x", "2.42x", "1.26x", "4.56x", "1.75x"],
]

# ============================================================
# TAB 3: HC Budget 35%
# ============================================================
tabs_data[f"{HC_PREFIX}Budget 35%"] = [
    ["HC Budget at 35% Target (EUR)"],
    ["Formula: HC Budget = Revenue × 0.35"],
    [""],
    ["Month", "Inter", "Hugos", "Hyatt", "Ramla", "Riviera", "Odycy", "Excelsior", "Novotel", "TOTAL"],
    ["Jan", 12912, 15544, 8223, 7277, 3983, 3381, 6844, 2807, 60971],
    ["Feb", 15149, 16748, 9690, 8723, 4506, 4183, 6844, 2807, 68650],
    ["Mar", 17605, 19962, 9711, 9316, 5391, 4234, 6844, 2807, 75871],
    ["Apr", 15866, 19897, 7938, 9286, 6105, 5123, 6844, 2807, 73866],
    ["May", 17079, 16377, 8401, 10773, 6300, 6528, 6844, 2807, 75109],
    ["Jun", 14204, 12964, 7366, 8051, 6333, 5691, 6844, 2807, 64261],
    ["Jul", 16655, 13406, 7645, 8846, 7301, 6909, 7347, 2807, 70916],
    ["Aug", 20053, 14868, 7719, 10960, 8761, 7852, 7569, 2807, 80590],
    ["Sep", 18172, 15597, 7522, 11359, 9021, 7216, 8622, 2807, 80316],
    ["Oct", 20047, 19675, 8238, 16214, 7502, 8168, 8648, 1086, 89578],
    ["Nov", 17379, 16245, 7830, 11349, 6678, 6317, 7778, 4950, 78527],
    ["Dec", 12732, 12609, 6578, 9906, 4875, 3879, 7125, 3605, 61310],
    ["Avg", 16488, 16158, 8072, 10172, 6397, 5790, 7271, 2870, 73330],
    [""],
    ["What 35% Can Afford (based on Recent 6M Avg Revenue)"],
    [""],
    ["Hotel", "35% Budget/mo", "RM Allocation", "Net for Staff", "Max Staff (at EUR 1,815/FT)"],
    ["Inter", 17681, "1,137 (1/3 of RM1)", 16544, "~9.1 FTE"],
    ["Hugos", 16202, "1,137 (1/3 of RM1)", 15065, "~8.3 FTE"],
    ["Hyatt", 7816, "1,137 (1/3 of RM1)", 6679, "~3.7 FTE"],
    ["Ramla", 11977, "1,137 (1/3 of RM2)", 10841, "~6.0 FTE"],
    ["Riviera", 7042, "1,137 (1/3 of RM2)", 5905, "~3.3 FTE"],
    ["Odycy", 6599, "1,137 (1/3 of RM2)", 5462, "~3.0 FTE"],
    ["Excelsior", 7671, "1,705 (1/2 of RM3)", 5966, "~3.3 FTE"],
    ["Novotel", 3112, "1,705 (1/2 of RM3)", 1407, "~0.8 FTE"],
    ["TOTAL", 78100, 10230, 67870, "~37 FTE"],
]

# ============================================================
# TAB 4: HC Budget 40%
# ============================================================
tabs_data[f"{HC_PREFIX}Budget 40%"] = [
    ["HC Budget at 40% Target (EUR)"],
    ["Formula: HC Budget = Revenue × 0.40"],
    [""],
    ["Month", "Inter", "Hugos", "Hyatt", "Ramla", "Riviera", "Odycy", "Excelsior", "Novotel", "TOTAL"],
    ["Jan", 14757, 17764, 9397, 8317, 4552, 3864, 7821, 3208, 69681],
    ["Feb", 17313, 19140, 11074, 9969, 5149, 4780, 7821, 3208, 78457],
    ["Mar", 20120, 22814, 11099, 10647, 6161, 4839, 7821, 3208, 86709],
    ["Apr", 18133, 22740, 9072, 10612, 6977, 5855, 7821, 3208, 84418],
    ["May", 19519, 18716, 9601, 12312, 7200, 7461, 7821, 3208, 85838],
    ["Jun", 16234, 14816, 8419, 9201, 7238, 6504, 7821, 3208, 73441],
    ["Jul", 19034, 15321, 8738, 10110, 8344, 7896, 8396, 3208, 81047],
    ["Aug", 22918, 16992, 8822, 12525, 10013, 8974, 8650, 3208, 92102],
    ["Sep", 20768, 17826, 8596, 12982, 10310, 8246, 9854, 3208, 91789],
    ["Oct", 22911, 22485, 9414, 18531, 8574, 9335, 9883, 1242, 102374],
    ["Nov", 19862, 18566, 8948, 12970, 7632, 7220, 8889, 5657, 89745],
    ["Dec", 14551, 14410, 7518, 11322, 5571, 4434, 8142, 4120, 70069],
    ["Avg", 18843, 18466, 9225, 11625, 7310, 6617, 8395, 3408, 83889],
    [""],
    ["What 40% Can Afford (based on Recent 6M Avg Revenue)"],
    [""],
    ["Hotel", "40% Budget/mo", "RM Allocation", "Net for Staff", "Max Staff (at EUR 1,815/FT)"],
    ["Inter", 20207, "1,137 (1/3 of RM1)", 19070, "~10.5 FTE"],
    ["Hugos", 18517, "1,137 (1/3 of RM1)", 17380, "~9.6 FTE"],
    ["Hyatt", 8932, "1,137 (1/3 of RM1)", 7795, "~4.3 FTE"],
    ["Ramla", 13688, "1,137 (1/3 of RM2)", 12552, "~6.9 FTE"],
    ["Riviera", 8048, "1,137 (1/3 of RM2)", 6911, "~3.8 FTE"],
    ["Odycy", 7542, "1,137 (1/3 of RM2)", 6405, "~3.5 FTE"],
    ["Excelsior", 8766, "1,705 (1/2 of RM3)", 7061, "~3.9 FTE"],
    ["Novotel", 3557, "1,705 (1/2 of RM3)", 1852, "~1.0 FTE"],
    ["TOTAL", 89257, 10230, 79027, "~43 FTE"],
]

# ============================================================
# TAB 5: HC Staffing Comparison
# ============================================================
tabs_data[f"{HC_PREFIX}Staffing Comparison"] = [
    ["Staffing Comparison: Current vs 35% vs 40%"],
    [""],
    ["Hotel", "Classification", "Current Staff", "At 35%", "At 40%", "What the extra 5% buys"],
    ["Inter", "HUB", 12, 9, 10, "+1 FT therapist (Matilde stays FT), +1 PT (Milena stays)"],
    ["Hugos", "HUB", 9, 8, 9, "+1 FT therapist (Tina stays FT), +1 PT (Linara redeployed)"],
    ["Ramla", "HUB", "8-9", 6, 7, "+1 FT therapist (Laura Camila stays)"],
    ["Hyatt", "SPOKE", 5, "4 (1 PT)", "4 (all FT)", "Natasha H stays FT instead of PT"],
    ["Riviera", "SPOKE", 7, 3, 4, "+1 PT therapist (weekend/peak coverage)"],
    ["Odycy", "SPOKE", 6, 3, 4, "+1 PT therapist (weekend/peak coverage)"],
    ["Excelsior", "SPOKE", 7, 3, 4, "+1 FT therapist (Sebastian stays)"],
    ["Novotel", "MICRO", 6, "2 (1 PT)", "2 (all FT)", "Vanessa stays FT instead of PT"],
    ["Float Pool", "—", 2, 2, 2, "Same"],
    ["Regional Managers", "—", "0*", 3, 3, "Same"],
    ["TOTAL", "", "~62", 46, 52, "+6 staff across 6 locations"],
    [""],
    ["* Currently managers sit on-desk; new model has them as roaming Regional Managers"],
    [""],
    ["Hub/Spoke Model"],
    ["HUB", "Dedicated receptionist + therapists + TIC/senior therapist"],
    ["SPOKE", "TIC (therapist who also handles reception) + therapists only"],
    ["MICRO", "TIC + 1 therapist, 90-day viability gate"],
]

# ============================================================
# TAB 6: HC Role Costs
# ============================================================
tabs_data[f"{HC_PREFIX}Role Costs"] = [
    ["Per-Role Loaded Monthly Costs (EUR)"],
    [""],
    ["Role", "Base Salary", "Avg Commission", "Employer NI (10%)", "Total Monthly", "Annual"],
    ["Regional Manager (RM)", 2350, 750, 310, 3410, 40920],
    ["Therapist-in-Charge (TIC)", 1600, 250, 185, 2035, 24420],
    ["Receptionist", 1350, 180, 153, 1683, 20196],
    ["FT Therapist", 1450, 200, 165, 1815, 21780],
    ["PT Therapist", 750, 100, 85, 935, 11220],
    ["Intern/Student", 650, 0, 65, 715, 8580],
    [""],
    ["Regional Manager Allocation"],
    ["RM", "Region", "Hotels", "Cost Split"],
    ["RM1 (Neli)", "Region 1", "Inter, Hugos, Hyatt", "1/3 each = EUR 1,137/hotel"],
    ["RM2 (Kristina)", "Region 2", "Ramla, Riviera, Odycy", "1/3 each = EUR 1,137/hotel"],
    ["RM3 (Melanie)", "Region 3 + Training", "Excelsior, Novotel", "1/2 each = EUR 1,705/hotel"],
]

# ============================================================
# TAB 7: HC Pressure Test
# ============================================================
tabs_data[f"{HC_PREFIX}Pressure Test"] = [
    ["Pressure Test Results"],
    [""],
    ["PEAK MONTH UTILIZATION (Must stay below 75% to be sustainable)"],
    [""],
    ["Hotel", "At 40% (Peak)", "At 35% (Peak)", "Verdict"],
    ["Inter", "69%", "85%", "35% is tight but survivable"],
    ["Hugos", "76%", "96%", "35% is physically impossible in March"],
    ["Hyatt", "56%", "78%", "35% is borderline"],
    ["Ramla", "76%", "100%", "35% exceeds capacity in October"],
    ["Riviera", "107%*", "107%*", "Both need float pool in Sep"],
    ["Odycy", "109%*", "109%*", "Both need float pool in Oct"],
    ["Excelsior", "47%", "65%", "Both safe"],
    ["Novotel", "56%", "240%", "35% = 1 person running spa = illegal"],
    [""],
    ["* Riviera/Odycy: 3-person teams at both targets. Float pool essential during peak."],
    [""],
    ["REVENUE RISK SUMMARY"],
    [""],
    ["Risk Type", "At 40%", "At 35%"],
    ["Capacity constraints (can't serve demand)", "EUR 0/year", "EUR 36K/year"],
    ["Walk-in/retail loss (no receptionist at spokes)", "EUR 41K/year", "EUR 66K/year"],
    ["Quality degradation (reviews, hotel partner friction)", "Minimal", "EUR 24K/year"],
    ["Turnover from burnout", "EUR 10K/year", "EUR 16K/year"],
    ["Additional redundancy costs", "EUR 0", "EUR 48K (amortized)"],
    ["TOTAL REVENUE/COST IMPACT", "EUR 51K/year", "EUR 190K/year"],
    [""],
    ["HOTEL-BY-HOTEL RISK RATING"],
    [""],
    ["Hotel", "Risk at 40%", "Risk at 35%", "Key Issue"],
    ["Inter", "LOW", "MEDIUM", "35% tight at August peak"],
    ["Hugos", "LOW", "HIGH", "March peak = 96% utilization = revenue loss guaranteed"],
    ["Hyatt", "LOW", "MEDIUM", "Low revenue makes cuts less impactful"],
    ["Ramla", "LOW-MEDIUM", "CRITICAL", "October peak exceeds capacity; cutting kills 43% YoY growth"],
    ["Riviera", "MEDIUM", "HIGH", "3 staff at both targets; float pool essential"],
    ["Odycy", "MEDIUM", "HIGH", "Same as Riviera"],
    ["Excelsior", "LOW", "MEDIUM", "Still ramping; needs headroom for growth"],
    ["Novotel", "HIGH", "CRITICAL", "2 staff minimum (legal requirement); 90-day viability gate"],
]

# ============================================================
# TAB 8: HC Personnel Actions
# ============================================================
tabs_data[f"{HC_PREFIX}Personnel Actions"] = [
    ["Key Personnel Decisions"],
    [""],
    ["Person", "Current Role", "Proposed Action"],
    ["Neli", "Hugos Manager", "Promote to RM1 (Region 1: Inter, Hugos, Hyatt)"],
    ["Kristina", "Ramla Supervisor", "Promote to RM2 (Region 2: Ramla, Riviera, Odycy)"],
    ["Melanie", "Excelsior Manager", "Transition to RM3 (Region 3 + Corporate Training)"],
    ["Anna", "Inter Manager", "Offer receptionist role at Ramla OR voluntary redundancy"],
    ["Ebru", "Novotel Manager", "Redundancy (Novotel revenue doesn't support manager)"],
    ["Flora", "Hyatt Supervisor", "Reclassify to TIC (Therapist-in-Charge)"],
    ["Wanessa", "Riviera Supervisor", "Redundancy or redeployment as FT therapist at hub"],
    [""],
    ["RESTRUCTURING SEQUENCE"],
    [""],
    ["Priority", "Action", "Savings/Month", "Risk"],
    ["1", "Novotel: Cut to 2 staff immediately", "EUR 7,650", "LOW (hemorrhaging cash)"],
    ["2", "Excelsior: Cut to 4, transition Melanie to RM3", "EUR 5,620", "LOW"],
    ["3", "Odycy: Resolve dual supervisor, cut to 4", "EUR 4,735", "LOW"],
    ["4", "Riviera: Cut to 4 (TIC model)", "EUR 6,535", "MEDIUM"],
    ["5", "Inter: Right-size reception, rebalance therapists", "EUR 5,192", "LOW"],
    ["6", "Hugos: Transition Neli to RM1, adjust staffing", "EUR 4,607", "LOW"],
    ["7", "Hyatt: Cut to 4 (TIC model)", "EUR 3,120", "LOW"],
    ["8", "Ramla: Right-size to 7 (after RM2 in place)", "EUR 4,427", "MEDIUM"],
]

# ============================================================
# TAB 9: HC Guardrails
# ============================================================
tabs_data[f"{HC_PREFIX}Guardrails"] = [
    ["Automatic Guardrails (Triggers to Halt/Adjust Restructuring)"],
    [""],
    ["Trigger", "Action"],
    ["Hotel revenue drops >15% YoY (outside Dec-Feb)", "Freeze headcount cuts at that hotel"],
    ["Company weekly revenue <EUR 33K for 3 weeks", "Emergency review; consider re-hiring"],
    ["Google review score <4.5 at any location", "Deploy float therapist for 2 weeks"],
    [">2 therapist departures in 60 days", "Halt restructuring; conduct stay interviews"],
    ["Hotel partner formal complaint", "Immediately add 1 FT therapist"],
    ["Utilization >80% at any location for 4+ weeks", "That location is understaffed — add 1 PT"],
]

# ============================================================
# TAB 10: HC Rosters 40%
# ============================================================
tabs_data[f"{HC_PREFIX}Rosters 40%"] = [
    ["7-Day Rosters at 40% Target (52 staff total)"],
    ["E = Early 9:00-17:30 | L = Late 11:30-20:00 | E4 = Morning PT | E6 = Extended"],
    [""],
    ["INTERCONTINENTAL (10 staff | EUR 19,378/mo | 38.4% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Marta", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Maria R.", "E", "E", "E", "OFF", "E", "E", "OFF", 40],
    ["FT Therapist", "Greta", "E", "E", "OFF", "E", "E", "E", "OFF", 40],
    ["FT Therapist", "Diana", "L", "L", "L", "L", "OFF", "OFF", "L", 40],
    ["FT Therapist", "Cuca", "OFF", "E", "E", "E", "E", "OFF", "E", 40],
    ["FT Therapist", "Mirela", "E", "OFF", "E", "OFF", "L", "L", "L", 40],
    ["FT Therapist", "Iza", "L", "OFF", "OFF", "L", "L", "L", "E", 40],
    ["FT Therapist", "Matilde", "OFF", "L", "L", "OFF", "E", "E", "E", 40],
    ["PT Therapist", "Milena", "OFF", "OFF", "OFF", "E4", "OFF", "E4", "E4", 12],
    ["PT Therapist", "Intern TBD", "E4", "E4", "E4", "OFF", "OFF", "OFF", "OFF", 12],
    [""],
    ["HUGOS (9 staff | EUR 17,498/mo | 37.8% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Romina", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Yvette", "E", "E", "E", "OFF", "E", "E", "OFF", 40],
    ["FT Therapist", "Tina", "E", "E", "OFF", "E", "E", "OFF", "E", 40],
    ["FT Therapist", "Zhenya", "L", "L", "OFF", "L", "L", "OFF", "E", 40],
    ["FT Therapist", "Anna M.", "OFF", "E", "E", "E", "OFF", "E", "E", 40],
    ["FT Therapist", "Therapist 5", "E", "OFF", "L", "OFF", "L", "L", "L", 40],
    ["FT Therapist", "Linara", "OFF", "OFF", "E", "L", "E", "E", "E", 40],
    ["PT Therapist", "PT Weekend", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    ["PT Therapist", "PT Midweek", "E4", "E4", "OFF", "OFF", "OFF", "OFF", "OFF", 8],
    [""],
    ["RAMLA (7 staff | EUR 12,818/mo | 37.5% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Maria G.", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Anna (redeployed)", "E", "E", "OFF", "E", "E", "OFF", "E", 40],
    ["FT Therapist", "Laura Camila", "E", "OFF", "E", "E", "OFF", "E", "E", 40],
    ["FT Therapist", "Jessica", "L", "L", "L", "OFF", "L", "OFF", "E", 40],
    ["FT Therapist", "Therapist 4", "OFF", "E", "E", "OFF", "L", "L", "L", 40],
    ["FT Therapist", "Therapist 5", "OFF", "OFF", "OFF", "L", "E", "E", "E", 40],
    ["PT Therapist", "PT Cover", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["HYATT (4 staff | EUR 8,350/mo | 37.4% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC (Flora)", "Flora", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Natasha H.", "L", "L", "OFF", "L", "OFF", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 4", "E", "OFF", "OFF", "E", "E", "OFF", "L", 40],
    [""],
    ["RIVIERA (4 staff | EUR 7,318/mo | 36.4% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Rivera", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    ["PT Therapist", "PT Weekend", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["ODYCY (4 staff | EUR 7,318/mo | 38.8% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Odycy", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    ["PT Therapist", "PT Weekend", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["EXCELSIOR (4 staff | EUR 7,555/mo | 34.5% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Excelsior", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Sebastian", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    ["PT Therapist", "PT Weekend", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["NOVOTEL (2 staff | EUR 3,850/mo | 43.3% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Novotel", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Vanessa", "OFF", "OFF", "L", "L", "OFF", "E", "E", 40],
    [""],
    ["FLOAT POOL (2 staff)"],
    ["Role", "Name", "Deployed to", "", "", "", "", "", "", "Hours/wk"],
    ["FT Float", "Float 1", "Riviera/Odycy peak coverage", "", "", "", "", "", "", 40],
    ["FT Float", "Float 2", "Holiday/sick cover across all sites", "", "", "", "", "", "", 40],
]

# ============================================================
# TAB 11: HC Rosters 35%
# ============================================================
tabs_data[f"{HC_PREFIX}Rosters 35%"] = [
    ["7-Day Rosters at 35% Target (46 staff total)"],
    ["E = Early 9:00-17:30 | L = Late 11:30-20:00 | E4 = Morning PT"],
    [""],
    ["INTERCONTINENTAL (9 staff | EUR 16,593/mo | 32.8% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Marta", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Maria R.", "E", "E", "E", "OFF", "E", "E", "OFF", 40],
    ["FT Therapist", "Greta", "E", "E", "OFF", "E", "E", "E", "OFF", 40],
    ["FT Therapist", "Diana", "L", "L", "L", "L", "OFF", "OFF", "L", 40],
    ["FT Therapist", "Cuca", "OFF", "E", "E", "E", "E", "OFF", "E", 40],
    ["FT Therapist", "Mirela", "E", "OFF", "E", "OFF", "L", "L", "L", 40],
    ["FT Therapist", "Iza", "L", "OFF", "OFF", "L", "L", "L", "E", 40],
    ["PT Therapist", "Matilde (reduced)", "OFF", "OFF", "OFF", "E4", "OFF", "E4", "E4", 12],
    ["PT Therapist", "Intern TBD", "E4", "E4", "E4", "OFF", "OFF", "OFF", "OFF", 12],
    [""],
    ["HUGOS (8 staff | EUR 15,543/mo | 33.6% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Romina", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Yvette", "E", "E", "E", "OFF", "E", "E", "OFF", 40],
    ["FT Therapist", "Tina (reduced to PT)", "E", "E", "OFF", "OFF", "OFF", "E", "E", 32],
    ["FT Therapist", "Zhenya", "L", "L", "OFF", "L", "L", "OFF", "E", 40],
    ["FT Therapist", "Anna M.", "OFF", "E", "E", "E", "OFF", "E", "E", 40],
    ["FT Therapist", "Therapist 5", "E", "OFF", "L", "OFF", "L", "L", "L", 40],
    ["PT Therapist", "PT Weekend", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    ["PT Therapist", "PT Midweek", "E4", "E4", "OFF", "OFF", "OFF", "OFF", "OFF", 8],
    [""],
    ["RAMLA (6 staff | EUR 10,983/mo | 32.1% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "Maria G.", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["Receptionist", "Anna (redeployed)", "E", "E", "OFF", "E", "E", "OFF", "E", 40],
    ["FT Therapist", "Jessica", "L", "L", "L", "OFF", "L", "OFF", "E", 40],
    ["FT Therapist", "Therapist 4", "OFF", "E", "E", "OFF", "L", "L", "L", 40],
    ["FT Therapist", "Therapist 5", "OFF", "OFF", "OFF", "L", "E", "E", "E", 40],
    ["PT Therapist", "PT Cover", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["HYATT (4 staff incl 1 PT | EUR 7,415/mo | 33.2% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC (Flora)", "Flora", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "L", "OFF", "L", "OFF", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["PT Therapist", "Natasha H. (reduced)", "OFF", "OFF", "OFF", "E4", "E4", "OFF", "OFF", 8],
    [""],
    ["RIVIERA (3 staff | EUR 5,665/mo | 28.2% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Riviera", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    [""],
    ["ODYCY (3 staff | EUR 5,665/mo | 30.0% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Odycy", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    [""],
    ["EXCELSIOR (3 staff | EUR 5,665/mo | 25.8% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Excelsior", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["FT Therapist", "Therapist 2", "L", "OFF", "L", "OFF", "L", "E", "E", 40],
    ["FT Therapist", "Therapist 3", "OFF", "L", "OFF", "L", "OFF", "E", "E", 40],
    [""],
    ["NOVOTEL (2 staff incl 1 PT | EUR 2,950/mo | 33.2% HC)"],
    ["Role", "Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Hours/wk"],
    ["TIC", "TIC Novotel", "E", "E", "E", "E", "E", "OFF", "OFF", 40],
    ["PT Therapist", "Vanessa (reduced)", "OFF", "OFF", "OFF", "OFF", "OFF", "E4", "E4", 8],
    [""],
    ["FLOAT POOL (2 staff)"],
    ["Role", "Name", "Deployed to", "", "", "", "", "", "", "Hours/wk"],
    ["FT Float", "Float 1", "Riviera/Odycy peak coverage", "", "", "", "", "", "", 40],
    ["FT Float", "Float 2", "Holiday/sick cover across all sites", "", "", "", "", "", "", 40],
]


# ============================================================
# EXECUTE: Create tabs and populate data
# ============================================================

# Step 1: Create all new sheets via batch update
add_requests = []
for title in tabs_data:
    if title in existing_titles:
        print(f"  Tab '{title}' already exists — will overwrite data")
    else:
        add_requests.append({
            "addSheet": {
                "properties": {
                    "title": title
                }
            }
        })

if add_requests:
    result = sheets_api.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": add_requests}
    ).execute()
    print(f"Created {len(add_requests)} new tabs")
else:
    print("All tabs already exist")

# Step 2: Populate each tab
for title, rows in tabs_data.items():
    # Convert all values to strings for the API
    str_rows = []
    for row in rows:
        str_rows.append([str(v) if v != "" else "" for v in row])

    # Determine range
    max_cols = max(len(r) for r in str_rows)
    end_col = chr(ord('A') + max_cols - 1) if max_cols <= 26 else 'Z'
    range_str = f"'{title}'!A1:{end_col}{len(str_rows)}"

    sheets_api.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_str,
        valueInputOption="RAW",
        body={"values": str_rows}
    ).execute()
    print(f"  Populated: {title} ({len(str_rows)} rows)")

print("\nDone! All HC analysis tabs added to Salary Master Sheet.")
print(f"Spreadsheet: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")
