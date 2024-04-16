import json
import requests

def parse_markdown_content(content):
    sections = content.split('### ')[1:]
    questions = []
    for section in sections:
        lines = section.split('\n')
        question_text = lines[0].strip()
        answers = []
        correct_indices = []

        for i, line in enumerate(lines[1:]):
            if line.startswith('- ['):
                answer = line[6:].strip()
                if line[3] == 'x':
                    correct_indices.append(i)
                answers.append(answer)

        question = {
            'question': question_text,
            'answers': answers,
            'correct': correct_indices
        }
        questions.append(question)

    return questions

def load_and_parse_md(url, local_file_path='readme.md'):
    try:
        response = requests.get(url)
        response.raise_for_status()
        content = response.text
    except (requests.RequestException, requests.HTTPError):
        with open(local_file_path, 'r') as file:
            content = file.read()

    return parse_markdown_content(content)

def save_questions_to_json(questions, file_path='questions.json'):
    with open(file_path, 'w') as json_file:
        json.dump(questions, json_file, indent=4)

# Example URL
md_file_url = 'https://example.com/readme.md'
questions = load_and_parse_md(md_file_url)
save_questions_to_json(questions)