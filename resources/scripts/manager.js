import { menuInitialization } from './menu.js';
import { appSettings,initializeAppSettings, addControlEventListeners,getAndParseInitialQuestions} from './app.js';
import { initializeSwipeHandling } from './swipe.js';
import { manageCookies } from './cookies.js';

document.addEventListener("DOMContentLoaded", async function() {
    menuInitialization();
    initializeAppSettings();
    appSettings.list = await loadTestList();
    if (window.location.pathname.match(/quiz\.html$/)) {
        await initializeQuizPage();
        await getAndParseInitialQuestions();
        manageCookies();
        addControlEventListeners();
        initializeSwipeHandling();
    } else {
        createTestButtons();
    }
    
});

// Load test list from local storage or fallback to list.json
export async function loadTestList() {
    let list = localStorage.getItem('list');
    if (!list) {
        list = await fetch('resources/tests/list.json').then(res => res.json());
        localStorage.setItem('list', JSON.stringify(list)); // Store in local storage
    } else {
        list = JSON.parse(list);
    }
    return list;
}
// Dynamically create buttons for each test on the index page
function createTestButtons() {
    const container = document.getElementById('test-container');
    // Assuming appSettings.list is an array of objects
    appSettings.list.forEach(testEntry => {
        // Loop through each entry in the array
        Object.entries(testEntry).forEach(([id, testDetails]) => {
            // Create a button for each test
            const button = document.createElement('button');
            button.textContent = testDetails.name; // Set the button text to the test's name
            button.onclick = () => {
                // Set up the button's onclick behavior
                const quizURL = `quiz.html?t=${encodeURIComponent(testDetails.url_name)}`;
                window.location.href = quizURL;// Navigate to the quiz page
            };
            container.appendChild(button); // Append the button to the container
        });
    });
}

async function initializeQuizPage() {
    const urlNameParam = getURLParameter('t'); // Get the 't' parameter from the URL]
    if (urlNameParam) {
        const testDetails = await getTestDetailsByUrlName(urlNameParam);
        if (testDetails) {
            appSettings.lastSource = appSettings.source; // Update the last source
            appSettings.source = testDetails.internal_url; // Set the new source
            localStorage.setItem('lastSource', appSettings.lastSource);
            localStorage.setItem('source', appSettings.source);
            // Optionally redirect or refresh the quiz content
        } else {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}

function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function getTestDetailsByUrlName(urlName) {
    // Iterate over the array
    for (let testEntry of appSettings.list) {
        // Each `testEntry` is an object with numeric keys
        for (let key in testEntry) {
            if (testEntry.hasOwnProperty(key)) {
                // Check if the current test object's url_name matches the passed urlName
                if (testEntry[key].url_name === urlName) {
                    return testEntry[key]; // Return the test details object
                }
            }
        }
    }
    return null; // Return null if no matching test is found
}