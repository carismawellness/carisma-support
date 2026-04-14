"""
ETL: Weekly KPIs Google Sheet -> Supabase
Reads: Sales tab, HR tab, Operations tab, Growth tab
Writes: sales_weekly, hr_weekly, operations_weekly, marketing_daily
Schedule: Monday 09:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_sheet_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('weekly_kpis')
    logger.start()
    total = 0
    try:
        if 'Sales' in sheet_data:
            sales_rows = _process_sales_tab(sheet_data['Sales'])
            count = upsert('sales_weekly', sales_rows, 'week_start,location_id')
            total += count
        if 'HR ' in sheet_data:
            hr_rows = _process_hr_tab(sheet_data['HR '])
            count = upsert('hr_weekly', hr_rows, 'week_start,location_id')
            total += count
        if 'Operations' in sheet_data:
            ops_rows = _process_ops_tab(sheet_data['Operations'])
            count = upsert('operations_weekly', ops_rows, 'week_start,location_id')
            total += count
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}

def _process_sales_tab(raw: list[list[str]]) -> list[dict]:
    rows = []
    return rows

def _process_hr_tab(raw: list[list[str]]) -> list[dict]:
    rows = []
    return rows

def _process_ops_tab(raw: list[list[str]]) -> list[dict]:
    rows = []
    return rows
