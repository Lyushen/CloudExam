import { initializeSwipeHandling } from './swipe.js';
import { initializeAppSettings, addControlEventListeners,getAndParseInitialQuestions} from './app.js';
import { menuInitialization } from './menu.js';
import { manageCookies } from './cookies.js';

document.addEventListener("DOMContentLoaded", async function() {
    menuInitialization();
    initializeAppSettings();
    await getAndParseInitialQuestions();
    manageCookies();
    addControlEventListeners();
    initializeSwipeHandling();
});