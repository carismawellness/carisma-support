"""
ETL: Zoho CRM -> Supabase
Writes: crm_daily (speed to lead), speed_to_lead_distribution
Schedule: Every 4h
"""
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id
from shared.sheets_reader import safe_float

BUCKETS = ['<1min', '1-3min', '3-5min', '5-15min', '15-30min', '30min+']

def run(leads_data: dict[str, list[dict]]) -> dict:
    logger = ETLLogger('zoho_crm')
    logger.start()
    total = 0
    try:
        for brand_slug, leads in leads_data.items():
            brand_id = get_brand_id(brand_slug)
            total += _process_speed_to_lead(leads, brand_id)
        logger.complete(total)
        return {'rows_upserted': total, 'status': 'success'}
    except Exception as e:
        logger.fail(str(e))
        return {'rows_upserted': total, 'status': 'failed', 'error': str(e)}

def _process_speed_to_lead(leads: list[dict], brand_id: int) -> int:
    return 0
