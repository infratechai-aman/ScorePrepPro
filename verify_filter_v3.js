const subjects_cbse_9 = [
    "Mathematics", "Science", "Social Science (History)", "Social Science (Geography)",
    "Social Science (Civics)", "Social Science (Economics)", "English", "Arabic",
    "Art Education", "Assamese", "Bahasa Melayu", "Bengali", "Bhoti", "Bhutia",
    "Bodo", "Carnatic Music (Melodic Instruments)", "Carnatic Music (Percussion Instruments)",
    "Carnatic Music (Vocal)", "Computer Applications", "Elements of Book Keeping and Accountancy",
    "Elements of Business", "English - Language and Literature", "English Communicative",
    "French", "German", "Gujarati", "Gurung", "Health and Physical Education",
    "Hindi Course-A", "Hindi Course-B", "Hindustani Music (Melodic Instruments)",
    "Hindustani Music (Percussion Instruments)", "Hindustani Music (Vocal)", "Home Science",
    "Japanese", "Kannada", "Kashmiri", "Kokborok", "Lepcha", "Limboo", "Malayalam",
    "Manipuri", "Marathi", "Mizo", "National Cadet Corps (NCC)", "Nepali", "Odia",
    "Painting", "Persian", "Punjabi", "Rai", "Russian", "Sanskrit", "Sanskrit Communiucative",
    "Sherpa", "Sindhi", "Social Science", "Spanish", "Tamang", "Tamil", "Tangkhul",
    "Telugu AP", "Telugu Telangana", "Thai", "Tibetan", "Urdu Course A", "Urdu Course B",
    "Work Experience"
];

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

const filtered = subjects_cbse_9.filter(isCoreSubject);

console.log('--- Filtered Results ---');
console.log(filtered.join(', '));

const badSubjects = ["Thai", "Rai", "Painting", "Home Science", "Arabic", "Music"];
const foundBad = filtered.filter(s => {
    return badSubjects.some(b => s.toLowerCase().includes(b.toLowerCase()));
});

if (foundBad.length === 0) {
    console.log('\n✅ SUCCESS: No forbidden subjects found!');
} else {
    console.log('\n❌ FAILURE: Found forbidden subjects:', foundBad.join(', '));
}

// Check if core subjects are still there
const coreNeeded = ["Mathematics", "Science", "English", "Social Science (History)"];
const missingCore = coreNeeded.filter(c => !filtered.some(f => f.includes(c)));

if (missingCore.length === 0) {
    console.log('✅ SUCCESS: Core subjects preserved!');
} else {
    console.log('❌ FAILURE: Missing core subjects:', missingCore.join(', '));
}
