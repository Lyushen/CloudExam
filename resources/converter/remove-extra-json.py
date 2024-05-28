import os
import json
import shutil

# Base directory to scan
base_dir = 'resources/tests/'

# Keys to keep in each JSON object
keys_to_keep = ["id", "option_explanations"]

# Function to clean each JSON object by keeping only specified keys
def clean_json(data):
    return {key: data[key] for key in keys_to_keep if key in data}

def process_file(file_path):
    backup_path = file_path + '.bak'

    # Read the JSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        print("Original Data: ", data)  # Debugging statement to check original data

    # Check if the data is a list of objects
    if isinstance(data, list):
        cleaned_data = [clean_json(item) for item in data]
    else:
        print("The data is not in the expected format (a list of objects).")
        return

    print("Cleaned Data: ", cleaned_data)  # Debugging statement to check cleaned data

    # Rename the original file to .bak
    shutil.move(file_path, backup_path)

    # Write the cleaned data to a new file with the original name
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=4)

    print(f"Processed and cleaned: {file_path}")

# Flag to check if the user has confirmed to continue
user_confirmed = False

# Iterate over all directories in the base_dir
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == 'option_explanations.json':
            file_path = os.path.join(root, file)
            
            if not user_confirmed:
                # Process the first file and ask for user confirmation
                process_file(file_path)
                
                # Ask the user if they want to continue with other files
                user_input = input("The first file has been processed. Do you want to continue processing the rest? (yes/no): ").strip().lower()
                
                if user_input == 'yes':
                    user_confirmed = True
                else:
                    print("Stopping further processing.")
                    exit(0)
            else:
                # Process subsequent files if the user confirmed
                process_file(file_path)

print("Cleanup complete.")
