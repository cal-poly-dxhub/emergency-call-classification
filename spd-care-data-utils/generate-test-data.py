import re
import random
import requests
import boto3
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import BedrockChat

temperature = 1
number_of_examples = 10
bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-west-2",
)
    
def generate_example(prev_examples):
    instructions = "Now, generate data for a model that takes in a series of attributes that describe a fictitous crimes. Do so in the exact format requested:\n```\n \
                  <data><crimetype>list a crime type</crimetype>,<modesofaccess>how crimnial got access</modesofaccess>,<toolsused>type of tool used to access secure location</toolsused>, \
                  <typeofforceused>type of force used during the crime</typeofforceused>,<weaponsused>any weapons that were used to cause harm</weaponsused> \
                    \n```\n\nOnly one set of attributes should be generated per turn. {data}</data>'"
    messages = [
        ("system", "You are generating data which will be used to output fake data.\n\nYou will be given a high-level description of the attributes needed, and from that, you will generate a list of sample values.\n\nYou will do so in this format:\n```\n \
                 <data> <crimetype>list a crime type</crimetype>,<modesofaccess>how crimnial got access</modesofaccess>,<toolsused>type of tool used to access secure location</toolsused>, \
                  <typeofforceused>type of force used during the crime</typeofforceused>,<weaponsused>any weapons that were used to cause harm</weaponsused> </data>\
                    \n```\n\nNow, generate data for a model that takes in a series of attributes that describe a crime."),
        ("human", instructions)
    ]

    if len(prev_examples) > 0:
        if len(prev_examples) > 10:
            prev_examples = random.sample(prev_examples, 10)

        for example in prev_examples:
            messages.append(("assistant", example)) 
            messages.append(("human", "Now, generate another set of attributes. Make them unique."))


            #print("AFTER", messages)
    #else:
       #print("BEFORE", messages)

    model_id = "anthropic.claude-v2:1"

    model_kwargs =  { 
        "max_tokens": 1354,
        "temperature": 1,
        "top_k": 250,
        "top_p": 0.9,
    }

    model = BedrockChat(
        client=bedrock_runtime,
        model_id=model_id,
        model_kwargs=model_kwargs,
    )

    prompt = ChatPromptTemplate.from_messages(messages)
    
    chain = prompt | model | StrOutputParser()
    response = chain.invoke({"data": ""})
    # strip out the attributes
    #pattern = r'<data>(.*?)</data>'

    #return re.findall(pattern, response, re.DOTALL)
    return response

# Generate examples
prev_examples = []
for i in range(number_of_examples):
    print(f'Generating example {i}')
    example = generate_example(prev_examples)
    #print(example)
    prev_examples.append(example)

for sample in prev_examples:
    print(sample)