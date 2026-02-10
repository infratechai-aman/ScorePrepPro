
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
        1. **Strict Structure**: You MUST follow this exact "UNIVERSAL NOTES TEMPLATE" for the notes. Do not skip sections unless absolutely irrelevant.

        📘 **UNIVERSAL NOTES TEMPLATE**
        
        # [Topic Name]
        
        ### 1️⃣ Exam Weightage
        **Weightage**: [High/Medium/Low] (Estimate based on standard curriculum)
        
        ### 2️⃣ Definition
        > **Definition**: [Short, direct explanation (2-3 lines max)]
        
        ### 3️⃣ Core Concept
        *   [Point 1]
        *   [Point 2]
        *   [Point 3]
        *   [Point 4]
        *   [Point 5]
        *(Bullet points only, no long paragraphs)*
        
        ### 4️⃣ Working / Process / Flow
        1.  [Step 1]
        2.  [Step 2]
        3.  [Step 3]
        
        ### 5️⃣ Key Components
        *   **[Component A]**: [Brief description]
        *   **[Component B]**: [Brief description]
        
        ### 6️⃣ Advantages & Disadvantages
        *   ✅ **Advantages**: [Point 1], [Point 2]
        *   ❌ **Disadvantages**: [Point 1], [Point 2]
        
        ### 7️⃣ Real-World Examples
        *   Example 1: [Example]
        *   Example 2: [Example]
        
        ### 8️⃣ Important Points (IMP)
        > 💡 **IMP**: 
        > *   **Keyword**: [Definition]
        > *   **Trap**: [Common mistake students make]
        > *   **Fact**: [Key fact for exams]

        ### 9️⃣ Comparison (If applicable)
        | Feature | This Topic | Related Concept |
        | :--- | :--- | :--- |
        | [Feature 1] | [Value] | [Value] |
        | [Feature 2] | [Value] | [Value] |

        ### 🔟 Exam Answer Frame (5-Marks)
        *   **Definition**: [One line]
        *   **Working**: [Step-by-step]
        *   **Example**: [Real world]
        *   **Conclusion**: [One line summary]
        
        ### 1️⃣1️⃣ Quick Revision Box
        > 🚀 **Quick Revision**:
        > *   **Keywords**: [Keyword 1], [Keyword 2], [Keyword 3]
        > *   **Concept**: [One line summary]

        **Format Rules**:
        - Use clean Markdown. 
        - Use emojis as section icons where appropriate (like above).
        - Use Blockquotes (>) for Definitions, IMP sections, and Revision Boxes to make them stand out stylistically.
        - Bold (**text**) key terms.
        - Keep it "Exam Ready" and "Aesthetic".
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
