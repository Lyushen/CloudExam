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
    if (!document.fullscreenElement &&    // Standard syntax
        !document.mozFullScreenElement && // Firefox
        !document.webkitFullscreenElement && // Chrome, Safari and Opera
        !document.msFullscreenElement) { // IE/Edge
        
        const docEl = document.documentElement;

        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.msRequestFullscreen) { /* IE/Edge */
            docEl.msRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) { /* Firefox */
            docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            docEl.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }

        // Additional CSS for better fullscreen experience on mobile
        docEl.style.height = '100vh';
        docEl.style.overflow = 'hidden';
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

        // Revert CSS changes
        docEl.style.height = '';
        docEl.style.overflow = '';
    }
}