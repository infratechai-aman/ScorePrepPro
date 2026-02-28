function isCoreSubject(subject) {
    const s = subject.toLowerCase();

    // 1. Explicitly Exclude (Blacklist) - Using word boundaries (\b) to avoid partial matches
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

    // 2. Whitelist Core Terms
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

const ssc9 = ["Mathematics Part-I (Algebra)", "Mathematics Part-II (Geometry)", "Science and Technology Part-1", "Science and Technology Part-2", "History and Political Science", "Geography"];
const cbse9 = ["Mathematics", "Science", "English", "Thai", "Arabic", "History", "Painting"];

console.log('--- SSC 9 ---');
ssc9.forEach(s => console.log(`${s}: ${isCoreSubject(s)}`));

console.log('\n--- CBSE 9 ---');
cbse9.forEach(s => console.log(`${s}: ${isCoreSubject(s)}`));
