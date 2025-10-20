'''
Business: Save parsing results to database
Args: event with httpMethod POST, body with url, selector, items
Returns: HTTP response with task_id
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import execute_values

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    url = body_data.get('url')
    selector = body_data.get('selector')
    items = body_data.get('items', [])
    
    if not url or not selector:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'url and selector are required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO parsing_tasks (url, selector, status, completed_at, total_items) VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s) RETURNING id",
        (url, selector, 'completed', len(items))
    )
    task_id = cur.fetchone()[0]
    
    if items:
        values = [(task_id, item.get('title'), item.get('content'), item.get('link')) for item in items]
        execute_values(
            cur,
            "INSERT INTO parsed_items (task_id, title, content, link) VALUES %s",
            values
        )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'task_id': task_id,
            'items_saved': len(items),
            'message': 'Results saved successfully'
        })
    }
