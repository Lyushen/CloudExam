document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const score = params.get('score');
    const total = params.get('total');
    displayResult(score, total);
});

function displayResult(score, total) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `<h2>Your Score: ${score}/${total}</h2>`;
}
