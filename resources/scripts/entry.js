import { initializeSwipeHandling } from './swipe.js';
import { initializeAppSettings, manageCookies,fetchAndParseQuestions,addEventListeners} from './app.js';

document.addEventListener("DOMContentLoaded", async function() {
    await initializeAppSettings();
    manageCookies();
    fetchAndParseQuestions();
    addEventListeners();
    initializeSwipeHandling();
});
