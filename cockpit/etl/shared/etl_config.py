import json
import os

_config: dict | None = None

def get_config() -> dict:
    global _config
    if _config is None:
        config_path = os.path.join(
            os.path.dirname(__file__), '..', '..', '..', 'config', 'cockpit_sources.json'
        )
        with open(config_path) as f:
            _config = json.load(f)
    return _config

def get_sheet_config(sheet_key: str) -> dict:
    return get_config()['google_sheets'][sheet_key]

def get_api_config(api_key: str) -> dict:
    return get_config()['api_sources'][api_key]

def get_brand_id(slug: str) -> int:
    mapping = {'spa': 1, 'aesthetics': 2, 'slimming': 3}
    return mapping[slug]
