let questions = [];
let currentIndex = 0;

function parseQuestions(markdownText, fromIndex, toIndex) {
    const questionBlocks = markdownText.split('### ').slice(1); // Skip the preamble
    return questionBlocks.slice(fromIndex, toIndex).map(block => {
        const lines = block.split('\n').filter(line => line.trim());
        const question = lines[0].trim();
        const options = lines.slice(1, -1).map(line => ({
            text: line.slice(6).trim(), // Remove markdown list characters
            isCorrect: line.trim().startsWith('[x]')
        }));
        return { question, options };
    });
}

function loadQuestionsRange(fromIndex, toIndex) {
    // Load questions within the range, ensuring not to exceed the available questions
    const endIndex = Math.min(toIndex, questions.length);
    return parseQuestions(questionsMarkdown, fromIndex, endIndex);
}