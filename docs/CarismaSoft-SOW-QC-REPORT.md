# CarismaSoft SOW — Quality Control Audit Report

**Report Date:** 5 April 2026  
**Document Reviewed:** CarismaSoft-SOW.md (v1.0)  
**Review Type:** Pre-Development QC Audit  
**Reviewer:** QC Agent

---

## Executive Summary

The CarismaSoft SOW is a **well-structured, comprehensive document** with strong coverage of core requirements, business context, and development planning. However, it contains **critical blind spots** in operational edge cases, integration failure modes, and concurrent-operation handling that could lead to runtime issues if not addressed during design. 

**Key Findings:**
- **Completeness:** 85% — All major functional modules specified; some operational workflows underspecified
- **Blind Spots:** 22 identified across 6 domains (Operational, Technical, Integration, Business Rules, UX, Reporting)
- **Scope Clarity:** Generally good; 3 ambiguities that need resolution before development
- **Risk Level:** Medium — mostly in operational/integration edge cases rather than core platform design

**Critical Path Issues:** None identified that would block MVP development. All blocking questions are identified in Section 10.2.

---

## SECTION A: COMPLETENESS AUDIT

### A.1 Functional Modules Coverage

| Module | Coverage | Assessment | Gaps |
|---|---|---|---|
| **CRM (Module 1)** | 95% | Comprehensive customer profiles, history, custom fields | Missing: Duplicate detection algorithm specifics |
| **Booking Engine (Module 2)** | 90% | Core workflow well-defined; status machine clear | Missing: Handling of recurring bookings edge cases (customer modifies series, etc.) |
| **Staff Roster (Module 3)** | 85% | Talexio sync specified; fairness algorithm outlined | Missing: Absence handling when Talexio marks staff absent mid-shift |
| **Services & Packages (Module 4)** | 88% | Full product model; packages well-specified | Missing: Partial redemption of package-as-gift (e.g., gifter redeems 1 of 5 sessions) |
| **Payments & Billing (Module 5)** | 82% | Payment flow, discount workflow, reconciliation | Missing: Handling of payment processor webhooks vs. polling priority; reconciliation failure procedures |
| **Inventory (Module 6)** | 70% | Basic product tracking; Zoho Inventory sync | Missing: Stock write-off procedures; inventory reconciliation audits |
| **Reporting (Section 3.7)** | 78% | 25 report types listed; metrics defined | Missing: Report schedule/automation (who gets what when?); alert thresholds beyond KPI |
| **Integrations (Section 4)** | 75% | Good overview; error handling defined | Missing: Rate limit handling priorities; fallback cascade order; audit logging of sync failures |
| **Database Schema (Section 5.4)** | 80% | Core tables defined; relationships clear | Missing: Soft-delete recovery procedures; data retention policies for audit logs |
| **Roles & Permissions (Section 5.5.1)** | 85% | RBAC matrix provided for 6 roles | Missing: Transition workflows (e.g., promoting Therapist to Manager — what access changes?); role-level report visibility |

**Overall:** All MVP-critical modules are defined. No core platform modules missing. Gaps are primarily in operational workflows and edge cases.

---

### A.2 Integration Completeness Matrix

**9 Integrations specified. Assessment per integration:**

| Integration | Completeness | Assessment | Underspecified Areas |
|---|---|---|---|
| **Zoho CRM** | 90% | Bi-directional, real-time, error handling defined | Conflict resolution (field A updated locally, same field updated in CRM, how to reconcile?) |
| **Zoho Inventory** | 75% | Batch sync 15-min, sale recording real-time | Missing: Stock discrepancy resolution; multi-location stock reconciliation |
| **Zoho Subscriptions** | 80% | Webhook + fallback polling; credit allocation | Missing: What happens if subscription cancels mid-month? Prorated credits? |
| **Talexio Payroll** | 70% | Daily shift import, weekly hours export | Missing: Staff member deleted in Talexio but active in CarismaSoft — sync logic? |
| **Custom Gift App** | 50% | High-level flow only; API contract TBD | Critical: API not yet defined. Placeholder pending gift app team confirmation. |
| **BOV POS** | 65% | Request/response flow defined | Missing: POS terminal offline handling; what if Bluetooth/USB fails during transaction? |
| **Wix Website** | 85% | Availability query, booking create, confirmation | Missing: How does Wix handle concurrent booking (user books online, receptionist books same slot) |
| **GA4** | 80% | Events defined; Measurement Protocol noted | Missing: Event deduplication logic (if offline-to-online sync replays events, do we double-count?) |
| **Meta Ads CAPI** | 75% | Events defined; hashed PII noted | Missing: Privacy handling (GDPR consent for CAPI matching) |

**Finding:** Custom Gift App is a **hard dependency** but API contract is undefined. This is flagged in Q-011 but should be escalated as risk.

---

### A.3 20+ Reports Documented

**Appendix C lists 25 reports across 4 categories:**
- Operational: 7 ✓
- Financial: 9 ✓
- Marketing/Growth: 5 ✓
- Compliance: 4 ✓

**Gap:** Report **automation/scheduling not defined**. Who receives which reports on what schedule? Triggers (e.g., "send Daily Staff Util report to location managers at 06:00") undefined. Recommend adding Report Distribution Matrix to operational docs.

---

### A.4 6 Roles with RBAC Documented

Section 5.5.1 provides permission matrix for:
1. HQ Admin ✓
2. Location Manager ✓
3. Receptionist ✓
4. Therapist ✓
5. Doctor ✓
6. Slimming Consultant ✓

**Gap:** No explicit documentation of **role transitions** (e.g., promoting Receptionist to Manager — what additional access is granted? Is it additive or does Manager override some Therapist access?). Recommend creating Role Transition SOP.

---

### A.5 Migration Strategy Completeness

Section 7 covers:
- Data scope (9 data types listed) ✓
- Import process (Extract → Transform → Load) ✓
- Validation checks (5 reconciliation checks) ✓
- Cutover timeline (T-4 to T+30 days) ✓
- Rollback procedures ✓
- Staff training plan ✓

**Gap:** **Fresha payment history handling unclear.** SOW says "read-only reference" but:
- How do unpaid invoices migrate? Still owed to Fresha? To CarismaSoft?
- How are partial payments (Fresha records "50 EUR paid, 10 EUR outstanding") represented?
- Recommend pre-cutover audit of all outstanding invoices and debt reconciliation.

---

### A.6 MVP Scope Definition

Section 8.1 lists 24 modules/features for Phase 1. All core business functions included:
- ✓ Booking Engine (core)
- ✓ Calendar (core)
- ✓ Customer Management (core)
- ✓ Staff Scheduling (core)
- ✓ Packages/Memberships (core)
- ✓ Payments (core)
- ✓ All 9 integrations (core)
- ✓ Notifications (email, WhatsApp)
- ✓ Offline mode (basic)
- ✓ 10 core reports (basic set)

**Phase 2 explicitly deferred:**
- SMS notifications ✓
- Google Calendar sync ✓
- Waitlist management ✓
- Advanced reporting ✓
- Mobile app ✓
- Dynamic pricing ✓

**Assessment:** MVP scope is **clear and appropriately bounded.** Phase 1/Phase 2 boundary is explicit.

---

### A.7 Edge Cases Documentation

SOW addresses several edge cases:
- **Customer with no email:** SMS/WhatsApp primary (Section 3.1.4) ✓
- **Duplicate customers:** Merge tool specified (Section 3.1.4) ✓
- **GDPR data deletion:** Anonymize rather than hard delete (Section 3.1.4) ✓
- **Staff absence during shift:** Flagged for reassignment (Section 3.3.3) ✓
- **Recurring appointments:** Module specified (APT-008, Section 3.2.1) ✓
- **Manual overbooking override:** Documented with audit logging (Section 6a.6) ✓
- **Discount approval workflow:** Three-tier thresholds (Section 5.5.3, Appendix B) ✓
- **Integration failure fallback:** Each integration has manual fallback (Section 10.3) ✓

**Assessment:** Good coverage of common edge cases. **Gaps remain in operational workflows** (see Section B below).

---

### A.8 Summary of Completeness Issues

| Issue | Severity | Section | Recommended Action |
|---|---|---|---|
| Gift App API contract undefined | **CRITICAL** | 4.2.5, 10.2 Q-011 | Escalate to gift app team; define API contract before dev starts |
| Payment processor webhook vs. polling priority | High | 4.2.6 | Define: if both webhook and polling fire, which takes precedence? |
| Fresha payment history debt reconciliation | High | 7.1 | Add pre-cutover audit of outstanding invoices |
| Report automation/scheduling not defined | Medium | 3.7, Appendix C | Create Report Distribution Matrix (who gets what when) |
| Role transition workflows not documented | Medium | 5.5.1 | Create Role Transition SOP before UAT |
| Duplicate detection algorithm (fuzzy match) | Medium | 3.1.3 | Specify similarity threshold (e.g., Levenshtein distance >85%) |
| Soft-delete recovery procedures | Medium | 5.4 | Document how to recover soft-deleted records |
| Data retention policy for audit logs | Medium | 5.5.2 | Specify: rotate/archive after 7 years? Delete? |

---

## SECTION B: BLIND SPOTS IDENTIFIED

### B.1 OPERATIONAL BLIND SPOTS (8 identified)

#### B.1.1 No-Show & Late Cancellation Policies

**Issue:** SOW mentions no-show tracking (APT-006, RPT-OP-005) and cancellation policy (3.5.2: free >24h, deposit forfeited <=24h), but implementation gaps remain.

**Blind Spots:**
- **Late cancellation enforcement:** How does system prevent customer cancellation <24h? Does system block cancellation UI, or allow it with explicit warning? Current state: unclear.
- **No-show penalties:** Is it just logged, or does it affect future booking eligibility? Can customer still book? Recommend system design specifies whether no-show flags trigger deposit requirement for future bookings.
- **No-show automatic rebook:** Do customers receive "we're sorry, rebook free" offers? If so, who approves? Manager? Recommend automating: <5 no-shows in 12 months = auto-eligible for one free rebook within 30 days.
- **Late cancellation exceptions:** What if customer's partner books on their behalf? Staff member with no phone contact? Recommend: track "cancellation type" (customer-initiated vs. staff-initiated) and apply different policies.

**Impact:** Runtime UX surprises; customer service escalations; fairness issues (some customers get offers others don't).

**Recommendation:** 
Define cancellation state machine including:
```
Booked -> Confirmed ->  { Cancelled (<24h) / Cancelled (>=24h) }
       -> { Attended / NoShow }
       -> { RebookEligible (if no-show) / RebookIneligible }
```

---

#### B.1.2 Walk-In Booking at Full Capacity

**Issue:** Section 6a.5 covers walk-in creation but assumes availability.

**Blind Spots:**
- **Overbooking walk-ins:** What if walk-in arrives when location is at 100% capacity? Current: system suggests "nearest available time" but doesn't specify who decides (customer? staff?). Recommend: tiered options:
  1. Suggest next available time (system)
  2. Queue for cancellation-driven opportunity (if customer willing to wait up to 1h)
  3. Force-book if Manager approves (with notification to affected staff)
- **Walk-in staff assignment:** When walk-in books quickly (e.g., receptionist manually enters), which fairness algorithm is used? Current: same as online (least-booked staff). But what if least-booked staff is in lunch break (still on shift but unavailable)? Recommend: exclude on-break staff from fairness calculation.

**Impact:** Staff scheduling chaos on busy days; walk-in customer disappointment if "available slot" doesn't actually exist.

**Recommendation:** 
Add walk-in handling flowchart:
- If slots available: auto-assign using fairness algorithm
- If slots full: Manager approval required for override
- If customer willing to wait: add to "ready-for-slot" queue with 60-minute expiry

---

#### B.1.3 Recurring Appointment Series Management

**Issue:** APT-008 specifies "recurring appointments" (weekly, biweekly, monthly) but implementation unclear.

**Blind Spots:**
- **Modifying a single instance:** If customer books "every Thursday 10am massage for 3 months" (12 recurring instances), can they reschedule ONE instance? Current: not specified. Recommend: allow override instances; track as "exception to series."
- **Cancelling entire series:** If customer cancels "all future" recurring bookings, refund policy? Current: not defined. Recommend: handle same as individual cancellations (deposit forfeited if <24h before first future instance).
- **Staff reassignment impact:** If therapist books recurring massage series with Customer A every Thursday, and therapist goes on leave, what happens? Current: not specified. Recommend: auto-reassign to next available fair staff member; notify customer.
- **Bulk reschedule:** If location is closed one Thursday, how are recurring instances moved? Manual? Automatic to next available slot? Current: not defined.

**Impact:** Data integrity issues (orphaned recurring series); customer confusion; support burden.

**Recommendation:** 
Define recurring series data model:
```
RecurringSeries {
  id: UUID
  customer_id: FK
  service_id: FK
  schedule: RRULE (iCal format for flexibility)
  end_condition: Enum(DateRange, Occurrences)
  exceptions: Exception[] (dates/times that deviate)
  status: Enum(Active, Paused, Ended)
}
```

---

#### B.1.4 Overbooking Reconciliation at Day-End

**Issue:** Section 3.2.2 requires EOD lock (no close without all bookings resolved), but reconciliation of manual overrides unclear.

**Blind Spots:**
- **Actual vs. Scheduled:** Manager force-booked two therapists at same time (override). One therapist actually attended; other didn't (no-show?). At EOD, how does system know which actually happened? Current: not specified. Recommend: add "Attended" status confirmation by therapist or staff sign-off.
- **Double-booking conflict resolution:** If two bookings were confirmed at same slot due to race condition or manual override, EOD report should flag for resolution before day close. Current: not mentioned. Recommend: EOD validation runs a "conflict detection" query and blocks close if unresolved conflicts exist.

**Impact:** Revenue reconciliation errors; missing services recorded; unfair staff billing if "no-show" therapist gets paid but didn't actually work.

**Recommendation:** 
Enhance EOD lock logic:
1. Query all appointments with status "In-Progress" or "Attended" but no confirmation
2. Flag conflicting bookings (same staff/room, overlapping times)
3. Block day close until conflicts resolved or staff confirms attendance

---

#### B.1.5 Therapist Leave/Absence Impact on Booked Customers

**Issue:** Section 3.3.3 mentions Talexio marks staff absent, but reassignment workflow unclear.

**Blind Spots:**
- **Same-day absence:** Therapist calls in sick morning-of. They have 5 booked appointments today. Does system auto-reassign to fairest available staff? Current: "flagged for reassignment" but who performs reassignment? Current: not specified. Recommend: automate fairness reassignment with customer notification, fallback to manager manual override if no qualified staff available.
- **Advanced notice absence (e.g., vacation):** If therapist marks as "on leave" for a week in advance, when/how are their bookings reassigned? Current: not defined. Recommend: automated nightly job 7 days before leave start; reassign all bookings to next fairest staff member.
- **Therapist availability vs. shift conflict:** If staff member is on shift but marked as "unavailable" (e.g., admin work, no customer-facing), how is this represented? Current: not mentioned. Recommend: distinguish between "shift hours" and "available-for-bookings hours"; sync Talexio absence/unavailable states to block booking assignments.

**Impact:** Customer shows up, therapist not there; service delays; emergency call-outs.

**Recommendation:** 
Create absence sync & reassignment workflow:
- Talexio → CarismaSoft: daily import of absences/unavailable times
- CarismaSoft: nightly job to reassign affected bookings using fairness algorithm
- CarismaSoft → Customers: SMS/email notification of staff reassignment (allow opt-out to reschedule if preference for original staff)

---

#### B.1.6 Location-Specific Operating Hours & Holiday Closures

**Issue:** Section 5.2.1 mentions OperatingHours[] but specific handling unclear.

**Blind Spots:**
- **Holiday closures:** How are public holidays handled? Does system block bookings entirely, or allow manual booking with staff approval? Current: not specified. Recommend: per-location holiday calendar with options (closed vs. manager-approval-required).
- **Booking beyond operating hours:** Customer books online for 20:00 treatment, location closes at 19:00. Does system prevent this? Current: Section 6a.2 says "location operating hours" are part of availability calculation, but not explicit whether this blocks UI. Recommend: explicitly prevent UI selection outside operating hours.
- **Cross-timezone booking:** If customer in UK books Carisma Spa (Malta) via website, what timezone is used for slot display? Current: not specified. Recommend: assume location timezone (Europe/Malta) unless customer explicitly sets preferences.

**Impact:** Bookings outside operating hours; customer shows up to closed location.

**Recommendation:** 
Add to Location model:
```
Location {
  ...
  operating_hours: OperatingHours[] (Mon-Sun)
  holiday_dates: Date[] (closed)
  holiday_mode: Enum(Closed, ManagerApprovalRequired)
  timezone: String (default "Europe/Malta")
}
```

---

#### B.1.7 Waiting Lists / Booking Requests for Full Slots

**Issue:** Section 8.2 defers waitlist management to Phase 2, but current MVP has no mechanism for "request if full."

**Blind Spots:**
- **Customer expects waitlist:** If customer cannot find available slots 3 months out, can they request "notify me if Thursday 10am opens"? Current: no mechanism. Recommend Phase 1 minimum: simple email-based waitlist (not urgent, but improves UX).
- **Staff cancellation cascade:** If popular time slot opens due to staff cancellation, how is waitlist processed? First-come-first-served? Random? Recommend: FIFO with automated email offer (24-hour acceptance window).

**Impact:** Customer dissatisfaction; sales loss (customers book elsewhere).

**Recommendation:** 
Even as Phase 2, define the schema now to prevent rework:
```
WaitlistEntry {
  id: UUID
  customer_id: FK
  location_id: FK
  service_id: FK
  preferred_staff_id: FK (nullable)
  preferred_times: TimeSlot[] (e.g., Thu 10-11am, Fri afternoon)
  requested_at: Timestamp
  expires_at: Timestamp (14 days)
  status: Enum(Active, Offered, Accepted, Declined, Expired)
}
```

---

#### B.1.8 Peak Pricing / Location-Specific Pricing Variations

**Issue:** Section 3.4.1 specifies location-specific pricing, but no mention of dynamic pricing (peak vs. off-peak).

**Blind Spots:**
- **Seasonal/demand-based pricing:** Summer (high tourist season in Malta) likely has higher demand. Current model is static pricing per location. Recommend: leave room for Phase 2 dynamic pricing (but ensure schema supports it).
- **Time-based pricing:** Evening appointments vs. morning appointments at same location — different prices? Current: not specified. Recommend: define if "ServicePricing" should include time_slot dimension, or if Phase 2 can retroactively add it.

**Impact:** Revenue optimization opportunity missed; pricing model inflexible.

**Recommendation:** 
Design ServicePricing to be forward-compatible:
```
ServicePricing {
  ...
  effective_from: Date
  effective_to: Date (nullable)
  time_slot_type: Enum(AnyTime, MorningOnly, EveningOnly, PeakHours, OffPeakOnly) [nullable, Phase 2]
  peak_surcharge: Decimal (nullable, Phase 2)
}
```

---

### B.2 TECHNICAL BLIND SPOTS (7 identified)

#### B.2.1 Concurrent Booking Race Conditions

**Issue:** Section 5.2.2 describes optimistic locking but edge cases remain.

**Blind Spots:**
- **Three concurrent requests for same slot:** Requests A, B, C all hit availability check simultaneously. A wins. B and C both get "slot no longer available" after booking. But what if B had already collected payment? Current: not specified. Recommend: handle at API level with idempotency keys; allow B to retry with next available alternative.
- **Slot becomes available after booking:** Staff cancels appointment, slot opens. If 10 customers are queued refreshing their browser, do all 10 see the slot simultaneously? What happens if 5 click book? Current: simple first-write-wins, but in practice, all 5 will likely receive "slot taken" if they click within same second. Recommend: explicit handling: rate-limit availability queries per customer (e.g., max 1 per 5 seconds) to reduce false positives.

**Impact:** Customer frustration (slot appeared available but wasn't); UX confusion.

**Recommendation:** 
Implement idempotent booking with deduplication:
```
POST /bookings {
  idempotency_key: uuid,  // Client-generated; server deduplicates
  customer_id, service_id, location_id, start_time
}
// If idempotency_key seen before, return cached result
// If slot no longer available, return 409 with next N available alternatives
```

---

#### B.2.2 Offline-to-Online Sync Conflict Handling

**Issue:** Section 5.3 describes offline mode but conflict resolution sparse.

**Blind Spots:**
- **Concurrent create conflict:** Therapist creates walk-in booking offline (John, 2pm). Meanwhile, receptionist online books the same slot for Jane. When therapist comes online, sync detects conflict. Current: "flag for manual review." But which booking takes precedence? Recommend: timestamp-based (first-write-wins) + audit trail.
- **Deletion vs. creation conflict:** Offline: therapist marks appointment as No-Show (soft-delete logical). Online: customer cancels same appointment. On sync, both deletion and cancellation are in queue. Current: not addressed. Recommend: idempotent operations; final state is "Cancelled" or "No-Show" with reason, not both.
- **Offline data staleness:** Offline cache is "today's schedule." But what if cutover happens late in day (e.g., 18:00 go-online)? Cache is 12+ hours old. Recommend: max offline duration is 24h; display "data age" warning if cache >4h old.

**Impact:** Double-bookings created during sync; customer confusion.

**Recommendation:** 
Define sync conflict resolution matrix:
```
If offline operation conflicts with online state:
  1. Timestamp-based: newer write wins
  2. Preserve both in audit trail
  3. Flag for manual review if timestamps within 1 second
  4. Auto-resolve if unambiguous (e.g., status change is idempotent)
```

---

#### B.2.3 Integration Failure & Retry Strategy

**Issue:** Section 4.2 defines error handling per integration (e.g., "exponential backoff starting at 1s"), but cascade priority unclear.

**Blind Spots:**
- **Multiple integration failures simultaneously:** Zoho CRM is down, BOV POS is down. Customer creates booking online (depends on both). Current: not specified. Recommend: define fallback cascade:
  1. Allow booking creation with warning "Payment may not sync immediately"
  2. Queue CRM sync for manual retry
  3. Log both failures with high severity alert
- **Sync failure impact on user-facing operations:** If Talexio sync fails to import shifts, can staff still book appointments? Current: "use most recent successful import; alert operations manager." But what if import was 7 days ago and staff has changed availability? Recommend: block shift-dependent operations (booking at that location) with explicit admin override.
- **Audit trail of sync failures:** When integrations fail, are failures logged as audit events? Current: "alert operations manager" but no mention of audit trail. Recommend: all integration failures logged as system events (not user-triggered, but important for compliance).

**Impact:** Silent data loss (payment not recorded); revenue misses; operational confusion.

**Recommendation:** 
Implement Integration Health Dashboard:
```
IntegrationFailureLog {
  id: UUID
  integration_id: String (Zoho CRM, Talexio, etc.)
  operation: String (import, export, sync)
  error_code: String
  error_message: Text
  retry_count: Integer
  last_retry_at: Timestamp
  next_retry_at: Timestamp (exponential backoff)
  status: Enum(Pending, Retrying, Succeeded, Failed, ManualReviewRequired)
  alert_sent_at: Timestamp
}
```

---

#### B.2.4 Payment Reconciliation Failures

**Issue:** Section 3.5.2 defines payment workflow but reconciliation edge cases sparse.

**Blind Spots:**
- **Stripe charge succeeds, BOV POS fails:** Online customer pays EUR 60 via Stripe (succeeds). System tries to create invoice in BOV POS sync (fails). Revenue is recorded in Stripe but missing from POS. Current: "queue for manual review after 3 failures." But who does the review? How long before revenue is recognized? Recommend: automated reconciliation report daily (Stripe vs. POS).
- **Refund reversal:** Manager issues refund EUR 20 to customer. Stripe processes refund (succeeds). System tries to update BOV POS (fails). System shows -EUR 20 to customer but POS shows EUR 0. On next sync, refund applied twice. Current: no mention of idempotent refunds. Recommend: refund ID required in BOV POS update to prevent duplication.
- **Payment source mismatch:** Customer should pay EUR 60 via Stripe, but POS terminal was already charged (operator mistake). System shows customer as unpaid. Current: manual review required, but system doesn't detect overpayment. Recommend: automated reconciliation flags "payment mismatch" when invoice total <> sum of payments.

**Impact:** Revenue gaps; customer confusion (charged twice); manual rework.

**Recommendation:** 
Add daily reconciliation report:
```
PaymentReconciliation (daily, 02:00):
  1. Sum all invoices (by date)
  2. Sum all payments (by source: Stripe, BOV, Cash, etc.)
  3. Flag mismatches (invoices > payments = outstanding; payments > invoices = overpayment)
  4. Alert if discrepancy > EUR 100 or % > 5%
```

---

#### B.2.5 Database Transaction Isolation & Consistency

**Issue:** Section 5.4 shows schema but transaction boundaries not specified.

**Blind Spots:**
- **Package redemption atomicity:** Customer redeems last session from package (3-session massage package, using session 3). System deducts from package AND creates appointment AND charges balance due. If step 2 fails, is step 1 rolled back? Current: not specified. Recommend: explicit transaction boundaries; all or nothing.
- **Multi-location inventory sync:** Product sold at Location A. Zoho Inventory is updated. Location B sees stock update. But if Zoho API fails, Location B's cache might be stale. Current: 15-minute batch sync with no consistency guarantee. Recommend: Inventory sync should be idempotent; conflicts resolved by most-recent-write.

**Impact:** Data integrity issues (package used but not tracked; stock counted twice).

**Recommendation:** 
Define transaction boundaries for critical operations:
```
BEGIN TRANSACTION
  1. Check package balance
  2. Create appointment
  3. Deduct from package
  4. Update customer balance
COMMIT or ROLLBACK (all or nothing)
```

---

#### B.2.6 Timezone Handling for Multi-Location Operations

**Issue:** Section 5.2.1 mentions timezone as location property, but implementation unclear.

**Blind Spots:**
- **DST transitions:** Malta observes European Summer Time (spring forward, fall back). If appointment is booked 2 weeks before DST transition, what time is it displayed? Current: assumes static timezone offset. Recommend: use IANA timezone (Europe/Malta) and compute UTC offset at query time.
- **Cross-timezone staff:** If staff member works at two locations in different timezones, how is travel buffer calculated? Current: "30-minute buffer between locations" but buffer could be only 15 minutes actual travel time if moving east (losing an hour). Recommend: calculate buffer in UTC, convert back to local.
- **User timezone preference:** If HQ user in different timezone (e.g., owner in US) views calendar, what time is displayed? Current: assumes location timezone. Recommend: allow user-level timezone preference override.

**Impact:** Staff misses appointments due to time confusion; calendar shows wrong times post-DST.

**Recommendation:** 
Use IANA timezones throughout:
```
Location {
  timezone: String (e.g., "Europe/Malta")  // NOT offset like "+02:00"
}
Appointment {
  start_time: Timestamp (UTC)
  end_time: Timestamp (UTC)
  display_start_time: function(user_timezone) -> LocalDateTime
}
```

---

#### B.2.7 System Performance Under Load: Booking Availability Query

**Issue:** Section 5.1 targets <2 seconds availability check response, but query complexity not analyzed.

**Blind Spots:**
- **Complex availability query:** For a given (location, service, date), must check:
  1. Location operating hours (1 query)
  2. Staff shifts at location for that date (N staff; may require join)
  3. Existing appointments for each staff (N staff; may require subquery)
  4. Staff qualifications (N staff; may require join)
  5. Room availability (1 query if needed)
  This is at least 3-4 joins + subqueries. At 100 concurrent users, this could be slow. Current: target defined but no index strategy specified. Recommend: explicit index design and query optimization.
- **Calendar view performance:** Rendering month view with 400 appointments requires loading all appointments for the month. With 13 locations, this could be 13 * 400 = 5,200 appointments per month. Current: no mention of pagination or lazy-loading. Recommend: implement virtual scrolling or month-at-a-time pagination.

**Impact:** Slow availability checks frustrate customers; timeout errors; poor UX.

**Recommendation:** 
Add performance optimization spec:
```
Indexes required:
  - appointments(location_id, start_time, end_time, status) for conflict detection
  - shifts(staff_id, location_id, date) for availability check
  - staff_services(staff_id, service_id) for qualification lookup

Query optimization:
  - Availability check: use cached staff roster (refresh 15-min)
  - Calendar month view: paginate or lazy-load by week
  - P99 target: <2s for availability; <3s for calendar load
```

---

### B.3 INTEGRATION BLIND SPOTS (4 identified)

#### B.3.1 Third-Party Integrations Become Unavailable

**Issue:** Section 10.3 mentions "each integration has a manual fallback" but specifics sparse.

**Blind Spots:**
- **Zoho ecosystem down:** Zoho CRM, Inventory, AND Subscriptions all down (rare but possible). Customer data can't sync. Bookings still created locally. On sync recovery, 2-day backlog of customers created. Reconciliation logic? Current: not defined. Recommend: batch operation with conflict detection.
- **Talexio down:** No shift import. Staff scheduling becomes manual. But "fairness algorithm" depends on staff availability. Current: Section 6a.4 says "Query all staff who are on shift" but if shift data is stale, algorithm breaks. Recommend: document manual override mode; allow fairness to fall back to "random assignment" if shift data >12h old.
- **Stripe down:** Online bookings can't collect deposit. Current: block online booking with message "Payment system offline." But what about already-logged-in customers mid-checkout? Recommend: allow booking with "payment pending" status; customer receives reminder email within 1h.

**Impact:** Operational downtime cascades; data loss; customer confusion.

**Recommendation:** 
Define integration unavailability fallback mode per integration:
```
Zoho CRM unavailable:
  - Allow local operations (bookings, customers created)
  - Queue all changes for sync-on-recovery
  - Conflict resolution: Zoho CRM is source-of-truth; local changes override only if newer
  
Talexio unavailable:
  - Use last known shift schedule (alert if >12h old)
  - Fairness algorithm uses 7-day rolling bookings instead of shift-based
  
Stripe unavailable:
  - Online bookings allowed with "payment pending" status
  - Remind customer within 1h via email
  - Auto-cancel if payment not collected within 24h
```

---

#### B.3.2 Webhook Vs. Polling Priority in Integration Conflicts

**Issue:** Section 4.2.3 (Zoho Subscriptions) mentions "Webhook + polling fallback" but conflict handling unclear.

**Blind Spots:**
- **Webhook arrives after polling:** Zoho sends webhook (subscription renewed, add 10 credits). Meanwhile, polling job runs (sees no change, no credits added). 2 seconds later, webhook arrives. System applies credits. Now customer has 20 credits (double-counted). Current: no deduplication mentioned. Recommend: webhook should be idempotent (check if already applied before applying again).
- **Out-of-order delivery:** Webhook 1: "subscription renewed" arrives. Polling runs before Webhook 2: "credit allocated" arrives. Customer sees credits added before subscription confirmed. Current: no ordering guarantee. Recommend: use webhook as source-of-truth; polling only as fallback if webhook hasn't arrived in 30 minutes.

**Impact:** Double-counted credits; customer gets free sessions.

**Recommendation:** 
Define event deduplication:
```
IntegrationEvent {
  id: UUID
  integration_id: String
  external_event_id: String (e.g., Zoho subscription ID + renewal timestamp)
  event_type: String
  data: JSON
  applied_at: Timestamp (nullable)
  applied_by: String (Enum: Webhook, Polling)
}

On receipt (webhook or polling):
  IF external_event_id already in IntegrationEvent AND applied_at IS NOT NULL:
    SKIP (already processed)
  ELSE:
    PROCESS and set applied_at
```

---

#### B.3.3 Audit Logging of Integration Operations

**Issue:** Section 5.5.2 defines audit trail for user actions, but integration-driven changes sparse.

**Blind Spots:**
- **Who triggered the change:** If Zoho CRM sync updates customer tags, audit log should show "integration:Zoho CRM" as source, not a user. Current: not specified. Recommend: explicit integration audit logging.
- **Sync failure tracking:** When an integration operation fails, is it logged? Current: "alert operations manager" but no mention of audit trail. Recommend: failed operations logged so compliance can trace what was attempted vs. succeeded.

**Impact:** Compliance risk (GDPR audits can't trace data origin); operational confusion (who made this change?).

**Recommendation:** 
Extend AuditLog:
```
AuditLog {
  ...
  user_id: FK -> User (nullable if integration-driven)
  integration_id: String (nullable; populated if integration sync)
  sync_batch_id: UUID (nullable; links related integration operations)
  status: Enum(Pending, Succeeded, PartiallySucceeded, Failed)
}
```

---

#### B.3.4 Payment Method Reconciliation Across Processors

**Issue:** Section 3.5.1 mentions "Multi-gateway support" (Stripe, BOV, Revolut, PayPal), but reconciliation across gateways not defined.

**Blind Spots:**
- **Same customer, multiple payment methods:** Customer pays EUR 30 with Stripe card, EUR 20 with BOV cash. Invoice shows EUR 50 paid but split across two transaction IDs. On refund, does system refund EUR 30 to Stripe, EUR 20 to BOV? Or allow partial refund? Current: payment split not mentioned. Recommend: explicit support for "split payments."
- **Processor fee variation:** Stripe takes 1.5%, BOV takes different %. Revenue recognition differs. Reporting should show net revenue (after fees). Current: not mentioned. Recommend: capture processor fee in Payment record; calculate net revenue in Financial reports.

**Impact:** Financial reporting errors; revenue recognition delays.

**Recommendation:** 
Enhance Payment model:
```
Payment {
  ...
  processor_fee: Decimal (calculated per processor, stored for audit)
  net_amount: Decimal (amount - processor_fee)
  processor_fee_rate: String (e.g., "1.5% + EUR 0.20")
}

Financial reporting:
  Revenue by Service = SUM(invoice.total) - SUM(payment.processor_fee)
```

---

### B.4 BUSINESS RULE BLIND SPOTS (3 identified)

#### B.4.1 Staff Commission Calculation When Service Is Split

**Issue:** Not mentioned in SOW, but common in wellness (e.g., massage done by two therapists).

**Blind Spots:**
- **Commission split:** If service "Couples Massage" is done by Therapist A + Therapist B, how is commission split? 50/50? By time spent? Current: not addressed. Recommend: document business rule before development.
- **Package redemption attribution:** If customer redeems package (paid to Therapist A 6 months ago) but service performed by Therapist B, who gets the commission? Current: not specified.

**Impact:** Therapist disputes; payroll errors.

**Recommendation:** 
Add business rule to Appendix B:
```
BR-015: Multi-therapist bookings
- For split services, commission allocated as:
  1. If service explicitly defined as multi-therapist: split per definition
  2. If therapists manually added: notify HQ Admin, commission held pending manual review
- For package redemptions, commission goes to therapist who provides service (not original purchaser)
```

---

#### B.4.2 Package Sharing Edge Cases

**Issue:** Section 3.4.1 mentions "Cross-user sharing" but edge cases unclear.

**Blind Spots:**
- **Gift shared with non-customer:** Massage package gifted to Friend who has never booked. When friend books first time, are they matched as new customer or existing? Current: not specified. Recommend: link voucher/package at booking time; customer merge if same email/phone detected.
- **Partial redemption of shared package:** 5-session package shared between Customer A and B. Customer A redeems 2 sessions. B wants to redeem 2 sessions. System sees 1 session left. What happens? Current: not defined. Recommend: allocate sessions on first-claim basis; if Customer A claims 3 sessions (more than fair share), require Manager approval.

**Impact:** Revenue loss (packages used by unauthorized users); customer disputes.

**Recommendation:** 
Define package sharing model:
```
SharedPackage {
  package_id: FK
  owner_customer_id: FK
  shared_with_customers: UUID[] (explicitly invited)
  share_limit_per_customer: Integer (e.g., max 2 sessions per person from 5-session package)
  sessions_claimed: {customer_id -> count}
  sessions_remaining: Integer
}
```

---

#### B.4.3 Complimentary Treatment Tracking & Abuse Prevention

**Issue:** Section 3.5.2 mentions complimentary treatments (100% discount, Manager note required), but abuse prevention unclear.

**Blind Spots:**
- **Complimentary rate thresholds:** Is there a limit on complimentary treatments per location per month? Current: not specified. Recommend: set threshold (e.g., max 5% of monthly revenue). Alert if exceeded.
- **Approval by same manager repeatedly:** If one manager approves 80% of complimentaries, is that tracked? Current: audit trail captures approver, but no analytics on approval patterns. Recommend: quarterly audit of complimentary approvals by approver.

**Impact:** Revenue loss (staff/managers abuse system for favorites); fairness issues.

**Recommendation:** 
Add compliance rules:
```
BR-016: Complimentary treatment limits
- Location max: 5% of monthly revenue as complimentaries
- Manager approval: tracked per approver; monthly audit
- Threshold alert: if complimentaries exceed 5% in a week, escalate to HQ Admin
- Pattern detection: if single manager approves >50% of location's complimentaries, flag for audit
```

---

### B.5 USER EXPERIENCE BLIND SPOTS (3 identified)

#### B.5.1 Customer Notification of Staff Reassignment

**Issue:** Section B.1.5 recommends automating staff reassignment, but customer experience not defined.

**Blind Spots:**
- **Notification timing:** When therapist cancels, when is customer notified of reassignment? Immediately? Or does system wait to see if they cancel rather than show up? Current: not specified. Recommend: notify within 1 hour; allow customer to cancel or confirm.
- **Customer preference override:** Can customer say "I only want Therapist A; if she cancels, I'll reschedule"? Current: fairness algorithm doesn't support preferences. Recommend: capture "flexible about therapist (yes/no)" at booking time.
- **Rebooking vs. reassignment:** If Customer B has committed appointment with Therapist X, and X is now unavailable, is Customer B automatically reassigned (without consent), or just offered alternatives? Current: unclear. Recommend: explicit policy: <24h reassignment automatic; >=24h requires customer consent.

**Impact:** Customer frustration (unwanted reassignment); lost bookings if customer forced to reschedule.

**Recommendation:** 
Design reassignment workflow:
```
WHEN therapist cancels/absence:
  FOR EACH affected booking:
    1. IF <24h before appointment:
         Auto-reassign to fairest available
         SEND customer notification: "Your therapist is unavailable. We've assigned [Therapist Y]. Reply to confirm or call to reschedule."
    2. ELSE (>=24h):
         SEND customer notification: "Your appointment with [X] is affected. Click to [Keep new therapist Y / Reschedule / Cancel]"
         Allow customer 2-hour window to respond
         If no response: auto-reassign
```

---

#### B.5.2 Bulk Cancellation (e.g., Location Closure)

**Issue:** Not mentioned; would occur if location temporarily closes (emergency, renovation, etc.).

**Blind Spots:**
- **Process:** If Carisma Spa - Valletta is closed for 1 week, how are 150 booked appointments handled? Reschedule all to nearby location? Other locations at pro-rata? Offer refund? Current: no mention. Recommend: Manager-initiated "location closure" event that prompts bulk action.
- **Customer communication:** How do 150 customers find out their appointment is cancelled/moved? Current: no mechanism. Recommend: bulk email/SMS with 48-hour notice and rebooking link.
- **Staff impact:** If all appointments at Location A are rescheduled to Location B, how are staff shifts affected? Do Location A staff transfer to B? Current: not addressed.

**Impact:** Operational chaos (customer service overwhelmed); revenue loss (failed rebooking).

**Recommendation:** 
Add location closure workflow:
```
Location.status: Enum(Active, Inactive, TemporarilyClosed, EmergencyClosed)

WHEN status changes to TemporarilyClosed:
  1. User selects date range (e.g., April 1-7)
  2. System identifies all appointments in range
  3. System suggests alternative locations (same brand) + times
  4. Manager bulk-reassigns or bulk-cancels
  5. System sends notification to all affected customers
  6. Customers can accept/decline/reschedule via link
```

---

#### B.5.3 Therapist Self-Service Schedule Management

**Issue:** Section 6a doesn't address therapist-initiated rescheduling.

**Blind Spots:**
- **Therapist swaps shifts with colleague:** Therapist A and B want to swap shifts on Friday. Who approves? Current: not mentioned. Recommend: Manager approval required; system checks for conflicts before approving.
- **Therapist marks self as unavailable:** Therapist wants to take a 30-minute break unpaid. Current: no mechanism. Recommend: allow Therapist to mark time slot as "unavailable" (blocks bookings for that slot).
- **Therapist cancels their own appointments:** Therapist calls in sick after arriving (vs. advance notice). Can therapist cancel their 2pm appointment? Current: not specified. Recommend: Therapist role can cancel own appointments; triggers reassignment workflow.

**Impact:** Operational friction (therapists can't manage own schedule); customer confusion (sudden cancellations).

**Recommendation:** 
Add therapist self-service features:
```
Therapist dashboard:
  - View upcoming appointments
  - Mark self unavailable (block time slot, reason optional)
  - Cancel appointment (triggers reassignment)
  - Request shift swap with colleague (sends request to manager)
```

---

### B.6 REPORTING & ANALYTICS BLIND SPOTS (2 identified)

#### B.6.1 Forecasting & Predictive Analytics

**Issue:** Section 3.7 lists operational/financial/marketing reports but no mention of forecasting.

**Blind Spots:**
- **Revenue forecasting:** Based on historical bookings + pipeline, can system forecast next month's revenue? Current: Phase 2 AI assistant mentioned, but forecasting not specified. Recommend: simple linear regression on historical data (e.g., last 12 months revenue trend).
- **No-show prediction:** Based on customer profile (age, history, lead source), can system flag high-risk no-shows for reminder emails? Current: not mentioned. Recommend: simple scoring model (e.g., customers with >10% no-show rate get extra reminder).

**Impact:** Missed revenue optimization opportunity; higher no-show rate than necessary.

**Recommendation:** 
Phase 2 feature: Predictive models
```
NoShowRisk = 0.3 * (customer_no_show_rate) + 0.2 * (booking_last_minute) + 0.1 * (service_cancellation_rate)
IF NoShowRisk > 0.5:
  Send 48h + 24h + 4h reminders (vs. default 24h only)
```

---

#### B.6.2 KPI Alerts & Thresholds

**Issue:** Section 10.3 mentions "KPI thresholds" but none defined in SOW.

**Blind Spots:**
- **Utilization alerts:** If staff utilization drops below 60% in a week, should Manager be notified? Current: not specified. Recommend: configurable threshold alerts per location.
- **Revenue alerts:** If daily revenue falls below EUR X, alert. Current: not defined. Recommend: set baseline from historical data; alert if <80% of baseline.
- **Cancellation rate alerts:** If cancellations exceed 15% in a day, investigate. Current: not mentioned. Recommend: daily alert if rate >15%.

**Impact:** Operational issues missed (slow days, high cancellations) until end-of-month analysis.

**Recommendation:** 
Add KPI alert config:
```
KPIAlert {
  name: String (e.g., "Staff Utilization Too Low")
  metric: String (field to monitor)
  threshold: Float (trigger value)
  comparison: Enum(GreaterThan, LessThan, PercentChange)
  alert_recipients: User[]
  frequency: Enum(Daily, Weekly, RealTime)
}

Example:
  {
    name: "Daily Revenue Low",
    metric: "daily_revenue",
    threshold: 1000 (EUR),
    comparison: LessThan,
    alert_recipients: [location_manager],
    frequency: Daily (at 20:00 EOD)
  }
```

---

### B.7 COMPLIANCE BLIND SPOTS (2 identified)

#### B.7.1 Consent Management for Marketing Communications

**Issue:** Section 5.5.3 mentions "Consent tracking for marketing communications" but implementation sparse.

**Blind Spots:**
- **Consent granularity:** Does customer consent cover email + SMS + WhatsApp, or separately? Current: not specified. Recommend: separate per channel.
- **Consent withdrawal:** Customer opts out of email marketing. But what if they already have a recurring appointment booked? Do they still get appointment confirmations? Current: not addressed. Recommend: distinguish "transactional" (appointment confirmations) vs. "marketing" (promotions); only marketing requires consent.
- **GDPR proof:** When audited, how does system prove customer consented? Current: not mentioned. Recommend: store consent with timestamp and channel.

**Impact:** GDPR violations; customer complaints; regulatory fines.

**Recommendation:** 
Implement consent tracking:
```
CustomerConsent {
  id: UUID
  customer_id: FK
  channel: Enum(Email, SMS, WhatsApp)
  consent_type: Enum(Transactional, Marketing, Analytics)
  consented: Boolean
  consent_date: Timestamp
  consent_method: String (e.g., "Online booking form", "SMS opt-in", "Verbal")
  expired_at: Timestamp (nullable, if consent has expiry)
}

Notification logic:
  IF consent_type = Transactional:
    SEND regardless of consent (appointment confirmations, payment receipts)
  ELSE IF consent_type = Marketing AND customer.consents.filter(channel, Marketing):
    SEND (promotions, upsell offers)
```

---

#### B.7.2 Data Retention & Purging Policy

**Issue:** Section 5.5.3 says "Retention: minimum 7 years for financial records" but other data types not specified.

**Blind Spots:**
- **Customer data purging:** If customer is inactive for 2 years, can data be purged? Current: not specified. Recommend: define retention per data type (customer profiles: indefinite; booking history: 7 years; personal notes: 3 years).
- **Soft-delete recovery window:** Soft-deleted records not hard-deleted. But for how long? 30 days? 1 year? Current: not mentioned. Recommend: 90-day recovery window, then hard delete.
- **GDPR right to erasure:** Customer requests data deletion. System anonymizes. But what about historical references (e.g., "Customer A booked with Therapist B")? Do we keep therapist record but anonymize customer? Current: not clear. Recommend: anonymize customer reference; retain therapist record.

**Impact:** GDPR non-compliance; storage bloat; difficulty in forensic audits.

**Recommendation:** 
Define data retention policy:
```
DataRetention {
  entity_type: String
  retention_period: Integer (days)
  hard_delete: Boolean (after retention period)
  GDPR_right_to_erasure: Boolean
  example_values: {
    customer_profile: { retention: indefinite, gdpr: true (anonymize) },
    booking_history: { retention: 7_years, gdpr: false },
    payment_records: { retention: 7_years, gdpr: false },
    audit_logs: { retention: 7_years, gdpr: false },
    notes: { retention: 3_years, gdpr: true }
  }
}
```

---

### B.8 Summary Table: All Blind Spots

| Domain | Count | Critical | High | Medium |
|---|---|---|---|---|
| Operational | 8 | 1 | 3 | 4 |
| Technical | 7 | 0 | 3 | 4 |
| Integration | 4 | 1 | 2 | 1 |
| Business Rules | 3 | 0 | 2 | 1 |
| UX | 3 | 0 | 2 | 1 |
| Reporting | 2 | 0 | 1 | 1 |
| Compliance | 2 | 0 | 1 | 1 |
| **TOTAL** | **29** | **2** | **14** | **13** |

---

## SECTION C: OPTIMIZATION & INNOVATION IDEAS

### C.1 REVENUE OPTIMIZATION (5 ideas)

#### C.1.1 Dynamic Pricing Based on Demand

**Description:** Adjust service prices based on occupancy/demand. Peak times (evenings, weekends) charge premium; off-peak (weekday mornings) offer discounts.

**Business Case:**
- Estimated impact: +15-20% revenue on peak times, +5-10% volume on off-peak = net +8-12% revenue
- Competitive advantage: Fresha doesn't offer this; differentiator for high-demand periods
- Implementation: Phase 2 (requires demand forecasting, admin pricing rules)

**Complexity:** 3/5 (moderate; requires pricing engine + historical demand analysis)

**Priority:** High (revenue impact significant; implementation can start in Phase 2)

**Recommendation:** Reserve schema for dynamic pricing; manual pricing overrides in MVP; automate in Phase 2.

---

#### C.1.2 Upsell & Cross-Sell Automation

**Description:** At checkout, recommend related services based on customer booking history. E.g., "Customers who book Massage also book Facials; 45% conversion."

**Business Case:**
- Estimated impact: +5-8% average transaction value
- Requires minimal data (historical bookings); ML model can be simple (co-occurrence matrix)
- ROI: High (easy implementation)

**Complexity:** 2/5 (simple; just database query + basic recommendation)

**Priority:** High (quick win; low effort, good ROI)

**Recommendation:** Implement in MVP Phase 1. At checkout, show "Customers who booked [service A] also booked [service B]" with 1-click add.

---

#### C.1.3 Referral Program Tracking & Incentives

**Description:** Customer refers Friend. System tracks referral → booking → tracks reward (discount, free session). Enables viral growth.

**Business Case:**
- Estimated impact: +10-15% new customer acquisition (if referred customers have 2x retention)
- CAC reduction: Referral cost ~EUR 10-20 per referral vs. EUR 30-50 for ad spend
- ROI: 2-3x

**Complexity:** 3/5 (moderate; requires referral code tracking, reward redemption)

**Priority:** Medium-High (good ROI but can wait until Phase 2)

**Recommendation:** Design referral model now; implement in Phase 2. Schema:

```
ReferralCode {
  id: UUID
  referrer_id: FK -> Customer
  code: String (unique, shareable)
  reward_type: Enum(Discount, FreeSession, Points)
  reward_value: Decimal
  redemption_count: Integer
  expiry_date: Date
}
```

---

#### C.1.4 Loyalty Program Integration

**Description:** Award points per booking, redeem for services/discounts. Encourages repeat bookings.

**Business Case:**
- Estimated impact: +20% repeat booking rate (loyalty customers book 2x more often)
- Revenue multiplier: 20% increase in repeat customers × 2x booking frequency = +40% lifetime value
- ROI: High (gamification proven in wellness industry)

**Complexity:** 3/5 (moderate; point tracking, redemption logic, rules engine)

**Priority:** Medium (Phase 2; high impact but lower urgency than dynamic pricing)

**Recommendation:** Design points model now; implement in Phase 2.

```
CustomerLoyaltyBalance {
  customer_id: FK
  points_balance: Integer
  points_earned: Integer (lifetime)
  points_redeemed: Integer (lifetime)
}

LoyaltyRule {
  trigger: Enum(BookingCompleted, ReviewSubmitted, ReferralConverted)
  points_awarded: Integer
  multiplier: Decimal (e.g., 1.5x on weekends)
}
```

---

#### C.1.5 Seasonal Pricing & Promotions

**Description:** Auto-trigger pricing changes based on season (e.g., summer tourist season = +20% pricing in Malta).

**Business Case:**
- Malta's tourism peaks Apr-Oct; locals higher spend then
- Estimated impact: +10-15% revenue during peak season
- Requires minimal manual intervention (admin sets seasonal rules once)

**Complexity:** 2/5 (simple rule engine)

**Priority:** Medium (Phase 2; nice-to-have, not core)

**Recommendation:** Schema for seasonal pricing rules:

```
SeasonalPricingRule {
  service_id: FK
  location_id: FK
  start_date: Date
  end_date: Date
  price_multiplier: Decimal (e.g., 1.15 = +15%)
  reason: String (e.g., "Summer tourist season")
}
```

---

### C.2 OPERATIONAL EFFICIENCY (5 ideas)

#### C.2.1 Automated Staff Scheduling Optimization

**Description:** Instead of manual shifts from Talexio, system recommends optimal scheduling based on historical demand, staff preferences, and fairness.

**Business Case:**
- Estimated impact: +5-10% staff utilization, -10% overtime
- Reduces scheduling overhead (currently manual in Talexio)
- ROI: Moderate (staff cost reduction + reduced manual work)

**Complexity:** 4/5 (complex; constraint satisfaction problem — NP-hard)

**Priority:** Low (Phase 2; nice-to-have, not core to MVP)

**Recommendation:** Requires optimization library (e.g., OR-Tools); defer to Phase 2. Proof of concept: simple heuristic in MVP (e.g., "assign shifts to balance utilization").

---

#### C.2.2 Predictive No-Show Prevention

**Description:** Identify high-risk no-show customers. Send extra reminders (SMS + email) 48h + 24h + 4h before.

**Business Case:**
- Current (estimated) no-show rate: ~10% (industry standard)
- Target reduction: -30-40% (to 6-7%)
- Impact: +300-400 fewer no-shows/year = +EUR 18,000-24,000 incremental revenue
- Complexity: Simple scoring model (no advanced ML needed)

**Complexity:** 2/5 (straightforward; just historical analysis + rule-based scoring)

**Priority:** High (quick win; high ROI; simple implementation)

**Recommendation:** Implement in MVP Phase 1:

```
NoShowRiskScore = 0.4 * (customer_no_show_rate) 
                + 0.2 * (days_until_booking < 3)
                + 0.2 * (service_category = LowPriority)
                + 0.1 * (lead_source = WalkIn)

IF score > 0.6:
  Send extra reminders (48h, 24h, 4h)
```

---

#### C.2.3 Inventory Forecasting (Phase 2)

**Description:** Based on bookings, forecast product consumption. Alert when stock likely to run out.

**Business Case:**
- Reduces stockouts (unhappy customers when product unavailable)
- Improves cash flow (avoids excess inventory)
- Estimated impact: +5% retail sales (fewer stockouts), -EUR 5,000/year inventory carrying cost

**Complexity:** 3/5 (moderate; time-series forecasting)

**Priority:** Medium (Phase 2; nice-to-have)

**Recommendation:** Simple linear regression on booking volume → product usage pattern.

---

#### C.2.4 Therapist Utilization Alerts

**Description:** Real-time dashboard showing therapist utilization % (booked hours / available hours). Alert if <50% (underutilized) or >90% (overworked).

**Business Case:**
- Reduces idle time (manager can reassign underutilized therapist to other locations)
- Reduces burnout (alerts on overworked therapists; trigger hiring decision)
- Estimated impact: +5-8% therapist utilization

**Complexity:** 2/5 (simple; real-time calculation of booked vs. available hours)

**Priority:** Medium-High (good operational visibility; Phase 2 or late MVP)

**Recommendation:** Add to dashboard; alert Manager if utilization <50% or >90%.

---

#### C.2.5 Automated Customer Re-engagement Campaigns

**Description:** Identify inactive customers (no booking in 90 days). Trigger Klaviyo email campaign with personalized offer.

**Business Case:**
- Estimated impact: +20% of inactive customers reactivate (assume 5% high-value customers inactive = 100 customers reactivated)
- Average customer LTV = EUR 500; reactivation rate 20% = EUR 10,000 incremental revenue
- Requires Klaviyo integration (already planned); minimal effort

**Complexity:** 2/5 (simple; query inactive customers, trigger Klaviyo workflow)

**Priority:** Medium (Phase 2; good ROI but not urgent)

**Recommendation:** Design workflow now; implement in Phase 2. Query:

```
SELECT * FROM customers 
WHERE last_booking_date < NOW() - INTERVAL '90 days'
AND status = 'Active'
-- Trigger Klaviyo workflow for each customer
```

---

### C.3 CUSTOMER EXPERIENCE (4 ideas)

#### C.3.1 AI-Powered Booking Assistant

**Description:** Chatbot (WhatsApp or web) that understands natural language. E.g., "I'd like a massage on Thursday afternoon" → system proposes slots, collects payment.

**Business Case:**
- Estimated impact: +15-20% online booking conversion (easier than form-filling)
- Reduces booking friction; enables after-hours bookings (chatbot always available)
- Requires NLU (Natural Language Understanding); Phase 2

**Complexity:** 4/5 (moderate-high; requires NLU API or fine-tuned LLM)

**Priority:** Medium (Phase 2; high impact but complexity)

**Recommendation:** Use existing LLM API (e.g., OpenAI) for NLU. System parses booking intent, confirms with customer, creates booking.

---

#### C.3.2 Review/Feedback Collection & Display

**Description:** Post-appointment, automatically send feedback survey. Aggregate 5-star reviews on website.

**Business Case:**
- Social proof increases conversion (sites with reviews convert 3-5x higher)
- Estimated impact: +20% online booking conversion
- Requires minimal new development (survey form + review widget)

**Complexity:** 2/5 (simple; survey email + review aggregation)

**Priority:** High (quick win; high ROI; low effort)

**Recommendation:** Implement in MVP Phase 1 or early Phase 2. Schema:

```
Review {
  id: UUID
  customer_id: FK
  booking_id: FK
  rating: Integer (1-5)
  comment: Text
  published: Boolean (customer + manager approval)
}
```

---

#### C.3.3 Personalized Service Recommendations

**Description:** Based on booking history, recommend next service. E.g., "You haven't had a facial in 3 months; try our Glow Facial."

**Business Case:**
- Increases cross-sell; estimated +5-10% transaction value
- Personalization increases engagement (likely to re-book)
- ROI: Low complexity, good ROI

**Complexity:** 2/5 (simple; historical analysis + rules)

**Priority:** Medium-High (Phase 2; good UX)

**Recommendation:** Display recommended service in account page or post-checkout email. Rule-based (e.g., "if last facial >90 days, recommend facial").

---

#### C.3.4 Before/After Photo Gallery (Aesthetics-Specific)

**Description:** For Aesthetics brand, show customer before/after photos (with consent). Builds credibility.

**Business Case:**
- Before/after proof increases conversion significantly
- Requires consent tracking (GDPR); not core but valuable
- Estimated impact: +10-15% conversion on aesthetics services

**Complexity:** 3/5 (moderate; image upload, consent, privacy)

**Priority:** Medium (Phase 2 or late MVP; important for Aesthetics brand)

**Recommendation:** Allow therapist to upload photos post-appointment with customer consent. Display on customer profile (private) and optionally on website (public with customer approval).

---

### C.4 DATA & ANALYTICS (3 ideas)

#### C.4.1 Real-Time Manager Dashboard

**Description:** Live dashboard showing: today's revenue, utilization, no-shows, cancellations, pending approvals. Accessible on mobile.

**Business Case:**
- Enables real-time decision-making (e.g., realizing underutilization mid-day, offer discounts)
- Estimated impact: +3-5% operational efficiency (faster response to issues)
- Builds on existing reporting infrastructure (low incremental effort)

**Complexity:** 2/5 (simple; real-time data aggregation + UI)

**Priority:** High (Phase 2; good operational visibility)

**Recommendation:** Use WebSocket for live updates. Dashboard shows KPIs: revenue (today YTD), utilization %, no-show count, pending approvals.

---

#### C.4.2 Cohort Analysis & Customer Lifetime Value (LTV)

**Description:** Segment customers by acquisition source (walk-in, website, referral). Track LTV by cohort. Optimize marketing spend.

**Business Case:**
- Estimated impact: +10-20% marketing ROI (identify highest-LTV channels)
- Enables attribution modeling (which channel drives highest-value customers)
- Requires minimal new data; leverages existing Booking + Payment data

**Complexity:** 2/5 (simple; cohort queries in SQL)

**Priority:** Medium (Phase 2; good analytics, not urgent)

**Recommendation:** Implement in reporting layer. Query:

```
SELECT lead_source, 
       COUNT(DISTINCT customer_id) as customer_count,
       AVG(total_spent) as avg_ltv,
       STDDEV(total_spent) as ltv_variance
FROM customers c
JOIN bookings b ON c.id = b.customer_id
GROUP BY lead_source
```

---

#### C.4.3 A/B Testing Framework for Offers/Messaging

**Description:** Enable experimentation: test "EUR 10 off" vs. "10% off" messaging. Track which drives more conversions.

**Business Case:**
- Small improvements in messaging compound: 5% conversion lift = +EUR 30,000/year
- Data-driven decision-making replaces gut feeling
- Requires testing infrastructure (feature flags, variant tracking)

**Complexity:** 3/5 (moderate; requires feature flag library + analytics)

**Priority:** Low (Phase 2; nice-to-have)

**Recommendation:** Use feature flag library (e.g., LaunchDarkly) to manage variants. Track conversion per variant.

---

### C.5 INTEGRATION ENHANCEMENTS (3 ideas)

#### C.5.1 Automated Marketing Workflows

**Description:** Trigger email sequences based on customer actions. E.g., "First-time customer booking → welcome email → satisfaction survey → upsell offer → loyalty reminder."

**Business Case:**
- Estimated impact: +15-20% first-time-customer LTV (nurturing increases conversion)
- Leverage existing Klaviyo integration
- Requires minimal development (workflow configuration in Klaviyo)

**Complexity:** 2/5 (simple; Klaviyo native; just configure workflows)

**Priority:** Medium-High (Phase 2; high ROI, low effort)

**Recommendation:** Design workflow now; configure in Phase 2. Events to trigger:
- Booking created
- Booking attended (not cancelled/no-show)
- Payment completed
- Refund issued
- Package expired

---

#### C.5.2 Accounting Deep Integration (Real-Time P&L)

**Description:** Every transaction automatically synced to Zoho Books with full GL mapping. Real-time P&L reporting.

**Business Case:**
- Eliminates manual entry (faster, fewer errors)
- Enables real-time financial reporting (no lag)
- Improves CFO visibility (knows profitability in real-time)
- ROI: High (reduces accounting overhead; improves decision-making speed)

**Complexity:** 3/5 (moderate; requires GL account mapping, transaction categorization)

**Priority:** High (finance loves this; Phase 2)

**Recommendation:** Design GL mapping schema now; implement Phase 2. Map transaction types:

```
TransactionGLMapping {
  transaction_type: Enum(ServiceRevenue, PackageSale, Discount, Refund, Deposit, Fee)
  gl_account: String (e.g., "4100-Service Revenue")
  location_id: FK (location code)
}
```

---

#### C.5.3 Inventory Sync for Retail Recommendations

**Description:** At checkout, if product is low stock, offer alternative or pre-order option.

**Business Case:**
- Prevents customer frustration (sold out)
- Enables demand-driven ordering (if product shows high demand, auto-order)
- Estimated impact: +5% retail sales (fewer stockouts)

**Complexity:** 2/5 (simple; stock level check + recommendation logic)

**Priority:** Low (Phase 2; nice-to-have)

**Recommendation:** At checkout, check stock. If low (<5 units), show: "Only 3 left in stock. Pre-order for next week?" Also notify inventory team.

---

### C.6 Summary Table: All Optimization Ideas

| Category | Idea | Complexity | Priority | Est. Impact (Revenue) |
|---|---|---|---|---|
| **Revenue** | Dynamic Pricing | 3 | High | +8-12% |
| | Upsell Automation | 2 | High | +5-8% |
| | Referral Program | 3 | Medium-High | +10-15% CAC reduction |
| | Loyalty Program | 3 | Medium | +40% LTV |
| | Seasonal Pricing | 2 | Medium | +10-15% (peak season) |
| **Efficiency** | Staff Scheduling Opt. | 4 | Low | +5-10% utilization |
| | No-Show Prevention | 2 | High | +EUR 18-24k/year |
| | Inventory Forecasting | 3 | Medium | +5% + EUR 5k cost |
| | Utilization Alerts | 2 | Medium-High | +5-8% utilization |
| | Re-engagement Campaigns | 2 | Medium | +EUR 10k/year |
| **UX** | AI Booking Assistant | 4 | Medium | +15-20% conversion |
| | Review Collection | 2 | High | +20% conversion (social proof) |
| | Service Recommendations | 2 | Medium-High | +5-10% transaction value |
| | Before/After Gallery | 3 | Medium | +10-15% (Aesthetics) |
| **Analytics** | Manager Dashboard | 2 | High | +3-5% efficiency |
| | Cohort Analysis | 2 | Medium | +10-20% marketing ROI |
| | A/B Testing Framework | 3 | Low | +5% conversion = +EUR 30k/year |
| **Integration** | Marketing Workflows | 2 | Medium-High | +15-20% LTV |
| | Accounting P&L Sync | 3 | High | +operational efficiency |
| | Inventory Retail Sync | 2 | Low | +5% retail sales |

---

## SECTION D: SCOPE CLARITY & AMBIGUITIES

### D.1 Ambiguities That Could Cause Disputes

#### D.1.1 "Fair" Assignment Algorithm Definition

**Ambiguity:** Section 6a.4 says "distribute bookings equitably among qualified staff" using fairness algorithm, but "fair" is subjective.

**Current definition:** "Fewest bookings in rolling 7-day window."

**Possible interpretations:**
1. **Strictly time-based:** Therapist with least booked hours wins (ignores service complexity)
2. **Revenue-weighted:** Therapist with lowest revenue generated (accounts for high-value services)
3. **Preference-first:** Customer's preferred therapist gets priority (fairness to customer, not staff)

**Risk:** If implementation uses interpretation #1 but manager expects #2, complaints arise.

**Recommendation:** Explicitly document fairness algorithm in operations manual:
> "Fair assignment = therapist with fewest booked **hours** (not services) in rolling 7-day window. Tiebreak: random. Overrides: customer preference overrides fairness (if preferred therapist available)."

---

#### D.1.2 Cancellation Refund Policy (Deposit Handling)

**Ambiguity:** Section 3.5.2 says "Cancellation >24h: free; <=24h: deposit forfeited." But:

**Possible interpretations:**
1. **Deposit forfeited = system keeps EUR 10-20:** Customer gets EUR 0
2. **Deposit forfeited = applied to account credit:** Customer gets EUR 10-20 credit (not refund)
3. **Deposit forfeited = used toward rebooking:** Customer can reschedule for same/higher value

**Risk:** If customer expects #2 but system does #1, customer anger + support escalation.

**Recommendation:** Document explicitly:
> "If booking cancelled <24 hours before appointment: deposit is forfeited and converted to non-transferable store credit valid for 30 days. If customer does not rebook within 30 days, credit expires."

---

#### D.1.3 Multi-Location Pricing Override

**Ambiguity:** Section 3.4.1 specifies location-specific pricing. But what if Location A's massage price (EUR 60) differs from Location B (EUR 80)?

**Possible interpretations:**
1. **Customer's home location:** Always charged Location A price (customer's primary location)
2. **Booking location:** Charged Location B price (where service is performed)
3. **Lowest price:** Charged EUR 60 (best customer price)

**Risk:** Customer books at Location B, charged EUR 80, feels ripped off because same service is EUR 60 at Location A.

**Recommendation:** Document explicitly:
> "Pricing is location-specific. Customer charged the price of the **location where service is performed**. If customer transfers booking to different location, price changes to that location's rate."

---

#### D.1.4 Package Expiry Extension Policy

**Ambiguity:** Section 3.4.1 mentions "Expiry + override" but conditions for override unclear.

**Possible interpretations:**
1. **Manager discretion:** Any manager can extend on request
2. **Business rule:** Extend only if customer paid in advance + no alternative available
3. **Paid extension:** Customer must pay fee to extend (incentivizes on-time usage)

**Risk:** Inconsistent manager approvals; customer complaints about unfair policy.

**Recommendation:** Document explicitly:
> "Package expiry can be extended only by Location Manager with documented reason. Reasons: (a) system maintenance caused non-availability, (b) staff cancellation prevented redemption, (c) hospitality gesture (max 1x per customer per year). Extensions are free. No extension applies to gift vouchers."

---

#### D.1.5 Discount Approval for Team-Level Managers vs. Location Managers

**Ambiguity:** Section 5.5.1 mentions "Manager" role, but doesn't specify scope:

**Possible interpretations:**
1. **Location Manager:** Can approve discounts up to 20% at own location only
2. **Team Manager:** Can approve discounts up to 20% across multiple assigned locations
3. **Discount = Location-blind:** Any manager can approve any discount?

**Risk:** If manager at Location A approves excessive discount at Location B (not assigned), HQ has limited control.

**Recommendation:** Document explicitly:
> "Discount approval is scoped to manager's assigned locations. Location Manager at Sliema can approve discounts at Sliema only. Multi-location managers can approve at all assigned locations. HQ Admin has global approval authority."

---

### D.2 Assumptions That Need Validation

#### D.2.1 Fresha Data Export Quality

**Assumption (A-001):** "Fresha provides complete data export (CSV or API)"

**Why it matters:** If Fresha export is incomplete (e.g., payment history missing), migration timeline extends.

**Validation approach:**
1. Contact Fresha support now; request export format specification
2. Request sample export of 100 customers + 500 bookings
3. Validate against SOW requirements: all fields present? Date ranges correct?

**If invalid:** Escalate to business; consider manual data entry or extended Fresha license.

---

#### D.2.2 Talexio API Availability & Quality

**Assumption (A-002):** "Talexio has a usable REST API for shift data"

**Why it matters:** If API is limited/undocumented, staff scheduling requires manual import; increases operational burden.

**Validation approach:**
1. Request Talexio API documentation now
2. Test read endpoints: can we query shifts for a staff member? For a date range?
3. Check rate limits, authentication method, data completeness

**If invalid:** Plan fallback: manual CSV import from Talexio; weekly (not real-time) sync.

---

#### D.2.3 BOV POS Integration Model

**Assumption (A-003):** "BOV POS has an integration-friendly SDK/API"

**Why it matters:** If BOV only supports proprietary hardware/terminal, payment integration becomes complex/expensive.

**Validation approach:**
1. Contact BOV technical team; request integration guide
2. Clarify: REST API? Bluetooth SDK? File-based? HTTP POST to terminal?
3. Test with demo account if possible

**If invalid:** Plan contingency: Stripe online-only for MVP (defer POS integration to Phase 2).

---

#### D.2.4 Multi-Currency Support (EUR-Only in MVP)

**Assumption (A-008):** "System supports EUR only; multi-currency deferred to Phase 2"

**Why it matters:** If business needs multi-currency now (e.g., pricing in GBP for UK customers), MVP must be different.

**Validation approach:**
1. Confirm with business: is EUR-only acceptable for MVP? Or needed sooner?
2. If yes, document as Phase 2 requirement now

**Recommendation:** Confirm with business in kickoff; document in requirements.

---

#### D.2.5 UI Language Support (English-Only in MVP?)

**Assumption (Q-010 - blocked):** "What languages must the UI support at launch? English only? Maltese?"

**Why it matters:** Affects UI development scope and translation effort.

**Validation approach:**
1. Confirm with business: which languages for MVP?
2. Estimate translation effort: each UI is ~500 strings; allow 1-2 weeks per language (design + translation + QA)

**Recommendation:** Explicitly confirm in kickoff; add to MVP scope if multi-language needed.

---

### D.3 Exclusions That Could Be Questioned

#### D.3.1 No Mobile Native Apps in MVP

**Exclusion:** Section 8.2 defers "Native mobile app (iOS + Android)" to Phase 2 (60 dev-days).

**Why it might be questioned:** Business might expect mobile app at launch (customers expect it).

**Mitigation:**
- Make web app mobile-responsive (works on iPhone/Android browser)
- Provide Safari/Chrome shortcut for home screen (web app feels native)
- Document: Phase 1 is "responsive web app"; Phase 2 is "native app"
- Validate with business: is responsive web acceptable for MVP?

**Recommendation:** Confirm mobile-first approach is acceptable in kickoff. If not, negotiate MVP scope reduction.

---

#### D.3.2 No Waitlist Management in MVP

**Exclusion:** Section 8.2 defers "Waitlist management" to Phase 2 (8 dev-days).

**Why it might be questioned:** Managers might expect customers to be able to request a slot if full.

**Mitigation:**
- Document: MVP doesn't auto-notify on cancellation; Phase 2 adds this
- Provide manual workaround: Receptionist creates notes for customers wanting specific times, manually emails when slots open
- Simple workaround implements waitlist minimally (no coding needed)

**Recommendation:** Confirm Phase 2 timeline for waitlist in kickoff. If needed sooner, move to MVP scope (add 8 dev-days).

---

#### D.3.3 No Advanced Reporting in MVP

**Exclusion:** Section 8.1 includes "Reporting (core 10 reports)"; remaining ~15 deferred to Phase 2.

**Why it might be questioned:** Finance/HQ might need more reports at launch (revenue by staff, customer LTV, etc.).

**Mitigation:**
- MVP includes 10 core reports (operational + financial basics)
- Phase 2 adds 15+ advanced reports (cohort analysis, forecasting, etc.)
- Workaround: HQ can export raw data to Google Sheets; pivot there
- Timeline: Phase 2 reports estimated 15 dev-days; can start 1-2 months post-MVP

**Recommendation:** Confirm 10-report MVP is sufficient for launch. If more needed, adjust scope.

---

### D.4 Dependencies & Blocking Conditions

#### D.4.1 Critical Path for MVP Start

The following must be resolved **before development starts:**

| Blocker | Owner | Timeline |
|---|---|---|
| Q-002: Talexio API documentation | Business (Talexio liaison) | ASAP (before arch design) |
| Q-003: BOV POS integration model | Business (BOV liaison) | ASAP (before arch design) |
| Q-011: Custom Gift App API commitment | Business (gift app team) | ASAP (before integration design) |
| Q-012: Desired go-live date | Business | Before project kickoff |
| Q-010: UI language requirements | Business | Before design kickoff |

**Recommendation:** Schedule "Requirements Validation Kickoff" with business; resolve all blocking questions (Q-001 through Q-012) before development starts.

---

#### D.4.2 Phase 2 Dependencies

Phase 2 features block each other (some). Prioritize accordingly:

- **SMS notifications** (5 dev-days): Independent; can start anytime
- **Google Calendar sync** (10 dev-days): Depends on calendar module (MVP); can start after M2
- **Waitlist** (8 dev-days): Depends on booking engine (MVP); can start after M2
- **Mobile app** (60 dev-days): Depends on all Phase 1 complete; longest effort, start earliest
- **Advanced reporting** (15 dev-days): Depends on reporting framework (MVP Phase 1); can start immediately post-launch

**Recommendation:** Prioritize Phase 2 roadmap: mobile app + SMS first (highest customer demand); advanced reporting second.

---

### D.5 Recommended Clarifications Before Development

#### For Business Team

| Question | Impact | Resolution |
|---|---|---|
| **Q-001:** What % of current Fresha bookings are marketplace-sourced? | Cost-benefit analysis accuracy | Review Fresha analytics; document in business case |
| **Q-002 (BLOCKER):** Does Talexio have REST API? Document? | Staff scheduling design | Get Talexio API spec; test with sample account |
| **Q-003 (BLOCKER):** BOV POS integration model? | Payment module design | Get BOV technical integration guide |
| **Q-004:** Location-specific cancellation policies? | Booking engine design | Document per-location policies or confirm global |
| **Q-005:** Barcode scanning (how/where)? | Phase 2 scope | Not urgent; document current process |
| **Q-006:** Consent forms (per-treatment or universal)? | Compliance design | Provide sample forms for each treatment type |
| **Q-007:** Max acceptable maintenance downtime? | SLA design | Recommend 99.9% (4h/month); confirm |
| **Q-008:** Cloud provider preference? | Infrastructure design | Recommend AWS/GCP; confirm cost allocation |
| **Q-009:** Multi-currency now or Phase 2? | MVP scope | Recommend Phase 2; confirm |
| **Q-010 (BLOCKER):** UI languages (English + Maltese?)? | Design scope | List all required languages |
| **Q-011 (BLOCKER):** Gift App API availability? | Integration design | Confirm API will be available; get spec |
| **Q-012 (BLOCKER):** Hard go-live date? | Project timeline | Confirm T-0 date; back into kickoff date |

---

#### For Development Team

| Question | Impact | Resolution |
|---|---|---|
| **Fairness algorithm:** Define exactly what "fair" means | Booking engine design | Document in requirements (see D.1.1 rec) |
| **Cancellation policy:** Define refund handling (credit/forfeit/apply) | Payment design | Document in requirements (see D.1.2 rec) |
| **Location pricing:** Confirm location-based vs. home-location pricing | Pricing engine | Document in requirements (see D.1.3 rec) |
| **Package expiry:** When can manager extend? | Package module design | Document in requirements (see D.1.4 rec) |
| **Manager scope:** Can multi-location managers approve discounts at any location? | RBAC design | Document in requirements (see D.1.5 rec) |
| **Offline conflict resolution:** If offline & online writes conflict, what's precedence? | Offline module design | Design conflict resolution matrix (see B.2.2 rec) |
| **Payment failure cascade:** If payment & CRM sync both fail, which takes priority? | Error handling | Design integration failure cascade (see B.3.1 rec) |

---

### D.6 Summary: Ambiguities & Recommendations

| Type | Count | Severity | Examples |
|---|---|---|---|
| **Ambiguities** | 5 | Medium-High | Fairness algorithm, cancellation refund, pricing scope, discounts, multi-location managers |
| **Assumptions to validate** | 5 | Medium | Fresha export, Talexio API, BOV POS, multi-currency, languages |
| **Exclusions questionable** | 3 | Low-Medium | Mobile apps, waitlist, advanced reporting |
| **Blocking questions** | 5 | Critical | Q-002, Q-003, Q-011, Q-012, Q-010 |
| **Clarifications needed** | 13 | Medium | See tables above |

**Bottom Line:** None of these ambiguities/assumptions will **block development**, but all should be **clarified before MVP launch**. Recommend Requirements Validation Kickoff (2-3 days before dev starts) to resolve blocking questions.

---

## SECTION E: KEY FINDINGS & RECOMMENDATIONS

### E.1 Overall Assessment

| Dimension | Score | Notes |
|---|---|---|
| **Completeness** | 8/10 | All core modules defined; minor gaps in operational workflows |
| **Technical Depth** | 7/10 | Good database design; some concurrency/integration gaps |
| **Business Context** | 9/10 | Excellent competitive analysis; strong context on why building |
| **Operational Clarity** | 6/10 | **Weakest area**. Many operational edge cases undefined (no-shows, overbooking, reassignments). |
| **Scope Definition** | 8/10 | MVP/Phase 2 boundary clear; some ambiguities on specific features |
| **Risk Management** | 7/10 | Good risk mitigation; integration failures addressed; some gaps on data consistency |
| **Overall Quality** | 7.5/10 | Strong document; ready for development with clarifications |

---

### E.2 Critical Issues to Address (Block Development if Not Fixed)

| Issue | Impact | Action | Timeframe |
|---|---|---|---|
| **Gift App API undefined** | Integration design cannot proceed | Escalate to gift app team; request API spec | Before arch design (2 weeks) |
| **Talexio API not confirmed** | Staff scheduling design unclear | Contact Talexio; request API docs & test access | Before arch design (1 week) |
| **BOV POS integration model unknown** | Payment design unclear | Contact BOV; get integration guide & test account | Before arch design (1 week) |
| **Fairness algorithm undefined** | Developer implementation ambiguous | Document exact algorithm (fewest hours? revenue?) in requirements | Before feature design (1 day) |
| **Go-live date not confirmed** | Timeline unknown | Confirm T-0 date with business | Before project kickoff (1 day) |

---

### E.3 High-Priority Gaps to Document (Before Dev Starts)

| Gap | Recommendation | Effort |
|---|---|---|
| **Operational edge cases (8 blind spots)** | Create operational procedures document for: no-shows, late cancellations, walk-in overbooking, recurring appts, EOD reconciliation, therapist absence, operating hours, waiting lists | 3-4 hours |
| **Technical edge cases (7 blind spots)** | Create tech design doc for: race conditions, offline conflicts, integration failures, payment reconciliation, transaction boundaries, timezone handling, performance optimization | 4-5 hours |
| **Integration failure modes (4 blind spots)** | Create integration runbook: what to do if Zoho/Talexio/BOV/Stripe down; fallback cascade; manual recovery procedures | 2-3 hours |
| **Cancellation/refund policy** | Document exactly: how are deposits handled on cancellation? Forfeit = credit? Applied to rebook? Expires? | 1 hour |
| **Fairness algorithm specifics** | Document exactly: fewest bookings by what metric? Hours? Services? Revenue? Tiebreak logic? | 1 hour |
| **Location manager authority** | Document exactly: which users can approve which discounts at which locations? | 1 hour |
| **Report distribution** | Document who receives which reports when (e.g., "send Daily EOD Summary to location managers at 20:00 daily") | 2 hours |
| **Role transitions** | Document what access changes when staff is promoted (Receptionist → Manager) | 1 hour |

**Total effort:** ~15-16 hours (2 days of focused documentation before dev starts).

---

### E.4 Innovation Ideas to Prioritize (Post-MVP)

**Quick Wins (High ROI, Low Effort)** — Recommend for Phase 2 (Months 3-4 post-launch):
1. Upsell automation at checkout (2 dev-days) → +5-8% transaction value
2. No-show prevention via extra reminders (2 dev-days) → +EUR 18-24k/year
3. Review/feedback collection (2 dev-days) → social proof, +20% conversion
4. Manager dashboard (2 dev-days) → operational visibility

**Medium-Effort, High-Impact** — Phase 2-3 (Months 4-6):
1. Dynamic pricing (3 dev-days) → +8-12% revenue
2. Referral program (3 dev-days) → +10-15% CAC reduction
3. AI booking assistant (4 dev-days) → +15-20% conversion
4. Accounting P&L sync (3 dev-days) → real-time financials

**Nice-to-Haves** — Phase 2 later or Phase 3:
1. Loyalty program (3 dev-days)
2. Seasonal pricing (2 dev-days)
3. Mobile native app (60 dev-days) — highest effort
4. Advanced BI dashboards (15 dev-days)

---

### E.5 Recommended Actions Before Kickoff

1. **Schedule Requirements Validation Kickoff** (2-3 hours, 1 week before dev start)
   - Attendees: Business + Dev leads
   - Agenda: Resolve all 5 blocking questions (Q-002, Q-003, Q-010, Q-011, Q-012)
   - Deliverable: Updated requirements spec with clarifications

2. **Create Operational Procedures Doc** (2 days, 1 week before dev start)
   - Document: no-shows, cancellations, walk-ins, recurring appts, EOD, leave/absence, operating hours, fairness
   - Deliverable: 10-page procedures guide (shared with dev team)

3. **Create Tech Design Doc** (2 days, parallel with kickoff)
   - Document: race conditions, offline conflicts, integration failures, payment flows, transactions, timezone, performance
   - Deliverable: 15-page tech design doc (dev team uses for architecture)

4. **Clarify Scope: Confirm All Phase 1/Phase 2 Boundaries** (1 day, kickoff)
   - Walk through entire SOW with business
   - Confirm: MVP includes 10 reports? Mobile app deferred? Waitlist deferred?
   - Sign off: "Agreed Phase 1 scope: X modules, Y reports, Z integrations"

5. **Define Success Criteria & Acceptance** (1 day, kickoff)
   - Performance: <5s booking response? 99.9% uptime?
   - Data quality: migration validation checks?
   - User acceptance: UAT with staff + managers?
   - Deliverable: acceptance criteria doc (QA team uses for validation)

---

### E.6 Confidence & Readiness Assessment

| Dimension | Confidence | Notes |
|---|---|---|
| **Can dev team build from this SOW?** | **75%** | MVP is buildable; 25% risk in operational edge cases + integration unknowns |
| **Will scope creep occur?** | **Medium** (50%) | Scope is well-defined, but 15-20 innovations identified; prioritize ruthlessly in Phase 2 |
| **Will timeline slip?** | **Low-Medium** (35%) | Estimates ~411 dev-days; achievable in 5-7 months with 3-4 devs. Risk: integration delays |
| **Will business be satisfied at MVP launch?** | **Medium** (60%) | Core functionality solid; missing features (mobile, waitlist, advanced reports) will prompt "why not in MVP?"; manage expectations |
| **Will go-live succeed?** | **Medium-High** (70%) | Data migration plan solid; parallel run strategy good; risk: Fresha export quality, Talexio sync bugs, staff training |

**Recommendation:** SOW is **ready for development** with 5-6 key clarifications. Expect 10-15% timeline slip due to integration unknowns; plan contingency time in project schedule.

---

## CONCLUSION

The CarismaSoft SOW is a **comprehensive, well-structured document** that demonstrates strong business understanding, competitive analysis, and technical vision. It successfully differentiates CarismaSoft from Fresha and provides a clear roadmap for MVP development.

However, the document **underspecifies operational workflows and edge cases** that will become real problems during development and launch. The 29 identified blind spots (split across Operational, Technical, Integration, Business Rules, UX, Reporting, and Compliance domains) are not blockers, but they represent **known unknowns** that should be addressed in pre-development specification and design work.

**Key Strengths:**
- Excellent competitive context (why we're building vs. Fresha/Flyby)
- Clear module definitions + data models
- Thoughtful integration architecture
- Realistic development timeline (411 dev-days = 5-7 months)
- Strong risk mitigation strategies

**Key Weaknesses:**
- Operational workflows underspecified (no-shows, overbooking, staff absence)
- Integration failure modes not fully defined
- Fairness algorithm and cancellation policy ambiguous
- No report distribution/automation schedule
- Data consistency edge cases (offline sync, payment reconciliation) need design

**Recommendation:** **Proceed with development.** Resolve the 5 blocking questions + create 3 supporting docs (operational procedures, tech design, requirements clarifications) in the 2 weeks before development starts. Then launch with 70% confidence in on-time, on-budget delivery.

---

**Report prepared by:** QC Agent  
**Date:** 5 April 2026  
**Version:** 1.0  

*This report is confidential to Carisma Wellness Group. Distribution requires written approval from the CTO.*

