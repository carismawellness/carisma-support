"""
ETL: EBITDA Google Sheet -> Supabase
Writes: ebitda_monthly
Schedule: 5th of month 10:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('ebitda')
    logger.start()
    total = 0
    try:
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
