"""
ETL: Zoho CRM -> Supabase
Writes: crm_daily (speed to lead), speed_to_lead_distribution
Schedule: Every 4h
"""
from collections import defaultdict
from datetime import datetime, timezone
from shared.supabase_client import upsert
from shared.etl_logger import ETLLogger
from shared.etl_config import get_brand_id, get_api_config

BUCKETS = ['<1min', '1-3min', '3-5min', '5-15min', '15-30min', '30min+']

# Bucket boundaries in minutes (upper bound, exclusive)
_BUCKET_BOUNDS = [
    (1, '<1min'),
    (3, '1-3min'),
    (5, '3-5min'),
    (15, '5-15min'),
    (30, '15-30min'),
    (float('inf'), '30min+'),
]

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
    """Compute speed-to-lead distribution from Zoho CRM lead records.

    Each lead dict is expected to have 'Created_Time' and 'Last_Activity_Time'
    (or the field names from config: speed_to_lead_fields).
    Groups leads by date, buckets response times, and upserts to
    speed_to_lead_distribution.
    """
    if not leads:
        return 0

    cfg = get_api_config('zoho_crm')
    created_field = cfg['speed_to_lead_fields']['lead_created']     # 'Created_Time'
    activity_field = cfg['speed_to_lead_fields']['first_activity']  # 'Last_Activity_Time'

    # Group response-time minutes by date
    daily_buckets: dict[str, dict[str, int]] = defaultdict(lambda: {b: 0 for b in BUCKETS})

    for lead in leads:
        created_str = lead.get(created_field, '')
        activity_str = lead.get(activity_field, '')
        if not created_str or not activity_str:
            continue

        try:
            created_dt = datetime.fromisoformat(created_str.replace('Z', '+00:00'))
            activity_dt = datetime.fromisoformat(activity_str.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            continue

        diff_minutes = (activity_dt - created_dt).total_seconds() / 60.0
        if diff_minutes < 0:
            continue

        date_key = created_dt.strftime('%Y-%m-%d')

        # Assign to bucket
        for upper_bound, bucket_name in _BUCKET_BOUNDS:
            if diff_minutes < upper_bound:
                daily_buckets[date_key][bucket_name] += 1
                break

    # Build rows for upsert
    rows = []
    for date_key, buckets in daily_buckets.items():
        total_count = sum(buckets.values())
        if total_count == 0:
            continue
        for bucket_name in BUCKETS:
            count = buckets[bucket_name]
            rows.append({
                'date': date_key,
                'brand_id': brand_id,
                'bucket': bucket_name,
                'count': count,
                'pct': round(count / total_count * 100, 2) if total_count else 0,
            })

    return upsert('speed_to_lead_distribution', rows, 'date,brand_id,bucket')
