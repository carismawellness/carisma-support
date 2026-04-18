# Customer Lifecycle & Retention Management

## Objective
Track every contact's lifecycle stage, rebooking window, and treatment history across all 3 Zoho CRM instances (Spa, Aesthetics, Slimming). Auto-promote stages, detect lapsed clients, and enable retention campaigns.

## Fields Created on Contacts Module (all 3 CRMs)

| Field | API Name | Type | Purpose |
|-------|----------|------|---------|
| Lifecycle Stage | `Lifecycle_Stage` | Picklist | Current stage in customer journey |
| Last Treatment Date | `Last_Treatment_Date` | Date | Most recent closed won deal date |
| Treatment Count | `Treatment_Count` | Integer | Total number of closed won deals |
| Rebooking Window Expires | `Rebooking_Window_Expires` | Date | Deadline for rebooking before "Lapsed" |

## Lifecycle Stages

| Stage | Trigger | Auto-promoted? |
|-------|---------|----------------|
| Prospect | 0 closed won deals | Yes |
| First-Time Client | 1 closed won deal | Yes |
| Repeat Client | 2-4 closed won deals | Yes |
| Loyal Client | 5+ closed won deals | Yes |
| VIP | Top 10% by LTV or 12+ months continuous | Manual only (never auto-demoted) |
| Lapsed | Rebooking window expired with no new deal | Yes |
| Win-Back | Was Lapsed, now has a new closed won deal | Yes |

## Rebooking Windows (Brand-Specific)

| Brand | Window | "Closed Won" Stages |
|-------|--------|---------------------|
| Spa | 90 days | `Closed Won` |
| Aesthetics | 120 days | `Booking closed won`, `Members Closed Won`, `Consultation - won` |
| Slimming | 60 days | `Booking closed won`, `Members Closed Won`, `Consultation - won` |

## Tool

**Script:** `Tools/lifecycle_manager.py`

### Usage
```bash
python3 Tools/lifecycle_manager.py --brand spa              # Process one brand
python3 Tools/lifecycle_manager.py --brand all              # Process all brands
python3 Tools/lifecycle_manager.py --brand spa --dry-run    # Preview without changes
python3 Tools/lifecycle_manager.py --brand all --no-klaviyo # Skip Klaviyo events
```

### What It Does
1. Queries all Closed Won deals with a linked Contact
2. Groups deals by Contact, counts treatments, finds most recent date
3. Calculates rebooking window expiry (last treatment + brand window)
4. Determines correct lifecycle stage based on count + window status
5. Updates Contact record with all 4 fields
6. Pushes Klaviyo events for email automation (see Klaviyo Integration below)

### Scheduling
Runs daily at 4:00 AM UTC (6:00 AM Malta) via macOS launchd.
- **Plist:** `~/Library/LaunchAgents/com.carisma.lifecycle-manager.plist`
- **Command:** `python3 Tools/lifecycle_manager.py --brand all`
- **Logs:** `.tmp/lifecycle/lifecycle-stdout.log` and `.tmp/lifecycle/lifecycle-stderr.log`

## Rebooking Rate Calculation

**Formula:** `(Contacts who rebooked within window) / (Total contacts whose window expired in period) * 100`

**How to calculate from CRM data:**
- Count contacts where `Lifecycle_Stage` transitioned from anything to `First-Time Client`, `Repeat Client`, or `Loyal Client` within the measurement period
- Count contacts where `Rebooking_Window_Expires` fell within the measurement period
- Divide and multiply by 100

**Targets:**
| Brand | Industry Benchmark | Target |
|-------|-------------------|--------|
| Spa | 30-40% | 45%+ |
| Aesthetics | 50-60% | 65%+ |
| Slimming | 40-50% renewal | 55%+ |

## Klaviyo Integration (Email Automation)

The lifecycle manager pushes two types of events to Klaviyo, which trigger email flows:

### Event 1: "Lifecycle Stage Changed"

Fires whenever a contact's lifecycle stage transitions. Properties:
- `brand` — spa, aesthetics, or slimming
- `old_stage` — previous lifecycle stage
- `new_stage` — new lifecycle stage
- `treatment_count` — total closed won deals
- `last_treatment_date` — most recent treatment date

**Klaviyo flows to create (trigger on this metric):**

| Flow | Trigger Condition | Purpose |
|------|-------------------|---------|
| Lapsed Win-Back | `new_stage = "Lapsed"` | Re-engage clients whose rebooking window expired |
| Loyalty Recognition | `new_stage = "Loyal Client"` | Celebrate 5th treatment, offer VIP perks |
| Win-Back Confirmation | `new_stage = "Win-Back"` | Welcome back a previously lapsed client |

### Event 2: "Rebooking Window Warning"

Fires when a contact is within 7 days of their rebooking window expiring (pre-lapse). Properties:
- `brand` — spa, aesthetics, or slimming
- `days_remaining` — days until rebooking window expires (1-7)
- `treatment_count` — total closed won deals
- `last_treatment_date` — most recent treatment date
- `rebooking_expires` — exact expiry date

**Klaviyo flow to create (trigger on this metric):**

| Flow | Trigger Condition | Purpose |
|------|-------------------|---------|
| Pre-Lapse Reminder | Any event | Gentle nudge to rebook before they become Lapsed |

### Klaviyo Flow Setup (Step-by-Step)

**Metrics already registered in Klaviyo (API integration):**
- `Lifecycle Stage Changed` (ID: `Xk6K9b`)
- `Rebooking Window Warning` (ID: `UUDP25`)

#### Flow 1: Lapsed Win-Back
1. Klaviyo > Flows > Create Flow > "Create from Scratch"
2. Trigger: Metric → "Lifecycle Stage Changed"
3. Trigger filter: `new_stage equals Lapsed`
4. Add conditional split on `brand` property to send brand-specific emails
5. Email 1 (immediate): "We miss you" — gentle, no hard sell
6. Wait 3 days
7. Email 2: Value reminder — what they're missing + easy rebooking link
8. Wait 5 days
9. Email 3: Special offer — incentive to return (brand-specific)
10. Enable Smart Sending (16h window)
11. Set to **DRAFT** for review

#### Flow 2: Pre-Lapse Reminder
1. Trigger: Metric → "Rebooking Window Warning"
2. No additional trigger filter (fires for all brands)
3. Add conditional split on `brand` property
4. Single email: "Your next visit is due" — warm reminder, not pushy
5. Enable Smart Sending (16h window) — critical since this fires daily for 7 days
6. Set to **DRAFT** for review

#### Flow 3: Loyalty Recognition
1. Trigger: Metric → "Lifecycle Stage Changed"
2. Trigger filter: `new_stage equals Loyal Client`
3. Add conditional split on `brand` property
4. Single email: "Thank you" — celebrate milestone, preview VIP perks
5. Set to **DRAFT** for review

#### Flow 4 (Optional): Win-Back Confirmation
1. Trigger: Metric → "Lifecycle Stage Changed"
2. Trigger filter: `new_stage equals Win-Back`
3. Single email: "Welcome back" — acknowledge return, re-establish relationship
4. Set to **DRAFT** for review

### Email Voice by Brand

| Brand | Persona | Sign-off | Tone |
|-------|---------|----------|------|
| Spa | Sarah Caballeri | "Peacefully, Sarah" | Peaceful, soothing, elegant, inviting |
| Aesthetics | Sarah | "Beautifully yours, Sarah" | Warm, reassuring, confident, empowering |
| Slimming | Katya | "With you every step, Katya" | Compassionate, shame-free, evidence-led |

### Deduplication

- Stage-change events use email + metric name as unique key — same transition won't fire twice
- Pre-lapse warnings fire daily during the 7-day window; use Klaviyo's "smart sending" (16h window) to prevent over-messaging

## Other Integration Points

- **CEO Cockpit:** Display rebooking rate trend by brand
- **Zoho Analytics:** Build lifecycle funnel and cohort analysis dashboards
- **Meta Ads:** Create lookalike audiences from "Loyal Client" and "VIP" contacts

## Edge Cases
- VIP stage is never auto-demoted (manually assigned by management)
- Win-Back is detected when a previously Lapsed contact gets a new Closed Won deal
- Contacts with no deals remain as Prospect
- Multiple deals closing on the same day count as separate treatments
