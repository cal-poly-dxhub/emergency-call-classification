import boto3
from botocore.exceptions import NoCredentialsError
from botocore.exceptions import ClientError
import sys
import json
from decimal import Decimal

CLASSIFIER_ENDPOINT =   "arn:aws:comprehend:us-west-2:882364546937:document-classifier-endpoint/spdcareendpoint"
TABLE_NAME = "PredictionsTable"

def classify_incoming_data(text):
    client = boto3.client('comprehend')
    
    response = client.classify_document(
        Text = text,
        EndpointArn=CLASSIFIER_ENDPOINT
    )
            
    return(response)

def upload_to_dynamo(classifier_output):
    """
    Uploads data as an S3 object to a specified bucket.
    
    """
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME)
    
    # Convert all float values to Decimal so boto3 can use values
    classifier_output['current-prediction'] = {
        key: Decimal(str(value)) for key, value in classifier_output['current-prediction'].items()
    }
    
    try:
        response = table.put_item(Item=classifier_output)
        print(f"Results uploaded to: {TABLE_NAME}")
    except ClientError as e:
        print(f"There was an error {e}.")    
    except NoCredentialsError:
        print("Credentials not available.")
    except Exception as e:
        print(f"error: {e}")

    
#TODO: previous and current prediction logic
def process_item(item):
    text_to_classify = item["transcript"]["S"]
    operating_procedures = "" #placeholder
    callID = item["id"]["S"]
    modelResults = classify_incoming_data(text_to_classify)
    outputFile = {}
    finalFile = {}
    print("ttc: ", text_to_classify, "\nID: ", callID, "\nmodelResults: ", modelResults)
    
    finalFile['callId'] = callID
    for classResult in modelResults["Classes"]:
        className = classResult['Name']
        scoreForClass = classResult['Score']
        outputFile[className] = scoreForClass
    if operating_procedures != "":
        outputFile['Instructions'] = operating_procedures
    finalFile["current-prediction"] = outputFile
    print("outputFile: ", outputFile)
    print("Final File: ", finalFile)
    upload_to_dynamo(finalFile)
    
# This funciton allows the caller to retrieve the results of a comprehend custom classifier  as well as sending 
#TODO: if item gets removed from calls, remove from prediciton
def lambda_handler(event, context):
    records = event["Records"]
    print(records)
    for i in range(len(records)):
        if(records[i]["eventName"] != "REMOVE"):
            item = records[i]["dynamodb"]["NewImage"]
            print("NEW ITEM!!\n")
            print(item)
            process_item(item)
        else:
            print("REMOVE", records[i]["dynamodb"]["Keys"]["id"]["S"])
            return