'''
Business: Get parsing history with results
Args: event with httpMethod GET, optional task_id in query params
Returns: HTTP response with tasks and items
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    query_params = event.get('queryStringParameters') or {}
    task_id = query_params.get('task_id')
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if task_id:
        cur.execute(
            "SELECT * FROM parsing_tasks WHERE id = %s",
            (task_id,)
        )
        task = cur.fetchone()
        
        if not task:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Task not found'})
            }
        
        cur.execute(
            "SELECT * FROM parsed_items WHERE task_id = %s ORDER BY id",
            (task_id,)
        )
        items = cur.fetchall()
        
        result = {
            'task': dict(task),
            'items': [dict(item) for item in items]
        }
    else:
        cur.execute(
            "SELECT * FROM parsing_tasks ORDER BY created_at DESC LIMIT 50"
        )
        tasks = cur.fetchall()
        result = {'tasks': [dict(task) for task in tasks]}
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps(result, default=str)
    }
