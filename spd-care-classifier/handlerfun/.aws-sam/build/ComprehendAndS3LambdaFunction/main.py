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
    # Initialize a dynamo client with Boto3
    dynamodb = boto3.resource('dynamodb')
    
    # Reference the table
    table = dynamodb.Table(TABLE_NAME)
    
    # Convert all float values in 'current-prediction' to Decimal
    classifier_output['current-prediction'] = {
        key: Decimal(str(value)) for key, value in classifier_output['current-prediction'].items()
    }
    
    try:
        response = table.put_item(Item=classifier_output)
       
    except ClientError as e:
        print(f"There was an error {e}.")    
    except NoCredentialsError:
        print("Credentials not available.")
    except Exception as e:
        print(f"error: {e}")
    #print(response)
    
    
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
# Para
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
        # if(event["Records"][0]["eventName"] != "REMOVE"):
        #     print(event["Records"][0]["dynamodb"]["NewImage"])
        # else:
        #     print("REMOVE")
    # print(event["Records"][0]["dynamodb"]["NewImage"])
    # text_to_classify = event['text_to_classify']
    # operating_procedures = event['operating_procedures']
    # callID = event['callID']
    # outputFile = {}
    
    # modelResults = classify_incoming_data(text_to_classify)
    
    # #output will look like
    # """
    # {'Classes': [{'Name': 'CORESPONDER', 'Score': 0.4519239664077759}, {'Name': 'POLICE', 'Score': 0.41706737875938416}, {'Name': 'NOISSUE', 'Score': 0.11160225421190262}], 
    #     'ResponseMetadata': {'RequestId': '62b1fef8-2919-447b-a0dc-05411c25846f', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amzn-requestid': '62b1fef8-2919-447b-a0dc-05411c25846f', 
    #         'content-type': 'application/x-amz-json-1.1', 'content-length': '156', 'date': 'Fri, 23 Feb 2024 07:06:39 GMT'}, 'RetryAttempts': 0}}
    # """
    # parse custom classifier output into a formatted response
    # for classResult in modelResults["Classes"]:
    #     className = classResult['Name']
    #     scoreForClass = classResult['Score']
    #     outputFile[className] = scoreForClass
    # if operating_procedures != None:
    #     outputFile['Instructions'] = operating_procedures
    # outputFile['resultId'] = callID
        
        
    # upload_to_s3(json.dumps((outputFile)))
    # print(f"Results uploaded to http://dxhub-demo-spdcare-public.s3-website-us-west-2.amazonaws.com/classifiedResults.json")


