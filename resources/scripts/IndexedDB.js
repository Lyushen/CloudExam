import { showPopup } from './app.js';

const dbName = 'QuestionsDB';
const storeName = 'questions';

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            showPopup('Database error: ' + event.target.errorCode);
            reject('Database error: ' + event.target.errorCode);
        };
    });
}

export function clearQuestions(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            showPopup('Clear error: ' + event.target.errorCode);
            reject('Clear error: ' + event.target.errorCode);
        };
    });
}

export function saveQuestion(db, question, index) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        question.id = index;
        const request = store.put(question);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            showPopup('Save error: ' + event.target.errorCode);
            reject('Save error: ' + event.target.errorCode);
        };
    });
}

export function getQuestion(db, index) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(index);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            showPopup('Read error: ' + event.target.errorCode);
            reject('Read error: ' + event.target.errorCode);
        };
    });
}

export function getQuestionsCount(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            showPopup('Count error: ' + event.target.errorCode);
            reject('Count error: ' + event.target.errorCode);
        };
    });
}
