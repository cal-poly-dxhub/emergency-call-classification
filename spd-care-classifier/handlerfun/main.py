import boto3


def test_endpoint():
    client = boto3.client('comprehend')
    
    
    
    response = client.classify_document(
    Text = 'My dog is lost',
            #can also use the Bytes param to input a text, PDF, word, or image file.
            #do not use Bytes if using Text
    EndpointArn='arn:aws:comprehend:us-west-2:882364546937:document-classifier-endpoint/dummymodel-endpoint'
    )
            
    print(response)
        
        
test_endpoint()