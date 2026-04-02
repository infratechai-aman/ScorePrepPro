
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { constructSolutionPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
    try {
        const { paperContent, board, subject } = await req.json();

        if (!paperContent || !board) {
            return NextResponse.json(
                { error: "Missing paper content or board" },
                { status: 400 }
            );
        }

        const lines = paperContent.split('\n');
        const midPoint = Math.floor(lines.length / 2);
        
        let splitIndex = midPoint;
        for (let i = 0; i < lines.length; i++) {
            const offset = (i % 2 === 0 ? 1 : -1) * Math.floor(i / 2);
            const tryIdx = midPoint + offset;
            if (tryIdx > 0 && tryIdx < lines.length && lines[tryIdx].match(/^(### |\*\*|# |)Q\.\d+/i)) {
                splitIndex = tryIdx;
                break;
            }
        }
        
        const part1 = lines.slice(0, splitIndex).join('\n');
        const part2 = lines.slice(splitIndex).join('\n');
        const chunks = [part1, part2].filter(c => c.trim().length > 0);

        const isMathSubject = subject && (subject.toLowerCase().includes("math") || subject.toLowerCase().includes("algebra") || subject.toLowerCase().includes("geometry"));

        const completions = await Promise.all(chunks.map((chunk, index) => {
            const systemPrompt = constructSolutionPrompt(chunk, board, subject);
            const userPrompt = isMathSubject 
                ? `Generate the exhaustive Answer Key for this part of the paper (Part ${index + 1} of ${chunks.length}). Make sure your answers are EXTREMELY SHORT, directly showing the 2-3 essential mathematical steps. DO NOT write paragraphs.`
                : `Generate the Answer Key for this part of the paper (Part ${index + 1} of ${chunks.length}). PERFECTLY adapt the length of your answers based on the marks of each question as per the system instructions (1 mark = ONLY answer/no explanation, up to 5 marks = detailed points).`;
            return openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
            });
        }));

        const content = completions.map(c => c.choices[0].message.content).join("\n\n---\n\n");

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating solutions:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate solutions" },
            { status: 500 }
        );
    }
}
