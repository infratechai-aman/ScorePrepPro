// AI Knowledge Engine — Processes extracted text into permanent unit knowledge
// This is the "AI Memory" system: upload once → AI remembers forever

import { openai } from "./openai";

export interface KnowledgeData {
    summary: string;
    concepts: string[];
    definitions: { term: string; definition: string }[];
    formulas: string[];
    keyTopics: string[];
    potentialQuestions: string[];
    fullKnowledge: string; // Complete processed text for generation context
}

export async function processContentToKnowledge(
    rawText: string,
    subjectName: string,
    unitTitle: string
): Promise<KnowledgeData> {
    // Chunk text if too long (GPT context limits)
    const maxChars = 25000;
    const textToProcess = rawText.length > maxChars
        ? rawText.substring(0, maxChars) + "\n\n[Content truncated for processing - full text stored separately]"
        : rawText;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are an expert educational content analyzer. Your job is to deeply understand teaching material and extract structured knowledge that can be used for generating question papers, notes, MCQs, and study materials later.

You must output VALID JSON only. No markdown, no code blocks, just raw JSON.`
            },
            {
                role: "user",
                content: `Analyze this teaching material for "${subjectName}" — Unit: "${unitTitle}".

CONTENT:
${textToProcess}

Extract and return this JSON structure:
{
  "summary": "A comprehensive 4-6 line summary of what this unit covers",
  "concepts": ["concept1", "concept2", ...],
  "definitions": [{"term": "...", "definition": "..."}, ...],
  "formulas": ["formula1 with explanation", ...],
  "keyTopics": ["topic1", "topic2", ...],
  "potentialQuestions": ["question1", "question2", ...],
  "fullKnowledge": "A detailed, organized version of ALL the content that preserves every important piece of information. This will be used as context for AI generation later. Include all concepts, examples, definitions, formulas, and details."
}`
            }
        ],
        temperature: 0.3,
        max_tokens: 8000,
    });

    const content = response.choices[0].message.content || "{}";

    try {
        // Try to parse, handle cases where GPT wraps in markdown code block
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const parsed = JSON.parse(cleanContent) as KnowledgeData;
        return parsed;
    } catch (e) {
        console.error("Failed to parse knowledge JSON, returning fallback:", e);
        return {
            summary: "Content processed but structured extraction failed. Raw content preserved.",
            concepts: [],
            definitions: [],
            formulas: [],
            keyTopics: [],
            potentialQuestions: [],
            fullKnowledge: textToProcess
        };
    }
}

export async function generateFromKnowledge(
    knowledgeText: string,
    subjectName: string,
    unitTitle: string,
    generationType: "paper" | "notes" | "mcqs",
    options: {
        difficulty?: string;
        marks?: number;
        duration?: number;
        questionType?: string; // MCQ, Theory, Mixed
        notesType?: string; // short, detailed, revision, worksheet, summary
        mcqCount?: number;
        includeAnswerKey?: boolean;
        guidelines?: string;
    } = {}
): Promise<string> {
    const { difficulty = "medium", marks = 50, duration = 60, questionType = "Mixed", notesType = "detailed", mcqCount = 10, includeAnswerKey = false, guidelines = "" } = options;

    let systemPrompt = "";
    let userPrompt = "";

    if (generationType === "paper") {
        systemPrompt = `You are an expert examiner. Generate a professional question paper STRICTLY from the provided unit content in JSON format. Do NOT use any outside knowledge.`;
        userPrompt = `Generate a ${questionType} question paper for:
Subject: ${subjectName}
Unit: ${unitTitle}
Difficulty: ${difficulty}
Total Marks: ${marks}
Duration: ${duration} minutes

UNIT CONTENT (Generate ONLY from this):
${knowledgeText}

Output format MUST be a JSON object:
{
  "instructions": "General instructions for the exam",
  "questions": [
    {
      "type": "mcq",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": 0,
      "marks": 2,
      "explanation": "..."
    },
    {
      "type": "subjective",
      "question": "...",
      "marks": 5,
      "explanation": "..."
    }
  ]
}

- For "mcq" type, correctAnswer is the index (0-3) of the correct option.
- For "subjective" type, do not include "options" or "correctAnswer".
- Ensure the total marks roughly equal ${marks}.
- ${questionType === "MCQ" ? "Make ALL questions 'mcq' type." : questionType === "Theory" ? "Make ALL questions 'subjective' type." : "Mix 'mcq' and 'subjective' types."}

${guidelines ? `CRITICAL STRUCTURE GUIDELINES PROVIDED BY THE TEACHER:\n"""\n${guidelines}\n"""\n\nYou MUST EXACTLY follow the structure requested above. For example, if it says "5 mcqs, 4 5-mark questions", generate exactly that. Format the questions to match the guidelines perfectly while maintaining the JSON schema.` : ''}

ONLY output the JSON object, nothing else.`;
    } else if (generationType === "notes") {
        systemPrompt = `You are a premium educational content creator. Generate beautiful, well-structured study notes STRICTLY from the provided content. Use rich markdown formatting.`;
        userPrompt = `Generate ${notesType} notes for:
Subject: ${subjectName}
Unit: ${unitTitle}

UNIT CONTENT (Generate ONLY from this):
${knowledgeText}

${notesType === "short" ? "Keep notes concise - key points only, bullet format." :
notesType === "revision" ? "Create quick revision notes with key terms, formulas, and one-liner summaries." :
notesType === "worksheet" ? "Create a practice worksheet with fill-in-the-blanks, true/false, and short answer questions." :
notesType === "summary" ? "Create a one-page summary covering all major points." :
"Create detailed, comprehensive notes with definitions, explanations, examples, tables, and important points."}

Use markdown formatting: headings, bold, blockquotes for definitions, tables for comparisons, bullet points.`;
    } else if (generationType === "mcqs") {
        systemPrompt = `You are an MCQ question generator. Generate high-quality MCQs STRICTLY from the provided content. Each MCQ must have exactly 4 options with one correct answer.`;
        userPrompt = `Generate ${mcqCount} MCQs for:
Subject: ${subjectName}
Unit: ${unitTitle}
Difficulty: ${difficulty}

UNIT CONTENT (Generate ONLY from this):
${knowledgeText}

Output format for EACH MCQ (use this EXACT JSON format):
Return a JSON object:
{
  "mcqs": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}

correctAnswer is the index (0-3) of the correct option.
Make questions varied: recall, application, analysis.
ONLY output the JSON object, nothing else.`;
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: generationType === "mcqs" ? 0.3 : 0.7,
        max_tokens: generationType === "mcqs" ? 6000 : 10000,
        ...((generationType === "paper" || generationType === "mcqs") ? { response_format: { type: "json_object" } } : {})
    });

    return response.choices[0].message.content || "";
}
