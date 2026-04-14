"""
Cockpit ETL — Data pipeline scripts for the Carisma Cockpit dashboard.

Each ETL module:
1. Reads data from a source (Google Sheets, Meta Ads API, etc.)
2. Transforms it into the cockpit database schema
3. Upserts into Supabase PostgreSQL

Usage:
    python -m tools.cockpit_etl.etl_sales
    python -m tools.cockpit_etl.etl_ebitda
    python -m tools.cockpit_etl.etl_meta_ads
"""
