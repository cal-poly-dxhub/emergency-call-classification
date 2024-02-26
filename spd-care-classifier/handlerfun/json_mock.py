import json

# Creating a dictionary to represent the JSON object
data = {
    "name": "John Doe",
    "age": 30,
    "is_student": False,
    "courses": ["Math", "Science", "English"],
    "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA"
    }
}

# Converting the dictionary to a JSON string
json_string = json.dumps(data, indent=4)

print(json_string)