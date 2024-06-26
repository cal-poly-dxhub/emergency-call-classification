import time
import boto3
import os
import numpy as np
import traceback
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import BedrockChat
from langchain_community.llms import Bedrock
from langchain_community.embeddings import BedrockEmbeddings

bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1",
)

def strip_spaces(text):
    """
    Strips extra spaces from the given text.

    :param text: The text to be stripped.
    :return: The text with extra spaces stripped.
    """
    return ' '.join(text.split())

def read_and_clean_file(file_path):
    """
    Reads a file from the given path, cleans up extra white spaces,
    and escapes double quotes.

    :param file_path: Path to the file to be read.
    :return: A cleaned and escaped string containing the file's content.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            # Strip leading and trailing whitespaces then replace double quotes with escaped double quotes
            cleaned_content = ' '.join(content.split()).replace('"', '\\"')
            return cleaned_content
    except Exception as e:
        return f"Error reading file: {e}"
    
def generate_crime_response(data):
    model_id = "anthropic.claude-3-sonnet-20240229-v1:0"

    model_kwargs =  { 
        "max_tokens": 4096,
        "temperature": 1,
        "top_k": 250,
        "top_p": 0.9,
        "stop_sequences": ["\n\nHuman"],
    }

    model = BedrockChat(
        client=bedrock_runtime,
        model_id=model_id,
        model_kwargs=model_kwargs,
    )
# 10 patters of crime, including common modes of accessing a victim (luring, breaking in while they’re asleep, waiting until they’re on vacation and burglarizing while they’re out), common tools used to access secure locations (lock picks, use of prybars or heavy tools to force a door, explosive entry or tunneling, etc.) and force (physical force, threats of violence, knives, guns, etc.)?
    human_prompt = "I want to generate a fake police report with as much detail as possible based on the following parameters \
                 <crime type>, <modes of accessing a victim>, <common tools used to access secure locations>, <type of force used>, <weapons used in the crime>\
                 given the following data {data} can you please generate a detailed police report, feel free to embellish the details and be creative."
    messages = [
        ("system", "You are a criminologist expert and want to experiment with detecting patterns in crime reports."),
        ("human", human_prompt),
    ]
    try:
        prompt = ChatPromptTemplate.from_messages(messages)

        chain = prompt | model | StrOutputParser()

        # Chain Invoke
        
    
        # Send the message content to Claude using Bedrock and get the response
        start_time = time.time()  # Start timing
        # Call Bedrock
        response = chain.invoke({"data": data})
        end_time = time.time()  # End timing
        print("Claude call took :", end_time - start_time)  # Calculate execution time

        return(response)
    except Exception as e:
        exc_type, exc_value, exc_traceback = traceback.sys.exc_info()
        line_number = exc_traceback.tb_lineno
        print(f"Error generating report: {exc_type}{exc_value}{exc_traceback} on {line_number}")
        exit()

def output_text_to_file(text, filename):
    """
    Writes the given text to a file with the given filename.

    :param text: The text to be written to the file.
    :param filename: The name of the file to write the text to.
    """
    try:
        with open(filename, 'w') as file:
            file.write(text)
    except Exception as e:
        print(f"Error writing to file: {e}")
        raise e
    else:
        print(f"Text written to file: {filename}")
        return text
    # finally:
    #     # Clean up the file if it was created
    #     if os.path.exists(filename):
    #         os.remove(filename)
    #     else:
    #         print(f"File {filename} does not exist")
    #     return text
    return text
    # Clean up the file if it was created
    if os.path.exists(filename):
        os.remove(filename)
    else:
        print(f"File {filename} does not exist")
    return text
    # Clean up the file if it was created

def main():

    with open("crime-attributes.txt", 'r') as file:
        # Read each line, strip whitespace, and convert directly to an integer
        i = 208
        for line in file:
            # Generate the crime report for each line in the file
            data = line.strip()
            output_text_to_file(generate_crime_response(data), "crime-report-"+str(i)+".txt")
            i=i+1

    
if __name__ == "__main__":
    main()