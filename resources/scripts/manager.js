import { menuInitialization } from './menu.js';
import {initializeAppSettings,appSettings} from './app.js';

document.addEventListener("DOMContentLoaded", async function() {
    menuInitialization();
    initializeAppSettings();
    appSettings.list = await loadTestList();

    createTestButtons();

});

// Load test list from local storage or fallback to list.json
async function loadTestList() {
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
    appSettings.list.forEach(testObj => {
        Object.entries(testObj).forEach(([key, value]) => {
            const button = document.createElement('button');
            button.textContent = key;
            button.onclick = () => {
                appSettings.lastSource = appSettings.source; // Update lastSource with the current source before changing
                appSettings.source = value; // Update the source to the new test path
                localStorage.setItem('lastSource', appSettings.lastSource); // Store the lastSource in local storage
                localStorage.setItem('source', value); // Store the new source in local storage
                window.location.href = 'quiz.html'; // Navigate to the quiz page
            };
            container.appendChild(button);
        });
    });
}