/**
 * Multi-Pass Exam Paper Generation Engine
 * 
 * Instead of one giant API call that silently truncates, this engine:
 * 1. Generates each section independently with focused prompts
 * 2. Validates question counts after each section
 * 3. Retries incomplete sections (max 2 retries)
 * 4. Stitches everything together into a complete paper
 */

import { openai } from "./openai";
import { BOARD_PATTERNS } from "./patterns";
import { DifficultyLevel } from "./prompts";
import { getChaptersContent } from "./textbookLookup";
import { calculateChapterQuestionMap, buildWeightagePromptBlock } from "./weightageUtils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PatternSection {
    section: string;
    type: string;
    marskPerQuestion: number;
    count: number;
    choice?: string;
}

interface GenerateCompleteOptions {
    difficulty?: DifficultyLevel;
    chapterWeights?: Record<string, number>;
    totalMarks?: number;
    instituteName?: string;
}

interface SectionResult {
    sectionName: string;
    content: string;
    expectedCount: number;
    actualCount: number;
    isComplete: boolean;
}

interface PaperResult {
    content: string;
    metadata: {
        totalQuestions: number;
        expectedQuestions: number;
        totalMarks: number;
        sections: { name: string; expected: number; actual: number }[];
        isComplete: boolean;
    };
}

// ─── Helper: Resolve pattern & scale ────────────────────────────────────────

function resolvePattern(board: string, grade: string, subject: string, totalMarks?: number) {
    const classPatterns = BOARD_PATTERNS[board]?.[`class${grade}`] as Record<string, any> | undefined;

    // Strategy 1: Exact match
    let pattern = classPatterns?.[subject];

    // Strategy 2: Strip parentheses → "Social Science (History)" → "Social Science History"
    if (!pattern) {
        const withoutParens = subject.replace(/\s*\(([^)]+)\)\s*/g, " $1").trim();
        if (withoutParens !== subject) pattern = classPatterns?.[withoutParens];
    }

    // Strategy 3: Parent only → "Social Science (History)" → "Social Science"
    if (!pattern) {
        const parentOnly = subject.replace(/\s*\([^)]+\)\s*/g, "").trim();
        if (parentOnly !== subject) pattern = classPatterns?.[parentOnly];
    }

    // Strategy 4: EVS → Science
    if (!pattern && subject === "EVS") pattern = classPatterns?.["Science"];

    // Strategy 5: Case-insensitive fuzzy scan
    if (!pattern && classPatterns) {
        const subjectLower = subject.toLowerCase();
        for (const key of Object.keys(classPatterns)) {
            if (key.toLowerCase() === subjectLower) {
                pattern = classPatterns[key];
                break;
            }
        }
    }

    if (!pattern) {
        if (["English", "Hindi", "Marathi", "Sanskrit"].includes(subject)) {
            pattern = {
                totalMarks: 40,
                structure: [
                    { section: "SECTION A", type: "Reading / Grammar (Objective)", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION B", type: "Short Answer (Literature)", marskPerQuestion: 2, count: 5 },
                    { section: "SECTION C", type: "Long Answer / Composition", marskPerQuestion: 5, count: 4 }
                ]
            };
        } else {
            pattern = {
                totalMarks: 40,
                structure: [
                    { section: "SECTION A", type: "Objective / MCQs", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION B", type: "Short Answer", marskPerQuestion: 2, count: 5 },
                    { section: "SECTION C", type: "Long Answer", marskPerQuestion: 5, count: 4 }
                ]
            };
        }
    }

    const targetMarks = totalMarks || pattern.totalMarks || 40;
    const originalMarks = pattern.totalMarks || 40;
    const scalingFactor = targetMarks / originalMarks;

    // Scale question counts
    let newStructure: PatternSection[] = pattern.structure.map((s: any) => {
        let newCount = Math.floor(s.count * scalingFactor);
        if (s.count > 0 && newCount === 0 && scalingFactor > 0.15) newCount = 1;
        return { ...s, count: newCount };
    });

    // Correction loop to match total marks exactly
    let currentTotal = newStructure.reduce((sum, s) => sum + (s.count * s.marskPerQuestion), 0);
    let attempts = 0;
    while (currentTotal !== targetMarks && attempts < 50) {
        const diff = targetMarks - currentTotal;
        if (diff > 0) {
            let candidate = newStructure.find(s => s.marskPerQuestion <= diff && s.marskPerQuestion > 0);
            if (!candidate) {
                candidate = newStructure.reduce((prev, curr) =>
                    (prev.marskPerQuestion < curr.marskPerQuestion && prev.marskPerQuestion > 0) ? prev : curr
                );
            }
            if (candidate) { candidate.count++; currentTotal += candidate.marskPerQuestion; }
        } else {
            const diffAbs = Math.abs(diff);
            let candidate = newStructure.find(s => s.count > 1 && s.marskPerQuestion <= diffAbs);
            if (!candidate) candidate = newStructure.find(s => s.count > 0 && s.marskPerQuestion <= diffAbs);
            if (!candidate) candidate = newStructure.find(s => s.count > 0);
            if (candidate) { candidate.count--; currentTotal -= candidate.marskPerQuestion; }
        }
        attempts++;
    }

    return { structure: newStructure, totalMarks: targetMarks, scalingFactor };
}

// ─── Helper: Build board/subject context ────────────────────────────────────

function getBoardContext(board: string, grade: string, subject: string, chapters: string, options: GenerateCompleteOptions) {
    const diff = options.difficulty || "moderate";
    const isMathSubject = subject.toLowerCase().includes("math") || subject.toLowerCase().includes("algebra") || subject.toLowerCase().includes("geometry");

    let difficultyInstruction = "";
    switch (diff) {
        case "easy": difficultyInstruction = "EASY: Direct textbook questions, simple numbers."; break;
        case "moderate": difficultyInstruction = "MODERATE: 70% direct textbook, 30% application."; break;
        case "hard": difficultyInstruction = "HARD: 50% textbook, 50% conceptual/application."; break;
        case "replica": difficultyInstruction = "EXAM REPLICA: Match exact board exam difficulty."; break;
        case "challenging": difficultyInstruction = "CHALLENGING: High reasoning, multi-step, Olympiad level."; break;
    }

    let toneInstruction = "";
    if (board === "maharashtra") {
        toneInstruction = `SSC TONE: "Attempt any...", "Solve the following", "Give scientific reasons".`;
    } else if (board === "cbse") {
        toneInstruction = `CBSE TONE: "Assertion (A):...Reason (R):...", "Read the passage and answer".`;
    } else if (board === "icse") {
        toneInstruction = `ICSE TONE: "Give reasons", "Name the following", "Differentiate between".`;
    }

    const gradeNum = parseInt(grade, 10) || 0;
    let textbookSourcing = gradeNum >= 1 && gradeNum <= 9
        ? `90-100% questions from ${board.toUpperCase()} textbook exercises.`
        : `80-90% questions from ${board.toUpperCase()} textbook exercises.`;

    let boardSpecific = '';
    if (board === "maharashtra" && isMathSubject) {
        let firewall = "";
        if (subject.includes("Algebra") || subject.includes("Part-I")) firewall = "STRICTLY ALGEBRA ONLY. NO GEOMETRY.";
        else if (subject.includes("Geometry") || subject.includes("Part-II")) firewall = "STRICTLY GEOMETRY ONLY.";
        boardSpecific = `SSC MATHS. ${firewall} Every question MUST require calculation. ZERO theory. FORBIDDEN: Case Based, Assertion-Reason, essay questions.`;
    } else if (board === "maharashtra") {
        boardSpecific = `SSC PAPER. FORBIDDEN: Case Based, Assertion-Reason, Source Based. USE: "Give scientific reasons", "Distinguish between", "Answer the following".`;
    } else if (board === "cbse") {
        boardSpecific = `CBSE PAPER. Use Assertion-Reason with 4 options, Case Based with 150-250 word passages + sub-questions.`;
    } else if (board === "icse") {
        boardSpecific = `ICSE PAPER. Section I compulsory, Section II internal choice. Selina/Frank style.`;
    }

    // ── Math Diagram Instruction (compact)
    let diagramInstruction = '';
    if (isMathSubject) {
        diagramInstruction = `DIAGRAMS: For geometry questions, add [FIG: <type> | <params>] on its own line after the question.
Types: right_triangle, triangle, circle, parallel_lines, angle, coordinate_plane, number_line.
Params use key=value format. Only add when question REQUIRES a diagram. Never for algebra/numerical.`;
    }

    const chapterWeights = options.chapterWeights || {};

    return { difficultyInstruction, toneInstruction, textbookSourcing, boardSpecific, isMathSubject, chapterWeights, diagramInstruction };
}

// ─── Helper: Build system message (sent ONCE, not per-section) ──────────────

function buildSystemMessage(
    board: string, grade: string, subject: string,
    context: ReturnType<typeof getBoardContext>
): string {
    let sys = `You are a professional ${board.toUpperCase()} Board exam paper setter for Class ${grade} ${subject}. You ALWAYS generate the EXACT number of questions requested.

RULES:
- ${context.difficultyInstruction}
- ${context.toneInstruction}
- ${context.textbookSourcing}
- ${context.boardSpecific}
- ${context.isMathSubject ? 'Wrap ALL math in $...$: $\\frac{a}{b}$, $x^2$, $\\sqrt{3}$, $\\pi$, $\\sin 30°$. NEVER raw LaTeX.' : 'NO IMAGES OR DIAGRAMS. Purely text-based questions.'}`;

    if (context.diagramInstruction) {
        sys += `\n- ${context.diagramInstruction}`;
    }

    return sys;
}

// ─── Helper: Estimate max_tokens per section ────────────────────────────────

function estimateMaxTokens(section: PatternSection): number {
    const { type, marskPerQuestion, count } = section;
    const typeLower = type.toLowerCase();

    // Calculate generate count (including choice questions)
    let generateCount = count;
    if (section.choice) {
        const match = section.choice.match(/from\s+(\d+)/i);
        if (match) generateCount = parseInt(match[1], 10);
    }

    // MCQs: ~120-150 tokens each (question + 4 options + marks label)
    if (typeLower.includes("mcq") || typeLower.includes("objective") || typeLower.includes("assertion")) {
        return Math.max(generateCount * 200, 1500);
    }
    // Case Based / Source Based: ~500-600 tokens each (passage + sub-questions)
    if (typeLower.includes("case") || typeLower.includes("source") || typeLower.includes("passage") || typeLower.includes("paragraph")) {
        return Math.max(generateCount * 700, 2500);
    }
    // Long Answer (5 marks): ~250 tokens each
    if (marskPerQuestion >= 5) {
        return Math.max(generateCount * 350, 2000);
    }
    // Short Answer (2-3 marks): ~150 tokens each
    if (marskPerQuestion >= 2) {
        return Math.max(generateCount * 200, 1500);
    }
    // Match the following, fill blanks etc.
    return Math.max(generateCount * 150, 1200);
}

// ─── Helper: Count questions in markdown ────────────────────────────────────

function countQuestionsInMarkdown(content: string): number {
    // Comprehensive pattern to count question starts across all board formats:
    // - CBSE:  **Q.1** ..., Q.21 ..., **21.** 
    // - SSC:   **Q.1 (A)**, Q.1 (B):
    // - Worksheet: 1. ..., (1) ...
    // Use a Set to avoid double-counting the same question number
    const seen = new Set<string>();
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        // Match: **Q.1**, Q.1, Q.1 (A), Q1, 1., **1.**  at start of line
        const m = trimmed.match(/^(?:\*{0,2})(?:Q\.?\s*)?(\d+)(?:\s*\([A-Za-z]\))?(?:\*{0,2})[\.:\)]\s/i);
        if (m) seen.add(m[1]);
    }
    return seen.size;
}

// ─── Core: Generate a single section ────────────────────────────────────────

async function generateSection(
    board: string,
    grade: string,
    subject: string,
    chapters: string,
    section: PatternSection,
    questionStartNum: number,
    context: ReturnType<typeof getBoardContext>,
    scalingFactor: number,
    systemMessage: string,
    sectionTextbook?: string
): Promise<string> {
    const sectionMarks = section.count * section.marskPerQuestion;

    // Determine generate count (for choice-based sections)
    let generateCount = section.count;
    let choiceInstruction = "";
    if (scalingFactor === 1 && section.choice) {
        const match = section.choice.match(/from\s+(\d+)/i);
        if (match) {
            generateCount = parseInt(match[1], 10);
            choiceInstruction = `*Attempt any ${section.count} of the following ${generateCount} questions.*`;
        }
    } else if (board !== "maharashtra" && section.count >= 2 && section.marskPerQuestion >= 2 && !section.type.toLowerCase().includes("mcq") && !section.type.toLowerCase().includes("objective") && !section.type.toLowerCase().includes("assertion")) {
        generateCount = section.count >= 4 ? section.count + 2 : section.count + 1;
        choiceInstruction = `*Attempt any ${section.count} of the following ${generateCount} questions.*`;
    }

    const questionEndNum = questionStartNum + generateCount - 1;

    // Section-specific formatting rules (compact)
    let formatRules = "";
    const typeLower = section.type.toLowerCase();
    if (typeLower.includes("mcq") || typeLower.includes("objective") || typeLower.includes("assertion")) {
        formatRules = `Each question: 4 options (a)(b)(c)(d). For Assertion-Reason use standard 4 options. Concise.`;
    } else if (typeLower.includes("case") || typeLower.includes("source") || typeLower.includes("passage") || typeLower.includes("paragraph")) {
        formatRules = `Provide a 150-250 word passage, then 4-5 sub-questions (i),(ii),(iii),(iv). No snippets.`;
    } else if (typeLower.includes("match")) {
        formatRules = `Use Markdown table: | Column A | Column B |`;
    } else if (section.marskPerQuestion >= 5) {
        formatRules = context.isMathSubject ? `Multi-step problems, 4-5 steps minimum.` : `Detailed multi-part questions (definition+explanation+application+example).`;
    } else if (section.marskPerQuestion >= 3) {
        formatRules = context.isMathSubject ? `Problems requiring 2-3 step solutions.` : `Questions requiring 3-4 answer points.`;
    }

    const sectionHeader = `### ${section.section}`;

    // Build user prompt (board rules already in system message)
    const prompt = `TASK: Generate EXACTLY ${generateCount} questions for this section.

SECTION: ${section.section}
TYPE: ${section.type}
MARKS PER QUESTION: ${section.marskPerQuestion}
GENERATE: ${generateCount} questions (Q.${questionStartNum} to Q.${questionEndNum})
SECTION TOTAL: ${sectionMarks} marks
CHAPTERS: ${chapters}
${(() => {
    const chapterList = chapters.split(",").map(c => c.trim()).filter(Boolean);
    const allocations = calculateChapterQuestionMap(chapterList, context.chapterWeights, generateCount);
    return buildWeightagePromptBlock(allocations);
})()}
${sectionTextbook ? `\nSOURCE MATERIAL:\n${sectionTextbook}\n` : ''}
${formatRules ? `FORMAT RULES: ${formatRules}` : ''}

OUTPUT FORMAT (Markdown, no preamble):
${sectionHeader}
${choiceInstruction || `*(${section.type} — ${section.marskPerQuestion} Mark(s) each | Total: ${sectionMarks} Marks)*`}

**Q.${questionStartNum}** [Question text] [${section.marskPerQuestion} Mark(s)]

(a) Option A  (b) Option B  (c) Option C  (d) Option D  ← if MCQ

**Q.${questionStartNum + 1}** [Next question] [${section.marskPerQuestion} Mark(s)]

... continue with one blank line between each question until Q.${questionEndNum}

CRITICAL: Generate ALL ${generateCount} questions numbered Q.${questionStartNum} to Q.${questionEndNum}. Do NOT stop early. Do NOT skip numbers.`;

    const maxTokens = estimateMaxTokens({ ...section, count: generateCount });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(maxTokens, 16384),
    });

    return completion.choices[0].message.content || "";
}

// ─── Core: Build paper header ───────────────────────────────────────────────

function buildPaperHeader(
    board: string,
    grade: string,
    subject: string,
    totalMarks: number,
    instituteName?: string
): string {
    let duration = "2 Hours";
    if (totalMarks <= 10) duration = "30 Mins";
    else if (totalMarks <= 20) duration = "1 Hour";
    else if (totalMarks <= 40) duration = "2 Hours";
    else duration = "3 Hours";

    let header = "";
    if (instituteName) {
        header += `# ${instituteName.toUpperCase()}\n`;
        header += `## ${board.toUpperCase()} BOARD EXAM - CLASS ${grade}\n`;
    } else {
        header += `# ${board.toUpperCase()} BOARD EXAM - CLASS ${grade}\n`;
    }
    header += `### ${subject.toUpperCase()}\n\n`;
    header += `**Total Marks:** ${totalMarks} | **Duration:** ${duration}\n\n`;
    header += `---\n\n`;
    header += `**General Instructions:**\n`;
    header += `1. All questions are compulsory unless stated otherwise.\n`;
    header += `2. Marks are indicated against each question.\n`;
    header += `3. Write neat and legible answers.\n\n`;
    header += `---\n\n`;

    return header;
}

// ─── Main Entry: Generate Complete Paper ────────────────────────────────────

export async function generatePaperComplete(
    boardInput: string,
    grade: string,
    subjectInput: string,
    chapters: string,
    options: GenerateCompleteOptions = {}
): Promise<PaperResult> {
    const board = boardInput.toLowerCase().trim();
    const subject = subjectInput.trim();

    // 1. Resolve pattern and scale
    const { structure, totalMarks, scalingFactor } = resolvePattern(board, grade, subject, options.totalMarks);
    const context = getBoardContext(board, grade, subject, chapters, options);

    // Build system message ONCE (shared across all section calls)
    const systemMessage = buildSystemMessage(board, grade, subject, context);

    // Fetch scraped textbook content to ground the AI
    const chapterList = chapters.split(",").map(c => c.trim());
    // Use a smaller per-section budget: total 12K chars, distributed across sections
    const activeSections = structure.filter(s => s.count > 0);
    const textbookBudgetPerSection = activeSections.length > 0 ? Math.floor(12000 / activeSections.length) : 12000;
    const textbookContent = getChaptersContent(board, grade, subject, chapterList, 12000);
    if (textbookContent) {
        console.log(`[GeneratePaperComplete] Found scraped textbook content (${textbookContent.length} chars, ${textbookBudgetPerSection} per section)`);
    } else {
        console.log(`[GeneratePaperComplete] No scraped textbook content found, relying on AI knowledge`);
    }

    // 2. Build paper header
    const header = buildPaperHeader(board, grade, subject, totalMarks, options.instituteName);

    // 3. Generate each section with retry logic
    const sectionResults: SectionResult[] = [];
    let currentQuestionNum = 1;

    console.log(`[GeneratePaperComplete] Starting multi-pass generation for ${board} Class ${grade} ${subject} (${totalMarks} marks, ${activeSections.length} sections)`);

    for (const section of structure) {
        if (section.count <= 0) continue;

        // Determine expected generate count (accounting for choices)
        let expectedGenCount = section.count;
        if (scalingFactor === 1 && section.choice) {
            const match = section.choice.match(/from\s+(\d+)/i);
            if (match) expectedGenCount = parseInt(match[1], 10);
        } else if (board !== "maharashtra" && section.count >= 2 && section.marskPerQuestion >= 2 && !section.type.toLowerCase().includes("mcq") && !section.type.toLowerCase().includes("objective") && !section.type.toLowerCase().includes("assertion")) {
            expectedGenCount = section.count >= 4 ? section.count + 2 : section.count + 1;
        }

        // Smart textbook slicing: give each section only its fair share
        const sectionTextbook = textbookContent
            ? textbookContent.slice(0, textbookBudgetPerSection)
            : undefined;

        let bestContent = "";
        let bestCount = 0;
        const MAX_RETRIES = 2;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[GeneratePaperComplete] Generating ${section.section} (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${expectedGenCount} questions, ${section.marskPerQuestion} marks each`);

                const content = await generateSection(
                    board, grade, subject, chapters,
                    section, currentQuestionNum,
                    context, scalingFactor,
                    systemMessage,
                    sectionTextbook
                );

                const qCount = countQuestionsInMarkdown(content);
                console.log(`[GeneratePaperComplete] ${section.section}: Expected ${expectedGenCount}, Got ${qCount}`);

                if (qCount >= bestCount) {
                    bestContent = content;
                    bestCount = qCount;
                }

                // Accept if we got at least 80% of expected questions
                if (qCount >= Math.ceil(expectedGenCount * 0.8)) {
                    break;
                }

                if (attempt < MAX_RETRIES) {
                    console.log(`[GeneratePaperComplete] ${section.section}: Incomplete (${qCount}/${expectedGenCount}), retrying...`);
                }
            } catch (error) {
                console.error(`[GeneratePaperComplete] Error generating ${section.section} (attempt ${attempt + 1}):`, error);
                if (attempt === MAX_RETRIES && !bestContent) {
                    throw error;
                }
            }
        }

        sectionResults.push({
            sectionName: section.section,
            content: bestContent,
            expectedCount: expectedGenCount,
            actualCount: bestCount,
            isComplete: bestCount >= Math.ceil(expectedGenCount * 0.8)
        });

        currentQuestionNum += expectedGenCount;
    }

    // 4. Assemble final paper
    let fullPaper = header;
    for (const result of sectionResults) {
        fullPaper += result.content + "\n\n";
    }

    // 5. Final validation
    const totalActualQuestions = sectionResults.reduce((sum, r) => sum + r.actualCount, 0);
    const totalExpectedQuestions = sectionResults.reduce((sum, r) => sum + r.expectedCount, 0);

    console.log(`[GeneratePaperComplete] FINAL: ${totalActualQuestions}/${totalExpectedQuestions} questions generated across ${sectionResults.length} sections`);

    return {
        content: fullPaper.trim(),
        metadata: {
            totalQuestions: totalActualQuestions,
            expectedQuestions: totalExpectedQuestions,
            totalMarks,
            sections: sectionResults.map(r => ({
                name: r.sectionName,
                expected: r.expectedCount,
                actual: r.actualCount
            })),
            isComplete: totalActualQuestions >= Math.ceil(totalExpectedQuestions * 0.8)
        }
    };
}
