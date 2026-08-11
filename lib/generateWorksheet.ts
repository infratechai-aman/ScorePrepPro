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

// ─── Prompt builder ─────────────────────────────────────────────────────────

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
    
    let diffInstruction = "";
    switch (diff) {
        case "easy": diffInstruction = "EASY: Direct textbook questions, simple recall."; break;
        case "moderate": diffInstruction = "MODERATE: 70% direct, 30% application-based."; break;
        case "hard": diffInstruction = "HARD: 50% textbook, 50% conceptual/application."; break;
        case "replica": diffInstruction = "EXAM REPLICA: Match exact board exam difficulty."; break;
        case "challenging": diffInstruction = "CHALLENGING: High reasoning, multi-step problems."; break;
    }

    // Hard-enforce weightage: calculate exact question counts per chapter
    const totalQs = sections.reduce((sum, s) => sum + s.count, 0);
    const chapterList = chapters.split(",").map(c => c.trim()).filter(Boolean);
    const allocations = calculateChapterQuestionMap(
        chapterList,
        options.chapterWeights || {},
        totalQs
    );
    const weightageInstruction = buildWeightagePromptBlock(allocations);

    const sectionInstructions = sections.map(s => {
        if (s.type === "mcq") {
            return `### ${s.name} [${s.totalMarks} Marks]
Generate ${s.count} MCQs (${s.marksPerQuestion} mark each).
- Each MCQ must have 4 options: (a), (b), (c), (d)
- Only ONE correct answer
- Mix of direct recall and application-based`;
        } else if (s.type === "short_answer") {
            return `### ${s.name} [${s.totalMarks} Marks]
Generate ${s.count} Short Answer questions (${s.marksPerQuestion} marks each).
- Answers should be 3-5 sentences
- Include "Define", "State", "Explain briefly", "Differentiate between" type questions`;
        } else if (s.type === "long_answer") {
            return `### ${s.name} [${s.totalMarks} Marks]
Generate ${s.count} Long Answer questions (${s.marksPerQuestion} marks each).
- Answers should be detailed paragraphs
- Include "Explain in detail", "Describe the process", "Prove that" type questions`;
        } else {
            return `### ${s.name} [${s.totalMarks} Marks]
Generate ${s.count} Very Long Answer questions (${s.marksPerQuestion} marks each).
- These should require detailed explanations with diagrams/steps
- Include "Derive", "Explain with diagram", "Write a detailed note on" type questions`;
        }
    }).join("\n\n");

    const includeKey = options.includeAnswerKey !== false;

    const textbookContextBlock = textbookContent ? `\n## SOURCE MATERIAL (CRITICAL)\nYou MUST base your questions strictly on the following excerpt from the official textbook. Do not use outside knowledge if it conflicts with or goes beyond this material:\n\n${textbookContent}\n` : "";

    return `You are an expert ${board.toUpperCase()} Board exam paper setter for Class ${grade} ${subject}.

TASK: Generate a COMPLETE WORKSHEET from chapters: ${chapters}

${boardContext}
DIFFICULTY: ${diffInstruction}
${weightageInstruction}

WORKSHEET STRUCTURE:
- Total Marks: ${totalMarks}
- Total Time: ${duration} minutes

${sectionInstructions}
${textbookContextBlock}
FORMAT THE OUTPUT AS CLEAN MARKDOWN:

1. Start with the header (institute name if provided, board, class, subject, marks, time)
2. Each section should be a ### heading with marks in brackets
3. Number questions sequentially across sections (Q1, Q2, Q3... continuous)
4. For MCQs, show options as (a), (b), (c), (d)
5. For other questions, show marks in brackets at the end: [3 marks]

${includeKey ? `
AFTER THE WORKSHEET, add a section separator "---" and then:
## ANSWER KEY
- For MCQs: Just the correct option letter + 1 line explanation
- For Short/Long answers: Model answer (concise but complete)
` : "DO NOT include answer key."}

RULES:
1. ALL questions must be from the specified chapters
2. Questions must be grade-appropriate for Class ${grade}
3. Use proper ${board.toUpperCase()} board question language/tone
4. Total marks of all questions MUST equal ${totalMarks}
5. Maintain clear formatting with proper spacing
6. If Source Material is provided, STRICTLY use it for question context.
${options.instituteName ? `7. Use "${options.instituteName}" as the institute name in the header` : ""}`;
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
