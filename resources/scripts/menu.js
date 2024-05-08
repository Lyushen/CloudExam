import { appSettings,toggleShuffleQuestions,toggleShuffleAnswers} from './app.js';

export function menuInitialization() {
    document.querySelector('#menu-toggle').addEventListener('click', toggleMenu);
    document.querySelector('.theme-switcher').addEventListener('click', toggleTheme);
    document.querySelector('.reset-cache').addEventListener('click', resetCache);
    document.querySelector('.shuffle-questions-flag').addEventListener('click', toggleShuffleQuestions);
    document.querySelector('.shuffle-answers-flag').addEventListener('click', toggleShuffleAnswers);
}

// Toggle the menu visibility
function toggleMenu() {
    var menu = document.getElementById('menu');
    menu.style.maxHeight = menu.style.maxHeight ? null : menu.scrollHeight + "px";
    menu.style.borderColor = menu.style.maxHeight ? '#ccc' : 'transparent';
}

// Toggle between dark and light themes
function toggleTheme() {
    const newTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    appSettings.theme = newTheme;
    document.body.className = newTheme;
}

// Reset the localStorage cache and reload the page
function resetCache() {
    localStorage.clear();
    window.location.reload();
}
