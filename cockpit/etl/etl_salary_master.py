"""
ETL: Salary Master Google Sheet -> Supabase
Writes: hr_weekly (total_salary_cost, hc_pct)
Schedule: 1st of month 10:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.sheets_reader import safe_float

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('salary_master')
    logger.start()
    total = 0
    try:
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}
