import json
import boto3
from boto3.dynamodb.conditions import Key

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    table_name = 'current_calls'
    table = dynamodb.Table(table_name)
    
    
    try:
        calls = table.scan()
        # print(event)
        body_str = event.get('body', '')
        # print(body_str)
        body = json.loads(body_str)
        id = body.get('ID', None)
        # print(id)
        response = table.get_item(Key={'id': 'test'})
        item = response.get('Item', {})
        calls = item.get('calls', [])
        # print(calls)
        updated = [call for call in calls if (call[0] != id)]
        
        response = table.update_item(
            Key={'id': 'test'},
            UpdateExpression='SET #calls = :val',
            ExpressionAttributeValues={
                ':val': updated
            },
            ExpressionAttributeNames={
                '#calls': 'calls'
            },
            ReturnValues="UPDATED_NEW"
    )
        
        
        return {
            'statusCode': 200,
            'body': json.dumps('deleted'),
            'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
            }
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps('An error occurred'),
            'headers': {
                'Content-Type': 'application/json'
            }
        }