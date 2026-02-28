import { getSubjects } from './lib/syllabus';

const testCases = [
    { board: 'cbse', grade: '9' },
    { board: 'cbse', grade: '10' },
    { board: 'maharashtra', grade: '9' },
    { board: 'icse', grade: '9' }
];

console.log('--- Subject Filtering Verification ---');

testCases.forEach(({ board, grade }) => {
    const subjects = getSubjects(board, grade);
    console.log(`\nBoard: ${board.toUpperCase()}, Class: ${grade}`);
    console.log(`Core Subjects found (${subjects.length}):`);
    console.log(subjects.join(', '));
});
