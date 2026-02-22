#!/usr/bin/env python3
import json
from datetime import datetime
from collections import defaultdict

def run_monthly_update():
    """Run monthly KB verification and generate report"""

    print("=" * 80)
    print("KNOWLEDGE BASE MONTHLY UPDATE CYCLE")
    print("=" * 80)

    # Load KB
    with open('CRM/knowledge-base/kb-data.json') as f:
        kb = json.load(f)

    now = datetime.now().date()

    # 1. VERIFICATION REPORT
    print("\n📋 VERIFICATION REPORT")
    print("-" * 80)

    tier_1 = [e for e in kb['entries'] if e.get('tier') == 1]
    verified = [
        e for e in tier_1
        if e.get('last_reviewed', '2025-01-01') >= '2026-01-01'
    ]

    print(f"Total Tier 1 entries: {len(tier_1)}")
    print(f"Recently verified (this month): {len(verified)}")
    if len(tier_1) > 0:
        print(f"Verification rate: {len(verified) / len(tier_1) * 100:.1f}%")

    needs_review = [
        e for e in tier_1
        if e.get('last_reviewed', '2025-01-01') < '2026-02-01'
    ]

    if needs_review:
        print(f"\n⚠️  Entries needing review ({len(needs_review)}):")
        for e in needs_review[:5]:
            print(f"  - {e['qid']}: {e['question'][:50]}...")

    # 2. VALIDATION CHECK
    print("\n✅ VALIDATION CHECK")
    print("-" * 80)

    errors = []
    for e in kb['entries']:
        if not e.get('keywords') or len(e['keywords']) < 5:
            errors.append(f"{e['qid']}: {len(e.get('keywords', []))} keywords")
        if e.get('confidence_level', 75) < 50:
            errors.append(f"{e['qid']}: confidence {e['confidence_level']}%")

    if errors:
        print(f"❌ {len(errors)} issues found")
        for err in errors[:5]:
            print(f"  {err}")
    else:
        print("✅ All entries pass validation")

    # 3. STATISTICS
    print("\n📊 STATISTICS")
    print("-" * 80)

    by_tier = defaultdict(int)
    by_brand = defaultdict(int)
    avg_confidence = 0

    for e in kb['entries']:
        by_tier[e.get('tier', 1)] += 1
        for b in e.get('brands', []):
            by_brand[b] += 1
        avg_confidence += e.get('confidence_level', 75)

    avg_confidence /= max(len(kb['entries']), 1)

    print(f"Total entries: {len(kb['entries'])}")
    print(f"By tier: T1:{by_tier[1]}, T2:{by_tier[2]}, T3:{by_tier[3]}, T4:{by_tier[4]}")
    print(f"By brand: SPA:{by_brand['SPA']}, AES:{by_brand['AES']}, SLIM:{by_brand['SLIM']}, ALL:{by_brand['ALL']}")
    print(f"Average confidence: {avg_confidence:.1f}%")

    print("\n" + "=" * 80)
    print("MONTHLY CYCLE READY FOR REVIEW")
    print("=" * 80)

if __name__ == '__main__':
    run_monthly_update()
