import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ['NEXT_PUBLIC_SUPABASE_URL']
        key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
        _client = create_client(url, key)
    return _client

def upsert(table: str, rows: list[dict], on_conflict: str) -> int:
    if not rows:
        return 0
    client = get_client()
    result = client.table(table).upsert(rows, on_conflict=on_conflict).execute()
    return len(result.data) if result.data else 0
