"""
Carisma Intelligence — Action Executor
Dispatches approved alert actions to the appropriate MCP server.
"""
import os
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def get_client():
    return create_client(
        os.environ['NEXT_PUBLIC_SUPABASE_URL'],
        os.environ['SUPABASE_SERVICE_ROLE_KEY'],
    )

def get_approved_actions() -> list[dict]:
    client = get_client()
    result = client.table('ci_alerts').select('*').eq('status', 'approved').execute()
    return result.data or []

def execute_action(alert: dict) -> dict:
    payload = alert.get('action_payload', {})
    action_type = payload.get('type', 'alert_only')
    result = {'alert_id': alert['id'], 'action_type': action_type, 'status': 'pending_execution'}
    if action_type == 'pause_meta_ad':
        result['mcp_server'] = 'meta-ads'
        result['mcp_action'] = 'update_adset'
        result['mcp_params'] = {'adset_id': payload.get('data', {}).get('adset_id'), 'status': 'PAUSED'}
    elif action_type == 'send_email':
        result['mcp_server'] = 'google-workspace'
        result['mcp_action'] = 'gmail_send_email'
        result['mcp_params'] = {'to': payload.get('data', {}).get('recipient'), 'subject': f"CI Alert: {alert['title']}", 'body': alert['recommendation']}
    elif action_type == 'create_trello_card':
        result['mcp_server'] = 'trello'
        result['mcp_action'] = 'create_card'
        result['mcp_params'] = {'name': alert['title'], 'desc': alert['recommendation'], 'idList': payload.get('data', {}).get('list_id')}
    elif action_type == 'send_whatsapp':
        result['mcp_server'] = 'whatsapp'
        result['mcp_action'] = 'send_message'
        result['mcp_params'] = {'chatId': payload.get('data', {}).get('chat_id'), 'message': f"CI Alert: {alert['title']}\n{alert['recommendation']}"}
    elif action_type == 'alert_only':
        result['status'] = 'no_action_needed'
    return result

def mark_executed(alert_id: int):
    client = get_client()
    client.table('ci_alerts').update({'status': 'executed', 'executed_at': datetime.now(timezone.utc).isoformat()}).eq('id', alert_id).execute()

def process_all_approved() -> list[dict]:
    alerts = get_approved_actions()
    results = []
    for alert in alerts:
        result = execute_action(alert)
        results.append(result)
    return results
