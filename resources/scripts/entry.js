import { initializeSwipeHandling } from './swipe.js';
import { initializeAppSettings, manageCookies,addEventListeners} from './app.js';

document.addEventListener("DOMContentLoaded", async function() {
    await initializeAppSettings();
    manageCookies();
    addEventListeners();
    initializeSwipeHandling();
});
