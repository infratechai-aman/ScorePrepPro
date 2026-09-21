/**
 * Worksheet Generation Engine
 * 
 * Generates a MIXED worksheet combining:
 * - Section A: Objective (MCQs, 1 mark each)
 * - Section B: Short Answer (2-3 marks each)
 * - Section C: Long Answer (5 marks each)
 * 
 * Auto-calculates section distribution and time duration.
 */

import { openai } from "./openai";
import { calculateChapterQuestionMap, buildWeightagePromptBlock } from "./weightageUtils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorksheetSection {
    name: string;
    type: string;
    marksPerQuestion: number;
    count: number;
    totalMarks: number;
}

interface WorksheetResult {
    content: string; // Markdown formatted worksheet
    answerKey: string; // Markdown answer key
    metadata: {
        totalMarks: number;
        totalQuestions: number;
        duration: number; // in minutes
        sections: WorksheetSection[];
        board: string;
        subject: string;
        grade: string;
    };
}

interface GenerateWorksheetOptions {
    difficulty?: string;
    chapterWeights?: Record<string, number>;
    totalMarks?: number;
    includeAnswerKey?: boolean;
    instituteName?: string;
}

// ─── Section distribution calculator ────────────────────────────────────────

function calculateSections(totalMarks: number): WorksheetSection[] {
    // Distribution includes: MCQs, True/False, Fill in the Blanks, Match the Following,
    // Short Answer, and Long Answer sections.
    
    if (totalMarks <= 10) {
        // Small worksheet: 3 MCQs + 2 T/F + 2 FIB + 1 short(3)
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 3, totalMarks: 3 },
            { name: "Section B: True or False", type: "true_false", marksPerQuestion: 1, count: 2, totalMarks: 2 },
            { name: "Section C: Fill in the Blanks", type: "fill_blank", marksPerQuestion: 1, count: 2, totalMarks: 2 },
            { name: "Section D: Short Answer", type: "short_answer", marksPerQuestion: 3, count: 1, totalMarks: 3 },
        ];
    }

    if (totalMarks <= 20) {
        // 20 marks: 3 MCQs + 3 T/F + 3 FIB + 1 Match(3 pairs) + 2 Short(2m) + 1 Long(4m) = 20
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 3, totalMarks: 3 },
            { name: "Section B: True or False", type: "true_false", marksPerQuestion: 1, count: 3, totalMarks: 3 },
            { name: "Section C: Fill in the Blanks", type: "fill_blank", marksPerQuestion: 1, count: 3, totalMarks: 3 },
            { name: "Section D: Match the Following", type: "match_following", marksPerQuestion: 1, count: 3, totalMarks: 3 },
            { name: "Section E: Short Answer", type: "short_answer", marksPerQuestion: 2, count: 2, totalMarks: 4 },
            { name: "Section F: Long Answer", type: "long_answer", marksPerQuestion: 4, count: 1, totalMarks: 4 },
        ];
    }

    if (totalMarks <= 40) {
        // 40 marks: 5 MCQs + 5 T/F + 5 FIB + 1 Match(5 pairs) + 3 Short(3m) + 2 Long(5m) = 40
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section B: True or False", type: "true_false", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section C: Fill in the Blanks", type: "fill_blank", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section D: Match the Following", type: "match_following", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section E: Short Answer", type: "short_answer", marksPerQuestion: 3, count: 3, totalMarks: 9 },
            { name: "Section F: Long Answer", type: "long_answer", marksPerQuestion: 4, count: 2, totalMarks: 8 },
            { name: "Section G: Very Long Answer", type: "very_long_answer", marksPerQuestion: 3, count: 1, totalMarks: 3 },
        ];
    }

    // 80 marks: 8 MCQs + 6 T/F + 6 FIB + 1 Match(5 pairs) + 5 Short(3m) + 3 Long(5m) + 2 VLong(8m)
    return [
        { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 8, totalMarks: 8 },
        { name: "Section B: True or False", type: "true_false", marksPerQuestion: 1, count: 6, totalMarks: 6 },
        { name: "Section C: Fill in the Blanks", type: "fill_blank", marksPerQuestion: 1, count: 6, totalMarks: 6 },
        { name: "Section D: Match the Following", type: "match_following", marksPerQuestion: 1, count: 5, totalMarks: 5 },
        { name: "Section E: Short Answer", type: "short_answer", marksPerQuestion: 3, count: 5, totalMarks: 15 },
        { name: "Section F: Long Answer", type: "long_answer", marksPerQuestion: 5, count: 4, totalMarks: 20 },
        { name: "Section G: Very Long Answer", type: "very_long_answer", marksPerQuestion: 8, count: 2, totalMarks: 16 },
    ];
    // Note: 80 mark total = 8+6+6+5+15+20+16 = 76 (4 marks leeway for adjustment)
}

// ─── Grammar-specific section distribution calculator ────────────────────────
// Strictly for Grammar worksheets: skill-based transformations, editing, and gap filling.
// No generic essay-style 10/14-line long answers or awkward factual true/false.

function calculateGrammarSections(totalMarks: number): WorksheetSection[] {
    if (totalMarks <= 10) {
        // 10 marks quick classroom drill: Gap filling (4M) + Do as Directed (4M) + Error Spotting (2M) = 10M
        return [
            { name: "Section A: Gap-Filling & Usage", type: "grammar_gap_fill", marksPerQuestion: 1, count: 4, totalMarks: 4 },
            { name: "Section B: Do as Directed (Sentence Transformations)", type: "grammar_do_as_directed", marksPerQuestion: 1, count: 4, totalMarks: 4 },
            { name: "Section C: Error Spotting & Correction", type: "grammar_error_spotting", marksPerQuestion: 1, count: 2, totalMarks: 2 },
        ];
    }

    if (totalMarks <= 20) {
        // 20 marks period test: Gap filling (5M) + Do as Directed (7M) + Editing Table (4M) + Sentence Synthesis (4M) = 20M
        return [
            { name: "Section A: Gap-Filling (Tenses, Prepositions & Modals)", type: "grammar_gap_fill", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section B: Do as Directed (Transformations)", type: "grammar_do_as_directed", marksPerQuestion: 1, count: 7, totalMarks: 7 },
            { name: "Section C: Error Spotting & Editing (Proofreading)", type: "grammar_editing_table", marksPerQuestion: 1, count: 4, totalMarks: 4 },
            { name: "Section D: Sentence Synthesis & Reordering", type: "grammar_synthesis", marksPerQuestion: 1, count: 4, totalMarks: 4 },
        ];
    }

    if (totalMarks <= 40) {
        // 40 marks comprehensive unit worksheet: Gap filling (8M) + Do as Directed (12M) + Editing Passage (8M) + Synthesis (6M) + Dialogue (6M) = 40M
        return [
            { name: "Section A: Contextual Gap-Filling (Tenses, Modals & Determiners)", type: "grammar_gap_fill", marksPerQuestion: 1, count: 8, totalMarks: 8 },
            { name: "Section B: Do as Directed (Comprehensive Transformations)", type: "grammar_do_as_directed", marksPerQuestion: 1, count: 12, totalMarks: 12 },
            { name: "Section C: Error Spotting & Editing Passage", type: "grammar_editing_table", marksPerQuestion: 1, count: 8, totalMarks: 8 },
            { name: "Section D: Sentence Synthesis & Clauses", type: "grammar_synthesis", marksPerQuestion: 1, count: 6, totalMarks: 6 },
            { name: "Section E: Dialogue Completion & Reported Speech", type: "grammar_dialogue", marksPerQuestion: 2, count: 3, totalMarks: 6 },
        ];
    }

    // 80 marks master practice pack: Gap filling (16M) + Transformations (24M) + Editing Table (16M) + Synthesis (14M) + Dialogue (10M) = 80M
    return [
        { name: "Section A: Objective & Contextual Gap-Filling", type: "grammar_gap_fill", marksPerQuestion: 1, count: 16, totalMarks: 16 },
        { name: "Section B: Do as Directed (Sentence Transformations)", type: "grammar_do_as_directed", marksPerQuestion: 1, count: 24, totalMarks: 24 },
        { name: "Section C: Integrated Editing & Proofreading Passages", type: "grammar_editing_table", marksPerQuestion: 1, count: 16, totalMarks: 16 },
        { name: "Section D: Sentence Synthesis, Clauses & Inversion", type: "grammar_synthesis", marksPerQuestion: 1, count: 14, totalMarks: 14 },
        { name: "Section E: Reported Speech & Dialogue Transformation", type: "grammar_dialogue", marksPerQuestion: 2, count: 5, totalMarks: 10 },
    ];
}

// ─── Duration calculator ────────────────────────────────────────────────────

function calculateDuration(totalMarks: number): number {
    // 1 mark ≈ 1.5 minutes
    return Math.ceil(totalMarks * 1.5);
}

// ─── Board context helper ───────────────────────────────────────────────────

function getWorksheetBoardContext(board: string, subject: string = "") {
    const isGrammar = subject.toLowerCase().includes("grammar");
    if (isGrammar) {
        if (board === "cbse") {
            return `CBSE Grammar Worksheet Style: Focus purely on English Language & Grammar drills (Tenses, Reported Speech, Subject-Verb Concord, Modals, Determiners, Error Spotting/Correction, Gap Filling, Sentence Reordering). STRICTLY NO literature passages, poems, or character questions.`;
        } else if (board === "icse") {
            return `ICSE Grammar Worksheet Style: Focus purely on Functional English Grammar drills (Prepositions, Conjunctions, Transformation of Sentences without changing meaning, Direct/Indirect speech, Active/Passive voice, Tense sequencing). STRICTLY NO literature or prose questions.`;
        } else if (board === "maharashtra") {
            return `Maharashtra SSC Grammar Worksheet Style: Language Study format (Do as Directed, Identify Infinitives/Gerunds/Participles, Punctuation, Word Chains, Compound Words, Clauses identification, Voice and Speech change). STRICTLY NO textbook chapter/prose/poem questions.`;
        }
        return `Grammar Worksheet: Focus purely on English grammar drills, Do as Directed, sentence transformations, and error correction. STRICTLY NO literature, story, or reading comprehension questions.`;
    }

    if (board === "cbse") {
        return `CBSE Board Style: Use NCERT language, include Assertion-Reason in MCQs, use "Case Based" style for long answers where appropriate.`;
    } else if (board === "icse") {
        return `ICSE Board Style: Use formal language, include "Name the following", "Distinguish between" style questions.`;
    } else if (board === "maharashtra") {
        return `Maharashtra SSC Style: Use "Give scientific reasons", "Solve the following", "Attempt any X" style. FORBIDDEN: CBSE-specific formats.`;
    }
    return "";
}

function buildWorksheetPrompt(
    board: string,
    grade: string,
    subject: string,
    chapters: string,
    sections: WorksheetSection[],
    totalMarks: number,
    duration: number,
    options: GenerateWorksheetOptions,
    textbookContent: string
): string {
    const boardContext = getWorksheetBoardContext(board, subject);
    const diff = options.difficulty || "moderate";
    const isMathSubject = subject.toLowerCase().includes("math") || subject.toLowerCase().includes("algebra") || subject.toLowerCase().includes("geometry");
    const isGrammarSubject = subject.toLowerCase().includes("grammar");

    let diffInstruction = "";
    switch (diff) {
        case "easy": diffInstruction = "EASY: Direct textbook, simple recall."; break;
        case "moderate": diffInstruction = "MODERATE: 70% direct, 30% application."; break;
        case "hard": diffInstruction = "HARD: 50% textbook, 50% conceptual."; break;
        case "replica": diffInstruction = "EXAM REPLICA: Match board exam difficulty."; break;
        case "challenging": diffInstruction = "CHALLENGING: High reasoning, multi-step."; break;
    }

    const totalQs = sections.reduce((sum, s) => sum + s.count, 0);
    const chapterList = chapters.split(",").map(c => c.trim()).filter(Boolean);
    const allocations = calculateChapterQuestionMap(chapterList, options.chapterWeights || {}, totalQs);
    const weightageInstruction = buildWeightagePromptBlock(allocations);

    const answerLineShort = `\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n`;
    const answerLineLong = `\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n`;
    const answerLineVeryLong = answerLineLong + `_______________________________________\n_______________________________________\n_______________________________________\n_______________________________________\n`;

    const sectionInstructions = sections.map(s => {
        // ── GRAMMAR-SPECIFIC SECTION TYPES (Applied strictly when isGrammarSubject is true) ──
        if (isGrammarSubject) {
            if (s.type === "grammar_gap_fill") {
                return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Contextual gap-filling questions testing tenses, prepositions, modals, or determiners. Provide the base/cue word in parentheses at the end of the sentence. Format each with an in-line blank (________) followed by "Ans: ________"
Example:
1. By next month, they ________ (complete) the construction work. Ans: ________`;
            } else if (s.type === "grammar_do_as_directed") {
                return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Sentence transformation drills (Voice, Direct/Indirect Speech, Degrees of Comparison, Clauses, Conditionals, Inversion, Synthesis). Provide the base sentence followed by explicit instruction in brackets.
MANDATORY: After EACH question print EXACTLY ONE single clean ruled blank line:
Ans: ____________________________________________________________________
Example:
1. No sooner did the bell ring than the students rushed outside. (Rewrite using 'Hardly...when')
Ans: ____________________________________________________________________`;
            } else if (s.type === "grammar_error_spotting") {
                return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Error spotting and correction sentences. Each sentence contains ONE grammatical error.
MANDATORY: After EACH question print:
Error: ________________ | Correction: ________________
Example:
1. Each of the suspected culprits were questioned by the police.
Error: ________________ | Correction: ________________`;
            } else if (s.type === "grammar_editing_table") {
                return `${s.name}: ${s.count} lines x ${s.marksPerQuestion}m = ${s.totalMarks}M. Authentic proofreading / editing passage consisting of ${s.count} numbered lines where each line has ONE grammatical error.
MANDATORY: Output the passage with line numbers (a)-(d) followed by a clean Markdown correction table:
| Line No. | Incorrect Word | Correction |
| :--- | :--- | :--- |
| (a) | ________________ | ________________ |
| (b) | ________________ | ________________ |`;
            } else if (s.type === "grammar_synthesis") {
                return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Sentence synthesis (joining sentences without using 'and', 'but', or 'so', or clause combining) or sentence reordering from jumbled words.
MANDATORY: After EACH question print EXACTLY ONE single clean ruled blank line:
Ans: ____________________________________________________________________
Example:
1. He heard the thunder. He immediately ran inside. (Join using a Participle)
Ans: ____________________________________________________________________`;
            } else if (s.type === "grammar_dialogue") {
                return `${s.name}: ${s.count} dialogues x ${s.marksPerQuestion}m = ${s.totalMarks}M. Dialogue completion drill. Provide a short 2-person conversation (2-3 exchanges) followed by an indirect speech reported summary containing numbered blanks (a), (b) etc. for students to fill in.`;
            }
        }

        // ── STANDARD SUBJECT SECTION TYPES (For all other subjects: Math, Science, SST, etc.) ──
        if (s.type === "mcq") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. MCQs with 4 options (a)-(d), ONE correct. Each option MUST be on a SEPARATE line:
(a) Option A
(b) Option B
(c) Option C
(d) Option D
After each MCQ add: "Ans: ____"`;
        } else if (s.type === "true_false") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Write a statement and ask students to write TRUE or FALSE. After each statement add: "Ans: ____"
Example format:
1. The chemical formula of water is H2O. (True/False) Ans: ____`;
        } else if (s.type === "fill_blank") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Write a sentence with a key word/phrase replaced by a blank (________). After each fill-in-the-blank add: "Ans: ____"
Example format:
1. The process of converting sugar into alcohol is called ________. Ans: ____`;
        } else if (s.type === "match_following") {
            return `${s.name}: ${s.count} pairs x ${s.marksPerQuestion}m = ${s.totalMarks}M. Create a "Match the Following" question with two columns. Use a proper Markdown table:
| Column A | Column B |
| :--- | :--- |
| 1. Item | A. Match |
| 2. Item | B. Match |
The answers in Column B must be SHUFFLED (not in the same order as Column A).`;
        } else if (s.type === "short_answer") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Short Answer questions. MANDATORY: After EACH question print exactly 4 blank lines like this:${answerLineShort}`;
        } else if (s.type === "long_answer") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Long Answer questions. MANDATORY: After EACH question print exactly 10 blank lines like this:${answerLineLong}`;
        } else {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. Very Long Answer questions. MANDATORY: After EACH question print exactly 14 blank lines like this:${answerLineVeryLong}`;
        }
    }).join("\n\n");

    const diagramInstruction = isMathSubject ? `
MATH DIAGRAMS: For geometry/coordinate questions add a tag on its own line after the question text (before blank lines):
[FIG: <type> | <params>]
Types: right_triangle, triangle, circle, parallel_lines, angle, coordinate_plane, number_line
Example: [FIG: right_triangle | a=A b=B c=C ab=6cm bc=8cm ac=10cm right=b]
Only add when the question requires a diagram. Never for algebra/arithmetic.` : "";

    const grammarInstruction = isGrammarSubject ? `
=== CRITICAL GRAMMAR INSTRUCTIONS ===
1. This is a 100% PURE ENGLISH GRAMMAR skill-practice worksheet for Class ${grade}.
2. Every question MUST be a functional grammar drill, transformation, error spotting, or fill-in-the-blank.
3. STRICTLY FORBIDDEN: NEVER include reading comprehension passages, literature poems, stories, character questions, or textbook prose questions.
4. DO NOT print generic 10-line or 14-line essay blank blocks. For sentence transformations and synthesis, use EXACTLY ONE single clean ruled answer line (Ans: ____________________________________________________________________).
5. For editing/error correction, output a clean Markdown correction table with Line No., Incorrect Word, and Correction.` : "";

    const includeKey = options.includeAnswerKey !== false;
    const textbookBlock = textbookContent ? `\nSOURCE MATERIAL:\n${textbookContent}\n` : "";

    const grammarKeyRules = isGrammarSubject ? `
4. **FOR GRAMMAR ANSWER KEY**:
   - For Gap-Filling: Provide the exact word/verb form (e.g. "1. had completed").
   - For Do as Directed & Synthesis: Provide the complete, accurate rewritten sentence.
   - For Error Spotting & Editing: Provide the filled-in table or list with exact Incorrect Word and Correction.
   - For Dialogue Completion: Provide the exact indirect speech clauses for (a), (b), etc.` : "";

    const answerKeyInstructions = includeKey ? `After full worksheet add "---" then ## ANSWER KEY with concise model answers.
CRITICAL ANSWER KEY RULES:
1. **NUMBERING**: The answer key MUST start numbering from 1. Answer 1 = Worksheet Question 1, Answer 2 = Worksheet Question 2, etc. Do NOT continue numbering from where the worksheet left off.
2. **ANSWER LENGTH BY MARKS** (STRICT):
   - 1 Mark (MCQ/True-False/Fill in Blank): ONLY the direct answer. No explanation. e.g. "1. (b) Mercury" or "1. True" or "1. Fermentation"
   - 2 Marks: Answer must be 2-3 sentences long.
   - 3 Marks: Answer must be 3-4 sentences long.
   - 4 Marks: Answer must be 4-5 sentences long.
   - 5+ Marks: Answer must be 5-6 sentences long with detailed explanation.
3. For Match the Following: provide the correct pairings (e.g. "1-C, 2-A, 3-B").${grammarKeyRules}` : "No answer key.";

    const blankLineNote = isGrammarSubject
        ? "Clean single-line ruled answers (Ans: ____________________________________) or tables as specified. NO large 10-line or 14-line essay blocks."
        : "BLANK ANSWER LINES after every non-MCQ/non-TF/non-FIB question as specified.";

    return `${board.toUpperCase()} Board STUDENT WORKSHEET for Class ${grade} ${subject}.
Chapters: ${chapters}

${boardContext}
DIFFICULTY: ${diffInstruction}
${weightageInstruction}
STRUCTURE: ${totalMarks} marks | ${duration} minutes
${diagramInstruction}
${grammarInstruction}

SECTION INSTRUCTIONS (follow exactly):
${sectionInstructions}

${textbookBlock}
OUTPUT: Clean Markdown. Header with board/class/subject/marks/time. ### section headings. Sequential numbering Q1,Q2... Marks in brackets. ${blankLineNote}
${answerKeyInstructions}
${options.instituteName ? `Institute: "${options.instituteName}"` : ""}
All questions from specified chapters. Grade-appropriate. Total marks = ${totalMarks}. ${board.toUpperCase()} tone. Source Material: use strictly if provided.`;
}


// ─── Main generation function ───────────────────────────────────────────────

import { getChaptersContent } from "./textbookLookup";

export async function generateWorksheet(
    board: string,
    grade: string,
    subject: string,
    chapters: string,
    options: GenerateWorksheetOptions = {}
): Promise<WorksheetResult> {
    const totalMarks = options.totalMarks || 40;
    const isGrammarSubject = subject.toLowerCase().includes("grammar");
    const sections = isGrammarSubject ? calculateGrammarSections(totalMarks) : calculateSections(totalMarks);
    const duration = calculateDuration(totalMarks);
    const totalQuestions = sections.reduce((sum, s) => sum + s.count, 0);

    console.log(`[Worksheet Engine] Generating worksheet (${isGrammarSubject ? "GRAMMAR" : "STANDARD"}): ${totalMarks} marks, ${totalQuestions} questions, ${duration} min`);
    console.log(`[Worksheet Engine] Sections:`, sections.map(s => `${s.name}: ${s.count}q × ${s.marksPerQuestion}m`));

    // Fetch scraped textbook content to ground the AI
    const chapterList = chapters.split(",").map(c => c.trim());
    const textbookContent = getChaptersContent(board, grade, subject, chapterList);
    if (textbookContent) {
        console.log(`[Worksheet Engine] Found scraped textbook content for grounding (${textbookContent.length} chars)`);
    } else {
        console.log(`[Worksheet Engine] No scraped textbook content found, relying on AI knowledge`);
    }

    const prompt = buildWorksheetPrompt(
        board, grade, subject, chapters,
        sections, totalMarks, duration, options, textbookContent
    );

    // Call OpenAI
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are an expert board exam worksheet generator. Generate clean, well-formatted markdown worksheets that exactly match the specified structure and marks distribution. Your output must be pure markdown."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 10000,
        temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content || "";

    // Split content and answer key
    let worksheetContent = rawContent;
    let answerKey = "";

    if (options.includeAnswerKey !== false) {
        // Try to split at answer key section
        const answerKeyMarkers = [
            "## ANSWER KEY",
            "## Answer Key",
            "## ANSWER KEY:",
            "---\n## ANSWER",
            "---\n\n## ANSWER",
        ];

        for (const marker of answerKeyMarkers) {
            const idx = rawContent.indexOf(marker);
            if (idx !== -1) {
                worksheetContent = rawContent.substring(0, idx).trim();
                answerKey = rawContent.substring(idx).trim();
                // Remove leading --- if present
                if (answerKey.startsWith("---")) {
                    answerKey = answerKey.substring(3).trim();
                }
                break;
            }
        }
    }

    return {
        content: worksheetContent,
        answerKey,
        metadata: {
            totalMarks,
            totalQuestions,
            duration,
            sections,
            board,
            subject,
            grade
        }
    };
}
