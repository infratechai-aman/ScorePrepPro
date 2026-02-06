
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { constructPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { board, grade, subject, chapters, difficulty, chapterWeights } = await req.json();

        if (!board || !grade || !subject || !chapters) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const systemPrompt = constructPrompt(board, grade, subject, chapters, { difficulty, chapterWeights });

        if (!systemPrompt) {
            console.error("System prompt generation failed for:", { board, grade, subject });
            return NextResponse.json(
                { error: "Invalid board/subject configuration" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Correct model name for 4o mini
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the question paper now." },
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating paper:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate paper" },
            { status: 500 }
        );
    }
}
