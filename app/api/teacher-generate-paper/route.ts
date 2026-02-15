import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { subject, units, pattern, totalMarks, title, duration, collegeName, includeAnswerKey } = await req.json();

        // units: [{ name: "Unit 1", weight: 20 }, ...]
        // pattern: [{ name: "Section A", type: "MCQ", count: 5, marksPerQuestion: 1 }, ...]

        const unitList = units.map((u: any) => `- ${u.name} (Approx. ${u.weight}% weightage)`).join("\n");
        const patternList = pattern.map((s: any) =>
            `- **${s.name}**: ${s.count} Questions (${s.type}). ${s.marksPerQuestion} Marks each.`
        ).join("\n");

        const prompt = `
        You are an expert examiner for ${subject}. Create a professional question paper.

        **College/Institute**: ${collegeName ? collegeName : "Your Institute Name"}
        
        **Paper Details**:
        - **Title**: ${title}
        - **Subject**: ${subject}
        - **Time**: ${duration} Minutes
        - **Max Marks**: ${totalMarks}

        **Syllabus & Weightage (STRICTLY ADHERE)**:
        ${unitList}
        *(IMPORTANT: Do NOT ask questions from topics outside these units.)*

        **Question Paper Pattern (STRICTLY FOLLOW THIS)**:
        ${patternList}

        **Instructions**:
        1. Create specific, high-quality academic questions.
        2. **Numbering**: Use strictly 1. 2. 3. ... across sections (or restart if typical for this subject, but be consistent).
        3. **Formatting**: Center the College Name and Title if possible (use HTML <center> tags or markdown centering).
        4. **Scope**: Questions must be ONLY from the listed units.
        5. **Question Sourcing**: Questions should primarily come from textbook chapter exercises. Use end-of-chapter exercise questions including matching tables, conceptual questions, and numericals with actual textbook data/values. Minimize inventing original questions.
        ${includeAnswerKey ? "6. **Answer Key**: After the question paper, provide a brief 'Answer Key' section." : "6. **No Answers**: Do NOT provide answers/solutions."}

        **Output Format**:
        
        <center>
        # ${collegeName ? collegeName : "EXAMINATION PAPER"}
        ### ${title}
        </center>
        
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

        ${includeAnswerKey ? `
        ---
        ## Answer Key
        1. [Brief Answer]
        2. [Brief Answer]
        ...` : ""}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a professional examiner. Generate high-quality exam papers with precise formatting." },
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
