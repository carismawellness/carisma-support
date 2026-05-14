"""Workflow 08 Steps 5-6: Create campaigns + ad sets in Meta (PAUSED)."""
import json, sys, time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests not installed. Run: pip install requests")
    sys.exit(1)

sys.stdout.reconfigure(encoding="utf-8")

BASE   = Path(__file__).resolve().parent.parent
DATE   = "20260420"
PUB    = BASE / ".tmp" / "publishing"
PUB.mkdir(parents=True, exist_ok=True)

# Load token from .env
token = None
env_path = BASE / ".env"
for line in env_path.read_text(encoding="utf-8").splitlines():
    if line.startswith("META_ACCESS_TOKEN="):
        token = line.split("=", 1)[1].strip()
        break

if not token:
    print("ERROR: META_ACCESS_TOKEN not found in .env")
    sys.exit(1)

API = "https://graph.facebook.com/v21.0"
HEADERS = {"Authorization": f"Bearer {token}"}

def api_post(url, data):
    resp = requests.post(url, data=data, headers=HEADERS, timeout=30)
    return resp.status_code, resp.json()

def api_get(url, params=None):
    resp = requests.get(url, params=params or {}, headers=HEADERS, timeout=30)
    return resp.status_code, resp.json()


# ── Check token permissions ───────────────────────────────────────────────────

print("Checking token permissions...")
status, result = api_get(f"{API}/me", {"fields": "id,name"})
if status != 200:
    print(f"Token check failed ({status}): {result.get('error', {}).get('message','unknown')}")
    sys.exit(1)

print(f"  Token valid — user: {result.get('name','?')} ({result.get('id','?')})")


# ── Brand configs ─────────────────────────────────────────────────────────────

structures = {}
for brand_id in ["carisma_spa", "carisma_aesthetics"]:
    p = PUB / f"campaign_structure_{brand_id}_{DATE}.json"
    structures[brand_id] = json.loads(p.read_text(encoding="utf-8"))

results = {}   # brand_id → {campaign_id, adsets: [{id, name}]}

for brand_id, struct in structures.items():
    brand_name = struct["brand_name"]
    ad_account = struct["ad_account_id"]
    page_id    = struct["page_id"]
    pixel_id   = struct["pixel_id"]
    campaign   = struct["campaign"]
    print(f"\n── {brand_name} ({ad_account}) ──")

    # ── Create campaign ──────────────────────────────────────────────────────
    print(f"  Creating campaign: {campaign['name']} ...")
    camp_data = {
        "name":                  campaign["name"],
        "objective":             campaign["objective"],
        "status":                "PAUSED",
        "special_ad_categories": "[]",
    }
    status, resp = api_post(f"{API}/{ad_account}/campaigns", camp_data)

    if status == 200 and "id" in resp:
        camp_id = resp["id"]
        print(f"  ✓ Campaign created: {camp_id}")
    else:
        err = resp.get("error", {})
        print(f"  ✗ Campaign failed ({status}): {err.get('message','unknown')}")
        print(f"    Code: {err.get('code')} | Type: {err.get('type')}")
        results[brand_id] = {"error": err.get("message","unknown"), "campaign_id": None}
        continue

    adset_results = []

    # ── Create ad sets ───────────────────────────────────────────────────────
    for adset in struct["ad_sets"]:
        adset_name = adset["name"]
        targeting  = adset["targeting"]
        promoted   = adset["promoted_object"]

        print(f"  Creating ad set: {adset_name} ...")
        time.sleep(1)  # rate limit buffer

        adset_data = {
            "campaign_id":       camp_id,
            "name":              adset_name,
            "status":            "PAUSED",
            "optimization_goal": "LEAD_GENERATION",
            "billing_event":     "IMPRESSIONS",
            "destination_type":  "WEBSITE",
            "targeting":         json.dumps({
                "age_min":              targeting["age_min"],
                "age_max":              targeting["age_max"],
                "genders":              targeting["genders"],
                "geo_locations":        targeting["geo_locations"],
                "publisher_platforms":  targeting["publisher_platforms"],
                "facebook_positions":   targeting["facebook_positions"],
                "instagram_positions":  targeting["instagram_positions"],
                # interests without IDs are omitted here — requires targeting search first
            }),
            "promoted_object": json.dumps({
                "page_id":           page_id,
                "pixel_id":          pixel_id,
                "custom_event_type": "LEAD",
            }),
        }
        s2, r2 = api_post(f"{API}/{ad_account}/adsets", adset_data)

        if s2 == 200 and "id" in r2:
            adset_id = r2["id"]
            print(f"  ✓ Ad set created: {adset_id} ({adset_name})")
            adset_results.append({"adset_id": adset_id, "adset_name": adset_name, "status": "created"})
        else:
            err2 = r2.get("error", {})
            print(f"  ✗ Ad set failed ({s2}): {err2.get('message','unknown')}")
            adset_results.append({"adset_id": None, "adset_name": adset_name,
                                   "status": "failed", "error": err2.get("message","unknown")})
        time.sleep(1)

    results[brand_id] = {
        "campaign_name": campaign["name"],
        "campaign_id":   camp_id,
        "ad_account":    ad_account,
        "adsets":        adset_results,
    }

# ── Save results ──────────────────────────────────────────────────────────────

out = {
    "generated_date": "2026-04-20",
    "brands":         results,
}
out_path = PUB / f"meta_campaign_ids_{DATE}.json"
out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\nResults saved → {out_path.name}")

# ── Summary ───────────────────────────────────────────────────────────────────

print("\n── SUMMARY ──")
for brand_id, r in results.items():
    if "error" in r and not r.get("campaign_id"):
        print(f"  {brand_id}: FAILED — {r['error']}")
    else:
        adsets_ok    = sum(1 for a in r.get("adsets",[]) if a["status"]=="created")
        adsets_total = len(r.get("adsets",[]))
        print(f"  {brand_id}: Campaign {r['campaign_id']} | Ad sets {adsets_ok}/{adsets_total}")
