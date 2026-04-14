# CarismaSoft Statement of Work

**Document ID:** CS-SOW-2026-001
**Version:** 1.0
**Date:** 5 April 2026
**Author:** CTO Office, Carisma Wellness Group
**Classification:** Confidential -- For Internal & Vendor Use Only

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Competitive Feature Matrix](#2-competitive-feature-matrix)
3. [Functional Requirements Specification](#3-functional-requirements-specification)
4. [Integration Architecture](#4-integration-architecture)
5. [Technical Requirements](#5-technical-requirements)
6. [Modules in Detail](#6-modules-in-detail)
7. [Migration Strategy](#7-migration-strategy)
8. [Development Phases & Timeline](#8-development-phases--timeline)
9. [Cost of Ownership Analysis](#9-cost-of-ownership-analysis)
10. [Open Questions & Assumptions](#10-open-questions--assumptions)
11. [Appendices](#11-appendices)

---

# 1. Executive Summary

## 1.1 Why We Are Building CarismaSoft

Carisma Wellness Group operates three verticals -- Carisma Spa & Wellness, Carisma Aesthetics, and Carisma Slimming -- across 13 locations (9 spa sites + 4 clinics) in Malta. The business processes approximately 400 bookings per day, manages roughly 45 staff members, and serves thousands of customers through a unified brand experience.

Today the operation runs on Fresha, a general-purpose salon and spa booking platform. Fresha has served the business adequately during its growth phase, but its limitations now impose material constraints on operational efficiency, financial performance, and strategic flexibility:

**Financial drag.** Fresha charges a 20% commission on marketplace-sourced bookings and EUR 14.95 per team member per month. At Carisma's current scale (45 staff, 13 locations), the recurring software cost alone exceeds EUR 8,000/year before commission. More critically, the marketplace commission model creates a perverse incentive where the platform benefits from disintermediating the direct brand relationship.

**Integration ceiling.** Carisma's technology stack spans the Zoho ecosystem (CRM, Books, Inventory, Analytics, Subscriptions), Talexio payroll, Klaviyo email marketing, Stripe/BOV payment processing, and a custom gift management application. Fresha offers no native integrations to any of these systems and provides no Zapier or Mailchimp connectivity. Every data sync is manual, creating reconciliation overhead and data-integrity risk.

**Customization constraints.** Fresha is designed for single-location salons and small chains. It cannot enforce the business rules that Carisma requires: mandatory treatment attendance confirmation before EOD close, manager-approved discount thresholds, cross-location staff conflict prevention, multi-brand notification templates, or audit trails for compliance.

**Vendor lock-in.** Fresha requires its proprietary payment hardware (EUR 499 per terminal), locks payment processing to its own gateway, and retains marketplace ownership of customer relationships.

CarismaSoft is the purpose-built alternative: a custom business management system that integrates natively with the existing technology stack, enforces Carisma's specific business rules, and eliminates recurring platform fees in favor of a one-time development investment with predictable maintenance costs.

## 1.2 What We Learned from Competitive Analysis

Two platforms were analysed in depth to inform the CarismaSoft specification:

**Fresha** (current platform) -- The market leader in beauty and wellness booking, serving 130,000+ businesses with over 1 billion appointments booked. Strengths: real-time booking engine, calendar sync, automated notifications, proven uptime (99.9%+). Weaknesses: 20% marketplace commission, hardware lock-in, no ecosystem integration (no Zapier, Mailchimp, or accounting software connectors), no offline mode, limited customization, per-team-member pricing that scales linearly.

**Flyby/Lapis** (Turkish platform) -- An enterprise-grade system with 27 years of field experience across 400+ facilities in 20+ countries. Strengths: native hotel PMS integration (Opera, Fidelio, Protel), staff commission automation, waitlist management, group class scheduling. Weaknesses: custom pricing (non-transparent), limited third-party ecosystem beyond hospitality, no documented offline mode, enterprise-sales model unsuitable for mid-market.

**Key competitive insight:** Both platforms are general-purpose tools optimized for broad market appeal. Neither addresses the specific combination of multi-location wellness management, Zoho ecosystem integration, strict audit/compliance controls, and the multi-brand, multi-vertical model that Carisma operates. CarismaSoft does not need to replicate every feature of these platforms; it needs to exceed them in the areas that matter to this business.

## 1.3 How CarismaSoft Differentiates

| Differentiator | Fresha/Flyby | CarismaSoft |
|---|---|---|
| Zoho ecosystem integration | None | Native bi-directional sync with CRM, Inventory, Subscriptions, Analytics |
| Business rule enforcement | Generic | Custom: EOD lock, discount approval, mandatory audit notes |
| Multi-brand support | Single brand | Three verticals with distinct brand voices, templates, workflows |
| Payment flexibility | Locked to platform gateway | Stripe, BOV POS, Revolut, PayPal -- vendor choice |
| Commission model | 20% marketplace fee | Zero commission; one-time build + maintenance |
| Offline capability | None | View schedule + manage bookings offline with sync-on-reconnect |
| Staff scheduling | Basic | Talexio payroll integration, cross-location conflict prevention |
| Data ownership | Platform-controlled | Full ownership, EU-resident, GDPR-compliant |

## 1.4 Business Context

| Metric | Value |
|---|---|
| Locations | 13 (9 spa + 4 clinic) |
| Staff | ~45 |
| Daily bookings | ~400 |
| Verticals | Spa, Aesthetics, Slimming |
| Core stack | Zoho CRM, Books, Inventory, Analytics, Subscriptions |
| Payments | Stripe, BOV POS, Revolut, PayPal |
| Payroll | Talexio |
| Marketing | Klaviyo, Meta Ads, Google Ads |
| Website | Wix + custom booking forms |
| Performance target | <5s booking response, 99.9% uptime, zero double-bookings |

---

# 2. Competitive Feature Matrix

## 2.1 Feature Comparison

| Feature | Fresha | Flyby/Lapis | CarismaSoft (MVP) |
|---|---|---|---|
| **Booking Engine** | | | |
| Online booking | Yes | Yes | Yes |
| Internal booking | Yes | Yes | Yes |
| Walk-in support | Yes | Yes | Yes |
| Real-time availability | Yes | Yes | Yes |
| Double-booking prevention | Yes | Yes | Yes (algorithm-enforced) |
| Staff fairness/load balancing | No | Unknown | Yes |
| Manual overbooking override | No | Unknown | Yes |
| Waitlist management | No | Yes | Phase 2 |
| Group class scheduling | No | Yes | Not planned |
| **Calendar** | | | |
| Day/Week/Month views | Yes | Yes | Yes |
| Drag-and-drop rescheduling | Yes | Yes | Yes |
| Per-location filtering | Limited | Yes | Yes |
| Global HQ view | No | Yes | Yes |
| Staff + room-level visibility | Staff only | Both | Both |
| Google/Apple/Outlook sync | Yes | Unknown | Phase 2 |
| **Multi-Location** | | | |
| Unified customer database | Yes | Yes | Yes |
| Location-specific pricing | Yes | Yes | Yes |
| Location-specific services | Yes | Yes | Yes |
| Cross-location staff scheduling | Limited | Yes | Yes |
| Staff conflict prevention | No | Unknown | Yes |
| Fairness distribution | No | Unknown | Yes |
| **Packages/Memberships** | | | |
| Prepaid packages | Yes | Yes | Yes |
| Memberships/subscriptions | Yes | Yes | Yes |
| Gift vouchers | Yes | Yes | Yes |
| Partial redemption | Yes | Yes | Yes |
| Cross-user sharing | No | Unknown | Yes |
| Cross-location validity | Limited | Yes | Yes |
| Expiry + override | Limited | Unknown | Yes |
| **Customer Profile** | | | |
| Unified cross-location profile | Yes | Yes | Yes |
| Booking history | Yes | Yes | Yes |
| Notes/images/consent | Limited | Yes | Yes |
| Lead source tracking | No | No | Yes |
| Tags/segmentation | Limited | Unknown | Yes |
| **Payments** | | | |
| Online card payments | Yes (locked) | Yes | Yes (Stripe, flexible) |
| In-store POS | Yes (locked hardware) | Yes | Yes (BOV POS, flexible) |
| Deposit/advance payment | Yes | Yes | Yes |
| Multi-gateway support | No | Limited | Yes |
| **Notifications** | | | |
| Email | Yes | Yes | Yes |
| SMS | Yes | Yes | Phase 2 |
| WhatsApp | No | Unknown | Yes |
| Brand-specific templates | No | Unknown | Yes |
| **Roles & Permissions** | | | |
| Basic role-based access | Yes | Yes | Yes |
| Configurable permission matrix | Limited | Yes | Yes |
| Discount approval workflows | No | Unknown | Yes |
| Audit trail | Limited | Unknown | Yes (comprehensive) |
| **Offline Mode** | | | |
| View schedule offline | No | No | Yes |
| Manage bookings offline | No | No | Yes (basic) |
| Sync on reconnect | N/A | N/A | Yes |
| **Integrations** | | | |
| Zoho CRM | No | No | Yes (native) |
| Zoho Inventory | No | No | Yes (native) |
| Zoho Subscriptions | No | No | Yes (native) |
| Zoho Analytics | No | No | Yes (native) |
| Talexio payroll | No | No | Yes |
| Hotel PMS (Opera/Fidelio) | No | Yes (native) | Not planned |
| Google Analytics 4 | No | No | Yes |
| Meta Ads conversion | No | No | Yes |
| Zapier/API ecosystem | No | Limited | REST API layer |
| Stripe | Platform gateway | Unknown | Yes (native) |

## 2.2 Integration Ecosystem Comparison

| Integration | Fresha | Flyby/Lapis | CarismaSoft |
|---|---|---|---|
| Accounting software | None | None | Zoho Books (native) |
| CRM | None | None | Zoho CRM (native) |
| Inventory | None | None | Zoho Inventory (native) |
| Email marketing | None | None | Klaviyo (via API) |
| Payment processing | Locked to Fresha | Custom gateways | Stripe, BOV, Revolut, PayPal |
| Payroll | None | None | Talexio (bi-directional) |
| Analytics | Built-in only | Built-in only | Zoho Analytics, GA4, Meta CAPI |
| Hotel PMS | None | Opera/Fidelio/Protel | Not planned |
| Website | Fresha widget | Custom | Wix embed + API |
| API access | GraphQL (limited) | Custom | REST API (full) |

## 2.3 Pricing/Cost Model Comparison

| Cost Element | Fresha | Flyby/Lapis | CarismaSoft |
|---|---|---|---|
| Base software fee | EUR 14.95/mo (Independent) | Custom quote | One-time development |
| Per-team-member fee | EUR 9.95-14.95/mo | Included in quote | None |
| Marketplace commission | 20% on marketplace bookings | None | None |
| Transaction fee | 1.29% + EUR 0.20 | Unknown | Stripe standard (1.5%+) |
| Hardware requirement | EUR 499/terminal | Unknown | Use existing hardware |
| Annual cost at Carisma scale | EUR 8,000-12,000+ (excl. commission) | Unknown (est. EUR 15,000-30,000) | Maintenance only |
| 3-year TCO | EUR 24,000-36,000+ commissions | Est. EUR 45,000-90,000 | Development + EUR 12,000-18,000 maintenance |

---

# 3. Functional Requirements Specification

## 3.1 Module 1: Customer Relationship Management (CRM)

### 3.1.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| CRM-001 | Customer profile CRUD | P0 | Create, read, update, soft-delete customer records |
| CRM-002 | Custom fields | P0 | Admin-configurable additional fields per customer |
| CRM-003 | Booking history view | P0 | Full history across all locations, services, staff |
| CRM-004 | Package/membership status | P0 | Current active packages, credits remaining, expiry |
| CRM-005 | Customer segmentation | P1 | VIP, frequent visitor, active/inactive, by service, by location |
| CRM-006 | Notes & attachments | P1 | Free-text notes, before/after images, consent form uploads |
| CRM-007 | Lead source tracking | P1 | Track where customer originated (walk-in, website, social, referral) |
| CRM-008 | Tags | P1 | Flexible tagging system for custom segmentation |
| CRM-009 | Guest type classification | P1 | Hotel guest, local, tourist, corporate, etc. |
| CRM-010 | Therapist preference | P1 | Record preferred therapist per customer |
| CRM-011 | Zoho CRM sync | P0 | Bi-directional real-time sync with Zoho CRM |
| CRM-012 | Merge duplicates | P1 | Detect and merge duplicate customer records |

### 3.1.2 Data Model

```
Customer {
  id: UUID (primary key)
  first_name: String (required)
  last_name: String (required)
  email: String (unique, nullable)
  phone: String (required)
  phone_secondary: String (nullable)
  date_of_birth: Date (nullable)
  gender: Enum (Male, Female, Other, Prefer not to say)
  address: Address (embedded object)
  lead_source: Enum (Walk-in, Website, Instagram, Facebook, Google, Referral, Phone, Other)
  guest_type: Enum (Local, Hotel Guest, Tourist, Corporate)
  preferred_therapist_id: FK -> Staff (nullable)
  tags: String[] (array)
  vip_status: Boolean (default false)
  status: Enum (Active, Inactive, Blacklisted)
  notes: Text (nullable)
  consent_forms: File[] (array of uploaded documents)
  images: File[] (before/after images)
  custom_fields: JSON (flexible key-value)
  zoho_crm_id: String (external reference)
  created_at: Timestamp
  updated_at: Timestamp
  created_by: FK -> User
  updated_by: FK -> User
}
```

### 3.1.3 Validation Rules

- Phone number is mandatory; email is optional but recommended
- Duplicate detection on phone + email before creation (fuzzy match)
- Customer status changes logged to audit trail
- Soft delete only; hard delete requires Admin role + documented reason
- All profile edits logged with before/after values

### 3.1.4 Edge Cases

- Customer visits multiple locations: single unified profile, multi-location booking history
- Customer has no email: SMS/WhatsApp becomes primary communication channel
- Duplicate customers discovered after bookings created: merge tool must reassign all historical bookings to surviving record
- Customer requests data deletion (GDPR): anonymize rather than delete; retain financial records with anonymized references

---

## 3.2 Module 2: Appointment Management & Calendar

### 3.2.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| APT-001 | Calendar views | P0 | Day, week, month views with location filter |
| APT-002 | Drag-and-drop | P0 | Reschedule by dragging appointment to new slot |
| APT-003 | Create booking | P0 | Select customer, service, staff, time, location |
| APT-004 | Status tracking | P0 | Inquiry -> Booked -> Attended -> Paid |
| APT-005 | Cancellation workflow | P0 | Reason required, cancellation policy enforcement |
| APT-006 | No-show management | P0 | Mark no-show, track pattern, apply penalties |
| APT-007 | Multi-service booking | P1 | Book multiple services in single appointment |
| APT-008 | Recurring appointments | P1 | Schedule repeating bookings (weekly, biweekly, monthly) |
| APT-009 | Walk-in booking | P0 | Quick-add without prior appointment |
| APT-010 | Booking filters | P0 | Filter by location, treatment, staff, status, date range |
| APT-011 | Online booking | P0 | Accept bookings from website widget |
| APT-012 | Availability display | P0 | Show available slots in real-time |
| APT-013 | EOD lock | P0 | Cannot close day without all bookings resolved |
| APT-014 | Rebooking prompt | P1 | Prompt to rebook at checkout |

### 3.2.2 Booking Status State Machine

```
Inquiry -> Booked -> Confirmed -> In-Progress -> Attended -> Paid -> Closed
                 \-> Cancelled (requires reason + approver)
                 \-> No-Show (triggers penalty workflow)
                 \-> Rescheduled -> Booked (new time slot)
```

Constraints:
- Only staff with role >= Receptionist can create bookings
- Cancellation within 24 hours: free. After: deposit forfeited.
- All cancellations require a written reason
- Deletion of a booking record (distinct from cancellation) requires Manager role + documented reason
- EOD report generation blocked if any booking remains in Booked/Confirmed/In-Progress status

### 3.2.3 Data Model

```
Appointment {
  id: UUID
  customer_id: FK -> Customer (required)
  location_id: FK -> Location (required)
  service_id: FK -> Service (required)
  staff_id: FK -> Staff (nullable for unassigned)
  room_id: FK -> Room (nullable)
  start_time: Timestamp (required)
  end_time: Timestamp (computed from service duration)
  status: Enum (Inquiry, Booked, Confirmed, InProgress, Attended, Paid, Closed, Cancelled, NoShow, Rescheduled)
  booking_source: Enum (Internal, Website, Instagram, Facebook, Phone, WalkIn)
  deposit_amount: Decimal (nullable)
  deposit_paid: Boolean (default false)
  cancellation_reason: Text (nullable, required if status=Cancelled)
  cancellation_approved_by: FK -> User (nullable)
  cancellation_timestamp: Timestamp (nullable)
  notes: Text (nullable)
  package_id: FK -> Package (nullable, if redeemed from package)
  voucher_id: FK -> Voucher (nullable)
  discount_amount: Decimal (nullable)
  discount_approved_by: FK -> User (nullable, required if discount > threshold)
  online_payment_reference: String (nullable)
  created_at: Timestamp
  updated_at: Timestamp
  created_by: FK -> User
  updated_by: FK -> User
}
```

---

## 3.3 Module 3: Staff Roster Management

### 3.3.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| STF-001 | Staff profiles | P0 | Name, role, qualifications, service capabilities |
| STF-002 | Availability tracking | P0 | Real-time availability by time slot and location |
| STF-003 | Shift management | P0 | Assign shifts per location per day |
| STF-004 | Multi-location support | P0 | Staff can work at multiple locations |
| STF-005 | Cross-location conflict prevention | P0 | Prevent double-scheduling across locations |
| STF-006 | Talexio sync | P0 | Import/export shift data from Talexio payroll |
| STF-007 | Service capability mapping | P0 | Track which services each staff member can perform |
| STF-008 | Utilization tracking | P1 | Booked hours vs available hours per staff member |
| STF-009 | Qualifications/certifications | P1 | Track expiry dates, alert on upcoming expirations |
| STF-010 | Fairness algorithm | P1 | Distribute bookings equitably among qualified staff |

### 3.3.2 Data Model

```
Staff {
  id: UUID
  first_name: String (required)
  last_name: String (required)
  email: String (required)
  phone: String (required)
  role: Enum (Therapist, Doctor, SlimmingConsultant, Receptionist, Manager, Admin)
  locations: FK[] -> Location (many-to-many)
  services: FK[] -> Service (many-to-many, defines capability)
  certifications: Certification[] (embedded array)
  talexio_id: String (external reference)
  status: Enum (Active, Inactive, OnLeave)
  created_at: Timestamp
  updated_at: Timestamp
}

Shift {
  id: UUID
  staff_id: FK -> Staff (required)
  location_id: FK -> Location (required)
  date: Date (required)
  start_time: Time (required)
  end_time: Time (required)
  break_start: Time (nullable)
  break_end: Time (nullable)
  source: Enum (Manual, Talexio)
  status: Enum (Scheduled, Confirmed, Completed, Absent)
}
```

### 3.3.3 Business Rules

- A staff member cannot have overlapping shifts across any locations
- Booking a service automatically reduces that staff member's available capacity
- If Talexio marks a staff member as absent, all their appointments for that day must be flagged for reassignment
- The fairness algorithm distributes bookings to the least-utilized qualified staff member within a configurable window (e.g., rolling 7 days)

---

## 3.4 Module 4: Services, Products & Packages

### 3.4.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| SVC-001 | Service catalog | P0 | Full treatment catalog with descriptions, durations, categories |
| SVC-002 | Location-specific pricing | P0 | Different prices per location for same service |
| SVC-003 | Location availability | P0 | Control which services are offered at which locations |
| SVC-004 | Package management | P0 | Create prepaid multi-session packages |
| SVC-005 | Membership management | P0 | Monthly subscriptions with included treatment credits |
| SVC-006 | Gift vouchers | P0 | Issue, track, redeem gift vouchers |
| SVC-007 | Partial redemption | P0 | Use part of a package in one visit |
| SVC-008 | Cross-location validity | P0 | Packages/vouchers redeemable at any location |
| SVC-009 | Expiry management | P0 | Auto-expire with manual override capability |
| SVC-010 | Retail products | P1 | Product catalog with pricing, inventory tracking |
| SVC-011 | Cross-user sharing | P1 | Transfer package credits between customers |
| SVC-012 | Cross-service splitting | P1 | Redeem package sessions for different services at pro-rata value |
| SVC-013 | Zoho Inventory sync | P0 | Sync retail product data bi-directionally |
| SVC-014 | Zoho Subscriptions sync | P0 | Sync membership billing and credit allocation |

### 3.4.2 Data Model

```
Service {
  id: UUID
  name: String (required)
  description: Text
  category: Enum (Spa, Aesthetics, Slimming)
  sub_category: String
  duration_minutes: Integer (required)
  buffer_minutes: Integer (default 0, cleanup/setup time)
  requires_room: Boolean (default false)
  room_type: String (nullable)
  status: Enum (Active, Inactive)
}

ServicePricing {
  id: UUID
  service_id: FK -> Service
  location_id: FK -> Location
  price: Decimal (required)
  currency: String (default "EUR")
  effective_from: Date
  effective_to: Date (nullable)
}

Package {
  id: UUID
  name: String
  description: Text
  services: PackageService[] (service_id + quantity)
  total_price: Decimal
  valid_days: Integer (days from purchase)
  shareable: Boolean (default false)
  cross_location: Boolean (default true)
  status: Enum (Active, Expired, Redeemed, Cancelled)
}

CustomerPackage {
  id: UUID
  customer_id: FK -> Customer
  package_id: FK -> Package
  purchase_date: Date
  expiry_date: Date (computed)
  sessions_remaining: JSON (service_id -> count)
  amount_paid: Decimal
  status: Enum (Active, Expired, Redeemed, Cancelled)
  override_expiry: Date (nullable, admin override)
}

Voucher {
  id: UUID
  code: String (unique)
  type: Enum (Fixed, Percentage, Service)
  value: Decimal
  remaining_value: Decimal
  customer_id: FK -> Customer (nullable for bearer vouchers)
  valid_from: Date
  valid_to: Date
  redeemable_locations: FK[] -> Location (empty = all)
  status: Enum (Active, PartiallyRedeemed, Redeemed, Expired, Cancelled)
}
```

---

## 3.5 Module 5: Payments & Billing

### 3.5.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| PAY-001 | In-store payment | P0 | Trigger payment request to POS terminal |
| PAY-002 | Online payment | P0 | Stripe integration for website bookings |
| PAY-003 | Deposit collection | P0 | Collect advance deposit at booking time |
| PAY-004 | Payment status tracking | P0 | Unpaid, Partial, Paid, Refunded |
| PAY-005 | Invoice generation | P0 | Auto-generate invoice on payment |
| PAY-006 | Cancellation policy | P0 | Free cancellation >24h; deposit forfeited <=24h |
| PAY-007 | Refund processing | P0 | Issue refunds with Manager approval |
| PAY-008 | Multi-payment split | P1 | Split payment across methods (card + cash + voucher) |
| PAY-009 | Membership billing | P0 | Sync with Zoho Subscriptions for recurring billing |
| PAY-010 | Package payment | P0 | Full payment at package purchase, track redemption |
| PAY-011 | Discount application | P0 | Apply discounts with audit trail and approval workflow |
| PAY-012 | Complimentary tracking | P0 | Track free treatments with mandatory management note |
| PAY-013 | EOD reconciliation | P0 | Daily revenue reconciliation before day close |

### 3.5.2 Discount Approval Workflow

```
Staff applies discount
  |
  +--> Discount <= 10%: Auto-approved, logged
  |
  +--> Discount 11-20%: Requires Manager approval (in-app)
  |
  +--> Discount > 20%: Requires Admin approval (in-app)
  |
  +--> Complimentary (100%): Requires Manager approval + mandatory note
```

All discount events logged with: who applied, amount/percentage, reason, who approved, timestamp.

### 3.5.3 Payment Data Model

```
Invoice {
  id: UUID
  appointment_id: FK -> Appointment
  customer_id: FK -> Customer
  location_id: FK -> Location
  line_items: InvoiceLineItem[]
  subtotal: Decimal
  discount_amount: Decimal
  discount_reason: Text (nullable)
  discount_approved_by: FK -> User (nullable)
  tax_amount: Decimal
  total: Decimal
  status: Enum (Draft, Issued, Paid, PartiallyPaid, Refunded, Voided)
  payment_method: Enum (Card, Cash, BankTransfer, Voucher, Package, Mixed)
  payment_reference: String (external transaction ID)
  issued_at: Timestamp
  paid_at: Timestamp (nullable)
  created_by: FK -> User
}

Payment {
  id: UUID
  invoice_id: FK -> Invoice
  amount: Decimal
  method: Enum (Stripe, BOV_POS, Cash, BankTransfer, Revolut, PayPal)
  reference: String (external transaction ID)
  status: Enum (Pending, Completed, Failed, Refunded)
  processed_at: Timestamp
  refund_of: FK -> Payment (nullable, if this is a refund)
  refund_reason: Text (nullable)
  refund_approved_by: FK -> User (nullable)
}
```

---

## 3.6 Module 6: Inventory Management

### 3.6.1 Features

| ID | Feature | Priority | Description |
|---|---|---|---|
| INV-001 | Product catalog | P1 | Retail products with descriptions, pricing |
| INV-002 | Stock tracking | P1 | Track inventory levels per location |
| INV-003 | Low-stock alerts | P1 | Configurable threshold alerts |
| INV-004 | Sales recording | P1 | Record product sales linked to appointments |
| INV-005 | Zoho Inventory sync | P1 | Bi-directional sync of stock levels and transactions |
| INV-006 | Stock transfer | P2 | Transfer stock between locations |

### 3.6.2 Data Model

```
Product {
  id: UUID
  name: String
  sku: String (unique)
  description: Text
  category: String
  brand: String
  zoho_inventory_id: String
  status: Enum (Active, Discontinued)
}

ProductPricing {
  id: UUID
  product_id: FK -> Product
  location_id: FK -> Location
  price: Decimal
  cost: Decimal
}

StockLevel {
  id: UUID
  product_id: FK -> Product
  location_id: FK -> Location
  quantity: Integer
  low_stock_threshold: Integer
  last_synced: Timestamp
}
```

---

## 3.7 Reporting Requirements Specification

### 3.7.1 Operational Reports

| Report ID | Report Name | Frequency | Dimensions | Metrics |
|---|---|---|---|---|
| RPT-OP-001 | Staff Utilization | Daily/Weekly/Monthly | Location, Staff, Date Range | Booked hours, Available hours, Utilization % |
| RPT-OP-002 | Service Utilization | Weekly/Monthly | Location, Service Category, Date Range | Bookings per service, Revenue per service, Avg duration |
| RPT-OP-003 | Room Utilization | Weekly/Monthly | Location, Room, Date Range | Occupied hours, Available hours, Utilization % |
| RPT-OP-004 | Booking Volume | Daily/Weekly/Monthly | Location, Status, Source, Date Range | Total bookings, By status, By source |
| RPT-OP-005 | Cancellation Report | Weekly/Monthly | Location, Reason, Date Range | Cancellations, No-shows, Cancellation rate |
| RPT-OP-006 | EOD Summary | Daily | Location | Treatments completed, Revenue, Open invoices, Cancellations |
| RPT-OP-007 | Rebooking Rate | Weekly/Monthly | Location, Service | Repeat visits, Rebooking %, Avg interval |

### 3.7.2 Financial Reports

| Report ID | Report Name | Frequency | Dimensions | Metrics |
|---|---|---|---|---|
| RPT-FI-001 | Revenue by Location | Daily/Weekly/Monthly | Location, Date Range | Gross revenue, Net revenue, Avg transaction |
| RPT-FI-002 | Revenue by Service | Weekly/Monthly | Service, Location, Date Range | Revenue, Volume, Avg price |
| RPT-FI-003 | Revenue by Staff | Weekly/Monthly | Staff, Location, Date Range | Revenue generated, Bookings handled |
| RPT-FI-004 | Revenue by Source | Monthly | Booking source, Date Range | Revenue per channel, Conversion rate |
| RPT-FI-005 | Package Revenue | Monthly | Package type, Date Range | Packages sold, Revenue, Redemption rate |
| RPT-FI-006 | Outstanding Invoices | Daily | Location, Age bracket | Unpaid count, Total outstanding, Age analysis |
| RPT-FI-007 | Payment Collection | Weekly/Monthly | Location, Payment method | Collection rate, Method breakdown |
| RPT-FI-008 | Discount Report | Weekly/Monthly | Location, Staff, Approver | Discounts applied, Total value, Avg %, By reason |
| RPT-FI-009 | Complimentary Report | Monthly | Location, Staff, Approver | Free treatments issued, Equivalent value, Reasons |

### 3.7.3 Marketing & Growth Reports

| Report ID | Report Name | Frequency | Dimensions | Metrics |
|---|---|---|---|---|
| RPT-MK-001 | Customer Acquisition | Monthly | Source, Location | New customers, By source, Cost per acquisition |
| RPT-MK-002 | Referral Performance | Monthly | Referrer, Date Range | Referrals made, Conversions, Referral rate |
| RPT-MK-003 | Online Booking Conversion | Weekly/Monthly | Source, Date Range | Website visits, Booking starts, Completions, Conv. rate |
| RPT-MK-004 | Customer Retention | Monthly | Location, Segment | Active customers, Churn rate, Lifetime value |
| RPT-MK-005 | Upsell Performance | Monthly | Product, Location | Upsell attempts, Success rate, Revenue from upsells |

### 3.7.4 Compliance Reports

| Report ID | Report Name | Frequency | Dimensions | Metrics |
|---|---|---|---|---|
| RPT-CO-001 | Audit Trail | On-demand | User, Action type, Date Range | All logged actions with details |
| RPT-CO-002 | Deletion Log | On-demand | Entity type, User, Date Range | Deleted records with reasons |
| RPT-CO-003 | Discount Approval Log | Monthly | Approver, Location | Approvals/denials, Amounts, Reasons |
| RPT-CO-004 | GDPR Data Requests | On-demand | Customer | Data export, Anonymization log |

---

# 4. Integration Architecture

## 4.1 Integration Map

```
                         ┌──────────────────────────────┐
                         │       CarismaSoft Core       │
                         │    (API Layer / Event Bus)    │
                         └──────────┬───────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
    ┌─────▼──────┐           ┌──────▼──────┐           ┌──────▼──────┐
    │  Zoho CRM  │           │Zoho Inventory│          │  Zoho Subs  │
    │ (Customers │           │  (Products   │          │(Memberships │
    │  Bookings) │           │   Stock)     │          │   Billing)  │
    └────────────┘           └─────────────┘           └─────────────┘
          │                                                    │
    ┌─────▼──────┐           ┌─────────────┐           ┌──────▼──────┐
    │Zoho Analyt.│           │   Talexio   │           │  Custom     │
    │(Dashboards │           │  (Payroll   │           │  Gift App   │
    │  Reports)  │           │   Shifts)   │           │             │
    └────────────┘           └─────────────┘           └─────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
    ┌─────▼──────┐           ┌──────▼──────┐           ┌──────▼──────┐
    │   Stripe   │           │   BOV POS   │           │Wix Website  │
    │ (Online    │           │  (In-Store  │           │  (Booking   │
    │  Payments) │           │   Payment)  │           │   Widget)   │
    └────────────┘           └─────────────┘           └─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼──┐     ┌─────▼──┐     ┌──────▼──┐
              │  GA4   │     │Meta Ads│     │WhatsApp │
              │(Events)│     │ (CAPI) │     │  (Twilio │
              └────────┘     └────────┘     │  or WA  │
                                            │ Business)│
                                            └─────────┘
```

## 4.2 Integration Specifications

### 4.2.1 Zoho CRM

| Attribute | Value |
|---|---|
| Direction | Bi-directional |
| Sync mode | Real-time (webhook + polling fallback) |
| Protocol | Zoho CRM REST API v2 |
| Authentication | OAuth 2.0 |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Customer create/update | CarismaSoft -> Zoho CRM | Customer saved | Full customer profile | Real-time |
| Customer update | Zoho CRM -> CarismaSoft | CRM record updated | Changed fields | Webhook + 15-min poll |
| Booking created | CarismaSoft -> Zoho CRM | Booking saved | Appointment + customer + service | Real-time |
| Booking status change | CarismaSoft -> Zoho CRM | Status updated | Status + timestamp + notes | Real-time |
| Staff assignment | CarismaSoft -> Zoho CRM | Staff assigned | Staff-booking link | Real-time |

**API contract (Customer sync outbound):**
```json
POST /crm/v2/Contacts
{
  "data": [{
    "First_Name": "string",
    "Last_Name": "string",
    "Email": "string",
    "Phone": "string",
    "Lead_Source": "string",
    "CarismaSoft_ID": "uuid",
    "VIP_Status": "boolean",
    "Preferred_Location": "string",
    "Tags": "string (comma-separated)"
  }]
}
```

**Error handling:**
- On 429 (rate limit): exponential backoff starting at 1 second, max 5 retries
- On 401 (auth failure): refresh OAuth token, retry once
- On 5xx (server error): retry 3 times with exponential backoff, then queue for manual review
- On conflict (409): fetch remote record, apply conflict resolution (most-recent-wins for non-critical fields; flag for manual review for critical fields like email/phone)

### 4.2.2 Zoho Inventory

| Attribute | Value |
|---|---|
| Direction | Bi-directional |
| Sync mode | Batch (every 15 minutes) + real-time on sale |
| Protocol | Zoho Inventory REST API v1 |
| Authentication | OAuth 2.0 (shared Zoho org token) |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Product catalog sync | Zoho Inventory -> CarismaSoft | Product updated | Product details, pricing | 15-min batch |
| Stock level sync | Zoho Inventory -> CarismaSoft | Stock changed | Quantity per location | 15-min batch |
| Sale recorded | CarismaSoft -> Zoho Inventory | Product sold at checkout | Sale transaction | Real-time |
| Stock adjustment | CarismaSoft -> Zoho Inventory | Manual adjustment | Quantity delta + reason | Real-time |

**Error handling:**
- Sale recording failure: queue locally, retry every 5 minutes, alert after 3 failures
- Stock sync discrepancy: log warning, do not overwrite local if local was updated more recently

### 4.2.3 Zoho Subscriptions (Billing)

| Attribute | Value |
|---|---|
| Direction | Bi-directional |
| Sync mode | Webhook (Zoho -> CS) + API call (CS -> Zoho) |
| Protocol | Zoho Subscriptions REST API |
| Authentication | OAuth 2.0 |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Subscription created/renewed | Zoho Subs -> CarismaSoft | Billing event webhook | Subscription ID, plan, credits | Real-time |
| Credit allocation | Zoho Subs -> CarismaSoft | Monthly billing cycle | Treatment credits to add | Event-driven |
| Credit redemption | CarismaSoft -> Zoho Subs | Treatment redeemed | Credit deduction | Real-time |
| Subscription cancellation | Zoho Subs -> CarismaSoft | Cancellation event | Subscription status | Real-time |

**Error handling:**
- Webhook delivery failure: Zoho retries automatically; CarismaSoft polls every 30 minutes as fallback
- Credit deduction failure: block treatment completion until sync confirmed; fallback to manual credit tracking

### 4.2.4 Talexio (Payroll & Scheduling)

| Attribute | Value |
|---|---|
| Direction | Primarily inbound (Talexio -> CarismaSoft) |
| Sync mode | Batch (daily) + on-demand pull |
| Protocol | Talexio API (REST) |
| Authentication | API key |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Shift import | Talexio -> CarismaSoft | Scheduled daily sync | Staff shifts for next 14 days | Daily at 06:00 |
| Absence notification | Talexio -> CarismaSoft | Staff marked absent | Staff ID, date, absence type | Real-time (webhook if available) or hourly poll |
| Booking hours export | CarismaSoft -> Talexio | Weekly export | Staff booking hours for payroll | Weekly (Monday 02:00) |

**Error handling:**
- Import failure: use most recent successful import; alert operations manager
- Missing staff member in Talexio: create mapping request, do not auto-create
- Shift conflict detected: flag for manual review, do not auto-resolve

### 4.2.5 Custom Gift Management App

| Attribute | Value |
|---|---|
| Direction | Bi-directional |
| Sync mode | Real-time API calls |
| Protocol | Custom REST API (to be defined with gift app team) |
| Authentication | API key or JWT |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Gift voucher issued | Gift App -> CarismaSoft | Purchase completed | Voucher code, value, recipient, expiry | Real-time |
| Gift redemption | CarismaSoft -> Gift App | Voucher applied at checkout | Voucher code, amount redeemed | Real-time |
| Balance check | CarismaSoft -> Gift App | Voucher lookup | Voucher code | On-demand |

### 4.2.6 POS Payment Processors (BOV POS)

| Attribute | Value |
|---|---|
| Direction | CarismaSoft -> POS -> CarismaSoft |
| Sync mode | Real-time (request/response) |
| Protocol | POS terminal SDK/API |
| Authentication | Terminal pairing + merchant credentials |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Payment request | CarismaSoft -> POS | Checkout initiated | Amount, reference, currency | Real-time |
| Payment result | POS -> CarismaSoft | Transaction completed | Status, auth code, card last 4 | Real-time |
| Refund request | CarismaSoft -> POS | Refund approved | Original transaction ref, amount | Real-time |
| Daily settlement | POS -> CarismaSoft | End of business day | Settlement totals, transaction list | Daily |

### 4.2.7 Website Booking System (Wix)

| Attribute | Value |
|---|---|
| Direction | Bi-directional |
| Sync mode | Real-time API |
| Protocol | REST API (CarismaSoft exposes endpoints; Wix embeds widget or calls API) |
| Authentication | API key + CORS whitelist |

**Data flows:**

| Flow | Direction | Trigger | Data | Frequency |
|---|---|---|---|---|
| Availability query | Website -> CarismaSoft | User selects service/date | Available slots | Real-time |
| Booking creation | Website -> CarismaSoft | User confirms booking | Customer info, service, time, deposit | Real-time |
| Booking confirmation | CarismaSoft -> Website | Booking saved | Confirmation number, details | Real-time |
| Service catalog | CarismaSoft -> Website | Service updated | Services, prices, descriptions | 15-min cache |

### 4.2.8 Google Analytics 4

| Attribute | Value |
|---|---|
| Direction | Outbound (CarismaSoft -> GA4) |
| Sync mode | Event-driven |
| Protocol | GA4 Measurement Protocol |
| Authentication | Measurement ID + API secret |

**Events sent:**
- `booking_started` (service, location)
- `booking_completed` (service, location, source, value)
- `payment_completed` (value, method)
- `package_purchased` (package type, value)

### 4.2.9 Meta Ads (Conversions API)

| Attribute | Value |
|---|---|
| Direction | Outbound (CarismaSoft -> Meta) |
| Sync mode | Event-driven |
| Protocol | Meta Conversions API (CAPI) |
| Authentication | Pixel ID + access token |

**Events sent:**
- `Lead` (booking inquiry)
- `Schedule` (booking confirmed)
- `Purchase` (payment completed)

**Data:**
- Hashed email, hashed phone (for matching)
- Event value, currency
- Content type, content IDs (service IDs)

---

# 5. Technical Requirements

## 5.1 Performance Specifications

| Metric | Target | Measurement |
|---|---|---|
| Booking creation response time | < 5 seconds (P99) | End-to-end from user click to confirmation displayed |
| Calendar load time | < 3 seconds (P95) | Time to render day/week view for a location |
| Availability check response | < 2 seconds (P95) | API response for available slots query |
| System uptime | 99.9% (annualized) | Excludes planned maintenance windows (max 4h/month) |
| Double-booking rate | 0% | Zero tolerance; enforced at database level |
| Concurrent users | 50+ simultaneous | All 13 locations with 3-4 staff accessing per location |
| Data sync latency | < 30 seconds | Time from event to integration partner receiving data |
| Notification delivery | < 60 seconds | From trigger to message dispatched |

## 5.2 Multi-Location Logic & Conflict Prevention

### 5.2.1 Location Model

```
Location {
  id: UUID
  name: String (e.g., "Carisma Spa - Sliema")
  brand: Enum (Spa, Aesthetics, Slimming)
  address: Address
  phone: String
  email: String
  timezone: String (default "Europe/Malta")
  operating_hours: OperatingHours[] (day -> open/close)
  rooms: Room[]
  status: Enum (Active, Inactive, TemporarilyClosed)
}
```

### 5.2.2 Conflict Prevention Algorithm

The system must enforce the following constraints atomically (within a single database transaction):

1. **Staff conflict check:** Before confirming any booking, verify that the assigned staff member has no overlapping appointment at any location. Query: `SELECT COUNT(*) FROM appointments WHERE staff_id = ? AND status NOT IN ('Cancelled', 'NoShow') AND start_time < ? AND end_time > ?`

2. **Room conflict check:** If the service requires a room, verify the room is available: `SELECT COUNT(*) FROM appointments WHERE room_id = ? AND location_id = ? AND status NOT IN ('Cancelled', 'NoShow') AND start_time < ? AND end_time > ?`

3. **Capacity check:** Verify the location has not exceeded its maximum concurrent appointments (based on available staff and rooms).

4. **Optimistic locking:** Use a version number on each appointment slot. If two concurrent requests attempt the same slot, only the first succeeds; the second receives a conflict error and must re-check availability.

5. **Cross-location travel time:** If a staff member has back-to-back bookings at different locations, enforce a minimum buffer (configurable, default 30 minutes) between end of one and start of next.

### 5.2.3 Fairness Distribution

When a customer selects a service but not a specific staff member, the system assigns based on:

1. Filter: qualified staff at that location, on shift, available at requested time
2. Rank by: fewest bookings in rolling 7-day window (configurable)
3. Tiebreak: random selection
4. Override: customer preference (if preferred therapist is available, prefer them)

## 5.3 Offline Mode Architecture

### 5.3.1 Design

Offline mode uses a local cache (browser IndexedDB or mobile local storage) that syncs with the server when connectivity is restored.

**Offline capabilities (read):**
- View today's schedule for the user's primary location
- View customer contact details for today's appointments
- View staff roster for today

**Offline capabilities (write):**
- Mark appointment as Attended / No-Show
- Add appointment notes
- Create walk-in booking (queued for sync)

**Sync-on-reconnect:**
- All offline writes queued with timestamps
- On reconnect, replay queue in order
- Conflict detection: if server state has changed (e.g., appointment was cancelled remotely while marked attended offline), flag for manual review
- Sync status indicator visible in UI

### 5.3.2 Limitations

- Cannot process payments offline
- Cannot verify real-time availability (offline walk-ins may cause conflicts resolved at sync)
- Service-worker-based caching for the web application; native caching for future mobile apps
- Maximum offline duration: 24 hours of cached data

## 5.4 Conceptual Database Schema

### 5.4.1 Entity-Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Customer │────<│  Appointment │>────│  Service  │
└──────────┘     └──────┬───────┘     └──────────┘
                        │                    │
                        │              ┌─────▼──────┐
                   ┌────▼────┐        │ServicePricing│
                   │  Staff  │        │(per location)│
                   └────┬────┘        └─────────────┘
                        │
                   ┌────▼────┐     ┌──────────┐
                   │  Shift  │     │ Location │
                   └─────────┘     └──────────┘
                                        │
┌──────────┐     ┌──────────┐     ┌────▼────┐
│  Invoice │────<│ Payment  │     │  Room   │
└──────────┘     └──────────┘     └─────────┘

┌──────────┐     ┌───────────────┐
│ Package  │────<│CustomerPackage│
└──────────┘     └───────────────┘

┌──────────┐     ┌──────────┐
│ Product  │────<│StockLevel│ (per location)
└──────────┘     └──────────┘

┌──────────┐
│AuditLog  │ (universal, records all entity changes)
└──────────┘

┌──────────┐
│  User    │ (system users with roles)
└──────────┘
```

### 5.4.2 Core Tables Summary

| Table | Records (estimated) | Growth rate | Indexes |
|---|---|---|---|
| Customer | 20,000+ | 200/month | email, phone, zoho_crm_id, name |
| Appointment | 150,000/year | 400/day | customer_id, staff_id, location_id, start_time, status |
| Staff | 50 | Low | location_ids, role |
| Service | 200 | Low | category, location availability |
| Location | 13 | Low | brand |
| Invoice | 150,000/year | 400/day | appointment_id, customer_id, status |
| Payment | 150,000/year | 400/day | invoice_id, method, status |
| AuditLog | 500,000+/year | High | entity_type, entity_id, user_id, timestamp |
| Shift | 20,000/year | 45 staff x 365 days | staff_id, location_id, date |
| Package | 100 | Low | status |
| CustomerPackage | 5,000/year | Moderate | customer_id, status, expiry |
| Voucher | 2,000/year | Moderate | code, status |

## 5.5 Security & Compliance

### 5.5.1 Role-Based Access Control (RBAC)

| Role | Booking | Customer Data | Payments | Discounts | Reports | Staff Mgmt | System Config |
|---|---|---|---|---|---|---|---|
| HQ Admin | Full CRUD | Full CRUD | Full | Approve all | All locations | Full CRUD | Full |
| Location Manager | Full CRUD (own location) | Full CRUD (own location) | Full | Approve <=20% | Own location | View + assign | Location settings |
| Receptionist | Create, Update (own location) | Create, Update | Process | Apply <=10% | Own location (basic) | View schedule | None |
| Therapist | View own schedule | View assigned customers | None | None | Own utilization | View own schedule | None |
| Doctor | View own schedule + full history | View + edit assigned customers, medical notes | None | None | Own reports | View own schedule | None |
| Slimming Consultant | View own schedule | View + edit assigned customers, progress notes | None | None | Own reports | View own schedule | None |

### 5.5.2 Audit Trail

Every state-changing operation must be logged:

```
AuditLog {
  id: UUID
  timestamp: Timestamp
  user_id: FK -> User
  action: Enum (Create, Update, Delete, Approve, Reject, Login, Logout)
  entity_type: String (e.g., "Appointment", "Customer", "Invoice")
  entity_id: UUID
  changes: JSON ({field: {old: value, new: value}})
  ip_address: String
  user_agent: String
  location_id: FK -> Location (nullable)
  notes: Text (nullable, required for Delete/Approve)
}
```

Audit logs are immutable (append-only). No user can delete or modify audit entries. Retention: minimum 7 years for financial records.

### 5.5.3 Data Protection (GDPR)

- All personal data stored in EU-resident data centers
- Data encryption at rest (AES-256) and in transit (TLS 1.2+)
- Right to access: export all customer data in machine-readable format (JSON/CSV)
- Right to erasure: anonymize customer records (replace PII with hashed tokens); retain financial records with anonymized references
- Data processing agreement required with all integration partners
- Consent tracking for marketing communications (separate from transactional)
- Cookie consent for web-facing booking widget
- Data breach notification capability within 72 hours

### 5.5.4 Authentication & Session Management

- Multi-factor authentication (MFA) required for Admin and Manager roles
- Session timeout: 8 hours (configurable per role)
- Password policy: minimum 12 characters, complexity requirements
- Account lockout after 5 failed attempts (30-minute cooldown)
- SSO via SAML 2.0 or OIDC (optional, for Zoho SSO integration)

## 5.6 Scalability

### 5.6.1 Current Scale

- 13 locations, ~45 staff, ~400 bookings/day
- Estimated peak: 50 concurrent users, 60 bookings/hour

### 5.6.2 Design Capacity

- Support up to 30 locations without architectural changes
- Support up to 150 staff
- Support up to 1,200 bookings/day (3x current)
- Horizontal scaling via load balancer + stateless application tier
- Database read replicas for reporting queries (separate from transactional)
- Background job queue for integration sync tasks (decoupled from user-facing operations)

---

# 6. Modules in Detail

## 6a. Booking Engine

### 6a.1 Online + Internal Bookings

**Internal booking (receptionist/manager):**
1. Select location (defaults to user's assigned location)
2. Select or create customer
3. Select service(s)
4. Select date and time (system shows available slots)
5. Optionally select preferred staff (or let system auto-assign)
6. Add notes
7. Confirm booking (triggers confirmation notification)

**Online booking (customer via website widget):**
1. Customer selects location
2. Customer selects service
3. System displays available dates and times
4. Customer selects slot
5. Customer enters contact details (or logs in if returning)
6. System collects deposit payment via Stripe
7. Booking created in CarismaSoft with status "Booked"
8. Confirmation sent via email + WhatsApp

### 6a.2 Real-Time Availability Checking

Availability is computed from the intersection of:
- Location operating hours for the requested date
- Staff shifts (from Talexio import) for qualified staff at that location
- Existing appointments (blocked time slots)
- Room availability (if service requires a room)
- Buffer times between appointments (service-specific)

The availability query returns a list of available time slots (start times at configurable intervals, default 15 minutes). Each slot includes the number of qualified available staff (for capacity indication).

### 6a.3 Double-Booking Prevention

- Database-level unique constraint on (staff_id, start_time, end_time) for non-cancelled appointments
- Application-level optimistic locking: check availability, reserve slot with version number, confirm booking
- If two requests race: first-commit-wins; second request receives "slot no longer available" error
- For rooms: database-level unique constraint on (room_id, location_id, start_time, end_time)

### 6a.4 Staff Fairness Assignment

When customer does not request a specific therapist:
1. Query all staff who: are on shift at that location, can perform the service, have no conflicting appointment
2. For each candidate, count bookings in rolling 7-day window
3. Assign to the staff member with the fewest bookings
4. Tiebreak: random
5. If customer has a preferred therapist and that therapist is available, override fairness and assign preferred

Configurable settings:
- Fairness window (default: 7 days)
- Enable/disable fairness (location-level toggle)
- Minimum rest period between appointments per staff member (default: 0; configurable per service)

### 6a.5 Walk-In Support

Walk-in bookings use the same workflow as internal bookings but:
- Booking source marked as "WalkIn"
- Start time defaults to "now"
- If no slots available at current time, system suggests nearest available time
- Walk-in bookings skip deposit requirement

### 6a.6 Manual Override for Overbooking

Manager-level users can force-book an appointment even if:
- Staff member already has an appointment at that time
- Room is occupied
- Location is at capacity

Override requires:
- Explicit confirmation dialog ("This will create a scheduling conflict. Proceed?")
- Mandatory reason note
- Logged in audit trail with override flag
- Notifications sent to affected parties (conflicting staff, room occupants)

---

## 6b. Calendar System

### 6b.1 Views

| View | Layout | Primary use case |
|---|---|---|
| Day view | Timeline (vertical axis = time, columns = staff or rooms) | Receptionist daily operations |
| Week view | Grid (rows = staff, columns = days) | Manager weekly planning |
| Month view | Calendar grid with appointment counts per day | Overview and capacity planning |
| Global HQ view | Location tabs/dropdown + aggregated statistics | HQ Admin cross-location management |

### 6b.2 Interactions

- **Drag and drop:** Move appointment to a different time, staff, or room within the same day. System validates the new slot before confirming. Cross-day drag not supported (use reschedule dialog).
- **Click to create:** Click on an empty slot to pre-fill time and staff/room for a new booking.
- **Click to view:** Click on an existing appointment to view details, update status, add notes.
- **Color coding:** Status-based (Booked = blue, Confirmed = green, In-Progress = yellow, Attended = teal, Cancelled = red, No-Show = grey). Configurable per deployment.

### 6b.3 Filters

- Location (required for non-HQ users; HQ users can switch)
- Staff member (single or multi-select)
- Service category (Spa, Aesthetics, Slimming)
- Status (Booked, Confirmed, Cancelled, etc.)
- Room (for room-level view)
- Date range

### 6b.4 Real-Time Updates

- WebSocket connection for live updates (new bookings, status changes, cancellations appear instantly for all connected users viewing the affected calendar)
- Optimistic UI: changes appear immediately in the user's view; if server rejects, revert with error message
- Reconnection strategy: exponential backoff, fallback to polling every 10 seconds if WebSocket unavailable

---

## 6c. Multi-Location Logic

### 6c.1 Data Architecture

- **Centralized:** Single database for all locations. No data silos.
- **Scoped access:** Users see only their assigned location(s) by default. Managers see their managed locations. HQ Admin sees all.
- **Cross-location queries:** Customer search, package lookup, and voucher redemption always search across all locations.

### 6c.2 Location-Specific Configuration

Each location independently configures:
- Services offered (subset of global catalog)
- Pricing per service
- Operating hours
- Rooms and their types
- Staff assignments
- Notification templates (brand-specific)

### 6c.3 Cross-Location Staff Management

- A staff member can be assigned to multiple locations (via Shift records)
- The system prevents scheduling a staff member at two locations simultaneously
- Travel buffer (configurable, default 30 minutes) enforced between locations
- Staff utilization reports show totals across all locations worked

### 6c.4 Fairness Across Locations

When a staff member works at multiple locations, fairness distribution considers their total booking count across all locations, not per-location.

---

## 6d. Packages, Memberships & Vouchers

### 6d.1 Package Types

| Type | Description | Billing | Redemption |
|---|---|---|---|
| Prepaid package | Fixed number of sessions for specific services | One-time upfront | Session-by-session |
| Membership | Monthly subscription including treatment credits | Recurring via Zoho Subs | Monthly credit allocation |
| Gift voucher | Monetary or service-specific voucher | Paid by purchaser | Redeemed at checkout |

### 6d.2 Redemption Rules

- Packages: customer selects a package at booking time. System deducts one session from the appropriate service bucket. If no sessions remain, system prompts for payment.
- Memberships: monthly credits auto-allocated on billing date (via Zoho Subscriptions webhook). Credits tracked as a balance. Credits expire at end of billing period unless configured otherwise.
- Vouchers: enter code at checkout. System validates code, checks balance, deducts amount. Partial redemption supported (remaining balance stored).

### 6d.3 Cross-User Sharing

- Package owner can authorize another customer to redeem sessions
- Requires: package must be marked "shareable" at creation
- Audit log records: who authorized, who redeemed, session details

### 6d.4 Cross-Service Flexibility

- If a package includes 5 sessions of Service A but customer wants Service B:
  - If price of B <= price of A: allow substitution, deduct one session
  - If price of B > price of A: customer pays the difference
  - Configuration: package-level toggle for "allow cross-service redemption"

### 6d.5 Expiry and Override

- Packages: valid for X days from purchase (configurable per package)
- Vouchers: valid from/to dates
- Expired packages/vouchers cannot be redeemed
- Manager-level users can extend expiry (logged in audit trail with reason)

---

## 6e. Customer Profile (CRM Lite)

### 6e.1 Profile Contents

- **Identity:** Name, phone, email, date of birth, gender, address
- **History:** All bookings across all locations with status, service, staff, date
- **Financial:** Total spend, outstanding balance, active packages, active memberships
- **Preferences:** Preferred therapist, preferred location, service preferences
- **Clinical:** Treatment notes, before/after images, consent forms (especially for Aesthetics and Slimming)
- **Marketing:** Lead source, tags, segmentation, communication preferences (opt-in/out)
- **Custom fields:** Admin-configurable additional fields

### 6e.2 Unified View

A single customer profile view shows data across all locations. Location-specific data (booking history, preferred staff) is visible within the unified view, filterable by location.

### 6e.3 Consent & Medical Records

For Aesthetics and Slimming verticals:
- Consent form upload and storage (signed documents)
- Treatment-specific notes (free text + structured fields)
- Before/after photo upload with date stamps
- Medical history notes (visible only to Doctor and Consultant roles)
- These records are subject to stricter access controls (see RBAC section)

---

## 6f. Payments

### 6f.1 Payment Channels

| Channel | Provider | Use Case |
|---|---|---|
| Online (card) | Stripe | Website bookings, deposit collection |
| In-store (card) | BOV POS | In-person checkout |
| Bank transfer | Revolut, Fyom | Corporate accounts, large packages |
| PayPal | PayPal | Online alternative for customers without cards |
| Cash | N/A | Walk-ins, small transactions |
| Voucher/Package | Internal | Redemption from existing credit |

### 6f.2 Deposit Policy

- Configurable per service (some services require deposit, some do not)
- Default deposit: EUR 10 or 20% of service price (whichever is greater)
- Deposit collected at booking time for online bookings (via Stripe)
- Deposit optional for internal bookings (receptionist can waive)
- Deposit applied to final invoice at checkout

### 6f.3 Cancellation Policy

- Free cancellation: > 24 hours before appointment
- Late cancellation (< 24 hours): deposit forfeited
- No-show: deposit forfeited + flagged on customer profile
- Manager override: can waive cancellation penalty (logged in audit)

### 6f.4 Refund Workflow

1. Staff or manager initiates refund request
2. System validates: original payment exists, amount is refundable
3. Manager approval required for all refunds
4. Refund processed via original payment method (Stripe refund, BOV reversal, etc.)
5. Invoice updated to Refunded status
6. Audit log entry created
7. Customer notified via email

---

## 6g. Roles & Permissions

### 6g.1 Role Definitions

| Role | Scope | Description |
|---|---|---|
| HQ Admin | Global | Full system access, configuration, all locations |
| Location Manager | One or more locations | Full operational access for assigned locations, approve discounts, view reports |
| Receptionist | Single location | Create/manage bookings, process payments, manage customer profiles |
| Therapist | Single location | View own schedule, view customer details for assigned appointments, add treatment notes |
| Doctor | Single location | Same as Therapist + access to medical records, consent forms |
| Slimming Consultant | Single location | Same as Therapist + access to progress tracking, dietary notes |

### 6g.2 Permission Matrix

Permissions are configurable at the role level. Default permissions ship with the system, but HQ Admin can modify.

Permission categories:
- **Bookings:** Create, View, Update, Cancel, Delete, Override
- **Customers:** Create, View, Update, Delete, Merge
- **Payments:** Process, Refund, Apply Discount, Complimentary
- **Reports:** View Own, View Location, View Global
- **Staff:** View Schedule, Manage Shifts, Manage Profiles
- **System:** Configure Settings, Manage Roles, Manage Locations, Manage Services
- **Audit:** View Audit Logs, Export Audit Logs

---

## 6h. Notifications

### 6h.1 Channels

| Channel | Provider | Use Case |
|---|---|---|
| WhatsApp | WhatsApp Business API (or Twilio) | Primary customer communication (Malta preference) |
| Email | Klaviyo (marketing) + transactional email (SendGrid or similar) | Confirmations, receipts, marketing |
| SMS | Twilio (Phase 2) | Fallback for customers without WhatsApp |

### 6h.2 Notification Triggers

| Trigger | Channel(s) | Content | Timing |
|---|---|---|---|
| Booking confirmed | WhatsApp + Email | Confirmation with details, location, cancel link | Immediate |
| Appointment reminder | WhatsApp | Reminder with details | 24 hours before |
| Appointment reminder | WhatsApp | Final reminder | 2 hours before |
| Cancellation confirmed | WhatsApp + Email | Cancellation confirmation, deposit status | Immediate |
| No-show follow-up | Email | Gentle follow-up, rebooking link | 2 hours after missed appointment |
| Post-visit follow-up | WhatsApp | Thank you + review request + rebooking link | 24 hours after attended |
| Package expiry warning | Email | 7-day warning for expiring packages | 7 days before expiry |
| Membership renewal | Email | Renewal confirmation or renewal reminder | On renewal / 7 days before |

### 6h.3 Template System

- Templates stored per brand (Spa, Aesthetics, Slimming)
- Variables: {{customer_name}}, {{service_name}}, {{date}}, {{time}}, {{location}}, {{staff_name}}, {{cancel_link}}, {{rebook_link}}
- Templates editable by Manager/Admin via admin panel
- Each brand uses its own voice (Spa = "Beyond the Spa", Aesthetics = "Glow with Confidence", Slimming = Katya persona)
- Preview mode for testing template rendering before activation

---

## 6i. Offline Mode

### 6i.1 Cached Data

When the application detects connectivity, it pre-caches:
- Today's appointment schedule for the user's location
- Tomorrow's appointment schedule
- Customer details for today's appointments
- Staff roster for today
- Service catalog and pricing

Total cache size estimate: < 10 MB per location per day.

### 6i.2 Offline Capabilities

| Action | Available Offline? | Notes |
|---|---|---|
| View today's schedule | Yes | From cache |
| View customer details | Yes | For today's customers only |
| Mark appointment attended | Yes | Queued for sync |
| Mark appointment no-show | Yes | Queued for sync |
| Add appointment notes | Yes | Queued for sync |
| Create walk-in booking | Yes | Queued; conflict check at sync |
| Process payment | No | Requires real-time connection |
| Check real-time availability | No | Stale data only |
| Modify future appointments | No | Requires server validation |

### 6i.3 Sync Protocol

1. On reconnect, client sends queued operations in chronological order
2. Server processes each operation:
   - If valid: apply and confirm
   - If conflicting: reject and return conflict details
3. Client displays sync results (successful operations + conflicts requiring manual resolution)
4. Conflicts queued in a "Sync Conflicts" panel for Manager review

---

# 7. Migration Strategy

## 7.1 Data Import from Fresha

### 7.1.1 Data Scope

| Data Type | Import? | Source | Priority |
|---|---|---|---|
| Customer profiles | Yes | Fresha export | P0 |
| Booking history | Yes | Fresha export | P0 |
| Future bookings | Yes | Fresha export (active only) | P0 |
| Package balances | Yes | Fresha export | P0 |
| Membership status | Yes | Fresha + Zoho Subscriptions | P0 |
| Treatment notes | Yes | Fresha export | P1 |
| Payment history | Yes | Fresha export (read-only reference) | P1 |
| Staff profiles | Manual | Re-created in CarismaSoft | P0 |
| Service catalog | Manual | Re-created with correct pricing | P0 |
| Images/documents | If exportable | Fresha export | P2 |

### 7.1.2 Import Process

1. **Extract:** Export all data from Fresha (CSV/API export if available)
2. **Transform:** Map Fresha data fields to CarismaSoft schema. Key mappings:
   - Fresha customer ID -> CarismaSoft customer ID (new UUID, preserve Fresha ID as legacy reference)
   - Fresha service names -> CarismaSoft service IDs (manual mapping required)
   - Fresha staff names -> CarismaSoft staff IDs (manual mapping)
   - Booking statuses -> CarismaSoft status enum
3. **Load:** Import into CarismaSoft staging environment
4. **Validate:** Run reconciliation checks (see below)

### 7.1.3 Validation & Reconciliation

| Check | Method | Acceptance Criteria |
|---|---|---|
| Customer count | Compare Fresha total vs CarismaSoft total | 100% match (excluding known duplicates) |
| Booking count | Compare by date range | 100% match for active/future bookings |
| Package balances | Compare per-customer | 100% match |
| Financial totals | Compare monthly revenue totals | 100% match |
| Spot check | Random sample of 50 customers | All fields correctly mapped |

## 7.2 Cutover Plan

### 7.2.1 Timeline

| Phase | Duration | Activity |
|---|---|---|
| T-4 weeks | 1 week | Initial data export from Fresha, transform, load into staging |
| T-3 weeks | 1 week | Validation, reconciliation, fix mapping issues |
| T-2 weeks | 2 weeks | Parallel operation: bookings entered in both systems |
| T-1 day | 1 day | Final data sync: export all new/changed data from Fresha since initial export |
| T-0 (Go Live) | 1 day | Switch to CarismaSoft as primary. Fresha set to read-only. |
| T+1 to T+7 | 1 week | Hypercare: dedicated support, rapid bug fixes, daily check-ins |
| T+30 | - | Fresha subscription cancelled |

### 7.2.2 Rollback Procedures

If critical issues are discovered during or after cutover:

- **Before Go Live (during parallel operation):** Simply continue using Fresha as primary. No data loss.
- **Within 24 hours of Go Live:** Re-enable Fresha as primary. Export any bookings created in CarismaSoft during the window and manually enter in Fresha.
- **After 24 hours:** Rollback becomes more complex. Assess cost of forward-fixing vs. rollback. Maintain Fresha access for 30 days post-Go Live as insurance.

### 7.2.3 Staff Training

| Audience | Training Format | Duration | Content |
|---|---|---|---|
| Receptionists | Hands-on workshop + video | 4 hours | Booking creation, customer management, checkout |
| Therapists | Video + quick-reference card | 1 hour | Viewing schedule, adding notes |
| Managers | Hands-on workshop | 4 hours | All receptionist tasks + reports, approvals, staff management |
| HQ Admin | Deep dive session | 8 hours | System configuration, roles, integrations, troubleshooting |

---

# 8. Development Phases & Timeline

## 8.1 Phase 1: MVP

### 8.1.1 Scope

| Module | Effort (dev-days) | Dependencies |
|---|---|---|
| Database schema + API layer | 25 | None |
| Customer Profile (CRM Lite) | 15 | Database |
| Booking Engine | 30 | Database, Customer, Service, Staff |
| Calendar System | 25 | Booking Engine |
| Staff Roster Management | 15 | Database, Talexio integration |
| Services & Pricing | 10 | Database |
| Packages/Memberships/Vouchers | 20 | Services, Customer, Zoho Subscriptions |
| Payments (basic) | 20 | Booking, Invoice, Stripe, BOV |
| Roles & Permissions | 10 | Database, User management |
| Notifications (WhatsApp + Email) | 15 | Booking Engine |
| Offline Mode (basic) | 15 | Calendar, Booking Engine |
| Zoho CRM integration | 15 | Customer, Booking |
| Zoho Inventory integration | 8 | Products |
| Zoho Subscriptions integration | 10 | Packages/Memberships |
| Talexio integration | 10 | Staff Roster |
| Website booking widget | 10 | Booking Engine, availability API |
| GA4 + Meta CAPI integration | 5 | Booking events |
| POS integration (BOV) | 8 | Payments |
| Gift App integration | 5 | Vouchers |
| Reporting (core 10 reports) | 15 | All modules |
| Migration tooling | 10 | All modules |
| UI/UX design + frontend | 40 | Parallel with backend |
| Testing + QA | 25 | All modules |
| DevOps + deployment | 10 | Parallel |
| **Total** | **~411 dev-days** | |

### 8.1.2 Team Estimate

Assuming a team of 3 developers (2 backend, 1 frontend) + 1 designer + 1 QA:
- Calendar duration: approximately 6-7 months
- With 4 developers: approximately 5 months

### 8.1.3 Milestones

| Milestone | Target (from start) | Deliverable |
|---|---|---|
| M1: Foundation | Week 4 | Database, API layer, auth, roles, basic UI shell |
| M2: Core Booking | Week 10 | Booking engine, calendar, availability, customer profiles |
| M3: Staff & Services | Week 14 | Staff roster, Talexio sync, service catalog, pricing |
| M4: Packages & Payments | Week 18 | Packages, memberships, vouchers, Stripe, BOV POS |
| M5: Integrations | Week 22 | All Zoho integrations, gift app, website widget, GA4, Meta |
| M6: Polish & QA | Week 26 | Offline mode, notifications, reporting, full QA pass |
| M7: Migration & Launch | Week 28-30 | Data migration, parallel run, staff training, go-live |

### 8.1.4 Dependency Chart

```
Database Schema ─┬─> Customer Profile ─┬─> Booking Engine ─┬─> Calendar
                 │                     │                   │
                 ├─> Staff Roster ─────┤                   ├─> Notifications
                 │                     │                   │
                 ├─> Services/Pricing ─┘                   ├─> Offline Mode
                 │                                         │
                 ├─> Roles & Permissions                   ├─> Reporting
                 │                                         │
                 └─> User Management                       └─> Website Widget

Booking Engine ──┬─> Payments ──> POS Integration
                 │
                 ├─> Packages/Vouchers ──> Gift App Integration
                 │
                 └─> Integrations (Zoho CRM, Inventory, Subs, Talexio, GA4, Meta)

Migration Tooling (parallel, depends on all data models being finalized)
```

### 8.1.5 Risk Factors

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Talexio API limitations | Staff scheduling degraded | Medium | Early spike; manual import fallback |
| Fresha data export incomplete | Migration delays | Medium | Engage Fresha support early; manual data entry backup |
| Zoho API rate limits | Sync delays | Low | Batch operations, caching, rate limit handling |
| BOV POS integration complexity | Payment delays | Medium | Early prototype; parallel Stripe-only operation |
| Scope creep | Timeline overrun | High | Strict MVP scope; Phase 2 parking lot |
| Key developer unavailability | Timeline overrun | Low | Documentation, knowledge sharing, modular architecture |

## 8.2 Phase 2 (Post-Launch)

Estimated start: 3-6 months after MVP launch, based on operational feedback.

| Feature | Estimated Effort | Priority |
|---|---|---|
| SMS notifications (Twilio) | 5 dev-days | P1 |
| Google/Apple/Outlook calendar sync | 10 dev-days | P1 |
| Waitlist management | 8 dev-days | P2 |
| Advanced reporting (remaining 15+ report types) | 15 dev-days | P1 |
| Zoho Analytics deep integration (dashboards) | 10 dev-days | P1 |
| AI booking assistant (NLU for chat/WhatsApp) | 30 dev-days | P2 |
| Advanced CRM features (automated segmentation, campaigns) | 20 dev-days | P2 |
| Dynamic pricing (demand-based) | 15 dev-days | P3 |
| Native mobile app (iOS + Android) | 60 dev-days | P2 |
| Barcode scanner integration | 5 dev-days | P3 |
| Advanced analytics dashboards | 15 dev-days | P2 |

---

# 9. Cost of Ownership Analysis

## 9.1 Fresha Cost at Current Scale

| Cost Element | Monthly | Annual |
|---|---|---|
| Team plan: 45 staff x EUR 9.95 | EUR 447.75 | EUR 5,373 |
| Marketplace commission (est. 50 bookings/day at EUR 60 avg x 20%) | EUR 18,000 | EUR 216,000 |
| Transaction fees (400 bookings/day x EUR 60 avg x 1.29% + EUR 0.20) | EUR 3,864 | EUR 46,368 |
| Hardware (13 terminals x EUR 499, amortized over 3 years) | EUR 180 | EUR 2,162 |
| **Total** | **EUR 22,492** | **EUR 269,903** |

Note: Marketplace commission estimate assumes ~50 daily bookings originate from Fresha marketplace. Actual figure may be lower. If only 10% of bookings are marketplace-sourced (40/day), commission drops to approximately EUR 43,200/year.

**Conservative estimate (low marketplace usage):** EUR 53,903/year
**High marketplace estimate:** EUR 269,903/year

## 9.2 Flyby/Lapis Estimated Cost

Based on enterprise spa/wellness pricing in the market:
- Estimated license: EUR 500-2,000/month (custom quote)
- Implementation: EUR 10,000-30,000 (one-time)
- Annual maintenance: 15-20% of license
- **Estimated 3-year TCO: EUR 48,000-120,000** (excluding transaction fees)

## 9.3 CarismaSoft Development Cost

| Element | Cost |
|---|---|
| Development (411 dev-days x EUR 400/day blended rate) | EUR 164,400 |
| UI/UX design (included above) | Included |
| Project management (15% overhead) | EUR 24,660 |
| Infrastructure (hosting, services) Year 1 | EUR 6,000 |
| **Total Year 1 (development + launch)** | **EUR 195,060** |

| Ongoing Annual Costs | Cost |
|---|---|
| Hosting + infrastructure | EUR 6,000-9,000 |
| Maintenance + bug fixes (20% of dev cost) | EUR 32,880 |
| Third-party services (Twilio, SendGrid, etc.) | EUR 3,000-5,000 |
| **Annual maintenance** | **EUR 41,880-46,880** |

## 9.4 Three-Year TCO Comparison

| Platform | Year 1 | Year 2 | Year 3 | 3-Year Total |
|---|---|---|---|---|
| Fresha (conservative) | EUR 53,903 | EUR 53,903 | EUR 53,903 | EUR 161,709 |
| Fresha (high marketplace) | EUR 269,903 | EUR 269,903 | EUR 269,903 | EUR 809,709 |
| Flyby/Lapis (mid estimate) | EUR 46,000 | EUR 18,000 | EUR 18,000 | EUR 82,000 |
| CarismaSoft | EUR 195,060 | EUR 46,880 | EUR 46,880 | EUR 288,820 |

## 9.5 Break-Even Analysis

**vs. Fresha (conservative):** CarismaSoft breaks even in approximately 4.2 years. However, this does not account for the productivity gains from integrated workflows, the elimination of manual data reconciliation, and the strategic value of data ownership.

**vs. Fresha (high marketplace):** CarismaSoft breaks even in approximately 11 months.

**Strategic value (not quantified in TCO):**
- Elimination of manual data sync between Fresha and Zoho (estimated 5-10 hours/week of staff time)
- Reduced double-booking and scheduling errors
- Custom business rule enforcement (discount controls, audit trails)
- Full data ownership and portability
- No vendor lock-in on payments or customer data
- Competitive differentiation through custom workflows

---

# 10. Open Questions & Assumptions

## 10.1 Assumptions

| ID | Assumption | Impact if Wrong |
|---|---|---|
| A-001 | Fresha provides complete data export (CSV or API) | Migration timeline extends; may require screen scraping or manual entry |
| A-002 | Talexio has a usable REST API for shift data | Staff scheduling requires manual import; increases ongoing operational overhead |
| A-003 | BOV POS has an integration-friendly SDK/API | Payment integration may require middleware or terminal replacement |
| A-004 | 50 concurrent users is sufficient peak capacity | Need to re-evaluate infrastructure sizing |
| A-005 | WhatsApp Business API approved for Carisma | Notifications fall back to email + SMS only |
| A-006 | Zoho API rate limits are sufficient for real-time sync | May need to batch some operations or upgrade Zoho plan |
| A-007 | EUR 400/day blended developer rate is achievable | Development cost increases proportionally |
| A-008 | Custom Gift App team will provide or build an API | Gift integration deferred until API available |
| A-009 | All 13 locations use the same cancellation policy | Need per-location policy configuration if not |
| A-010 | Deposit amount is standardized (EUR 10 or 20%) | Need configurable deposit rules per service if not |

## 10.2 Open Questions for Business Team

| ID | Question | Blocking? |
|---|---|---|
| Q-001 | What is the actual percentage of bookings from Fresha marketplace vs. direct? | No (cost analysis accuracy) |
| Q-002 | Does Talexio have a documented API? What endpoints are available? | Yes (staff scheduling design) |
| Q-003 | What is the BOV POS integration model? SDK? API? File-based? | Yes (payment module design) |
| Q-004 | Are there location-specific cancellation policies, or one global policy? | No (design flexibility) |
| Q-005 | What is the current process for barcode scanning? What hardware is in use? | No (Phase 2 item) |
| Q-006 | Are Aesthetics and Slimming consent forms standardized or per-treatment? | No (can add flexibility) |
| Q-007 | What is the maximum acceptable downtime for maintenance windows? | No (SLA definition) |
| Q-008 | Is there a preference for cloud provider (AWS, GCP, Azure)? | No (architecture decision) |
| Q-009 | Should the system support multiple currencies or EUR only? | No (default EUR; can add later) |
| Q-010 | What languages must the UI support at launch? English only? Maltese? | Yes (UI development scope) |
| Q-011 | Who owns the Custom Gift App? Can they commit to building an API? | Yes (integration timeline) |
| Q-012 | What is the desired go-live date? Is there a hard deadline? | Yes (resource planning) |

## 10.3 Risk Mitigation Strategies

| Risk | Mitigation |
|---|---|
| Data migration failures | Two weeks of parallel operation; complete rollback plan |
| Integration API unavailability | Each integration has a manual fallback (CSV import/export) |
| Performance under load | Load testing at 3x projected volume before go-live |
| User adoption resistance | Early involvement of receptionists in UAT; comprehensive training |
| Scope creep | Strict Phase 1 / Phase 2 boundary; change request process |
| Key person dependency | Modular architecture; comprehensive documentation; no single-developer modules |

---

# 11. Appendices

## Appendix A: Detailed Integration API Contracts

### A.1 CarismaSoft Public API (for Website Widget & External Consumers)

**Base URL:** `https://api.carismasoft.com/v1`

**Authentication:** API key in `X-API-Key` header

**Endpoints:**

```
GET  /locations                          # List active locations
GET  /locations/{id}/services            # Services available at location
GET  /availability                       # Query available slots
     ?location_id=uuid
     &service_id=uuid
     &date=YYYY-MM-DD
     &staff_id=uuid (optional)
POST /bookings                           # Create a booking
     {customer, service_id, location_id, start_time, staff_id?, deposit_payment_intent?}
GET  /bookings/{id}                      # Get booking details
PUT  /bookings/{id}/cancel               # Cancel a booking
     {reason}
GET  /packages/{code}/balance            # Check package/voucher balance
```

**Rate limits:** 100 requests/minute per API key

### A.2 Webhook Payloads (CarismaSoft -> External Systems)

**Booking created:**
```json
{
  "event": "booking.created",
  "timestamp": "2026-04-05T14:30:00Z",
  "data": {
    "booking_id": "uuid",
    "customer_id": "uuid",
    "service_id": "uuid",
    "location_id": "uuid",
    "staff_id": "uuid",
    "start_time": "2026-04-10T10:00:00Z",
    "end_time": "2026-04-10T11:00:00Z",
    "status": "Booked",
    "source": "Website",
    "value": 60.00,
    "currency": "EUR"
  }
}
```

**Payment completed:**
```json
{
  "event": "payment.completed",
  "timestamp": "2026-04-05T14:35:00Z",
  "data": {
    "payment_id": "uuid",
    "invoice_id": "uuid",
    "booking_id": "uuid",
    "amount": 60.00,
    "currency": "EUR",
    "method": "Stripe",
    "reference": "pi_xxxxx"
  }
}
```

---

## Appendix B: Business Rule Matrix

| Rule ID | Rule | Module | Enforcement | Override |
|---|---|---|---|---|
| BR-001 | Cannot close business day without all treatments confirmed | Booking | System block | No override |
| BR-002 | Discounts >10% require Manager approval | Payments | Workflow gate | Admin can change threshold |
| BR-003 | Discounts >20% require Admin approval | Payments | Workflow gate | No override |
| BR-004 | Complimentary treatments require Manager note | Payments | Required field | No override |
| BR-005 | All deletions/cancellations require reason | Booking | Required field | No override |
| BR-006 | Staff cannot be double-booked across locations | Booking | DB constraint | Manager override with audit |
| BR-007 | Room cannot be double-booked | Booking | DB constraint | Manager override with audit |
| BR-008 | Cancellation <24h forfeits deposit | Payments | Auto-applied | Manager override with audit |
| BR-009 | Refunds require Manager approval | Payments | Workflow gate | Admin can process without |
| BR-010 | Customer data edits logged to audit trail | CRM | Automatic | No override |
| BR-011 | Package expiry cannot be extended without Manager approval | Packages | Workflow gate | No override |
| BR-012 | Cross-location staff scheduling requires travel buffer | Booking | Validation rule | Manager override with audit |
| BR-013 | Online bookings require deposit | Booking | Payment gate | Configurable per service |
| BR-014 | Only qualified staff assigned to services | Booking | Validation rule | Manager override with audit |

---

## Appendix C: Report Specifications Matrix

| Report ID | Name | Dimensions | Metrics | Filters | Export | Frequency |
|---|---|---|---|---|---|---|
| RPT-OP-001 | Staff Utilization | Staff, Location | Booked hrs, Available hrs, % | Date range, Location, Staff | CSV, PDF | Daily/Weekly/Monthly |
| RPT-OP-002 | Service Utilization | Service, Location | Bookings, Revenue, Avg duration | Date range, Location, Category | CSV, PDF | Weekly/Monthly |
| RPT-OP-003 | Room Utilization | Room, Location | Occupied hrs, Available hrs, % | Date range, Location, Room | CSV, PDF | Weekly/Monthly |
| RPT-OP-004 | Booking Volume | Location, Status, Source | Total, By status, By source | Date range, Location | CSV, PDF | Daily/Weekly/Monthly |
| RPT-OP-005 | Cancellation Report | Location, Reason | Count, Rate, Revenue lost | Date range, Location | CSV, PDF | Weekly/Monthly |
| RPT-OP-006 | EOD Summary | Location | Treatments, Revenue, Open invoices | Date, Location | PDF | Daily |
| RPT-OP-007 | Rebooking Rate | Location, Service | Repeat visits, %, Avg interval | Date range, Location | CSV, PDF | Weekly/Monthly |
| RPT-FI-001 | Revenue by Location | Location | Gross, Net, Avg transaction | Date range | CSV, PDF, Sheets | Daily/Weekly/Monthly |
| RPT-FI-002 | Revenue by Service | Service, Location | Revenue, Volume, Avg price | Date range, Location | CSV, PDF | Weekly/Monthly |
| RPT-FI-003 | Revenue by Staff | Staff, Location | Revenue, Bookings | Date range, Location | CSV, PDF | Weekly/Monthly |
| RPT-FI-004 | Revenue by Source | Source | Revenue, Conv. rate | Date range | CSV, PDF | Monthly |
| RPT-FI-005 | Package Revenue | Package type | Sold, Revenue, Redemption rate | Date range | CSV, PDF | Monthly |
| RPT-FI-006 | Outstanding Invoices | Location, Age | Count, Total, Age analysis | Location | CSV, PDF | Daily |
| RPT-FI-007 | Payment Collection | Location, Method | Collection rate, Breakdown | Date range | CSV, PDF | Weekly/Monthly |
| RPT-FI-008 | Discount Report | Location, Staff | Count, Total, Avg %, By reason | Date range, Location | CSV, PDF | Weekly/Monthly |
| RPT-FI-009 | Complimentary Report | Location, Staff | Count, Value, Reasons | Date range, Location | CSV, PDF | Monthly |
| RPT-MK-001 | Customer Acquisition | Source, Location | New customers, By source | Date range | CSV, PDF | Monthly |
| RPT-MK-002 | Referral Performance | Referrer | Referrals, Conversions, Rate | Date range | CSV, PDF | Monthly |
| RPT-MK-003 | Online Booking Conv. | Source | Visits, Starts, Completions, Rate | Date range | CSV, PDF | Weekly/Monthly |
| RPT-MK-004 | Customer Retention | Location, Segment | Active, Churn rate, LTV | Date range | CSV, PDF | Monthly |
| RPT-MK-005 | Upsell Performance | Product, Location | Attempts, Success rate, Revenue | Date range | CSV, PDF | Monthly |
| RPT-CO-001 | Audit Trail | User, Action | All logged actions | Date range, User, Entity | CSV | On-demand |
| RPT-CO-002 | Deletion Log | Entity, User | Deleted records + reasons | Date range, User | CSV | On-demand |
| RPT-CO-003 | Discount Approval Log | Approver, Location | Approvals, Denials, Amounts | Date range | CSV, PDF | Monthly |
| RPT-CO-004 | GDPR Data Requests | Customer | Export, Anonymization | Customer | JSON, CSV | On-demand |

---

## Appendix D: Glossary

| Term | Definition |
|---|---|
| Appointment | A scheduled booking for a customer to receive one or more services at a specific location and time |
| Buffer time | The cleanup/setup time required between appointments for a staff member or room |
| Complimentary treatment | A service provided at no charge, typically as a membership benefit or goodwill gesture |
| EOD (End of Day) | The daily close-out process requiring all bookings to be resolved (attended, cancelled, or no-show) |
| Fairness algorithm | The logic that distributes booking assignments equitably among qualified staff members |
| HQ Admin | A system user with global access across all locations and full administrative privileges |
| Optimistic locking | A concurrency control method where conflicts are detected at commit time rather than prevented by locks |
| Package | A prepaid bundle of treatment sessions purchased at a discounted rate |
| POS | Point of Sale -- the hardware terminal used for in-store card payments |
| RBAC | Role-Based Access Control -- a method of restricting system access based on the user's assigned role |
| Soft delete | Marking a record as deleted without physically removing it from the database |
| Voucher | A code that entitles the bearer to a monetary credit or specific service |
| Walk-in | A customer who arrives without a prior appointment |

---

## Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 5 April 2026 | CTO Office | Initial SOW based on competitive research and requirements analysis |

---

**End of Document**

*This Statement of Work is confidential to Carisma Wellness Group and intended for use in vendor evaluation, development planning, and contract negotiation. Distribution outside the organization requires written approval from the CTO.*
