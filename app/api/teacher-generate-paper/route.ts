import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { subject, units, pattern, totalMarks, title, duration } = await req.json();

        // units: [{ name: "Unit 1", weight: 20 }, ...]
        // pattern: [{ name: "Section A", type: "MCQ", count: 5, marksPerQuestion: 1 }, ...]

        const unitList = units.map((u: any) => `- ${u.name} (Approx. ${u.weight}% weightage)`).join("\n");
        const patternList = pattern.map((s: any) =>
            `- **${s.name}**: ${s.count} Questions (${s.type}). ${s.marksPerQuestion} Marks each.`
        ).join("\n");

        const prompt = `
        You are an expert examiner for ${subject}. Create a professional question paper.

        **Paper Details**:
        - **Title**: ${title}
        - **Subject**: ${subject}
        - **Time**: ${duration} Minutes
        - **Max Marks**: ${totalMarks}

        **Syllabus & Weightage**:
        ${unitList}
        *(Distribute questions across units based on the weightage percentages provided. High weightage units should have more questions.)*

        **Question Paper Pattern (STRICTLY FOLLOW THIS)**:
        ${patternList}

        **Instructions**:
        1. create specific, high-quality academic questions.
        2. **Do not** provide answers/solutions in this output. Only questions.
        3. Ensure the total marks sum up to exactly ${totalMarks}.
        4. If a section is "Diagram/Map", ask students to draw/label a specific diagram.
        5. Use clear, professional Markdown formatting.

        **Output Format**:
        # ${title}
        **Subject**: ${subject}
        **Time**: ${duration} Mins | **Max Marks**: ${totalMarks}
        
        ---
        
        ## General Instructions:
        1. All questions are compulsory.
        2. Figures to the right indicate full marks.
        
        ---
        
        ### [Section Name]
        **[Question Type]** ([Marks] Marks each)
        
        1. [Question]
        2. [Question]
        ...
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a vital assistant for a teacher. Generate high-quality exam papers." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating teacher paper:", error);
        return NextResponse.json({ error: "Failed to generate paper" }, { status: 500 });
    }
}
