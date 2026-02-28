function isCoreSubject(subject) {
    const s = subject.toLowerCase();
    const excludeKeywords = [
        "arabic", "assamese", "bengali", "bhoti", "bhutia", "bodo", "french", "german", "gujarati", "gurung",
        "japanese", "kannada", "kashmiri", "kokborok", "lepcha", "limboo", "malayalam", "manipuri", "marathi",
        "mizo", "nepali", "odia", "persian", "punjabi", "rai", "russian", "sherpa", "sindhi", "spanish", "tamang",
        "tamil", "tangkhul", "telugu", "thai", "tibetan", "urdu",
        "art", "music", "painting", "home science", "physical education", "ncc", "work experience",
        "book keeping", "business", "vocational", "accountancy", "typing", "shorthand"
    ];
    for (const ex of excludeKeywords) {
        const regex = new RegExp(`\\b${ex}\\b`, "i");
        if (regex.test(subject)) return false;
    }
    const coreKeywords = [
        "math", "algebra", "geometry", "statistics", "calculus",
        "science", "physics", "chemistry", "biology", "evs", "environmental",
        "history", "geography", "civics", "economics", "political science", "social",
        "english", "hindi", "sanskrit",
        "computer", "ai", "artificial intelligence", "ict", "it"
    ];
    return coreKeywords.some(keyword => {
        if (keyword.length <= 2) {
            const regex = new RegExp(`\\b${keyword}\\b`, "i");
            return regex.test(subject);
        }
        return s.includes(keyword);
    });
}

// Mocking getSubjects with the new logic
function getSubjects(boardData) {
    const allSubjects = Object.keys(boardData);
    return allSubjects.filter(subject =>
        isCoreSubject(subject) && boardData[subject].length > 0
    );
}

const cbse9 = {
    "Mathematics": ["Ch1"],
    "Science": ["Ch1"],
    "Social Science (History)": ["Ch1"],
    "Social Science (Geography)": ["Ch1"],
    "Social Science (Civics)": ["Ch1"],
    "Social Science (Economics)": ["Ch1"],
    "English": ["Ch1"],
    "Computer Applications": [],
    "English - Language and Literature": [],
    "English Communicative": [],
    "Hindi Course-A": [],
    "Hindi Course-B": [],
    "Sanskrit": [],
    "Sanskrit Communiucative": [],
    "Social Science": [],
};

const result = getSubjects(cbse9);
console.log('Result for CBSE 9:', result);

const expected = ["Mathematics", "Science", "Social Science (History)", "Social Science (Geography)", "Social Science (Civics)", "Social Science (Economics)", "English"];
const isCorrect = JSON.stringify(result.sort()) === JSON.stringify(expected.sort());

if (isCorrect) {
    console.log('✅ CLEANUP VERIFIED: CBSE list is exactly as expected.');
} else {
    console.log('❌ CLEANUP FAILED: Result:', result);
}
