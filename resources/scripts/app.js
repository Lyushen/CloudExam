import { getCookie, manageCookies, getCurrentQuestionFromCookies} from './cookies.js';
export let appSettings = {
    source: '',
    lastSource: '',
    shuffleQuestions: 'false',
    shuffleAnswers: 'false',
    currentQuestion: 0,
    theme: 'light',
    questions:[],
    list:[]
};

// Initialize settings from the local storage
export async function initializeAppSettings() {
    appSettings.source = localStorage.getItem('source') || appSettings.source;
    appSettings.lastSource = localStorage.getItem('lastSource') || appSettings.lastSource;
    appSettings.shuffleQuestions = getCookie('shuffleQuestions') || localStorage.getItem('shuffleQuestions') || appSettings.shuffleQuestions;
    appSettings.shuffleAnswers = getCookie('shuffleAnswers') || localStorage.getItem('shuffleAnswers') || appSettings.shuffleAnswers;
    appSettings.currentQuestion = getCurrentQuestionFromCookies() || parseInt(localStorage.getItem('currentQuestion'), 10) || appSettings.currentQuestion;
}

export async function getAndParseInitialQuestions(){
    const storedQuestions = localStorage.getItem('questions');
    if (storedQuestions && appSettings.source === appSettings.lastSource) {
        // If questions exist in localStorage and the source has not changed, use them
        appSettings.questions = JSON.parse(storedQuestions);
        console.log("Loaded questions from localStorage with unchanged source.");
    } else {
        // Fetch questions if not in localStorage or if the source has changed
        await fetchAndParseQuestions();
    }
    updateQuestionLimits();
    updateQuestionDisplay();
    updateSettings();
}

function updateSettings() {
    // Log current settings to ensure tracking of changes
    //console.log("Updating settings:", appSettings);

    // Update UI with current settings
    document.querySelector('.shuffle-answers-flag').textContent = `Shuffle A: ${appSettings.shuffleAnswers === 'true' ? 'Yes' : 'No'}`;
    document.querySelector('.shuffle-questions-flag').textContent = `Shuffle Q: ${appSettings.shuffleQuestions === 'true' ? 'Yes' : 'No'}`;
    document.getElementById('question-number').value = appSettings.currentQuestion + 1; // Update displaying current question

    // Update localStorage with current settings
    localStorage.setItem('source', appSettings.source);
    localStorage.setItem('shuffleQuestions', appSettings.shuffleQuestions); // Ensure storing as string
    localStorage.setItem('shuffleAnswers', appSettings.shuffleAnswers); // Ensure storing as string
    localStorage.setItem('currentQuestion', appSettings.currentQuestion);
    localStorage.setItem('lastSource', appSettings.lastSource);

    // Update cookies with current settings
    manageCookies();
}

// Event listeners for UI interactions
export function addControlEventListeners() {
    document.querySelector('#prev-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion - 1));
    document.querySelector('#next-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion + 1));
    document.querySelector('#question-number').addEventListener('input', handleInput);
    document.querySelector('#question-number').addEventListener('mouseenter', enableScroll);
    document.querySelector('#question-number').addEventListener('mouseleave', disableScroll);
}

// Fetch and parse questions from a Markdown file using settings
async function fetchAndParseQuestions() {
    const response = await fetch(appSettings.source);
    if (!response.ok) throw new Error('Failed to fetch');
    const json = await response.json();
    /* appSettings.questions = parseQuestions(text); */
    appSettings.questions = json;  // Assigning parsed JSON directly to appSettings.questions
    localStorage.setItem('questions', JSON.stringify(appSettings.questions)); // Store fetched questions
}

// Toggle shuffle state for questions
export function toggleShuffleQuestions() {
    appSettings.shuffleQuestions = appSettings.shuffleQuestions === 'true' ? 'false' : 'true';
    shuffleQuestions(appSettings.shuffleQuestions==='true');
    updateSettings();
}

// Shuffle the order of questions based on a flag
async function shuffleQuestions(shouldShuffle) {
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
            await fetchAndParseQuestions();
        }
    }
    updateQuestionDisplay(0); // Start from the first question in the new order
}


// Toggle shuffle state for answers within a question
export function toggleShuffleAnswers() {
    appSettings.shuffleAnswers = appSettings.shuffleAnswers === 'true' ? 'false' : 'true';
    updateSettings();
    updateQuestionDisplay(); // Redisplay with new shuffle state
} 

// Display the specified question in the UI
function displayQuestion(question) {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    questionText.innerHTML = question.question; // Allows HTML content
    optionsContainer.innerHTML = ''; // Clear previous options

    question.shuffledOptions.forEach(option => {
        const optionElement = document.createElement('button');
        optionElement.innerHTML = option.html;
        optionElement.classList.add('option-button');
        optionElement.onclick = () => checkAnswer(question, option.key, optionElement);
        optionsContainer.appendChild(optionElement);
    });
}
// Check the user's answer and update the UI accordingly
function checkAnswer(question, selectedOptionKey, optionElement) {
    const correctAnswer = question.correct_answers.includes(`options.${selectedOptionKey}`);
    if (correctAnswer) {
        optionElement.classList.add('correct');
    } else {
        optionElement.classList.add('wrong');
    }
}

// Update question display based on the selected index
export function updateQuestionDisplay(index=appSettings.currentQuestion) {
    if (index < 0 || index >= appSettings.questions.length) return;
    appSettings.currentQuestion = index;
    let currentQuestion = appSettings.questions[index];

    let optionsArray = convertOptionsToArray(currentQuestion.options);

    // Shuffle answers if enabled
    if (appSettings.shuffleAnswers === 'true') {
        optionsArray = shuffleArray(optionsArray);
    }

    currentQuestion.shuffledOptions = optionsArray;

    displayQuestion(currentQuestion);
    updateSettings();
}

// Convert options object to array, shuffle, then convert back to object if necessary
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Convert options object to array
function convertOptionsToArray(options) {
    return Object.keys(options).map(key => ({
        key: key, // Preserve the original key for reference
        html: options[key] // HTML content of the option
    }));
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

