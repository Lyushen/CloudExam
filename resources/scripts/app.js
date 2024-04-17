let currentIndex = 0;
let questions = [];
document.addEventListener("DOMContentLoaded", function() {
    // Initialize from local storage or set defaults
    initializeFromLocalStorage();

    document.querySelector('.theme-switcher').addEventListener('click', function() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        console.log("Theme switched:", localStorage.getItem('theme'));
    });

    document.querySelector('.source-switcher').addEventListener('click', function() {
        // Toggle between internal and external source
        const isExternal = localStorage.getItem('source') === 'external';
        localStorage.setItem('source', isExternal ? 'internal' : 'external');
        const url = isExternal ? 'https://raw.githubusercontent.com/Lyushen/CLF-C02-quiz/main/resources/README.md' : 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md';
        fetchAndParseQuestions(url);
    });

    document.querySelector('.shuffle-questions-flag').addEventListener('click', function() {
        const isCurrentlyShuffled = this.textContent.includes('Yes');
        const shouldShuffle = !isCurrentlyShuffled; // Toggle the shuffle state
        this.textContent = `Shuffle Q: ${shouldShuffle ? 'Yes' : 'No'}`; // Update the text content accordingly
        localStorage.setItem('shuffleQuestions', shouldShuffle ? 'yes' : 'no');
        shuffleQuestions(shouldShuffle);
    });

    document.querySelector('.shuffle-answers-flag').addEventListener('click', function() {
        const shouldShuffleAnswers = this.textContent.includes('No');
        this.textContent = `Shuffle A: ${shouldShuffleAnswers ? 'Yes' : 'No'}`;
        localStorage.setItem('shuffleAnswers', shouldShuffleAnswers ? 'yes' : 'no');
        if (shouldShuffleAnswers) {
            shuffleCurrentQuestionAnswers();
        } else {
            reloadCurrentQuestion();
        }
    });

    document.getElementById('question-number').addEventListener('input', handleInput);

    document.getElementById('menu-toggle').addEventListener('click', function() {
        var menu = document.getElementById('menu');
        if (menu.style.maxHeight) {
            menu.style.maxHeight = null;
            menu.style.borderColor = 'transparent';
        } else {
            menu.style.maxHeight = menu.scrollHeight + "px";
            menu.style.borderColor = '#ccc';
        }
    });

    document.querySelector('.reset-cache').addEventListener('click', function() {
        localStorage.clear();
        window.location.reload(); // Reload the page to reinitialize defaults
    });

    document.getElementById('question-number').addEventListener('mouseenter', enableScroll);
    document.getElementById('question-number').addEventListener('mouseleave', disableScroll);
    document.getElementById('question-number').addEventListener('keydown', handleKeyDown);

    document.getElementById('prev-button').addEventListener('click', function() {
        updateQuestionDisplay(currentIndex - 1);
    });
    document.getElementById('next-button').addEventListener('click', function() {
        updateQuestionDisplay(currentIndex + 1);
    });
    
});

function shuffleQuestions(shouldShuffle) {
    if (shouldShuffle) {
        // Fisher-Yates shuffle algorithm
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
    } else {
        // Reset to original order by fetching again, consider caching the original order to avoid unnecessary fetches
        if (questions.length === 0 || localStorage.getItem('questionsOriginal')) {
            questions = JSON.parse(localStorage.getItem('questionsOriginal')); // Assuming original order is cached
        } else {
            fetchAndParseQuestions(getCurrentQuestionURL());
        }
    }
    updateQuestionDisplay(0); // Start from the first question in the new order
}


function getCurrentQuestionURL() {
    const source = localStorage.getItem('source');
    return source === 'external' ?
        'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md' :
        'internal/README.md';
}

function shuffleCurrentQuestionAnswers() {
    const currentQuestion = questions[currentIndex];
    currentQuestion.options = currentQuestion.options.sort(() => Math.random() - 0.5);
    displayQuestion(currentQuestion); // Re-display the current question with shuffled answers
}
function reloadCurrentQuestion() {
    const currentQuestion = questions[currentIndex];
    displayQuestion(currentQuestion); // Re-display the current question with original answers
}


async function fetchAndParseQuestions(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        questions = parseQuestions(text);
        localStorage.setItem('questions', JSON.stringify(questions));
        updateQuestionLimits();
        updateQuestionDisplay(parseInt(localStorage.getItem('currentQuestion')) || 0);
    } catch (error) {
        console.error("Failed to fetch questions:", error);
        if (url.includes('external')) {
            console.log("Switching to internal source due to failure.");
            localStorage.setItem('source', 'internal');
            fetchAndParseQuestions('internal/README.md');
        }
    }
}

function parseQuestions(markdownText) {
    const questionBlocks = markdownText.split('### ').slice(1);
    return questionBlocks.map(block => {
        const lines = block.split('\n').filter(line => line.trim());
        const question = lines[0].trim();
        const options = lines.slice(1).filter(line => line.startsWith('- [x]') || line.startsWith('- [ ]'))
                              .map(line => {
                                  const isCorrect = line.trim().startsWith('- [x]');
                                  const optionText = line.substring(line.indexOf(']') + 2).trim();
                                  return {
                                      text: optionText,
                                      isCorrect: isCorrect
                                  };
                              });
        return { question, options };
    });
}

function updateQuestionDisplay(index) {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index; // Update the global index
    displayQuestion(questions[currentIndex]);
    document.getElementById('question-number').value = currentIndex + 1;
    localStorage.setItem('currentQuestion', currentIndex.toString());
}

function displayQuestion(question) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';

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

function updateQuestionLimits() {
    const questionsLength = questions.length;
    const question_box = document.getElementById('question-number');
    question_box.min = 1;
    question_box.max = questionsLength;
    document.getElementById('total-questions').textContent = '/ ' + questionsLength;
}

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
        handleInput();
    }
}

function handleInput() {
    const inputElement = document.getElementById('question-number');
    const currentIndex = parseInt(inputElement.value, 10) - 1;
    if (!isNaN(currentIndex) && currentIndex >= 0 && currentIndex < questions.length) {
        updateQuestionDisplay(currentIndex);
    }
}

function initializeFromLocalStorage() {
/*     const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        document.body.classList.toggle('dark', storedTheme === 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
 */

    const storedSource = localStorage.getItem('source') || 'external';
    localStorage.setItem('source', storedSource);
    const url = storedSource === 'external' ? 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md' : 'internal/README.md';
    fetchAndParseQuestions(url);

    const storedQuestions = JSON.parse(localStorage.getItem('questions'));
    if (storedQuestions) {
        questions = storedQuestions;
        updateQuestionLimits();
        const currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
        updateQuestionDisplay(currentQuestion);
    }
    /* Shaffle flag */
    const storedShuffle = localStorage.getItem('shuffleQuestions') === 'yes';
    const shuffleText = `Shuffle Q: ${storedShuffle ? 'Yes' : 'No'}`;
    document.querySelector('.shuffle-questions-flag').textContent = shuffleText;
    shuffleQuestions(storedShuffle);

    const storedShuffleAnswers = localStorage.getItem('shuffleAnswers') === 'yes';
    document.querySelector('.shuffle-answers-flag').textContent = `Shuffle A: ${storedShuffleAnswers ? 'Yes' : 'No'}`;
    if (storedShuffleAnswers) {
        shuffleCurrentQuestionAnswers();
    }
}