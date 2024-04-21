// Define Application Settings
let appSettings = {
    sourceURL: '',
    shuffleQuestions: false,
    shuffleAnswers: false,
    currentQuestion: 0
};

// Initialize Application on Page Load
document.addEventListener("DOMContentLoaded", async function() {
    await initializeAppSettings();
    manageCookies();
    fetchAndParseQuestions();
    addEventListeners();
});


// Initialize settings from storage
async function initializeAppSettings() {
    const externalURL = 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md';
    const internalURL = 'resources/README.md';

    try {
        const response = await fetch(externalURL);
        appSettings.sourceURL = response.ok ? externalURL : internalURL;
    } catch (error) {
        console.log("Error fetching external URL, using internal:", error);
        appSettings.sourceURL = internalURL;
    }

    // Initialize other settings
    appSettings.shuffleQuestions = sessionStorage.getItem('shuffleQuestions') === 'yes';
    appSettings.shuffleAnswers = sessionStorage.getItem('shuffleAnswers') === 'yes';
    appSettings.currentQuestion = getCurrentQuestionFromCookies() || parseInt(localStorage.getItem('currentQuestion')) || 0;
}


// Manage cookies with secure settings
function manageCookies(settings) {
    setInterval(() => {
        document.cookie = `theme=${encodeURIComponent(localStorage.getItem('theme'))};max-age=86400;path=/;Secure;HttpOnly`;
        document.cookie = `source=${encodeURIComponent(settings.source)};max-age=86400;path=/;Secure;HttpOnly`;
        document.cookie = `shuffleQuestions=${settings.shuffleQuestions ? 'yes' : 'no'};max-age=86400;path=/;Secure;HttpOnly`;
        document.cookie = `shuffleAnswers=${settings.shuffleAnswers ? 'yes' : 'no'};max-age=86400;path=/;Secure;HttpOnly`;
        document.cookie = `currentQuestion=${encodeURIComponent(currentIndex)};max-age=86400;path=/;Secure;HttpOnly`;
    }, 30000);
}


// Event listeners for UI interactions
function addEventListeners() {
    document.querySelector('.theme-switcher').addEventListener('click', toggleTheme);
    document.querySelector('.source-switcher').addEventListener('click', toggleSource);
    document.querySelector('.shuffle-questions-flag').addEventListener('click', toggleShuffleQuestions);
    document.querySelector('.shuffle-answers-flag').addEventListener('click', toggleShuffleAnswers);
    document.getElementById('menu-toggle').addEventListener('click', toggleMenu);
    document.getElementById('prev-button').addEventListener('click', () => updateQuestionDisplay(currentIndex - 1));
    document.getElementById('next-button').addEventListener('click', () => updateQuestionDisplay(currentIndex + 1));
    document.querySelector('.reset-cache').addEventListener('click', resetCache);
    document.getElementById('question-number').addEventListener('input', handleInput);
    document.getElementById('question-number').addEventListener('mouseenter', enableScroll);
    document.getElementById('question-number').addEventListener('mouseleave', disableScroll);
}


// Fetch and parse questions from a Markdown file using settings
async function fetchAndParseQuestions() {
    try {
        const response = await fetch(appSettings.sourceURL);
        const text = await response.text();
        questions = parseQuestions(text);
        localStorage.setItem('questions', JSON.stringify(questions));
        updateQuestionLimits();
        updateQuestionDisplay(appSettings.currentQuestion);
    } catch (error) {
        console.error("Failed to fetch questions:", error);
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


// Tries to fetch from the external URL; if it fails, it sets the URL to the internal one.
async function getSourceURL() {
    const externalURL = 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md';
    const internalURL = 'resources/README.md';

    try {
        const response = await fetch(externalURL);
        if (response.ok) {
            return externalURL;
        } else {
            console.log("Switching to internal source due to failure to fetch external.");
            return internalURL;
        }
    } catch (error) {
        console.log("Error fetching external URL, switching to internal:", error);
        return internalURL;
    }
}

// Toggle between dark and light themes
function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    console.log("Theme switched:", localStorage.getItem('theme'));
}


// Toggle between external and internal sources
function toggleSource(settings) {
    const isExternal = settings.source === 'external';
    settings.source = isExternal ? 'internal' : 'external';
    const newUrl = getSourceURL();
    fetchAndParseQuestions(newUrl);
}

// Toggle shuffle state for questions
function toggleShuffleQuestions() {
    const isCurrentlyShuffled = sessionStorage.getItem('shuffleQuestions') === 'yes';
    sessionStorage.setItem('shuffleQuestions', isCurrentlyShuffled ? 'no' : 'yes');
    shuffleQuestions(!isCurrentlyShuffled);
    document.querySelector('.shuffle-questions-flag').textContent = `Shuffle Q: ${isCurrentlyShuffled ? 'No' : 'Yes'}`;
}

// Toggle shuffle state for answers within a question
function toggleShuffleAnswers() {
    const isCurrentlyShuffled = sessionStorage.getItem('shuffleAnswers') === 'yes';
    sessionStorage.setItem('shuffleAnswers', isCurrentlyShuffled ? 'no' : 'yes');
    if (isCurrentlyShuffled) {
        reloadCurrentQuestion();
    } else {
        shuffleCurrentQuestionAnswers();
    }
    document.querySelector('.shuffle-answers-flag').textContent = `Shuffle A: ${isCurrentlyShuffled ? 'No' : 'Yes'}`;
}

// Toggle the menu visibility
function toggleMenu() {
    var menu = document.getElementById('menu');
    menu.style.maxHeight = menu.style.maxHeight ? null : menu.scrollHeight + "px";
    menu.style.borderColor = menu.style.maxHeight ? '#ccc' : 'transparent';
}

// Reset the entire cache (localStorage and sessionStorage) and reload the page
function resetCache() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
}

// Shuffle the order of questions based on a flag
function shuffleQuestions(shouldShuffle) {
    if (shouldShuffle) {
        // Implementing Fisher-Yates shuffle algorithm
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
    } else {
        // Reset to original order, consider caching original order to avoid unnecessary fetches
        if (localStorage.getItem('questionsOriginal')) {
            questions = JSON.parse(localStorage.getItem('questionsOriginal')); // Assuming original order is cached
        } else {
            fetchAndParseQuestions(getCurrentQuestionURL());
        }
    }
    updateQuestionDisplay(0); // Start from the first question in the new order
}

// Get the current question URL based on the source
function getCurrentQuestionURL() {
    const source = sessionStorage.getItem('source');
    return source === 'external'
        ? 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md'
        : 'resources/README.md';
}

// Shuffle answers within the current question
function shuffleCurrentQuestionAnswers() {
    const currentQuestion = questions[currentIndex];
    currentQuestion.options = currentQuestion.options.sort(() => Math.random() - 0.5);
    displayQuestion(currentQuestion); // Re-display the current question with shuffled answers
}

// Re-display the current question without shuffling the answers
function reloadCurrentQuestion() {
    const currentQuestion = questions[currentIndex];
    displayQuestion(currentQuestion); // Re-display the current question with original answers
}

// Display the specified question in the UI
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

// Check the user's answer and update the UI accordingly
function checkAnswer(option, optionElement) {
    if (option.isCorrect) {
        optionElement.classList.add('correct');
    } else {
        optionElement.classList.add('wrong');
    }
}

// Update question display based on the selected index
function updateQuestionDisplay(index) {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index; // Update the global index
    displayQuestion(questions[currentIndex]);
    document.getElementById('question-number').value = currentIndex + 1;
    localStorage.setItem('currentQuestion', currentIndex.toString());
}

// Update question limits in the UI
function updateQuestionLimits() {
    const questionsLength = questions.length;
    const questionBox = document.getElementById('question-number');
    questionBox.min = 1;
    questionBox.max = questionsLength;
    document.getElementById('total-questions').textContent = '/ ' + questionsLength;
}

// Enable scrolling while focusing on the input element
function enableScroll() {
    document.addEventListener('wheel', handleWheelEvent, {passive: false});
}

// Disable scrolling when the focus is moved away from the input element
function disableScroll() {
    document.removeEventListener('wheel', handleWheelEvent, {passive: false});
}

// Handle wheel events to scroll through questions
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

// Handle input events to jump to a specific question
function handleInput() {
    const inputElement = document.getElementById('question-number');
    const newIndex = parseInt(inputElement.value, 10) - 1;
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < questions.length) {
        updateQuestionDisplay(newIndex);
    }
}

// Retrieve the current question index from cookies
function getCurrentQuestionFromCookies() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentQuestion='))
        ?.split('=')[1];

    return cookieValue ? parseInt(decodeURIComponent(cookieValue), 10) : 0;
}
