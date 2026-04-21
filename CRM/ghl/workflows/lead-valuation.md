# Lead Valuation Rules — All Brands
> Assigns a monetary opportunity value to every inbound Meta Ads lead card in GHL
> based on which offer form the lead came from.
>
> This powers the revenue forecast visible directly on every CRM opportunity card.

---

## How It Works

```
Lead submits Meta Ads form
        ↓
GHL Workflow "Ad Optin SMS Sequence" fires
  → Creates opportunity in pipeline (❄️ COLD Leads)
  → Webhook action calls POST /webhook/lead-optin
        ↓
Webhook reads utm_content + form_name
  → Matches against brand's offer→value map
  → Patches monetaryValue on the opportunity
        ↓
CRM card now shows: €199 / €239 / €99 (etc.)
```

The opportunity value shown on each CRM card represents the **expected first-transaction
revenue** for that offer — not the anchored list price, not lifetime value.
Free-consultation offers are valued at the expected first paid package.

---

## Value Tables

### Carisma Spa & Wellness

| UTM Content Slug | Offer | CRM Card Value |
|-----------------|-------|---------------|
| `couples` | Couples Retreat | **€139** |
| `mothers_day` / `mother` | Mother's Day Package | **€115** |
| `signature` | Signature Spa Day | **€99** |
| `glow_reset` / `facial_glow` / `facial` | Facial Glow Reset | **€99** |
| `hammam` | Hammam / Body Treatment | **€99** |
| `massage` | Massage Session | **€80** |
| `contrast` | Contrast Therapy | **€65** |
| *(anything else)* | Default / Unknown | **€99** |

### Carisma Aesthetics

| UTM Content Slug | Offer | CRM Card Value |
|-----------------|-------|---------------|
| `botox` | Botox + Medical Facial (was €489) | **€239** |
| `filler` | Dermal Fillers | **€239** |
| `fat_dissolv` | Fat Dissolving | **€239** |
| `thread` | Thread Lift (was €600) | **€199** |
| `skin_booster` / `prp` | Skin Booster / PRP | **€199** |
| `laser` | Laser Hair Removal | **€199** |
| `microneedling` | Microneedling | **€150** |
| `chemical_peel` / `peel` | Chemical Peel | **€150** |
| `consultation` | Free Consultation | **€150** |
| `hydrafacial` / `hydra` | HydraFacial (was €180) | **€99** |
| *(anything else)* | Default / Unknown | **€150** |

### Carisma Slimming

| UTM Content Slug | Offer | CRM Card Value |
|-----------------|-------|---------------|
| `coolsculpt` | CoolSculpting Starter Pack (was €625) | **€199** |
| `emsculpt` | EMSculpt NEO 3-in-1 Protocol (was €625) | **€199** |
| `skin_tight` / `velashape` | Skin Tightening VelaShape (was €625) | **€199** |
| `medical_weight` | Medical Weight Loss Consultation | **€199** |
| `weight_loss` | General Weight Loss Consultation | **€199** |
| *(anything else)* | Default / Unknown | **€199** |

---

## Meta Ads UTM Setup (Required)

For automatic valuation to work, every Meta Ads lead gen campaign **must** pass
the offer slug in `utm_content`. Set this in Meta Ads Manager → Campaign → URL Parameters.

**Example UTM string for a CoolSculpting ad:**
```
utm_source=facebook&utm_medium=paid_social&utm_campaign=CarismaSlimming_CoolSculpting_Feb2026&utm_content=coolsculpt
```

**Example for Aesthetics Botox:**
```
utm_source=facebook&utm_medium=paid_social&utm_campaign=CarismaAesthetics_Botox_Feb2026&utm_content=botox
```

The slug does **not** need to be an exact match — any substring match works.
`utm_content=botox_archetype2_malta` still resolves to €239.

---

## GHL Workflow Configuration

Add this step to the **"Ad Optin SMS Sequence"** workflow in each brand sub-account,
immediately **after** the "Create Opportunity" step:

**Action type:** Webhook  
**Method:** POST  
**URL:** `https://<your-domain>/webhook/lead-optin`  
**Body (JSON):**

```json
{
  "contactId":     "{{contact.id}}",
  "opportunityId": "{{opportunity.id}}",
  "utmContent":    "{{contact.utm_content}}",
  "utmCampaign":   "{{contact.utm_campaign}}",
  "formName":      "{{contact.source}}"
}
```

> The `brand` field is inferred from the `GHL_BRAND` environment variable on the
> server — set it to `"spa"`, `"aesthetics"`, or `"slimming"` per instance.
> Or include `"brand": "slimming"` explicitly in the webhook body to override.

---

## Environment Variables

Add to `.env` before deploying:

```bash
# Existing
GHL_API_KEY=pit_xxxx
GHL_LOCATION_ID=xxxx

# New — set per brand instance
GHL_BRAND=aesthetics   # or "spa" or "slimming"
```

---

## Fallback Behaviour

| Scenario | What Happens |
|----------|-------------|
| `opportunityId` present in payload | Directly patches that opportunity |
| No `opportunityId` | Looks up most recent open opportunity for the contact |
| No open opportunity found | Returns `status: no_opportunity` — log entry created, no crash |
| Unknown brand | Returns €0 — safe default |
| Unknown UTM / form | Uses brand default value (€99 / €150 / €199) |

---

## Testing

```bash
# Test Aesthetics botox lead (opportunity already created by workflow)
curl -X POST http://localhost:8000/webhook/lead-optin \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "TEST_CONTACT_ID",
    "opportunityId": "TEST_OPP_ID",
    "utmContent": "botox",
    "brand": "aesthetics"
  }'
# Expected: {"status": "ok", "monetary_value": 239}

# Test Slimming CoolSculpting (no opp ID — handler finds it)
curl -X POST http://localhost:8000/webhook/lead-optin \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "TEST_CONTACT_ID",
    "utmContent": "coolsculpt_starter_pack",
    "brand": "slimming"
  }'
# Expected: {"status": "ok", "monetary_value": 199}
```

---

## Adding New Offers

When a new Meta Ads offer launches:
1. Decide on the UTM content slug (e.g. `body_wrap`)
2. Add it to the relevant dict in `CRM/ghl/config.py`:
   ```python
   SPA_LEAD_VALUES: Final[dict[str, int]] = {
       ...
       "body_wrap": 120,   # New: Body Wrap Package
   }
   ```
3. Add the slug to the new campaign's UTM parameters in Meta Ads
4. No GHL workflow changes needed

---

*Last updated: 2026-04-21 | Covers: Carisma Spa · Aesthetics · Slimming*
