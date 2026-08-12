/**
 * Objective Question Generation Engine
 * 
 * Generates board-relevant objective questions:
 * - Standard MCQ (4 options, 1 correct)
 * - Assertion-Reason type
 * - Statement-based (I, II, III — which are correct)
 * - Fill in the blanks
 */

import { openai } from "./openai";
import { calculateChapterQuestionMap, buildWeightagePromptBlock } from "./weightageUtils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ObjectiveQuestion {
    id: number;
    type: "mcq" | "assertion_reason" | "statement_based" | "fill_blank";
    text: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "easy" | "moderate" | "hard";
    chapter?: string;
}

interface ObjectiveResult {
    content: string; // Markdown formatted paper
    answerKey: string; // Markdown answer key
    questions: ObjectiveQuestion[];
    metadata: {
        totalQuestions: number;
        formatDistribution: Record<string, number>;
        board: string;
        subject: string;
        grade: string;
    };
}

interface GenerateObjectiveOptions {
    difficulty?: string;
    chapterWeights?: Record<string, number>;
    questionCount?: number;
    formats?: string[]; // which formats to include
    instituteName?: string;
}

// ─── Board context helper ───────────────────────────────────────────────────

function getObjectiveBoardContext(board: string, grade: string, subject: string) {
    let boardStyle = "";
    if (board === "cbse") {
        boardStyle = `CBSE Style: Assertion-Reason with 4 standard options. Statement-based: "Consider statements (I)...(II)...(III)... Which are correct?" Fill blanks test key terms.`;
    } else if (board === "maharashtra") {
        boardStyle = `SSC Style: Direct textbook MCQs. "Choose the correct alternative". No Assertion-Reason. Focus on factual recall and application.`;
    } else if (board === "icse") {
        boardStyle = `ICSE Style: Selina/Frank textbook aligned. "Choose the correct option". Precise distractors testing deep understanding.`;
    } else {
        boardStyle = `Standard MCQ format with clear stems and plausible distractors.`;
    }
    return boardStyle;
}

// ─── Format distribution calculator ────────────────────────────────────────

function calculateFormatDistribution(
    totalQuestions: number,
    formats: string[]
): Record<string, number> {
    const distribution: Record<string, number> = {};
    const formatCount = formats.length;
    const baseCount = Math.floor(totalQuestions / formatCount);
    let remaining = totalQuestions - (baseCount * formatCount);

    // MCQs should get the largest share
    const mcqIndex = formats.indexOf("mcq");
    
    formats.forEach((format, i) => {
        distribution[format] = baseCount;
        if (remaining > 0) {
            if (i === mcqIndex || (mcqIndex === -1 && i === 0)) {
                distribution[format] += remaining;
                remaining = 0;
            }
        }
    });

    // Ensure MCQ gets at least 40% if it's included
    if (mcqIndex !== -1 && totalQuestions >= 10) {
        const minMcq = Math.ceil(totalQuestions * 0.4);
        if (distribution["mcq"] < minMcq) {
            const extra = minMcq - distribution["mcq"];
            distribution["mcq"] = minMcq;
            const otherFormats = formats.filter(f => f !== "mcq");
            let toRemove = extra;
            for (const f of otherFormats) {
                if (toRemove <= 0) break;
                const canRemove = Math.min(toRemove, distribution[f] - 1);
                if (canRemove > 0) {
                    distribution[f] -= canRemove;
                    toRemove -= canRemove;
                }
            }
        }
    }

    return distribution;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────

function buildObjectivePrompt(
    board: string,
    grade: string,
    subject: string,
    chapters: string,
    formatDistribution: Record<string, number>,
    options: GenerateObjectiveOptions,
    textbookContent: string
): string {
    const boardContext = getObjectiveBoardContext(board, grade, subject);
    const diff = options.difficulty || "moderate";
    
    let diffInstruction = "";
    switch (diff) {
        case "easy": diffInstruction = "EASY: Direct textbook, simple recall, no tricky options."; break;
        case "moderate": diffInstruction = "MODERATE: 70% recall, 30% application. Some close distractors."; break;
        case "hard": diffInstruction = "HARD: 50% application, 50% analytical. Very close distractors."; break;
        case "replica": diffInstruction = "EXAM REPLICA: Match exact board exam difficulty and style."; break;
        case "challenging": diffInstruction = "CHALLENGING: High reasoning, multi-concept, tricky distractors."; break;
    }

    // Hard-enforce weightage: calculate exact question counts per chapter
    const chapterList = chapters.split(",").map(c => c.trim()).filter(Boolean);
    const totalQ = Object.values(formatDistribution).reduce((a, b) => a + b, 0);
    const allocations = calculateChapterQuestionMap(
        chapterList,
        options.chapterWeights || {},
        totalQ
    );
    const weightageInstruction = buildWeightagePromptBlock(allocations);

    const formatInstructions: string[] = [];
    if (formatDistribution["mcq"]) {
        formatInstructions.push(`MCQ: ${formatDistribution["mcq"]} questions. 4 options (a)-(d), ONE correct, plausible distractors.`);
    }
    if (formatDistribution["assertion_reason"]) {
        formatInstructions.push(`ASSERTION-REASON: ${formatDistribution["assertion_reason"]} questions. "Assertion (A):... Reason (R):..." with standard 4 options.`);
    }
    if (formatDistribution["statement_based"]) {
        formatInstructions.push(`STATEMENT-BASED: ${formatDistribution["statement_based"]} questions. 3-4 statements (I),(II),(III),(IV). "Which are correct?"`);
    }
    if (formatDistribution["fill_blank"]) {
        formatInstructions.push(`FILL BLANKS: ${formatDistribution["fill_blank"]} questions. Test key terms/formulas. Single word/phrase answer.`);
    }

    const textbookContextBlock = textbookContent ? `\n## SOURCE MATERIAL (CRITICAL)\nYou MUST base your questions strictly on the following excerpt from the official textbook. Do not use outside knowledge if it conflicts with or goes beyond this material:\n\n${textbookContent}\n` : "";

    return `Expert ${board.toUpperCase()} Board setter for Class ${grade} ${subject}.

Generate EXACTLY ${totalQ} OBJECTIVE questions from: ${chapters}

${boardContext}
DIFFICULTY: ${diffInstruction}
${weightageInstruction}
${formatInstructions.join("\n")}
${textbookContextBlock}
RESPOND IN EXACT JSON (no markdown, no code blocks):
{"questions":[{"id":1,"type":"mcq","text":"...","options":["(a)...","(b)...","(c)...","(d)..."],"correctAnswer":"(b)...","explanation":"...","difficulty":"easy","chapter":"..."}]}

For fill_blank: set "options" to null.
RULES: EXACTLY ${totalQ} questions. All from specified chapters. 30% easy, 50% moderate, 20% hard. Grade-appropriate for Class ${grade}. Concise 1-2 sentence explanations. If Source Material provided, use it strictly. RETURN ONLY VALID JSON.`;
}

// ─── Markdown formatter ─────────────────────────────────────────────────────

function formatObjectiveToMarkdown(
    questions: ObjectiveQuestion[],
    board: string,
    grade: string,
    subject: string,
    totalQuestions: number,
    instituteName?: string
): string {
    let md = "";

    // Header
    if (instituteName) {
        md += `# ${instituteName}\n\n`;
    }
    md += `## ${board.toUpperCase()} Board — Class ${grade}\n`;
    md += `## ${subject} — Objective Assessment\n\n`;
    md += `> **Total Questions: ${totalQuestions} | Total Marks: ${totalQuestions} | Time: ${Math.ceil(totalQuestions * 0.75)} minutes**\n\n`;
    md += `> *Each question carries 1 mark. No negative marking.*\n\n`;
    md += `---\n\n`;

    // Group by type
    const mcqs = questions.filter(q => q.type === "mcq");
    const arQuestions = questions.filter(q => q.type === "assertion_reason");
    const stQuestions = questions.filter(q => q.type === "statement_based");
    const fbQuestions = questions.filter(q => q.type === "fill_blank");

    let qNum = 1;

    if (mcqs.length > 0) {
        md += `### SECTION A — Multiple Choice Questions\n\n`;
        md += `*Choose the correct option:*\n\n`;
        for (const q of mcqs) {
            md += `**${qNum}.** ${q.text}\n\n`;
            if (q.options) {
                for (const opt of q.options) {
                    md += `${opt}\n\n`;
                }
            }
            qNum++;
        }
        md += `---\n\n`;
    }

    if (arQuestions.length > 0) {
        md += `### SECTION B — Assertion-Reason Questions\n\n`;
        md += `*For each question, choose the correct option from (a) to (d):*\n\n`;
        for (const q of arQuestions) {
            md += `**${qNum}.** ${q.text}\n\n`;
            if (q.options) {
                for (const opt of q.options) {
                    md += `${opt}\n\n`;
                }
            }
            qNum++;
        }
        md += `---\n\n`;
    }

    if (stQuestions.length > 0) {
        md += `### SECTION C — Statement-Based Questions\n\n`;
        md += `*Read the statements carefully and choose the correct option:*\n\n`;
        for (const q of stQuestions) {
            md += `**${qNum}.** ${q.text}\n\n`;
            if (q.options) {
                for (const opt of q.options) {
                    md += `${opt}\n\n`;
                }
            }
            qNum++;
        }
        md += `---\n\n`;
    }

    if (fbQuestions.length > 0) {
        md += `### SECTION D — Fill in the Blanks\n\n`;
        md += `*Fill in the blanks with the correct word/term:*\n\n`;
        for (const q of fbQuestions) {
            md += `**${qNum}.** ${q.text}\n\n`;
            qNum++;
        }
        md += `---\n\n`;
    }

    return md;
}

// ─── Answer key formatter ───────────────────────────────────────────────────

function formatAnswerKey(questions: ObjectiveQuestion[]): string {
    let md = `## ANSWER KEY\n\n`;
    
    let qNum = 1;
    const ordered = [
        ...questions.filter(q => q.type === "mcq"),
        ...questions.filter(q => q.type === "assertion_reason"),
        ...questions.filter(q => q.type === "statement_based"),
        ...questions.filter(q => q.type === "fill_blank"),
    ];

    for (const q of ordered) {
        md += `**${qNum}.** ${q.correctAnswer}\n`;
        md += `*${q.explanation}*\n\n`;
        qNum++;
    }

    return md;
}

// ─── Main generation function ───────────────────────────────────────────────

import { getChaptersContent } from "./textbookLookup";

export async function generateObjective(
    board: string,
    grade: string,
    subject: string,
    chapters: string,
    options: GenerateObjectiveOptions = {}
): Promise<ObjectiveResult> {
    const questionCount = options.questionCount || 20;
    const formats = options.formats || ["mcq", "assertion_reason", "statement_based", "fill_blank"];

    const formatDistribution = calculateFormatDistribution(questionCount, formats);

    console.log(`[Objective Engine] Generating ${questionCount} questions for ${board} Class ${grade} ${subject}`);
    console.log(`[Objective Engine] Format distribution:`, formatDistribution);

    // Fetch scraped textbook content to ground the AI
    const chapterList = chapters.split(",").map(c => c.trim());
    const textbookContent = getChaptersContent(board, grade, subject, chapterList);
    if (textbookContent) {
        console.log(`[Objective Engine] Found scraped textbook content for grounding (${textbookContent.length} chars)`);
    } else {
        console.log(`[Objective Engine] No scraped textbook content found, relying on AI knowledge`);
    }

    const prompt = buildObjectivePrompt(board, grade, subject, chapters, formatDistribution, options, textbookContent);

    // Call OpenAI
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are an expert board exam question setter. Generate high-quality objective questions in valid JSON format. No markdown, no text outside JSON."
            },
            { role: "user", content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content || "";
    
    // Parse JSON response
    let questions: ObjectiveQuestion[] = [];
    try {
        let cleanJson = rawContent.trim();
        if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        
        const parsed = JSON.parse(cleanJson);
        questions = parsed.questions || [];
    } catch (parseError) {
        console.error("[Objective Engine] Failed to parse JSON response:", parseError);
        console.error("[Objective Engine] Raw content:", rawContent.substring(0, 500));
        
        const jsonMatch = rawContent.match(/\{[\s\S]*"questions"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                questions = parsed.questions || [];
            } catch {
                throw new Error("Failed to parse objective questions from AI response. Please try again.");
            }
        } else {
            throw new Error("AI did not return valid JSON. Please try again.");
        }
    }

    // Validate and fix question IDs
    questions = questions.map((q, i) => ({
        ...q,
        id: i + 1,
        type: q.type || "mcq",
        options: q.options || undefined,
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        difficulty: q.difficulty || "moderate"
    })) as ObjectiveQuestion[];

    // Format to markdown
    const content = formatObjectiveToMarkdown(
        questions, board, grade, subject, questions.length, options.instituteName
    );

    // Format answer key
    const answerKey = formatAnswerKey(questions);

    return {
        content,
        answerKey,
        questions,
        metadata: {
            totalQuestions: questions.length,
            formatDistribution,
            board,
            subject,
            grade
        }
    };
}

export { formatAnswerKey };
