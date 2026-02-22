#!/usr/bin/env python3
import json
from pathlib import Path
from collections import defaultdict

def split_knowledge_base():
    """Split master KB into brand-specific files"""

    # Load master KB
    with open('CRM/knowledge-base/kb-data.json') as f:
        master_kb = json.load(f)

    brands = {
        'SPA': 'CRM/CRM-SPA/knowledge/kb-spa.json',
        'AES': 'CRM/CRM-AES/knowledge/kb-aes.json',
        'SLIM': 'CRM/CRM-SLIM/knowledge/kb-slim.json'
    }

    for brand_code, output_path in brands.items():
        # Filter entries for this brand
        brand_entries = [
            e for e in master_kb['entries']
            if brand_code in e['brands'] or 'ALL' in e['brands']
        ]

        # Count by tier
        tier_distribution = defaultdict(int)
        for e in brand_entries:
            tier_distribution[e.get('tier', 1)] += 1

        # Create brand-specific KB
        brand_kb = {
            'metadata': {
                'version': master_kb['metadata']['version'],
                'generated': master_kb['metadata']['generated'],
                'brand': brand_code,
                'total_entries': len(brand_entries),
                'tier_distribution': dict(tier_distribution)
            },
            'entries': brand_entries
        }

        # Ensure directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        # Write to file
        with open(output_path, 'w') as f:
            json.dump(brand_kb, f, indent=2)

        print(f"✅ Created {output_path}")
        print(f"   Entries: {len(brand_entries)}")
        print(f"   Tiers: {dict(tier_distribution)}")

if __name__ == '__main__':
    split_knowledge_base()
