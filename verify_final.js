const { getSubjects, SYLLABUS_DB } = require('./lib/syllabus');

function verify(board, grade) {
    console.log(`\n--- Verification for ${board.toUpperCase()} Class ${grade} ---`);
    const subjects = getSubjects(board, grade);
    console.log('Subjects:', subjects.join(', '));

    // Check for mandatory core subjects
    const mandatory = board === 'maharashtra'
        ? ["Mathematics Part-I", "Science and Technology Part-1", "History and Political Science", "Geography"]
        : ["Mathematics", "Science", "English", "History", "Geography"];

    const missing = mandatory.filter(m => !subjects.some(s => s.includes(m)));
    if (missing.length === 0) {
        console.log('✅ All mandatory core subjects found.');
    } else {
        console.log('❌ Missing core subjects:', missing.join(', '));
    }

    // Check for forbidden subjects
    const forbidden = ["Thai", "Arabic", "Painting", "Home Science", "Music", "Physical Education"];
    const foundForbidden = subjects.filter(s => forbidden.some(f => s.toLowerCase().includes(f.toLowerCase())));
    if (foundForbidden.length === 0) {
        console.log('✅ No forbidden elective subjects found.');
    } else {
        console.log('❌ Forbidden subjects found:', foundForbidden.join(', '));
    }
}

verify('maharashtra', '9');
verify('maharashtra', '10');
verify('cbse', '9');
verify('icse', '9');
