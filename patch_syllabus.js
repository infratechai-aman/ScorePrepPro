const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, 'lib', 'syllabus.ts');
let content = fs.readFileSync(syllabusPath, 'utf8');

const cbseSubjects = JSON.parse(fs.readFileSync('cbse_subjects_scraped.json', 'utf8'));

const classes5to8 = cbseSubjects.classes_5_to_8;
const classes9to10 = cbseSubjects.secondary_9_10;

// Helper to inject into a specific class within the CBSE block
function injectSubjects(classStr, newSubjects) {
    // We need to make sure we are only targeting the "cbse" block
    // The "cbse" block starts at `"cbse": {` and ends at `},` before `"icse"`

    const cbseStartIndex = content.indexOf('"cbse": {');
    const icseStartIndex = content.indexOf('"icse": {');

    let cbseBlock = content.substring(cbseStartIndex, icseStartIndex);

    const regex = new RegExp(`("${classStr}": \\{[\\s\\S]*?\\n\\s*)(\\},?\\n)`, 'm');
    cbseBlock = cbseBlock.replace(regex, (match, p1, p2) => {
        let toAdd = "";
        for (const sub of newSubjects) {
            if (!p1.includes(`"${sub}":`)) {
                toAdd += `            "${sub}": [],\n`;
            }
        }
        if (toAdd && !p1.trim().endsWith(',') && !p1.trim().endsWith('{')) {
            p1 = p1.replace(/([^,\s])(\s*)$/, '$1,$2');
        }
        toAdd = toAdd.replace(/,\n$/, '\n');
        return p1 + toAdd + p2;
    });

    content = content.substring(0, cbseStartIndex) + cbseBlock + content.substring(icseStartIndex);
}

injectSubjects('5', classes5to8);
injectSubjects('6', classes5to8);
injectSubjects('7', classes5to8);
injectSubjects('8', classes5to8);
injectSubjects('9', classes9to10);
injectSubjects('10', classes9to10);

// Remove 11 and 12 from CBSE
const cbseStartIndex = content.indexOf('"cbse": {');
const icseStartIndex = content.indexOf('"icse": {');
let cbseBlock = content.substring(cbseStartIndex, icseStartIndex);

// Match from "11": { ... } to the end of "12": { ... }
cbseBlock = cbseBlock.replace(/,\s*"11": \{[\s\S]*?\},\s*"12": \{[\s\S]*?\}/, '');

content = content.substring(0, cbseStartIndex) + cbseBlock + content.substring(icseStartIndex);

fs.writeFileSync(syllabusPath, content);
console.log('Syllabus patched successfully');
