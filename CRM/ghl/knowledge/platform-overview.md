# GoHighLevel — Platform Overview

*Last updated: April 2026. Based on official GHL docs and LevelUp 2025 announcements.*

---

## What GHL Is

GoHighLevel (HighLevel) is an all-in-one sales, marketing, and CRM platform built primarily for marketing agencies and SaaS resellers. It consolidates ~15 separate tools into a single dashboard.

**What it replaces:**

| Tool | GHL Equivalent |
|------|----------------|
| HubSpot / Salesforce | CRM + Pipelines |
| ActiveCampaign / Klaviyo | Email + Workflow Automation |
| ClickFunnels | Funnel Builder |
| Calendly / Acuity | Calendar + Booking |
| Twilio / OpenPhone | SMS + Calls |
| Zendesk / Intercom | Live Chat + Unified Inbox |
| Teachable / Kajabi | Memberships + Courses |
| Hootsuite / Buffer | Social Planner |
| Birdeye / Podium | Reputation Management |
| FreshBooks / HoneyBook | Invoicing + Payments |

---

## Account Structure

| Level | Name | Description |
|-------|------|-------------|
| Top | **Agency Account** | Master account. Manages billing, white-label, SaaS mode, sub-accounts. |
| Sub | **Sub-Account (Location)** | One per client or brand. Fully isolated: own pipeline, contacts, calendars. |

**Carisma uses:** 1 Agency account → 3 sub-accounts (Spa, Aesthetics, Slimming)

---

## CRM & Contact Management

- Full contact profile: name, phone, email, tags, custom fields, DND flags, activity timeline
- **Smart Lists**: dynamic segments that auto-update based on tags, fields, stages, activity
- **Custom Objects**: create new data entities (e.g., "Treatment Record") with their own fields
- **Companies/B2B**: company records linking multiple contacts
- **Duplicate detection** with intelligent merge
- **Lead Scoring**: score contacts by actions; thresholds trigger workflows
- Bulk actions: tag, DND, assign, workflow enroll

---

## Pipelines & Opportunities

- Fully customizable pipeline stages (drag-and-drop)
- Multiple pipelines per sub-account
- **Status values:** `open` | `won` | `lost` | `abandoned`
- Kanban + list + funnel views with stage conversion rates
- Opportunity value tracking for pipeline revenue reporting
- Custom fields on opportunities
- Pipeline permissions: assign access by user/team/role (2025)

---

## Marketing Automation — Workflows

Workflows are GHL's automation engine. Everything routes through them.

### Key Triggers
- Form/survey submitted
- Appointment booked, cancelled, no-show, rescheduled
- Tag added/removed
- Contact created, field value changed
- Email opened/clicked
- Payment received
- Missed call
- Conversation reply received
- DND status changed
- Birthday / custom date reminder
- Smart List entry/exit
- Inbound webhook (from external system)
- Opportunity stage changed

### Key Actions
**Communication:** Send SMS, email, WhatsApp, Instagram DM, Facebook DM, GMB message, outbound call, voicemail drop, Slack notification
**CRM:** Add/remove tag, update contact field, update opportunity, create task, assign to user
**Scheduling:** Create/cancel appointment, send calendar invite
**Control flow:** If/Else branch, Wait (time delay or event-based), Go To, A/B split, End
**AI:** Conversation AI reply, intent detection, lead score update
**Integrations:** Outbound webhook, HTTP API call, Google Sheet row

### AI Assistant in Workflows
- Describe a workflow in plain text → AI builds the structure
- Suggests triggers, actions, optimizations

---

## Communication Channels (Unified Inbox)

All channels feed into one threaded conversation view per contact.

| Channel | Notes |
|---------|-------|
| SMS | LC-Phone (Twilio-based), two-way, voicemail drop, call recording |
| Email | LC-Email (Mailgun) or custom SMTP, drag-and-drop builder |
| Phone/Calls | Inbound/outbound, call recording, transcription |
| Facebook Messenger | Two-way DMs, comment auto-replies |
| Instagram DM | Two-way DMs, story mention triggers |
| WhatsApp | Native ($10/month add-on), two-way, media |
| Google My Business | Receive/reply to GMB messages |
| Live Chat | Website widget, real-time agent interface |
| TikTok DMs/Comments | Added 2025 |

**Missed Call Text-Back:** Auto-SMS when a call is missed — critical for lead capture.

---

## Calendar & Booking System

### Calendar Types

| Type | Use Case |
|------|----------|
| Simple | One-on-one bookings (single person) |
| Round Robin | Distributes across team (Optimize Availability or Equal Distribution) |
| Class/Group | Multiple attendees per slot |
| Service Calendar | Client selects service + staff (Calendly-style) |
| Multi-Day/Rentals | Multi-day bookings (added 2025) |

### Features
- Calendar Groups: combine multiple calendars under one booking link
- Availability per user: hours, buffer times, max daily appointments
- Appointment reminders: email, SMS, WhatsApp at configurable intervals
- No-show workflows: auto follow-up sequences
- Calendar Resources: rooms and equipment per booking
- Google Calendar + Outlook two-way sync
- Zoom/custom meeting link auto-generation
- Paid bookings via PayPal (added 2025)

---

## Funnel & Website Builder

- Multi-step funnels: opt-in → thank you → upsell → checkout
- One-click upsells/downsells, order bumps
- Full multi-page websites with custom domains
- Drag-and-drop page editor
- **AI Page Builder** (2025): generate pages/funnels from text prompt
- **Element Templates** (2025): save and reuse page sections

### Forms & Surveys
- Conditional logic (show/hide fields based on answers)
- Multi-step forms, sticky contact pre-fill
- Embeds: inline, popup, or full-page
- **Quiz Personality Styles** (2025): segment leads by response profiles

---

## Reputation Management

- Review request campaigns via SMS, Email, WhatsApp
- **AI-Powered Review Responses**: auto-responds to Google/Facebook reviews
- Review monitoring dashboard: ratings, volume, sentiment
- **Competitor analysis** (2025): compare ratings vs local competitors
- Integrates with Google Business Profile and Facebook

---

## Reporting & Analytics

### Built-in Reports
- **Attribution**: first-touch and last-touch, UTM tracking
- **Appointments**: bookings, no-shows, cancellations, completion rate
- **Calls**: inbound/outbound volume, duration, missed calls
- **Pipeline**: value by stage, conversion rates, velocity
- **Revenue**: total collected, invoices, subscription MRR
- **Email**: delivery, open, click, unsubscribe rates
- **Ads**: Google Ads and Meta Ads performance
- **Agent/User**: activity per team member

### UTM Attribution
GHL captures UTM params when a contact completes a native GHL action (form, booking, chat):
```
{{contact.attributionSource.utmSource}}      ← first touch
{{contact.attributionSource.utmCampaign}}
{{contact.lastAttributionSource.utmCampaign}} ← last touch
```

**Limitation:** UTM data only captured if contact completes a GHL action on the same landing page.

---

## AI Features (2025 Suite)

### 5 AI Agents
| Agent | Function |
|-------|----------|
| AI Receptionist | Answers calls 24/7, qualifies leads, books appointments |
| AI Scheduler | Reduces no-shows via smart reminders |
| AI Marketer | Personalized campaigns with auto follow-up |
| AI Reputation Agent | Auto-responds to reviews |
| AI Sales Agent | Converts leads via SMS, email, chat |

### Conversation AI (V3)
- Visual Flow Builder for chatbot conversation trees
- Intent-based routing across all channels
- Multilingual support
- Auto-refresh knowledge base from URLs
- Audio/voice note understanding (WhatsApp, IG, FB)

### Voice AI
- Handles inbound and outbound calls autonomously
- Live Actions during call: transfer, pull live data
- Post-call Actions: launch workflows, update CRM
- Voice AI Chat Widget on websites (2025)
- Outbound DNC compliance (2025)

### Content AI
- Generate emails, SMS, social posts, blog, ad copy
- Configurable brand voice and tone
- Best Time Recommendations for sends (2025)

---

## Memberships & Courses

- Full LMS: courses, modules, lessons, quizzes
- Drip content scheduling
- Free, paid (Stripe), or bundled access
- **Community Groups**: forum-style discussion
- **Go Live**: real-time live video within communities (2025)
- **Community Affiliates**: referral partner tracking (2025)

---

## Social Media Planner

- Platforms: Facebook, Instagram, LinkedIn, Twitter/X, GMB, TikTok, Pinterest, YouTube, **Threads**, **Bluesky** (2025)
- Schedule, bulk upload (CSV), content calendar
- **Social Listening** (2025): monitor brand mentions in real time
- AI Content Generator integrated
- Post approval workflow (agency → client review before publish)

---

## Invoicing & Payments

- Invoices with line items, taxes, discounts; brandable templates
- Recurring invoices / subscription billing
- Estimates → one-click convert to invoice
- **Payment gateways:** Stripe, PayPal, Square, NMI, Authorize.net, Razorpay
- One-time payments, subscriptions, installment plans
- E-commerce store with products, collections, shopping cart
- Coupons, shipping zones, Printify integration (2025)

---

## Agency Tools

### Snapshots
- Pre-packaged account templates (funnels, workflows, pipelines, calendars)
- Install into any new sub-account to deploy complete system instantly
- Version management (restore previous versions) — 2025

### SaaS Mode & White-Label
- Custom domain for the whole platform
- White-labeled iOS and Android mobile apps (SaaS Pro)
- Custom pricing tiers via Stripe sync
- Rebilling: mark up SMS/email/AI costs and charge clients

### Prospecting Tool
- Search local businesses via Google Maps data
- Local SEO audit with heatmaps
- **Bulk Prospecting** (2025)
