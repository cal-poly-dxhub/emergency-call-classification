import json
import boto3

def get_user_input(prompt):
    return input(prompt).strip()

def generate_response(user_input, model_id, temperature, max_tokens):
    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name="us-west-2",
    )

    prompt = f"<s>[INST] {user_input} [/INST]"
    payload = {
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": 0.9,
        "top_k": 50,
    }

    response = bedrock_runtime.invoke_model_with_response_stream(
        modelId=model_id,
        body=json.dumps(payload),
        contentType="application/json",
    )

    stream = response.get('body')
    generated_text = ""
    if stream:
        for event in stream:
            chunk = event.get('chunk')
            if chunk:
                chunk_text = json.loads(chunk.get('bytes')).get('outputs', [{}])[0].get('text', '')
                generated_text += chunk_text
                print(chunk_text, end='', flush=True)  # Print the text as it is streamed

    return generated_text.strip()

def save_example(example, filename):
    with open(filename, "a") as file:
        file.write(example + "\n")

def generate_example(schema, purpose, attributes, example_values, prev_examples, output_file):
    instructions = f"Generate data for a model that takes in a series of attributes that describe a {purpose}. The required attributes are: {', '.join(attributes)}. Example attribute values: {example_values}. Do so in the exact format requested:\n```\n<data>{schema}</data>"
    messages = [
        ("system", "You are generating data which will be used to output fake data.\n\nYou will be given a high-level description of the attributes needed, and from that, you will generate a list of sample values.\n\nYou will do so in this format:\n```\n<data>insert data schema here</data>\n```"),
        ("human", instructions)
    ]

    if len(prev_examples) > 0:
        if len(prev_examples) > 10:
            prev_examples = prev_examples[-10:]
        for example in prev_examples:
            messages.append(("assistant", example))
            messages.append(("human", "Now, generate another set of attributes. Make them unique."))

    user_input = "\n".join([f"{role}: {content}" for role, content in messages])
    model_id = "mistral.mixtral-8x7b-instruct-v0:1"
    temperature = 1
    max_tokens = 4000
    response = generate_response(user_input, model_id, temperature, max_tokens)
    save_example(response, output_file)
    return response

def main():
    model_id = "mistral.mixtral-8x7b-instruct-v0:1"
    temperature = 1
    max_tokens = 4000

    schema = get_user_input("Enter the data schema: ")
    purpose = get_user_input("Enter the purpose of the data: ")
    attributes = get_user_input("Enter the required attributes (comma-separated): ").split(',')
    example_values = get_user_input("Enter example attribute values: ")
    num_examples = int(get_user_input("Enter the number of examples to generate: "))
    output_file = get_user_input("Enter the output file name: ")

    prev_examples = []
    batch_size = 10

    while len(prev_examples) < num_examples:
        batch_examples = []
        for i in range(batch_size):
            if len(prev_examples) + i >= num_examples:
                break
            print(f'Generating example {len(prev_examples) + i + 1}')
            example = generate_example(schema, purpose, attributes, example_values, prev_examples, output_file)
            print(example)
            batch_examples.append(example)

        print("Generated Examples:")
        for example in batch_examples:
            print(example)

        user_input = get_user_input("Continue generating examples? (y/n): ")
        if user_input.lower() == 'n':
            break

        prev_examples.extend(batch_examples)

        user_input = get_user_input("Do you want to update the schema, purpose, attributes, or example values? (y/n): ")
        if user_input.lower() == 'y':
            schema = get_user_input("Enter the updated schema: ")
            purpose = get_user_input("Enter the updated purpose: ")
            attributes = get_user_input("Enter the updated attributes (comma-separated): ").split(',')
            example_values = get_user_input("Enter the updated example attribute values: ")

if __name__ == "__main__":
    main()