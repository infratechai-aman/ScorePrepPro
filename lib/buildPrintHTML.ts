/**
 * buildPrintHTML.ts  — v2 (Complete Rewrite)
 *
 * Converts AI-generated paper markdown into a complete, self-contained HTML document.
 * Renders exactly like a traditional Indian board examination paper.
 *
 * Fixes in v2:
 *  - Parser regex handles **Q.1** text (space after closing **) correctly
 *  - print-color-adjust:exact forces navy section bars to print
 *  - KaTeX CDN for beautiful math rendering ($...$)
 *  - Screen view shows A4 pages on gray background (document viewer effect)
 *  - Chapter display truncated to prevent header overflow
 *  - Multiple page visual separators
 */

import { replaceFigTags } from './diagramSVG';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrintMeta {
    instituteName?: string;
    board: string;
    grade: string;
    subject: string;
    chapters?: string | string[];
    totalMarks?: number | string;
    duration?: string;
    paperType: 'subjective' | 'objective' | 'worksheet';
    difficulty?: string;
}

interface ParsedQuestion {
    number: string;
    text: string;
    marks: string;
    options: string[];
    subQs: string[];
    orText: string;
    isOR: boolean;
}

interface ParsedSection {
    title: string;
    subtitle: string;
    questions: ParsedQuestion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function estimateDuration(marks: number): string {
    if (marks <= 20) return '30 Minutes';
    if (marks <= 40) return '1½ Hours';
    if (marks <= 60) return '2 Hours';
    return '3 Hours';
}

function boardLabel(board: string): string {
    if (board === 'maharashtra') return 'Maharashtra State Board (SSC)';
    if (board === 'cbse') return 'Central Board of Secondary Education (CBSE)';
    if (board === 'icse') return 'Indian Certificate of Secondary Education (ICSE)';
    return board.toUpperCase();
}

function paperTypeLabel(type: string): string {
    if (type === 'objective') return 'OBJECTIVE QUESTION PAPER';
    if (type === 'worksheet') return 'WORKSHEET';
    return 'QUESTION PAPER';
}

function capWords(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

/** Escape HTML entities in plain text (but NOT in already-processed SVG) */
function esc(s: string): string {
    return String(s)
        .replace(/&(?!amp;|lt;|gt;|#\d+;|nbsp;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Convert inline markdown (bold, italic, code) + FIG tags → HTML */
function inlineMarkdown(text: string): string {
    // Restore SVG from FIG tags first
    text = replaceFigTags(text);
    // Escape HTML in plain-text parts only (not SVG)
    text = text.replace(/(<svg[\s\S]*?<\/svg>)|([^<]+)/g, (_m, svg, plain) => {
        if (svg) return svg;
        if (plain) return esc(plain);
        return '';
    });
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Code
    text = text.replace(/`([^`]+)`/g, '<code style="font-family:monospace;font-size:0.9em;background:#f0f0f0;padding:1px 3px;border-radius:2px;">$1</code>');
    return text;
}

// ─── Markdown Parser ──────────────────────────────────────────────────────────

const MARKS_PAT = /\[(\d+(?:\.\d+)?)\s*[Mm]arks?\]|\[(\d+(?:\.\d+)?)\]/;

function parseMarkdown(markdown: string): { headerLines: string[]; sections: ParsedSection[] } {
    const lines = markdown.split('\n').map(l => l.trimEnd());
    const sections: ParsedSection[] = [];
    const headerLines: string[] = [];
    let inHeader = true;
    let currentSection: ParsedSection | null = null;
    let currentQ: ParsedQuestion | null = null;

    const flushQ = () => {
        if (currentQ && currentSection) {
            currentSection.questions.push(currentQ);
            currentQ = null;
        }
    };
    const flushSection = () => {
        flushQ();
        if (currentSection) { sections.push(currentSection); currentSection = null; }
    };

    for (const raw of lines) {
        const l = raw.trim();
        if (!l) continue;

        // ── Markdown heading
        if (/^#{1,4}\s/.test(l)) {
            const heading = l.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();

            // Section heading (SECTION A, Q.1(A), PART I, etc.)
            if (/^(SECTION|PART\s+[IVX\d]|Q\.\d)/i.test(heading)) {
                flushSection();
                inHeader = false;
                const parenMatch = heading.match(/^(.+?)\s*[\(（](.+?)[\)）]$/);
                const dashMatch = heading.match(/^([^—\-]+)\s*[—\-]+\s*(.+)$/);
                let title = heading, subtitle = '';
                if (parenMatch) { title = parenMatch[1].trim(); subtitle = parenMatch[2].trim(); }
                else if (dashMatch) { title = dashMatch[1].trim(); subtitle = dashMatch[2].trim(); }
                currentSection = { title, subtitle, questions: [] };
            } else {
                if (inHeader) headerLines.push(heading);
            }
            continue;
        }

        // ── Horizontal rule — skip
        if (/^[-=*]{3,}$/.test(l)) continue;

        // ── Header lines
        if (inHeader) {
            const clean = l.replace(/\*+/g, '').replace(/^[-•]\s*/, '').trim();
            if (clean) headerLines.push(clean);
            continue;
        }

        if (!currentSection) {
            currentSection = { title: '', subtitle: '', questions: [] };
        }

        // ── OR divider
        if (/^\*?\(?\s*OR\s*\)?\*?$/i.test(l)) {
            if (currentQ) currentQ.isOR = true;
            continue;
        }

        // ── Standalone marks line (e.g. **[1 Mark(s)]** on its own) — skip
        if (/^\*{0,2}\[\d+\s*[Mm]arks?\]\*{0,2}$/.test(l)) {
            continue;
        }

        // ── Question detection
        // Handles: **Q.1** text, Q.1 text, **1.** text, 1. text, **Q.1 (A)** text
        const qMatch = l.match(
            /^(?:\*{0,2})\s*(?:Q\.?\s*)?(\d+)\s*(?:\([A-Za-z]\))?\s*(?:\*{0,2})\s*[\s\.:\)]/i
        );
        if (qMatch) {
            // Confirm it's actually a question and not something like "(a) option"
            // by checking the digit is at the START of the line
            const digitPos = l.search(/\d/);
            const parenPos = l.search(/\(/);
            if (parenPos < 0 || digitPos <= parenPos || digitPos < 5) {
                // Likely a real question
                flushQ();
                // Clean the question text: remove Q.N, **, [marks]
                let qText = l
                    .replace(/^\*{0,2}\s*Q?\.?\s*\d+\s*(?:\([A-Za-z]\))?\s*\*{0,2}[\s\.:)]?\s*/i, '')
                    .replace(/\*+/g, '')
                    .trim();
                const marksM = qText.match(MARKS_PAT);
                qText = qText.replace(MARKS_PAT, '').trim();
                currentQ = {
                    number: qMatch[1],
                    text: qText,
                    marks: marksM ? (marksM[1] || marksM[2]) : '',
                    options: [],
                    subQs: [],
                    orText: '',
                    isOR: false
                };
                continue;
            }
        }

        if (currentQ) {
            // ── MCQ options (inline): "(a) Opt1  (b) Opt2  (c) Opt3  (d) Opt4"
            const inlineOpts = l.match(/\(([a-dA-D])\)\s+([^(]+)/g);
            if (inlineOpts && inlineOpts.length >= 2) {
                currentQ.options = inlineOpts.map(s => s.trim());
                continue;
            }

            // ── Single option line: "(a) Option text"
            const singleOpt = l.match(/^\(([a-dA-D])\)\s+(.+)$/);
            if (singleOpt) {
                currentQ.options.push(`(${singleOpt[1]}) ${singleOpt[2]}`);
                continue;
            }

            // ── Sub-questions: "(i)", "(ii)", "(1)" etc.
            const subQ = l.match(/^\(([ivxIVX\d]+)\)\s+(.+)$/);
            if (subQ) {
                currentQ.subQs.push(`(${subQ[1]}) ${subQ[2]}`);
                continue;
            }

            // ── OR alternate question text
            if (currentQ.isOR && !currentQ.orText) {
                currentQ.orText = l.replace(/\*+/g, '').trim();
                continue;
            }

            // ── Continuation of question text
            const cont = l.replace(/\*+/g, '').replace(MARKS_PAT, '').trim();
            if (cont && !cont.startsWith('#')) {
                if (!currentQ.marks) {
                    const mm = l.match(MARKS_PAT);
                    if (mm) currentQ.marks = mm[1] || mm[2];
                }
                currentQ.text += ' ' + cont;
            }
        }
    }

    flushSection();
    return { headerLines, sections };
}

// ─── HTML Renderers ───────────────────────────────────────────────────────────

function renderOptions(options: string[]): string {
    if (!options.length) return '';
    // Two-column: (a)+(c) left, (b)+(d) right
    const cols: string[][] = [[], []];
    options.forEach((o, i) => { cols[i % 2].push(o); });
    return `<table class="opt-table"><tr>
        <td>${cols[0].map(o => `<div class="opt">${inlineMarkdown(o)}</div>`).join('')}</td>
        <td>${cols[1].map(o => `<div class="opt">${inlineMarkdown(o)}</div>`).join('')}</td>
    </tr></table>`;
}

function renderQuestion(q: ParsedQuestion, paperType: string, idx: number): string {
    const marks = q.marks ? `<span class="q-marks">[${esc(q.marks)}]</span>` : '';
    const qText = inlineMarkdown(q.text);

    let html = `<div class="question">`;
    html += `<div class="q-row"><span class="q-num">${idx}.</span><span class="q-body">${qText}${marks}</span></div>`;

    if (q.options.length) html += renderOptions(q.options);
    if (q.subQs.length) {
        html += `<div class="sub-qs">${q.subQs.map(s => `<div class="sub-q">${inlineMarkdown(s)}</div>`).join('')}</div>`;
    }

    if (q.isOR && q.orText) {
        html += `<div class="or-div"><span>OR</span></div>`;
        html += `<div class="q-row"><span class="q-num">${idx}(B).</span><span class="q-body">${inlineMarkdown(q.orText)}</span></div>`;
    }

    // Dotted answer lines for short worksheet/subjective questions
    const marksNum = parseFloat(q.marks || '0');
    if ((paperType === 'worksheet') && marksNum <= 2 && !q.options.length) {
        html += `<div class="ans-lines"><div class="ans-line"></div><div class="ans-line"></div></div>`;
    }

    html += `</div>`;
    return html;
}

function renderSection(sec: ParsedSection, paperType: string, startNum: number): string {
    if (!sec.title && !sec.questions.length) return '';

    let html = '';

    if (sec.title) {
        const cleanTitle = esc(sec.title.replace(/\[.*?\]/g, '').trim());
        const subtitle = sec.subtitle ? esc(sec.subtitle.replace(/\[.*?\]/g, '').trim()) : '';
        html += `<div class="section-header">
            <div class="section-title">${cleanTitle}</div>
            ${subtitle ? `<div class="section-sub">${subtitle}</div>` : ''}
        </div>`;
    }

    if (!sec.questions.length) return html;

    if (paperType === 'objective') {
        html += `<div class="mcq-cols">`;
        sec.questions.forEach((q, i) => { html += renderQuestion(q, paperType, startNum + i); });
        html += `</div>`;
    } else {
        sec.questions.forEach((q, i) => { html += renderQuestion(q, paperType, startNum + i); });
    }

    return html;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
/* ── Force background colors to print ── */
*, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

/* ── Page setup ── */
@page {
    size: A4;
    margin: 13mm 14mm 13mm 14mm;
}

/* ── Screen: document viewer (A4 pages on gray bg) ── */
@media screen {
    html { background: #d1d5db; min-height: 100vh; }
    body {
        background: white;
        width: 210mm;
        min-height: 297mm;
        margin: 20px auto;
        padding: 16mm 16mm 14mm;
        box-shadow: 0 4px 24px rgba(0,0,0,0.22);
        position: relative;
    }
}

/* ── Print ── */
@media print {
    html, body { background: white; margin: 0; padding: 0; }
}

/* ── Base typography ── */
body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #111;
}

/* ── Institute header ── */
.institute { text-align: center; font-size: 13pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
.board-name { text-align: center; font-size: 9pt; color: #2563eb; margin-bottom: 5px; }

/* ── Paper header fields ── */
.hdr-fields {
    display: flex;
    justify-content: space-between;
    font-size: 10pt;
    margin-bottom: 6px;
}
.hdr-col { display: flex; flex-direction: column; gap: 5px; }
.hdr-field { display: flex; align-items: baseline; gap: 4px; white-space: nowrap; }
.hdr-line { display: inline-block; width: 115px; border-bottom: 1px solid #111; }

/* ── Double rule ── */
.double-rule { border: none; border-top: 1px solid #111; box-shadow: 0 3px 0 #111; margin: 6px 0 5px; height: 0; }

/* ── Paper title ── */
.paper-subject { text-align: center; font-size: 15pt; font-weight: bold; letter-spacing: 2px; margin: 4px 0 2px; text-transform: uppercase; }
.paper-chapter { text-align: center; font-size: 11pt; font-weight: bold; margin: 2px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.paper-type-box { display: table; margin: 6px auto; border: 1.5px solid #111; padding: 3px 22px; font-size: 10.5pt; font-weight: bold; letter-spacing: 1px; }

/* ── Meta row ── */
.meta-row {
    display: flex; justify-content: space-between;
    border-top: 1px solid #111; border-bottom: 1px solid #111;
    padding: 4px 6px; font-size: 10pt; margin: 6px 0;
}

/* ── Instructions ── */
.instructions { border: 1px solid #aaa; background: #fafafa; padding: 5px 10px; margin: 5px 0 8px; font-size: 9.5pt; }
.instr-title { font-weight: bold; margin-bottom: 3px; }
.instructions ul { padding-left: 18px; margin: 0; }
.instructions li { margin-bottom: 2px; }

/* ── Section header ── */
.section-header {
    background: #1a2744 !important;
    color: #fff !important;
    padding: 5px 10px;
    margin: 10px 0 5px;
    page-break-after: avoid;
    break-after: avoid;
}
.section-title { font-size: 10.5pt; font-weight: bold; letter-spacing: 0.5px; }
.section-sub { font-size: 9.5pt; font-style: italic; color: #ddd; text-align: center; margin-top: 2px; }

/* ── Questions ── */
.question { page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px; padding-bottom: 3px; }
.q-row { display: flex; gap: 5px; align-items: flex-start; }
.q-num { font-weight: bold; white-space: nowrap; flex-shrink: 0; min-width: 32px; font-size: 10.5pt; }
.q-body { flex: 1; font-size: 10.5pt; }
.q-marks { font-weight: bold; float: right; margin-left: 8px; font-size: 10pt; }

/* ── MCQ options — two column table ── */
.opt-table { width: 96%; margin: 3px 0 2px 32px; border-collapse: collapse; font-size: 10pt; }
.opt-table td { width: 50%; padding: 1px 4px 1px 0; vertical-align: top; }
.opt { margin-bottom: 1px; }

/* ── Objective 2-col layout ── */
.mcq-cols { column-count: 2; column-gap: 16px; column-rule: 1px solid #e5e7eb; }
.mcq-cols .question { break-inside: avoid; }

/* ── Sub-questions ── */
.sub-qs { margin: 3px 0 0 32px; font-size: 10pt; }
.sub-q { margin-bottom: 2px; }

/* ── OR divider ── */
.or-div {
    text-align: center; margin: 5px 0;
    font-weight: bold; font-size: 10pt; color: #555;
    position: relative;
}
.or-div::before, .or-div::after {
    content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: #bbb;
}
.or-div::before { left: 0; }
.or-div::after { right: 0; }

/* ── Answer lines (worksheet) ── */
.ans-lines { margin: 4px 0 0 32px; }
.ans-line { border-bottom: 1px dotted #999; margin-bottom: 12px; height: 0; }

/* ── Footer ── */
.paper-footer {
    margin-top: 18px; text-align: center; font-size: 11pt;
    font-weight: bold; letter-spacing: 2px;
    border-top: 1px solid #111; padding-top: 6px;
    page-break-inside: avoid;
}

/* ── KaTeX styling ── */
.katex { font-size: 1em !important; }
.katex-display { margin: 4px 0 !important; }

/* ── Diagrams ── */
svg { display: block; margin: 5px auto 3px; }
`;

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildPrintHTML(markdown: string, meta: PrintMeta): string {
    const { headerLines, sections } = parseMarkdown(markdown);

    const marks = Number(meta.totalMarks) || 40;
    const duration = meta.duration || estimateDuration(marks);
    const institute = (meta.instituteName || '').trim();
    const subject = capWords(meta.subject || '');
    const boardStr = boardLabel(meta.board);
    const ptLabel = paperTypeLabel(meta.paperType);

    // Chapter display: max 3 chapters then "+ N more"
    const chaps = Array.isArray(meta.chapters) ? meta.chapters : (meta.chapters ? [meta.chapters] : []);
    let chapterDisplay = '';
    if (chaps.length === 1) {
        chapterDisplay = capWords(chaps[0]);
    } else if (chaps.length > 1) {
        const shown = chaps.slice(0, 3).map(c => capWords(c.split(':')[0].trim())).join(', ');
        chapterDisplay = chaps.length > 3 ? `${shown} & ${chaps.length - 3} more chapters` : shown;
    }

    // Count total questions
    const totalQ = sections.reduce((s, sec) => s + sec.questions.length, 0);

    // Build sections HTML
    let qNum = 1;
    const sectionsHTML = sections.map(sec => {
        const html = renderSection(sec, meta.paperType, qNum);
        qNum += sec.questions.length;
        return html;
    }).join('\n');

    // ── Header HTML
    const headerHTML = `
<div class="hdr-fields">
    <div class="hdr-col">
        <div class="hdr-field"><span>Name :&nbsp;</span><span class="hdr-line"></span></div>
        <div class="hdr-field"><span>Std. :&nbsp;</span><span class="hdr-line"></span></div>
    </div>
    <div class="hdr-col" style="text-align:right;">
        <div class="hdr-field"><span>Roll No. :&nbsp;</span><span class="hdr-line"></span></div>
        <div class="hdr-field"><span>Date :&nbsp;</span><span class="hdr-line"></span></div>
    </div>
</div>
<hr class="double-rule"/>
<div class="paper-subject">${esc(subject)}</div>
${chapterDisplay ? `<div class="paper-chapter">${esc(chapterDisplay)}</div>` : ''}
<div class="paper-type-box">${esc(ptLabel)}</div>
<div class="meta-row">
    <span><strong>Time :</strong> ${esc(duration)}</span>
    <span><strong>Marks :</strong> ${marks}</span>
    ${totalQ > 0 ? `<span><strong>Total Questions :</strong> ${totalQ}</span>` : ''}
</div>`;

    // ── Instructions HTML
    const instrHTML = `<div class="instructions">
    <div class="instr-title">Instructions :</div>
    <ul>
        <li>All questions are compulsory.</li>
        ${meta.paperType === 'objective'
            ? '<li>Each question carries 1 mark.</li><li>Choose the most appropriate option.</li>'
            : '<li>Marks are indicated against each question.</li><li>Draw neat diagrams wherever necessary.</li><li>Write legibly and clearly.</li>'
        }
    </ul>
</div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(subject)} — ${esc(ptLabel)}</title>
<!-- KaTeX for math rendering -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous"/>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"
    onload="renderMathInElement(document.body,{
        delimiters:[
            {left:'$$',right:'$$',display:true},
            {left:'$',right:'$',display:false},
            {left:'\\\\(',right:'\\\\)',display:false},
            {left:'\\\\[',right:'\\\\]',display:true}
        ],
        throwOnError:false,
        ignoredTags:['script','noscript','style','textarea','pre']
    });">
</script>
<style>${CSS}</style>
</head>
<body>
${institute ? `<div class="institute">${esc(institute)}</div><div class="board-name">${esc(boardStr)}</div>` : ''}
${headerHTML}
${instrHTML}
${sectionsHTML}
<div class="paper-footer">&#10022; &nbsp;&#10022; &nbsp;&#10022; &nbsp; ALL THE BEST &nbsp; &#10022; &nbsp;&#10022; &nbsp;&#10022;</div>
</body>
</html>`;
}
