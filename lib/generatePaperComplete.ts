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
    let subjectKey = subject;
    if (subject.startsWith("Social Science")) subjectKey = "Social Science";
    if (subject === "EVS") subjectKey = "Science";

    // @ts-ignore
    let pattern = BOARD_PATTERNS[board]?.[`class${grade}`]?.[subjectKey];

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
        case "easy": difficultyInstruction = "LEVEL: EASY (School Test). Direct textbook questions, simple numbers, no complex reasoning."; break;
        case "moderate": difficultyInstruction = "LEVEL: MODERATE (Standard Board). 70% direct textbook, 30% simple application."; break;
        case "hard": difficultyInstruction = "LEVEL: HARD. 50% textbook, 50% conceptual/application. Complex word problems."; break;
        case "replica": difficultyInstruction = "LEVEL: EXAM REPLICA (Previous Year Style). MATCH EXACT BOARD DIFFICULTY. Mix of repetitive and tricky questions."; break;
        case "challenging": difficultyInstruction = "LEVEL: CHALLENGING (Olympiad/Foundation). High reasoning depth, multi-step problems, strict concept testing."; break;
    }

    let toneInstruction = "";
    if (board === "maharashtra") {
        toneInstruction = `USE MAHARASHTRA SSC TONE: "Attempt any...", "Solve the following", "Give scientific reasons".`;
    } else if (board === "cbse") {
        toneInstruction = `USE CBSE TONE: "Assertion (A): ... Reason (R): ...", "Read the following passage and answer", "Justify your answer".`;
    } else if (board === "icse") {
        toneInstruction = `USE ICSE TONE: "Give reasons for the following", "Name the following", "Differentiate between", "Define the term".`;
    }

    const gradeNum = parseInt(grade, 10) || 0;
    let textbookSourcing = gradeNum >= 1 && gradeNum <= 9
        ? `90-100% of questions MUST come from the ${board.toUpperCase()} Board textbook's end-of-chapter exercises.`
        : `80-90% of questions MUST come from the ${board.toUpperCase()} Board textbook's end-of-chapter exercises.`;

    let boardSpecific = '';
    if (board === "maharashtra" && isMathSubject) {
        let firewall = "";
        if (subject.includes("Algebra") || subject.includes("Part-I")) {
            firewall = "STRICTLY ALGEBRA ONLY. NO GEOMETRY.";
        } else if (subject.includes("Geometry") || subject.includes("Part-II")) {
            firewall = "STRICTLY GEOMETRY ONLY.";
        }
        boardSpecific = `SSC MAHARASHTRA MATHS PAPER. ${firewall} Every question MUST require mathematical calculation. ZERO theory/discussion. FORBIDDEN: Case Based, Assertion-Reason, "Explain importance of...", theory/essay questions.`;
    } else if (board === "maharashtra") {
        boardSpecific = `SSC MAHARASHTRA PAPER. FORBIDDEN: CBSE-style Case Based, Assertion-Reason, Source Based. USE SSC FORMATS: "Give scientific reasons", "Distinguish between X and Y", "Answer the following".`;
    } else if (board === "cbse") {
        boardSpecific = `CBSE BOARD PAPER. Use "Assertion (A):...Reason (R):..." with 4 options, "Case Based Questions" with 150-250 word passages + sub-questions.`;
    } else if (board === "icse") {
        boardSpecific = `ICSE BOARD PAPER. Section I compulsory, Section II has internal choice. Use Selina/Frank textbook style.`;
    }

    let weightageInstruction = "";
    if (options.chapterWeights) {
        weightageInstruction = "CHAPTER WEIGHTAGE:\n";
        Object.entries(options.chapterWeights).forEach(([chap, weight]) => {
            if (weight > 0) weightageInstruction += `- ${chap}: ${weight}%\n`;
        });
    }

    return { difficultyInstruction, toneInstruction, textbookSourcing, boardSpecific, isMathSubject, weightageInstruction };
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

    // MCQs: ~80 tokens each (question + 4 options)
    if (typeLower.includes("mcq") || typeLower.includes("objective") || typeLower.includes("assertion")) {
        return Math.max(generateCount * 100, 1500);
    }
    // Case Based / Source Based: ~500 tokens each (passage + sub-questions)
    if (typeLower.includes("case") || typeLower.includes("source") || typeLower.includes("passage") || typeLower.includes("paragraph")) {
        return Math.max(generateCount * 600, 2000);
    }
    // Long Answer (5 marks): ~200 tokens each
    if (marskPerQuestion >= 5) {
        return Math.max(generateCount * 250, 1500);
    }
    // Short Answer (2-3 marks): ~120 tokens each
    if (marskPerQuestion >= 2) {
        return Math.max(generateCount * 150, 1200);
    }
    // Match the following, fill blanks etc.
    return Math.max(generateCount * 120, 1000);
}

// ─── Helper: Count questions in markdown ────────────────────────────────────

function countQuestionsInMarkdown(content: string): number {
    // Count lines that start with a question pattern like **Q.1**, Q.1, **1.**, etc.
    const questionPattern = /(?:^|\n)\s*(?:\*\*)?(?:Q\.?\s*)?(\d+)\.(?:\*\*)?/gi;
    const matches = content.match(questionPattern);
    return matches ? matches.length : 0;
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
    scalingFactor: number
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

    // Section-specific formatting rules
    let formatRules = "";
    const typeLower = section.type.toLowerCase();
    if (typeLower.includes("mcq") || typeLower.includes("objective") || typeLower.includes("assertion")) {
        formatRules = `
- Each question must have 4 options on separate lines: (a) ... (b) ... (c) ... (d) ...
- For Assertion-Reason: "Assertion (A): ... Reason (R): ..." with standard 4 options.
- Keep questions concise and direct.`;
    } else if (typeLower.includes("case") || typeLower.includes("source") || typeLower.includes("passage") || typeLower.includes("paragraph")) {
        formatRules = `
- You MUST provide a long, detailed reading passage of AT LEAST 150-250 words.
- After the passage, provide 4-5 sub-questions numbered (i), (ii), (iii), (iv).
- Do NOT provide 1-2 sentence snippets. The passage must be substantial.`;
    } else if (typeLower.includes("match")) {
        formatRules = `
- Use a proper Markdown table format:
| Column A | Column B |
| :--- | :--- |
| 1. Item | A. Match |`;
    } else if (section.marskPerQuestion >= 5) {
        if (context.isMathSubject) {
            formatRules = `- Generate multi-step numerical/solving problems requiring detailed working. Include 4-5 steps minimum.`;
        } else {
            formatRules = `- Generate detailed, complex, multi-part questions (definition + explanation + applications + example). These must genuinely require a long answer.`;
        }
    } else if (section.marskPerQuestion >= 3) {
        if (context.isMathSubject) {
            formatRules = `- Generate problems requiring 2-3 step solutions.`;
        } else {
            formatRules = `- Generate questions requiring 3-4 points in the answer.`;
        }
    }

    // Build section header based on board
    let sectionHeader = "";
    if (board === "maharashtra") {
        sectionHeader = `### ${section.section}`;
    } else {
        sectionHeader = `### ${section.section}`;
    }

    const prompt = `You are an expert ${board.toUpperCase()} Board Paper Setter for Class ${grade} ${subject.toUpperCase()}.

TASK: Generate EXACTLY ${generateCount} questions for ONE section of an exam paper.

SECTION: ${section.section}
QUESTION TYPE: ${section.type}
MARKS PER QUESTION: ${section.marskPerQuestion}
NUMBER OF QUESTIONS TO GENERATE: ${generateCount}
SECTION TOTAL MARKS: ${sectionMarks}
QUESTION NUMBERING: Start from **Q.${questionStartNum}** to **Q.${questionEndNum}**

CHAPTERS (ONLY use these): ${chapters}
${context.weightageInstruction}

RULES:
1. ${context.difficultyInstruction}
2. ${context.toneInstruction}
3. ${context.textbookSourcing}
4. ${context.boardSpecific}
5. NO IMAGES OR DIAGRAMS. All questions must be purely text-based.
6. GENERATE EXACTLY ${generateCount} QUESTIONS. Not more, not less. This is NON-NEGOTIABLE.

${formatRules}

OUTPUT FORMAT (Markdown):
${sectionHeader}
${choiceInstruction ? choiceInstruction : `*(${section.type} — ${section.marskPerQuestion} Mark(s) each | Total: ${sectionMarks} Marks)*`}

**Q.${questionStartNum}** [Question text] **[${section.marskPerQuestion} Mark(s)]**

(leave one blank line between each question)

**Q.${questionStartNum + 1}** [Next question] **[${section.marskPerQuestion} Mark(s)]**

... continue until Q.${questionEndNum}

CRITICAL: You MUST generate ALL ${generateCount} questions from Q.${questionStartNum} to Q.${questionEndNum}. DO NOT stop early. DO NOT skip any question number.

Output ONLY the section content. No preamble, no "Here is...", no explanation.`;

    const maxTokens = estimateMaxTokens({ ...section, count: generateCount });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: `You are a professional ${board.toUpperCase()} Board exam paper setter. You ALWAYS generate the EXACT number of questions requested. You never stop early.` },
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

    // 2. Build paper header
    const header = buildPaperHeader(board, grade, subject, totalMarks, options.instituteName);

    // 3. Generate each section with retry logic
    const sectionResults: SectionResult[] = [];
    let currentQuestionNum = 1;

    console.log(`[GeneratePaperComplete] Starting multi-pass generation for ${board} Class ${grade} ${subject} (${totalMarks} marks, ${structure.length} sections)`);

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

        let bestContent = "";
        let bestCount = 0;
        const MAX_RETRIES = 2;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[GeneratePaperComplete] Generating ${section.section} (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${expectedGenCount} questions, ${section.marskPerQuestion} marks each`);

                const content = await generateSection(
                    board, grade, subject, chapters,
                    section, currentQuestionNum,
                    context, scalingFactor
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
