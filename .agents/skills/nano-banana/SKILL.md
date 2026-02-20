---
name: nano-banana
description: Use when you need to generate, edit, or create images (icons, diagrams, patterns, photo restoration) through natural language. Applies to visual asset creation, image modification, flowchart generation, and sequential storytelling with images.
---

# Nano Banana Image Generation

## Overview

**Nano Banana** enables image generation and editing through the Gemini CLI's nanobanana extension. Generate images from text, modify existing images, create diagrams, restore photos, and produce visual assets.

**Core principle:** Natural language image creation and manipulation through command-line interface.

## When to Use

Use this skill when you need to:
- Generate images from text descriptions
- Edit or modify existing images with instructions
- Create application icons or favicons
- Generate flowcharts or architecture diagrams
- Produce seamless textures and patterns
- Restore or repair damaged photos
- Create sequential image narratives (storyboards, comics)

**Don't use when:**
- Simple ASCII art is sufficient
- Screenshots are needed (use browser tools instead)
- Working with existing image files that don't need AI modification

## Prerequisites

**Required setup:**
1. Gemini CLI installed: `npm install -g @anthropic-ai/gemini-cli`
2. Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)
3. nanobanana extension configured in Gemini CLI

**Environment:**
- Set `GEMINI_API_KEY` in your environment
- Optional: Set `NANOBANANA_MODEL=gemini-3-pro-image-preview` for premium quality

## Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/generate` | Create images from text | `/generate "sunset over mountains"` |
| `/edit` | Modify existing images | `/edit image.png "add clouds"` |
| `/restore` | Repair damaged photos | `/restore old-photo.jpg` |
| `/icon` | Generate app icons | `/icon "fitness app logo"` |
| `/diagram` | Create flowcharts | `/diagram "user auth flow"` |
| `/pattern` | Generate seamless patterns | `/pattern "geometric hexagons"` |
| `/story` | Sequential images | `/story "3-panel comic about coding"` |
| `/nanobanana` | Natural language interface | `/nanobanana create a hero image for landing page` |

## Command Options

**Common flags:**
- `--yolo` - Auto-approve all actions (no prompts)
- `--count=N` - Generate multiple variations (1-8 images)
- `--preview` - Auto-open generated images
- `--styles="style1,style2"` - Apply specific artistic styles
- `--format=grid` - Arrange multiple images in grid layout

## Output Location

Generated images save to `./nanobanana-output/` in your current working directory.

## Cost & Models

**Default model:** `gemini-2.5-flash-image` (~$0.04 per image)
**Premium model:** `gemini-3-pro-image-preview` (higher quality, higher cost)

Set model via environment: `export NANOBANANA_MODEL=gemini-3-pro-image-preview`

## Implementation Examples

### Generate Marketing Hero Image
```bash
/generate "modern minimalist hero image for wellness brand, soft gradients, professional, 1920x1080" --preview
```

### Create App Icon Set
```bash
/icon "meditation app logo, lotus flower, calming colors" --count=4 --preview
```

### Generate Architecture Diagram
```bash
/diagram "microservices architecture: API gateway, auth service, user service, database layer" --format=grid
```

### Edit Existing Image
```bash
/edit hero-image.png "adjust brightness, add subtle texture overlay" --preview
```

### Sequential Narrative
```bash
/story "4-panel before/after transformation: starting workout, progressing, achieving goal, celebrating" --count=1
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| **Vague prompts** | Be specific: "minimalist logo with lotus flower in teal" vs "nice logo" |
| **No --preview flag** | Add `--preview` to see results immediately |
| **Wrong directory** | Check `./nanobanana-output/` in your working directory |
| **API key not set** | `export GEMINI_API_KEY=your_key` before using |
| **Expecting instant results** | Image generation takes 5-30 seconds depending on complexity |
| **Over-requesting** | Use `--count` wisely (more = higher cost) |

## Integration with WAT Framework

When using nano-banana in your Carisma AI workflows:

1. **Research Phase:** Generate competitor-style ad visuals for analysis
2. **Creative Brief Phase:** Create mockups of ad concepts before production
3. **Iteration Phase:** Rapidly test visual variations

**Example workflow integration:**
```bash
# Generate ad concept mockups
/generate "Instagram story ad for slimming treatment, before/after split screen, professional medical aesthetic" --count=3 --preview

# Create brand asset variations
/icon "Carisma Slimming logo concepts, medical wellness, premium, Malta-inspired" --count=4
```

## Troubleshooting

**"Command not found"**
- Install Gemini CLI: `npm install -g @anthropic-ai/gemini-cli`
- Verify installation: `gemini --version`

**"API key invalid"**
- Get key from [Google AI Studio](https://aistudio.google.com/apikey)
- Set environment: `export GEMINI_API_KEY=your_key`

**"Output directory not found"**
- Images save to `./nanobanana-output/` relative to your current directory
- Change directory or check absolute path

**"Generation failed"**
- Check prompt clarity (avoid ambiguous language)
- Verify API quota hasn't been exceeded
- Try simpler prompt or reduce `--count`

## Real-World Impact

**Speed:** Generate professional visual assets in seconds vs hours with design tools
**Cost:** $0.04-0.15 per image vs hiring designers
**Iteration:** Test 4-8 variations instantly to find best concept
**Integration:** Fits into automated creative workflows for rapid testing
