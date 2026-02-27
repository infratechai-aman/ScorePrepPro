const fs = require('fs');
const path = require('path');

const patternsPath = path.join(__dirname, 'lib', 'patterns.ts');
let content = fs.readFileSync(patternsPath, 'utf8');

const cbseBlockStart = content.indexOf('cbse: {');
const icseBlockStart = content.indexOf('maharashtra: {'); // Next block

let cbseBlock = content.substring(cbseBlockStart, icseBlockStart);

// Extract class9 block
const class9Start = cbseBlock.indexOf('class9: {');
let braces = 0;
let class9End = -1;

for (let i = class9Start; i < cbseBlock.length; i++) {
    if (cbseBlock[i] === '{') braces++;
    if (cbseBlock[i] === '}') braces--;

    if (braces === 0 && cbseBlock[i] === '}') {
        class9End = i + 1;
        break;
    }
}

const class9Block = cbseBlock.substring(class9Start, class9End);

// Duplicate for 5, 6, 7, 8
const class5Block = class9Block.replace('class9: {', 'class5: {') + ',\n        ';
const class6Block = class9Block.replace('class9: {', 'class6: {') + ',\n        ';
const class7Block = class9Block.replace('class9: {', 'class7: {') + ',\n        ';
const class8Block = class9Block.replace('class9: {', 'class8: {') + ',\n        ';

const toInject = class5Block + class6Block + class7Block + class8Block;

cbseBlock = cbseBlock.substring(0, class9Start) + toInject + cbseBlock.substring(class9Start);
content = content.substring(0, cbseBlockStart) + cbseBlock + content.substring(icseBlockStart);

fs.writeFileSync(patternsPath, content);
console.log('Patterns patched successfully');
