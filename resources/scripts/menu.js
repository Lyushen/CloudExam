import { appSettings,toggleShuffleQuestions,toggleShuffleAnswers} from './app.js';

export function menuInitialization() {
    document.querySelector('#menu-toggle').addEventListener('click', toggleMenu);
    document.querySelector('.theme-switcher').addEventListener('click', toggleTheme);
    document.querySelector('.reset-cache').addEventListener('click', resetCache);
    document.querySelector('.shuffle-questions-flag').addEventListener('click', toggleShuffleQuestions);
    document.querySelector('.shuffle-answers-flag').addEventListener('click', toggleShuffleAnswers);
    document.querySelector('.home-page').addEventListener('click', goHome);
    document.querySelector('.fullscreen-mode').addEventListener('click', toggleFullscreen);
}

// Toggle the menu visibility
function toggleMenu2() {
    var menu = document.getElementById('menu');
    if (menu.style.maxHeight !== '0px' && menu.style.maxHeight) {
        // If maxHeight is not '0px' and not empty, close the menu
        menu.style.maxHeight = '0px'; // Close the menu
        menu.style.borderColor = 'transparent'; // Hide border
    } else {
        // If maxHeight is '0px' or empty, open the menu
        menu.style.maxHeight = menu.scrollHeight + 'px'; // Set maxHeight to enable transition
        menu.style.borderColor = '#ccc'; // Show border
    }
}
function toggleMenu() {
    var menu = document.getElementById('menu');
    if (menu.classList.contains('open')) {
        menu.classList.remove('open'); // Close the menu
    } else {
        menu.classList.add('open'); // Open the menu
    }
}


// Toggle between dark and light themes
function toggleTheme() {
    const newTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    appSettings.theme = newTheme;
    document.body.className = newTheme;
    toggleMenu();
}

// Reset the localStorage cache and reload the page
function resetCache() {
    localStorage.clear();
    window.location.reload(true);
    toggleMenu();
}

function goHome(){
    window.location.href = 'index.html';
    toggleMenu();
}

function toggleFullscreen() {
    toggleMenu();
const docEl = document.documentElement;
    if (!document.fullscreenElement &&    // Standard syntax
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement) { // IE/Edge

        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.msRequestFullscreen) { /* IE/Edge */
            docEl.msRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) { /* Firefox */
            docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            docEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        }
    }
}