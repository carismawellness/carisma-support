#!/usr/bin/env python3
"""Add creative brief notes to Q2 2026 campaign cells.

Adds a note to the first cell of each campaign's name row (at the campaign
start date column) containing the campaign brief — type, offer, core message,
creative format, priority, and channels.
"""

import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# ── Auth ──────────────────────────────────────────────────────────────────────
SECRETS_PATH = "/Users/mertgulen/.go-google-mcp/client_secrets.json"
TOKEN_PATH = "/Users/mertgulen/.go-google-mcp/token.json"
SPREADSHEET_ID = "1q40Ke8wRsjnoVOngDupVdwxIWiTFXwYfh1ZwvUa9xtc"
SHEET_ID = 703110006

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
if not creds.valid:
    creds.refresh(Request())
    with open(TOKEN_PATH, "w") as f:
        json.dump({
            "access_token": creds.token,
            "expires_in": 3599,
            "refresh_token": creds.refresh_token,
            "scope": token_data.get("scope", ""),
            "token_type": "Bearer",
            "refresh_token_expires_in": token_data.get("refresh_token_expires_in", 0),
        }, f, indent=2)
    print("Token refreshed.")

service = build("sheets", "v4", credentials=creds)
sheets_api = service.spreadsheets()

# ── Constants ─────────────────────────────────────────────────────────────────
START_COL = 92  # Apr 1 = col 92

def date_to_col(month, day):
    """Convert month/day to 0-indexed column index."""
    if month == 4:
        return START_COL + day - 1
    elif month == 5:
        return START_COL + 30 + day - 1
    elif month == 6:
        return START_COL + 61 + day - 1


# ── Campaign Notes ────────────────────────────────────────────────────────────
# (name_row, start_month, start_day, note_text)

NOTES = [
    # ═══ SPA META — EVERGREEN ═══
    (6, 4, 1, "EVERGREEN | Spa Day Package\nOffer: Spa Day Package (EUR 89) — thermal pools, steam room, sauna, 60-min massage\nBudget: EUR 8/day | Bid: Lowest Cost | CBO\nHighest volume lead generator. Runs year-round.\nSeasonal angles: Summer wellness, winter warmth, self-care, holiday escape"),

    (8, 4, 1, "EVERGREEN | Couples Package\nOffer: Couples Spa Package (EUR 159/couple) — side-by-side massage, private jacuzzi, prosecco\nBudget: EUR 8/day | Bid: Lowest Cost | CBO\nPeaks: Valentine's, anniversaries, summer\nAngles: Romance, date night, mother-daughter"),

    (10, 4, 1, "EVERGREEN | Massage\nOffer: Standalone massage bookings\nBudget: EUR 7/day | Bid: Lowest Cost | CBO\nLow-ticket entry point, high conversion\nAngles: Stress relief, post-workout, weekly ritual"),

    (12, 4, 1, "EVERGREEN | Gift Cards\nOffer: Flexible voucher (EUR 50+), valid 12 months, e-voucher available\nBudget: EUR 7/day | Bid: Lowest Cost | CBO\nSpikes at Christmas, Mother's Day, Valentine's\nRuns year-round as gifting evergreen"),

    # ═══ SPA META — OCCASION ═══
    (14, 4, 1, "OCCASION | Golden Bloom Easter Retreat\nPriority: HIGH | Easter (Apr 5)\nWindow: Apr 1–6\nCore: Easter is your permission slip to stop. 90-min Golden Bloom Ritual — organic teas, seasonal botanicals\nOffer: 90-min Signature Ritual + organic welcome tea. Price TBC €95–€115\nCreative: UGC (client in robe, steam, golden light) + static offer\nChannels: Meta Ads + organic social + email + GBP"),

    (16, 4, 1, "OCCASION | The Art of Letting Go\nPriority: MEDIUM | Stress Awareness Month\nWindow: Apr 1–30\nCore: Stress is the invisible weight. 50-min massage or hammam = 50 minutes where the world stops.\nOffer: 50-min Full Body Massage OR Hammam Ritual. €60–€70 or 3-pack\nCreative: UGC (hands on back, exhale) + testimonial\nChannels: Meta Ads + organic social + GBP"),

    (18, 4, 1, "OCCASION | The Carisma Bridal Ritual\nPriority: HIGH | Bridal Season\nWindow: Apr 1 – Jun 30 (long-run evergreen)\nCore: Your wedding day is set. Your treatment timeline shouldn't be an afterthought.\nOffer: Bridal Ritual Package: signature facial + full body massage + hair treatment. €150–€180\nCreative: UGC (bride-to-be, glowing skin) + testimonial (recent bride)\nChannels: Meta Ads + organic social + email"),

    (20, 4, 26, "OCCASION | The Greatest Gift\nPriority: HIGH | Mother's Day (May 10)\nWindow: Apr 26 – May 10\nCore: She said she doesn't want anything. Give her this anyway.\nOffer: Spa Day Package (€89) + Gift Card option (from €50)\nCreative: UGC (daughter gifting mum) + static gift card\nChannels: Meta Ads + organic social + email + GBP\nBUDGET FLAG: Increase 50% for final 7 days (May 3–10)"),

    (22, 4, 26, "OCCASION | Six Weeks to Summer\nPriority: HIGH | Summer Ready\nWindow: Apr 26 – May 31\nCore: Summer is six weeks away. HydraFacial + Body Glow = head-to-toe reset.\nOffer: HydraFacial + Body Glow Package. Course of 2–3 sessions. From €120/session\nCreative: UGC (glowing skin result) + static countdown\nChannels: Meta Ads + organic social + email"),

    (24, 5, 1, "OCCASION | The Six-Week Wellness Journey\nPriority: MEDIUM | Mental Health Awareness Month\nWindow: May 1–31\nCore: Wellness isn't a treatment. It's a practice. Weekly massage subscription, 15% off.\nOffer: 6-week weekly massage subscription, 15% off\nCreative: Testimonial (emotional transformation) + founder-led\nChannels: Meta Ads + organic social + email"),

    (26, 6, 1, "OCCASION | Malta's Finest Escape\nPriority: MEDIUM | Peak Tourist Season\nWindow: Jun 1–30\nCore: Mediterranean island escape. Tourist Express Package + Family Spa Day.\nOffer: Tourist Express (60-min, all-inclusive) + Family option. Competitive vs hotel spas.\nCreative: Static (Malta backdrop + spa interior)\nChannels: Meta Ads (geo-target tourists IN Malta) + organic + GBP"),

    (28, 6, 1, "OCCASION | Strength, Recovered\nPriority: MEDIUM | Men's Health Month\nWindow: Jun 1–30\nCore: Recovery is not the opposite of strength — it's what makes it possible.\nOffer: Deep Tissue + Recovery Package for men. 60-min + recovery add-on.\nCreative: Founder-led (male therapist/client) + UGC\nChannels: Meta Ads + organic social + GBP"),

    (30, 6, 1, "OCCASION | The Gift of Deep Relief\nPriority: HIGH | Father's Day (Jun 15)\nWindow: Jun 1–14\nCore: Dad carries a lot. He just doesn't say so. Gift he'd never book himself.\nOffer: Deep Tissue Massage 60-min (€65) or 90-min (€85) + Gift Card\nCreative: Static (gift card, masculine palette) + UGC\nChannels: Meta Ads + organic + email + GBP\nBUDGET FLAG: Increase 40% for Jun 8–15"),

    (32, 6, 1, "OCCASION | Couples Summer Glow\nPriority: HIGH | Summer Ready (Couples)\nWindow: Jun 1–30\nCore: Summer in Malta is best spent together. HydraFacial for both + Couples Spa.\nOffer: HydraFacial for two + Couples Package (€159 base + add-on)\nCreative: UGC (couple in spa, natural and joyful)\nChannels: Meta Ads + organic social + email"),

    # ═══ SPA GOOGLE ═══
    (61, 4, 1, "GOOGLE ALWAYS-ON | Search: Spa Day\nType: Search | Status: Always-on\nBudget: EUR 60/day\nCore search campaign capturing 'spa day' intent. Primary lead driver on Google.\nProven performer from Q1."),

    (63, 4, 1, "GOOGLE ALWAYS-ON | PFM Remarketing\nType: Performance Max | Status: Always-on\nBudget: EUR 24/day\nRetargets website visitors across Google's network (Display, YouTube, Gmail, Discover).\nPMax performance-driven."),

    (67, 4, 1, "GOOGLE ALWAYS-ON | Pmax Store Visit\nType: Performance Max | Status: Always-on\nBudget: EUR 36/day\nDrives store visits across all Spa locations.\nBroad reach, strong local intent."),

    # ═══ AESTHETICS META — EVERGREEN ═══
    (99, 4, 1, "EVERGREEN | Ultimate Facelift\nOffer: Non-surgical facelift combination treatment\nBudget: EUR 10/day | Bid: Lowest Cost | CBO\nSignature treatment, high perceived value\nAccount: act_382359687910745"),

    (101, 4, 1, "EVERGREEN | Natural Jawline\nOffer: Jawline contouring with fillers\nBudget: EUR 10/day | Bid: Cost Cap EUR 5 | CBO\nStrong demand, cost cap testing active\nAccount: act_382359687910745"),

    (103, 4, 1, "EVERGREEN | 4-in-1 Hydrafacial Glow\nOffer: HydraFacial Glow (cleanse, extract, hydrate, protect)\nBudget: EUR 10/day | Bid: Lowest Cost | CBO\nBroad appeal, low barrier to entry\nAccount: act_382359687910745"),

    (105, 4, 1, "EVERGREEN | Lip Filler\nOffer: Lip enhancement with dermal fillers\nBudget: EUR 8/day | Bid: Lowest Cost | CBO\nConsistent demand, younger demographic skew\nAccount: act_382359687910745"),

    (107, 4, 1, "EVERGREEN | LHR Summer\nOffer: Laser Hair Removal packages — varies by body area\nBudget: EUR 10/day | Bid: Lowest Cost | CBO\nDEMAND-FLEXIBLE: Scale up pre-summer (Apr-Jun)\nQ2 is peak LHR season — run at full budget"),

    # ═══ AESTHETICS META — OCCASION ═══
    (109, 4, 1, "OCCASION | Spring Skin Reset\nPriority: HIGH | Easter Renewal (Apr 5)\nWindow: Apr 1–6\nCore: New season, fresh skin. HydraFacial + light peel + SPF = clean slate for summer.\nOffer: HydraFacial + light chemical peel + SPF consultation. €160–€180 package.\nCreative: Before-after (skin texture) + founder-led\nChannels: Meta Ads + organic social + email + GBP"),

    (111, 4, 1, "OCCASION | Bridal Beauty Blueprint\nPriority: HIGH | Bridal Season\nWindow: Apr 1–30 (evergreen through Jun)\nCore: Your dress is chosen. Your skin should be on the same timeline.\nOffer: Free consultation → custom treatment timeline (Botox, fillers, HydraFacials). From €180+\nCreative: Founder-led (planning process) + UGC (consultation, results)\nChannels: Meta Ads + organic social + email"),

    (113, 4, 1, "OCCASION | Peel. Protect. Glow.\nPriority: MEDIUM | Peel Season Peak\nWindow: Apr 1–30\nCore: April is the last month to peel safely before Malta sun intensifies.\nOffer: Chemical peel course (2–3 peels) + post-peel SPF. From €90/session or bundle\nCreative: Before-after (skin texture) + static educational\nChannels: Meta Ads + organic social + GBP"),

    (115, 4, 26, "OCCASION | Mum's Glow Moment\nPriority: HIGH | Mother's Day (May 10)\nWindow: Apr 26 – May 10\nCore: Give her the gift she'd never buy herself — Botox or HydraFacial gift card.\nOffer: Mother's Day gift: Botox voucher (from €180) + HydraFacial gift card\nCreative: UGC (mother looking radiant) + static gift card\nChannels: Meta Ads + organic + email + GBP\nBUDGET FLAG: Increase 40% for May 3–10"),

    (117, 4, 26, "OCCASION | Last Chance Glow\nPriority: HIGH | Summer Ready Peak\nWindow: Apr 26 – May 31\nCore: Appointments are filling. Express Botox, emergency HydraFacials, last-chance glow packages.\nOffer: Express Botox (from €180) + HydraFacial same-week booking\nCreative: UGC (results-forward, glowing) + static urgency (limited slots)\nChannels: Meta Ads + organic social + email"),

    (119, 5, 10, "OCCASION | Bridal Party Packages\nPriority: MEDIUM | Wedding Season Peak\nWindow: May 10–31\nCore: The bride isn't the only one who wants to look her best.\nOffer: Bridal party packages: 10–15% off for 3+ bookings. HydraFacials minimum.\nCreative: UGC (group of women in clinic, celebratory)\nChannels: Meta Ads + organic social + email"),

    (121, 6, 1, "OCCASION | Summer Upkeep. Made Simple.\nPriority: HIGH | Summer Ready Final\nWindow: Jun 1–30\nCore: Summer doesn't take a break. Monthly HydraFacial maintenance plan.\nOffer: Monthly HydraFacial subscription or pre-paid 3-pack + loyalty incentive for Q3\nCreative: UGC (post-HydraFacial, dewy glow) + static plan visual\nChannels: Meta Ads + organic + email + GBP"),

    (123, 6, 1, "OCCASION | Dad's Glow-Up\nPriority: HIGH | Father's Day (Jun 15)\nWindow: Jun 1–14\nCore: Give him the gift of looking and feeling his best. Professional skin analysis + Men's Glow.\nOffer: Men's Glow Package: skin analysis + injectables consult (Botox from €180). Gift card option.\nCreative: UGC (male client, natural look) + static gift card\nChannels: Meta Ads + organic + email + GBP\nBUDGET FLAG: Increase 30% for Jun 8–15"),

    # ═══ AESTHETICS GOOGLE ═══
    (157, 4, 1, "GOOGLE ALWAYS-ON | Wrinkle Relaxer Search\nType: Search | Status: Always-on\nBudget: EUR 4/day | CPC 0.33 | CPL 8.60\nCaptures high-intent 'botox malta' searches. Core aesthetic treatment."),

    (159, 4, 1, "GOOGLE ALWAYS-ON | Lip Fillers Search\nType: Search | Status: Always-on\nBudget: EUR 4/day\nCaptures 'dermal fillers' and 'lip filler' intent."),

    (161, 4, 1, "GOOGLE ALWAYS-ON | Microneedling + Mesotherapy Search\nType: Search | Status: Always-on\nBudget: EUR 4/day | CPC 0.52 | CPL 9.18\nPROVEN TOP PERFORMER — excellent results, high conversion, strong ROI.\nPrioritise budget here."),

    (163, 4, 1, "GOOGLE ALWAYS-ON | Laser Hair Removal Search\nType: Search | Status: Always-on\nBudget: EUR 4/day | CPC 0.38 | CPL 8.39\nLHR search campaigns for aesthetics. Consistent performer."),

    (165, 4, 1, "GOOGLE ALWAYS-ON | LHR Remarketing PMax\nType: Performance Max | Status: Always-on\nBudget: EUR 4/day\nRetargets LHR page visitors and past leads."),

    # ═══ SLIMMING META — EVERGREEN ═══
    (177, 4, 1, "EVERGREEN | Fat Freezing (CoolSculpting)\nOffer: CoolSculpting Starter Pack (EUR 199, was EUR 625) — 3 sessions + spa access + body analysis\nBudget: EUR 10/day | Bid: Lowest Cost | CBO\n68% discount positioning, limited weekly capacity\nAccount: act_1496776195316716 (USD)"),

    (179, 4, 1, "EVERGREEN | Muscle Stimulation (EMSculpt NEO)\nOffer: EMSculpt NEO 3-in-1 Protocol (EUR 199, was EUR 625) — 4 sessions + spa access + body analysis\nBudget: EUR 13/day | Bid: Lowest Cost | CBO\n'Build muscle without gym' angle\nAccount: act_1496776195316716 (USD)"),

    (181, 4, 1, "EVERGREEN | Skin Tightening (VelaShape)\nOffer: VelaShape Starter Pack (EUR 199, was EUR 625) — 4 sessions + spa access + body analysis\nBudget: EUR 5/day | Bid: Lowest Cost | CBO\nPost-pregnancy and 40+ demographic\nAccount: act_1496776195316716 (USD)"),

    (183, 4, 1, "EVERGREEN | MWL Menopause\nOffer: Medical Weight Loss Consultation (free) — doctor-led, 30+ years experience\nBudget: EUR 12/day | Bid: Lowest Cost | CBO\nTarget: Women 45+ experiencing menopause-related weight gain\nAccount: act_1496776195316716 (USD)"),

    (185, 4, 1, "EVERGREEN | MWL Pain-Solution\nOffer: Medical Weight Loss Consultation (free) — doctor-led\nBudget: EUR 13/day | Bid: Lowest Cost | CBO\nTarget: Women with weight-related pain (joints, back, mobility)\nAccount: act_1496776195316716 (USD)"),

    (187, 4, 1, "EVERGREEN | MWL AfterBaby\nOffer: Medical Weight Loss Consultation (free) — doctor-led\nBudget: EUR 8/day | Bid: Lowest Cost | CBO\nTarget: Post-pregnancy women wanting body transformation\nAccount: act_1496776195316716 (USD)"),

    (189, 4, 1, "EVERGREEN | MWL RiskReversal\nOffer: Medical Weight Loss Consultation (free) — doctor-led\nBudget: EUR 13/day | Bid: Lowest Cost | CBO\nTarget: Women who've tried everything, need medical oversight guarantee\nAccount: act_1496776195316716 (USD)"),

    # ═══ SLIMMING META — OCCASION ═══
    (191, 4, 1, "OCCASION | New Season, New You\nPriority: HIGH | Easter / Spring Renewal (Apr 5)\nWindow: Apr 1–6\nCore: Spring isn't about a new diet. It's about a plan that fits your life.\nOffer: Free body consultation (doctor-led) OR CoolSculpting Starter €199\nCreative: Founder-led (doctor on camera) + UGC (confident clinic entrance)\nChannels: Meta Ads + organic social + email"),

    (193, 4, 1, "OCCASION | The Summer Sculpt Plan\nPriority: MEDIUM | Summer Body Prep\nWindow: Apr 1–30\nCore: Summer is 8–12 weeks away. Enough time for real change — if you start now.\nOffer: 8-week plan (CoolSculpting €199) or 12-week plan (EMSculpt €199 + skin tightening)\nCreative: UGC (woman in treatment) + static comparison card\nChannels: Meta Ads + organic social + email"),

    (195, 4, 24, "OCCASION | Bridal Body Sculpt\nPriority: MEDIUM | Wedding Season / Pre-Bridal Body\nWindow: Apr 24 – May 3\nCore: The dress fits. But does it feel like you? Built around your wedding date.\nOffer: Free consultation → CoolSculpting Starter (€199) or EMSculpt 3-in-1 (€199)\nCreative: Testimonial (past bride) + UGC\nChannels: Meta Ads + organic social + email"),

    (197, 4, 26, "OCCASION | Me Time for Mum\nPriority: HIGH | Mother's Day (May 10)\nWindow: Apr 26 – May 10\nCore: She gives everything to everyone. Give her something purely for her.\nOffer: Mother's Day package: fat freeze + skin tightening (€199 Starter as gift)\nCreative: UGC (mum relaxing in treatment) + testimonial\nChannels: Meta Ads + organic social + email"),

    (199, 5, 25, "OCCASION | Summer Confidence Sprint\nPriority: MEDIUM | Pre-Holiday Sculpting\nWindow: May 25 – Jun 8\nCore: You have time. Not a lot — but enough. Single-session or short-course.\nOffer: Express CoolSculpting or EMSculpt (€199 Starter)\nCreative: UGC (confident woman, summer outfit) + static countdown\nChannels: Meta Ads + organic social + email"),

    (201, 6, 1, "OCCASION | The Men's Sculpt Plan\nPriority: MEDIUM | Men's Health Month\nWindow: Jun 1–30\nCore: Most men don't talk about it. EMSculpt + fat freeze, no-nonsense, doctor-led.\nOffer: Male EMSculpt + fat freeze package. Performance-focused, not vanity.\nCreative: UGC (male client, athletic context) + static comparison\nChannels: Meta Ads + organic social + GBP"),

    (203, 6, 1, "OCCASION | Built for Him\nPriority: HIGH | Father's Day (Jun 15)\nWindow: Jun 1–14\nCore: The best gift is the one he'll actually use. Male body contouring.\nOffer: EMSculpt (€199 Starter) + fat freeze. Gift card option.\nCreative: UGC (male in treatment) + static\nChannels: Meta Ads + organic social + email"),

    (205, 6, 22, "OCCASION | Express Summer Sessions\nPriority: MEDIUM | Pre-Holiday Rush\nWindow: Jun 22–30\nCore: Your holiday is weeks away. One session is not nothing.\nOffer: Express single-session CoolSculpting or EMSculpt\nCreative: UGC (confident woman packing for holiday) + static urgency\nChannels: Meta Ads + organic social"),

    # ═══ SLIMMING GOOGLE ═══
    (237, 4, 1, "GOOGLE ALWAYS-ON | Medical Weight Loss Search\nType: Search | Status: Always-on\nBudget: EUR 7/day\nCaptures 'medical weight loss' clinical-intent audience.\nDoctor-led positioning."),

    (239, 4, 1, "GOOGLE ALWAYS-ON | Weight Loss Search\nType: Search | Status: Always-on\nBudget: EUR 7/day\nBroader 'weight loss' search intent. Wider funnel.\nSimple structure that works."),
]

# ── Build updateCells Requests ────────────────────────────────────────────────
print(f"Building note requests for {len(NOTES)} campaigns...")

requests = []
for name_row, start_month, start_day, note_text in NOTES:
    col_index = date_to_col(start_month, start_day)
    row_index = name_row - 1  # Convert to 0-indexed

    requests.append({
        "updateCells": {
            "range": {
                "sheetId": SHEET_ID,
                "startRowIndex": row_index,
                "endRowIndex": row_index + 1,
                "startColumnIndex": col_index,
                "endColumnIndex": col_index + 1,
            },
            "rows": [{"values": [{"note": note_text}]}],
            "fields": "note",
        }
    })

print(f"  Generated {len(requests)} note requests.")

# ── Apply Notes ───────────────────────────────────────────────────────────────
print("Applying notes to spreadsheet...")

BATCH_SIZE = 50
for chunk_start in range(0, len(requests), BATCH_SIZE):
    chunk = requests[chunk_start:chunk_start + BATCH_SIZE]
    result = sheets_api.batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": chunk},
    ).execute()
    print(f"  Batch {chunk_start // BATCH_SIZE + 1}: {len(chunk)} notes applied OK")

print(f"\nDone! Added {len(requests)} campaign brief notes.")
print("\nScript complete.")
