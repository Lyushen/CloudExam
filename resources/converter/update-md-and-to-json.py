import os
import json
import re
import html
import requests

def parse_markdown_to_json(base_path):
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.lower() == "readme.md":
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as md_file:
                    markdown_text = md_file.read()
                    questions = parse_questions(markdown_text, root)
                    output_path = os.path.join(root, 'questions.json')
                    with open(output_path, 'w', encoding='utf-8') as json_file:
                        json.dump(questions, json_file, indent=4)
                print(f"Processed {full_path} into {output_path}")

def parse_questions(markdown_text, root):
    question_blocks = markdown_text.split('### ')[1:]
    questions = []
    question_id = 1

    for block in question_blocks:
        lines = block.split('\n')
        question_text, lines = extract_question_and_image(lines, root)
        options, correct_answers = parse_options(lines, root)
        questions.append({
            'id': str(question_id),
            'question': question_text,
            'options': options,
            'correct_answers': correct_answers,
            'description': '',
            'source_url': ''
        })
        question_id += 1

    return questions

def extract_question_and_image(lines, root):
    question_text = html.escape(lines[0])
    i = 1
    while i < len(lines) and not lines[i].startswith('- ['):
        if '!' in lines[i]:
            question_text += " <br>" + convert_images_in_text(lines[i], root)
        elif not is_navigation_link(lines[i]):
            question_text += " " + html.escape(lines[i])
        i += 1
    return question_text.strip(), lines[i:]

def parse_options(lines, root):
    options = {}
    correct_answers = []
    option_id = 1
    current_option_text = ""

    for line in lines:
        if line.startswith('- ['):
            if current_option_text:
                options[str(option_id)] = current_option_text
                current_option_text = ""
                option_id += 1
            is_correct = line.strip().startswith('- [x]')
            option_text = line[line.index(']') + 2:].strip()
            current_option_text += html.escape(option_text)
            if is_correct:
                correct_answers.append(f"options.{option_id}")
        elif '!' in line:  # Handle images within options
            current_option_text += " <br>" + convert_images_in_text(line.strip(), root)
        elif not is_navigation_link(line):
            current_option_text += " " + html.escape(line.strip())

    # Append the last option if exists
    if current_option_text:
        options[str(option_id)] = current_option_text.strip()

    return options, correct_answers

def is_navigation_link(line):
    # This checks for specific navigation markers in the markdown
    return "[⬆ Back to Top]" in line

def convert_images_in_text(text, root):
    images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', text)
    for alt, src in images:
        full_image_path = os.path.normpath(os.path.join(root, src))
        html_img_tag = f"<img src='{full_image_path}' alt='{html.escape(alt)}'>"
        text = text.replace(f'![{alt}]({src})', html_img_tag)
    return text

def update_markdown_files(list_path):
    with open(list_path, 'r', encoding='utf-8') as file:
        test_entries = json.load(file)
    
    for entry in test_entries:
        for title, paths in entry.items():
            external_url = paths.get('external_url')
            internal_url = paths.get('internal_url')

            # Check if URLs are provided and internal_url is valid
            if not external_url:
                print(f"Warning: No external URL provided for {title}. Skipping update.")
                continue
            
            if not internal_url or not internal_url.startswith('resources/'):
                print(f"Warning: Invalid internal URL for {title}. Skipping update.")
                continue
            
            internal_path = os.path.dirname(internal_url)
            readme_path = os.path.join(internal_path, 'readme.md')

            # Ensure the directory exists
            os.makedirs(internal_path, exist_ok=True)

            try:
                response = requests.get(external_url)
                response.raise_for_status()  # Raises HTTPError for bad responses
                with open(readme_path, 'w', encoding='utf-8') as f:
                    f.write(response.text)
                print(f"Successfully downloaded and updated {readme_path}")
            except requests.RequestException as e:
                print(f"Warning: Could not download from {external_url} for {title}. Error: {e}")

if __name__ == "__main__":
    list_path = 'resources/tests/list.json'
    base_path = 'resources/tests'
    
    update_markdown_files(list_path)  # Update the markdown files from external sources
    parse_markdown_to_json(base_path) # Then parse the updated markdown to JSON 