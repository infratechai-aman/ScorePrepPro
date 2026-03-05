import { constructPrompt } from './lib/prompts';

const prompt = constructPrompt('cbse', '10', 'Science', 'Chemical Reactions', { totalMarks: 80 });

console.log(prompt);
