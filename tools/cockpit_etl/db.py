"""
Database connection utility for Cockpit ETL.

Requires these environment variables in .env:
    SUPABASE_URL=https://xxxxx.supabase.co
    SUPABASE_SERVICE_KEY=eyJ...  (service_role key for write access)
"""

import os
import json
from pathlib import Path

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

COCKPIT_ENV_PATH = PROJECT_ROOT / "Tech" / "CEO-Cockpit" / ".env.local"

def load_env():
    """Load .env files into os.environ."""
    for env_path in [ENV_PATH, COCKPIT_ENV_PATH]:
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, _, value = line.partition("=")
                        os.environ.setdefault(key.strip(), value.strip())

load_env()

def get_supabase_client():
    """Create and return a Supabase client using service role key."""
    try:
        from supabase import create_client, Client
    except ImportError:
        raise ImportError(
            "supabase-py not installed. Run: pip install supabase"
        )

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_SERVICE_KEY")
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    )

    if not url or not key:
        raise ValueError(
            "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or "
            "SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY in .env files. "
            f"Checked: {ENV_PATH}, {COCKPIT_ENV_PATH}"
        )

    return create_client(url, key)


def load_config():
    """Load cockpit_sources.json config."""
    config_path = PROJECT_ROOT / "config" / "cockpit_sources.json"
    with open(config_path) as f:
        return json.load(f)


def upsert_rows(table_name: str, rows: list[dict], conflict_columns: list[str]):
    """
    Upsert rows into a Supabase table.

    Args:
        table_name: Target table name
        rows: List of dicts matching table columns
        conflict_columns: Columns that form the unique constraint for upsert
    """
    if not rows:
        print(f"  No rows to upsert into {table_name}")
        return

    client = get_supabase_client()

    # Supabase upsert handles ON CONFLICT automatically based on unique constraints
    result = client.table(table_name).upsert(rows).execute()

    print(f"  Upserted {len(rows)} rows into {table_name}")
    return result
