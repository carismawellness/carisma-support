# Lead Scoring System — Team Brief

**Date:** 26 February 2026
**Priority:** High

---

## Why We're Doing This

Right now, the qualifying questions on our Meta lead forms are inconsistent across brands and don't tell us much about who's actually serious. The sales team ends up calling everyone in the same order, wasting time on people who were just browsing while real buyers wait.

We're fixing this by adding three simple questions to every lead form. Each answer is worth a certain number of points. When the lead arrives in Zoho CRM, the system automatically adds up the points and shows a score from 1 to 9. The team can then see at a glance who's worth calling first.

This applies to every lead form across all three brands — Spa, Aesthetics, and Slimming. It doesn't matter if it's for a service, a package, a gift card, or a special offer. Every form gets the same three questions.

---

## The Three Questions

Read these carefully. The wording, the answer options, and the order they appear in must be exactly as written below. Do not change anything — the scoring system depends on exact matches.

**Question 1: "How soon would you like to get started?"**

- This week → worth 4 points
- Within 2 weeks → worth 3 points
- This month → worth 2 points
- Just exploring for now → worth 0 points

**Question 2: "Is this something you've experienced before?"**

- Yes, it's something I do regularly → worth 3 points
- Yes, I've tried it before → worth 2 points
- No, this would be a first for me → worth 1 point

**Question 3: "What would help you most right now?"**

- I'm ready to book → worth 3 points
- I'd like to speak with someone → worth 2 points
- I'd like to know more → worth 1 point
- Just looking around → worth 0 points

**How the score works:** Add up the points from all three answers. The lowest possible score is 1 (a first-timer who's just exploring and just looking around). The highest possible score is 9 (someone who does this regularly, wants to start this week, and is ready to book).

**What the scores mean:**

- **Score 8–9 (Highest priority)** — This person is experienced, wants to start this week, and is ready to book. Call them within 5 minutes.
- **Score 6–7 (High priority)** — Real intent, near-term timeline, engaged. Call them within an hour.
- **Score 4–5 (Medium priority)** — Some interest but not urgent. Follow up within the same day.
- **Score 1–3 (Low priority)** — Just browsing. Don't call. Let the automated nurture sequence handle them.

---

## Task 1: Update Every Lead Form on Meta

This is the biggest task. You need to go through every active lead form across all three brand ad accounts and replace whatever questions are currently there with the three questions above.

Here are the three ad accounts:

- **Carisma Spa** — act_654279452039150
- **Carisma Aesthetics** — act_382359687910745
- **Carisma Slimming** — act_1496776295316716

**Before you touch anything**, take a screenshot or make a list of every current lead form and the ad it belongs to. We need a record of what was there before.

**Here's how to do it, form by form:**

1. Log into Meta Ads Manager and select the brand's ad account.
2. Go to the Ads tab and look at all active and paused ads. Find every ad that uses an Instant Form.
3. You can't edit a published form directly — Meta doesn't allow that. So you'll need to duplicate the existing form, make the changes on the copy, and then swap it in.
4. On the duplicated form, do the following:
   - Remove all the existing custom questions (whatever's there now).
   - Add the three questions listed above, in that exact order, with the exact wording and answer options.
   - Make sure the form type is set to **Higher Intent**. If the old form was set to "More Volume", change it. Higher Intent adds a confirmation step that filters out junk submissions.
   - Keep the standard fields as they are: Full Name, Phone Number, Email.
   - Keep the existing privacy policy link and thank you screen — no need to change those.
5. Rename the new form using this pattern: `[Brand Code]_[Offer]_LeadScore_v2`. For example: `CS_SpaDay_LeadScore_v2` or `CA_Botox_LeadScore_v2` or `SLIM_FatFreeze_LeadScore_v2`.
6. Publish the new form.
7. Go back to the ad and swap it to use the new form instead of the old one.
8. Double-check that the ad is still active and delivering.
9. Repeat for every ad with a lead form in that account, then move to the next brand.

**When you're done**, share a simple table showing what you changed:

- Brand / Ad Name / Old Form Name / New Form Name / Confirmed Working

---

## Task 2: Make Sure the Forms Are Connected to Zoho CRM

Now that the forms have changed, we need to make sure the lead data — including the three new question responses — is flowing into Zoho CRM correctly.

**First, create three new fields in Zoho CRM:**

Go to Settings → Modules and Fields → open the module where our leads land (Deals or Leads, depending on what we use). Add these three fields:

- **Timeline Response** — Picklist field with these values: "This week" / "Within 2 weeks" / "This month" / "Just exploring for now"
- **Experience Level** — Picklist field with these values: "Yes, it's something I do regularly" / "Yes, I've tried it before" / "No, this would be a first for me"
- **Readiness Level** — Picklist field with these values: "I'm ready to book" / "I'd like to speak with someone" / "I'd like to know more" / "Just looking around"

**Then, update the integration mapping:**

Check how our Meta forms currently connect to Zoho (it might be through Zoho Flow, Zapier, or a direct Facebook integration). Whatever tool it is, go into the mapping settings and make sure:

- The response to Question 1 maps to the "Timeline Response" field
- The response to Question 2 maps to the "Experience Level" field
- The response to Question 3 maps to the "Readiness Level" field

**Then, test it:**

Submit a test lead on each brand's form using your own phone number. Go into Zoho CRM and check that:

- The lead appeared
- All three fields (Timeline Response, Experience Level, Readiness Level) are filled in with the correct values

Do this for all three brands. Take a screenshot of each test lead in Zoho showing the fields populated.

---

## Task 3: Check That WhatsApp and Email Automations Still Work

This is important because when you duplicate a lead form in Meta, the new form gets a new ID. If any of our automations (WhatsApp auto-replies, confirmation emails, SMS) were linked to the old form by its ID, they'll break silently — leads will come in but the automated messages won't send.

**Here's what to check:**

1. Make a list of every automation that triggers when someone submits a lead form. This includes WhatsApp messages, emails, SMS, or anything else that fires automatically.
2. For each automation, check whether it's still connected to the correct (new) form. If it was pointing to the old form, re-point it to the new one.
3. While you're at it, read through the automated message content. If any messages referenced the old questions or answers, update the copy to match the new questions.
4. Test each automation end-to-end: submit a test lead on Meta, then confirm the WhatsApp message arrives, the email arrives, and any other automated messages fire correctly.
5. Do this for all three brands.

**When you're done**, confirm in writing that everything is working. If anything broke and you had to fix it, note what it was and what you did.

---

## Task 4: Build the Scoring Logic Inside Zoho CRM

This is the part where we make the score calculate automatically. Every time a new lead comes in, Zoho should look at the three responses, add up the points, and write the score to the record — no manual work required.

**First, create two more fields in Zoho CRM** (same module as before):

- **Lead Score** — Number field, minimum 1, maximum 9
- **Lead Priority** — Picklist field with these values: "Highest" / "High" / "Medium" / "Low"

**Then, create the automation:**

Go to Settings → Automation → Workflow Rules. Create a new rule with these settings:

- **Module:** Deals (or Leads — whatever we use)
- **When to trigger:** When a record is created
- **Condition:** Timeline Response is not empty

For the action, add a Custom Function and paste this Deluge script:

```
timeline = input.Timeline_Response;
experience = input.Experience_Level;
readiness = input.Readiness_Level;

score = 0;

// Question 1: Timeline (0 to 4 points)
if (timeline == "This week") { score = score + 4; }
else if (timeline == "Within 2 weeks") { score = score + 3; }
else if (timeline == "This month") { score = score + 2; }
else if (timeline == "Just exploring for now") { score = score + 0; }

// Question 2: Experience (1 to 3 points)
if (experience == "Yes, it's something I do regularly") { score = score + 3; }
else if (experience == "Yes, I've tried it before") { score = score + 2; }
else if (experience == "No, this would be a first for me") { score = score + 1; }

// Question 3: Readiness (0 to 3 points)
if (readiness == "I'm ready to book") { score = score + 3; }
else if (readiness == "I'd like to speak with someone") { score = score + 2; }
else if (readiness == "I'd like to know more") { score = score + 1; }
else if (readiness == "Just looking around") { score = score + 0; }

// Make sure the score is at least 1
if (score < 1) { score = 1; }

// Set the priority label based on the score
priority = "Low";
if (score >= 8) { priority = "Highest"; }
else if (score >= 6) { priority = "High"; }
else if (score >= 4) { priority = "Medium"; }

// Save the score and priority to the record
zoho.crm.updateRecord("Deals", input.Deal_Id, {"Lead_Score": score, "Lead_Priority": priority});
```

Save and activate the rule.

**Important note about the script:** The strings in the script (like "This week", "Yes, it's something I do regularly", etc.) must match the Zoho picklist values exactly — same capitalisation, same punctuation, same spacing. If there's even a small mismatch, the score won't calculate. Double-check this carefully.

**Then, test it with these four scenarios:**

1. **Best case:** Answer "This week" + "Yes, it's something I do regularly" + "I'm ready to book". Expected score: **9**, priority: **Highest**.
2. **Strong lead:** Answer "Within 2 weeks" + "Yes, I've tried it before" + "I'd like to speak with someone". Expected score: **7**, priority: **High**.
3. **Medium lead:** Answer "This month" + "No, this would be a first for me" + "I'd like to know more". Expected score: **4**, priority: **Medium**.
4. **Weakest lead:** Answer "Just exploring for now" + "No, this would be a first for me" + "Just looking around". Expected score: **1**, priority: **Low**.

Submit test leads for all four scenarios and verify the scores match. If any of them don't, the most likely issue is a string mismatch between the form responses and the Zoho picklist values.

---

## Task 5: Make the Score Visible on Every CRM Card

The whole point of this system is that the team can see lead quality at a glance. The score needs to be right there at the top of the card — not buried in a section they have to scroll to or click into.

**Here's what to do:**

1. Go to Settings → Modules and Fields → Deals (or Leads) → open the Layout Editor.
2. Move the **Lead Score** and **Lead Priority** fields to the very top of the card, right below the contact name and phone number. These should be the first thing anyone sees when they open a record.
3. If Zoho lets you colour-code picklist values, set up the Lead Priority field like this:
   - Highest = Red or dark orange (so it jumps out)
   - High = Orange
   - Medium = Yellow
   - Low = Grey
4. Also make sure the three response fields (Timeline Response, Experience Level, Readiness Level) are visible on the card just below the score. The team should be able to see both the score and the raw answers without clicking into anything.
5. Save the layout.

**When you're done**, take a screenshot of a deal card with the score and priority displayed at the top. Share it for approval before considering this task complete.

---

## Final Checklist

Go through this list before marking the project as done. Every single item needs to be confirmed:

**Task 1 — Lead Forms:**
- [ ] All lead forms across all three brands have been updated
- [ ] A before/after record of every form has been documented
- [ ] All forms are set to Higher Intent

**Task 2 — Zoho Integration:**
- [ ] Timeline Response, Experience Level, and Readiness Level fields created in Zoho
- [ ] Meta → Zoho field mapping updated for all three brands
- [ ] Test leads submitted and verified for all three brands

**Task 3 — Automations:**
- [ ] All WhatsApp automations confirmed working on the new forms
- [ ] All email automations confirmed working on the new forms
- [ ] Any broken automations fixed and documented

**Task 4 — Scoring Logic:**
- [ ] Lead Score and Lead Priority fields created in Zoho
- [ ] Workflow rule with Deluge script created and activated
- [ ] All four test scenarios passed with correct scores

**Task 5 — Card Layout:**
- [ ] Lead Score and Lead Priority displayed at the top of the card
- [ ] Priority field is colour-coded
- [ ] Raw response fields visible on the card
- [ ] Screenshot shared for approval

---

## Rules — Read Before You Start

1. **Do not change the question wording.** Copy it character for character. The scoring breaks if the text doesn't match exactly.
2. **Do not reorder the answer options.** The highest-intent options appear first on purpose.
3. **Do not skip the Higher Intent form setting.** Every single form must use it.
4. **Do not activate any paused campaigns.** You're only updating forms. Campaign activation is a separate decision that someone else will make.
5. **Test everything end-to-end before marking anything as done.** A test lead should flow all the way from Meta form submission → into Zoho CRM → score calculated automatically → visible on the card. If any step in that chain doesn't work, the task isn't finished.

---

*Last updated: 26 February 2026*
