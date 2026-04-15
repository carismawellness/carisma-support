# Publication Checklist — CMS Upload

**Used by:** Human CMS uploader after Gate 3 approval
**One checklist per post**

---

## Pre-Upload Verification

Before opening the CMS:

- [ ] Gate 3 approval received (human read and approved the Google Doc)
- [ ] Google Doc URL recorded in RUNBOOK.md archive log
- [ ] Post added to content calendar tracker (what tool/sheet is used for this)
- [ ] URL slug confirmed: `/blog/[slug]`

---

## CMS Upload Steps

### Meta Data
- [ ] **Meta title** entered in CMS — verify character count in preview (50–60 chars)
- [ ] **Meta description** entered in CMS — verify character count in preview (145–160 chars)
- [ ] **URL slug** set: `/blog/[slug]` (matches what was in the FINAL.md)

### Headings
- [ ] **H1** set correctly — NOT auto-generated from the page title
- [ ] **H2 and H3** applied as proper heading tags — not bold text, not just larger font

### Content
- [ ] Full article body pasted (from Google Doc, post-Gate 3 edits incorporated)
- [ ] All internal links present and tested — click each one to verify no 404 errors
- [ ] Internal links are underlined/styled correctly and point to the right page

### Media
- [ ] **Featured image** added:
  - Minimum 800×400px
  - Alt text: include the primary keyword
  - File name: `[slug]-featured.jpg` (descriptive, not "image123.jpg")

### Authorship & Taxonomy
- [ ] **Author** set to appropriate persona:
  - Spa posts: Sarah (or Sarah Caballeri if the CMS has the full name)
  - Aesthetics posts: Sarah
  - Slimming posts: Katya
- [ ] **Category tag** set:
  - Spa posts: `Spa Treatments` (or equivalent)
  - Aesthetics posts: `Aesthetics` (or equivalent)
  - Slimming posts: `Weight Loss` (or equivalent)
- [ ] **Publication date** set (schedule or publish now)

---

## Schema & Structured Data

- [ ] **FAQ schema** added for the FAQ section (important for AEO/People Also Ask)
- [ ] **Article schema** applied (author, published date, brand)
- [ ] (If applicable) **Local Business schema** if the post references the clinic address

---

## Post-Publish Actions

Immediately after the post goes live:

- [ ] **Google Search Console** — submit the new URL for indexing:
  1. Open Google Search Console
  2. Paste the full URL into the URL inspection tool
  3. Click "Request Indexing"
- [ ] **Internal link addition** — find at least 1 existing published post on a related topic and add a link from that post to the new post
- [ ] **Content calendar** — mark post as Published with the live date
- [ ] **Rank tracker** — add the primary keyword + URL to the rank tracker for monitoring

---

## Quality Check After Going Live

Within 24 hours of publishing:

- [ ] Visit the live URL — confirm it loads correctly
- [ ] Confirm meta title and description display correctly in browser tab and social share previews
- [ ] Confirm heading hierarchy is correct (H1 shows once, H2s are styled correctly)
- [ ] Click all internal links — verify they work on the live site
- [ ] Confirm featured image loads and alt text is set
- [ ] Confirm Google Search Console accepted the indexing request

---

## What to Do If Something Goes Wrong

| Issue | Fix |
|---|---|
| Wrong URL slug set | Redirect old URL to new URL; update internal links pointing to it |
| Meta title/description wrong | Fix in CMS — Google will re-read within a few days |
| Internal link 404 | Fix the destination URL or remove the link |
| Author not showing | Check CMS author settings |
| FAQ schema not working | Validate at schema.org/validator |

---

## Archive Entry

After successful publication, add to the RUNBOOK.md archive log:

```
Post N: [Title]
  Live URL:    https://www.[domain].com/blog/[slug]
  Google Doc:  https://docs.google.com/document/d/[id]/edit
  Published:   [date]
  Primary KW:  [keyword]
  Status:      ✅ Live
```
