/**
 * buildPrintHTML.ts
 *
 * Converts AI-generated paper markdown into a complete, self-contained, print-ready HTML document.
 * Produces the exact traditional Indian board examination paper format.
 *
 * Supports: Subjective | Objective | Worksheet
 *
 * PDF is generated via window.print() — NO html2canvas (avoids blurry screenshots).
 * All CSS is embedded inline so the document is fully portable.
 */

import { replaceFigTags } from './diagramSVG';

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estimateDuration(marks: number): string {
    if (marks <= 20) return '30 Minutes';
    if (marks <= 40) return '1½ Hours';
    if (marks <= 60) return '2 Hours';
    if (marks <= 80) return '3 Hours';
    return '3 Hours';
}

function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, c => c.toUpperCase());
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

// ─── Markdown Escape & Inline Parsing ────────────────────────────────────────

/** Escape HTML special chars in plain text */
function esc(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Convert inline markdown (bold, italic, code) to HTML */
function inlineMarkdown(text: string): string {
    // Replace [FIG: ...] tags first with SVG
    text = replaceFigTags(text);
    // Then escape remaining HTML
    text = text
        .replace(/&(?!amp;|lt;|gt;|#)/g, '&amp;')
        .replace(/<(?!svg|\/svg|circle|line|polygon|path|text|rect|defs|g|\/g|\/circle|\/line|\/polygon|\/path|\/text|\/rect|\/defs)/gi, '&lt;');
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code style="font-family:monospace;background:#f0f0f0;padding:1px 4px;border-radius:2px;">$1</code>');
    return text;
}

// ─── Section / Question Parser ────────────────────────────────────────────────

interface ParsedQuestion {
    number: string;
    text: string;
    marks: string;
    options: string[];   // MCQ options: ["(a) ...", "(b) ...", ...]
    subQs: string[];     // Sub-questions: ["(i) ...", "(ii) ...", ...]
    orText: string;      // The "(OR)" alternate question text
    isOR: boolean;
    hasDiagram: boolean;
}

interface ParsedSection {
    title: string;
    subtitle: string;
    questions: ParsedQuestion[];
}

function parseMarkdownToSections(markdown: string): { sections: ParsedSection[]; headerLines: string[] } {
    const lines = markdown.split('\n').map(l => l.trimEnd());
    const sections: ParsedSection[] = [];
    const headerLines: string[] = [];
    let inHeader = true;
    let currentSection: ParsedSection | null = null;
    let currentQ: ParsedQuestion | null = null;

    // Flush current question into section
    const flushQ = () => {
        if (currentQ && currentSection) {
            currentSection.questions.push(currentQ);
            currentQ = null;
        }
    };

    // Flush current section into sections array
    const flushSection = () => {
        flushQ();
        if (currentSection) {
            sections.push(currentSection);
            currentSection = null;
        }
    };

    // Detect section headers (## Section A, ### Q.1 (A), etc.)
    const isSectionHeader = (l: string) =>
        /^#{1,3}\s*(SECTION|Q\.\d|Q\d|PART)/i.test(l) ||
        /^#{1,3}\s*[A-Z]\./i.test(l);

    // Detect question start: **Q.1**, Q.1, **1.**, 1. 
    const qPattern = /^(?:\*{0,2})(?:Q\.?\s*)?(\d+(?:\s*\([A-Za-z]\))?(?:\s*\.[A-Za-z]?)?)(?:\*{0,2})[\.\):\s]+(.*)$/;

    // Detect MCQ options: (a), (b), (c), (d)
    const optionPattern = /^\s*\(([a-dA-D])\)\s+(.+)$/;
    // Detect sub-question: (i), (ii), (iii)
    const subQPattern = /^\s*\(([ivxlIVXL]+|\d+)\)\s+(.+)$/;
    // Detect marks: [2], [2 marks], [2 Marks]
    const marksPattern = /\[(\d+(?:\.\d+)?(?:\s*[Mm]arks?)?)\]/;

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const l = raw.trim();

        if (!l) continue;

        // ── Section header detection
        if (/^#{1,3}\s/i.test(l)) {
            const heading = l.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();

            // If this is a "Section" heading, start new section
            if (/^(SECTION|PART|Q\.\d|Q\d|\*\*Q\.\d)/i.test(heading) || /^Q\.\d/i.test(heading)) {
                flushSection();
                inHeader = false;
                // Split title from subtitle if parentheses present
                const parenMatch = heading.match(/^(.+?)\s*[\(（](.+?)[\)）]$/);
                currentSection = {
                    title: parenMatch ? parenMatch[1].trim() : heading,
                    subtitle: parenMatch ? parenMatch[2].trim() : '',
                    questions: []
                };
                continue;
            }

            // Otherwise it's a generic heading (paper title, board info, etc.)
            if (inHeader) {
                headerLines.push(heading);
            }
            continue;
        }

        // ── Detect "---" or "===": horizontal rule → skip
        if (/^[-=]{3,}$/.test(l)) continue;

        // ── Collect header lines before first section
        if (inHeader) {
            // Strip markdown formatting for header
            const clean = l.replace(/\*+/g, '').replace(/^[-•]\s*/, '').trim();
            if (clean) headerLines.push(clean);
            continue;
        }

        // ── Ensure we have a section container
        if (!currentSection) {
            currentSection = { title: '', subtitle: '', questions: [] };
        }

        // ── Detect OR separator
        if (/^\*?\(?\s*OR\s*\)?\*?$/i.test(l)) {
            if (currentQ) currentQ.isOR = true;
            continue;
        }

        // ── Detect question number + text
        const qMatch = l.match(/^(?:\*{0,2})(?:Q\.?\s*)?(\d+(?:\s*\([A-Za-z]\))?)(?:\*{0,2})[\.:\)]\s*(.*)$/);
        if (qMatch) {
            flushQ();
            const qText = qMatch[2].replace(/\*+/g, '').trim();
            const marksM = qText.match(marksPattern) || l.match(marksPattern);
            currentQ = {
                number: qMatch[1].trim(),
                text: qText.replace(marksPattern, '').trim(),
                marks: marksM ? marksM[1] : '',
                options: [],
                subQs: [],
                orText: '',
                isOR: false,
                hasDiagram: qText.includes('[FIG:') || qText.includes('[DIAGRAM:')
            };
            continue;
        }

        // ── MCQ option line: (a) text (b) text OR (a) on its own line
        if (currentQ) {
            // Inline options: "(a) opt1  (b) opt2  (c) opt3  (d) opt4"
            const inlineOptions = l.match(/\(([a-dA-D])\)\s+([^(]+)/g);
            if (inlineOptions && inlineOptions.length >= 2) {
                currentQ.options = inlineOptions.map(s => s.trim());
                continue;
            }

            // Single option on its own line
            const singleOpt = l.match(/^\(([a-dA-D])\)\s+(.+)$/);
            if (singleOpt) {
                currentQ.options.push(`(${singleOpt[1]}) ${singleOpt[2]}`);
                continue;
            }

            // Sub-question: (i), (ii)
            const subQ = l.match(/^\(([ivxIVX\d]+)\)\s+(.+)$/);
            if (subQ) {
                currentQ.subQs.push(`(${subQ[1]}) ${subQ[2]}`);
                continue;
            }

            // OR question text
            if (currentQ.isOR && !currentQ.orText) {
                currentQ.orText = l.replace(/\*+/g, '').trim();
                continue;
            }

            // Continuation of question text
            const continuation = l.replace(/^\*+|\*+$/g, '').trim();
            if (continuation && !continuation.startsWith('#')) {
                currentQ.text += ' ' + continuation;
            }
        }
    }

    flushSection();
    return { sections, headerLines };
}

// ─── HTML Renderers ───────────────────────────────────────────────────────────

function renderMCQOptions(options: string[]): string {
    if (options.length === 0) return '';
    // Two-column layout for MCQ options like the screenshot
    const half = Math.ceil(options.length / 2);
    const left = options.slice(0, half);
    const right = options.slice(half);

    let html = '<table class="mcq-opts"><tr>';
    html += '<td>' + left.map(o => `<span class="opt">${inlineMarkdown(esc(o))}</span>`).join('') + '</td>';
    if (right.length) {
        html += '<td>' + right.map(o => `<span class="opt">${inlineMarkdown(esc(o))}</span>`).join('') + '</td>';
    }
    html += '</tr></table>';
    return html;
}

function renderQuestion(q: ParsedQuestion, paperType: string, idx: number): string {
    const num = q.number || String(idx);
    const marks = q.marks ? `<span class="q-marks">[${q.marks}]</span>` : '';
    const qText = inlineMarkdown(q.text);

    let html = `<div class="question">`;
    html += `<div class="q-row"><span class="q-num">Q.${num}</span><span class="q-text">${qText}${marks}</span></div>`;

    if (q.options.length > 0) {
        html += renderMCQOptions(q.options);
    }

    if (q.subQs.length > 0) {
        html += '<div class="sub-qs">' + q.subQs.map(s => `<div class="sub-q">${inlineMarkdown(esc(s))}</div>`).join('') + '</div>';
    }

    if (q.isOR && q.orText) {
        html += `<div class="or-divider"><span>OR</span></div>`;
        html += `<div class="q-row"><span class="q-num">Q.${num}(B)</span><span class="q-text">${inlineMarkdown(q.orText)}</span></div>`;
    }

    // Answer lines for worksheet/subjective short answers (1-2 marks)
    const marksNum = parseFloat(q.marks || '0');
    if ((paperType === 'worksheet' || paperType === 'subjective') && marksNum <= 2 && q.options.length === 0) {
        html += '<div class="ans-lines"><div class="ans-line"></div><div class="ans-line"></div></div>';
    }

    html += `</div>`;
    return html;
}

function renderSection(sec: ParsedSection, paperType: string, secIdx: number): string {
    if (sec.questions.length === 0 && !sec.title) return '';

    let html = '';

    if (sec.title) {
        html += `<div class="section-header">`;
        html += `<span class="section-title">${esc(sec.title)}</span>`;
        if (sec.subtitle) {
            html += `<div class="section-subtitle">${esc(sec.subtitle)}</div>`;
        }
        html += `</div>`;
    }

    // For objective papers: render MCQs in 2-column grid
    if (paperType === 'objective') {
        html += `<div class="mcq-grid">`;
        sec.questions.forEach((q, i) => {
            html += renderQuestion(q, paperType, i + 1);
        });
        html += `</div>`;
    } else {
        sec.questions.forEach((q, i) => {
            html += renderQuestion(q, paperType, i + 1);
        });
    }

    return html;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const PRINT_CSS = `
/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@page {
    size: A4;
    margin: 14mm 15mm 14mm 15mm;
}

body {
    font-family: Georgia, 'Times New Roman', 'DejaVu Serif', serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1a1a1a;
    background: #fff;
    max-width: 180mm;
    margin: 0 auto;
}

/* ─── Paper Header ─── */
.paper-header {
    width: 100%;
    margin-bottom: 4px;
}

.header-fields {
    display: flex;
    justify-content: space-between;
    font-size: 10.5pt;
    margin-bottom: 6px;
}

.field-group { display: flex; flex-direction: column; gap: 4px; }
.field { display: flex; align-items: baseline; gap: 4px; }
.field label { font-weight: normal; white-space: nowrap; }
.field .field-line {
    display: inline-block;
    width: 110px;
    border-bottom: 1px solid #1a1a1a;
}

.double-rule {
    border: none;
    border-top: 1px solid #1a1a1a;
    box-shadow: 0 3px 0 0 #1a1a1a;
    margin: 6px 0 5px;
    height: 0;
}

.paper-subject {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 4px 0 2px;
    text-transform: uppercase;
}

.paper-chapter {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    margin: 2px 0;
    text-transform: uppercase;
}

.paper-type-box {
    display: table;
    margin: 6px auto;
    border: 1.5px solid #1a1a1a;
    padding: 3px 20px;
    font-size: 11pt;
    font-weight: bold;
    letter-spacing: 1px;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #1a1a1a;
    border-bottom: 1px solid #1a1a1a;
    padding: 4px 8px;
    font-size: 10.5pt;
    margin: 6px 0;
}

/* ─── Instructions ─── */
.instructions {
    border: 1px solid #999;
    background: #fafafa;
    padding: 6px 10px;
    margin: 6px 0 8px;
    font-size: 10pt;
}
.instructions-title { font-weight: bold; margin-bottom: 3px; }
.instructions ul { padding-left: 18px; }
.instructions li { margin-bottom: 2px; }

/* ─── Section Header ─── */
.section-header {
    background: #1a2744;
    color: #fff;
    padding: 5px 10px;
    margin: 10px 0 6px;
    page-break-after: avoid;
}
.section-title { font-size: 11pt; font-weight: bold; letter-spacing: 0.5px; }
.section-subtitle {
    font-size: 10pt;
    font-style: italic;
    color: #ddd;
    text-align: center;
    margin-top: 2px;
}

/* ─── Questions ─── */
.question {
    page-break-inside: avoid;
    margin-bottom: 8px;
    padding: 3px 0;
}

.q-row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
}

.q-num {
    font-weight: bold;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 36px;
    font-size: 10.5pt;
}

.q-text {
    flex: 1;
    font-size: 10.5pt;
}

.q-marks {
    font-weight: bold;
    float: right;
    margin-left: 8px;
    font-size: 10pt;
}

/* ─── MCQ Options ─── */
.mcq-opts {
    width: 100%;
    margin: 3px 0 3px 38px;
    border-collapse: collapse;
    font-size: 10.5pt;
}
.mcq-opts td { padding: 1px 8px 1px 0; width: 50%; vertical-align: top; }
.opt { display: block; }

/* ─── Objective 2-column layout ─── */
.mcq-grid {
    column-count: 2;
    column-gap: 14px;
    column-rule: 1px solid #e0e0e0;
}
.mcq-grid .question { break-inside: avoid; }

/* ─── Sub-questions (i), (ii) ─── */
.sub-qs { margin: 3px 0 0 38px; font-size: 10.5pt; }
.sub-q { margin-bottom: 2px; }

/* ─── OR Divider ─── */
.or-divider {
    text-align: center;
    margin: 6px 0;
    position: relative;
    font-weight: bold;
    font-size: 10pt;
    color: #555;
}
.or-divider::before, .or-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #bbb;
}
.or-divider::before { left: 0; }
.or-divider::after { right: 0; }

/* ─── Answer Lines ─── */
.ans-lines { margin: 4px 0 0 38px; }
.ans-line {
    border-bottom: 1px dotted #888;
    margin-bottom: 12px;
    height: 0;
    width: 100%;
}

/* ─── Footer ─── */
.paper-footer {
    margin-top: 16px;
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    letter-spacing: 2px;
    page-break-inside: avoid;
    border-top: 1px solid #1a1a1a;
    padding-top: 6px;
}

/* ─── SVG Diagrams ─── */
svg { display: block; margin: 6px auto 4px; }

/* ─── Print specific ─── */
@media print {
    body { margin: 0; }
    .no-print { display: none !important; }
    .question { page-break-inside: avoid; }
    .section-header { page-break-after: avoid; }
    a { text-decoration: none; color: inherit; }
}
`;

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildPrintHTML(markdown: string, meta: PrintMeta): string {
    const { sections, headerLines } = parseMarkdownToSections(markdown);

    const marks = Number(meta.totalMarks) || 40;
    const duration = meta.duration || estimateDuration(marks);
    const institute = meta.instituteName?.trim() || '';
    const subject = capitalizeWords(meta.subject || '');
    const chaptersStr = Array.isArray(meta.chapters)
        ? meta.chapters.join(', ')
        : (meta.chapters || '');
    const chapterDisplay = chaptersStr ? capitalizeWords(chaptersStr) : '';
    const boardStr = boardLabel(meta.board);
    const ptLabel = paperTypeLabel(meta.paperType);

    // Extract total questions count
    const totalQ = sections.reduce((sum, s) => sum + s.questions.length, 0);

    // ── Header HTML
    const headerHTML = `
<div class="paper-header">
    <div class="header-fields">
        <div class="field-group">
            <div class="field"><label>Name :</label><span class="field-line"></span></div>
            <div class="field"><label>Std. :</label><span class="field-line"></span></div>
        </div>
        <div class="field-group" style="text-align:right;">
            <div class="field"><label>Roll No. :</label><span class="field-line"></span></div>
            <div class="field"><label>Date :</label><span class="field-line"></span></div>
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
    </div>
</div>`;

    // ── Instructions HTML
    const instructionsHTML = `
<div class="instructions">
    <div class="instructions-title">Instructions :</div>
    <ul>
        <li>All questions are compulsory.</li>
        ${meta.paperType === 'objective'
            ? '<li>Each question carries 1 mark.</li><li>Choose the most appropriate option.</li>'
            : '<li>Marks are indicated against each question.</li><li>Draw neat diagrams wherever necessary.</li>'
        }
        ${meta.paperType === 'subjective' ? '<li>Write legibly and clearly.</li>' : ''}
    </ul>
</div>`;

    // ── Sections HTML
    const sectionsHTML = sections.map((sec, i) => renderSection(sec, meta.paperType, i)).join('\n');

    // ── Footer HTML
    const footerHTML = `<div class="paper-footer">✦ &nbsp; ✦ &nbsp; ✦ &nbsp; ALL THE BEST &nbsp; ✦ &nbsp; ✦ &nbsp; ✦</div>`;

    // ── Assemble full document
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(subject)} - ${esc(ptLabel)}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
${institute ? `<div style="text-align:center;font-size:13pt;font-weight:bold;margin-bottom:2px;letter-spacing:1px;">${esc(institute.toUpperCase())}</div>` : ''}
${institute ? `<div style="text-align:center;font-size:9.5pt;color:#444;margin-bottom:6px;">${esc(boardStr)}</div>` : ''}
${headerHTML}
${instructionsHTML}
${sectionsHTML}
${footerHTML}
</body>
</html>`;
}
