"""
Carisma Intelligence — Email Composer
Collects pending alerts and sends a formatted daily brief via Gmail MCP.
"""
import os
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SEVERITY_EMOJI = {
    'critical': '\U0001f534',
    'warning': '\U0001f7e1',
    'info': '\U0001f535',
}

def get_client():
    return create_client(
        os.environ['NEXT_PUBLIC_SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    )

def compose_daily_brief() -> dict | None:
    client = get_client()
    result = client.table('ci_alerts').select('*').eq('status', 'pending').order('severity').execute()
    alerts = result.data
    if not alerts:
        return None
    critical = sum(1 for a in alerts if a['severity'] == 'critical')
    warning = sum(1 for a in alerts if a['severity'] == 'warning')
    info = sum(1 for a in alerts if a['severity'] == 'info')
    today = datetime.now(timezone.utc).strftime('%d %B %Y')
    subject = f"CI Daily Brief — {len(alerts)} alert{'s' if len(alerts) != 1 else ''}"
    if critical > 0:
        subject += f" ({critical} critical)"
    body_lines = [
        f"# Carisma Intelligence Daily Brief",
        f"**Date:** {today}",
        f"**Alerts:** {critical} critical, {warning} warning, {info} info",
        "", "---", "",
    ]
    for alert in alerts:
        emoji = SEVERITY_EMOJI.get(alert['severity'], '')
        body_lines.extend([
            f"### {emoji} [{alert['severity'].upper()}] {alert['title']}",
            f"**Department:** {alert['department']}", "",
            f"{alert['description']}", "",
            f"**Recommendation:** {alert['recommendation']}", "",
            f"**Action:** Reply with `approve {alert['id']}` or `dismiss {alert['id']}`",
            "", "---", "",
        ])
    body = '\n'.join(body_lines)
    alert_ids = [a['id'] for a in alerts]
    for aid in alert_ids:
        client.table('ci_alerts').update({'status': 'emailed'}).eq('id', aid).execute()
    return {
        'to': os.environ.get('CI_EMAIL_TO', 'mert@carismawellness.com'),
        'subject': subject,
        'body': body,
    }

def compose_weekly_summary() -> dict | None:
    return None

def compose_monthly_executive() -> dict | None:
    return None
