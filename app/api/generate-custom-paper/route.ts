
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { subject, units, marks, difficulty, type } = await req.json();

        if (!subject || !units || units.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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

        const generationPrompt = `
        Create the actual custom question paper based EXACLTY on this blueprint:
        ${JSON.stringify(blueprint, null, 2)}
        
        **Subject**: ${subject}
        **Units**: ${units.join(", ")}

        **CRITICAL SOURCING RULES**:
        - Questions MUST primarily come from textbook chapter exercises.
        - Use end-of-chapter exercise questions, matching tables, and numericals.
        - **NO IMAGES OR DIAGRAMS**: ABSOLUTELY DO NOT generate any question that requires a figure, diagram, graph, map, or image.

        **CRITICAL FORMATTING RULES**:
        1. For Sections with "questionsToGenerate" > "questionsToAttempt", you MUST generate the higher number of questions.
        2. In those sections, add a dummy question text element at the start of the section like: "Attempt any ${"N"} of the following ${"M"} questions. Give scientific reasons where applicable."
        3. **CASE STUDY/PASSAGE LENGTH**: For any "Case Based", "Source Based", or "Passage" sections, you MUST provide a massive, highly detailed reading passage of AT LEAST 150-250 words total. Do NOT provide 1-2 sentence snippets.
        4. **CASE STUDY SUB-QUESTIONS**: Every Case Based or Source Based question MUST be broken down into multiple distinctly numbered sub-questions (e.g., (i), (ii), (iii), (iv)) inside the general text.

        Return pure JSON:
        {
            "title": "Subject: ${subject}...",
            "instructions": "General instructions...",
            "questions": [
                { "id": 1, "section": "Section A: MCQs", "text": "Question text...", "marks": 1, "type": "MCQ" }
            ]
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert examiner who outputs only valid JSON representing the paper." },
                { role: "user", content: generationPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;

        // Parse JSON to ensure validity
        const jsonContent = JSON.parse(content || "{}");

        return NextResponse.json({ paper: jsonContent });

    } catch (error) {
        console.error("Error generating custom paper:", error);
        return NextResponse.json({ error: "Failed to generate paper" }, { status: 500 });
    }
}
