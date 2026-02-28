function isCoreSubject(subject) {
    const s = subject.toLowerCase();

    // 1. Explicitly Exclude (Languages and Extracurriculars)
    const excludeKeywords = [
        "arabic", "assamese", "bengali", "bhoti", "bhutia", "bodo", "french", "german", "gujarati", "gurung",
        "japanese", "kannada", "kashmiri", "kokborok", "lepcha", "limboo", "malayalam", "manipuri", "marathi",
        "mizo", "nepali", "odia", "persian", "punjabi", "rai", "russian", "sherpa", "sindhi", "spanish", "tamang",
        "tamil", "tangkhul", "telugu", "thai", "tibetan", "urdu",
        "art education", "music", "painting", "home science", "physical education", "ncc", "work experience",
        "book keeping", "business", "vocational", "accountancy"
    ];

    for (const ex of excludeKeywords) {
        if (s.includes(ex)) {
            console.log(`  [Excluded] "${subject}" matched "${ex}"`);
            return false;
        }
    }

    const coreKeywords = [
        "math", "algebra", "geometry", "statistics", "calculus",
        "science", "physics", "chemistry", "biology", "evs", "environmental",
        "history", "geography", "civics", "economics", "political science", "social",
        "english", "hindi", "sanskrit",
        "computer", "ai", "artificial intelligence", "ict", "it"
    ];

    const matched = coreKeywords.find(keyword => s.includes(keyword));
    if (matched) {
        console.log(`  [Kept] "${subject}" matched "${matched}"`);
        return true;
    }

    console.log(`  [Dropped] "${subject}" did not match any core keywords`);
    return false;
}

const ssc9 = ["Mathematics Part-I (Algebra)", "Mathematics Part-II (Geometry)", "Science and Technology Part-1", "Science and Technology Part-2", "History and Political Science", "Geography"];
const cbse9 = ["Mathematics", "Science", "English", "Thai", "Arabic", "History", "Painting"];

console.log('--- TESTING SSC 9 ---');
ssc9.forEach(isCoreSubject);

console.log('\n--- TESTING CBSE 9 ---');
cbse9.forEach(isCoreSubject);
