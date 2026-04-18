# Zoho CRM MCP Server — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a custom MCP server that gives Claude Code full CRM developer access to the entire Zoho CRM v7 API.

**Architecture:** Python FastMCP server with an OAuth2 HTTP client (auto token refresh) and ~30 tools. Generic CRUD tools work across any module; specialized tools handle unique API shapes (lead conversion, blueprints, bulk ops). Same pattern as the Talexio MCP at `~/.claude/mcp-servers/talexio-mcp/`.

**Tech Stack:** Python 3.11+, FastMCP (`mcp` package), `httpx`, `python-dotenv`, `uv` for dependency management.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `~/.claude/mcp-servers/zoho-crm-mcp/pyproject.toml`

**Step 1: Create directory**

```bash
mkdir -p ~/.claude/mcp-servers/zoho-crm-mcp
```

**Step 2: Write pyproject.toml**

```toml
[project]
name = "zoho-crm-mcp"
version = "0.1.0"
description = "MCP server for Zoho CRM v7 REST API"
requires-python = ">=3.11"
dependencies = [
    "mcp>=1.0.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
]

[tool.uv]
package = true

[tool.setuptools]
py-modules = ["server", "client"]
```

**Step 3: Initialize venv**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && uv sync
```

**Step 4: Commit**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp
git init && git add -A && git commit -m "chore: scaffold zoho-crm-mcp project"
```

---

## Task 2: OAuth2 Client

**Files:**
- Create: `~/.claude/mcp-servers/zoho-crm-mcp/client.py`

**Step 1: Write the OAuth2 client**

The client handles:
- Auto token refresh via `POST https://accounts.zoho.eu/oauth/v2/token`
- In-memory access token caching with expiry tracking
- Auth header injection on every request
- Automatic retry on 401 (expired token mid-request)
- Separate base URLs for CRM vs bulk endpoints

```python
"""Zoho CRM v7 REST API client with automatic OAuth2 token refresh."""

import os
import time
from typing import Any, Optional

import httpx


class ZohoCRMClient:
    """HTTP client for Zoho CRM v7 with automatic OAuth2 token management."""

    def __init__(self):
        self._client_id = os.environ["ZOHO_CLIENT_ID"]
        self._client_secret = os.environ["ZOHO_CLIENT_SECRET"]
        self._refresh_token = os.environ["ZOHO_REFRESH_TOKEN"]
        self._api_domain = os.environ.get("ZOHO_API_DOMAIN", "https://www.zohoapis.eu")

        # Derive accounts URL from api domain (zohoapis.eu -> accounts.zoho.eu)
        domain_suffix = self._api_domain.replace("https://www.zohoapis.", "")
        self._accounts_url = f"https://accounts.zoho.{domain_suffix}/oauth/v2/token"

        self._base_url = f"{self._api_domain}/crm/v7"
        self._bulk_url = f"{self._api_domain}/crm/bulk/v7"

        self._access_token: Optional[str] = os.environ.get("ZOHO_ACCESS_TOKEN")
        self._token_expiry: float = 0  # epoch seconds

        self._http = httpx.Client(timeout=30)

    def _refresh_access_token(self):
        """Get a new access token using the refresh token."""
        resp = self._http.post(
            self._accounts_url,
            data={
                "grant_type": "refresh_token",
                "client_id": self._client_id,
                "client_secret": self._client_secret,
                "refresh_token": self._refresh_token,
            },
        )
        data = resp.json()
        if "access_token" not in data:
            raise RuntimeError(f"Token refresh failed: {data}")
        self._access_token = data["access_token"]
        # Zoho tokens expire in 3600s; refresh 5 min early
        self._token_expiry = time.time() + data.get("expires_in", 3600) - 300

    def _ensure_token(self):
        """Ensure we have a valid access token."""
        if not self._access_token or time.time() >= self._token_expiry:
            self._refresh_access_token()

    def _headers(self) -> dict[str, str]:
        """Build auth headers."""
        return {"Authorization": f"Zoho-oauthtoken {self._access_token}"}

    def request(
        self,
        method: str,
        path: str,
        *,
        params: Optional[dict] = None,
        json_body: Any = None,
        bulk: bool = False,
    ) -> dict:
        """Make an authenticated request to Zoho CRM API.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            path: API path (e.g., '/Leads' or '/settings/modules')
            params: Query parameters
            json_body: JSON request body
            bulk: If True, use bulk API base URL
        """
        self._ensure_token()
        base = self._bulk_url if bulk else self._base_url
        url = f"{base}{path}"

        resp = self._http.request(
            method, url, headers=self._headers(),
            params=params, json=json_body,
        )

        # Retry once on 401 (token expired mid-request)
        if resp.status_code == 401:
            self._refresh_access_token()
            resp = self._http.request(
                method, url, headers=self._headers(),
                params=params, json=json_body,
            )

        # Return parsed JSON, or error dict for non-JSON responses
        if resp.status_code == 204:
            return {"status": "success", "code": 204}
        try:
            return resp.json()
        except Exception:
            return {"status_code": resp.status_code, "body": resp.text[:1000]}
```

**Step 2: Verify it parses correctly**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && uv run python -c "from client import ZohoCRMClient; print('OK')"
```

Expected: Error about missing env vars (that's fine — confirms import works).

**Step 3: Commit**

```bash
git add client.py && git commit -m "feat: add Zoho CRM OAuth2 client with auto token refresh"
```

---

## Task 3: Server with Generic Record Tools (7 tools)

**Files:**
- Create: `~/.claude/mcp-servers/zoho-crm-mcp/server.py`

**Step 1: Write server.py with record CRUD tools**

```python
"""Zoho CRM v7 MCP Server — Full CRM developer access."""

import json
from typing import Optional

from pathlib import Path

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from client import ZohoCRMClient

load_dotenv(Path(__file__).parent / ".env", override=False)

mcp = FastMCP("zoho-crm")
client = ZohoCRMClient()


def _json(data) -> str:
    """Format response as JSON string."""
    return json.dumps(data, indent=2, default=str)


# ============================================================
# Generic Record Tools
# ============================================================

@mcp.tool()
def zoho_list_records(
    module: str,
    fields: Optional[str] = None,
    page: int = 1,
    per_page: int = 200,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
    cvid: Optional[str] = None,
) -> str:
    """List records from any Zoho CRM module with pagination.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals', 'Accounts')
        fields: Comma-separated field API names to return (e.g., 'Last_Name,Email,Phone')
        page: Page number (default 1)
        per_page: Records per page, max 200 (default 200)
        sort_by: Field API name to sort by
        sort_order: 'asc' or 'desc'
        cvid: Custom view ID to filter by
    """
    params = {"page": page, "per_page": per_page}
    if fields:
        params["fields"] = fields
    if sort_by:
        params["sort_by"] = sort_by
    if sort_order:
        params["sort_order"] = sort_order
    if cvid:
        params["cvid"] = cvid
    return _json(client.request("GET", f"/{module}", params=params))


@mcp.tool()
def zoho_get_record(module: str, record_id: str, fields: Optional[str] = None) -> str:
    """Get a single record by ID from any module.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals')
        record_id: The record ID
        fields: Optional comma-separated field API names to return
    """
    params = {}
    if fields:
        params["fields"] = fields
    return _json(client.request("GET", f"/{module}/{record_id}", params=params or None))


@mcp.tool()
def zoho_create_records(module: str, data: str, trigger: Optional[str] = None) -> str:
    """Create one or more records in any module (max 100).

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals')
        data: JSON string of record(s). Single object or array of objects.
              Example: '[{"Last_Name": "Smith", "Email": "smith@example.com"}]'
        trigger: Optional comma-separated triggers: 'workflow', 'blueprint', 'approval'
    """
    records = json.loads(data)
    if isinstance(records, dict):
        records = [records]
    body = {"data": records}
    if trigger:
        body["trigger"] = [t.strip() for t in trigger.split(",")]
    return _json(client.request("POST", f"/{module}", json_body=body))


@mcp.tool()
def zoho_update_records(module: str, data: str, trigger: Optional[str] = None) -> str:
    """Update one or more records in any module (max 100). Each record must include 'id'.

    Args:
        module: API name of the module
        data: JSON string of record(s) with 'id' field.
              Example: '[{"id": "5344xxxx", "Phone": "+356 1234 5678"}]'
        trigger: Optional comma-separated triggers: 'workflow', 'blueprint', 'approval'
    """
    records = json.loads(data)
    if isinstance(records, dict):
        records = [records]
    body = {"data": records}
    if trigger:
        body["trigger"] = [t.strip() for t in trigger.split(",")]
    return _json(client.request("PUT", f"/{module}", json_body=body))


@mcp.tool()
def zoho_upsert_records(
    module: str, data: str, duplicate_check_fields: Optional[str] = None
) -> str:
    """Upsert records — insert new or update existing based on duplicate check fields.

    Args:
        module: API name of the module
        data: JSON string of record(s).
              Example: '[{"Email": "smith@example.com", "Last_Name": "Smith"}]'
        duplicate_check_fields: Comma-separated field API names to check for duplicates.
                                Example: 'Email' or 'Email,Phone'
    """
    records = json.loads(data)
    if isinstance(records, dict):
        records = [records]
    body = {"data": records}
    if duplicate_check_fields:
        body["duplicate_check_fields"] = [f.strip() for f in duplicate_check_fields.split(",")]
    return _json(client.request("POST", f"/{module}/upsert", json_body=body))


@mcp.tool()
def zoho_delete_records(module: str, ids: str) -> str:
    """Delete records by IDs (max 100).

    Args:
        module: API name of the module
        ids: Comma-separated record IDs to delete.
             Example: '5344xxxx,5344yyyy'
    """
    return _json(client.request("DELETE", f"/{module}", params={"ids": ids}))


@mcp.tool()
def zoho_search(
    module: str,
    criteria: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    word: Optional[str] = None,
    page: int = 1,
    per_page: int = 200,
) -> str:
    """Search records in any module by criteria, email, phone, or keyword.

    Provide exactly one of: criteria, email, phone, word.

    Args:
        module: API name of the module
        criteria: Search criteria string. Example: '((Last_Name:equals:Smith)and(City:equals:Malta))'
        email: Search by email address
        phone: Search by phone number
        word: Search by keyword across all fields
        page: Page number (default 1)
        per_page: Records per page, max 200
    """
    params = {"page": page, "per_page": per_page}
    if criteria:
        params["criteria"] = criteria
    elif email:
        params["email"] = email
    elif phone:
        params["phone"] = phone
    elif word:
        params["word"] = word
    return _json(client.request("GET", f"/{module}/search", params=params))
```

**Step 2: Verify imports**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && uv run python -c "import server; print(f'Tools: {len(server.mcp._tool_manager._tools)}')"
```

**Step 3: Commit**

```bash
git add server.py && git commit -m "feat: add server with 7 generic record CRUD tools"
```

---

## Task 4: Query, Lead Conversion, Notes, Tags Tools (9 tools)

**Files:**
- Modify: `~/.claude/mcp-servers/zoho-crm-mcp/server.py`

**Step 1: Add COQL query tool**

Append after the Generic Record Tools section:

```python
# ============================================================
# COQL Query
# ============================================================

@mcp.tool()
def zoho_coql_query(query: str) -> str:
    """Execute a COQL (CRM Object Query Language) query — SQL-like syntax.

    Supports SELECT, WHERE, ORDER BY, LIMIT. Max 2000 records per call.

    Args:
        query: The COQL query string.
               Example: "select Last_Name, Email from Leads where City = 'Malta' order by Created_Time desc limit 0, 50"
    """
    return _json(client.request("POST", "/coql", json_body={"select_query": query}))
```

**Step 2: Add lead conversion tool**

```python
# ============================================================
# Lead Conversion
# ============================================================

@mcp.tool()
def zoho_convert_lead(
    lead_id: str,
    deal_name: Optional[str] = None,
    deal_stage: Optional[str] = None,
    account_id: Optional[str] = None,
    overwrite: bool = True,
    notify_lead_owner: bool = True,
) -> str:
    """Convert a lead to contact (and optionally deal/account).

    Args:
        lead_id: The lead record ID to convert
        deal_name: If provided, creates a deal with this name
        deal_stage: Deal stage (required if deal_name is set). Example: 'Qualification'
        account_id: Existing account ID to link to (optional — creates new if omitted)
        overwrite: Overwrite existing record fields (default True)
        notify_lead_owner: Notify the lead owner (default True)
    """
    convert_data: dict = {
        "overwrite": overwrite,
        "notify_lead_owner": notify_lead_owner,
    }
    if deal_name:
        convert_data["Deals"] = {"Deal_Name": deal_name}
        if deal_stage:
            convert_data["Deals"]["Stage"] = deal_stage
    if account_id:
        convert_data["Accounts"] = {"id": account_id}

    return _json(client.request(
        "POST", f"/Leads/{lead_id}/actions/convert",
        json_body={"data": [convert_data]},
    ))
```

**Step 3: Add notes tools**

```python
# ============================================================
# Notes
# ============================================================

@mcp.tool()
def zoho_list_notes(module: str, record_id: str, page: int = 1, per_page: int = 200) -> str:
    """List notes attached to a record.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals')
        record_id: The parent record ID
        page: Page number
        per_page: Notes per page, max 200
    """
    return _json(client.request(
        "GET", f"/{module}/{record_id}/Notes",
        params={"page": page, "per_page": per_page},
    ))


@mcp.tool()
def zoho_create_note(module: str, record_id: str, content: str, title: Optional[str] = None) -> str:
    """Add a note to a record.

    Args:
        module: API name of the module
        record_id: The parent record ID
        content: The note text content
        title: Optional note title
    """
    note = {"Note_Content": content}
    if title:
        note["Note_Title"] = title
    return _json(client.request(
        "POST", f"/{module}/{record_id}/Notes",
        json_body={"data": [note]},
    ))


@mcp.tool()
def zoho_update_note(note_id: str, content: str, title: Optional[str] = None) -> str:
    """Update an existing note.

    Args:
        note_id: The note ID
        content: Updated note content
        title: Updated note title (optional)
    """
    note = {"Note_Content": content}
    if title:
        note["Note_Title"] = title
    return _json(client.request("PUT", f"/Notes/{note_id}", json_body={"data": [note]}))


@mcp.tool()
def zoho_delete_note(note_id: str) -> str:
    """Delete a note.

    Args:
        note_id: The note ID to delete
    """
    return _json(client.request("DELETE", f"/Notes/{note_id}"))
```

**Step 4: Add tags tools**

```python
# ============================================================
# Tags
# ============================================================

@mcp.tool()
def zoho_list_tags(module: str) -> str:
    """List all tags for a module.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals')
    """
    return _json(client.request("GET", "/settings/tags", params={"module": module}))


@mcp.tool()
def zoho_add_tags(module: str, record_ids: str, tag_names: str, overwrite: bool = False) -> str:
    """Add tags to one or more records.

    Args:
        module: API name of the module
        record_ids: Comma-separated record IDs
        tag_names: Comma-separated tag names to add
        overwrite: If True, replace existing tags. If False, append (default False)
    """
    return _json(client.request(
        "POST", f"/{module}/actions/add_tags",
        json_body={
            "tags": [{"name": t.strip()} for t in tag_names.split(",")],
            "ids": [rid.strip() for rid in record_ids.split(",")],
            "over_write": overwrite,
        },
    ))


@mcp.tool()
def zoho_remove_tags(module: str, record_ids: str, tag_names: str) -> str:
    """Remove tags from one or more records.

    Args:
        module: API name of the module
        record_ids: Comma-separated record IDs
        tag_names: Comma-separated tag names to remove
    """
    return _json(client.request(
        "POST", f"/{module}/actions/remove_tags",
        json_body={
            "tags": [{"name": t.strip()} for t in tag_names.split(",")],
            "ids": [rid.strip() for rid in record_ids.split(",")],
        },
    ))
```

**Step 5: Verify tool count**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && uv run python -c "import server; print(f'Tools: {len(server.mcp._tool_manager._tools)}')"
```

Expected: 16 tools

**Step 6: Commit**

```bash
git add server.py && git commit -m "feat: add COQL query, lead conversion, notes, and tags tools"
```

---

## Task 5: Metadata & Customization Tools (5 tools)

**Files:**
- Modify: `~/.claude/mcp-servers/zoho-crm-mcp/server.py`

**Step 1: Add metadata tools**

```python
# ============================================================
# Metadata & Customization
# ============================================================

@mcp.tool()
def zoho_list_modules() -> str:
    """List all CRM modules with their API names, IDs, and metadata.

    Use this to discover available modules and their API names for use
    with other tools.
    """
    return _json(client.request("GET", "/settings/modules"))


@mcp.tool()
def zoho_get_fields(module: str) -> str:
    """Get all field definitions for a module — names, types, picklist values, etc.

    Use this to discover field API names before creating/updating records
    or to understand a module's schema.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts', 'Deals')
    """
    return _json(client.request("GET", "/settings/fields", params={"module": module}))


@mcp.tool()
def zoho_get_layouts(module: str) -> str:
    """Get layouts for a module — sections, fields, and their arrangement.

    Args:
        module: API name of the module
    """
    return _json(client.request("GET", "/settings/layouts", params={"module": module}))


@mcp.tool()
def zoho_get_custom_views(module: str) -> str:
    """Get saved custom views (filters) for a module.

    Returns view IDs that can be used with zoho_list_records(cvid=...).

    Args:
        module: API name of the module
    """
    return _json(client.request("GET", "/settings/custom_views", params={"module": module}))


@mcp.tool()
def zoho_get_pipelines(layout_id: str) -> str:
    """Get pipelines and their stages for a layout.

    Args:
        layout_id: The layout ID (get from zoho_get_layouts)
    """
    return _json(client.request("GET", "/settings/pipeline", params={"layout_id": layout_id}))
```

**Step 2: Commit**

```bash
git add server.py && git commit -m "feat: add metadata tools — modules, fields, layouts, views, pipelines"
```

---

## Task 6: Automation, Users, Org, Bulk, Actions, Escape Hatch (9 tools)

**Files:**
- Modify: `~/.claude/mcp-servers/zoho-crm-mcp/server.py`

**Step 1: Add blueprint tool**

```python
# ============================================================
# Automation
# ============================================================

@mcp.tool()
def zoho_blueprint_transition(
    module: str, record_id: str, transition_id: str, data: Optional[str] = None
) -> str:
    """Move a record through a blueprint transition (stage change).

    First call zoho_api_request to GET /{module}/{record_id}/actions/blueprint
    to see available transitions and their IDs.

    Args:
        module: API name of the module
        record_id: The record ID
        transition_id: The blueprint transition ID
        data: Optional JSON string of field values required by the transition
    """
    transition = {"transition_id": transition_id}
    if data:
        transition["data"] = json.loads(data)
    return _json(client.request(
        "PUT", f"/{module}/{record_id}/actions/blueprint",
        json_body={"blueprint": [transition]},
    ))
```

**Step 2: Add users & org tools**

```python
# ============================================================
# Users & Organization
# ============================================================

@mcp.tool()
def zoho_list_users(
    user_type: str = "ActiveUsers", page: int = 1, per_page: int = 200
) -> str:
    """List CRM users.

    Args:
        user_type: Filter type. Options: AllUsers, ActiveUsers, DeactiveUsers,
                   ConfirmedUsers, NotConfirmedUsers, DeletedUsers,
                   ActiveConfirmedUsers, AdminUsers, CurrentUser
        page: Page number
        per_page: Users per page, max 200
    """
    return _json(client.request(
        "GET", "/users",
        params={"type": user_type, "page": page, "per_page": per_page},
    ))


@mcp.tool()
def zoho_get_roles() -> str:
    """List all roles and their hierarchy in the CRM."""
    return _json(client.request("GET", "/settings/roles"))


@mcp.tool()
def zoho_get_org() -> str:
    """Get organization details — company name, currency, timezone, etc."""
    return _json(client.request("GET", "/org"))
```

**Step 3: Add bulk operation tools**

```python
# ============================================================
# Bulk Operations
# ============================================================

@mcp.tool()
def zoho_bulk_read(module: str, fields: str, criteria: Optional[str] = None, page: int = 1) -> str:
    """Create an async bulk read (export) job. Returns a job ID to check status.

    Use zoho_api_request to check job status at /read/{job_id} (bulk=True)
    and download the result file.

    Args:
        module: API name of the module
        fields: Comma-separated field API names to export
        criteria: Optional JSON string of criteria object.
                  Example: '{"group":[{"field":{"api_name":"Created_Time"},"comparator":"between","value":["2026-01-01T00:00:00+00:00","2026-04-01T00:00:00+00:00"]}],"group_operator":"and"}'
        page: Page number (default 1)
    """
    query = {
        "module": {"api_name": module},
        "fields": [{"api_name": f.strip()} for f in fields.split(",")],
        "page": page,
    }
    if criteria:
        query["criteria"] = json.loads(criteria)
    return _json(client.request(
        "POST", "/read",
        json_body={"query": query, "file_type": "csv"},
        bulk=True,
    ))


@mcp.tool()
def zoho_bulk_write(module: str, file_id: str, operation: str = "upsert", field_mapping: Optional[str] = None) -> str:
    """Create an async bulk write (import) job.

    First upload a CSV file using zoho_api_request POST to /write/upload (bulk=True),
    then use this tool with the returned file_id.

    Args:
        module: API name of the module
        file_id: File ID from the upload step
        operation: 'insert', 'update', or 'upsert' (default 'upsert')
        field_mapping: Optional JSON string of field mappings array.
                       Example: '[{"api_name":"Last_Name","index":0},{"api_name":"Email","index":1}]'
    """
    resource = {
        "type": "data",
        "module": {"api_name": module},
        "file_id": file_id,
    }
    if field_mapping:
        resource["field_mappings"] = json.loads(field_mapping)
    return _json(client.request(
        "POST", "/write",
        json_body={"operation": operation, "resource": [resource]},
        bulk=True,
    ))
```

**Step 4: Add record action tools**

```python
# ============================================================
# Record Actions
# ============================================================

@mcp.tool()
def zoho_send_email(
    module: str,
    record_id: str,
    from_email: str,
    to_email: str,
    subject: str,
    content: str,
    from_name: Optional[str] = None,
    cc: Optional[str] = None,
    bcc: Optional[str] = None,
) -> str:
    """Send an email from a CRM record.

    Args:
        module: API name of the module (e.g., 'Leads', 'Contacts')
        record_id: The record ID to send from
        from_email: Sender email address (must be configured in CRM)
        to_email: Recipient email address
        subject: Email subject
        content: Email body (HTML supported)
        from_name: Optional sender display name
        cc: Optional comma-separated CC email addresses
        bcc: Optional comma-separated BCC email addresses
    """
    email_data = {
        "from": {"email": from_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "content": content,
        "mail_format": "html",
    }
    if from_name:
        email_data["from"]["user_name"] = from_name
    if cc:
        email_data["cc"] = [{"email": e.strip()} for e in cc.split(",")]
    if bcc:
        email_data["bcc"] = [{"email": e.strip()} for e in bcc.split(",")]

    return _json(client.request(
        "POST", f"/{module}/{record_id}/actions/send_mail",
        json_body={"data": [email_data]},
    ))


@mcp.tool()
def zoho_transfer_owner(module: str, record_ids: str, new_owner_id: str) -> str:
    """Transfer ownership of records to a different user.

    Args:
        module: API name of the module
        record_ids: Comma-separated record IDs to transfer
        new_owner_id: User ID of the new owner (get from zoho_list_users)
    """
    ids = [rid.strip() for rid in record_ids.split(",")]
    return _json(client.request(
        "POST", f"/{module}/actions/mass_transfer",
        json_body={
            "mass_transfer": [{"ids": ids, "owner": {"id": new_owner_id}}],
        },
    ))
```

**Step 5: Add escape hatch tool and entry point**

```python
# ============================================================
# Raw API Escape Hatch
# ============================================================

@mcp.tool()
def zoho_api_request(
    method: str,
    path: str,
    params: Optional[str] = None,
    body: Optional[str] = None,
    bulk: bool = False,
) -> str:
    """Make a raw API request to any Zoho CRM endpoint.

    Use this for any operation not covered by the other tools.
    See https://www.zoho.com/crm/developer/docs/api/v7/ for full API docs.

    Args:
        method: HTTP method (GET, POST, PUT, DELETE)
        path: API path starting with / (e.g., '/Leads/5344xxxx/actions/blueprint')
        params: Optional JSON string of query parameters
        body: Optional JSON string of request body
        bulk: If True, use bulk API base URL (/crm/bulk/v7 instead of /crm/v7)
    """
    return _json(client.request(
        method, path,
        params=json.loads(params) if params else None,
        json_body=json.loads(body) if body else None,
        bulk=bulk,
    ))


# ============================================================
# Entry point
# ============================================================

if __name__ == "__main__":
    mcp.run()
```

**Step 6: Verify final tool count**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && uv run python -c "import server; print(f'Tools: {len(server.mcp._tool_manager._tools)}')"
```

Expected: 30 tools

**Step 7: Commit**

```bash
git add server.py && git commit -m "feat: add automation, users, bulk, actions, and escape hatch tools"
```

---

## Task 7: Update .mcp.json Configuration

**Files:**
- Modify: `/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/.mcp.json`

**Step 1: Replace the zoho-crm entry**

Replace the existing `"zoho-crm"` block with:

```json
"zoho-crm": {
  "command": "uv",
  "args": [
    "run",
    "--directory",
    "/Users/mertgulen/.claude/mcp-servers/zoho-crm-mcp",
    "python",
    "server.py"
  ],
  "env": {
    "ZOHO_CLIENT_ID": "1000.T2JSUQRVK983MOFY28ZYQV2H39W3IK",
    "ZOHO_CLIENT_SECRET": "4ac883e8ab414618b941de8622ca6550eef511b7a5",
    "ZOHO_REFRESH_TOKEN": "1000.89afb434c82904b83a0d5416fc7ae64d.05c4eac23c13d11b90c1106ef1eb0de4",
    "ZOHO_API_DOMAIN": "https://www.zohoapis.eu"
  }
}
```

**Step 2: Commit the .mcp.json change**

```bash
git add .mcp.json && git commit -m "chore: update zoho-crm MCP to use custom server"
```

---

## Task 8: Smoke Test

**Step 1: Test server starts**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && ZOHO_CLIENT_ID=test ZOHO_CLIENT_SECRET=test ZOHO_REFRESH_TOKEN=test uv run python -c "
import server
tools = list(server.mcp._tool_manager._tools.keys())
print(f'Total tools: {len(tools)}')
for t in sorted(tools):
    print(f'  - {t}')
"
```

Expected: 30 tools listed.

**Step 2: Test token refresh (live)**

```bash
cd ~/.claude/mcp-servers/zoho-crm-mcp && \
  ZOHO_CLIENT_ID='1000.T2JSUQRVK983MOFY28ZYQV2H39W3IK' \
  ZOHO_CLIENT_SECRET='4ac883e8ab414618b941de8622ca6550eef511b7a5' \
  ZOHO_REFRESH_TOKEN='1000.89afb434c82904b83a0d5416fc7ae64d.05c4eac23c13d11b90c1106ef1eb0de4' \
  ZOHO_API_DOMAIN='https://www.zohoapis.eu' \
  uv run python -c "
from client import ZohoCRMClient
c = ZohoCRMClient()
result = c.request('GET', '/org')
print(result)
"
```

Expected: JSON with organization details (Carisma Spa & Wellness International Ltd).

**Step 3: Restart Claude Code to load the new MCP server**

User action: restart Claude Code or reload MCP servers. Verify zoho-crm tools appear in available tools.
