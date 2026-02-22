#!/usr/bin/env python3
"""
Knowledge Base Analytics Dashboard
Analyzes KB health, verification status, and performance metrics
"""

import json
import os
from collections import defaultdict
from datetime import datetime

def load_kb():
    """Load the master KB data"""
    kb_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'CRM',
        'knowledge-base',
        'kb-data.json'
    )

    with open(kb_path, 'r') as f:
        return json.load(f)


def analyze_kb():
    """Analyze KB health and performance metrics"""

    kb = load_kb()
    entries = kb.get('entries', [])

    print("\n" + "=" * 80)
    print("KNOWLEDGE BASE ANALYTICS DASHBOARD")
    print("=" * 80 + "\n")

    # 1. CONTENT HEALTH
    print("📚 CONTENT HEALTH")
    print("-" * 80)

    total = len(entries)
    by_tier = defaultdict(int)
    by_brand = defaultdict(int)
    by_status = defaultdict(int)
    by_section = defaultdict(int)
    total_confidence = 0

    for entry in entries:
        tier = entry.get('tier', 1)
        by_tier[tier] += 1

        for brand in entry.get('brands', []):
            if brand != 'ALL':
                by_brand[brand] += 1
            else:
                # Count ALL as applying to each brand
                by_brand['SPA'] += 1
                by_brand['AES'] += 1
                by_brand['SLIM'] += 1

        status = entry.get('status', 'UNKNOWN')
        by_status[status] += 1

        section = entry.get('section', 'Unknown')
        by_section[section] += 1

        total_confidence += entry.get('confidence_level', 75)

    avg_confidence = total_confidence / max(total, 1)

    print(f"Total entries: {total}")
    print(f"\nTier Distribution:")
    tier_pct = {
        1: (by_tier[1] / total * 100 if total > 0 else 0),
        2: (by_tier[2] / total * 100 if total > 0 else 0),
        3: (by_tier[3] / total * 100 if total > 0 else 0),
        4: (by_tier[4] / total * 100 if total > 0 else 0),
    }
    print(f"  Tier 1 (Critical):   {by_tier[1]:2d} ({tier_pct[1]:5.1f}%)")
    print(f"  Tier 2 (Important):  {by_tier[2]:2d} ({tier_pct[2]:5.1f}%)")
    print(f"  Tier 3 (Standard):   {by_tier[3]:2d} ({tier_pct[3]:5.1f}%)")
    print(f"  Tier 4 (Reference):  {by_tier[4]:2d} ({tier_pct[4]:5.1f}%)")

    print(f"\nStatus Distribution:")
    for status in sorted(by_status.keys()):
        count = by_status[status]
        pct = count / total * 100 if total > 0 else 0
        print(f"  {status:15s}: {count:2d} ({pct:5.1f}%)")

    print(f"\nAverage Confidence Level: {avg_confidence:.1f}%")

    print(f"\nBrand Coverage:")
    for brand in sorted(by_brand.keys()):
        count = by_brand[brand]
        print(f"  {brand}: {count:2d} entries")

    print(f"\nTop Sections by Entry Count:")
    for section, count in sorted(by_section.items(), key=lambda x: -x[1])[:5]:
        pct = count / total * 100 if total > 0 else 0
        print(f"  {section:30s}: {count:2d} ({pct:5.1f}%)")

    # 2. VERIFICATION STATUS
    print("\n" + "-" * 80)
    print("✅ VERIFICATION STATUS")
    print("-" * 80)

    today = datetime.now().date()
    old_entries = []
    very_old_entries = []
    recently_reviewed = []

    for entry in entries:
        last_reviewed_str = entry.get('last_reviewed', '2025-01-01')
        try:
            last_reviewed = datetime.fromisoformat(last_reviewed_str).date()
        except (ValueError, TypeError):
            last_reviewed = datetime.now().date()

        days_since = (today - last_reviewed).days

        if days_since <= 7:
            recently_reviewed.append(entry['qid'])
        elif days_since > 60:
            very_old_entries.append((entry['qid'], entry.get('tier'), days_since))
        elif days_since > 30:
            old_entries.append((entry['qid'], entry.get('tier'), days_since))

    recent_count = len(recently_reviewed)
    old_count = len(old_entries)
    very_old_count = len(very_old_entries)

    print(f"Recently reviewed (≤ 7 days):  {recent_count:2d} ({recent_count/total*100:.1f}%)")
    print(f"Moderately old (8-30 days):    {total - recent_count - old_count - very_old_count:2d}")
    print(f"Needs review (31-60 days):     {old_count:2d} ({old_count/total*100:.1f}%)")
    print(f"Urgent review (> 60 days):     {very_old_count:2d} ({very_old_count/total*100:.1f}%)")

    if very_old_entries:
        print(f"\n⚠️  URGENT: Entries > 60 days without review:")
        for qid, tier, days in sorted(very_old_entries, key=lambda x: -x[2])[:5]:
            print(f"     {qid:6s} [Tier {tier}]: {days:3d} days")

    if old_entries:
        print(f"\n⚠️  Entries needing review (31-60 days):")
        for qid, tier, days in sorted(old_entries, key=lambda x: -x[2])[:5]:
            print(f"     {qid:6s} [Tier {tier}]: {days:3d} days")

    # 3. CONFIDENCE ANALYSIS
    print("\n" + "-" * 80)
    print("🎯 CONFIDENCE ANALYSIS")
    print("-" * 80)

    low_confidence = []
    high_confidence = []

    for entry in entries:
        conf = entry.get('confidence_level', 75)
        if conf < 75:
            low_confidence.append((entry['qid'], entry.get('tier'), conf))
        elif conf >= 90:
            high_confidence.append((entry['qid'], conf))

    print(f"High confidence (≥90%):  {len(high_confidence):2d}")
    print(f"Medium confidence (75-89%): {total - len(low_confidence) - len(high_confidence):2d}")
    print(f"Low confidence (<75%):   {len(low_confidence):2d} ({len(low_confidence)/total*100:.1f}%)")

    if low_confidence:
        print(f"\n⚠️  Entries with low confidence (<75%):")
        for qid, tier, conf in sorted(low_confidence, key=lambda x: x[2]):
            print(f"     {qid:6s} [Tier {tier}]: {conf}%")

    # 4. ENTRY OWNERSHIP
    print("\n" + "-" * 80)
    print("👥 ENTRY OWNERSHIP")
    print("-" * 80)

    by_owner = defaultdict(int)
    for entry in entries:
        owner = entry.get('owner', 'Unassigned')
        by_owner[owner] += 1

    print(f"Total owners: {len(by_owner)}")
    for owner in sorted(by_owner.keys()):
        count = by_owner[owner]
        pct = count / total * 100 if total > 0 else 0
        print(f"  {owner:20s}: {count:2d} ({pct:5.1f}%)")

    # 5. RECOMMENDATIONS
    print("\n" + "-" * 80)
    print("💡 RECOMMENDATIONS & ACTION ITEMS")
    print("-" * 80)

    issues = []

    if by_tier[1] < 8:
        issues.append("⚠️  Only {}/{} Tier 1 entries — aim for 8+".format(by_tier[1], total))

    if avg_confidence < 80:
        issues.append("⚠️  Average confidence {:.0f}% — review low-confidence entries".format(avg_confidence))

    if very_old_count > 0:
        issues.append("⚠️  {} entries unreviewed > 60 days — urgent review needed".format(very_old_count))

    if old_count > total * 0.2:
        issues.append("⚠️  > 20% of entries unreviewed 31-60 days — schedule review")

    if len(low_confidence) > total * 0.15:
        issues.append("⚠️  > 15% entries with low confidence — update answers")

    if not issues:
        issues.append("✅ KB is in good health! Continue monthly maintenance.")

    for issue in issues:
        print("  " + issue)

    # 6. SUMMARY
    print("\n" + "=" * 80)
    print("QUICK STATUS SUMMARY")
    print("=" * 80)

    health_score = (
        (min(by_tier[1], 8) / 8 * 20) +  # Tier 1 coverage (20 points)
        (min(avg_confidence, 95) / 95 * 20) +  # Confidence level (20 points)
        ((total - very_old_count) / total * 20) +  # Recent review (20 points)
        ((total - len(low_confidence)) / total * 20) +  # High confidence (20 points)
        (min(len(by_owner), 5) / 5 * 20)  # Multiple owners (20 points)
    )  # Sum of 5 weighted metrics (0-100)

    print(f"\nOverall KB Health Score: {health_score:.1f}/100")

    if health_score >= 85:
        print("Status: ✅ EXCELLENT - Keep up the maintenance")
    elif health_score >= 70:
        print("Status: 🟡 GOOD - Minor improvements recommended")
    elif health_score >= 50:
        print("Status: 🟠 FAIR - Schedule comprehensive review")
    else:
        print("Status: 🔴 POOR - Urgent KB maintenance needed")

    print("\n" + "=" * 80 + "\n")


if __name__ == '__main__':
    analyze_kb()
