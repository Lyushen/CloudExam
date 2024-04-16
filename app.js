let questions = [];
let currentIndex = 0;
let questionsMarkdown = ""; // This needs to be assigned the Markdown data.

document.addEventListener("DOMContentLoaded", function() {
    // Example of fetching markdown data if hosted
    fetch('https://raw.githubusercontent.com/Lyushen/CLF-C02-quiz/main/resources/README_original.md')
        .then(response => response.text())
        .then(text => {
            questionsMarkdown = text;
            questions = parseQuestions(questionsMarkdown, 0, 10); // Initial parsing
            updateQuestionDisplay(0); // Load the first question
        });

    document.getElementById('theme-switcher').addEventListener('click', function() {
        document.body.classList.toggle('dark');
    });
});

function parseQuestions(markdownText, fromIndex, toIndex) {
    const questionBlocks = markdownText.split('### ').slice(1);
    return questionBlocks.slice(fromIndex, toIndex).map(block => {
        const lines = block.split('\n').filter(line => line.trim());
        const question = lines[0].trim();
        const options = lines.slice(1, -1).map(line => ({
            text: line.slice(6).trim(),
            isCorrect: line.trim().startsWith('[x]')
        }));
        return { question, options };
    });
}

function updateQuestionDisplay(index) {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index;
    displayQuestion(questions[index]);
}

function displayQuestion(question) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    questionText.textContent = question.question;
    optionsContainer.innerHTML = ''; // Clear previous options

    question.options.forEach(option => {
        const optionElement = document.createElement('button');
        optionElement.textContent = option.text;
        optionElement.classList.add('option-button');
        optionElement.onclick = () => checkAnswer(option, optionElement);
        optionsContainer.appendChild(optionElement);
    });
}

function checkAnswer(option, optionElement) {
    if (option.isCorrect) {
        optionElement.classList.add('correct');
    } else {
        optionElement.classList.add('wrong');
    }
}
