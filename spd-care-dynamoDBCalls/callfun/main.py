import json
import boto3
from boto3.dynamodb.conditions import Key

# Initialize a DynamoDB client
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    # Specify the table name
    table_name = 'current_calls'
    table = dynamodb.Table(table_name)
    
    try:
        # Fetch all items from the table (scan operation)
        response = table.scan()
        
        # Prepare the items to return
        items = response['Items']
        return {
            'statusCode': 200,
            'body': json.dumps(items),
            'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
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
