document.getElementById('setup-form').onsubmit = function(event) {
    event.preventDefault();
    const numQuestions = document.getElementById('num-questions').value;
    window.location.href = `quiz.html?num=${numQuestions}`;
};
