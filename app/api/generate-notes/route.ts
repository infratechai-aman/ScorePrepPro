
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
    try {
        const { subject, unit, topics } = await req.json();

        if (!subject || !unit || !topics) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const topicList = topics.map((t: any) => `- ${t.name} ${t.isImp ? '(IMPORTANT)' : ''}`).join("\n");

        const prompt = `
        You are an expert educational content creator. Create comprehensive, study-friendly notes for the following unit.

        Subject: ${subject}
        Unit: ${unit}
        
        Topics to Cover:
        ${topicList}

        Guidelines:
        1. **Structure Order**:
           - **First**: Write a "## Unit Overview" section (Brief introduction to the whole unit in 4-5 lines).
           - **Then**: Generate notes for **EACH** topic listed above using the "UNIVERSAL NOTES TEMPLATE".
        2. **Exclusions**:
           - **ABSOLUTELY NO "Exam Weightage" section**. Do not estimate marks.
           - OMIT sections like "Working/Process" if irrelevant to the topic.
        3. **Content Depth**: 
           - **Advantages/Disadvantages**: List at least 4-5 points each.
           - **Tables**: MUST have a blank line between every row to render correctly in Markdown.
           - **Diagrams**: Use the text-based blueprint style for processes.

        📘 **UNIVERSAL NOTES TEMPLATE (For Each Topic)**
        
        # [Topic Name]
        
        ### 1. Definition
        > **Definition**: [Short, direct explanation]
        
        ### 2. Core Concept
        *   [Point 1]
        *   [Point 2]
        *   [Point 3]
        *   [Point 4]
        *   [Point 5]
        
        ### 3. Diagram / Blueprint (If Applicable)
        > **Blueprint**:
        > \`\`\`text
        > [Input]  --->  [Process]  --->  [Output]
        > \`\`\`
        
        ### 4. Working / Process (OMIT IF IRRELEVANT)
        1. [Step 1]
        2. [Step 2]
        
        ### 5. Key Components (OMIT IF IRRELEVANT)
        *   **[Component]**: [Desc]
        
        ### 6. Advantages & Disadvantages (Required for comparison topics)
        *   ✅ **Advantages**: [Point 1], [Point 2], [Point 3], [Point 4]
        *   ❌ **Disadvantages**: [Point 1], [Point 2], [Point 3], [Point 4]
        
        ### 7. Comparison (If Applicable)
        | Feature | Topic A | Topic B |
        | :--- | :--- | :--- |
        | Point 1 | Val A | Val B |
        
        | Point 2 | Val A | Val B |
        *(Add blank lines between rows)*

        ### 8. Real-World Examples
        *   [Example 1]
        *   [Example 2]
        
        ### 9. Quick Revision
        > **Quick Revision**:
        > *   **Keywords**: [Keywords...]
        > *   **Takeaway**: [One line summary]

        **Format Rules**:
        - **NO EMOJIS** (Except checks/crosses in Adv/Disadv).
        - **NO Exam Weightage**.
        - Blockquotes for Definitions/Revision.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful and knowledgeable AI tutor." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
    }
}
