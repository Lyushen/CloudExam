document.addEventListener("DOMContentLoaded", function() {
    /* const url = 'https://raw.githubusercontent.com/Lyushen/CLF-C02-quiz/main/resources/README.md'; */
    const url = 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md';
    fetchAndParseQuestions(url);

    document.querySelector('.theme-switcher').addEventListener('click', function() {
        document.body.classList.toggle('dark');
        console.log("Theme switched:", document.body.classList.contains('dark') ? "Dark mode" : "Light mode");
    });

    document.getElementById('question-number').addEventListener('input', function() {
        const inputIndex = parseInt(this.value, 10) - 1; // Convert to 0-based index
        if (!isNaN(inputIndex) && inputIndex >= 0 && inputIndex < questions.length) {
            updateQuestionDisplay(inputIndex);
        }
    });
});

async function fetchAndParseQuestions(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log("Fetched questions markdown data.");
        parseAndDisplayQuestions(text);
    } catch (error) {
        console.error("Failed to fetch questions:", error);
    }
}

function parseAndDisplayQuestions(questionsMarkdown) {
    questions = parseQuestions(questionsMarkdown); // Ensure 'questions' is declared globally
    console.log("Parsed questions:", questions.length);
    updateQuestionLimits();
    updateQuestionDisplay(0); // Load the first question
}

function updateQuestionLimits() {
    const questionsLength = questions.length;
    const question_box = document.getElementById('question-number')
    question_box.min = 1;
    question_box.max = questionsLength; // Set max limit for the input
    document.getElementById('total-questions').textContent = '/ ' + questionsLength; // Update the label showing the total number of questions
}


function parseQuestions(markdownText) {
    const questionBlocks = markdownText.split('### ').slice(1); // Split into blocks starting with "###"
    const parsedQuestions = questionBlocks.map(block => {
        const lines = block.split('\n').filter(line => line.trim()); // Split block into lines and remove empty ones
        const question = lines[0].trim(); // The first line is the question text
        const options = lines.slice(1).filter(line => line.startsWith('- [x]') || line.startsWith('- [ ]')) // Filter lines to only those that start with '- [x]' or '- [ ]'
                              .map(line => {
                                  const isCorrect = line.trim().startsWith('- [x]'); // Determine if the option is marked as correct
                                  const optionText = line.trim().substring(line.indexOf(']') + 2).trim(); // Extract text after the checkbox
                                  return {
                                      text: optionText,
                                      isCorrect: isCorrect
                                  };
                              });
        return { question, options };
    });
    /* console.log("Parsed questions:", parsedQuestions.length); */
    return parsedQuestions;
}

function updateQuestionDisplay(index) {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index;
    displayQuestion(questions[index]);
    document.getElementById('question-number').value = index + 1; // Update input field
}

function displayQuestion(question) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    questionText.textContent = question.question;
    optionsContainer.innerHTML = ''; // Clear previous options
    /* console.log("Displaying question:", question.question); */

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
        /* console.log("Correct answer selected:", option.text); */
    } else {
        optionElement.classList.add('wrong');
        /* console.log("Wrong answer selected:", option.text); */
    }
}


document.getElementById('question-number').addEventListener('mouseenter', enableScroll);
document.getElementById('question-number').addEventListener('mouseleave', disableScroll);
document.getElementById('question-number').addEventListener('keydown', handleKeyDown);
document.getElementById('question-number').addEventListener('input', handleInput);

function enableScroll() {
    document.addEventListener('wheel', handleWheelEvent, {passive: false});
}

function disableScroll() {
    document.removeEventListener('wheel', handleWheelEvent, {passive: false});
}

function handleWheelEvent(e) {
    if (e.target === document.getElementById('question-number') || e.target === document.querySelector('label[for="question-number"]')) {
        e.preventDefault();
        const direction = Math.sign(e.deltaY);
        const inputElement = document.getElementById('question-number');
        let currentIndex = parseInt(inputElement.value, 10) - 1;

        if (direction < 0 && currentIndex > 0) {
            updateQuestionDisplay(currentIndex - 1);
        } else if (direction > 0 && currentIndex < questions.length - 1) {
            updateQuestionDisplay(currentIndex + 1);
        }
    }
}

function handleKeyDown(e) {
    if (e.key === 'Enter') {
        const inputElement = document.getElementById('question-number');
        const currentIndex = parseInt(inputElement.value, 10) - 1;
        if (!isNaN(currentIndex) && currentIndex >= 0 && currentIndex < questions.length) {
            updateQuestionDisplay(currentIndex);
        }
    }
}

function handleInput() {
    const inputElement = document.getElementById('question-number');
    const currentIndex = parseInt(inputElement.value, 10) - 1;
    if (!isNaN(currentIndex) && currentIndex >= 0 && currentIndex < questions.length) {
        updateQuestionDisplay(currentIndex);
    }
}