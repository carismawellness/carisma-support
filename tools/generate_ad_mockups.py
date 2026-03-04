#!/usr/bin/env python3
"""
Generate production-quality ad mockup PNGs for all 25 Carisma creative refresh scripts.
Renders HTML at exact Meta ad dimensions, screenshots via Playwright.
Output: .tmp/figma-mockups/{brand}/ - ready for Figma import.
"""

import os
import json
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / ".tmp" / "figma-mockups"

# Brand color systems
BRANDS = {
    "slimming": {
        "name": "Carisma Slimming",
        "primary": "#C0544F",
        "secondary": "#8B3A36",
        "accent": "#D4A96A",
        "bg_start": "#3A2820",
        "bg_end": "#5C4033",
        "light": "#F5E0DE",
        "badge_bg": "#C0544F",
        "badge_text": "#fff",
    },
    "aesthetics": {
        "name": "Carisma Aesthetics",
        "primary": "#D4A96A",
        "secondary": "#8B6914",
        "accent": "#5B7FA5",
        "bg_start": "#2A2018",
        "bg_end": "#4A3828",
        "light": "#F5EBD8",
        "badge_bg": "#D4A96A",
        "badge_text": "#3A2820",
    },
    "spa": {
        "name": "Carisma Spa & Wellness",
        "primary": "#9CAF8B",
        "secondary": "#6B8E5B",
        "accent": "#C4846C",
        "bg_start": "#1E2A1A",
        "bg_end": "#3A4A30",
        "light": "#E8F0E4",
        "badge_bg": "#9CAF8B",
        "badge_text": "#1E2A1A",
    },
}

# All 25 ads structured
ADS = [
    # === SLIMMING NEW ===
    {
        "code": "SLIM-NEW-01",
        "name": "Your Doctor Said Lose Weight",
        "brand": "slimming",
        "campaign": "CBO_MWL_Pain-Solution",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Your doctor said lose weight.\nBut nobody told you how.",
        "body": "No meal plan. No referral.\nJust 'lose weight.'\n\nAt Carisma Slimming,\nthe doctor IS the plan.",
        "cta": "Free medical consultation.\nLimited weekly spots.",
        "headline": "Doctor-Led Weight Loss",
        "visual_note": "Doctor in white coat, warm clinical setting. Soft lighting, cream walls. Text slides in gently.",
    },
    {
        "code": "SLIM-NEW-02",
        "name": "I Lost the Weight Then I Saw My Arms",
        "brand": "slimming",
        "campaign": "CBO_SkinTight",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "I lost the weight.\nThen I saw my arms.",
        "body": "The scale changed.\nMy skin didn't.\n\nNon-invasive skin tightening.\n4 sessions. Visible firming.",
        "cta": "EUR 199 — 4 sessions\n+ spa access + body analysis\nBook your consultation",
        "headline": "Skin Tightening EUR 199",
        "visual_note": "Woman 30s-40s, full-length mirror, sleeveless top. Warm home setting, intimate & relatable.",
    },
    {
        "code": "SLIM-NEW-03",
        "name": "What I Eat in a Day",
        "brand": "slimming",
        "campaign": "CBO_MWL_Pain-Solution",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "What I eat in a day\non a medical weight loss plan",
        "body": "Spoiler: it's not salads\nand sadness.\n\nReal food. Real portions.\nDoctor-designed.",
        "cta": "Free medical consultation\nSee what YOUR plan could look like",
        "headline": "See Your Meal Plan",
        "visual_note": "UGC phone-shot aesthetic. Real kitchen, Mediterranean food. Quick cuts, natural lighting.",
    },
    {
        "code": "SLIM-NEW-04",
        "name": "Menopause Changed My Body",
        "brand": "slimming",
        "campaign": "CBO_MWL_Menopause",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Menopause changed my body.\nScience changed it back.",
        "body": "Your metabolism isn't broken —\nit's misunderstood.\n\nDoctor-led plan designed\nfor hormonal changes.",
        "cta": "Free medical consultation.\nFor women who are done guessing.",
        "headline": "Menopause Weight Loss",
        "visual_note": "Confident woman 45-55 or doctor-patient consultation. Warm neutrals with subtle blue accent.",
    },
    {
        "code": "SLIM-NEW-05",
        "name": "I Tried Ozempic First",
        "brand": "slimming",
        "campaign": "CBO_MWL_RiskReversal",
        "format": "Carousel 5-card",
        "dims": (1080, 1350),
        "is_carousel": True,
        "cards": [
            {"text": "I tried Ozempic first.\n\nHere's what happened.", "note": "Bold white text on dark moody background. Story opener."},
            {"text": "EUR 300/month. Nausea.\n\nAnd the weight came back\nwhen I stopped.", "note": "Muted desaturated. Receipt/price tag icon."},
            {"text": "Then I found a\ndoctor-led programme.\n\nNo injections.\nNo dependency.", "note": "Transition to warm tones. Inviting clinical setting."},
            {"text": "Body composition analysis\n+ personalised nutrition\n+ real accountability.", "note": "Three visual elements. Warm, professional."},
            {"text": "Free medical consultation.\n\nEUR 199 all-inclusive.\nNo hidden costs.\n\nTap to book.", "note": "Clean branded card. Warm gradient. Logo."},
        ],
        "headline": "Doctor-Led Alternative",
        "visual_note": "5-card story arc: dark/dramatic (1-2) to warm/inviting (3-5).",
    },
    # === SLIMMING REFRESH ===
    {
        "code": "SLIM-REFRESH-01",
        "name": "Worried GLP-1s v2 March",
        "brand": "slimming",
        "campaign": "CBO_MWL_RiskReversal",
        "format": "Static Post 4:5",
        "dims": (1080, 1350),
        "hook": "Worried GLP-1s are risky?\nYou're not wrong to ask.",
        "body": "Side effects. Dependency. The cost.\nYou've read the articles.\n\nThere's a medically supervised\nprogramme — no injections.\nNo GLP-1s. No dependency.",
        "cta": "Free medical consultation.\nLimited weekly spots.",
        "headline": "GLP-1 Alternative",
        "visual_note": "New background: woman researching on phone, concerned. Or clean clinic waiting room. Brighter, warmer.",
        "is_refresh": True,
        "original_cpl": "$1.36",
    },
    {
        "code": "SLIM-REFRESH-02",
        "name": "Not Sure GLP-1s Safe Doctor v2",
        "brand": "slimming",
        "campaign": "CBO_MWL_RiskReversal",
        "format": "Doctor Post 4:5",
        "dims": (1080, 1350),
        "hook": "Not sure if GLP-1s are safe?\nOur doctors get this\nquestion every day.",
        "body": "GLP-1s work for some.\nBut they're not the only option.\n\n30+ years combined\nclinical experience.\nDoctor-supervised every step.",
        "cta": "Free medical consultation.\nSee if you're a candidate.",
        "headline": "Ask Our Doctors",
        "visual_note": "Different doctor image from v1. Warm clinical setting. Approachable, trustworthy.",
        "is_refresh": True,
        "original_cpl": "$0.97",
    },
    {
        "code": "SLIM-REFRESH-03",
        "name": "One Stubborn Area — Thighs v2",
        "brand": "slimming",
        "campaign": "CBO_FatFreeze",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "One stubborn area.\nNo matter what you do,\nyour thighs won't budge.",
        "body": "Fat freezing targets the area.\nNot your whole body.\n\nNon-invasive.\nWalk in, walk out.\nResults in 4-8 weeks.",
        "cta": "EUR 199 per area.\nBook your consultation.",
        "headline": "Fat Freezing EUR 199",
        "visual_note": "Woman looking at thighs, relatable frustration. Warm lifestyle setting.",
        "is_refresh": True,
        "original_cpl": "$1.35",
    },
    {
        "code": "SLIM-REFRESH-04",
        "name": "Firmer Smoother Sculpted v2",
        "brand": "slimming",
        "campaign": "CBO_MuscleStim",
        "format": "Static 4:5",
        "dims": (1080, 1350),
        "hook": "Firmer.\nSmoother.\nSculpted.",
        "body": "Not bulky. Not sore.\nNot hours at the gym.\n\nOne session = thousands\nof contractions.\nNon-invasive. No downtime.",
        "cta": "EUR 199 per area.\nFree consultation.",
        "headline": "Muscle Sculpting EUR 199",
        "visual_note": "Woman's toned torso, side angle. Lifestyle editorial, not clinical. Minimal design.",
        "is_refresh": True,
        "original_cpl": "$1.64",
    },
    # === AESTHETICS NEW ===
    {
        "code": "AES-NEW-01",
        "name": "5 Years Younger 45 Minutes",
        "brand": "aesthetics",
        "campaign": "Lead - Ultimate Facelift",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "5 years younger.\n45 minutes.\nNo surgery.",
        "body": "The Ultimate Facelift\n\n38 women booked last week.\n\nNon-invasive. Visible results\nfrom session one.",
        "cta": "New price: EUR [price]\nBook your consultation.\nLimited weekly slots.",
        "headline": "Ultimate Facelift",
        "visual_note": "Dramatic jawline close-up. Golden-hour lighting. Treatment footage, before/after.",
    },
    {
        "code": "AES-NEW-02",
        "name": "What Shanel Noticed First",
        "brand": "aesthetics",
        "campaign": "Lead - Ultimate Facelift",
        "format": "Video 9:16",
        "dims": (1080, 1920),
        "hook": "The first thing\nI noticed was...",
        "body": "...my jawline.\nI could actually SEE the\ndifference after one session.\n\nReal experience. Real results.\nUltimate Facelift at\nCarisma Aesthetics.",
        "cta": "Personalised, non-invasive.\nNew price: EUR [price]\nBook a consultation",
        "headline": "See Shanel's Results",
        "visual_note": "Real client testimonial. Shanel speaking to camera. Friend-to-friend energy. Natural lighting.",
    },
    {
        "code": "AES-NEW-03",
        "name": "Jawline at 25 vs 35",
        "brand": "aesthetics",
        "campaign": "Lead - Snatch Jawline (Cost Cap 5)",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Your jawline at 25 vs 35.\nHere's how to get it back.",
        "body": "You noticed. So did you.\n\nThe Snatch Jawline treatment.\nRestores definition\nwithout surgery.",
        "cta": "34 women booked last week.\nBook your consultation.\nEUR [price].",
        "headline": "Snatch Your Jawline",
        "visual_note": "Split-screen jawline comparison. Clean graphic. Brand colors. Elegant animation.",
    },
    {
        "code": "AES-NEW-04",
        "name": "I Almost Cancelled My Appointment",
        "brand": "aesthetics",
        "campaign": "Lead - 4-in-1 Hydrafacial Glow",
        "format": "UGC Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "I almost cancelled\nmy Hydrafacial appointment.",
        "body": "Nerves? Same.\n\n4-in-1 treatment.\nWalked out glowing.\n\nNow I go every month.\nI'm obsessed.",
        "cta": "Book your first Hydrafacial.\nYou'll thank yourself.",
        "headline": "Your First Hydrafacial",
        "visual_note": "Phone-shot UGC. Client selfie-style. Natural lighting. Raw authenticity + polished overlays.",
    },
    {
        "code": "AES-NEW-05",
        "name": "3 Things I Wish I Knew About Laser",
        "brand": "aesthetics",
        "campaign": "Lead - LHR January",
        "format": "Video 9:16",
        "dims": (1080, 1920),
        "hook": "3 things I wish I knew\nbefore laser",
        "body": "1. It's faster than you think\n2. It doesn't hurt like they say\n3. The freedom is worth\n   every session",
        "cta": "Professional laser hair removal\nBook your first session",
        "headline": "Laser Hair Removal",
        "visual_note": "Real client listicle testimonial. Counting on fingers. Bright, well-lit. Friend sharing advice.",
    },
    # === AESTHETICS REFRESH ===
    {
        "code": "AES-REFRESH-01",
        "name": "SYJ Hybrid 03 Jawline Refresh",
        "brand": "aesthetics",
        "campaign": "Lead - Snatch Jawline (Cost Cap 5)",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Your jawline.\nRedefined.",
        "body": "Non-invasive. One session.\n\n34 women booked last week.\nThe Snatch Jawline treatment\nat Carisma Aesthetics.",
        "cta": "EUR [price].\nBook your consultation.",
        "headline": "Jawline Redefined",
        "visual_note": "New visual background. Lifestyle/aspirational. Woman touching jawline, golden lighting.",
        "is_refresh": True,
        "original_cpl": "EUR 1.37",
    },
    {
        "code": "AES-REFRESH-02",
        "name": "HF UGC Hybrid v2 New Client",
        "brand": "aesthetics",
        "campaign": "Lead - 4-in-1 Hydrafacial Glow",
        "format": "UGC Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "I didn't expect to look\nTHIS different\nafter one session.",
        "body": "4-in-1 Hydrafacial\n\nOver 60 women tried it\nthis month.\n\nDeep cleanse. Exfoliation.\nHydration. LED therapy.",
        "cta": "Book your Hydrafacial.\nCarisma Aesthetics.",
        "headline": "Hydrafacial Glow",
        "visual_note": "Different client from v1. Age 35-45. Home post-treatment selfie. Same overlay style.",
        "is_refresh": True,
        "original_cpl": "EUR 1.84",
    },
    {
        "code": "AES-REFRESH-03",
        "name": "FL Video 04 Newprice New Hook",
        "brand": "aesthetics",
        "campaign": "Lead - Ultimate Facelift",
        "format": "Video 9:16",
        "dims": (1080, 1920),
        "hook": "Before I show you\nthe price...\nwatch this.",
        "body": "The Ultimate Facelift\nat Carisma Aesthetics.\n\nNon-invasive. 45 minutes.\nResults from session one.\n\n38 women booked last week.",
        "cta": "New price: EUR [price]\nLimited weekly slots.\nBook your consultation.",
        "headline": "See the New Price",
        "visual_note": "Only first 3 seconds change. Options: Price tease, Mirror moment, or Reaction shot. Body = v03.",
        "is_refresh": True,
        "original_cpl": "EUR 1.27",
    },
    # === SPA NEW ===
    {
        "code": "SPA-NEW-01",
        "name": "The Sunday Reset",
        "brand": "spa",
        "campaign": "CBO_Leads - Spa Day",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "Sunday night.\nAlready dreading Monday.",
        "body": "What if you started the\nweek completely reset?\n\nBurnout Reset Package.\n90 minutes.\nWarm stones. Deep pressure.",
        "cta": "This Sunday.\nBook your reset.\nLimited Sunday slots.",
        "headline": "Book Your Sunday Reset",
        "visual_note": "Stress → pause → release → renewal arc. Warm amber/golden palette. Slow-motion spa sequences.",
    },
    {
        "code": "SPA-NEW-02",
        "name": "She Carried Everything — Mother's Day",
        "brand": "spa",
        "campaign": "CBO_Leads - Gifting",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "She carried everything\nthis year.",
        "body": "Give her the one thing\nshe never gives herself.\n\nA pause.\n\nCarisma Gift Experience.\n90-minute spa journey.",
        "cta": "Mother's Day packages\nfrom EUR 89.\nGift a pause.",
        "headline": "Gift Her a Pause",
        "visual_note": "Invisible labour montage (hands only). Then shift to being-cared-for. Emotional piano.",
    },
    {
        "code": "SPA-NEW-03",
        "name": "Your Next Date Deserves Better",
        "brand": "spa",
        "campaign": "CBO_Leads - Couples Package",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Your next date deserves\nbetter than the couch.",
        "body": "Side by side. Warm stones.\nNo phones. Just you two.\n\nCouples Spa Experience\nat Carisma.",
        "cta": "EUR 159 per couple.\nLimited evening slots.\nBook your couples experience.",
        "headline": "Couples Spa EUR 159",
        "visual_note": "Warm, romantic. Couple in robes, relaxation lounge. Intimate, not posed. Evening lighting.",
    },
    {
        "code": "SPA-NEW-04",
        "name": "The Gift That Isn't Another Candle",
        "brand": "spa",
        "campaign": "CBO_Leads - Gifting",
        "format": "Carousel 5-card",
        "dims": (1080, 1350),
        "is_carousel": True,
        "cards": [
            {"text": "Another candle?\nAnother mug?\nAnother gift she'll\nput in a drawer?", "note": "Flat-lay of generic gifts. Uninspired. Desaturated."},
            {"text": "What if you gave her\n90 minutes where\nthe world stopped?", "note": "Woman opening gift, polite smile. Warming tones."},
            {"text": "Warm hammam.\nSignature massage.\nRelaxation lounge.", "note": "Full spa warmth. Hammam steam, amber lighting. Immersive."},
            {"text": "Available as a\ngift voucher.\n\nDelivered to your inbox.\nSame day.", "note": "Gift voucher in elegant envelope on spa surface."},
            {"text": "Give the gift of stillness.\n\nFrom EUR 50.\n\nTap to book.\nCarisma Spa, St Julian's.", "note": "Clean branded card. Logo. Warm gradient."},
        ],
        "headline": "The Gift She Wants",
        "visual_note": "Story arc: bad gifts (1-2) to spa solution (3-4) to CTA (5). Warm golds, cream.",
    },
    {
        "code": "SPA-NEW-05",
        "name": "Isn't Aging Supposed to Be Graceful",
        "brand": "spa",
        "campaign": "CBO_Leads - Spa Day",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "They said aging was\nsupposed to be graceful.",
        "body": "They didn't mention\nthe stiff neck.\nThe tension headaches.\nOr waking up exhausted.\n\nThis is what graceful\nactually feels like.",
        "cta": "Book your renewal.\nYou've earned it.",
        "headline": "Book Your Renewal",
        "visual_note": "Meditative, slow pace. Tension release close-ups. Silence hook then soft piano. Warm stones.",
    },
    # === SPA REFRESH ===
    {
        "code": "SPA-REFRESH-01",
        "name": "Birthday Spring Edition",
        "brand": "spa",
        "campaign": "CBO_Leads - Gifting",
        "format": "Hybrid + Video intro",
        "dims": (1080, 1350),
        "hook": "Birthday?",
        "body": "Hers, yours, or someone\nwho just needs it right now?\n\nA Carisma Gift Experience.\n90-minute spa journey.",
        "cta": "Spring birthdays deserve\nsomething unforgettable.\nFrom EUR 50. Book now.",
        "headline": "Birthday Gift Sorted",
        "visual_note": "Spring visual: soft greens, blush pinks, golden yellows. 3-sec video intro before static card.",
        "is_refresh": True,
        "original_cpl": "EUR 1.37",
    },
    {
        "code": "SPA-REFRESH-02",
        "name": "Go-Mode v2 March Stress",
        "brand": "spa",
        "campaign": "CBO_Leads - Spa Day",
        "format": "Reels 9:16",
        "dims": (1080, 1920),
        "hook": "March already.\nAnd I haven't\nstopped once.",
        "body": "School runs. Work deadlines.\nEveryone needs something.\n\nBurnout Reset Package.\n90 minutes.\nWarm stones. Deep pressure.",
        "cta": "Book your reset this week.\nYou've earned it.",
        "headline": "Book Your Reset",
        "visual_note": "Different woman, March context. Desk/paperwork/school calendar stress. Same spa footage style.",
        "is_refresh": True,
        "original_cpl": "EUR 1.54",
    },
    {
        "code": "SPA-REFRESH-03",
        "name": "Date Night Evening Out",
        "brand": "spa",
        "campaign": "CBO_Leads - Couples Package",
        "format": "Hybrid 4:5",
        "dims": (1080, 1350),
        "hook": "Date night.\nUpgraded.",
        "body": "5 couples loved this\nlast week. Here's why.\n\nSide by side. Warm hammam.\nNo phones.",
        "cta": "EUR 159 per couple.\nBook your evening.\nLimited slots.",
        "headline": "Date Night Upgrade",
        "visual_note": "Evening/night setting. Spa exterior at dusk or candlelit lounge. Romantic, intimate.",
        "is_refresh": True,
        "original_cpl": "EUR 1.58",
    },
]


def generate_single_ad_html(ad, brand_config):
    """Generate HTML for a single non-carousel ad."""
    b = brand_config
    w, h = ad["dims"]
    is_reel = h == 1920
    is_refresh = ad.get("is_refresh", False)

    refresh_badge = ""
    if is_refresh:
        orig = ad.get("original_cpl", "")
        refresh_badge = f"""
        <div style="position:absolute;top:20px;right:20px;background:rgba(255,180,60,0.95);color:#3A2820;
            padding:6px 14px;border-radius:16px;font-size:13px;font-weight:700;letter-spacing:0.5px">
            REFRESH &middot; Original CPL: {orig}
        </div>"""

    format_label = ad["format"]
    if is_reel:
        section_style = "flex-direction:column;justify-content:space-between;height:100%"
        hook_size = "32px"
        body_size = "22px"
        cta_size = "24px"
    else:
        section_style = "flex-direction:column;justify-content:space-between;height:100%"
        hook_size = "38px"
        body_size = "22px"
        cta_size = "26px"

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{w}px; height:{h}px; overflow:hidden; }}
.ad {{
    width:{w}px; height:{h}px; position:relative;
    background: linear-gradient(160deg, {b['bg_start']} 0%, {b['bg_end']} 60%, {b['bg_start']} 100%);
    font-family:'Inter',sans-serif; color:#F5F0E8;
    display:flex; {section_style};
    padding:{'60px 48px' if not is_reel else '50px 44px'};
}}
.grain {{
    position:absolute;inset:0;opacity:0.03;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:128px;
}}
.top-bar {{
    display:flex; align-items:center; justify-content:space-between; margin-bottom:{'28px' if not is_reel else '20px'};
    position:relative; z-index:2;
}}
.code-badge {{
    background:{b['badge_bg']}; color:{b['badge_text']};
    padding:6px 16px; border-radius:20px;
    font-size:13px; font-weight:700; letter-spacing:1px;
}}
.format-badge {{
    background:rgba(245,240,232,0.12); color:rgba(245,240,232,0.7);
    padding:5px 14px; border-radius:16px;
    font-size:12px; font-weight:500; letter-spacing:0.5px;
}}
.hook {{
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:{hook_size}; font-weight:700; line-height:1.2;
    color:#F5F0E8; position:relative; z-index:2;
    margin-bottom:{'32px' if not is_reel else '24px'};
    white-space:pre-line;
}}
.hook::after {{
    content:''; display:block; width:60px; height:3px;
    background:{b['primary']}; margin-top:20px; border-radius:2px;
}}
.body-text {{
    font-size:{body_size}; line-height:1.6; color:rgba(245,240,232,0.8);
    position:relative; z-index:2; white-space:pre-line;
    flex:1; display:flex; align-items:center;
}}
.body-text .inner {{
    background:rgba(245,240,232,0.04);
    border-left:3px solid {b['primary']};
    padding:20px 24px; border-radius:0 8px 8px 0;
    width:100%;
}}
.cta-section {{
    position:relative; z-index:2;
    background:rgba(245,240,232,0.06); border-radius:12px;
    padding:24px 28px; border:1px solid rgba(245,240,232,0.08);
}}
.cta-text {{
    font-size:{cta_size}; font-weight:600; color:{b['primary']};
    white-space:pre-line; line-height:1.4;
    font-family:'Cormorant Garamond',Georgia,serif;
}}
.bottom-bar {{
    display:flex; align-items:center; justify-content:space-between;
    margin-top:16px; padding-top:16px;
    border-top:1px solid rgba(245,240,232,0.08);
}}
.brand-name {{
    font-size:13px; font-weight:500; color:rgba(245,240,232,0.5);
    letter-spacing:2px; text-transform:uppercase;
}}
.headline-badge {{
    font-size:14px; font-weight:600; color:{b['primary']};
    background:rgba(245,240,232,0.06); padding:4px 12px;
    border-radius:8px;
}}
.visual-note {{
    position:absolute; bottom:20px; left:48px; right:48px;
    font-size:11px; color:rgba(245,240,232,0.3);
    line-height:1.4; z-index:2;
    border-top:1px solid rgba(245,240,232,0.06);
    padding-top:12px;
}}
.glow {{
    position:absolute; width:300px; height:300px; border-radius:50%;
    background:{b['primary']}; opacity:0.06; filter:blur(80px);
}}
.glow-1 {{ top:-50px; right:-50px; }}
.glow-2 {{ bottom:200px; left:-80px; }}
</style></head>
<body>
<div class="ad">
    <div class="grain"></div>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    {refresh_badge}

    <div>
        <div class="top-bar">
            <span class="code-badge">{ad['code']}</span>
            <span class="format-badge">{format_label} &middot; {w}x{h}</span>
        </div>
        <div class="hook">{ad['hook']}</div>
    </div>

    <div class="body-text">
        <div class="inner">{ad['body']}</div>
    </div>

    <div>
        <div class="cta-section">
            <div class="cta-text">{ad['cta']}</div>
        </div>
        <div class="bottom-bar">
            <span class="brand-name">{b['name']}</span>
            <span class="headline-badge">{ad['headline']}</span>
        </div>
    </div>
</div>
</body></html>"""
    return html


def generate_carousel_card_html(ad, card_idx, card_data, brand_config):
    """Generate HTML for a single carousel card."""
    b = brand_config
    w, h = ad["dims"]
    total = len(ad["cards"])
    is_first = card_idx == 0
    is_last = card_idx == total - 1

    # Visual progression: dark to warm
    progress = card_idx / max(total - 1, 1)
    if progress < 0.4:
        bg = f"linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)"
        text_color = "#F5F0E8"
        accent = b["primary"]
    elif progress < 0.7:
        bg = f"linear-gradient(160deg, {b['bg_start']} 0%, {b['bg_end']} 100%)"
        text_color = "#F5F0E8"
        accent = b["primary"]
    else:
        bg = f"linear-gradient(160deg, {b['bg_end']} 0%, {b['primary']}33 100%)"
        text_color = "#F5F0E8"
        accent = b["primary"]

    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ width:{w}px; height:{h}px; overflow:hidden; }}
.card {{
    width:{w}px; height:{h}px; position:relative;
    background:{bg};
    font-family:'Inter',sans-serif; color:{text_color};
    display:flex; flex-direction:column; justify-content:center; align-items:center;
    padding:60px 56px; text-align:center;
}}
.card-number {{
    position:absolute; top:28px; left:36px;
    font-size:14px; font-weight:600; color:rgba(245,240,232,0.4);
    letter-spacing:1px;
}}
.code-badge {{
    position:absolute; top:24px; right:28px;
    background:{b['badge_bg']}; color:{b['badge_text']};
    padding:5px 14px; border-radius:16px;
    font-size:12px; font-weight:700; letter-spacing:0.5px;
}}
.dots {{
    position:absolute; bottom:32px; left:50%; transform:translateX(-50%);
    display:flex; gap:8px;
}}
.dot {{
    width:8px; height:8px; border-radius:50%;
    background:rgba(245,240,232,0.2);
}}
.dot.active {{ background:{accent}; }}
.text {{
    font-family:'Cormorant Garamond',Georgia,serif;
    font-size:{'42px' if is_first else '34px' if is_last else '30px'};
    font-weight:{'700' if is_first or is_last else '500'};
    line-height:1.3; white-space:pre-line;
    max-width:85%;
}}
.visual-note {{
    position:absolute; bottom:56px; left:56px; right:56px;
    font-size:11px; color:rgba(245,240,232,0.25);
    text-align:center; line-height:1.4;
}}
.swipe-hint {{
    position:absolute; right:24px; top:50%; transform:translateY(-50%);
    font-size:24px; color:rgba(245,240,232,0.15);
}}
</style></head>
<body>
<div class="card">
    <span class="card-number">CARD {card_idx + 1} OF {total}</span>
    <span class="code-badge">{ad['code']}</span>

    <div class="text">{card_data['text']}</div>

    <div class="visual-note">{card_data['note']}</div>

    <div class="dots">
        {''.join(f'<div class="dot {"active" if i == card_idx else ""}"></div>' for i in range(total))}
    </div>

    {'<div class="swipe-hint">›</div>' if not is_last else ''}
</div>
</body></html>"""
    return html


async def generate_all_mockups():
    """Generate all mockup PNGs using Playwright."""
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": 1080, "height": 1920},
            device_scale_factor=2,  # 2x for retina quality
        )

        generated = []
        for ad in ADS:
            brand_key = ad["brand"]
            brand_config = BRANDS[brand_key]
            brand_dir = OUTPUT_DIR / brand_key

            if ad.get("is_carousel"):
                # Generate each carousel card
                for idx, card in enumerate(ad["cards"]):
                    html = generate_carousel_card_html(ad, idx, card, brand_config)
                    filename = f"{ad['code']}_card{idx + 1}.png"
                    filepath = brand_dir / filename

                    page = await context.new_page()
                    await page.set_viewport_size({"width": ad["dims"][0], "height": ad["dims"][1]})
                    await page.set_content(html, wait_until="networkidle")
                    await page.screenshot(path=str(filepath), full_page=False)
                    await page.close()

                    generated.append(str(filepath))
                    print(f"  ✓ {filename}")
            else:
                html = generate_single_ad_html(ad, brand_config)
                filename = f"{ad['code']}.png"
                filepath = brand_dir / filename

                page = await context.new_page()
                w, h = ad["dims"]
                await page.set_viewport_size({"width": w, "height": h})
                await page.set_content(html, wait_until="networkidle")
                await page.screenshot(path=str(filepath), full_page=False)
                await page.close()

                generated.append(str(filepath))
                print(f"  ✓ {filename}")

        await browser.close()
        return generated


def main():
    print(f"Generating {len(ADS)} ad mockups ({sum(len(a.get('cards', [None])) for a in ADS)} total images)...")
    print(f"Output: {OUTPUT_DIR}/\n")

    results = asyncio.run(generate_all_mockups())

    print(f"\nDone! Generated {len(results)} PNGs:")
    for brand_key in BRANDS:
        brand_dir = OUTPUT_DIR / brand_key
        pngs = list(brand_dir.glob("*.png"))
        print(f"  {BRANDS[brand_key]['name']}: {len(pngs)} files in {brand_dir}")


if __name__ == "__main__":
    main()
