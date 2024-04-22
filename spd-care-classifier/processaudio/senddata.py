import boto3
import json
import numpy as np
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB resource and table for connection ID mappings
dynamodb = boto3.resource('dynamodb')
connection_id_table = dynamodb.Table('ConnectionIdMappingTable')

# Initialize API Gateway Management API client to send messages to WebSocket clients
apigw_management_client = boto3.client(
    'apigatewaymanagementapi',
    endpoint_url="https://cv372khba8.execute-api.us-west-2.amazonaws.com/production"
)

# Constants defining the thresholds and categories for prediction data stability
STABILITY_THRESHOLD = 0.05  # Threshold for the standard deviation to consider prediction data as stable
PREDICTION_CATEGORIES = 4  # Expected number of categories in prediction data

# set to 2 for now can change (ex: 5)
MIN_DATA_POINTS = 2  # Minimum number of prediction data points required to perform stability check

def lambda_handler(event, context):
    """ Main Lambda handler processing incoming DynamoDB stream events """ 
    for record in event['Records']:
        # Process only insertion and modification events
        if record['eventName'] in ('INSERT', 'MODIFY'):
            new_image = record['dynamodb']['NewImage']
            session_id = new_image['callId']['S'] # Session ID for the prediction data

            # Extract prediction data from 'previous-prediction'
            prediction_data = extract_prediction_data(new_image.get('previous-prediction', {}).get('L', []))
            if prediction_data:
                print(prediction_data[-1])
                print(len(prediction_data))
                
            # Check if there are enough data points to consider stability
            if len(prediction_data) >= MIN_DATA_POINTS:
                is_stable, dominant_values = check_stability(prediction_data)
                data_to_send = {
                    'isStable': is_stable,
                    'predictions': dominant_values if is_stable else prediction_data[-1]
                }
            else:
                # Not enough data points, assume instability and send the latest predictions
                is_stable = False
                data_to_send = {
                    'isStable': is_stable,
                    'predictions': prediction_data[-1] if prediction_data else [0.0] * PREDICTION_CATEGORIES
                }

            # Retrieve the latest connection ID for the WebSocket client
            connection_id = get_most_recent_connection_id()
            if connection_id:
                send_to_websocket_client(connection_id, data_to_send)

    return {'statusCode': 200}

def extract_prediction_data(prediction_list):
    """ Convert DynamoDB-stored prediction data into a list of numeric values for analysis """ 
    return [
        [float(category['N']) for category in prediction['L']]
        for prediction in prediction_list
    ]

def check_stability(predictions):
    """ Determine the stability of prediction data based on the standard deviation across data points """ 
    data_by_category = list(zip(*predictions))
    categories_std = [np.std(category) for category in data_by_category]
    # print(categories_std)
    is_stable = all(std < STABILITY_THRESHOLD for std in categories_std)
    
    # If data is stable, identify the dominant prediction category
    if is_stable:
        dominant_index = np.argmax(predictions[-1])
        dominant_value = predictions[-1][dominant_index]
        stable_values = [0.0] * PREDICTION_CATEGORIES
        stable_values[dominant_index] = dominant_value
        return True, stable_values
    else:
        return False, None

def send_to_websocket_client(connection_id, data):
    """ Send processed data to the WebSocket client using the provided connection ID """ 
    print(f"Sending data to connection ID {connection_id}: {data}")
    try:
        apigw_management_client.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(data)
        )
    except apigw_management_client.exceptions.GoneException:
        # Handle exceptions where the WebSocket connection no longer exists
        print(f"Connection with id {connection_id} is no longer available.")

def get_most_recent_connection_id():
    """ Fetch the most recent connection ID from DynamoDB for sending messages to the WebSocket client """ 
    response = connection_id_table.scan(
        ProjectionExpression='#ts, connectionID',
        ExpressionAttributeNames={'#ts': 'timestamp'}
    )
    items = response.get('Items', [])
    if items:
        # If items are found, return the connection ID of the most recent item
        most_recent_item = max(items, key=lambda x: x['timestamp'])
        return most_recent_item['connectionID']
    else:
        # Return None if no items found, indicating no available WebSocket connections
        return None
