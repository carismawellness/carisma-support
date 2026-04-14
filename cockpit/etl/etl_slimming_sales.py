"""
ETL: Slimming Sales Google Sheet -> Supabase
Writes: sales_by_rep, consult_funnel
Schedule: Daily 20:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_sheet_config, get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('slimming_sales')
    logger.start()
    total = 0
    brand_id = get_brand_id('slimming')
    try:
        for tab_name, raw in sheet_data.items():
            if tab_name.startswith('Sales'):
                rep_rows = _process_sales_tab(raw, brand_id)
                count = upsert('sales_by_rep', rep_rows, 'date,staff_id')
                total += count
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}

def _process_sales_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    config = get_sheet_config('slimming_sales')
    cols = config['columns']
    rows = []
    return rows
