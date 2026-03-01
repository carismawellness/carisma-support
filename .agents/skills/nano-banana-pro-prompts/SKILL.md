---
name: nano-banana-pro-prompts
description: Use when you need image generation prompt recommendations from a curated database of 6000+ proven prompts across 10+ categories (profile, social media, product marketing, infographic, poster, e-commerce, game asset, thumbnail, comic, app design). Helpful when stuck on prompt ideas or want battle-tested templates.
---

# Nano Banana Pro Prompts Recommendation

## Overview

**Intelligent prompt recommendation system** that searches through 6000+ curated, battle-tested Nano Banana Pro prompts organized across 10+ categories. Get visual previews, ready-to-use prompts, and personalized variations.

**Core principle:** Don't start from scratch—leverage proven prompt templates optimized for specific use cases.

## When to Use

Use this skill when you:
- Need prompt inspiration for specific use cases
- Want proven, high-quality image generation templates
- Are unsure how to describe what you want
- Need category-specific prompts (avatar, social post, product shot, etc.)
- Want to see examples before generating
- Need to remix prompts with your own content

**Don't use when:**
- You have a very specific, unique prompt already written
- Working with non-image generation tasks
- Need real-time prompt generation (this is a database lookup)

## Categories Available

| Category | Prompt Count | Use Cases |
|----------|-------------|-----------|
| **Profile/Avatar** | 700+ | Social media profiles, professional headshots, character avatars |
| **Social Media Post** | 3800+ | Instagram, Facebook, LinkedIn posts, story backgrounds |
| **Product Marketing** | 1900+ | E-commerce product shots, catalog images, lifestyle photos |
| **Infographic** | 350+ | Data visualization, educational graphics, statistics |
| **Poster/Flyer** | 300+ | Event promotion, announcements, marketing materials |
| **E-commerce** | 200+ | Product listings, Amazon/Shopify images, mockups |
| **Game Asset** | 200+ | Characters, items, backgrounds, UI elements |
| **YouTube Thumbnail** | 100+ | Clickable thumbnails, video covers |
| **Comic/Storyboard** | 200+ | Sequential art, narrative panels |
| **App/Web Design** | 100+ | UI mockups, landing pages, app screens |

## Quick Reference

### Basic Search Workflow

```bash
# Step 1: Invoke skill with your use case
/nano-banana-pro-prompts "I need a social media post for a wellness brand"

# Step 2: Receive recommendations with:
# - Matched category
# - 3-5 relevant prompts
# - Visual preview samples
# - Ready-to-use English prompts

# Step 3: Copy prompt and use with nano-banana
/generate "[recommended prompt from database]"
```

### Content Remix Mode

```bash
# Provide your content for personalized prompt
/nano-banana-pro-prompts remix "Carisma Slimming wellness clinic, 30 years experience, premium medical treatments"

# Receives clarifying questions:
# - What visual style?
# - What mood/emotion?
# - What's the call-to-action?

# Gets personalized prompt based on your answers + database patterns
```

## Search Intelligence

The system uses **keyword-to-category routing** to find relevant prompts:

| Your Query | Matched Category |
|------------|------------------|
| "profile picture" | Profile/Avatar |
| "Instagram post" | Social Media Post |
| "product photo" | Product Marketing |
| "chart" or "stats" | Infographic |
| "event flyer" | Poster/Flyer |
| "thumbnail" | YouTube Thumbnail |
| "game character" | Game Asset |
| "app mockup" | App/Web Design |

**Graceful fallback:** If no exact match, generates custom prompt using AI + database patterns.

## Implementation

### Example 1: Social Media Post for Wellness Brand

**Query:**
```bash
/nano-banana-pro-prompts "Instagram story for weight loss clinic"
```

**Response:**
```
Category: Social Media Post
Matched Prompts:

1. "Wellness transformation story template: before/after split screen,
   soft gradient background (pink to teal), motivational quote overlay,
   professional photography style, 1080x1920"

2. "Medical aesthetic clinic social post: clean minimal design,
   single product focus center, white space, subtle brand colors,
   professional trust-building aesthetic, Instagram story format"

3. "Health journey milestone post: progress visualization,
   celebratory aesthetic, warm colors, empowering typography,
   lifestyle photography blend"

Sample Images: [Visual previews shown]
```

### Example 2: Product Marketing Shot

**Query:**
```bash
/nano-banana-pro-prompts "e-commerce product photo for treatment package"
```

**Response:**
```
Category: Product Marketing

1. "Premium product showcase: centered composition, soft shadows,
   gradient background (white to light gray), floating effect,
   professional commercial photography, high-end aesthetic, 1:1 ratio"

2. "Medical product detail shot: clinical clean aesthetic,
   precise lighting, white background, product at 45-degree angle,
   trust-building professional style"
```

### Example 3: Content Remix Mode

**Input:**
```bash
/nano-banana-pro-prompts remix "Carisma Slimming: €199 treatment package, 30 years experience, Malta's premium clinic"
```

**Clarifying Questions:**
```
1. Visual style preference? (minimalist/lifestyle/clinical/luxurious)
2. Mood/emotion? (empowering/trustworthy/aspirational/professional)
3. Primary focus? (package offer/transformation/authority/exclusivity)
```

**Your Answers:**
```
1. Luxurious minimalist
2. Aspirational + trustworthy
3. Package offer + authority
```

**Generated Custom Prompt:**
```
"Premium medical wellness package offer: luxurious minimalist design,
soft gold and teal gradient background, €199 price elegantly displayed,
'30 Years of Excellence' badge placement, Malta landmark subtle background,
professional trust-building aesthetic, aspirational lifestyle feel,
high-end commercial photography style, 1080x1080"
```

## Technical Architecture

**Token Optimization:** Uses grep-based searching instead of loading full 6000+ prompt files into memory.

**Update Frequency:** Database updates twice daily via GitHub Actions (new prompts added regularly).

**Language:** All prompts delivered in English, optimized for Nano Banana Pro compatibility.

## Integration with Nano Banana Skill

These two skills work together:

```bash
# Step 1: Get prompt recommendation
/nano-banana-pro-prompts "hero image for landing page"

# Step 2: Use recommended prompt with nano-banana
/generate "[recommended prompt]" --count=3 --preview
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| **Too vague query** | Be specific: "product photo for cosmetics" vs "picture" |
| **Ignoring category hints** | Note matched category—helps refine future searches |
| **Not using remix mode** | Remix mode + brand context = highly personalized prompts |
| **Expecting custom generation** | This is a database lookup, not real-time generation |
| **Skipping visual previews** | Previews show what style to expect—review before using |

## Installation

If not already installed:

```bash
# Option 1: NPX (recommended)
npx skills i YouMind-OpenLab/nano-banana-pro-prompts-recommend-skill

# Option 2: OpenSkills CLI
openskills install nano-banana-pro-prompts

# Option 3: Ask Claude Code
"Install the nano-banana-pro-prompts skill from YouMind-OpenLab"
```

## Real-World Impact

**Time Saved:** 5-15 minutes per prompt (no brainstorming from scratch)
**Quality:** Battle-tested prompts with proven results
**Variety:** 6000+ options vs starting with blank slate
**Personalization:** Remix mode adapts templates to your brand

## Workflow Integration (Carisma Example)

```bash
# Research Phase: Analyze competitor visual styles
/nano-banana-pro-prompts "social media ad for medical weight loss"

# Creative Phase: Generate concepts
/nano-banana-pro-prompts remix "Carisma Slimming €199 package"

# Production: Use recommended prompts
/generate "[recommended prompt]" --count=4 --preview
```
