/* 
Main goal: To add on the index page multiple choices for tests and after a choice launch quiz.html page.
1. To have multiple readme.md sources like internalURL: 'resources/README.md', but with another path, like 'resources/tests/test-1/readme.md' that will be stored in resources/tests/list.json.
2. Change logic: It receive all paths (from list.json) that used as a sourceURL for parsing.
3. Ability to return to the home (index page).
4. Store current questions for at least two tests in the local storage
5. Store list.json in the local storage
6. Current question for all tests (which a user has entered).
7. There wouldn't be any more External and Internal sources (and a function to switch them as it is), both sources will have its own directory and follow new structure.
8. Names for the test buttons for the index page should be retrived from list.json.
9. list.json structure:
"CLF-C02": "resources/tests/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02/readme.md",
"CLF-C02-f": "resources/tests/Fixed-Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02/readme.md",
"path-3": "resources/tests/###/readme.md", (...and so on)
10. in fetchAndParseQuestions() we should remove test for failure as we will store them within the static website.
*/

//entry.js
import { initializeSwipeHandling } from './swipe.js';
import { initializeAppSettings, manageCookies,addEventListeners} from './app.js';

document.addEventListener("DOMContentLoaded", async function() {
    await initializeAppSettings();
    manageCookies();
    addEventListeners();
    initializeSwipeHandling();
});

//app.js
// Define Application Settings
export let appSettings = {
    externalURL: 'resources/tests/Amazon-Web-Services-AWS-Certified-Cloud-Practitioner-CLF-C02/README.md',
    internalURL: 'resources/README.md',
    source: 'in',  // true if using external, false if using internal
    shuffleQuestions: 'false',
    shuffleAnswers: 'false',
    currentQuestion: 0,
    theme: 'light',
    questions:[],
    lastSource: ''
};
// Initialize settings from storage
export async function initializeAppSettings() {
    appSettings.source = localStorage.getItem('source') || appSettings.source;
    appSettings.lastSource = localStorage.getItem('lastSource') || appSettings.lastSource;
    appSettings.shuffleQuestions = getCookie('shuffleQuestions') || localStorage.getItem('shuffleQuestions') || appSettings.shuffleQuestions;
    appSettings.shuffleAnswers = getCookie('shuffleAnswers') || localStorage.getItem('shuffleAnswers') || appSettings.shuffleAnswers;
    appSettings.currentQuestion = getCurrentQuestionFromCookies() || parseInt(localStorage.getItem('currentQuestion'), 10) || appSettings.currentQuestion;

    const storedQuestions = localStorage.getItem('questions');
    if (storedQuestions && appSettings.lastSource === appSettings.source) {
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
    console.log("Updating settings:", appSettings);

    // Update UI with current settings
    document.querySelector('.source-switcher').textContent = (appSettings.source === 'in' ? 'Source In' : 'Source Ex');
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
    setCookie('shuffleQuestions', appSettings.shuffleQuestions.toString());
    setCookie('shuffleAnswers', appSettings.shuffleAnswers.toString());
    setCookie('currentQuestion', appSettings.currentQuestion.toString());
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
    setCookie('shuffleQuestions', appSettings.shuffleQuestions);
    setCookie('shuffleAnswers', appSettings.shuffleAnswers);
    setCookie('currentQuestion', appSettings.currentQuestion);
}

function setCookie(name, value) {
    const expires = new Date(Date.now() + 180 * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=Strict`;
}


// Event listeners for UI interactions
export function addEventListeners() {
///...
    document.querySelector('#prev-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion - 1));
    document.querySelector('#next-button').addEventListener('click', () => updateQuestionDisplay(appSettings.currentQuestion + 1));
///...
}

// Fetch and parse questions from a Markdown file using settings
async function fetchAndParseQuestions() {
    let url = appSettings.source === 'in' ? appSettings.internalURL : appSettings.externalURL;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const text = await response.text();
        appSettings.questions = parseQuestions(text);
        localStorage.setItem('questions', JSON.stringify(appSettings.questions)); // Store fetched questions
    } catch (error) {
        console.error(`Failed to fetch questions from ${url}:`, error);
        // Fallback to internal source without changing the user's preferred source
        if (appSettings.source === 'ex') {
            appSettings.source = 'in'; // Temporarily use internal source for loading questions
            console.error("Switching temporarily to internal source due to failure.");
            await fetchAndParseQuestions();
            appSettings.source = 'ex'; // Restore preferred source after fetching
        }
    }
}

function parseQuestions(markdownText) {
    appSettings.lastSource=appSettings.source;
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