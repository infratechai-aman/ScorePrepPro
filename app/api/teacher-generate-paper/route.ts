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
        You are an expert examiner for ${subject}. Create a professional, flawless question paper.

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

        **MANDATORY GOLDEN RULES FOR FORMATTING (NON-NEGOTIABLE)**:
        1. **Spacing**: You MUST leave exactly ONE blank line between EVERY single question. Do not clump questions together.
        2. **Numbering**: 
           - Use strictly **Q.1**, **Q.2**, **Q.3** for main questions. 
           - Use **(i)**, **(ii)**, **(iii)** for sub-questions or options (like MCQs). 
        3. **Marks Display**: Always display marks at the end of the question or section header in bold, e.g., **[1 Mark]** or **[1x5=5 Marks]**.
        4. **Matching Questions**: If you generate a "Match the following" question, you MUST use a Markdown table.
        5. **Layout**: Center the College Name and Title at the top using HTML center tags.
        6. **Source**: Extract questions primarily from standard textbook chapter exercises.
        ${includeAnswerKey ? "7. **Answer Key**: Add a clear 'Answer Key' section at the end, separated by a horizontal rule." : "7. **No Answers**: DO NOT include any answers or hints."}

        **OUTPUT FORMAT TEMPLATE**:
        
        <center>
        <h1>${collegeName ? collegeName : "EXAMINATION PAPER"}</h1>
        <h3>${title}</h3>
        </center>
        
        **Subject**: ${subject} | **Time**: ${duration} Mins | **Max Marks**: ${totalMarks}
        
        ---
        
        **General Instructions:**
        1. All questions are compulsory unless specified otherwise.
        2. Marks are indicated against each question.
        
        ---
        
        ### [Section Name]
        *(If the section requires internal choices, write the instruction here in italics, e.g., "Attempt any 4 of the following 6. Give scientific reasons where applicable.")*
        
        **Q.1 [Question Text]** **[X Mark(s)]**
        
        (a) [Option 1]
        (b) [Option 2]
        (c) [Option 3]
        (d) [Option 4]

        **Q.2 [Next Question Text]** **[X Mark(s)]**
        
        ...
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
