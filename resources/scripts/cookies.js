import { appSettings } from './app.js';

// Helper function to get cookie by name
export function getCookie(name) {
    const cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

export function setCookie(name, value) {
    const expires = new Date(Date.now() + 180 * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=Strict`;
}

// Retrieve the current question index from cookies
export function getCurrentQuestionFromCookies() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('currentQuestion='))
        ?.split('=')[1];

    return cookieValue ? parseInt(decodeURIComponent(cookieValue), 10) : 0;
}

// Manage cookies with secure settings
export function manageCookies() {
    setCookie('shuffleQuestions', appSettings.shuffleQuestions.toString());
    setCookie('shuffleAnswers', appSettings.shuffleAnswers.toString());
    setCookie('currentQuestion', appSettings.currentQuestion.toString());
}
