const SYLLABUS_DB = {
    "maharashtra": {
        "9": {
            "Mathematics Part-I (Algebra)": [],
            "Mathematics Part-II (Geometry)": [],
            "Science and Technology Part-1": [],
            "Science and Technology Part-2": [],
            "History and Political Science": [],
            "Geography": []
        }
    },
    "cbse": {
        "9": {
            "Mathematics": [],
            "Science": [],
            "Social Science (History)": [],
            "Social Science (Geography)": [],
            "History": [],
            "Geography": [],
            "English": [],
            "Thai": [],
            "Arabic": [],
            "Home Science": [],
            "Painting": []
        }
    }
};

function isCoreSubject(subject) {
    const s = subject.toLowerCase();

    // 1. Explicitly Exclude
    const excludeKeywords = ["home science", "painting", "music", "art", "physical education", "ncc", "work experience", "thai", "arabic", "assamese", "bengali", "bhoti", "bhutia", "bodo", "french", "german", "gujarati", "japanese", "kannada", "malayalam", "marathi"];
    if (excludeKeywords.some(ex => s.includes(ex))) return false;

    // 2. Exact match for short types
    if (s === "ai" || s === "artificial intelligence" || s === "ict" || s === "it") return true;

    // 3. Core Keywords
    const coreKeywords = [
        "mathematics", "maths", "algebra", "geometry", "statistics",
        "science", "physics", "chemistry", "biology", "evs", "environmental",
        "social science", "history", "geography", "civics", "economics", "political science",
        "english", "hindi", "sanskrit"
    ];

    return coreKeywords.some(keyword => s.includes(keyword));
}

console.log('--- SSC 9 Results ---');
console.log(Object.keys(SYLLABUS_DB.maharashtra["9"]).filter(isCoreSubject));

console.log('\n--- CBSE 9 Results ---');
console.log(Object.keys(SYLLABUS_DB.cbse["9"]).filter(isCoreSubject));
