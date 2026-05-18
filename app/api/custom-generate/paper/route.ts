import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subjectId, unitIds, subjectName, difficulty, marks, duration, questionType, instituteName, includeAnswerKey, guidelines } = await req.json();

        if (!subjectId || !unitIds || unitIds.length === 0) {
            return NextResponse.json({ error: "Subject and at least one unit required" }, { status: 400 });
        }

        // 1. Fetch knowledge from Firestore
        let combinedKnowledge = "";
        let unitNames: string[] = [];

        for (const unitId of unitIds) {
            const unitDoc = await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).get();
            if (unitDoc.exists) {
                const data = unitDoc.data()!;
                if (data.knowledgeText) {
                    combinedKnowledge += `\n\n## ${data.title}\n${data.knowledgeText}`;
                    unitNames.push(data.title);
                }
            }
        }

        if (!combinedKnowledge.trim()) {
            return NextResponse.json(
                { error: "No content found in selected units. Please upload materials first." },
                { status: 400 }
            );
        }

        // Truncate knowledge to avoid token overflow
        const maxKnowledgeChars = 15000;
        const knowledgeContext = combinedKnowledge.length > maxKnowledgeChars
            ? combinedKnowledge.substring(0, maxKnowledgeChars) + "\n[Content truncated]"
            : combinedKnowledge;

        // 2. PHASE 1: Parse guidelines into a structured blueprint
        //    If teacher provides guidelines like "10 MCQs Logical Reasoning, 10 MCQs Critical Thinking, 5 subjective 2 marks"
        //    we need to parse this into sections first
        let blueprint: { sections: { name: string; type: string; count: number; marksPerQuestion: number; instructions: string }[] };

        if (guidelines && guidelines.trim().length > 0) {
            // Use AI to parse the teacher's free-text guidelines into structured sections
            const planResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You parse exam pattern descriptions into structured JSON blueprints. Output ONLY valid JSON." },
                    { role: "user", content: `Parse this exam pattern into sections:

TEACHER'S EXAM PATTERN:
"""
${guidelines}
"""

TOTAL MARKS: ${marks}
QUESTION TYPE PREFERENCE: ${questionType}

Return a JSON object with sections. Each section should have:
- name: Section name (e.g., "Section A: Logical Reasoning MCQs")
- type: "mcq" or "subjective"
- count: Number of questions to generate
- marksPerQuestion: Marks per question
- instructions: Any special instructions

Rules:
1. Parse EVERY section the teacher mentioned. Do NOT skip any.
2. If they say "10 MCQs" for a topic, that's 10 questions of type "mcq".
3. If they say "5 questions × 2 marks", that's 5 questions, 2 marks each.
4. The sum of (count × marksPerQuestion) across all sections should equal ${marks}.

Return format:
{
  "sections": [
    { "name": "Section A: Logical Reasoning", "type": "mcq", "count": 10, "marksPerQuestion": 1, "instructions": "All compulsory" }
  ]
}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 2000,
            });

            blueprint = JSON.parse(planResponse.choices[0].message.content || '{"sections":[]}');
            console.log(`[Custom Paper] Parsed guidelines into ${blueprint.sections.length} sections:`, blueprint.sections.map(s => `${s.name}: ${s.count} × ${s.marksPerQuestion}m`));
        } else {
            // No guidelines — create a default blueprint based on marks and question type
            if (questionType === "MCQ") {
                blueprint = {
                    sections: [{ name: "Section A: MCQs", type: "mcq", count: marks, marksPerQuestion: 1, instructions: "All questions compulsory" }]
                };
            } else if (questionType === "Theory") {
                const longQCount = Math.floor(marks / 5);
                blueprint = {
                    sections: [{ name: "Section A: Theory Questions", type: "subjective", count: longQCount, marksPerQuestion: 5, instructions: "All questions compulsory" }]
                };
            } else {
                // Mixed
                const mcqCount = Math.floor(marks * 0.4);
                const shortCount = Math.floor((marks * 0.3) / 2);
                const longCount = Math.floor((marks * 0.3) / 5);
                blueprint = {
                    sections: [
                        { name: "Section A: MCQs", type: "mcq", count: mcqCount, marksPerQuestion: 1, instructions: "All questions compulsory" },
                        { name: "Section B: Short Answer", type: "subjective", count: shortCount, marksPerQuestion: 2, instructions: "All questions compulsory" },
                        { name: "Section C: Long Answer", type: "subjective", count: longCount, marksPerQuestion: 5, instructions: "All questions compulsory" }
                    ]
                };
            }
        }

        // 3. PHASE 2: Generate each section independently (MULTI-PASS)
        const allQuestions: any[] = [];
        let currentQId = 1;

        for (const section of blueprint.sections) {
            if (section.count <= 0) continue;

            const endQId = currentQId + section.count - 1;

            const sectionPrompt = `Generate EXACTLY ${section.count} questions for ONE section of a ${subjectName} exam.

SECTION: ${section.name}
TYPE: ${section.type}
MARKS PER QUESTION: ${section.marksPerQuestion}
QUESTIONS TO GENERATE: ${section.count}
QUESTION IDs: ${currentQId} to ${endQId}
SECTION INSTRUCTIONS: ${section.instructions}
DIFFICULTY: ${difficulty}

UNIT CONTENT (Generate ONLY from this):
${knowledgeContext}

${section.type === "mcq" ? `
For MCQ questions, use this format:
{
  "type": "mcq",
  "question": "Question text...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": 0,
  "marks": ${section.marksPerQuestion},
  "explanation": "Brief explanation"
}` : `
For subjective questions, use this format:
{
  "type": "subjective",
  "question": "Question text...",
  "marks": ${section.marksPerQuestion},
  "explanation": "Expected answer points"
}`}

Return a JSON object:
{
  "questions": [
    ... exactly ${section.count} question objects, IDs ${currentQId} to ${endQId}
  ]
}

CRITICAL RULES:
1. Generate EXACTLY ${section.count} questions. NOT MORE, NOT LESS. This is NON-NEGOTIABLE.
2. Each question object must have an "id" field starting from ${currentQId}.
3. All questions must come from the provided UNIT CONTENT only.
4. DO NOT stop early. You must output all ${section.count} questions.`;

            // Estimate tokens based on question type and count
            let maxTokens: number;
            if (section.type === "mcq") {
                // JSON MCQs need more tokens: question + 4 options + correctAnswer + explanation
                maxTokens = Math.max(section.count * 250, 2500);
            } else {
                maxTokens = Math.max(section.count * 350, 2500);
            }

            console.log(`[Custom Paper] Generating ${section.name}: ${section.count} questions, max_tokens=${maxTokens}`);

            let bestQuestions: any[] = [];
            const MAX_RETRIES = 2;

            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: `You are an expert examiner. You ALWAYS generate the EXACT number of questions requested. You never stop early. Output valid JSON only.` },
                            { role: "user", content: sectionPrompt }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.7,
                        max_tokens: Math.min(maxTokens, 16384),
                    });

                    const sectionContent = JSON.parse(completion.choices[0].message.content || "{}");
                    const questions = sectionContent.questions || [];

                    console.log(`[Custom Paper] ${section.name} attempt ${attempt + 1}: Expected ${section.count}, Got ${questions.length}`);

                    // Add section info to each question
                    const enrichedQuestions = questions.map((q: any, i: number) => ({
                        ...q,
                        id: currentQId + i,
                        section: section.name,
                        sectionInstruction: i === 0 ? section.instructions : undefined,
                    }));

                    if (enrichedQuestions.length > bestQuestions.length) {
                        bestQuestions = enrichedQuestions;
                    }

                    // Accept if we got at least 80% of expected
                    if (questions.length >= Math.ceil(section.count * 0.8)) {
                        break;
                    }
                } catch (err) {
                    console.error(`[Custom Paper] Error generating ${section.name} attempt ${attempt + 1}:`, err);
                    if (attempt === MAX_RETRIES && bestQuestions.length === 0) {
                        throw err;
                    }
                }
            }

            allQuestions.push(...bestQuestions);
            currentQId = endQId + 1;
        }

        // 4. Calculate totals and assemble
        const totalExpected = blueprint.sections.reduce((sum, s) => sum + s.count, 0);

        console.log(`[Custom Paper] FINAL: ${allQuestions.length}/${totalExpected} questions generated across ${blueprint.sections.length} sections`);

        const parsedContent = {
            instructions: `General Instructions:\n1. All questions are compulsory unless stated otherwise.\n2. Marks are indicated against each question.\n3. Total Marks: ${marks} | Duration: ${duration} minutes`,
            questions: allQuestions,
            metadata: {
                totalQuestions: allQuestions.length,
                expectedQuestions: totalExpected,
                isComplete: allQuestions.length >= Math.ceil(totalExpected * 0.8),
                sections: blueprint.sections.map(s => ({
                    name: s.name,
                    expected: s.count,
                    actual: allQuestions.filter(q => q.section === s.name).length
                }))
            }
        };

        return NextResponse.json({ content: parsedContent });
    } catch (error: any) {
        console.error("Error generating custom paper:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
