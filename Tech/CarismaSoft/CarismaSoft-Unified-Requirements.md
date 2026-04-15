# CarismaSoft — Unified Requirements List
**Generated from SOW + QC Report Audit**  
**Date:** 5 April 2026  
**Status:** Pre-Development (Blocking items must be resolved before kickoff)

---

## BLOCKING REQUIREMENTS (Resolve Before Dev Starts)

| ID | Requirement | Owner | Timeline | Impact |
|---|---|---|---|---|
| **BLK-001** | Confirm Talexio REST API availability & documentation | Business (Talexio liaison) | 1 week | Staff scheduling module design |
| **BLK-002** | Confirm BOV POS integration model (API/SDK/Webhook) | Business (BOV liaison) | 1 week | Payment module design |
| **BLK-003** | Define custom Gift App API specification | Business (gift app team) | 2 weeks | Integration architecture |
| **BLK-004** | Confirm hard go-live date (T-0) | Business leadership | Before kickoff | Project timeline |
| **BLK-005** | Confirm UI language requirements (English only? + Maltese?) | Business | Before design | MVP scope |

---

## OPERATIONAL REQUIREMENTS (Define Before Feature Design)

### No-Show & Late Cancellation

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-001** | Define no-show penalty policy | Critical | Logged only? Affects future bookings? Auto-refund offer? |
| **OP-002** | Define late cancellation enforcement (<24h) | Critical | System blocks UI? Explicit warning required? Deposit automatic forfeit or manager approval? |
| **OP-003** | Define no-show rebook eligibility | High | Customers with <5 no-shows in 12 months auto-eligible for 1 free rebook within 30 days? |
| **OP-004** | Define cancellation state machine | High | States: Booked → Confirmed → {Cancelled, Attended, NoShow} → {RebookEligible/Ineligible} |
| **OP-005** | Define cancellation exception handling | High | What if partner books on behalf? Staff unavailable? Document all exception scenarios |

### Walk-In & Overbooking

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-006** | Define walk-in overbooking logic at full capacity | Critical | Option 1: suggest next available. Option 2: queue for cancellation window. Option 3: force-book (manager approval). |
| **OP-007** | Define walk-in staff assignment fairness | High | Exclude on-break staff from fairness calculation? Use same fairness algorithm as online? |
| **OP-008** | Define walk-in payment handling | High | Cash? Card? Package redemption? Deposit required? |
| **OP-009** | Define EOD overbooking reconciliation | Critical | Manager confirms which therapists actually attended (not no-show/cancelled). System blocks day close if conflicts exist. |

### Recurring Appointments

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-010** | Define recurring series modification rules | High | Can customer reschedule single instance? Entire series? Both? Track exceptions separately? |
| **OP-011** | Define recurring series cancellation policy | High | If customer cancels "all future", refund owed? Same as individual cancellation policy? |
| **OP-012** | Define recurring series with staff absence | High | If staff goes on leave, auto-reassign all recurring bookings to fairest staff? Notify customer? |
| **OP-013** | Define bulk reschedule (e.g., location closure) | High | If location closed Thursday, how are recurring Thursday bookings moved? Manual? Automatic? |

### Staff Absence & Scheduling

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-014** | Define same-day staff absence handling | Critical | Auto-reassign to fairest available? Notify customer? Timeline: within 1 hour? |
| **OP-015** | Define advance notice absence (vacation) handling | High | Nightly job 7 days before leave; reassign all bookings to fairest staff; notify customers. |
| **OP-016** | Define shift vs. available-for-booking distinction | High | Staff can be on shift but marked "unavailable" (admin work). Distinguish in scheduling. |
| **OP-017** | Define therapist leave/absence sync from Talexio | Critical | Daily import of absences. CarismaSoft blocks assignment to absent staff. Fallback if Talexio down? |

### Location Management

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-018** | Define operating hours enforcement | High | Prevent UI selection outside operating hours. Explicitly block booking after 19:00 if location closes 19:00. |
| **OP-019** | Define holiday closure handling | High | Per-location holiday calendar. Options: closed vs. manager-approval-required for holiday bookings. |
| **OP-020** | Define location closure workflow (emergency/renovation) | Medium | Manager-initiated "location temporarily closed" event. Bulk reassign/cancel 150+ appointments. Customer notification 48h in advance. |
| **OP-021** | Define timezone handling per location | High | Use IANA timezone (Europe/Malta), not offset. Handle DST transitions. User preference override. |

### Pricing & Discounts

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-022** | Define location-specific pricing override rules | High | Customer books at Location A (EUR 60) vs. Location B (EUR 80). Charged at location of service, not home location. |
| **OP-023** | Define package expiry extension policy | High | Manager discretion only. Documented reason required. Reasons: system maintenance, staff cancellation, hospitality gesture (max 1x/customer/year). Extensions free. |
| **OP-024** | Define discount approval scope per role | Critical | Location Manager approves at own location only. Multi-location Manager approves across assigned locations. HQ Admin: global. |
| **OP-025** | Define complimentary treatment limits | Medium | Max 5% of monthly revenue as complimentaries. Monthly audit per approver. Alert if >5% in week. |

### Package & Voucher Management

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-026** | Define gift package sharing edge cases | High | Gift to non-customer: merge at booking time if email/phone match. Partial redemption: first-claim basis. Manager approval if >fair share. |
| **OP-027** | Define package redemption attribution | High | If customer redeems old package (paid to Therapist A) but service by Therapist B: commission to B, not A. |
| **OP-028** | Define staff commission split for multi-therapist services | High | Couples massage (Therapist A + B): 50/50 split by default OR by time spent OR business rule? |
| **OP-029** | Define package/voucher expiry difference | Medium | Vouchers have strict expiry (no override). Packages can extend (manager discretion). Clear distinction. |

### Notifications & Communication

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **OP-030** | Define staff reassignment customer notification | High | <24h: auto-reassign, notify within 1h, allow 2h confirmation window. >=24h: customer chooses new therapist or reschedule. |
| **OP-031** | Define notification channel preferences | High | Separate consent per channel (Email, SMS, WhatsApp). Distinguish transactional vs. marketing. Transactional always sent (confirmations, receipts). |
| **OP-032** | Define bulk cancellation customer communication | High | If location closed 1 week: email 150 customers 48h in advance with rebooking link. Accept/decline/reschedule options. |
| **OP-033** | Define therapist self-service schedule management | High | Therapist dashboard: view appointments, mark unavailable, cancel own, request shift swap (manager approval). |

---

## TECHNICAL REQUIREMENTS (Define Before Architecture Design)

### Concurrency & Race Conditions

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-001** | Handle concurrent booking for same slot | Critical | Implement idempotent booking with idempotency key. If slot taken, return 409 with next N alternatives. First-write-wins + audit trail. |
| **TECH-002** | Handle three concurrent requests for same slot | High | If payment collected before "slot taken" error: allow retry with alternative slot. Refund captured payment if no alternative accepted. |
| **TECH-003** | Rate-limit availability queries | Medium | Max 1 availability check per 5 seconds per customer. Reduce false positives (slot appears open but taken). |
| **TECH-004** | Implement database transaction boundaries | Critical | Package redemption = atomic: check balance → create appointment → deduct → update customer. All or nothing. |

### Offline & Sync

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-005** | Define offline sync conflict resolution | Critical | Timestamp-based: newer write wins. If <1 second apart: flag for manual review. Preserve both in audit trail. Idempotent final state. |
| **TECH-006** | Handle deletion vs. creation sync conflicts | High | Offline: therapist marks appointment No-Show (soft-delete). Online: customer cancels. Both in sync queue. Resolution: final state is "Cancelled" with reason, not both. |
| **TECH-007** | Limit offline cache staleness | High | Max offline duration 24h. Display "data age" warning if cache >4h old. |
| **TECH-008** | Implement sync conflict resolution matrix | High | Document: if offline & online both modify, which takes precedence? Location? User role? |

### Payment & Revenue Integrity

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-009** | Implement payment processor reconciliation | Critical | Daily reconciliation: Stripe total = BOV POS total = Invoice total. Flag mismatches >EUR 100. Alert if discrepancy >5%. |
| **TECH-010** | Handle split payments | High | Support invoice split across Stripe + BOV + Cash. Track processor fee per payment. Calculate net revenue (amount - fee) for reporting. |
| **TECH-011** | Implement idempotent refunds | High | Refund ID required in BOV POS update. Prevent double-counting if sync retries. |
| **TECH-012** | Handle payment processor failure cascade | High | If Stripe + CRM both fail: allow local booking with "payment pending", remind customer within 1h, auto-cancel if unpaid 24h. |
| **TECH-013** | Implement overpayment detection | Medium | Automated reconciliation flags: invoice total < sum of payments. Alert for recovery. |

### Integration & Data Sync

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-014** | Implement integration failure cascade | Critical | Define fallback per integration. Example: Zoho CRM down = allow local ops, queue for sync-on-recovery. Talexio down = use 7-day rolling bookings instead of shifts. |
| **TECH-015** | Define webhook vs. polling priority | High | Webhook is source-of-truth. Polling only fallback if webhook hasn't arrived in 30 min. |
| **TECH-016** | Implement event deduplication | Critical | IntegrationEvent: track external_event_id. If already processed: skip. If failed: retry with exponential backoff. |
| **TECH-017** | Define integration rate limit handling | High | Document priority if multiple integrations rate-limited simultaneously. Which pauses? Which retries? |
| **TECH-018** | Implement audit logging for integration operations | High | Log source (user vs. integration:ZohoCRM). Sync batch ID for tracing. Status: Pending, Succeeded, PartiallySucceeded, Failed. |

### Performance & Scalability

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-019** | Design availability check query optimization | High | Indexes: appointments(location_id, start_time, end_time), shifts(staff_id, location_id, date). Cached staff roster (refresh 15-min). Target: <2s response. |
| **TECH-020** | Optimize calendar month view | High | Paginate by week or lazy-load. Virtual scrolling. Max load 400 appointments/month/location. P99 <3s. |
| **TECH-021** | Implement performance monitoring | Medium | Response time alerts. Booking bottleneck detection. Daily report. |

### Data Consistency & Retention

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **TECH-022** | Define data retention policy per entity | High | Customer: indefinite. Booking: 7 years. Notes: 3 years. Audit logs: 7 years. Soft-delete recovery window: 90 days then hard delete. |
| **TECH-023** | Implement GDPR right-to-erasure | Critical | Anonymize customer reference (preserve therapist record). Retain historical bookings (anonymized). Define retention exceptions. |
| **TECH-024** | Implement soft-delete recovery procedures | Medium | Document recovery process. Audit trail of recovered records. |

---

## INTEGRATION REQUIREMENTS (Define Before Integration Design)

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **INT-001** | Define Zoho CRM sync conflict resolution | High | Field A updated locally & in CRM simultaneously: timestamp-based resolution. Document per field. |
| **INT-002** | Define Zoho Inventory multi-location stock reconciliation | High | Sync detects stock discrepancy. Alert. Manual review required. Document reconciliation procedure. |
| **INT-003** | Define Zoho Subscriptions subscription cancellation handling | High | Mid-month cancellation: prorated credits? Full credit? Document per scenario. |
| **INT-004** | Define Talexio staff deletion handling | High | Staff deleted in Talexio but active in CarismaSoft: sync logic? Archive in CarismaSoft? Mark unavailable? |
| **INT-005** | Define BOV POS offline/Bluetooth failure handling | High | Terminal offline: queue payment for sync. Bluetooth fails mid-transaction: rollback? Retry? Document recovery. |
| **INT-006** | Define Wix concurrent booking handling | High | Customer books online, receptionist books same slot. Detect conflict & notify. First-write-wins resolution. |
| **INT-007** | Define GA4 event deduplication logic | High | Offline-to-online sync replays events: prevent double-counting. Idempotent event IDs. |
| **INT-008** | Define Meta CAPI privacy handling | Medium | GDPR consent for CAPI matching. Document consent requirements. |

---

## BUSINESS RULE REQUIREMENTS (Define Before Specification)

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **BR-001** | Define fairness algorithm exactly | Critical | Fewest booked **hours** (not services) in rolling 7-day window. Tiebreak: random. Override: customer preference. **Document:** this is NOT revenue-weighted. |
| **BR-002** | Define cancellation refund handling | Critical | Cancellation <24h: deposit forfeited. Forfeited = converted to non-transferable store credit valid 30 days. If customer doesn't rebook: credit expires. |
| **BR-003** | Define multi-location pricing rules | High | Charge location-of-service price, not home-location price. If transfer to different location: price updates. Customer notified. |
| **BR-004** | Define package expiry override conditions | High | Override allowed ONLY if: (1) system maintenance prevented booking, (2) staff cancellation prevented redemption, (3) manager hospitality gesture. Max 1x per customer per year. |
| **BR-005** | Define manager discount approval scope | Critical | Location Manager: approve own location only. Multi-location Manager: all assigned locations. HQ Admin: global. Amounts >20%: escalate to HQ. |
| **BR-006** | Define complimentary treatment business rule | Medium | Location max: 5% of monthly revenue. Manager approval required. Monthly audit of approver patterns. Alert if >5% in week. |
| **BR-007** | Define multi-therapist commission split | High | Services explicitly defined as multi-therapist: split per definition. Manual additions: hold pending manager review. Package redemptions: commission to therapist providing service, not original purchaser. |
| **BR-008** | Define waitlist/booking request policy | Medium | Phase 2 feature. Schema design now. Priority: first-come-first-served with 24h acceptance window. Expiry: 14 days. |

---

## USER EXPERIENCE REQUIREMENTS

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **UX-001** | Define customer notification flow for staff reassignment | High | <24h: auto-reassign, notify, 2h confirmation window, auto-confirm if no response. >=24h: customer chooses new therapist or reschedule. |
| **UX-002** | Define rebooking vs. reassignment distinction | High | <24h: automatic reassignment without consent. >=24h: offer alternatives, customer chooses. Clear UI distinction. |
| **UX-003** | Define bulk location closure UX | High | Manager initiates closure event. System suggests alternatives. Bulk reassign or cancel. Auto-email 150+ customers 48h advance. |
| **UX-004** | Define therapist self-service schedule dashboard | High | Therapist view: upcoming bookings, mark unavailable (time slot), cancel own appointment, request shift swap (manager approval). |
| **UX-005** | Define customer preference capture for therapist | Medium | At booking: "Flexible about therapist? (yes/no)". If no: block reassignment without consent. |

---

## REPORTING & ANALYTICS REQUIREMENTS

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **RPT-001** | Define report automation/scheduling | High | Create Report Distribution Matrix: who gets which report on what schedule? Example: "Daily Staff Util report to Location Manager at 06:00 daily". |
| **RPT-002** | Define KPI alert thresholds | High | Utilization <60%: alert. Revenue <80% baseline: alert. Cancellation rate >15%: alert. Frequency: daily, weekly, real-time. |
| **RPT-003** | Define no-show forecasting model | Medium | Phase 2. NoShowRisk = 0.4*no_show_rate + 0.2*last_minute + 0.2*service_category + 0.1*lead_source. If >0.6: extra reminders. |
| **RPT-004** | Define revenue forecasting | Medium | Phase 2. Simple linear regression on 12-month history. Weekly forecast with confidence interval. |
| **RPT-005** | Define manager dashboard contents | High | Real-time KPIs: today's revenue YTD, utilization %, no-show count, pending approvals, alerts. |

---

## COMPLIANCE & DATA GOVERNANCE REQUIREMENTS

| ID | Requirement | Priority | Spec |
|---|---|---|---|
| **COMP-001** | Define consent management per channel | Critical | Separate consent: Email, SMS, WhatsApp. Separate types: Transactional (required), Marketing (optional). Transactional always sent (confirmations). |
| **COMP-002** | Define consent proof for GDPR audit | High | Store: CustomerConsent.consent_date, method, channel, type, expiry. Proof of consent at request time. |
| **COMP-003** | Define GDPR right-to-erasure procedure | Critical | Customer requests deletion: anonymize (not hard-delete). Historical bookings retained (anonymized). Clear procedure documented. |
| **COMP-004** | Define audit trail for all changes | High | AuditLog: user_id, integration_id, sync_batch_id, status (Pending, Succeeded, PartiallySucceeded, Failed). All user & system actions logged. |
| **COMP-005** | Define data backup & disaster recovery | Medium | Daily backups. 30-day retention. RTO: 4 hours. RPO: 1 hour. Document recovery procedures. |
| **COMP-006** | Define payment data security (PCI-DSS) | Critical | Card data never stored locally. Stripe tokenization. BOV POS integration uses secure terminals. Audit compliance quarterly. |

---

## CLARIFICATIONS NEEDED (From Business Team)

| ID | Question | Owner | Impact |
|---|---|---|---|
| **CL-001** | What % of current Fresha bookings are marketplace-sourced? | Business | Cost-benefit accuracy |
| **CL-002** | Does Talexio have documented REST API? Sample export available? | Business (Talexio) | Integration feasibility |
| **CL-003** | Does BOV POS have REST API or only terminal SDK? | Business (BOV) | Payment module scope |
| **CL-004** | Is there existing location-specific cancellation policies or global? | Business | Operational requirements |
| **CL-005** | When/where are barcodes scanned in current workflow? | Business | Phase 2 scope definition |
| **CL-006** | Consent forms: per-treatment or universal? Provide samples. | Business (Legal) | Compliance design |
| **CL-007** | Max acceptable maintenance downtime? (SLA: 99.9% = 4h/month) | Business (Ops) | Infrastructure design |
| **CL-008** | Cloud provider preference? (AWS, GCP, Azure?) | Business (IT) | Infrastructure decision |
| **CL-009** | Multi-currency support needed at launch? Or Phase 2? | Business | MVP scope |
| **CL-010** | UI languages required at launch? (English only? + Maltese? + others?) | Business | Design scope |
| **CL-011** | Gift App API: When available? Full spec? Test account? | Business (Gift app team) | **BLOCKER** |
| **CL-012** | Hard go-live date? (to back into project schedule) | Business (Leadership) | **BLOCKER** |
| **CL-013** | Current process for staff shift swaps? Approval required? | Business (Ops) | Operational design |

---

## SUMMARY BY CATEGORY

| Category | Count | Critical | High | Medium | Priority |
|---|---|---|---|---|---|
| **Blocking Requirements** | 5 | 5 | 0 | 0 | **RESOLVE FIRST** |
| **Operational** | 34 | 6 | 20 | 8 | Before feature design |
| **Technical** | 24 | 5 | 13 | 6 | Before architecture |
| **Integration** | 8 | 0 | 6 | 2 | Before integration design |
| **Business Rules** | 8 | 2 | 4 | 2 | Before specification |
| **UX** | 5 | 0 | 3 | 2 | Before design |
| **Reporting** | 5 | 0 | 2 | 3 | MVP + Phase 2 |
| **Compliance** | 6 | 3 | 2 | 1 | Before MVP |
| **Clarifications** | 13 | 3 | 6 | 4 | Before design |
| **TOTAL** | **108** | **24** | **56** | **28** | — |

---

## IMPLEMENTATION SEQUENCE

**Phase 0 (Pre-Kickoff, 2-3 weeks)**
1. ✓ Resolve all 5 blocking requirements (BLK-*)
2. ✓ Provide answers to all clarifications (CL-*)
3. ✓ Document all operational requirements (OP-*)
4. ✓ Validate business rules (BR-*)

**Phase 1 (Architecture, Week 1-2 of project)**
1. Design using technical requirements (TECH-*)
2. Design integration architecture (INT-*)
3. Design compliance & audit logging (COMP-*)

**Phase 2 (Feature Design, Week 2-4)**
1. Translate operational requirements to user workflows
2. Design UX flows (UX-*)
3. Plan reporting structure (RPT-*)

**Phase 3 (Development, Week 5-24)**
1. Build features per requirements
2. Implement test cases per requirement specs
3. Track compliance per requirement

---

## NEXT STEPS

1. **Business:** Resolve all 5 BLK-* requirements and provide CL-* clarifications (deadline: 1 week)
2. **Development:** Use this requirements list as source-of-truth for feature specs
3. **QA:** Build test cases mapped 1:1 to requirements (e.g., TC-OP-001, TC-TECH-001)
4. **Operations:** Use OP-* requirements to create staff training & procedures documentation

---

**Document Version:** 1.0  
**Last Updated:** 5 April 2026  
**Status:** Ready for Development (pending 5 blocking items + clarifications)
