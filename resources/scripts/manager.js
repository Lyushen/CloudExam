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
    // Assuming appSettings.list is an array of objects
    appSettings.list.forEach(testEntry => {
        // Loop through each entry in the array
        Object.entries(testEntry).forEach(([id, testDetails]) => {
            // Create a button for each test
            const button = document.createElement('button');
            button.textContent = testDetails.name; // Set the button text to the test's name
            button.onclick = () => {
                // Set up the button's onclick behavior
                appSettings.lastSource = appSettings.source; // Store the current source as the last source
                appSettings.source = testDetails.internal_url; // Update the source to the new test's internal URL
                localStorage.setItem('lastSource', appSettings.lastSource); // Save lastSource in local storage
                localStorage.setItem('source', testDetails.internal_url); // Save the new source in local storage
                window.location.href = 'quiz.html'; // Navigate to the quiz page
            };
            container.appendChild(button); // Append the button to the container
        });
    });
}