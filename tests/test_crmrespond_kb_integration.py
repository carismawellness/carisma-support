#!/usr/bin/env python3
"""
KB Integration Test Suite for /crmrespond
Tests the KB query engine with 10 sample customer questions across all brands
"""

import json
import sys
import importlib.util
from pathlib import Path

# Add parent directory to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Load KB query engine directly from file
kb_query_path = project_root / '.agents/skills/crmrespond/kb-query.py'
spec = importlib.util.spec_from_file_location("kb_query", kb_query_path)
kb_query_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kb_query_module)
KBQueryEngine = kb_query_module.KBQueryEngine


def run_integration_tests():
    """Run KB integration tests with sample queries"""

    # Load test cases
    test_file = project_root / 'CRM/knowledge-base/TEST-QUERIES.json'
    with open(test_file) as f:
        test_data = json.load(f)

    print("=" * 80)
    print("KB INTEGRATION TEST SUITE FOR /crmrespond")
    print("=" * 80)
    print(f"Running {len(test_data['test_cases'])} test cases across all brands\n")

    passed = 0
    failed = 0
    partial = 0
    results_summary = []

    for test in test_data['test_cases']:
        test_id = test['test_id']
        question = test['customer_question']
        brand = test['brand']
        expected_qid = test['expected_top_match']
        min_relevance = test['min_relevance']
        description = test['description']

        # Determine KB path based on brand
        if brand == 'ALL':
            kb_path = project_root / 'CRM/knowledge-base/kb-data.json'
            test_brand = None  # Query without brand filter
        elif brand == 'SPA':
            kb_path = project_root / 'CRM/CRM-SPA/knowledge/kb-spa.json'
            test_brand = 'SPA'
        elif brand == 'AES':
            kb_path = project_root / 'CRM/CRM-AES/knowledge/kb-aes.json'
            test_brand = 'AES'
        elif brand == 'SLIM':
            kb_path = project_root / 'CRM/CRM-SLIM/knowledge/kb-slim.json'
            test_brand = 'SLIM'
        else:
            print(f"❌ {test_id}: Unknown brand {brand}")
            failed += 1
            continue

        # Check if KB file exists
        if not kb_path.exists():
            print(f"❌ {test_id}: KB file not found at {kb_path}")
            failed += 1
            continue

        try:
            # Load KB and query
            engine = KBQueryEngine(str(kb_path))
            results = engine.query(question, brand=test_brand, top_k=3)
        except Exception as e:
            print(f"❌ {test_id}: Error loading KB - {str(e)[:60]}")
            failed += 1
            continue

        # Check results
        if not results:
            print(f"❌ {test_id}: No matches returned")
            print(f"   Description: {description}")
            print(f"   Question: {question}\n")
            failed += 1
            results_summary.append({
                'test_id': test_id,
                'status': 'FAIL',
                'reason': 'No matches returned'
            })
            continue

        top_match = results[0]
        relevance = top_match['relevance_score']
        qid = top_match['qid']

        # Evaluate result
        if qid == expected_qid and relevance >= min_relevance:
            print(f"✅ {test_id}: PASS")
            print(f"   Question: {question}")
            print(f"   Found: {qid} ({relevance}%)")
            print(f"   Expected: {expected_qid} (≥{min_relevance}%)\n")
            passed += 1
            results_summary.append({
                'test_id': test_id,
                'status': 'PASS',
                'qid': qid,
                'relevance': relevance,
                'expected': expected_qid
            })
        elif qid == expected_qid and relevance >= min_relevance * 0.8:
            print(f"⚠️  {test_id}: PARTIAL (relevance slightly low)")
            print(f"   Question: {question}")
            print(f"   Found: {qid} ({relevance}%)")
            print(f"   Expected: {expected_qid} (≥{min_relevance}%)\n")
            partial += 1
            results_summary.append({
                'test_id': test_id,
                'status': 'PARTIAL',
                'qid': qid,
                'relevance': relevance,
                'expected': expected_qid
            })
        else:
            print(f"❌ {test_id}: FAIL")
            print(f"   Question: {question}")
            print(f"   Expected: {expected_qid} (≥{min_relevance}%), Got: {qid} ({relevance}%)")
            print(f"   Description: {description}")
            if len(results) > 1:
                print(f"   Alternative matches:")
                for alt in results[1:3]:
                    print(f"      - {alt['qid']}: {alt['relevance_score']}%")
            print()
            failed += 1
            results_summary.append({
                'test_id': test_id,
                'status': 'FAIL',
                'qid': qid,
                'relevance': relevance,
                'expected': expected_qid
            })

    # Summary report
    print("=" * 80)
    print("TEST RESULTS SUMMARY")
    print("=" * 80)
    print(f"✅ PASSED:  {passed}")
    print(f"⚠️  PARTIAL: {partial}")
    print(f"❌ FAILED:  {failed}")
    print(f"📊 TOTAL:   {len(test_data['test_cases'])}")

    success_rate = (passed + partial) / len(test_data['test_cases']) * 100
    print(f"📈 SUCCESS RATE: {success_rate:.1f}%")
    print("=" * 80)

    # Determine overall success (8+ of 10 tests passing/partial)
    acceptable_results = passed + partial
    if acceptable_results >= 8:
        print(f"\n✅ INTEGRATION TEST PASSED ({acceptable_results}/10 acceptable results)")
        return True
    else:
        print(f"\n❌ INTEGRATION TEST FAILED ({acceptable_results}/10 acceptable results, need ≥8)")
        return False


if __name__ == '__main__':
    success = run_integration_tests()
    sys.exit(0 if success else 1)
