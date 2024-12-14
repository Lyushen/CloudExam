import os
import json
import math
from openpyxl import load_workbook
from pathlib import Path

# Constants
SCRIPT_DIR = Path(__file__).parent  # Directory where the script is located
TEMPLATE_FILE = SCRIPT_DIR / 'KahootQuizTemplate.xlsx'
questions_dir = SCRIPT_DIR.parent / 'tests'
OUTPUT_DIR = SCRIPT_DIR.parent / 'kahoot'
QUESTION_LIMIT_MIN = 12
QUESTION_LIMIT_MAX = 20
QUESTION_LENGTH_LIMIT = 120
ANSWER_LENGTH_LIMIT = 75

# Specify target folders here, e.g., ['folder1', 'folder2']. Leave empty to process all folders.
target_folders = ['AWS-Certified-Cloud-Practitioner-CLF-C02-f', 'GCP-Associate-Cloud-Engineer',"Microsoft-Azure-AZ-900-Microsoft-Azure-Fundamentals"]

def validate_question(question_data):
    """
    Validates question and answer lengths according to specified limits.
    """
    if len(question_data["question"]) > QUESTION_LENGTH_LIMIT:
        return False
    for answer in question_data["options"].values():
        if len(answer) > ANSWER_LENGTH_LIMIT:
            return False
    return True

def split_questions_into_groups(questions, group_size):
    """
    Splits questions into groups of specified size.
    """
    for i in range(0, len(questions), group_size):
        yield questions[i:i + group_size]

def process_question_data(questions, folder_name):
    """
    Processes and writes questions to .xlsx files, split by required group size.
    """
    # Determine optimal group size
    total_questions = len(questions)
    group_size = max(QUESTION_LIMIT_MIN, min(QUESTION_LIMIT_MAX, math.ceil(total_questions / math.ceil(total_questions / QUESTION_LIMIT_MAX))))
    
    # Load the Kahoot template
    for idx, question_group in enumerate(split_questions_into_groups(questions, group_size)):
        workbook = load_workbook(TEMPLATE_FILE)
        sheet = workbook.active
        
        # Populate each row with question data
        for row_offset, question in enumerate(question_group, start=9):  # Start from row 9
            sheet[f'B{row_offset}'] = question["question"]
            sheet[f'C{row_offset}'] = question["options"].get("1", "")  # Use empty string if option "1" is missing
            sheet[f'D{row_offset}'] = question["options"].get("2", "")  # Use empty string if option "2" is missing
            sheet[f'E{row_offset}'] = question["options"].get("3", "")  # Use empty string if option "3" is missing
            sheet[f'F{row_offset}'] = question["options"].get("4", "")  # Use empty string if option "4" is missing
            sheet[f'G{row_offset}'] = 30  # Set fixed value of 30 for each question
            
            # Check for correct answer existence and set in H column if available
            if question.get("correct_answers") and question["correct_answers"][0]:
                correct_option = question["correct_answers"][0].split(".")[-1]
                sheet[f'H{row_offset}'] = int(correct_option)
            else:
                sheet[f'H{row_offset}'] = ''  # Leave blank if no correct answer

        # Define output path
        output_path = Path(OUTPUT_DIR) / folder_name / f'kahoot_part_{idx + 1}.xlsx'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save the workbook
        workbook.save(output_path)
        print(f'Saved: {output_path}')

def main():
    # Check if any target folders are specified; otherwise, process all
    missing_files = []
    folders_found = False
    
    # Determine folders to process based on target_folders list
    folders_to_check = target_folders if target_folders else [folder.name for folder in questions_dir.iterdir() if folder.is_dir()]
    
    for folder_name in folders_to_check:
        folder_path = questions_dir / folder_name / 'questions.json'
        
        # Check if the questions.json file exists in the folder
        if folder_path.exists():
            folders_found = True  # Mark that at least one folder was found
            
            # Load and validate questions
            with open(folder_path, 'r', encoding='utf-8') as f:
                questions = json.load(f)
            
            valid_questions = [q for q in questions if validate_question(q)]
            
            if valid_questions:
                print(f"Processing '{folder_name}' with {len(valid_questions)} valid questions.")
                # Process and save valid questions into kahoot.xlsx files
                process_question_data(valid_questions, folder_name)
            else:
                print(f"No valid questions found in '{folder_name}'.")
        else:
            # Add to missing files list if questions.json is not found
            missing_files.append(folder_path)

    # Feedback for missing files
    if missing_files:
        print("\nThe following folders are missing 'questions.json' files:")
        for path in missing_files:
            print(f"- {path}")
    elif not folders_found:
        print("No 'questions.json' files found in the specified folders.")
    else:
        print("Processing completed.")

if __name__ == '__main__':
    main()