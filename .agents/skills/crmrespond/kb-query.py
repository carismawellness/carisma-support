#!/usr/bin/env python3
import json
import re
from typing import List, Dict, Tuple
from pathlib import Path

class KBQueryEngine:
    """Query knowledge base by keywords and return relevant entries"""

    def __init__(self, kb_path: str):
        """Load KB from JSON file"""
        with open(kb_path) as f:
            self.kb = json.load(f)
        self.entries = self.kb.get('entries', [])
        print(f"✅ Loaded KB: {len(self.entries)} entries")

    def query(self, question: str, brand: str = None, top_k: int = 3) -> List[Dict]:
        """
        Query KB for relevant entries

        Args:
            question: Customer question text
            brand: Optional brand filter (SPA/AES/SLIM)
            top_k: Return top K matches

        Returns:
            List of matching entries with relevance scores
        """
        # Extract keywords from question
        q_keywords = self._extract_keywords(question)

        # Score all entries
        scores = []
        for entry in self.entries:
            # Brand filtering if specified
            if brand:
                entry_brands = entry.get('brands', [])
                if brand not in entry_brands and 'ALL' not in entry_brands:
                    continue

            # Score this entry
            score = self._score_entry(entry, q_keywords, question)
            if score > 0:
                scores.append((entry, score))

        # Sort by score, return top K
        scores.sort(key=lambda x: x[1], reverse=True)
        results = [
            {
                'qid': e['qid'],
                'question': e['question'],
                'answer': e['answer'],
                'relevance_score': int(s * 100),  # Convert to 0-100
                'keywords_matched': list(set(e['keywords']) & set(q_keywords)),
                'tier': e.get('tier', 1),
                'confidence': e.get('confidence_level', 75)
            }
            for e, s in scores[:top_k]
        ]

        return results

    def _extract_keywords(self, text: str) -> set:
        """Extract searchable keywords from question"""
        # Remove punctuation, lowercase
        text = re.sub(r'[^\w\s]', '', text).lower()
        words = text.split()

        # Keep words > 3 chars or important short words
        important = {'how', 'what', 'when', 'where', 'why', 'is', 'can', 'do', 'will', 'if', 'my'}
        keywords = {
            w for w in words
            if len(w) > 3 or w in important
        }

        return keywords

    def _score_entry(self, entry: Dict, q_keywords: set, question: str) -> float:
        """Score how relevant this entry is"""
        score = 0.0

        # 1. Keyword matching (40% weight)
        entry_keywords = set(entry.get('keywords', []))
        if len(q_keywords) > 0:
            keyword_overlap = len(q_keywords & entry_keywords)
            keyword_score = keyword_overlap / max(len(q_keywords), 1) * 0.40
            score += keyword_score

        # 2. Question text similarity (40% weight)
        question_lower = question.lower()
        entry_q_lower = entry['question'].lower()
        q_words = set(question_lower.split())
        entry_q_words = set(entry_q_lower.split())
        word_overlap = len(q_words & entry_q_words)
        q_similarity = word_overlap / max(len(q_words), 1) * 0.40
        score += q_similarity

        # 3. Tier priority (20% weight) - Tier 1 prioritized
        tier = entry.get('tier', 1)
        tier_score = (5 - tier) / 4 * 0.20
        score += tier_score

        # 4. Apply confidence as multiplier
        confidence = entry.get('confidence_level', 75) / 100
        score *= confidence

        return score

# Test the engine
if __name__ == '__main__':
    # Load SPA KB as example
    engine = KBQueryEngine('/Users/mertgulen/Library/CloudStorage/GoogleDrive-mertgulen98@gmail.com/My Drive/Carisma Wellness Group/Carisma AI /Carisma AI/CRM/CRM-SPA/knowledge/kb-spa.json')

    # Test queries
    test_queries = [
        "How do I book an appointment?",
        "What's the cancellation policy?",
        "How much does it cost?",
        "What payment methods do you accept?"
    ]

    for query in test_queries:
        print(f"\n📝 Query: {query}")
        results = engine.query(query, top_k=2)
        for r in results:
            print(f"  [{r['relevance_score']}%] {r['qid']}: {r['question']}")
