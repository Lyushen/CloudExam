let questions = [];
let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const numQuestions = parseInt(params.get('num'), 10) || 65;
    loadQuestions(numQuestions).then(() => {
        displayQuestion(currentQuestionIndex);
    });

    document.getElementById('confirm-btn').addEventListener('click', confirmAnswer);
});

function loadQuestions(numQuestions) {
    return fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data.slice(0, numQuestions);
        });
}

function displayQuestion(index) {
    const question = questions[index];
    const questionContainer = document.getElementById('question');
    const answersUl = document.getElementById('answers');

    questionContainer.textContent = question.question;
    answersUl.innerHTML = '';

    question.answers.forEach((answer, idx) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `answer_${idx}`;
        input.name = 'answer';
        input.value = idx;

        const label = document.createElement('label');
        label.htmlFor = `answer_${idx}`;
        label.textContent = answer;

        li.appendChild(input);
        li.appendChild(label);
        answersUl.appendChild(li);
    });
}

function confirmAnswer() {
    const selectedAnswers = Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(el => parseInt(el.value));
    const correctAnswers = questions[currentQuestionIndex].correct;

    if (selectedAnswers.length === correctAnswers.length && selectedAnswers.every(val => correctAnswers.includes(val))) {
        score++;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(currentQuestionIndex);
    } else {
        window.location.href = `summary.html?score=${score}&total=${questions.length}`;
    }
}
