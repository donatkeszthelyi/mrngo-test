import json

def generate_database_template(num_categories=2, num_concepts_per_category=30):
    database = {
        "database": {
            "categories": {}
        }
    }

    default_answer = {
        "answer_content": "",
        "answer_username": ""
    }

    for cat_num in range(1, num_categories + 1):
        category_id = f"cat_{cat_num:02d}"
        category_name = f"Category {cat_num}"
        category = {
            "category_id": category_id,
            "category_name": category_name,
            "concepts": {}
        }

        for concept_num in range(1, num_concepts_per_category + 1):
            concept_id = f"{category_id}_concept_{concept_num:02d}"
            concept_name = f"Concept {cat_num}.{concept_num}"
            concept = {
                "concept_id": concept_id,
                "concept_name": concept_name,
                "answer_count": 0,
                "answers": {
                    "default_answer": default_answer.copy()
                }
            }
            category["concepts"][concept_id] = concept

        database["database"]["categories"][category_id] = category

    return database

# Generate the database template
db_template = generate_database_template()

# Convert to JSON string with indentation for readability
json_template = json.dumps(db_template, indent=2)

# Write to a file
with open("database_template_short.json", "w") as file:
    file.write(json_template)

# Print the JSON template
print(json_template)
