
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { constructSolutionPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { paperContent, board } = await req.json();

        if (!paperContent || !board) {
            return NextResponse.json(
                { error: "Missing paper content or board" },
                { status: 400 }
            );
        }

        const systemPrompt = constructSolutionPrompt(paperContent, board);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the Answer Key now." },
            ],
            temperature: 0.3, // Lower temperature for more factual/solution-based output
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating solutions:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate solutions" },
            { status: 500 }
        );
    }
}
