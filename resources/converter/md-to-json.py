import os
import json
import re

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
    # Extract and combine the question text and any immediate following image
    question_text = lines[0]
    i = 1
    while i < len(lines) and not lines[i].startswith('- ['):
        if '!' in lines[i]:
            question_text += " <br>" + convert_images_in_text(lines[i], root)
        i += 1
    return question_text, lines[i:]

def parse_options(lines, root):
    options = {}
    correct_answers = []
    option_id = 1
    current_option_text = ""

    for line in lines:
        if line.startswith('- ['):
            if current_option_text:
                current_option_text = convert_images_in_text(current_option_text, root)
                options[str(option_id)] = current_option_text
                current_option_text = ""
                option_id += 1
            is_correct = line.strip().startswith('- [x]')
            current_option_text += line[line.index(']') + 2:].strip()
            if is_correct:
                correct_answers.append(f"options.{option_id}")
        elif '!' in line:  # Handle images within options
            current_option_text += " <br>" + convert_images_in_text(line.strip(), root)

    # Append the last option if exists
    if current_option_text:
        current_option_text = convert_images_in_text(current_option_text, root)
        options[str(option_id)] = current_option_text

    return options, correct_answers

def convert_images_in_text(text, root):
    images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', text)
    for alt, src in images:
        full_image_path = os.path.normpath(os.path.join(root, src))
        html_img_tag = f"<img src='{full_image_path}' alt='{alt}'>"
        text = text.replace(f'![{alt}]({src})', html_img_tag)
    return text

# Example usage:
if __name__ == "__main__":
    base_path = 'resources/tests'
    parse_markdown_to_json(base_path)
