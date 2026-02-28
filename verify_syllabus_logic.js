const fs = require('fs');
const path = require('path');

// Mock a simple version of getSubjects by reading the file and extracting the logic or just requiring if possible
// But lib/syllabus.ts is ESM. So let's just read it as text and extract SYLLABUS_DB if needed?
// Actually simpler: I'll just check if the file contains the new logic.

const syllabusPath = path.join(__dirname, 'lib', 'syllabus.ts');
const content = fs.readFileSync(syllabusPath, 'utf8');

console.log('--- Checking lib/syllabus.ts for Core Subject Filtering ---');

if (content.includes('function isCoreSubject')) {
    console.log('✅ isCoreSubject helper found.');
} else {
    console.log('❌ isCoreSubject helper NOT found.');
}

if (content.includes('allSubjects.filter(isCoreSubject)')) {
    console.log('✅ getSubjects is using the filter.');
} else {
    console.log('❌ getSubjects is NOT using the filter.');
}

// Extract the keywords to verify
const keywordsMatch = content.match(/const coreKeywords = \[([\s\S]*?)\];/);
if (keywordsMatch) {
    console.log('\nCore Keywords defined:');
    console.log(keywordsMatch[1].trim());
} else {
    console.log('❌ coreKeywords array NOT found.');
}
