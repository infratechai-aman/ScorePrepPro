const { getSubjects, SYLLABUS_DB } = require('./lib/syllabus');

function check(board, grade) {
    console.log(`\nBoard: ${board}, Grade: ${grade}`);
    const subjects = getSubjects(board, grade);
    console.log('Filtered Subjects:', subjects);

    // Check if any empty subjects leaked through
    const boardData = SYLLABUS_DB[board][grade];
    const leaked = subjects.filter(s => boardData[s].length === 0);
    if (leaked.length > 0) {
        console.log('❌ Error: Empty subjects found:', leaked);
    } else {
        console.log('✅ Success: No empty subjects found.');
    }
}

check('cbse', '9');
check('maharashtra', '9');
check('icse', '9');
check('cbse', '5');
