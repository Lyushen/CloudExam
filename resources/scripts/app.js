// app.js
import { getCookie, manageCookies, getCurrentQuestionFromCookies } from './cookies.js';
import { openDB, saveQuestion, getQuestion, clearQuestions } from './IndexedDB.js';

export let appSettings = {
    source: '',
    lastSource: '',
    shuffleQuestions: 'false',
    shuffleAnswers: 'false',
    currentQuestion: 0,
    theme: 'light',
    list: [],
    dbQCount: 0 // Added dbQCount to appSettings
};

// UI Element Consts
const questionText = document.getElementById('question-text');
const explanationsContainer = document.getElementById('explanations-container');
const questionBox = document.getElementById('question-number');
const optionsContainer = document.getElementById('options-container');

// Initialize settings from the local storage
export async function initializeAppSettings() {
    try {
        appSettings.source = localStorage.getItem('source') || appSettings.source;
        appSettings.lastSource = localStorage.getItem('lastSource') || appSettings.lastSource;
        appSettings.shuffleQuestions = getCookie('shuffleQuestions') || localStorage.getItem('shuffleQuestions') || appSettings.shuffleQuestions;
        appSettings.shuffleAnswers = getCookie('shuffleAnswers') || localStorage.getItem('shuffleAnswers') || appSettings.shuffleAnswers;
        appSettings.currentQuestion = getCurrentQuestionFromCookies() || parseInt(localStorage.getItem('currentQuestion'), 10) || appSettings.currentQuestion;
        appSettings.dbQCount = parseInt(localStorage.getItem('dbQCount'), 10) || appSettings.dbQCount; // Initialize dbQCount
    } catch (error) {
        showPopup('Initialization error: ' + error.message);
    }
}

export function updateSettings() {
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
    localStorage.setItem('dbQCount', appSettings.dbQCount); // Store dbQCount in localStorage

    // Update cookies with current settings
    manageCookies();
    // Display any potential errors in the overlay
    checkConsoleLog();
}

// Event listeners for UI interactions
export function addControlEventListeners() {
    document.querySelector('#prev-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion - 1));
    document.querySelector('#next-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion + 1));
    questionBox.addEventListener('input', handleInput);
    questionBox.addEventListener('mouseenter', enableScroll);
    questionBox.addEventListener('mouseleave', disableScroll);
}

export async function getAndParseInitialQuestions() {
    try {
        const db = await openDB();

        if (appSettings.dbQCount > 0 && appSettings.source === appSettings.lastSource) {
            // If questions exist in IndexedDB and the source has not changed, use them
            console.log("Loaded questions from IndexedDB with unchanged source.");
        } else {
            // Clear the existing questions if the source has changed
            if (appSettings.source !== appSettings.lastSource) {
                await clearQuestions(db);
                console.log("Cleared existing questions due to source change.");
            }
            // Fetch questions if not in IndexedDB or if the source has changed
            await fetchAndParseQuestions(db);
        }
        updateQuestionLimits();
        updateQuestionDisplay();
        updateSettings();
    } catch (error) {
        showPopup('Error loading questions: ' + error.message);
    }
}

// Fetch and parse questions one by one to save memory
async function fetchAndParseQuestions(db) {
    try {
        const response = await fetch(appSettings.source);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();

        // Process questions one by one to handle storage limits
        for (let i = 0; i < json.length; i++) {
            try {
                await saveQuestion(db, json[i], i);
            } catch (error) {
                const errorMessage = 'Error saving question: ' + error.message;
                console.error(errorMessage);
                showPopup(errorMessage);
                break;
            }
        }
        appSettings.dbQCount = json.length;
        localStorage.setItem('questions_count', json.length);
        localStorage.setItem('source', appSettings.source);
        localStorage.setItem('lastSource', appSettings.source);
        localStorage.setItem('dbQCount', appSettings.dbQCount);
    } catch (error) {
        showPopup('Fetch error: ' + error.message);
    }
}

// Load question from IndexedDB
async function loadQuestionFromStorage(index) {
    try {
        const db = await openDB();
        const question = await getQuestion(db, index);
        return question;
    } catch (error) {
        showPopup('Error loading question: ' + error.message);
    }
}

// Update question display based on the selected index
export async function updateQuestionDisplay(index = appSettings.currentQuestion) {
    try {
        const db = await openDB();
        if (index < 0 || index >= appSettings.dbQCount) return;
        appSettings.currentQuestion = index;
        let currentQuestion = await loadQuestionFromStorage(index);

        let optionsArray = convertOptionsToArray(currentQuestion.options);

        // Shuffle answers if enabled
        if (appSettings.shuffleAnswers === 'true') {
            optionsArray = shuffleArray(optionsArray);
        }

        currentQuestion.shuffledOptions = optionsArray;

        displayQuestion(currentQuestion);
        updateSettings();
    } catch (error) {
        showPopup('Error updating question display: ' + error.message);
    }
}

// Convert options object to array
function convertOptionsToArray(options) {
    return Object.keys(options).map((key, index) => ({
        key: key, // Preserve the original key for reference
        html: options[key], // HTML content of the option
        index: index // Preserve the original index for reference
    }));
}

// Update question limits in the UI
async function updateQuestionLimits() {
    try {
        const questionsLength = appSettings.dbQCount;

        questionBox.min = 1;
        questionBox.max = questionsLength;
        document.getElementById('total-questions').textContent = '/ ' + questionsLength;
    } catch (error) {
        showPopup('Error updating question limits: ' + error.message);
    }
}

// Toggle shuffle state for questions
export function toggleShuffleQuestions() {
    appSettings.shuffleQuestions = appSettings.shuffleQuestions === 'true' ? 'false' : 'true';
    shuffleQuestions(appSettings.shuffleQuestions==='true');
    updateSettings();
    toggleMenu();
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
    toggleMenu(); // Deselect menu if open
} 


// Display the specified question in the UI
function displayQuestion(question) {

    questionText.innerHTML = question.question; // Allows HTML content
    optionsContainer.innerHTML = ''; // Clear previous options
    explanationsContainer.innerHTML = ''; // Clear previous explanations

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

    if (question.option_explanations){
        // Display the explanation related to the option clicked
        const explanationText = question.option_explanations[selectedOptionKey] || "No explanation available.";
        explanationsContainer.innerHTML = explanationText;
    }

    if (correctAnswer) {
        optionElement.classList.add('correct');
    } else {
        optionElement.classList.add('wrong');
    }
}

// Convert options object to array, shuffle, then convert back to object if necessary
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
        } else if (direction > 0 && currentIndex < appSettings.dbQCount - 1) {
            updateQuestionDisplay(currentIndex + 1);
        }
    }
}

// Handle input events to jump to a specific question
function handleInput() {
    const newIndex = parseInt(questionBox.value, 10) - 1;
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < appSettings.dbQCount) {
        updateQuestionDisplay(newIndex);
    }
}

export function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.classList.add('show');

    // Remove the 'show' class after the animation ends
    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000); // Duration of the animation
}

// Function to check for console log issues
function checkConsoleLog() {
    if (console && console.log) {
        const originalConsoleLog = console.log;
        console.log = function(message) {
            if (typeof message === 'string' && message.includes('Failed to save all questions')) {
                showPopup(message);
            }
            originalConsoleLog.apply(console, arguments);
        };
    }
}