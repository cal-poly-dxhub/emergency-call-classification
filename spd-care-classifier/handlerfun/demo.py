import boto3
from botocore.exceptions import NoCredentialsError
from botocore.exceptions import ClientError
import sys
import json

CLASSIFIER_ENDPOINT =   "arn:aws:comprehend:us-west-2:882364546937:document-classifier-endpoint/spdcareendpoint"
BUCKET_NAME         =   "dxhub-demo-spdcare-public"

def classify_incoming_data(text):
    client = boto3.client('comprehend')
    
    response = client.classify_document(
        Text = text,
        EndpointArn=CLASSIFIER_ENDPOINT
    )
            
    return(response)

def upload_to_s3(classifier_output):
    """
    Uploads data as an S3 object to a specified bucket.
    
    """
    # Initialize an S3 client with Boto3
    s3_client = boto3.client('s3')
    
    # Upload the string to S3

    try:
        response = s3_client.put_object(Body=classifier_output, Bucket=BUCKET_NAME, Key="classifiedResults.json")
       
    except ClientError as e:
        print(f"There was an error {e}.")    
    except NoCredentialsError:
        print("Credentials not available.")
    #print(response)
    
# This funciton allows the caller to retrieve the results of a comprehend custom classifier  as well as sending 
# Para
def main(text_to_classify, operating_procedures):
    outputFile = {}
    
    modelResults = classify_incoming_data(text_to_classify)
    
    #output will look like
    """
    {'Classes': [{'Name': 'CORESPONDER', 'Score': 0.4519239664077759}, {'Name': 'POLICE', 'Score': 0.41706737875938416}, {'Name': 'NOISSUE', 'Score': 0.11160225421190262}], 
        'ResponseMetadata': {'RequestId': '62b1fef8-2919-447b-a0dc-05411c25846f', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amzn-requestid': '62b1fef8-2919-447b-a0dc-05411c25846f', 
            'content-type': 'application/x-amz-json-1.1', 'content-length': '156', 'date': 'Fri, 23 Feb 2024 07:06:39 GMT'}, 'RetryAttempts': 0}}
    """
    # parse custom classifier output into a formatted response
    for classResult in modelResults["Classes"]:
        className = classResult['Name']
        scoreForClass = classResult['Score']
        outputFile[className] = scoreForClass
    if operating_procedures != None:
        outputFile['Instructions'] = operating_procedures
        
        
    upload_to_s3(json.dumps((outputFile)))
    print(f"Results uploaded to http://dxhub-demo-spdcare-public.s3-website-us-west-2.amazonaws.com/classifiedResults.json")


if __name__ == "__main__":
    main("Loud bang near my home", "Be sure to speak in a reassuring voice and let them know help is on the way.\nTell the caller you will remain on the line until help has arrived")

