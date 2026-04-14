from datetime import datetime, timezone
from .supabase_client import get_client

class ETLLogger:
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.started_at = datetime.now(timezone.utc)
        self.log_id: int | None = None

    def start(self):
        client = get_client()
        result = client.table('etl_sync_log').insert({
            'source_name': self.source_name,
            'started_at': self.started_at.isoformat(),
            'status': 'running',
        }).execute()
        if result.data:
            self.log_id = result.data[0]['id']

    def complete(self, rows_upserted: int):
        if not self.log_id:
            return
        now = datetime.now(timezone.utc)
        duration = (now - self.started_at).total_seconds()
        client = get_client()
        client.table('etl_sync_log').update({
            'completed_at': now.isoformat(),
            'status': 'success',
            'rows_upserted': rows_upserted,
            'duration_sec': round(duration, 2),
        }).eq('id', self.log_id).execute()

    def fail(self, error_message: str):
        if not self.log_id:
            return
        now = datetime.now(timezone.utc)
        duration = (now - self.started_at).total_seconds()
        client = get_client()
        client.table('etl_sync_log').update({
            'completed_at': now.isoformat(),
            'status': 'failed',
            'error_message': error_message[:500],
            'duration_sec': round(duration, 2),
        }).eq('id', self.log_id).execute()
