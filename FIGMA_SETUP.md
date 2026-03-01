# Figma Integration Setup Guide

Complete guide to writing ad scripts directly into Figma artboards.

---

## Overview

**Problem:** Manually copying generated ad scripts into Figma is tedious and error-prone.

**Solution:** Automated workflow that pushes scripts from Claude → JSON → Figma in seconds.

**How it works:**
1. **Generate scripts** using Workflow 04 (Claude writes ad scripts)
2. **Export to JSON** using Python tool (maps scripts to Figma layers)
3. **Import to Figma** using custom plugin (updates text layers automatically)

---

## One-Time Setup

### Step 1: Install Python Dependencies

```bash
pip install -r tools/requirements.txt
```

This installs:
- `python-dotenv` - Environment variable management
- `requests` - HTTP requests for Figma API

---

### Step 2: Verify Figma Access Token

Your `.env` file already has:
```
FIGMA_ACCESS_TOKEN=figd_-pLHAzgnR0lplOyCFX36kMdRlSQEZnzVM9OVxWaB
```

✅ Already configured!

---

### Step 3: Install Figma Plugin

1. **Download Figma Desktop App** (required - plugins don't work in browser)
   - Download: https://www.figma.com/downloads/

2. **Open Figma Desktop**

3. **Import Plugin:**
   - Menu → Plugins → Development → Import plugin from manifest
   - Select: `tools/figma-plugin/manifest.json`
   - Click "Open"

4. **Verify Installation:**
   - Menu → Plugins → Development
   - You should see "Ad Script Importer" ✅

---

### Step 4: Set Up Your Figma File

Create a Figma file with proper text layer naming:

**Required Naming Convention:**
- Text layers must be named: `Script_1`, `Script_2`, `Script_3`, etc.
- Naming is case-sensitive
- Numbers must be sequential

**Example Structure:**

```
📄 Carisma Slimming Ad Templates

  📑 Page: Medical Weight Loss Carousel
    🖼️ Artboard 1
      📝 Script_1  ← "Hook" text layer
      📝 Script_2  ← "Problem" text layer
      📝 Script_3  ← "Solution" text layer
      📝 Script_4  ← "Results" text layer
      📝 Script_5  ← "CTA" text layer

  📑 Page: CoolSculpting Static Ads
    🖼️ Artboard 1
      📝 Script_1  ← "Headline" text layer
      📝 Script_2  ← "Body" text layer
      📝 Script_3  ← "CTA" text layer
```

**Pro Tips:**
- Create a template Figma file with pre-named layers
- Duplicate artboards to maintain naming consistency
- Use components for repeated elements (brand logo, etc.)

---

## Daily Usage Workflow

### Complete Workflow (Generate → Export → Import)

#### 1. Generate Ad Scripts

**Using Workflow 04:**

```
Ask Claude: "Generate 5 carousel ad scripts for Medical Weight Loss offer using the competitive intelligence."
```

Claude will:
- Read `config/creative_strategy_competitive_intelligence.md`
- Generate scripts based on winning angles
- Save to `.tmp/scripts/medical_weight_loss_scripts.json`

**Expected JSON format:**
```json
[
  {
    "name": "Medical Weight Loss - Hook",
    "content": "Tried every diet for 10 years? Time to talk to an actual doctor."
  },
  {
    "name": "Medical Weight Loss - Problem",
    "content": "Nothing worked until I met Dr. [Name] at Carisma Slimming"
  },
  ...
]
```

---

#### 2. Export for Figma

Run the Python tool:

```bash
python tools/write_scripts_to_figma.py \
  --file "YOUR_FIGMA_FILE_KEY" \
  --scripts ".tmp/scripts/medical_weight_loss_scripts.json" \
  --output ".tmp/scripts/figma_import.json"
```

**How to get Figma file key:**
- Open your Figma file
- URL: `https://www.figma.com/file/ABC123XYZ/File-Name`
- File key: `ABC123XYZ` (copy this part)

**What this does:**
- Fetches your Figma file structure
- Maps each script to a `Script_N` layer
- Generates `figma_import.json` ready for plugin import

**Output:**
```
📥 Fetching Figma file: ABC123XYZ
🔍 Finding text layers in Figma file...
✅ Found 5 script layers in Figma
📄 Exported script mapping to: .tmp/scripts/figma_import.json
   Use this file with the Figma plugin to import scripts.
```

---

#### 3. Import to Figma

**In Figma Desktop:**

1. Open your Figma file

2. Run plugin:
   - Menu → Plugins → Development → Ad Script Importer

3. Copy JSON:
   ```bash
   # macOS
   cat .tmp/scripts/figma_import.json | pbcopy

   # Or manually: open file, select all, copy
   ```

4. Paste into plugin text area

5. Click "Import Scripts"

6. Done! ✅
   ```
   ✅ Success: 5 scripts imported
   ```

Your Figma text layers now contain the generated scripts!

---

## Example: Full End-to-End

### Scenario: Create CoolSculpting Carousel Ad

**Step 1: Generate Scripts**

Ask Claude:
```
Generate a 5-card carousel script for CoolSculpting using the "Stubborn Belly Fat" angle from the competitive intelligence report. Save to .tmp/scripts/coolsculpting_carousel.json
```

**Step 2: Export to Figma Format**

```bash
python tools/write_scripts_to_figma.py \
  --file "kQx3Hn8mPvL2" \
  --scripts ".tmp/scripts/coolsculpting_carousel.json" \
  --output ".tmp/scripts/figma_import.json"
```

**Step 3: Import**

- Open Figma Desktop → Your ad template file
- Plugins → Ad Script Importer
- Paste JSON → Import
- ✅ Text layers updated!

**Step 4: Review & Refine**

- Check formatting in Figma
- Adjust text styles if needed
- Export for production

**Total time:** ~2 minutes (vs. 15+ minutes manual)

---

## Troubleshooting

### "Layer not found: Script_1"

**Problem:** Figma text layers aren't named correctly.

**Fix:**
1. Click "List Text Layers" in plugin to see current names
2. Rename text layers to `Script_1`, `Script_2`, etc.
3. Re-import

---

### "Failed to fetch Figma file"

**Problem:** Invalid file key or access token.

**Fix:**
1. Verify Figma file key from URL
2. Check `FIGMA_ACCESS_TOKEN` in `.env`
3. Ensure you have access to the file (owner or editor)

---

### Plugin not in menu

**Problem:** Plugin not installed or Figma needs restart.

**Fix:**
1. Restart Figma Desktop App
2. Re-import plugin: Plugins → Development → Import plugin from manifest
3. Select `tools/figma-plugin/manifest.json`

---

### Scripts imported but text looks wrong

**Problem:** Formatting issues.

**Not a bug - this is expected:**
- Plugin updates text content only
- Preserves existing font, size, color, alignment
- Adjust formatting manually in Figma after import

---

## Advanced Tips

### Batch Import Multiple Ad Variants

Generate multiple scripts, export separately, import to different Figma pages:

```bash
# Generate 3 variants
python tools/write_scripts_to_figma.py \
  --file "FILE_KEY" \
  --scripts ".tmp/scripts/variant_1.json" \
  --output ".tmp/scripts/figma_variant_1.json"

python tools/write_scripts_to_figma.py \
  --file "FILE_KEY" \
  --scripts ".tmp/scripts/variant_2.json" \
  --output ".tmp/scripts/figma_variant_2.json"
```

Then import each to different Figma pages.

---

### Custom Layer Naming

If you prefer a different naming convention:

```bash
python tools/write_scripts_to_figma.py \
  --file "FILE_KEY" \
  --scripts ".tmp/scripts/scripts.json" \
  --layer-pattern "AdCopy_"
```

Name Figma layers: `AdCopy_1`, `AdCopy_2`, etc.

---

### Automate with Workflows

Add to end of Workflow 04:

```python
import subprocess
import os

# Auto-export after script generation
FIGMA_FILE_KEY = os.getenv("FIGMA_TEMPLATE_FILE_KEY")

subprocess.run([
    "python", "tools/write_scripts_to_figma.py",
    "--file", FIGMA_FILE_KEY,
    "--scripts", ".tmp/scripts/output.json",
    "--output", ".tmp/scripts/figma_import.json"
])

print("\n✅ Scripts ready for Figma import!")
print("   Open Figma plugin and import: .tmp/scripts/figma_import.json")
```

---

## Files Reference

```
tools/
├── write_scripts_to_figma.py       # Python tool (JSON generator)
├── requirements.txt                # Python dependencies
└── figma-plugin/
    ├── manifest.json               # Plugin metadata
    ├── code.js                     # Plugin logic
    ├── ui.html                     # Plugin interface
    └── README.md                   # Plugin documentation

.tmp/scripts/
├── medical_weight_loss_scripts.json  # Generated scripts
├── coolsculpting_carousel.json       # Generated scripts
└── figma_import.json                 # Figma-ready JSON
```

---

## Quick Reference

### Generate Scripts
```
Ask Claude to generate ad scripts using Workflow 04
```

### Export to Figma
```bash
python tools/write_scripts_to_figma.py \
  --file "FIGMA_FILE_KEY" \
  --scripts ".tmp/scripts/scripts.json"
```

### Import to Figma
```
Figma → Plugins → Ad Script Importer → Paste JSON → Import
```

---

## Next Steps

✅ **Setup Complete?**
- Python dependencies installed
- Figma plugin installed
- Figma file has properly named text layers (`Script_1`, `Script_2`, etc.)
- Access token in `.env`

✅ **Ready to use:**
1. Generate scripts with Claude (Workflow 04)
2. Run `write_scripts_to_figma.py`
3. Import in Figma plugin
4. Done!

---

**Questions or issues?**
See `tools/figma-plugin/README.md` for detailed plugin documentation.

**Want to extend this?**
- Modify `code.js` to add custom logic
- Edit layer naming patterns
- Add metadata tracking
- Integrate with other tools

---

**Created for:** Carisma AI WAT Framework
**Last Updated:** February 15, 2026
**Version:** 1.0
