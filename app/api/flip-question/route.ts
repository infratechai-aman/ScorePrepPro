
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const { subject, unit, oldQuestion, type, marks } = await req.json();

        if (!subject || !oldQuestion) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const prompt = `
        The user wants to "flip" (change) a specific question in an exam paper.
        Generate a **different** question of the same type and marks, covering the same subject/unit.

        **Subject**: ${subject}
        **Old Question**: "${oldQuestion.text}"
        **Marks**: ${marks}
        **Type**: ${type}

        **Requirement**:
        1. Return a single JSON object for the new question.
        2. Format: { "text": "New question text...", "marks": ${marks}, "type": "${type}" }
        3. Ensure it is NOT the same as the old question.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert examiner. Output only valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });

        const content = completion.choices[0].message.content;
        const newQuestion = JSON.parse(content || "{}");

        return NextResponse.json({ newQuestion });

    } catch (error) {
        console.error("Error flipping question:", error);
        return NextResponse.json({ error: "Failed to flip question" }, { status: 500 });
    }
}
