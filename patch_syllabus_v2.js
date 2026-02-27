const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, 'lib', 'syllabus.ts');
let content = fs.readFileSync(syllabusPath, 'utf8');

const cbseSubjects = JSON.parse(fs.readFileSync('cbse_subjects_scraped.json', 'utf8'));

const classes5to8 = cbseSubjects.classes_5_to_8;
const classes9to10 = cbseSubjects.secondary_9_10;

const cbseStartIndex = content.indexOf('"cbse": {');
const icseStartIndex = content.indexOf('"icse": {');

let cbseBlock = content.substring(cbseStartIndex, icseStartIndex);

function injectSubjects(classStr, newSubjects) {
    const searchString = `"${classStr}": {`;
    const classIdx = cbseBlock.indexOf(searchString);
    if (classIdx === -1) return;

    // Find the end of this class block (the closing '        },')
    const endIdx = cbseBlock.indexOf('        },', classIdx);
    if (endIdx === -1) return;

    let block = cbseBlock.substring(classIdx, endIdx);

    let toAdd = "";
    for (const sub of newSubjects) {
        if (!block.includes(`"${sub}":`)) {
            toAdd += `            "${sub}": [],\n`;
        }
    }

    if (toAdd) {
        if (!block.trim().endsWith(',')) {
            block += ',';
        }
        if (!block.endsWith('\n')) {
            block += '\n';
        }
        block += toAdd;
    }

    cbseBlock = cbseBlock.substring(0, classIdx) + block + cbseBlock.substring(endIdx);
}

injectSubjects('5', classes5to8);
injectSubjects('6', classes5to8);
injectSubjects('7', classes5to8);
injectSubjects('8', classes5to8);
injectSubjects('9', classes9to10);
injectSubjects('10', classes9to10);

content = content.substring(0, cbseStartIndex) + cbseBlock + content.substring(icseStartIndex);
fs.writeFileSync(syllabusPath, content);
console.log('Syllabus patched successfully round 2');
