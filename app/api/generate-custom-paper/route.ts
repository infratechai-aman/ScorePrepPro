
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";
// Allow up to 120 seconds for multi-pass generation
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subject, units, marks, difficulty, type } = await req.json();

        if (!subject || !units || units.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // --- Phase 1: Blueprint Planning ---
        const planningPrompt = `
        You are an expert ${subject} examiner. Design a question paper blueprint.
        
        **Subject**: ${subject}
        **Units Covered**: ${units.join(", ")}
        **Total Marks**: ${marks}
        **Difficulty**: ${difficulty}
        **Question Types**: ${type}
        
        **RULES**:
        1. Distribute ${marks} marks logically.
        2. For subjective sections (Short/Long Answer), you MUST include internal choices (e.g., "Attempt any 4 of 6 questions"). Specify this in the blueprint.
        3. Make sure the total attemptable marks perfectly equals ${marks}.
        
        Return pure JSON:
        {
          "sections": [
             { "name": "Section A: MCQs", "marksPerQuestion": 1, "questionsToAttempt": 10, "questionsToGenerate": 10, "instructions": "All questions compulsory" },
             { "name": "Section B: Short Answer", "marksPerQuestion": 3, "questionsToAttempt": 4, "questionsToGenerate": 6, "instructions": "Attempt any 4 of the following 6. Give Scientific reasons." }
          ]
        }
        `;

        const planCompletion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: "You output perfect JSON blueprints." }, { role: "user", content: planningPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const blueprint = JSON.parse(planCompletion.choices[0].message.content || "{}");

        if (!blueprint.sections || blueprint.sections.length === 0) {
            return NextResponse.json({ error: "Failed to create paper blueprint" }, { status: 500 });
        }

        // --- Phase 2: Multi-Pass Section-by-Section Generation ---
        const allQuestions: any[] = [];
        let currentQId = 1;

        for (const section of blueprint.sections) {
            const genCount = section.questionsToGenerate || section.questionsToAttempt;

            const sectionPrompt = `
            Generate EXACTLY ${genCount} questions for ONE section of a ${subject} exam paper.

            **SECTION**: ${section.name}
            **MARKS PER QUESTION**: ${section.marksPerQuestion}
            **QUESTIONS TO GENERATE**: ${genCount}
            **SECTION INSTRUCTIONS**: ${section.instructions}
            **Units**: ${units.join(", ")}
            **Difficulty**: ${difficulty}

            **CRITICAL SOURCING RULES**:
            - Questions MUST primarily come from textbook chapter exercises.
            - Use end-of-chapter exercise questions, matching tables, and numericals.
            - **NO IMAGES OR DIAGRAMS**: ABSOLUTELY DO NOT generate any question that requires a figure, diagram, graph, map, or image.

            **FORMATTING RULES**:
            1. Generate EXACTLY ${genCount} questions. NOT MORE, NOT LESS.
            2. For "Case Based"/"Source Based" sections: provide a passage of AT LEAST 150-250 words with sub-questions (i), (ii), (iii), (iv).
            3. Question IDs must start from ${currentQId} and go to ${currentQId + genCount - 1}.

            Return pure JSON:
            {
                "questions": [
                    { "id": ${currentQId}, "section": "${section.name}", "sectionInstruction": "${section.instructions}", "text": "Question text...", "marks": ${section.marksPerQuestion}, "type": "${section.name.includes("MCQ") ? "MCQ" : "Subjective"}" }
                ]
            }

            CRITICAL: You MUST output EXACTLY ${genCount} question objects. Do NOT stop early.
            `;

            // Estimate max tokens needed
            let maxTokens = 4000;
            if (section.marksPerQuestion <= 1) {
                maxTokens = Math.max(genCount * 120, 2000);
            } else if (section.marksPerQuestion >= 5) {
                maxTokens = Math.max(genCount * 300, 2000);
            } else {
                maxTokens = Math.max(genCount * 200, 2000);
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `You are an expert examiner who outputs only valid JSON. You ALWAYS generate the EXACT number of questions requested. Never stop early.` },
                    { role: "user", content: sectionPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: Math.min(maxTokens, 16384),
            });

            const sectionContent = JSON.parse(completion.choices[0].message.content || "{}");
            const sectionQuestions = sectionContent.questions || [];

            console.log(`[Custom Paper] ${section.name}: Expected ${genCount}, Got ${sectionQuestions.length}`);

            // If we didn't get enough questions, retry once
            if (sectionQuestions.length < genCount) {
                console.log(`[Custom Paper] ${section.name}: Retrying...`);
                const retryCompletion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: `You are an expert examiner. You MUST generate EXACTLY ${genCount} questions. This is your second attempt because the first didn't produce enough. Output valid JSON only.` },
                        { role: "user", content: sectionPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                    max_tokens: Math.min(maxTokens * 1.5, 16384),
                });

                const retryContent = JSON.parse(retryCompletion.choices[0].message.content || "{}");
                const retryQuestions = retryContent.questions || [];

                if (retryQuestions.length > sectionQuestions.length) {
                    allQuestions.push(...retryQuestions);
                } else {
                    allQuestions.push(...sectionQuestions);
                }
            } else {
                allQuestions.push(...sectionQuestions);
            }

            currentQId += genCount;
        }

        // --- Phase 3: Assemble Final Paper ---
        const totalExpected = blueprint.sections.reduce((sum: number, s: any) => sum + (s.questionsToGenerate || s.questionsToAttempt), 0);
        console.log(`[Custom Paper] FINAL: ${allQuestions.length}/${totalExpected} questions generated`);

        const jsonContent = {
            title: `Subject: ${subject} | Total Marks: ${marks} | Difficulty: ${difficulty}`,
            instructions: "General Instructions:\n1. All questions are compulsory unless stated otherwise.\n2. Marks are indicated against each question.",
            questions: allQuestions,
            metadata: {
                totalQuestions: allQuestions.length,
                expectedQuestions: totalExpected,
                isComplete: allQuestions.length >= Math.ceil(totalExpected * 0.8)
            }
        };

        return NextResponse.json({ paper: jsonContent });

    } catch (error) {
        console.error("Error generating custom paper:", error);
        return NextResponse.json({ error: "Failed to generate paper" }, { status: 500 });
    }
}
