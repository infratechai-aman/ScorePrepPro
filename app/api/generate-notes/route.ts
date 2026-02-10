
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
        1. **Strict Structure**: Follow the "UNIVERSAL NOTES TEMPLATE" below, but use your intelligence to **OMIT** sections that are completely irrelevant to the specific topic (e.g., do not invent a "Working/Process" for a purely theoretical definition).
        2. **Content Depth**: 
           - If the topic is explicitly "Advantages & Disadvantages", you MUST list at least 4-5 points for each, not just 2.
           - Keep content **BRIEF** and **TO THE POINT**. No fluff.
        3. **Formatting**:
           - **Tables**: Ensure all tables are properly formatted with newlines between rows so they render correctly.
           - **No Emojis**: Do not use emojis in headers or text.

        📘 **UNIVERSAL NOTES TEMPLATE**
        
        # [Topic Name]
        
        ### 1. Definition
        > **Definition**: [Short, direct explanation (2-3 lines max)]
        
        ### 2. Core Concept
        *   [Point 1]
        *   [Point 2]
        *   [Point 3]
        *   [Point 4]
        *   [Point 5]
        *(Bullet points only, no long paragraphs)*

        ### 3. Diagram / Flowchart (IF REQUIRED)
        > **Blueprint**:
        > \`\`\`text
        > [Input]  --->  [Process]  --->  [Output]
        >                   |
        >                   v
        >             [Feedback]
        > \`\`\`
        *(Use simple text-based diagrams for processes/structures)*
        
        ### 4. Working / Process / Flow (OMIT IF NOT APPLICABLE)
        1.  [Step 1]
        2.  [Step 2]
        3.  [Step 3]
        
        ### 4. Key Components
        *   **[Component A]**: [Brief description]
        *   **[Component B]**: [Brief description]
        
        ### 5. Advantages & Disadvantages (Expand if this is the main topic)
        *   **Advantages**: [Point 1], [Point 2], [Point 3], [Point 4]
        *   **Disadvantages**: [Point 1], [Point 2], [Point 3], [Point 4]
        
        ### 6. Real-World Examples
        *   Example 1: [Example]
        *   Example 2: [Example]
        
        ### 7. Important Points (IMP)
        > **IMP**: 
        > *   **Keyword**: [Definition]
        > *   **Trap**: [Common mistake students make]
        > *   **Fact**: [Key fact for exams]

        ### 8. Comparison (If applicable)
        | Feature | This Topic | Related Concept |
        | :--- | :--- | :--- |
        | [Feature 1] | [Value] | [Value] |
        | [Feature 2] | [Value] | [Value] |
        *(Ensure newlines between table rows)*

        ### 9. Exam Answer Frame (5-Marks)
        *   **Definition**: [One line]
        *   **Working**: [Step-by-step]
        *   **Example**: [Real world]
        *   **Conclusion**: [One line summary]
        
        ### 10. Quick Revision Box
        > **Quick Revision**:
        > *   **Keywords**: [Keyword 1], [Keyword 2], [Keyword 3]
        > *   **Concept**: [One line summary]

        **Format Rules**:
        - Use clean Markdown. 
        - **NO EMOJIS**.
        - Blockquotes (>) for Definitions, IMP, Revision.
        - Bold (**text**) key terms.
        - **Tables MUST have newlines**.
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
