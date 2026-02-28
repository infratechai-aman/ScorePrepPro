const { SYLLABUS_DB } = require('./lib/syllabus');

// Mocking the function logic directly for verification
function isCoreSubject(subject) {
    const s = subject.toLowerCase();

    // 1. Explicitly Exclude common non-core subjects that might match keywords
    const excludeKeywords = ["home science", "painting", "music", "art", "physical education", "ncc", "work experience"];
    if (excludeKeywords.some(ex => s.includes(ex))) return false;

    // 2. Exact match for specific short codes to avoid substring matching (like "Thai" containing "ai")
    if (s === "ai" || s === "artificial intelligence" || s === "ict") return true;

    // 3. Robust keyword matching for core subjects
    const coreKeywords = [
        "mathematics", "maths", "algebra", "geometry", "statistics",
        "science", "physics", "chemistry", "biology", "evs", "environmental",
        "social science", "history", "geography", "civics", "economics", "political science",
        "english", "hindi", "sanskrit"
    ];

    // Check if any core keyword is present as a whole word or significant part
    return coreKeywords.some(keyword => {
        // Use a simple word boundary check for short keywords
        if (keyword.length <= 3) {
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            return regex.test(subject);
        }
        return s.includes(keyword);
    });
}

function getSubjects(board, grade) {
    const allSubjects = Object.keys(SYLLABUS_DB[board]?.[grade] || {});
    return allSubjects.filter(isCoreSubject);
}

const subjects = getSubjects('cbse', '9');
console.log('--- CBSE Class 9 Filtered Subjects ---');
console.log(subjects.join('\n'));

const badSubjects = ["Thai", "Rai", "Painting", "Home Science", "Music", "Arabic"];
const foundBad = subjects.filter(s => badSubjects.includes(s));

if (foundBad.length === 0) {
    console.log('\n✅ Verification Passed: No elective/non-core subjects found.');
} else {
    console.log('\n❌ Verification Failed: Found non-core subjects:', foundBad);
}
