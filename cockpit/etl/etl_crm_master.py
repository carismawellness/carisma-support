"""
ETL: CRM Master Google Sheet -> Supabase
Reads: ' Spa', ' Aes', ' Slm' tabs (KPIs), 'Spa', 'Aes', 'Slm' tabs (Dials)
Writes: crm_daily, crm_by_rep
Schedule: Daily 09:00
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float, safe_int

def run(sheet_data: dict[str, list[list[str]]]) -> dict:
    logger = ETLLogger('crm_master')
    logger.start()
    total = 0
    try:
        brand_tabs = {' Spa': 'spa', ' Aes': 'aesthetics', ' Slm': 'slimming'}
        for tab_name, brand_slug in brand_tabs.items():
            if tab_name in sheet_data:
                brand_id = get_brand_id(brand_slug)
                crm_rows = _process_kpi_tab(sheet_data[tab_name], brand_id)
                count = upsert('crm_daily', crm_rows, 'date,brand_id')
                total += count
        dial_tabs = {'Spa': 'spa', 'Aes': 'aesthetics', 'Slm': 'slimming'}
        for tab_name, brand_slug in dial_tabs.items():
            if tab_name in sheet_data:
                brand_id = get_brand_id(brand_slug)
                rep_rows = _process_dials_tab(sheet_data[tab_name], brand_id)
                count = upsert('crm_by_rep', rep_rows, 'date,staff_id')
                total += count
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}

def _process_kpi_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    rows = []
    return rows

def _process_dials_tab(raw: list[list[str]], brand_id: int) -> list[dict]:
    rows = []
    return rows
