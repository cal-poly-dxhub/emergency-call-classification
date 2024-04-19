import boto3
from botocore.exceptions import NoCredentialsError
from botocore.exceptions import ClientError
import sys
import json
from decimal import Decimal

CLASSIFIER_ENDPOINT =   "arn:aws:comprehend:us-west-2:882364546937:document-classifier-endpoint/spdcareendpoint"
TABLE_NAME = "PredictionsTable"

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

def classify_incoming_data(text):
    client = boto3.client('comprehend')
    
    response = client.classify_document(
        Text = text,
        EndpointArn=CLASSIFIER_ENDPOINT
    )
    
    print("RESPONSE: ", response)
    return(response)
    
def class_exists(class_name, predictions):
    for cls in predictions["Classes"]:
        if cls["Name"] == class_name:
            return True
    return False
    
def recieve_previous(callID):
    try:
        response = table.get_item(
            Key={
            'callId': callID
            },
            ProjectionExpression='#pred, #prev_pred',
            ExpressionAttributeNames={"#pred" : "current-prediction",
                                      "#prev_pred" : "previous-prediction"
           }
        )
        # print("RECIEVED PREVIOUS!!")
        # print(response)
        if 'Item' not in response:
            return []
        else:
            # print(response['Item'])
            previous_preds = response['Item']['previous-prediction']
            prev = response['Item']['current-prediction']
            previous_preds.append(prev)
            
            return previous_preds
    except Exception as e:
        print(f"PREVIOUS_PREDICTION ERROR!: {e}")
        return None
    
    

def upload_to_dynamo(classifier_output):
    """
    Uploads prediction data to dynamo table
    
    """
    
    try:
        response = table.put_item(Item=classifier_output)
        print(f"Results uploaded to: {TABLE_NAME}")
    except ClientError as e:
        print(f"There was an error {e}.")
    except NoCredentialsError:
        print("Credentials not available.")
    except Exception as e:
        print(f"error: {e}")

def remove_prediction(callID):
    print(callID)
    
    try:
        response = table.delete_item(
        Key={'callId': callID}
        )
        
        print("remove success") 
    except Exception as e:
        print(f"REMOVE ERROR: {e}")
        return None
        
def get_score(className, modelResults):
    for cls in modelResults["Classes"]:
        if cls["Name"] == className:
            return cls["Score"]

def process_item(item):
    text_to_classify = item["transcript"]["S"]
    operating_procedures = "" #placeholder
    callID = item["id"]["S"]
    modelResults = classify_incoming_data(text_to_classify)
    prediction_list = [0,0,0,0]
    classes = ["POLICE", "ALTERNATE", "CORESPONDER", "NOISSUE"]
    finalFile = {}
    finalFile["callId"] = callID
    # print("ttc: ", text_to_classify, "\nID: ", callID, "\nmodelResults: ", modelResults)
    
    for i, cls in enumerate(classes):
        if class_exists(cls, modelResults):
            prediction_list[i] = get_score(cls, modelResults)
            
    #aws requires decimal types, not floats
    for i in range(len(prediction_list)):
        prediction_list[i] = Decimal(str(prediction_list[i]))
    
  
    
        
    if operating_procedures != "":
        finalFile['Instructions'] = operating_procedures
        
    finalFile["current-prediction"] = prediction_list
    finalFile["previous-prediction"] = recieve_previous(finalFile['callId'])
    # print("outputFile: ", outputFile)
    # print("Final File: ", finalFile)
    upload_to_dynamo(finalFile)
    
# This funciton allows the caller to retrieve the results of a comprehend custom classifier  as well as sending 
#TODO: https://repost.aws/knowledge-center/lambda-function-idempotent
def lambda_handler(event, context):
    records = event["Records"]
    print(records)
    #this is all commented out so the error queue doesnt fill up when we aren't working
    #create a comprehend endpoint and uncomment code to get functionality
    # try:
    #     for i in range(len(records)):                    
    #         if(records[i]["eventName"] == "REMOVE"):
    #             remove_prediction(records[i]["dynamodb"]["Keys"]["id"]["S"])
    #             continue
    #         if(records[i]["dynamodb"]["NewImage"]["active"]['BOOL'] == False):
    #             continue
    #         if(records[i]["eventName"] != "REMOVE"):
    #             item = records[i]["dynamodb"]["NewImage"]
    #             process_item(item)
    # except Exception as e:
    #     print("ERROR:",e)