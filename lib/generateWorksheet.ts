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
    // Distribution: ~25% MCQ (1 mark), ~35% Short (3 marks), ~40% Long (5 marks)
    // Adjusted to always hit exact marks total
    
    if (totalMarks <= 10) {
        // Small worksheet: 5 MCQs + 1 short(2) + 1 short(3)
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section B: Short Answer", type: "short_answer", marksPerQuestion: 2, count: 1, totalMarks: 2 },
            { name: "Section C: Descriptive", type: "long_answer", marksPerQuestion: 3, count: 1, totalMarks: 3 },
        ];
    }

    if (totalMarks <= 20) {
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 5, totalMarks: 5 },
            { name: "Section B: Short Answer", type: "short_answer", marksPerQuestion: 2, count: 5, totalMarks: 10 },
            { name: "Section C: Long Answer", type: "long_answer", marksPerQuestion: 5, count: 1, totalMarks: 5 },
        ];
    }

    if (totalMarks <= 40) {
        return [
            { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 10, totalMarks: 10 },
            { name: "Section B: Short Answer", type: "short_answer", marksPerQuestion: 3, count: 5, totalMarks: 15 },
            { name: "Section C: Long Answer", type: "long_answer", marksPerQuestion: 5, count: 3, totalMarks: 15 },
        ];
    }

    // 80 marks
    return [
        { name: "Section A: Objective (MCQs)", type: "mcq", marksPerQuestion: 1, count: 20, totalMarks: 20 },
        { name: "Section B: Short Answer", type: "short_answer", marksPerQuestion: 3, count: 8, totalMarks: 24 },
        { name: "Section C: Long Answer", type: "long_answer", marksPerQuestion: 5, count: 4, totalMarks: 20 },
        { name: "Section D: Very Long Answer", type: "very_long_answer", marksPerQuestion: 8, count: 2, totalMarks: 16 },
    ];
}

// ─── Duration calculator ────────────────────────────────────────────────────

function calculateDuration(totalMarks: number): number {
    // 1 mark ≈ 1.5 minutes
    return Math.ceil(totalMarks * 1.5);
}

// ─── Board context helper ───────────────────────────────────────────────────

function getWorksheetBoardContext(board: string) {
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
    const boardContext = getWorksheetBoardContext(board);
    const diff = options.difficulty || "moderate";
    const isMathSubject = subject.toLowerCase().includes("math") || subject.toLowerCase().includes("algebra") || subject.toLowerCase().includes("geometry");

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
        if (s.type === "mcq") {
            return `${s.name}: ${s.count}q x ${s.marksPerQuestion}m = ${s.totalMarks}M. MCQs with 4 options (a)-(d), ONE correct. After each MCQ add: "Ans: ____"`;
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

    const includeKey = options.includeAnswerKey !== false;
    const textbookBlock = textbookContent ? `\nSOURCE MATERIAL:\n${textbookContent}\n` : "";

    return `${board.toUpperCase()} Board STUDENT WORKSHEET for Class ${grade} ${subject}.
Chapters: ${chapters}

${boardContext}
DIFFICULTY: ${diffInstruction}
${weightageInstruction}
STRUCTURE: ${totalMarks} marks | ${duration} minutes
${diagramInstruction}

SECTION INSTRUCTIONS (follow exactly):
${sectionInstructions}

${textbookBlock}
OUTPUT: Clean Markdown. Header with board/class/subject/marks/time. ### section headings. Sequential numbering Q1,Q2... Marks in brackets. BLANK ANSWER LINES after every non-MCQ question as specified.
${includeKey ? `After full worksheet add "---" then ## ANSWER KEY with concise model answers.` : "No answer key."}
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
    const sections = calculateSections(totalMarks);
    const duration = calculateDuration(totalMarks);
    const totalQuestions = sections.reduce((sum, s) => sum + s.count, 0);

    console.log(`[Worksheet Engine] Generating worksheet: ${totalMarks} marks, ${totalQuestions} questions, ${duration} min`);
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
