
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

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
        1. **Structure**: Start with a comma-separated list of topics covered. Then use clear headings, bullet points, and subheadings.
        2. **Study Friendly**: Explain complex concepts simply. Use analogies where helpful.
        3. **Highlight Important**: Pay special attention to topics marked as IMPORTANT.
        4. **Key Takeaways**: End with a summary of key points.
        5. **Format**: Return the response in clean Markdown.

        Make the notes detailed enough for a student to understand the unit completely without needing a textbook.
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
