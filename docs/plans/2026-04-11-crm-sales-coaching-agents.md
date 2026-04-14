# CRM Sales Conversion Coaching System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a daily-running agent system that analyzes every sales conversation across WhatsApp, Meta DMs, Zoho SalesIQ, and Arkafort calls — then delivers per-rep coaching reports to double chat-to-booking conversion rates.

**Architecture:** An orchestrator agent runs daily at 6:00 AM via Claude Code `/schedule`. It pulls yesterday's conversations from 4 channels, loads reference data (scripts, roster, brand voice, knowledge bases), dispatches to 3 specialized sub-agents (CRM Process, Sales Coaching, Brand Domain) running in parallel, then merges their outputs into 3 deliverables: per-rep WhatsApp summaries, a Google Sheets dashboard, and a manager email.

**Tech Stack:** Python 3.11+, Claude API (Anthropic SDK), MCP servers (WhatsApp, Meta, Google Workspace), Zoho SalesIQ REST API v2, OpenAI Whisper (call transcription), Google Sheets API, dotenv for credentials.

**Design Doc:** `docs/plans/2026-04-11-crm-sales-coaching-agents-design.md`

---

## Phase 1: Data Collection Layer (WhatsApp + Meta DMs)

Start with the two channels that are already wired up via MCP. Get conversations flowing before building the analysis.

### Task 1: WhatsApp Conversation Puller

**Files:**
- Create: `tools/crm-coaching/pull_whatsapp_conversations.py`
- Test: `tools/crm-coaching/tests/test_pull_whatsapp.py`

**Context:** The WhatsApp MCP server is configured in `.mcp.json` at `whatsapp`. It provides tools like `list_chats`, `list_messages`, `get_chat`, `search_contacts`. We need a script that pulls all messages from the previous day, organized by contact, and outputs a structured JSON format that the analysis agents can consume.

**Step 1: Create the project directory**

```bash
mkdir -p tools/crm-coaching/tests
touch tools/crm-coaching/__init__.py
touch tools/crm-coaching/tests/__init__.py
```

**Step 2: Write the failing test**

```python
# tools/crm-coaching/tests/test_pull_whatsapp.py
import json
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

def test_format_conversation_output():
    """Verify conversations are formatted into the standard schema."""
    from tools.crm_coaching.pull_whatsapp_conversations import format_conversation

    raw_messages = [
        {"from": "customer", "body": "Hi, interested in spa", "timestamp": "2026-04-10T09:00:00Z"},
        {"from": "agent", "body": "Welcome! Let me help you", "timestamp": "2026-04-10T09:02:00Z"},
    ]

    result = format_conversation(
        contact_name="Maria C.",
        contact_phone="+35679123456",
        messages=raw_messages,
        channel="whatsapp"
    )

    assert result["channel"] == "whatsapp"
    assert result["contact"]["name"] == "Maria C."
    assert result["contact"]["phone"] == "+35679123456"
    assert len(result["messages"]) == 2
    assert result["messages"][0]["sender"] == "customer"
    assert result["messages"][0]["text"] == "Hi, interested in spa"
    assert "timestamp" in result["messages"][0]
    assert result["message_count"] == 2
    assert result["date"] == "2026-04-10"


def test_identify_rep_from_roster():
    """Match a conversation to the rep who handled it based on roster + date."""
    from tools.crm_coaching.pull_whatsapp_conversations import identify_rep

    roster = {
        "Abid": {"role": "CRM / WA / Email / Meta / Chat", "schedule": {
            "Mon": "Spa", "Tue": "Spa", "Wed": "Spa", "Thu": "Spa", "Fri": "Spa", "Sat": "Spa", "Sun": "OFF"
        }},
        "Adeel": {"role": "CRM / WA / Email / Meta / Chat", "schedule": {
            "Mon": "Slimming", "Tue": "Slimming", "Wed": "OFF", "Thu": "Slimming", "Fri": "Slimming", "Sat": "Slimming", "Sun": "Slimming"
        }},
    }

    # Thursday = Spa = Abid
    rep = identify_rep(
        channel="whatsapp",
        brand="Spa",
        date=datetime(2026, 4, 9),  # Thursday
        roster=roster
    )
    assert rep == "Abid"
```

**Step 3: Run test to verify it fails**

```bash
cd tools/crm-coaching && python -m pytest tests/test_pull_whatsapp.py -v
```
Expected: FAIL — module not found

**Step 4: Implement the puller**

```python
# tools/crm-coaching/pull_whatsapp_conversations.py
"""
Pull yesterday's WhatsApp conversations and format them for analysis.

Usage: Called by the orchestrator agent. Can also be run standalone:
    python pull_whatsapp_conversations.py --date 2026-04-10 --output .tmp/conversations/whatsapp/

MCP Dependency: whatsapp MCP server (configured in .mcp.json)
"""
import json
import os
from datetime import datetime, timedelta
from pathlib import Path


def format_conversation(contact_name: str, contact_phone: str, messages: list, channel: str) -> dict:
    """Format raw messages into the standard conversation schema."""
    date = messages[0]["timestamp"][:10] if messages else datetime.now().strftime("%Y-%m-%d")

    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "sender": msg.get("from", "unknown"),
            "text": msg.get("body", ""),
            "timestamp": msg.get("timestamp", ""),
        })

    return {
        "channel": channel,
        "contact": {
            "name": contact_name,
            "phone": contact_phone,
        },
        "messages": formatted_messages,
        "message_count": len(formatted_messages),
        "date": date,
        "rep": None,  # Filled in by orchestrator after roster lookup
        "brand": None,  # Filled in by orchestrator after roster lookup
        "outcome": None,  # Filled in by analysis agents
    }


def identify_rep(channel: str, brand: str, date: datetime, roster: dict) -> str | None:
    """Match a conversation to the assigned rep based on roster schedule."""
    day_name = date.strftime("%a")  # Mon, Tue, Wed...

    for rep_name, rep_info in roster.items():
        role = rep_info.get("role", "")
        schedule = rep_info.get("schedule", {})

        # Check if this rep handles this channel type
        channel_keywords = {
            "whatsapp": ["WA", "CRM"],
            "meta_dm": ["Meta", "CRM"],
            "email": ["Email", "CRM"],
            "live_chat": ["Chat", "CRM"],
            "outbound_call": ["Dials", "SDR"],
            "inbound_call": ["Inbound"],
        }
        keywords = channel_keywords.get(channel, [])
        role_match = any(kw.lower() in role.lower() for kw in keywords)

        # Check if scheduled for this brand on this day
        scheduled_brand = schedule.get(day_name, "OFF")
        brand_match = scheduled_brand.lower() == brand.lower()

        if role_match and brand_match:
            return rep_name

    return None


def get_yesterday_date() -> str:
    """Return yesterday's date as YYYY-MM-DD."""
    return (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
```

**Step 5: Run test to verify it passes**

```bash
cd tools/crm-coaching && python -m pytest tests/test_pull_whatsapp.py -v
```
Expected: PASS

**Step 6: Commit**

```bash
git add tools/crm-coaching/
git commit -m "feat(coaching): add WhatsApp conversation puller with standard schema"
```

---

### Task 2: Standard Conversation Schema

**Files:**
- Create: `tools/crm-coaching/schemas.py`
- Test: `tools/crm-coaching/tests/test_schemas.py`

**Context:** All 4 channels (WhatsApp, Meta DMs, SalesIQ, Arkafort) must output the same JSON schema so the analysis agents don't care where the conversation came from. Define the schema once.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_schemas.py
def test_conversation_schema_validates():
    from tools.crm_coaching.schemas import validate_conversation

    valid = {
        "id": "wa-20260410-maria-c",
        "channel": "whatsapp",
        "date": "2026-04-10",
        "contact": {"name": "Maria C.", "phone": "+35679123456", "email": None},
        "rep": "Abid",
        "brand": "Spa",
        "messages": [
            {"sender": "customer", "text": "Hi", "timestamp": "2026-04-10T09:00:00Z"},
            {"sender": "agent", "text": "Welcome!", "timestamp": "2026-04-10T09:02:00Z"},
        ],
        "message_count": 2,
        "first_response_seconds": 120,
        "outcome": None,
        "metadata": {},
    }

    assert validate_conversation(valid) is True


def test_conversation_schema_rejects_missing_fields():
    from tools.crm_coaching.schemas import validate_conversation

    invalid = {"channel": "whatsapp"}  # Missing required fields

    assert validate_conversation(invalid) is False


def test_daily_batch_schema():
    from tools.crm_coaching.schemas import validate_daily_batch

    batch = {
        "date": "2026-04-10",
        "pulled_at": "2026-04-11T06:00:00Z",
        "channels": ["whatsapp", "meta_dm"],
        "conversations": [],
        "total_conversations": 0,
    }

    assert validate_daily_batch(batch) is True
```

**Step 2: Run test to verify it fails**

```bash
python -m pytest tools/crm-coaching/tests/test_schemas.py -v
```

**Step 3: Implement schemas**

```python
# tools/crm-coaching/schemas.py
"""
Standard conversation schema used by all channel pullers and analysis agents.

Every conversation from every channel gets normalized to this format before
being passed to the analysis agents.
"""

REQUIRED_CONVERSATION_FIELDS = {
    "id", "channel", "date", "contact", "rep", "brand",
    "messages", "message_count", "first_response_seconds",
    "outcome", "metadata"
}

REQUIRED_CONTACT_FIELDS = {"name", "phone", "email"}

REQUIRED_MESSAGE_FIELDS = {"sender", "text", "timestamp"}

VALID_CHANNELS = {"whatsapp", "meta_dm", "salesiq", "arkafort_call"}

VALID_BRANDS = {"Spa", "Aesthetics", "Slimming"}

VALID_OUTCOMES = {None, "booked", "follow_up_scheduled", "no_show_recovery",
                  "dead", "disqualified", "pending"}


def validate_conversation(data: dict) -> bool:
    """Validate a conversation dict against the standard schema."""
    if not isinstance(data, dict):
        return False

    if not REQUIRED_CONVERSATION_FIELDS.issubset(data.keys()):
        return False

    contact = data.get("contact", {})
    if not isinstance(contact, dict) or not REQUIRED_CONTACT_FIELDS.issubset(contact.keys()):
        return False

    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return False

    for msg in messages:
        if not isinstance(msg, dict) or not REQUIRED_MESSAGE_FIELDS.issubset(msg.keys()):
            return False

    return True


def validate_daily_batch(data: dict) -> bool:
    """Validate a daily batch of conversations."""
    required = {"date", "pulled_at", "channels", "conversations", "total_conversations"}
    if not isinstance(data, dict) or not required.issubset(data.keys()):
        return False
    return True
```

**Step 4: Run tests**

```bash
python -m pytest tools/crm-coaching/tests/test_schemas.py -v
```

**Step 5: Commit**

```bash
git add tools/crm-coaching/schemas.py tools/crm-coaching/tests/test_schemas.py
git commit -m "feat(coaching): add standard conversation schema with validation"
```

---

### Task 3: Meta DM Conversation Puller

**Files:**
- Create: `tools/crm-coaching/pull_meta_conversations.py`
- Test: `tools/crm-coaching/tests/test_pull_meta.py`

**Context:** Meta Ads MCP provides conversation access for Instagram and Facebook DMs. Uses the `meta-ads` MCP server. Conversations need to be normalized to the standard schema from Task 2.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_pull_meta.py
def test_format_meta_dm_to_standard_schema():
    from tools.crm_coaching.pull_meta_conversations import format_meta_conversation

    raw = {
        "id": "t_123456",
        "participants": [{"name": "Julia K.", "id": "user_789"}],
        "messages": [
            {"from": {"name": "Julia K."}, "message": "Hi, interested in jawline filler", "created_time": "2026-04-10T14:00:00+0000"},
            {"from": {"name": "Carisma Aesthetics"}, "message": "Hi Julia! Welcome", "created_time": "2026-04-10T14:03:00+0000"},
        ]
    }

    result = format_meta_conversation(raw, platform="instagram")

    assert result["channel"] == "meta_dm"
    assert result["contact"]["name"] == "Julia K."
    assert len(result["messages"]) == 2
    assert result["messages"][0]["sender"] == "customer"
    assert result["messages"][1]["sender"] == "agent"
    assert result["metadata"]["platform"] == "instagram"
    assert result["first_response_seconds"] == 180  # 3 minutes
```

**Step 2: Run test to verify it fails**

```bash
python -m pytest tools/crm-coaching/tests/test_pull_meta.py -v
```

**Step 3: Implement the puller**

Build `pull_meta_conversations.py` that:
- Accepts raw Meta conversation thread data
- Identifies customer vs agent messages (agent = any message from the page/business account)
- Calculates first response time
- Normalizes to standard schema
- Generates a unique conversation ID: `meta-{date}-{contact_name_slug}`

**Step 4: Run tests, then commit**

```bash
git add tools/crm-coaching/pull_meta_conversations.py tools/crm-coaching/tests/test_pull_meta.py
git commit -m "feat(coaching): add Meta DM conversation puller"
```

---

### Task 4: Zoho SalesIQ Chat Puller

**Files:**
- Create: `tools/crm-coaching/pull_salesiq_conversations.py`
- Create: `tools/crm-coaching/salesiq_auth.py`
- Test: `tools/crm-coaching/tests/test_pull_salesiq.py`

**Context:** Zoho SalesIQ REST API v2. Base URL (EU): `https://salesiq.zoho.eu/api/v2/{screen_name}/`. Authentication: OAuth 2.0 via `https://accounts.zoho.eu/oauth/v2/`. Scope needed: `SalesIQ.conversations.READ`. Key endpoints: `GET /conversations` (list with `from_time`/`to_time` filters) and `GET /conversations/{id}/messages` (full transcript).

**Step 1: Add environment variables**

Add to `.env` (keys only — user fills in values):
```
ZOHO_SALESIQ_CLIENT_ID=
ZOHO_SALESIQ_CLIENT_SECRET=
ZOHO_SALESIQ_REFRESH_TOKEN=
ZOHO_SALESIQ_SCREEN_NAME=
```

**Step 2: Write the failing test**

```python
# tools/crm-coaching/tests/test_pull_salesiq.py
def test_format_salesiq_conversation():
    from tools.crm_coaching.pull_salesiq_conversations import format_salesiq_conversation

    raw_conversation = {
        "id": "conv_12345",
        "visitor": {"name": "Anna M.", "email": "anna@test.com", "phone": "+35679000000"},
        "department": {"name": "Spa"},
        "attender": {"name": "Nicci"},
        "in_time": "1712739600000",  # epoch ms
        "end_time": "1712740200000",
    }

    raw_messages = [
        {"sender": {"name": "Anna M."}, "message": "Hi, looking for massage", "time": "1712739600000", "type": "text"},
        {"sender": {"name": "Nicci"}, "message": "Welcome! Let me help", "time": "1712739660000", "type": "text"},
    ]

    result = format_salesiq_conversation(raw_conversation, raw_messages)

    assert result["channel"] == "salesiq"
    assert result["contact"]["name"] == "Anna M."
    assert result["rep"] == "Nicci"
    assert result["brand"] == "Spa"
    assert len(result["messages"]) == 2
    assert result["first_response_seconds"] == 60
```

**Step 3: Implement OAuth helper + conversation puller**

`salesiq_auth.py`:
- Load credentials from `.env`
- Refresh access token using refresh token
- Cache token for 50 minutes (expires at 60)

`pull_salesiq_conversations.py`:
- `list_yesterdays_conversations()` — GET `/conversations?status=closed&from_time={start}&to_time={end}`
- `get_transcript(conversation_id)` — GET `/conversations/{id}/messages`
- `format_salesiq_conversation(conversation, messages)` — Normalize to standard schema
- SalesIQ conveniently includes attender name (= rep) and department (= brand) in the conversation object

**Step 4: Run tests, then commit**

```bash
git add tools/crm-coaching/pull_salesiq_conversations.py tools/crm-coaching/salesiq_auth.py tools/crm-coaching/tests/test_pull_salesiq.py
git commit -m "feat(coaching): add Zoho SalesIQ chat transcript puller"
```

---

### Task 5: Arkafort Call Recording Handler (Manual Export Interim)

**Files:**
- Create: `tools/crm-coaching/pull_arkafort_calls.py`
- Create: `tools/crm-coaching/transcribe_calls.py`
- Test: `tools/crm-coaching/tests/test_arkafort.py`

**Context:** Arkafort has NO public API. Two-phase approach:
1. **Interim (now):** Manual daily export of call recordings from `console.arkafort.com` to a local folder. Script watches the folder, transcribes new recordings, normalizes to standard schema.
2. **Future:** If Arkafort provides API access after contacting them (+356 22293000), replace the file watcher with API calls.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_arkafort.py
def test_format_transcribed_call():
    from tools.crm_coaching.pull_arkafort_calls import format_call_conversation

    transcript = {
        "segments": [
            {"speaker": "agent", "text": "Hi, this is Sarah from Carisma Aesthetics", "start": 0.0, "end": 3.5},
            {"speaker": "customer", "text": "Hi, yes I enquired about the jawline package", "start": 3.8, "end": 7.2},
        ],
        "duration_seconds": 180,
    }

    metadata = {
        "filename": "20260410_093000_ext201_35679123456.wav",
        "date": "2026-04-10",
        "extension": "201",
        "caller_number": "+35679123456",
    }

    result = format_call_conversation(transcript, metadata)

    assert result["channel"] == "arkafort_call"
    assert result["contact"]["phone"] == "+35679123456"
    assert len(result["messages"]) == 2
    assert result["metadata"]["duration_seconds"] == 180
    assert result["metadata"]["extension"] == "201"


def test_parse_arkafort_filename():
    from tools.crm_coaching.pull_arkafort_calls import parse_filename

    result = parse_filename("20260410_093000_ext201_35679123456.wav")

    assert result["date"] == "2026-04-10"
    assert result["time"] == "09:30:00"
    assert result["extension"] == "201"
    assert result["caller_number"] == "+35679123456"
```

**Step 2: Implement**

`pull_arkafort_calls.py`:
- Watch folder: `.tmp/arkafort-exports/` for new `.wav`/`.mp3` files
- Parse filename for metadata (date, time, extension, phone number)
- Call `transcribe_calls.py` to get transcript
- Format to standard schema

`transcribe_calls.py`:
- Use OpenAI Whisper API (or local whisper model) to transcribe audio
- Speaker diarization: identify agent vs customer segments
- Output structured transcript with timestamps

**Important:** Add `OPENAI_API_KEY` to `.env` for Whisper API. Or use local `whisper` package for cost savings.

**Step 3: Create the export folder**

```bash
mkdir -p .tmp/arkafort-exports
echo "*.wav" >> .tmp/arkafort-exports/.gitkeep
```

**Step 4: Run tests, then commit**

```bash
git add tools/crm-coaching/pull_arkafort_calls.py tools/crm-coaching/transcribe_calls.py tools/crm-coaching/tests/test_arkafort.py
git commit -m "feat(coaching): add Arkafort call recording handler with Whisper transcription"
```

---

## Phase 2: Reference Data Loader

The analysis agents need "the gold standard" — scripts, roster, offers, brand voice — loaded and structured.

### Task 6: Reference Data Loader

**Files:**
- Create: `tools/crm-coaching/load_reference_data.py`
- Test: `tools/crm-coaching/tests/test_reference_data.py`

**Context:** Reference data comes from two places:
1. **CRM Master Google Sheet** (`1bHF_7bXic08pcyXQhq310zG6McqXD50oT0EuVkjzDdI`) — Roster tab, Scripts tabs (Aes, Spa, Slm), Offers tab, Packages tab
2. **Local files** — `config/brand-voice/*.md`, `CRM/CRM-*/knowledge/*.md`, `CRM/CRM-*/knowledge/kb-*.json`

This script loads everything into a single `ReferenceData` object that gets passed to each sub-agent.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_reference_data.py
def test_load_roster():
    from tools.crm_coaching.load_reference_data import parse_roster_data

    raw_roster = [
        ["", "TIME SENSITIVE", "Spa", "Aes", "Slm"],
        ["SDR", "Outbound calls", "Juli", "Anni", "Dorienne"],
        ["", "CRM Messages", "Juli", "Anni", "Dorienne"],
        ["CRM", "Whatsapp", "Abid + Nathalia", "Rana", "Adeel"],
        ["", "Email ", "Abid + Nathalia", "Rana", "Adeel"],
    ]

    result = parse_roster_data(raw_roster)

    assert result["channels"]["Outbound calls"]["Spa"] == "Juli"
    assert result["channels"]["Outbound calls"]["Aes"] == "Anni"
    assert result["channels"]["Whatsapp"]["Spa"] == "Abid + Nathalia"
    assert result["channels"]["Whatsapp"]["Slm"] == "Adeel"


def test_load_call_script():
    from tools.crm_coaching.load_reference_data import parse_call_script

    raw_script = [
        ["", "Step", "Purpose", "What to Say", "CRM Actions"],
        ["", "1", "Greet & Confirm Caller", "Hi, this is Sarah from Carisma Aesthetics. Is this [name]?", "Confirm name & phone number"],
        ["", "2", "Confirm call & Treatment History", "Perfect, I'm responding to your request...", "Note if client is new/experienced"],
    ]

    result = parse_call_script(raw_script, brand="Aesthetics")

    assert result["brand"] == "Aesthetics"
    assert len(result["steps"]) == 2
    assert result["steps"][0]["step_number"] == 1
    assert result["steps"][0]["purpose"] == "Greet & Confirm Caller"
    assert "Sarah" in result["steps"][0]["script"]


def test_load_brand_voice():
    from tools.crm_coaching.load_reference_data import load_brand_voice

    # This reads from actual files — integration test
    voice = load_brand_voice("aesthetics")

    assert voice is not None
    assert "Glow with Confidence" in voice or "Sarah" in voice
```

**Step 2: Implement**

`load_reference_data.py`:
- `load_all_reference_data()` — Main entry point. Returns a dict with:
  - `roster` — Parsed roster with channel → brand → rep mapping + weekly schedule
  - `scripts` — Call scripts per brand (parsed from sheet)
  - `dial_templates` — 11 dial/outreach message templates per brand (parsed from sheet)
  - `brand_voice` — Brand voice markdown per brand (from `config/brand-voice/`)
  - `knowledge_bases` — KB JSON per brand (from `CRM/CRM-*/knowledge/kb-*.json`)
  - `offers` — Current offers and packages (from CRM Master Sheet Offers + Packages tabs)
  - `knowledge_docs` — All markdown knowledge files per brand (booking policy, pricing, etc.)
- Uses Google Sheets MCP to read the CRM Master Sheet
- Uses local file reads for brand voice and knowledge bases

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/load_reference_data.py tools/crm-coaching/tests/test_reference_data.py
git commit -m "feat(coaching): add reference data loader for scripts, roster, and knowledge bases"
```

---

## Phase 3: Analysis Sub-Agents

Each sub-agent is a Claude API call with a specialized system prompt and structured output.

### Task 7: CRM Process Agent

**Files:**
- Create: `tools/crm-coaching/agents/crm_process_agent.py`
- Create: `tools/crm-coaching/agents/__init__.py`
- Test: `tools/crm-coaching/tests/test_crm_process_agent.py`

**Context:** This agent answers "Did the rep follow the process?" It analyzes: speed to lead, follow-up compliance, pipeline hygiene, roster adherence, missed opportunities.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_crm_process_agent.py
import json

def test_crm_process_agent_prompt_includes_roster():
    from tools.crm_coaching.agents.crm_process_agent import build_prompt

    reference_data = {
        "roster": {
            "channels": {"Whatsapp": {"Spa": "Abid"}},
            "schedule": {"Abid": {"Mon": "Spa", "Tue": "Spa"}},
        }
    }

    conversation = {
        "channel": "whatsapp",
        "brand": "Spa",
        "rep": "Abid",
        "date": "2026-04-10",
        "messages": [],
    }

    prompt = build_prompt(conversation, reference_data)

    assert "Abid" in prompt
    assert "speed to lead" in prompt.lower() or "response time" in prompt.lower()


def test_crm_process_output_schema():
    from tools.crm_coaching.agents.crm_process_agent import parse_output

    raw_output = json.dumps({
        "response_time_seconds": 120,
        "response_time_rating": "good",
        "follow_up_sent": True,
        "correct_dial_type": "New lead (Offer)",
        "actual_dial_type_used": "New lead (Offer)",
        "script_followed": True,
        "pipeline_status": "booked",
        "roster_compliant": True,
        "issues": [],
        "score": 9,
    })

    result = parse_output(raw_output)

    assert result["score"] == 9
    assert result["response_time_seconds"] == 120
    assert result["pipeline_status"] == "booked"
```

**Step 2: Implement**

`crm_process_agent.py`:
- `build_prompt(conversation, reference_data)` — Constructs the system prompt with:
  - The agent's role and scoring criteria
  - The roster data (who should be on which channel/brand/day)
  - Response time benchmarks (<5 min = good, 5-15 min = okay, >15 min = poor)
  - The 11 dial types so it can identify which template should have been used
- `analyze(conversation, reference_data)` — Calls Claude API with the prompt + conversation, returns structured JSON
- `parse_output(raw)` — Validates and parses the Claude response

**System prompt core:**
```
You are a CRM Process Analyst for Carisma Wellness Group.

Analyze this conversation and evaluate:
1. SPEED TO LEAD: Time from first customer message to first agent response
   - <5 min = excellent, 5-15 min = acceptable, >15 min = poor
2. FOLLOW-UP COMPLIANCE: Was the correct dial type template used?
3. PIPELINE HYGIENE: Does the conversation end with a clear next step?
4. ROSTER COMPLIANCE: Was the correct rep handling this brand/channel/day?
5. MISSED OPPORTUNITIES: Any leads that died without proper follow-up?

Return your analysis as JSON with this exact structure: {schema}
```

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/agents/
git commit -m "feat(coaching): add CRM Process analysis agent"
```

---

### Task 8: Sales Coaching Agent

**Files:**
- Create: `tools/crm-coaching/agents/sales_coaching_agent.py`
- Test: `tools/crm-coaching/tests/test_sales_coaching_agent.py`

**Context:** This agent answers "Did the rep sell effectively?" It scores conversations against the brand's call/message script step by step.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_sales_coaching_agent.py
import json

def test_sales_agent_prompt_includes_script():
    from tools.crm_coaching.agents.sales_coaching_agent import build_prompt

    reference_data = {
        "scripts": {
            "Aesthetics": {
                "steps": [
                    {"step_number": 1, "purpose": "Greet & Confirm Caller", "script": "Hi, this is Sarah..."},
                    {"step_number": 2, "purpose": "Confirm call & Treatment History", "script": "Perfect, I'm responding..."},
                    {"step_number": 3, "purpose": "Ask WHY", "script": "What specific concerns..."},
                ]
            }
        }
    }

    conversation = {
        "channel": "whatsapp",
        "brand": "Aesthetics",
        "rep": "Rana",
        "messages": [
            {"sender": "agent", "text": "Hi this is Rana from Carisma Aesthetics", "timestamp": "2026-04-10T14:00:00Z"},
            {"sender": "customer", "text": "Hi yes I want jawline filler", "timestamp": "2026-04-10T14:00:30Z"},
            {"sender": "agent", "text": "Great the package is €199", "timestamp": "2026-04-10T14:01:00Z"},
        ],
    }

    prompt = build_prompt(conversation, reference_data)

    assert "Greet & Confirm" in prompt
    assert "Ask WHY" in prompt


def test_sales_output_identifies_skipped_steps():
    from tools.crm_coaching.agents.sales_coaching_agent import parse_output

    raw_output = json.dumps({
        "script_score": 6,
        "steps_completed": [1, 2, 5, 7],
        "steps_skipped": [3, 4],
        "closing_attempted": True,
        "closing_effective": False,
        "objections_encountered": ["I'll think about it"],
        "objection_handling_score": 4,
        "strengths": ["Fast greeting", "Good energy"],
        "improvements": [
            {"issue": "Skipped Ask WHY step", "impact": "high", "suggestion": "Ask 'What specific concerns have you noticed?' before pitching"},
            {"issue": "Jumped to price without value anchor", "impact": "high", "suggestion": "Mention perceived value (€350) before actual price (€199)"},
        ],
        "overall_score": 6,
    })

    result = parse_output(raw_output)

    assert result["script_score"] == 6
    assert 3 in result["steps_skipped"]
    assert len(result["improvements"]) == 2
```

**Step 2: Implement**

`sales_coaching_agent.py`:
- System prompt includes the full brand-specific script with all steps
- Scores each step as completed/skipped/partially done
- Evaluates objection handling with specific alternatives
- Compares to "ideal" conversation flow
- Outputs specific, actionable coaching tied to exact messages

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/agents/sales_coaching_agent.py tools/crm-coaching/tests/test_sales_coaching_agent.py
git commit -m "feat(coaching): add Sales Coaching analysis agent"
```

---

### Task 9: Brand Domain Agent

**Files:**
- Create: `tools/crm-coaching/agents/brand_domain_agent.py`
- Test: `tools/crm-coaching/tests/test_brand_domain_agent.py`

**Context:** This agent answers "Was the brand represented correctly?" Uses brand voice configs, knowledge bases, and current offers/pricing as reference.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_brand_domain_agent.py
import json

def test_brand_agent_detects_wrong_pricing():
    from tools.crm_coaching.agents.brand_domain_agent import build_prompt

    reference_data = {
        "brand_voice": {"Spa": "Tagline: Beyond the Spa. Tone: peaceful, soothing, elegant."},
        "offers": {"Spa": [{"name": "April Spa Package", "price": 55, "perceived_value": 120}]},
        "knowledge_bases": {"Spa": {"entries": []}},
        "knowledge_docs": {"Spa": {"pricing": "Aromatherapy massage: €55"}},
    }

    conversation = {
        "brand": "Spa",
        "rep": "Abid",
        "messages": [
            {"sender": "agent", "text": "The aromatherapy is €45", "timestamp": "2026-04-10T10:00:00Z"},
        ],
    }

    prompt = build_prompt(conversation, reference_data)

    assert "€55" in prompt or "55" in prompt  # Reference pricing included
    assert "Beyond the Spa" in prompt or "peaceful" in prompt  # Brand voice included


def test_brand_output_schema():
    from tools.crm_coaching.agents.brand_domain_agent import parse_output

    raw_output = json.dumps({
        "brand_voice_score": 6,
        "brand_voice_issues": ["Too transactional — missing warmth"],
        "factual_errors": [{"field": "pricing", "said": "€45", "correct": "€55", "severity": "high"}],
        "offer_accuracy": True,
        "treatment_knowledge_score": 8,
        "missed_upsells": [{"trigger": "mentioned anniversary", "suggestion": "couples add-on"}],
        "overall_score": 6,
    })

    result = parse_output(raw_output)

    assert result["brand_voice_score"] == 6
    assert len(result["factual_errors"]) == 1
    assert result["factual_errors"][0]["correct"] == "€55"
```

**Step 2: Implement**

`brand_domain_agent.py`:
- System prompt loaded with full brand voice guide, current pricing, active offers, and KB entries
- Checks every factual claim in the conversation against reference data
- Evaluates tone alignment with brand personality
- Identifies missed upsell/cross-sell based on conversation context

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/agents/brand_domain_agent.py tools/crm-coaching/tests/test_brand_domain_agent.py
git commit -m "feat(coaching): add Brand Domain analysis agent"
```

---

## Phase 4: Report Generation

### Task 10: Report Generator — Per-Rep WhatsApp Summary

**Files:**
- Create: `tools/crm-coaching/reports/whatsapp_summary.py`
- Test: `tools/crm-coaching/tests/test_whatsapp_summary.py`

**Context:** Takes the merged analysis from all 3 agents for a single rep's daily conversations and generates a short, actionable WhatsApp message. Max ~500 words. Uses the WhatsApp MCP to send.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_whatsapp_summary.py
def test_generate_rep_summary():
    from tools.crm_coaching.reports.whatsapp_summary import generate_summary

    daily_analysis = {
        "rep": "Rana",
        "brand": "Aesthetics",
        "date": "2026-04-10",
        "total_conversations": 14,
        "bookings": 4,
        "conversion_rate": 0.29,
        "avg_response_time_seconds": 180,
        "top_win": {
            "contact": "Julia K.",
            "reason": "Perfect value anchoring before price",
        },
        "improvements": [
            {"issue": "Skipped Ask WHY in 6/14 threads", "priority": 1},
            {"issue": "Thread with Marco R. died after objection", "priority": 2},
            {"issue": "Quoted old pricing for Snatch package", "priority": 3},
        ],
        "tip": "When a lead says 'I'll think about it', respond with...",
    }

    message = generate_summary(daily_analysis)

    assert "Rana" in message
    assert "14 conversations" in message
    assert "4 booking" in message
    assert "29%" in message
    assert len(message) < 2000  # WhatsApp message limit
```

**Step 2: Implement**

Template-based message builder. Clean formatting for mobile readability.

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/reports/ tools/crm-coaching/tests/test_whatsapp_summary.py
git commit -m "feat(coaching): add per-rep WhatsApp coaching summary generator"
```

---

### Task 11: Report Generator — Google Sheets Dashboard

**Files:**
- Create: `tools/crm-coaching/reports/sheets_dashboard.py`
- Test: `tools/crm-coaching/tests/test_sheets_dashboard.py`

**Context:** Creates/updates a Google Sheet with 3 tabs: Team Overview, Conversation Log, Trends. Uses the Google Workspace MCP (`sheets_update_values`, `sheets_append_values`).

**Step 1: Create the dashboard spreadsheet**

Create a new Google Sheet titled "CRM Coaching Dashboard" with 3 tabs:
- `Team Overview` — Daily rep scorecard
- `Conversation Log` — Every conversation scored
- `Trends` — Rolling weekly averages

Store the spreadsheet ID in `.env` as `CRM_COACHING_DASHBOARD_ID`.

**Step 2: Write the failing test**

```python
# tools/crm-coaching/tests/test_sheets_dashboard.py
def test_format_team_overview_row():
    from tools.crm_coaching.reports.sheets_dashboard import format_team_overview_row

    analysis = {
        "rep": "Rana",
        "brand": "Aesthetics",
        "date": "2026-04-10",
        "total_conversations": 14,
        "bookings": 4,
        "conversion_rate": 0.29,
        "avg_response_time_seconds": 180,
        "script_score": 8.1,
        "trend": "up",
    }

    row = format_team_overview_row(analysis)

    assert row == ["2026-04-10", "Rana", "Aesthetics", 14, 4, "29%", "3 min", "8.1/10", "↑"]


def test_format_conversation_log_row():
    from tools.crm_coaching.reports.sheets_dashboard import format_conversation_log_row

    conversation_analysis = {
        "id": "wa-20260410-julia-k",
        "date": "2026-04-10",
        "rep": "Rana",
        "brand": "Aesthetics",
        "channel": "whatsapp",
        "contact_name": "Julia K.",
        "message_count": 8,
        "outcome": "booked",
        "crm_score": 9,
        "sales_score": 8,
        "brand_score": 9,
        "overall_score": 8.7,
    }

    row = format_conversation_log_row(conversation_analysis)

    assert row[0] == "2026-04-10"
    assert row[1] == "Rana"
    assert row[5] == "booked"
    assert row[9] == 8.7
```

**Step 3: Implement**

`sheets_dashboard.py`:
- `update_team_overview(date, analyses)` — Appends daily rows to Team Overview tab
- `update_conversation_log(date, conversation_analyses)` — Appends every conversation
- `update_trends(date, analyses)` — Calculates and appends 7-day rolling averages
- Uses `mcp__google-workspace__sheets_append_values` for adding rows

**Step 4: Run tests, then commit**

```bash
git add tools/crm-coaching/reports/sheets_dashboard.py tools/crm-coaching/tests/test_sheets_dashboard.py
git commit -m "feat(coaching): add Google Sheets dashboard report generator"
```

---

### Task 12: Report Generator — Manager Email

**Files:**
- Create: `tools/crm-coaching/reports/manager_email.py`
- Test: `tools/crm-coaching/tests/test_manager_email.py`

**Context:** Generates an HTML email with top wins, red flags, conversion trends, and one strategic insight. Sends via Google Workspace MCP (`gmail_send_email`).

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_manager_email.py
def test_generate_manager_email():
    from tools.crm_coaching.reports.manager_email import generate_email

    daily_summary = {
        "date": "2026-04-10",
        "team_conversion_rate": 0.25,
        "seven_day_avg": 0.22,
        "thirty_day_avg": 0.20,
        "top_wins": [
            {"rep": "Rana", "contact": "Julia K.", "reason": "Perfect script execution, booked in 8 messages"},
        ],
        "red_flags": [
            {"rep": "Adeel", "contact": "Maria C.", "reason": "47 min response time, lead went cold"},
        ],
        "strategic_insight": "Slimming leads mentioning GLP-1 convert at 45% when acknowledged — only 2/7 reps do this",
        "rep_summaries": [],
    }

    subject, body = generate_email(daily_summary)

    assert "Apr 10" in subject
    assert "25%" in body
    assert "Rana" in body
    assert "GLP-1" in body
```

**Step 2: Implement, test, commit**

```bash
git add tools/crm-coaching/reports/manager_email.py tools/crm-coaching/tests/test_manager_email.py
git commit -m "feat(coaching): add manager email report generator"
```

---

## Phase 5: Orchestrator

### Task 13: Orchestrator Agent

**Files:**
- Create: `tools/crm-coaching/orchestrator.py`
- Test: `tools/crm-coaching/tests/test_orchestrator.py`

**Context:** The main entry point. Runs daily. Coordinates the entire pipeline: pull data → load references → dispatch to sub-agents → merge results → generate reports → deliver.

**Step 1: Write the failing test**

```python
# tools/crm-coaching/tests/test_orchestrator.py
from unittest.mock import patch, MagicMock

def test_orchestrator_pipeline_stages():
    """Verify the orchestrator calls each stage in order."""
    from tools.crm_coaching.orchestrator import run_daily_coaching

    with patch("tools.crm_coaching.orchestrator.pull_all_conversations") as mock_pull, \
         patch("tools.crm_coaching.orchestrator.load_all_reference_data") as mock_ref, \
         patch("tools.crm_coaching.orchestrator.analyze_conversations") as mock_analyze, \
         patch("tools.crm_coaching.orchestrator.generate_reports") as mock_reports, \
         patch("tools.crm_coaching.orchestrator.deliver_reports") as mock_deliver:

        mock_pull.return_value = {"conversations": [], "date": "2026-04-10"}
        mock_ref.return_value = {"roster": {}, "scripts": {}}
        mock_analyze.return_value = []
        mock_reports.return_value = {"whatsapp": [], "sheet": [], "email": None}

        run_daily_coaching(date="2026-04-10")

        mock_pull.assert_called_once()
        mock_ref.assert_called_once()
        mock_analyze.assert_called_once()
        mock_reports.assert_called_once()
        mock_deliver.assert_called_once()


def test_merge_agent_outputs():
    from tools.crm_coaching.orchestrator import merge_agent_outputs

    crm_output = {"score": 8, "response_time_seconds": 120, "pipeline_status": "booked"}
    sales_output = {"script_score": 7, "steps_skipped": [3], "improvements": [{"issue": "Skipped Ask WHY"}]}
    brand_output = {"brand_voice_score": 9, "factual_errors": [], "missed_upsells": []}

    merged = merge_agent_outputs(crm_output, sales_output, brand_output)

    assert merged["crm_score"] == 8
    assert merged["sales_score"] == 7
    assert merged["brand_score"] == 9
    assert "overall_score" in merged
    assert merged["overall_score"] == 8.0  # average
```

**Step 2: Implement**

`orchestrator.py`:

```python
"""
Daily CRM Sales Coaching Orchestrator.

Runs at 6:00 AM daily. Pulls all conversations from the previous day,
analyzes them through 3 specialized agents, and delivers coaching reports.

Usage:
    python orchestrator.py                    # Analyze yesterday
    python orchestrator.py --date 2026-04-10  # Analyze specific date
"""
import argparse
import json
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

from tools.crm_coaching.pull_whatsapp_conversations import pull_whatsapp
from tools.crm_coaching.pull_meta_conversations import pull_meta
from tools.crm_coaching.pull_salesiq_conversations import pull_salesiq
from tools.crm_coaching.pull_arkafort_calls import pull_arkafort
from tools.crm_coaching.load_reference_data import load_all_reference_data
from tools.crm_coaching.agents.crm_process_agent import CRMProcessAgent
from tools.crm_coaching.agents.sales_coaching_agent import SalesCoachingAgent
from tools.crm_coaching.agents.brand_domain_agent import BrandDomainAgent
from tools.crm_coaching.reports.whatsapp_summary import generate_and_send_summaries
from tools.crm_coaching.reports.sheets_dashboard import update_dashboard
from tools.crm_coaching.reports.manager_email import generate_and_send_email

logger = logging.getLogger(__name__)


def pull_all_conversations(date: str) -> dict:
    """Pull conversations from all channels for the given date."""
    conversations = []

    # Pull from each channel (parallel where possible)
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(pull_whatsapp, date): "whatsapp",
            executor.submit(pull_meta, date): "meta_dm",
            executor.submit(pull_salesiq, date): "salesiq",
            executor.submit(pull_arkafort, date): "arkafort_call",
        }
        for future in futures:
            try:
                result = future.result(timeout=300)
                conversations.extend(result)
            except Exception as e:
                logger.error(f"Failed to pull {futures[future]}: {e}")

    return {
        "date": date,
        "conversations": conversations,
        "total_conversations": len(conversations),
        "pulled_at": datetime.now().isoformat(),
    }


def analyze_conversations(conversations: list, reference_data: dict) -> list:
    """Run all 3 sub-agents on each conversation."""
    crm_agent = CRMProcessAgent()
    sales_agent = SalesCoachingAgent()
    brand_agent = BrandDomainAgent()

    results = []
    for conv in conversations:
        # Run 3 agents in parallel per conversation
        with ThreadPoolExecutor(max_workers=3) as executor:
            crm_future = executor.submit(crm_agent.analyze, conv, reference_data)
            sales_future = executor.submit(sales_agent.analyze, conv, reference_data)
            brand_future = executor.submit(brand_agent.analyze, conv, reference_data)

            crm_result = crm_future.result(timeout=60)
            sales_result = sales_future.result(timeout=60)
            brand_result = brand_future.result(timeout=60)

        merged = merge_agent_outputs(crm_result, sales_result, brand_result)
        merged["conversation"] = conv
        results.append(merged)

    return results


def merge_agent_outputs(crm: dict, sales: dict, brand: dict) -> dict:
    """Merge outputs from all 3 agents into a single analysis."""
    scores = [crm.get("score", 0), sales.get("script_score", 0) or sales.get("overall_score", 0), brand.get("overall_score", 0)]
    overall = round(sum(scores) / len(scores), 1) if scores else 0

    return {
        "crm_score": crm.get("score", 0),
        "crm_details": crm,
        "sales_score": sales.get("script_score", 0) or sales.get("overall_score", 0),
        "sales_details": sales,
        "brand_score": brand.get("overall_score", 0),
        "brand_details": brand,
        "overall_score": overall,
    }


def generate_reports(date: str, analyses: list, reference_data: dict) -> dict:
    """Generate all 3 report types from the merged analyses."""
    # Group analyses by rep
    by_rep = {}
    for a in analyses:
        rep = a["conversation"].get("rep", "Unknown")
        by_rep.setdefault(rep, []).append(a)

    return {
        "by_rep": by_rep,
        "date": date,
        "total_analyzed": len(analyses),
    }


def deliver_reports(reports: dict):
    """Send reports to all 3 channels."""
    generate_and_send_summaries(reports)
    update_dashboard(reports)
    generate_and_send_email(reports)


def run_daily_coaching(date: str = None):
    """Main entry point for daily coaching pipeline."""
    if date is None:
        date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    logger.info(f"Starting daily coaching analysis for {date}")

    # Stage 1: Pull all conversations
    batch = pull_all_conversations(date)
    logger.info(f"Pulled {batch['total_conversations']} conversations")

    if batch["total_conversations"] == 0:
        logger.info("No conversations to analyze. Exiting.")
        return

    # Stage 2: Load reference data
    reference_data = load_all_reference_data()
    logger.info("Loaded reference data")

    # Stage 3: Analyze through sub-agents
    analyses = analyze_conversations(batch["conversations"], reference_data)
    logger.info(f"Analyzed {len(analyses)} conversations")

    # Stage 4: Generate reports
    reports = generate_reports(date, analyses, reference_data)

    # Stage 5: Deliver
    deliver_reports(reports)
    logger.info("Reports delivered successfully")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Daily CRM Sales Coaching")
    parser.add_argument("--date", help="Date to analyze (YYYY-MM-DD). Defaults to yesterday.")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    run_daily_coaching(date=args.date)
```

**Step 3: Run tests, then commit**

```bash
git add tools/crm-coaching/orchestrator.py tools/crm-coaching/tests/test_orchestrator.py
git commit -m "feat(coaching): add orchestrator agent coordinating full daily pipeline"
```

---

## Phase 6: Scheduling & Deployment

### Task 14: Set Up Daily Cron Schedule

**Context:** Use Claude Code's `/schedule` skill to create a remote agent that runs `orchestrator.py` daily at 6:00 AM Malta time (CET/CEST).

**Step 1: Create the scheduled agent**

Use the `/schedule` command:
```
/schedule create "CRM Daily Coaching" --cron "0 6 * * *" --timezone "Europe/Malta"
```

The scheduled agent's prompt:
```
Run the CRM Sales Coaching daily pipeline.

1. cd to project root
2. Run: python tools/crm-coaching/orchestrator.py
3. If any errors occur, log them and still deliver partial results
4. Report completion status
```

**Step 2: Test with manual run**

```bash
python tools/crm-coaching/orchestrator.py --date 2026-04-10
```

Verify all 3 outputs are generated:
- WhatsApp messages sent to reps
- Google Sheet updated
- Email sent to management

**Step 3: Commit any schedule config**

```bash
git add -A
git commit -m "feat(coaching): add daily 6AM cron schedule for coaching pipeline"
```

---

### Task 15: Contact Arkafort for API Access

**Not a code task — action item for Mert:**

Call Arkafort at **+356 22293000** and ask:
1. Does Arkafort Redin have an API for downloading call recordings?
2. Can CDR (Call Detail Records) be exported programmatically?
3. Does the console support scheduled CSV/audio exports?
4. They advertise "call transcripts and analysis" — can those transcripts be exported?

Once we know the answer, we'll either:
- Build a proper API integration (if they have one)
- Set up a daily manual export workflow (interim)
- Explore SIP-level CDR capture (if they don't cooperate)

---

### Task 16: Zoho SalesIQ OAuth Setup

**Not a code task — action item for Mert:**

1. Go to `https://api-console.zoho.eu`
2. Create a "Server-based Application"
3. Set redirect URI to `http://localhost:8080/callback`
4. Request scope: `SalesIQ.conversations.READ`
5. Complete OAuth flow to get refresh token
6. Add to `.env`:
   ```
   ZOHO_SALESIQ_CLIENT_ID=<from step 2>
   ZOHO_SALESIQ_CLIENT_SECRET=<from step 2>
   ZOHO_SALESIQ_REFRESH_TOKEN=<from step 5>
   ZOHO_SALESIQ_SCREEN_NAME=<your SalesIQ screen name>
   ```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Data Collection | Tasks 1-5 | Pull conversations from WhatsApp, Meta DMs, SalesIQ, Arkafort |
| 2: Reference Data | Task 6 | Load scripts, roster, brand voice, knowledge bases |
| 3: Analysis Agents | Tasks 7-9 | CRM Process + Sales Coaching + Brand Domain agents |
| 4: Reports | Tasks 10-12 | WhatsApp summaries, Sheets dashboard, manager email |
| 5: Orchestrator | Task 13 | Wire everything together |
| 6: Deploy | Tasks 14-16 | Daily cron, Arkafort API investigation, SalesIQ OAuth |

**Total: 16 tasks. Estimated: 13 code tasks + 3 setup/action items.**

**Dependencies:**
- Tasks 1-5 can be built in parallel (independent channel pullers)
- Task 6 depends on nothing
- Tasks 7-9 depend on Task 2 (schema) and Task 6 (reference data)
- Tasks 10-12 depend on Tasks 7-9 (agent output format)
- Task 13 depends on everything above
- Tasks 14-16 depend on Task 13
