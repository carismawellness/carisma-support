# Customer Query Validation Tests

This document defines the expected handling for various customer queries within the Carisma Spa CRM system. It maps common inquiries to the appropriate Skills and Knowledge Base (KB) entries.

## 1. Core High-Relevance Queries

| Customer Query | Expected Skill | Expected KB Match (QID) | Notes |
|:---|:---|:---|:---|
| "How do I book an appointment at Carisma Spa?" | `close-the-booking.md` | `S1.1` | Direct booking intent. |
| "What is your cancellation policy?" | `cancellation-recovery.md` | `S1.2` | Policy inquiry. |
| "Can I reschedule my booking?" | `cancellation-recovery.md` | `S4.1` | Rescheduling intent. |
| "What happens if I miss my appointment?" | `cancellation-recovery.md` | `S4.2` | No-show policy inquiry. |
| "I want to schedule a spa session, how do I do that?" | `close-the-booking.md` | `S1.1` | Direct booking intent. |
| "What's your no-show policy?" | `cancellation-recovery.md` | `S4.2` | No-show policy inquiry. |
| "Can I change my appointment time?" | `cancellation-recovery.md` | `S4.1` | Rescheduling intent. |
| "Do you take credit cards?" | `consult-and-pitch.md` | `S5.1` | Payment method inquiry. |

## 2. Intent-Based & Soft Inquiries

| Customer Query | Expected Skill | Expected Goal | Notes |
|:---|:---|:---|:---|
| "I'm interested in a spa day but not sure where to start" | `first-time-converter.md` | Match to Booking | Discovery phase. Needs diagnostic questions. |
| "I'm worried about the cost" | `objection-buster.md` | Match to Pricing | Reframe as investment in self. |
| "What should I expect on my first visit?" | `first-time-converter.md` | Match to Expectations | Reassure and describe sanctuary. |
| "I forgot my appointment, what happens now?" | `cancellation-recovery.md` | Match to No-Show Policy | Lead with warmth/flexibility. |

## 3. Brand-Wide & Multi-Brand Queries

| Customer Query | Expected KB Match (QID) | Notes |
|:---|:---|:---|
| "Do you offer gift cards?" | `S2.2` (ALL Brands) | Gift card utility across all brands. |
| "What payment methods do you accept?" | `S5.1` (ALL Brands) | Consistent payment policy. |
| "Can I reschedule my appointment?" | `S4.1` (ALL Brands) | Consistent rescheduling policy. |

## 4. Low Relevance & Out-of-Scope

| Customer Query | Relevance | Expected Handling |
|:---|:---|:---|
| "Do you offer services in London?" | **Low** | Acknowledge local locations (refer to location list). |
| "What are the best spas in Europe?" | **Low** | Pivot back to Carisma's unique sanctuary value. |
| "How do I become a therapist?" | **Very Low** | Out of scope for CRM agent (refer to HR/Careers). |
| "Is this FDA approved?" | **Partial** | Address safety concerns; treatments are non-clinical/wellness focused. |

---
**Last Updated:** 2026-02-22  
**Derived from:** User-provided test cases for Phase 3 Quick Wins validation.
