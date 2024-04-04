function displayQuestion(question) {
    document.getElementById('question').textContent = question.question;
    const answersUl = document.getElementById('answers');
    answersUl.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = question.correct.length > 1 ? 'checkbox' : 'radio';
        input.name = 'answer';
        input.value = index;
        li.appendChild(input);
        li.appendChild(document.createTextNode(answer));
        answersUl.appendChild(li);
    });
}

function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(questions => {
            displayQuestion(questions[currentQuestionIndex]);
            document.getElementById('confirm-btn').onclick = () => confirmAnswer(questions);
        });
}

function confirmAnswer(questions) {
    const question = questions[currentQuestionIndex];
    const selectedAnswers = Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(input => parseInt(input.value));

    if (selectedAnswers.sort().toString() === question.correct.sort().toString()) {
        alert('Correct!');
    } else {
        alert('Wrong!');
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        alert('Quiz completed!');
    }
}

loadQuestions();
