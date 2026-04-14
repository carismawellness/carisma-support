# CarismaSoft Requirements Inventory & Analysis

**Document Source:** [CarismaSoft Excel Requirements](https://docs.google.com/spreadsheets/d/1n8wFJvfRTZSbxRUACuMgda9bhmSo5AGD/edit?gid=621129637#gid=621129637)  
**Analysis Date:** 2026-04-05  
**Status:** Phase 1 Development

---

## Executive Summary

CarismaSoft is a custom-built business management system designed for Carisma Spa, Aesthetics, and Slimming operations across multiple locations. The system integrates with the Zoho ecosystem (CRM, Inventory, Subscriptions/Billing) and manages core business workflows: customer management, appointment scheduling, staff roster management, membership/packages, and reporting/analytics.

**Key Characteristics:**
- Multi-location support with location-specific configuration
- Role-based access control with permission hierarchy
- Real-time appointment and staff availability tracking
- Fraud protection and audit trail requirements
- Integration with payroll system (Talexio) for staff scheduling
- Planned AI enhancements in Phase 2 & 3

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Customer Relationship Management (CRM Module)

**Core Functionality:**
- Store, update, and edit customer details with flexibility to create custom fields
- Customer segmentation (VIPs, frequent visitors)
- Link customer profiles to bookings, services, and staff assignments
- Auto-sync customer updates with Zoho CRM

**Data Points Tracked per Customer:**
- Contact information (phone, email, address, custom fields)
- Booking history (location, service, staff, date, status)
- Sales and invoice information
- Service preferences and therapist preferences
- Membership/package status

**Customer Segmentation Capabilities:**
- VIP customers
- Frequent visitors
- Active vs. inactive
- By service type preference
- By location

---

### 1.2 Appointment Management

**Calendar & Scheduling Features:**
- Intuitive, user-friendly calendar view
- Drag-and-drop functionality for bookings
- Filters for: location, treatment type, staff, availability
- Easy scheduling for repeat/rebooking visits
- Support for multi-service bookings
- Recurring appointment management

**Booking Status Tracking:**
- Status progression: Inquiry → Booked → Attended → Paid
- Show/No-Show management
- Cancellation and deletion with reason tracking
- Booking confirmations via SMS/email/WhatsApp
- Online payment indication display

**Location-Specific Scheduling:**
- Filter appointments by location
- Display location-specific staffing info on calendar
- Manage booking limits per location based on available staff
- Track available slots by location and service

**Appointment Confirmations & Reminders:**
- Automated confirmation upon booking (SMS/email/WhatsApp)
- Appointment reminders before scheduled time
- Follow-up reminders (thank you messages, review requests)
- Customizable confirmation templates per brand (Spa, Aesthetics, Slimming)

---

### 1.3 Roster & Staff Management

**Staff Information & Availability:**
- Track therapist/staff availability by time slot and location
- Real-time availability updates on calendar
- Assign staff to specific locations and shifts
- Track which therapists can perform which services
- Staff qualifications and certifications management

**Shift & Schedule Management:**
- Integration with Talexio payroll system for shift data
- Track staff schedules across locations
- Prevent overbooking based on staff availability
- Manage booking limits per location based on available therapists

**Staff Assignment Logic:**
- Smart assignment based on therapist availability and service capability
- Update CRM automatically when staff assigned to bookings
- Track therapist utilization rates

---

### 1.4 Services, Products & Packages

**Service Management:**
- Store complete service/treatment catalog
- Price management per location (location-specific pricing)
- Management of which services are available at which location
- Service descriptions and duration

**Packages & Memberships:**
- Create and manage package offerings (e.g., 5-treatment packages)
- Monthly membership subscriptions with included treatments
- Track complimentary/free treatments awarded as membership benefit
- Track complimentary treatment usage and credits remaining
- Gift packages management (integration with existing custom app)

**Products:**
- Retail product inventory
- Product pricing per location
- Availability management by location

**Pricing & Discounts:**
- Price storage per location
- Support for promotional packages
- Discount management with permission controls (see Security section)

---

### 1.5 Payments & Billing

**Payment Processing:**
- Integration with POS processors to send payment requests upon purchase
- Track payment status for each booking (paid, unpaid, partial)
- Support for advance deposits/down payments
- Online payment integration for website bookings

**Billing & Membership Sync:**
- Synchronize monthly free treatment credits with Zoho Subscriptions (Zoho Billing)
- Track membership billing cycles
- Invoice generation and tracking

---

### 1.6 Inventory Management

**Retail Inventory:**
- Track product inventory levels
- Synchronize retail sales with Zoho Inventory
- Location-specific inventory management
- Low-stock alerts

---

### 1.7 Notifications & Communications

**Channel Support:**
- SMS notifications
- Email notifications
- WhatsApp notifications
- Appointment confirmation messages
- Reminder messages
- Follow-up communications

**Customization:**
- Brand-specific templates (Spa "Beyond the Spa", Aesthetics "Glow with Confidence", Slimming personas)
- Customizable messaging per brand voice

---

### 1.8 Growth & Engagement Features

**Customer Retention:**
- Rebooking encouragement mechanisms
- Upsell and cross-sell product recommendations at checkout
- Referral system capabilities
- Gift giving/gift cards system

**Precision Scheduling:**
- Smart scheduling recommendations based on appointment history
- Service bundling suggestions
- Therapist matching based on customer preferences

---

### 1.9 Website Integration

**Online Booking:**
- Embed booking calendar into website
- Direct booking from website (connect with website booking system)
- Show real-time availability on website

**Social Media Integration:**
- Direct booking from Instagram
- Direct booking from Facebook
- Social media calendar synchronization (planned Phase 2)

**Analytics Integration:**
- Track conversions from online bookings
- Integrate with Google Analytics 4
- Integrate with Meta (Facebook/Instagram) for conversion tracking
- Barcode scanner integration for retail/check-in

---

## 2. TECHNICAL REQUIREMENTS & SPECIFICATIONS

### 2.1 Architecture & Platform

**Base Platform:**
- Built on Zoho CRM ecosystem
- Custom modules and extensions via Zoho CRM APIs
- Multi-location support with location-based filtering and data isolation

**Database & Data Storage:**
- Centralized data store with location-specific access controls
- Support for custom fields (flexible schema)
- Real-time data synchronization

### 2.2 User Interface & Experience

**Calendar Interface:**
- Intuitive, user-friendly design
- Drag-and-drop functionality
- Real-time updates
- Location-based filtering
- Multi-view support (day, week, month)

**Responsive Design:**
- Web application (primary)
- Mobile compatibility (for staff and admin access)

**Customization for Brands:**
- UI/UX customizable per brand (Spa, Aesthetics, Slimming)
- Color schemes and icons per brand
- Customizable text and terminology per brand

---

## 3. INTEGRATION REQUIREMENTS & DATA FLOWS

### 3.1 Primary Integrations

#### **Zoho CRM**
**Core Integration:**
- Use Zoho CRM as master customer database
- Custom CRM objects: Customers, Bookings, Services, Staff, Locations
- Auto-sync customer profile updates between custom app and Zoho CRM
- Push appointment data to Zoho CRM Deals/Bookings module

**Data Flow:**
- Customer updates → Sync to Zoho CRM
- Booking creation → Create Deal/Appointment in Zoho CRM
- Staff assignments → Update Zoho CRM with assigned therapist info
- Discount approvals → Log notes in Zoho CRM

#### **Zoho Inventory**
**Integration Point:**
- Track retail product inventory
- Sync retail sales transactions to Zoho Inventory
- Link inventory transactions to bookings (products sold)

**Data Flow:**
- Product sales at checkout → Create inventory transaction in Zoho Inventory
- Inventory adjustments → Sync to CarismaSoft

#### **Zoho Subscriptions (Billing)**
**Integration Point:**
- Membership/subscription management
- Monthly free treatment credit allocation and tracking
- Subscription billing cycles and renewals

**Data Flow:**
- Monthly subscription billing → Award treatment credits
- Treatment redemption → Update Zoho Subscriptions credit balance
- Membership renewals → Auto-sync with appointment availability

#### **Talexio (Payroll & Scheduling)**
**Integration Point:**
- Staff shift data and availability
- Therapist scheduling information
- Real-time staff availability for booking limits

**Data Flow:**
- Talexio shifts → Import staff availability into CarismaSoft calendar
- Staff assigned to bookings → Potentially export back to Talexio for payroll sync
- Location-shift assignments → Determine booking capacity

#### **Custom Gift Management App**
**Integration Point:**
- Gift package bookings and redemptions
- Link gift purchases to gift usage

**Data Flow:**
- Gift bookings in CarismaSoft → Sync with custom gift app
- Gift redemptions → Update gift balance in both systems

#### **POS Payment Processors**
**Integration Point:**
- Send payment requests from CarismaSoft to POS
- Receive payment confirmation

**Data Flow:**
- Checkout in CarismaSoft → Send payment request to POS processor
- Payment confirmation → Update booking payment status in CarismaSoft

#### **Zoho Analytics**
**Integration Point:**
- Reporting and dashboard data
- Business metrics and KPIs

**Data Flow:**
- Appointment data → Sync to Zoho Analytics
- Revenue data → Sync to Zoho Analytics
- Staff utilization → Sync to Zoho Analytics

#### **Website & Booking System**
**Integration Point:**
- Online appointment booking
- Real-time availability display
- Embedded booking widget

**Data Flow:**
- Website booking request → Create appointment in CarismaSoft
- CarismaSoft availability → Display on website
- Online payment → Link to CarismaSoft booking record

#### **Google Analytics 4**
**Integration Point:**
- Track online booking conversions
- Monitor user journey

#### **Meta Ads & Facebook/Instagram**
**Integration Point:**
- Track conversions from social media ads
- Sync booking data for conversion measurement

### 3.2 Data Flow Summary

```
Zoho CRM ←→ CarismaSoft ←→ Zoho Inventory
             ↓
          Zoho Subscriptions (Billing)
             ↓
          Talexio (Payroll/Scheduling)
             ↓
          Custom Gift App
             ↓
          POS Processors
             ↓
          Website/Booking System
             ↓
          Zoho Analytics
             ↓
          GA4, Meta Ads
```

---

## 4. SECURITY & COMPLIANCE REQUIREMENTS

### 4.1 Access Control & Authorization

**User Roles:**
- Receptionist (booking, customer management, basic dashboard)
- Therapist/Service Provider (view own schedule, customer info, treatment notes)
- Manager (override capabilities, approval authority, reporting access)
- Admin (system configuration, user management, all audit access)
- Custom roles (flexibility to create additional roles as needed)

**Permission-Based Controls:**
- Role-based permission matrix (receptionist ≠ manager ≠ admin capabilities)
- Specific permission controls for sensitive actions:
  - **Discounts:** Only designated roles can apply; amounts above threshold require manager approval
  - **Booking Cancellation/Deletion:** Restricted to specific roles; tracked with reason
  - **Customer Data Editing:** Role-based restrictions with audit logging
  - **Pricing Changes:** Manager/Admin only

### 4.2 Fraud Prevention & Protection

**Discount & Complimentary Control:**
- Require management notes for every discount applied
- Require management notes for every complimentary (free) treatment
- Require management notes for any booking deletion/cancellation
- Set approval thresholds for discounts above certain amounts (e.g., >20% requires manager approval)

**Permission-Based Fraud Prevention:**
- Only designated users can delete or cancel service records
- Only designated users can issue refunds/credits
- Only designated users can apply package/membership credits

### 4.3 Audit & Compliance

**Audit Trail Requirements:**
- Track all user actions (who, what, when):
  - Customer profile changes
  - Booking creation, modification, cancellation
  - Discount/complimentary approvals
  - Payment status changes
  - Staff assignments
- Maintain complete historical record for compliance
- Support audit report generation

**Data Integrity:**
- Track deletions and cancellations in separate logs (not actually deleted)
- Invoice logs showing all modifications (what was deleted, by whom, when, why)
- Maintain data lineage for financial reconciliation

### 4.4 End-of-Day (EOD) Reporting

**EOD Reconciliation Requirements:**
- Cannot close the day without confirming all treatments are marked as attended
- Cannot generate EOD reports without complete booking status confirmation
- Prevents revenue leakage from untracked treatments

---

## 5. REPORTING & ANALYTICS REQUIREMENTS

### 5.1 Operational Reports

**Utilization Reports:**
- Therapist/staff utilization rates by location
- Service utilization by location
- Room/space utilization by location
- Availability vs. booked time analysis

**Booking Reports:**
- Total bookings by location, therapist, service, date range
- Booking status distribution (booked, attended, cancelled, no-show)
- Repeat booking rates (rebooking analysis)

**End-of-Day (EOD) Reports:**
- Daily revenue summary by location
- Daily treatment completion summary
- Open invoice tracking (unpaid treatments)
- Cancellation and deletion logs with reasons

**Inventory & Sales Reports:**
- Product sales by location
- Inventory levels by location
- Retail revenue by product

### 5.2 Financial Reports

**Revenue Tracking:**
- Revenue by location
- Revenue by service type
- Revenue by therapist/staff
- Revenue by booking source (online, phone, walk-in, social media)
- Package/membership revenue tracking

**Payment Status Tracking:**
- Outstanding invoices (unpaid treatments)
- Payment collection rates
- Advance deposit tracking

**Discount & Complimentary Tracking:**
- Total discounts applied (by amount and %)
- Complimentary treatments issued
- Discount approvals and denials

### 5.3 Marketing & Growth Analytics

**Referral Tracking:**
- New customer source tracking
- Referral program conversions

**Online Booking Analytics:**
- Website booking conversion rates
- Social media booking conversions
- GA4 integration for funnel analysis

**Rebooking Analytics:**
- First-time vs. repeat customer rates
- Average rebooking interval
- Upsell success rates (products at checkout)

### 5.4 Dashboard & Analytics Integration

**Zoho Analytics Synchronization:**
- Real-time or near-real-time sync of appointment data
- Revenue data sync for financial dashboards
- Staff utilization sync
- Customer segment analytics

**KPI Tracking:**
- Daily revenue
- Therapist utilization
- Customer retention rates
- Rebooking rates
- Cancellation/no-show rates

---

## 6. CONSTRAINTS & LIMITATIONS

### 6.1 Known Limitations

**Zoho CRM Calendar Limitations:**
- Cannot filter Zoho CRM calendar view by location (workaround: use custom app calendar interface)
- Custom app will maintain its own location-filtered calendar view

### 6.2 Business Rules & Constraints

**Booking Constraints:**
- Cannot generate EOD reports without all treatments marked attended or cancelled
- No bookings can be left in "booked" status without resolution

**Multi-Location:**
- All features must support scalability across multiple locations
- Location-specific pricing, availability, and staffing must be enforceable
- Cross-location visibility for managers/admin only (role-based)

**Data Synchronization:**
- Must maintain data consistency across multiple integrated systems (Zoho CRM, Inventory, Subscriptions, Talexio)
- Real-time or near-real-time sync requirements for staff availability and appointments

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Scalability

**Multi-Location Support:**
- System must scale to support all 10+ Carisma locations
- Location-specific customization (pricing, services, staff, branding)
- No performance degradation with added locations

**User Concurrency:**
- Support simultaneous access from multiple staff members (receptionists, therapists, managers at each location)

### 7.2 Performance & Reliability

**Real-Time Updates:**
- Staff availability updates reflected immediately on calendar
- Appointment confirmations processed without delay
- Notifications sent reliably and promptly

**Data Consistency:**
- Strong consistency across integrated systems
- Transactional integrity for payment and booking operations

### 7.3 Usability

**Intuitive Interface:**
- Calendar interface must be user-friendly for non-technical staff (receptionists)
- Drag-and-drop functionality for ease of scheduling
- Minimal training required

**Mobile Support:**
- Staff access from mobile devices (schedule checking, availability updates)
- Admin/manager mobile access to reporting

---

## 8. GAPS & MISSING DETAILS

### 8.1 Underspecified Requirements

1. **Barcode Scanner Integration**
   - Mentioned in CRM module requirements
   - Use case not detailed (check-in? product scanning? inventory?)
   - Integration specifications missing

2. **Advanced Deposit/Down Payments**
   - Requirement mentioned but not detailed
   - Partial payment workflows not specified
   - Refund policies not defined

3. **Customization & "Custom Connections"**
   - Mentioned but very vague
   - What types of custom connections are anticipated?
   - API exposure level not defined

4. **Phone Integration for Appointments**
   - Website and social media booking detailed
   - Phone booking workflow not documented
   - IVR system or phone-to-system flow not specified

5. **Third-Party Template Connections**
   - Mentioned as CRM module item
   - What templates? What connections?
   - Integration mechanics unclear

### 8.2 Features Requiring Clarification

1. **Complimentary Treatment Tracking with Zoho Subscriptions**
   - Sync mechanism unclear
   - Credit allocation logic not detailed
   - Expiration policies not specified

2. **Precision Scheduling**
   - Algorithm for upsell/cross-sell recommendations not specified
   - Rebooking encouragement mechanics undefined

3. **"Additional" Category in Requirements**
   - Vague category with no details
   - Appears incomplete

4. **Test Data & Migration**
   - Data migration from existing systems mentioned as requirement
   - Source systems and mapping not detailed
   - Migration strategy and validation approach missing

5. **Conflict Resolution**
   - Overbooking prevention not detailed
   - Double-booking scenarios unclear
   - What happens when capacity limits are hit?

### 8.3 Future Enhancement Specifics

**PHASE 2: AI BDR Agents**
- Scope of "reply and tackle all customer inquiries" undefined
- What types of inquiries? (booking only? support issues? sales questions?)
- Integration mechanism with CarismaSoft not detailed
- Training data strategy not specified

**PHASE 3: General Personalization & Automation**
- Goals vague ("upgrade, enhance, and automate")
- Specific automation targets not identified
- Personalization dimensions not defined

---

## 9. INTEGRATION ARCHITECTURE DIAGRAM

```
                    ┌─────────────────────────┐
                    │   CarismaSoft Core      │
                    │  (Custom App w/Zoho)    │
                    └──────────┬──────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
           ┌────▼────┐    ┌────▼────┐   ┌───▼────┐
           │ Zoho    │    │ Zoho    │   │ Zoho   │
           │ CRM     │    │Inventory│   │Billing │
           │(Customers)   │(Products)   │(Subs)  │
           └────┬────┘    └────┬────┘   └───┬────┘
                │              │            │
                └──────────────┼────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
            ┌────▼────┐  ┌─────▼────┐  ┌───▼────┐
            │ Talexio │  │ Website  │  │Zoho    │
            │(Payroll)│  │ Booking  │  │Analytics
            └─────────┘  └─────┬────┘  └────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
             ┌───▼──┐  ┌──────▼──┐  ┌──────▼──┐
             │ GA4  │  │Meta Ads │  │Custom   │
             │      │  │         │  │ Gift App│
             └──────┘  └─────────┘  └─────────┘
```

---

## 10. SUMMARY TABLE: Requirements by Category

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| **Functional Requirements** | 34+ | Defined | Core modules well-documented; some details missing |
| **Integration Points** | 8 Major | Defined | Zoho ecosystem + Talexio + external services |
| **Security & Compliance** | 6 | Defined | Audit, fraud protection, role-based access |
| **Reporting & Analytics** | 10+ Report Types | Defined | Operational, financial, marketing dashboards |
| **Future Phases** | 2 | Conceptual | Phase 2 (AI BDR) and Phase 3 (automation/personalization) |
| **Gaps/Underspecified** | 10+ | Needs Clarification | Barcode scanning, advanced deposits, precision scheduling, etc. |

---

## 11. NEXT STEPS & RECOMMENDATIONS

1. **Clarify Underspecified Requirements** — Schedule requirements workshop to detail:
   - Barcode scanning use cases
   - Advanced deposit/partial payment workflows
   - Precision scheduling algorithm
   - AI BDR scope and capability boundaries

2. **Data Migration Planning** — Document:
   - Current system sources
   - Data mapping requirements
   - Validation and reconciliation approach
   - Cutover timeline

3. **Phase 2 AI BDR Specifications** — Define:
   - NLU requirements (languages: English, Maltese, French, Italian, German, Spanish)
   - Intent classification categories
   - Booking flow automation
   - Escalation to human agents

4. **Performance & Load Testing Strategy** — Estimate:
   - Concurrent user load per location
   - Daily transaction volume
   - Sync frequency requirements between systems
   - Real-time update latency requirements

5. **Security & Compliance Review** — Document:
   - Data retention policies
   - GDPR/local compliance requirements
   - Backup and disaster recovery procedures
   - Penetration testing scope
