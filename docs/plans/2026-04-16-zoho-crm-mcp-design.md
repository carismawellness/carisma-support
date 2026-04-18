# Zoho CRM MCP Server — Design

**Date:** 2026-04-16
**Status:** Approved
**Location:** `~/.claude/mcp-servers/zoho-crm-mcp/`

## Purpose

Custom MCP server giving Claude Code full CRM developer capabilities across the entire Zoho CRM v7 API. Replaces the broken third-party `zoho-crm-mcp` package (7 tools, wrong executable name) with a purpose-built server following the same pattern as the Talexio MCP.

## Architecture

```
~/.claude/mcp-servers/zoho-crm-mcp/
  client.py        # OAuth2 HTTP client with auto token refresh
  server.py        # FastMCP server with ~30 tools
  pyproject.toml   # uv package config
  .env             # (optional) local overrides
```

- **Python + FastMCP** (consistent with Talexio MCP)
- **httpx** for HTTP, **uv** for dependency management
- **Approach B**: Generic CRUD tools for any module + specialized tools where API shape differs
- Credentials in `.mcp.json` env vars (client_id, client_secret, refresh_token, api_domain)

## OAuth Client (`client.py`)

- Auto-refreshes access tokens via `POST https://accounts.zoho.eu/oauth/v2/token` using the refresh token
- Caches access token in memory with expiry tracking
- Retries once on 401 (token expired mid-request)
- All requests go through `self.request(method, path, **kwargs)` which handles auth header injection
- Base URL: `https://www.zohoapis.eu/crm/v7/`
- Bulk URL: `https://www.zohoapis.eu/crm/bulk/v7/`

## Tools (30 total)

### Generic Record Tools (7)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_list_records` | GET | `/{module}` | List/paginate records, field selection, sorting, custom view |
| `zoho_get_record` | GET | `/{module}/{id}` | Get single record by ID |
| `zoho_create_records` | POST | `/{module}` | Create 1-100 records |
| `zoho_update_records` | PUT | `/{module}` | Update 1-100 records (by ID in data) |
| `zoho_upsert_records` | POST | `/{module}/upsert` | Upsert with duplicate_check_fields |
| `zoho_delete_records` | DELETE | `/{module}?ids=...` | Delete by comma-separated IDs |
| `zoho_search` | GET | `/{module}/search` | Search by criteria, email, phone, or word |

### Query (1)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_coql_query` | POST | `/coql` | SQL-like queries (SELECT from any module) |

### Lead Conversion (1)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_convert_lead` | POST | `/Leads/{id}/actions/convert` | Convert lead to contact/account/deal |

### Notes (4)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_list_notes` | GET | `/{module}/{id}/Notes` | List notes for a record |
| `zoho_create_note` | POST | `/{module}/{id}/Notes` | Add note to a record |
| `zoho_update_note` | PUT | `/Notes/{id}` | Update existing note |
| `zoho_delete_note` | DELETE | `/Notes/{id}` | Delete a note |

### Tags (3)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_list_tags` | GET | `/settings/tags?module=X` | List tags for a module |
| `zoho_add_tags` | POST | `/{module}/actions/add_tags` | Add tags to records |
| `zoho_remove_tags` | POST | `/{module}/actions/remove_tags` | Remove tags from records |

### Metadata & Customization (5)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_list_modules` | GET | `/settings/modules` | List all CRM modules |
| `zoho_get_fields` | GET | `/settings/fields?module=X` | Field definitions for a module |
| `zoho_get_layouts` | GET | `/settings/layouts?module=X` | Layouts for a module |
| `zoho_get_custom_views` | GET | `/settings/custom_views?module=X` | Saved views/filters |
| `zoho_get_pipelines` | GET | `/settings/pipeline?layout_id=X` | Pipelines and stages |

### Automation (1)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_blueprint_transition` | PUT | `/{module}/{id}/actions/blueprint` | Move record through blueprint stage |

### Users & Org (3)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_list_users` | GET | `/users` | List users (filterable by type) |
| `zoho_get_roles` | GET | `/settings/roles` | List roles and hierarchy |
| `zoho_get_org` | GET | `/org` | Organization details |

### Bulk Operations (2)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_bulk_read` | POST | `/crm/bulk/v7/read` | Async bulk export job |
| `zoho_bulk_write` | POST | `/crm/bulk/v7/write` | Async bulk import job |

### Record Actions (2)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_send_email` | POST | `/{module}/{id}/actions/send_mail` | Send email from a record |
| `zoho_transfer_owner` | POST | `/{module}/actions/mass_transfer` | Mass transfer ownership |

### Escape Hatch (1)

| Tool | Method | Endpoint | Purpose |
|---|---|---|---|
| `zoho_api_request` | ANY | Any path | Raw API call for uncovered endpoints |

## .mcp.json Configuration

Replaces existing `zoho-crm` entry:

```json
"zoho-crm": {
  "command": "uv",
  "args": ["run", "--directory", "/Users/mertgulen/.claude/mcp-servers/zoho-crm-mcp", "python", "server.py"],
  "env": {
    "ZOHO_CLIENT_ID": "...",
    "ZOHO_CLIENT_SECRET": "...",
    "ZOHO_REFRESH_TOKEN": "...",
    "ZOHO_API_DOMAIN": "https://www.zohoapis.eu"
  }
}
```
