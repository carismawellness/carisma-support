"""
ETL: Marketing Budget Calendar -> Supabase
Writes: budget_vs_actual
Schedule: Monday 08:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('budget_calendar')
    logger.start()
    total = 0
    try:
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
