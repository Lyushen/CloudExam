// Define Application Settings
export let appSettings = {
    externalURL: 'https://raw.githubusercontent.com/Ditectrev/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02-Practice-Tests-Exams-Questions-Answers/main/README.md',
    internalURL: 'resources/README.md',
    isExternalSource: true,  // true if using external, false if using internal
    shuffleQuestions: false,
    shuffleAnswers: false,
    currentQuestion: 0,
    theme: 'light',
    questions:[]
};

/* let questions = []; */

// Initialize Application on Page Load // Moved to the entry.js point

// Initialize settings from storage
export async function initializeAppSettings() {
    appSettings.isExternalSource = (localStorage.getItem('source') === 'external') || appSettings.isExternalSource;
    appSettings.shuffleQuestions = getCookie('shuffleQuestions') === 'yes';
    appSettings.shuffleAnswers = getCookie('shuffleAnswers') === 'yes';
    appSettings.currentQuestion = getCurrentQuestionFromCookies() || parseInt(localStorage.getItem('currentQuestion'), 10) || 0;

    const storedQuestions = localStorage.getItem('questions');
    if (storedQuestions) {
        // If questions exist in localStorage, parse them
        appSettings.questions = JSON.parse(storedQuestions);
        console.log("Loaded questions from localStorage");
    } else {
        try {
            const response = await fetch(appSettings.isExternalSource ? appSettings.externalURL : appSettings.internalURL);
            if (!response.ok) throw new Error('Failed to fetch');
        } catch (error) {
            console.log("Error fetching URL, switching to internal:", error);
            appSettings.isExternalSource = false;
            localStorage.setItem('source', 'internal');
        }
        await fetchAndParseQuestions();
    }
    updateQuestionLimits();
    updateQuestionDisplay(appSettings.currentQuestion);
}


// Helper function to get cookie by name
function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}


// Manage cookies with secure settings
export function manageCookies() {
    setCookie('shuffleQuestions', appSettings.shuffleQuestions ? 'yes' : 'no', 1);
    setCookie('shuffleAnswers', appSettings.shuffleAnswers ? 'yes' : 'no', 1);
    setCookie('currentQuestion', appSettings.currentQuestion, 1);
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; HttpOnly`;
}


// Event listeners for UI interactions
export function addEventListeners() {
    document.querySelector('.theme-switcher').addEventListener('click', toggleTheme);
    document.querySelector('.source-switcher').addEventListener('click', toggleSource);
    document.querySelector('.shuffle-questions-flag').addEventListener('click', toggleShuffleQuestions);
    document.querySelector('.shuffle-answers-flag').addEventListener('click', toggleShuffleAnswers);
    document.querySelector('#menu-toggle').addEventListener('click', toggleMenu);
    document.querySelector('#prev-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion - 1));
    document.querySelector('#next-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion + 1));
    document.querySelector('.reset-cache').addEventListener('click', resetCache);
    document.querySelector('#question-number').addEventListener('input', handleInput);
    document.querySelector('#question-number').addEventListener('mouseenter', enableScroll);
    document.querySelector('#question-number').addEventListener('mouseleave', disableScroll);
}


// Fetch and parse questions from a Markdown file using settings
async function fetchAndParseQuestions() {
    let url = appSettings.isExternalSource ? appSettings.externalURL : appSettings.internalURL;
    try {
        const response = await fetch(url);
        const text = await response.text();
        appSettings.questions = parseQuestions(text);
        localStorage.setItem('questions', JSON.stringify(appSettings.questions));
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

// Toggle between dark and light themes
function toggleTheme() {
    const newTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    appSettings.theme = newTheme;
    document.body.className = newTheme;
}

// Toggle between external and internal sources
function toggleSource() {
    console.log(`Source switched to ${!appSettings.isExternalSource ? 'external' : 'internal'}`)
    appSettings.isExternalSource = !appSettings.isExternalSource;
    localStorage.setItem('source', appSettings.isExternalSource ? 'external' : 'internal');
    fetchAndParseQuestions(); // This function will now use the updated source URL
    updateQuestionLimits();
    updateQuestionDisplay();
}

// Toggle shuffle state for questions
function toggleShuffleQuestions() {
    const isCurrentlyShuffled = sessionStorage.getItem('shuffleQuestions') === 'yes';
    sessionStorage.setItem('shuffleQuestions', isCurrentlyShuffled ? 'no' : 'yes');
    shuffleQuestions(!isCurrentlyShuffled);
    document.querySelector('.shuffle-questions-flag').textContent = `Shuffle Q: ${isCurrentlyShuffled ? 'No' : 'Yes'}`;
}
// Shuffle the order of questions based on a flag
function shuffleQuestions(shouldShuffle) {
    if (shouldShuffle) {
        // Implementing Fisher-Yates shuffle algorithm
        for (let i = appSettings.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [appSettings.questions[i], appSettings.questions[j]] = [appSettings.questions[j], appSettings.questions[i]];
        }
    } else {
        // Reset to original order, consider caching original order to avoid unnecessary fetches
        if (localStorage.getItem('questionsOriginal')) {
            appSettings.questions = JSON.parse(localStorage.getItem('questionsOriginal')); // Assuming original order is cached
        } else {
            fetchAndParseQuestions();
        }
    }
    updateQuestionDisplay(0); // Start from the first question in the new order
}


// Toggle shuffle state for answers within a question
function toggleShuffleAnswers() {
    appSettings.shuffleAnswers = !appSettings.shuffleAnswers;
    localStorage.setItem('shuffleAnswers', appSettings.shuffleAnswers ? 'yes' : 'no'); // Store setting in localStorage
    updateQuestionDisplay(appSettings.currentQuestion); // Redisplay with new shuffle state
    document.querySelector('.shuffle-answers-flag').textContent = `Shuffle A: ${appSettings.shuffleAnswers ? 'Yes' : 'No'}`;
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
export function updateQuestionDisplay(index=appSettings.currentQuestion) {
    if (index < 0 || index >= appSettings.questions.length) return;
    appSettings.currentQuestion = index;
    let currentQuestion = appSettings.questions[appSettings.currentQuestion];

    // Shuffle answers if enabled
    if (appSettings.shuffleAnswers) {
        currentQuestion.options = shuffleArray(currentQuestion.options.slice()); // Use slice to create a copy for immutability
    }

    displayQuestion(currentQuestion);
    document.getElementById('question-number').value = appSettings.currentQuestion + 1;
    localStorage.setItem('currentQuestion', appSettings.currentQuestion.toString());
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Update question limits in the UI
function updateQuestionLimits() {
    const questionsLength = appSettings.questions.length;
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
        let currentIndex = appSettings.currentQuestion;

        if (direction < 0 && currentIndex > 0) {
            updateQuestionDisplay(currentIndex - 1);
        } else if (direction > 0 && currentIndex < appSettings.questions.length - 1) {
            updateQuestionDisplay(currentIndex + 1);
        }
    }
}

// Handle input events to jump to a specific question
function handleInput() {
    const inputElement = document.getElementById('question-number');
    const newIndex = parseInt(inputElement.value, 10) - 1;
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < appSettings.questions.length) {
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