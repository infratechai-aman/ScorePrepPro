const { getSubjects } = require('./lib/syllabus');

function verify(board, grade) {
    console.log(`\n--- ${board.toUpperCase()} Class ${grade} ---`);
    const subjects = getSubjects(board, grade);
    console.log('Subjects:', subjects.join(', '));

    const mandatory = board === 'maharashtra'
        ? ["Mathematics Part-I", "Science and Technology Part-1"]
        : ["Mathematics", "Science"];

    const missing = mandatory.filter(m => !subjects.some(s => s.includes(m)));
    if (missing.length === 0) console.log('✅ Core found.');
    else console.log('❌ Missing:', missing);

    const forbidden = ["Thai", "Arabic", "Painting", "Home Science", "Music"];
    const found = subjects.filter(s => forbidden.some(f => s.toLowerCase().includes(f.toLowerCase())));
    if (found.length === 0) console.log('✅ Electives hidden.');
    else console.log('❌ Found electives:', found);
}

verify('maharashtra', '9');
verify('cbse', '9');
verify('icse', '9');
