#!/usr/bin/env python3
"""
Knowledge Base Keyword Tagger
Assists with consistent keyword tagging for KB entries using pattern matching and brand-specific rules.

Usage:
    python tools/kb_keyword_tagger.py \
        --question "How do I book?" \
        --answer "You can book through..." \
        --brand "SPA"
"""

import json
import argparse
from typing import Set, List
from collections import Counter


class KeywordTagger:
    """AI-assisted keyword suggestion for KB entries."""

    # Brand-specific keyword pools
    BRAND_KEYWORDS = {
        "SPA": [
            "aromatherapy", "aromatic", "body-mind-soul", "deep-restoration",
            "escape", "full-body", "hammam", "holistic", "massage", "peaceful",
            "peace", "rejuvenation", "relaxation", "sanctuary", "spa-treatment",
            "stillness", "therapeutic", "traditional", "tranquility", "turkish-spa",
            "warm-stone", "wellness", "wellness-journey"
        ],
        "AES": [
            "aesthetic", "anti-aging", "appearance", "benefits", "body-contouring",
            "clinical", "enhancement", "glow", "improvement", "non-invasive",
            "radiance", "rejuvenation", "results", "skin", "skin-rejuvenation",
            "skin-texture", "treatment", "transformation", "visible-change", "youthful"
        ],
        "SLIM": [
            "accountability", "community", "guidance", "healthy", "holistic-approach",
            "journey", "lifestyle", "nutrition", "progress", "program",
            "relapse-normalized", "sessions", "slimming", "specialist", "support",
            "sustainable", "sustainable-change", "transformation", "weight-loss",
            "wellness", "wellness-journey"
        ]
    }

    # Common synonyms and variations
    SYNONYMS = {
        "appointment": ["appointement", "booking", "reservation", "reserve", "slot", "time-slot"],
        "book": ["booking", "reserve", "schedule", "appointment"],
        "cancel": ["cancelation", "cancellation", "cancellation-fee", "cancellation-policy", "refund"],
        "cost": ["charge", "fee", "investment", "price", "pricing", "rate"],
        "duration": ["how-long", "length", "session-length", "time"],
        "gift": ["gift-card", "gift-certificate", "gift-idea", "present", "voucher"],
        "massage": ["body-work", "rub", "spa-treatment", "therapy", "treatment"],
        "miss": ["absence", "no-show", "no-show-fee", "no-show-policy"],
        "pay": ["accept", "card", "cash", "credit", "debit", "payment", "payment-method"],
        "price": ["charge", "cost", "fee", "investment", "rate"],
        "reschedule": ["change", "change-time", "modify", "postpone", "rescheduling"],
        "results": ["benefits", "improvement", "improvements", "outcome", "transformation", "visible-change"],
    }

    # Action intent keywords
    ACTION_KEYWORDS = {
        "how-to": ["how", "how-to", "guide", "method", "process", "procedure", "steps"],
        "first-time": ["beginner", "first-time", "first-visit", "new", "new-customer", "new-to"],
        "cost": ["budget", "charge", "cost", "fee", "investment", "price", "pricing", "rate"],
        "duration": ["duration", "how-long", "length", "session-length", "time"],
        "results": ["benefits", "expectations", "improvements", "outcome", "results", "transformation"],
        "eligibility": ["age-requirement", "contraindications", "medical-condition", "pregnancy", "unsuitable", "who-cannot"],
        "cancellation": ["cancellation", "cancel", "change", "modify", "postpone", "reschedule"],
        "comparison": ["alternative", "best-option", "compare", "difference", "versus", "vs", "which-one"],
    }

    # Misspellings
    MISSPELLINGS = {
        "appointement": "appointment",
        "appointmnt": "appointment",
        "apontment": "appointment",
        "cancelation": "cancellation",
        "reshedule": "reschedule",
        "rescedule": "reschedule",
        "aestetik": "aesthetic",
        "investement": "investment",
    }

    def __init__(self):
        """Initialize the keyword tagger."""
        pass

    def extract_keywords_from_text(self, text: str) -> Set[str]:
        """Extract potential keywords from text."""
        keywords = set()
        text_lower = text.lower()

        # Extract single-word keywords
        words = text_lower.replace(".", "").replace(",", "").replace("?", "").split()
        for word in words:
            if len(word) > 3 and word not in ["that", "this", "with", "your", "from", "will", "have", "only", "just", "also", "more"]:
                keywords.add(word)

        return keywords

    def match_patterns(self, question: str, answer: str, brand: str = None) -> Set[str]:
        """Match common patterns to suggest keywords."""
        keywords = set()
        q_lower = question.lower()
        a_lower = answer.lower()
        combined = f"{question} {answer}".lower()

        # Booking patterns
        if any(w in q_lower for w in ["book", "reserve", "schedule", "appoint"]):
            keywords.update(["appointment", "booking", "first-time", "how-to", "reserve", "schedule"])
            if "online" in combined:
                keywords.add("online-booking")
            if "phone" in combined or "call" in combined:
                keywords.add("phone-booking")
            if "24" in combined:
                keywords.add("24-7")

        # Price/cost patterns
        if any(w in q_lower for w in ["price", "cost", "fee", "rate", "invest"]):
            keywords.update(["cost", "fee", "investment", "pricing", "rate"])
            if "€" in combined or "euro" in combined:
                # Extract prices
                import re
                prices = re.findall(r'€\d+', combined)
                keywords.update(prices)
            if "package" in combined:
                keywords.add("package")

        # Cancellation patterns
        if any(w in q_lower for w in ["cancel", "refund", "policy"]):
            keywords.update(["cancel", "cancellation", "cancellation-policy", "fee", "policy"])
            if "24" in combined:
                keywords.add("24-hour")
            if "free" in combined:
                keywords.add("free")

        # Reschedule patterns
        if any(w in q_lower for w in ["reschedule", "reschedule", "change time"]):
            keywords.update(["appointment", "change-time", "flexible", "how-to", "reschedule", "rescheduling"])
            if "24" in combined:
                keywords.add("24-hour")
            if "free" in combined:
                keywords.add("free")

        # Duration/time patterns
        if any(w in q_lower for w in ["long", "duration", "time", "how long"]):
            keywords.update(["duration", "how-long", "time", "treatment"])
            if "minute" in combined:
                import re
                durations = re.findall(r'\d+-\d+', combined)
                keywords.update([f"{d}-minute" for d in durations])
            if "massage" in combined:
                keywords.add("massage")
            if "facial" in combined:
                keywords.add("facial")

        # Results patterns
        if any(w in q_lower for w in ["result", "expect", "see", "notice", "improve"]):
            keywords.update(["benefits", "results", "timeline", "transformation", "what-to-expect"])
            if "week" in combined:
                keywords.add("timeline")
            if "visible" in combined or "see" in combined:
                keywords.add("visible-change")

        # Payment patterns
        if any(w in q_lower for w in ["payment", "pay", "accept", "card"]):
            keywords.update(["accept", "card", "payment", "payment-method"])
            if "credit" in combined:
                keywords.add("credit")
            if "debit" in combined:
                keywords.add("debit")
            if "cash" in combined:
                keywords.add("cash")
            if "bank" in combined:
                keywords.add("bank-transfer")
            if "visa" in combined.lower():
                keywords.add("visa")
            if "mastercard" in combined.lower() or "master" in combined.lower():
                keywords.add("mastercard")

        # Gift patterns
        if any(w in q_lower for w in ["gift", "voucher", "certificate"]):
            keywords.update(["gift", "gift-card", "gift-certificate", "voucher"])
            if "€" in combined:
                import re
                prices = re.findall(r'€\d+', combined)
                keywords.update(prices)

        # No-show patterns
        if any(w in q_lower for w in ["miss", "no-show", "absence"]):
            keywords.update(["absence", "appointment", "fee", "miss", "no-show", "no-show-policy", "policy"])
            if "emergency" in combined:
                keywords.add("emergency")
            if "grace" in combined or "15" in combined:
                keywords.add("grace-period")

        # Add brand-specific keywords
        if brand and brand in self.BRAND_KEYWORDS:
            brand_kw = self.BRAND_KEYWORDS[brand]
            matched_brand = [kw for kw in brand_kw if kw in combined]
            keywords.update(matched_brand[:3])  # Add up to 3 brand keywords

        return keywords

    def add_synonyms(self, keywords: Set[str]) -> Set[str]:
        """Expand keywords with synonyms."""
        expanded = set(keywords)

        for kw in keywords:
            # Check if keyword has defined synonyms
            if kw in self.SYNONYMS:
                expanded.update(self.SYNONYMS[kw])

            # Check if keyword is a synonym of something
            for base_kw, synonyms in self.SYNONYMS.items():
                if kw in synonyms:
                    expanded.add(base_kw)

            # Add misspelling if applicable
            if kw in self.MISSPELLINGS:
                expanded.add(self.MISSPELLINGS[kw])

        return expanded

    def ensure_minimum_keywords(self, keywords: Set[str], min_count: int = 5) -> Set[str]:
        """Ensure minimum keyword count by adding generics if needed."""
        if len(keywords) >= min_count:
            return keywords

        # Generic fallback keywords
        generics = [
            "customer-service", "help", "information", "inquiry", "question",
            "support", "carisma", "wellness", "health", "wellbeing"
        ]

        while len(keywords) < min_count and generics:
            generic = generics.pop(0)
            if generic not in keywords:
                keywords.add(generic)

        return keywords

    def suggest_keywords(self, question: str, answer: str, brand: str = None,
                        min_keywords: int = 5, max_keywords: int = 15) -> List[str]:
        """
        Suggest keywords for a KB entry.

        Args:
            question: The question text
            answer: The answer text
            brand: Optional brand (SPA, AES, SLIM, or ALL)
            min_keywords: Minimum keywords (default 5)
            max_keywords: Maximum keywords (default 15)

        Returns:
            List of suggested keywords, sorted alphabetically
        """
        keywords = set()

        # 1. Extract from patterns
        pattern_keywords = self.match_patterns(question, answer, brand)
        keywords.update(pattern_keywords)

        # 2. Extract from text
        text_keywords = self.extract_keywords_from_text(f"{question} {answer}")
        keywords.update(text_keywords)

        # 3. Expand with synonyms
        keywords = self.add_synonyms(keywords)

        # 4. Ensure minimum
        keywords = self.ensure_minimum_keywords(keywords, min_keywords)

        # 5. Trim to maximum if needed
        if len(keywords) > max_keywords:
            # Keep most relevant (pattern-matched first, then others)
            pattern_first = sorted(
                keywords,
                key=lambda x: (x not in pattern_keywords, x)
            )
            keywords = set(pattern_first[:max_keywords])

        # 6. Sort alphabetically
        return sorted(list(keywords))

    def validate_keywords(self, keywords: List[str]) -> dict:
        """
        Validate keyword set against best practices.

        Returns:
            Dictionary with validation results and suggestions.
        """
        issues = []
        suggestions = []

        # Check count
        if len(keywords) < 5:
            issues.append(f"Only {len(keywords)} keywords. Minimum is 5.")
        if len(keywords) > 15:
            issues.append(f"{len(keywords)} keywords. Trimming to 15 is recommended.")

        # Check format
        for kw in keywords:
            if kw != kw.lower():
                issues.append(f"'{kw}' is not lowercase.")
            if " " in kw:
                issues.append(f"'{kw}' contains spaces. Use hyphens instead.")
            if any(c in kw for c in [".", ",", "!", "?", ";", ":"]):
                issues.append(f"'{kw}' contains punctuation.")

        # Check for specificity mix
        has_broad = any(len(kw.split("-")) == 1 for kw in keywords)
        has_multi = any(len(kw.split("-")) > 1 for kw in keywords)

        if not has_broad:
            suggestions.append("Consider adding broader keywords like 'booking', 'treatment', 'appointment'")
        if not has_multi:
            suggestions.append("Consider adding multi-word keywords like 'online-booking', 'no-show-fee'")

        return {
            "valid": len(issues) == 0,
            "count": len(keywords),
            "issues": issues,
            "suggestions": suggestions
        }


def main():
    """CLI interface."""
    parser = argparse.ArgumentParser(
        description="Suggest keywords for KB entries"
    )
    parser.add_argument("--question", required=True, help="The Q&A question text")
    parser.add_argument("--answer", required=True, help="The Q&A answer text")
    parser.add_argument("--brand", default=None, help="Brand: SPA, AES, SLIM, or ALL")
    parser.add_argument("--min", type=int, default=5, help="Minimum keywords (default 5)")
    parser.add_argument("--max", type=int, default=15, help="Maximum keywords (default 15)")
    parser.add_argument("--validate", action="store_true", help="Validate provided keywords")
    parser.add_argument("--keywords", nargs="*", help="Keywords to validate (with --validate)")

    args = parser.parse_args()

    tagger = KeywordTagger()

    if args.validate and args.keywords:
        # Validate provided keywords
        result = tagger.validate_keywords(args.keywords)
        print(json.dumps(result, indent=2))
    else:
        # Suggest keywords
        suggested = tagger.suggest_keywords(
            args.question,
            args.answer,
            args.brand,
            args.min,
            args.max
        )

        print(json.dumps({
            "question": args.question,
            "brand": args.brand or "ALL",
            "keywords": suggested,
            "count": len(suggested),
            "validation": tagger.validate_keywords(suggested)
        }, indent=2))


if __name__ == "__main__":
    main()
