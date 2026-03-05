
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { subject, units, marks, difficulty, type } = await req.json();

        if (!subject || !units || units.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `
        Create a custom question paper for the following subject and units.

        **Subject**: ${subject}
        **Units Covered**: ${units.join(", ")}
        **Total Marks**: ${marks}
        **Difficulty**: ${difficulty}
        **Question Types**: ${type} (Mixed = MCQ + Short + Long)

        **Question Sourcing**:
        - Questions MUST primarily come from textbook chapter exercises for the selected units
        - Use end-of-chapter exercise questions, including matching tables, conceptual questions, and numericals
        - For numericals, use the given data and values from textbook exercise problems
        - Minimize inventing original questions — textbook exercises should be the primary source
        - **NO IMAGES OR DIAGRAMS**: ABSOLUTELY DO NOT generate any question that requires a figure, diagram, graph, map, or image. All questions MUST be purely text-based.

        **Instructions**:
        1. create a balanced question paper covering all selected units.
        2. Strictly follow the marks distribution to equal exactly ${marks} marks.
        3. Return the response as a valid JSON object with the following structure:
        {
            "title": "Subject: ${subject}...",
            "instructions": "General instructions...",
            "questions": [
                { "id": 1, "section": "Section A", "text": "Question text...", "marks": 1, "type": "MCQ" }
            ]
        }
        4. Do NOT wrap in markdown code blocks. Just raw JSON.
        
        **CRITICAL REQUIREMENTS FOR SECTIONS**:
        1. **INTERNAL CHOICES**: For ANY subjective section (Short Answer, Long Answer, etc.) that requires multiple questions, you MUST provide internal choices.
           - Generate MORE questions than required. 
           - Prepend the text "Attempt any N of the following M questions." at the start of that section's questions. 
           - Example: If you need 4 questions worth 3 marks each (12 marks total), generate 6 questions and add "Attempt any 4 of the following 6 questions." The math must remain perfect.
        2. **CASE STUDY/PASSAGE LENGTH**: For any "Case Based", "Source Based", or "Passage" sections, you MUST provide a massive, highly detailed reading passage of AT LEAST 150-250 words total. Do NOT provide 1-2 sentence snippets.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert examiner who outputs only valid JSON." },
                { role: "user", content: prompt }
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
