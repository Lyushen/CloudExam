const fs = require('fs');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const parseQuestionsFromMarkdown = (markdown) => {
    const tokens = md.parse(markdown);
    const questions = [];
    let currentQuestion = null;

    tokens.forEach(token => {
        if (token.type === 'heading_open' && token.tag === 'h3') {
            currentQuestion = { question: '', answers: [], correct: null };
        } else if (token.type === 'inline' && currentQuestion) {
            if (token.content.startsWith('- [')) {
                const isCorrect = token.content[3] === 'x';
                const answerText = token.content.slice(6, -1);
                currentQuestion.answers.push(answerText);
                if (isCorrect) currentQuestion.correct = currentQuestion.answers.length - 1;
            } else {
                currentQuestion.question = token.content;
            }
        } else if (token.type === 'heading_close' && token.tag === 'h3') {
            questions.push(currentQuestion);
        }
    });

    return questions;
};

const markdownPath = 'resources/readme.md'; // Path to your markdown file
let markdownContent;

try {
    markdownContent = fs.readFileSync(markdownPath, 'utf8');
} catch (e) {
    console.error(`Could not read the markdown file at ${markdownPath}:`, e);
    process.exit(1);
}

const questions = parseQuestionsFromMarkdown(markdownContent);
console.log(JSON.stringify(questions, null, 2));
