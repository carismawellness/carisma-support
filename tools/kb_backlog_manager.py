#!/usr/bin/env python3
import json
import sys
from datetime import datetime
from pathlib import Path

class BacklogManager:
    """Manage new Q&A backlog"""

    def __init__(self, backlog_path='CRM/knowledge-base/.backlog.json'):
        self.backlog_path = backlog_path
        with open(backlog_path) as f:
            self.backlog = json.load(f)

    def add_candidate(self, question, brand, source='support'):
        """Add new Q&A candidate to backlog"""

        # Check for similar
        similar = self._find_similar(question)

        if similar:
            print(f"⚠️  Similar question exists: BL-{similar['backlog_id']}")
            similar['frequency'] += 1
            print(f"   Frequency: {similar['frequency']}")
            if similar['frequency'] >= 3:
                similar['status'] = 'READY_TO_PROMOTE'
                print(f"   ✅ READY FOR PROMOTION")
            return similar['backlog_id']

        # Create new
        next_id = len(self.backlog['candidates']) + 1
        candidate = {
            'backlog_id': next_id,
            'brand': brand,
            'question': question,
            'answer_draft': '[To be drafted]',
            'frequency': 1,
            'date_added': datetime.now().isoformat(),
            'status': 'NEW',
            'owner': '[TBD]'
        }

        self.backlog['candidates'].append(candidate)
        self.backlog['metadata']['total_candidates'] = len(self.backlog['candidates'])

        print(f"✅ Added BL-{next_id}: {question[:50]}...")
        return next_id

    def promote_to_kb(self, backlog_id, kb_path='CRM/knowledge-base/kb-data.json'):
        """Promote backlog item to KB"""

        candidate = next(
            (c for c in self.backlog['candidates'] if c['backlog_id'] == backlog_id),
            None
        )

        if not candidate:
            print(f"❌ Not found: BL-{backlog_id}")
            return False

        # Load KB
        with open(kb_path) as f:
            kb = json.load(f)

        # Create entry
        new_qid = f"S{len(kb['entries']) // 5 + 1}.{len(kb['entries']) % 5 + 1}"
        entry = {
            'qid': new_qid,
            'section': '[Section]',
            'tier': 2,
            'brands': [candidate['brand']],
            'question': candidate['question'],
            'answer': candidate['answer_draft'],
            'keywords': [],
            'status': 'ACTIVE',
            'owner': candidate.get('owner', 'TBD'),
            'verified_date': datetime.now().date().isoformat(),
            'last_reviewed': datetime.now().date().isoformat(),
            'confidence_level': 60
        }

        kb['entries'].append(entry)

        with open(kb_path, 'w') as f:
            json.dump(kb, f, indent=2)

        candidate['status'] = 'PROMOTED_TO_KB'
        candidate['promoted_qid'] = new_qid

        print(f"✅ Promoted BL-{backlog_id} → {new_qid}")
        return True

    def show_status(self):
        """Show backlog status"""
        new = len([c for c in self.backlog['candidates'] if c['status'] == 'NEW'])
        ready = len([c for c in self.backlog['candidates'] if c['status'] == 'READY_TO_PROMOTE'])
        promoted = len([c for c in self.backlog['candidates'] if c['status'] == 'PROMOTED_TO_KB'])

        print("\n📊 BACKLOG STATUS")
        print(f"  NEW (tracking): {new}")
        print(f"  READY FOR PROMOTION: {ready} 🚀")
        print(f"  PROMOTED TO KB: {promoted}")
        print(f"  Total: {len(self.backlog['candidates'])}")

        if ready > 0:
            print(f"\n📋 ITEMS READY TO PROMOTE:")
            for c in self.backlog['candidates']:
                if c['status'] == 'READY_TO_PROMOTE':
                    print(f"  BL-{c['backlog_id']}: {c['question'][:60]}...")
                    print(f"     Frequency: {c['frequency']}, Brand: {c['brand']}")

    def _find_similar(self, question):
        """Find similar question in backlog"""
        q_words = set(question.lower().split())

        for c in self.backlog['candidates']:
            if c['status'] == 'PROMOTED_TO_KB':
                continue

            c_words = set(c['question'].lower().split())
            overlap = len(q_words & c_words) / max(len(q_words), 1)

            if overlap > 0.5:
                return c

        return None

    def save(self):
        """Save backlog to file"""
        with open(self.backlog_path, 'w') as f:
            json.dump(self.backlog, f, indent=2)

if __name__ == '__main__':
    mgr = BacklogManager()

    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == 'add' and len(sys.argv) > 3:
            mgr.add_candidate(sys.argv[2], sys.argv[3])
        elif cmd == 'status':
            mgr.show_status()
        elif cmd == 'promote' and len(sys.argv) > 2:
            bid = int(sys.argv[2].replace('BL-', ''))
            mgr.promote_to_kb(bid)

    mgr.save()
