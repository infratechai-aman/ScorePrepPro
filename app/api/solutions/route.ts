
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

        const isMathSubject = subject && (subject.toLowerCase().includes("math") || subject.toLowerCase().includes("algebra") || subject.toLowerCase().includes("geometry"));

        // Split into 2 chunks only if paper is very long (>6000 chars), else send whole
        const CHUNK_THRESHOLD = 6000;
        let chunks: string[];

        if (paperContent.length <= CHUNK_THRESHOLD) {
            chunks = [paperContent];
        } else {
            // Split at a section boundary or question boundary near the midpoint
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
            chunks = [part1, part2].filter(c => c.trim().length > 0);
        }

        const completions = await Promise.all(chunks.map((chunk, index) => {
            const systemPrompt = constructSolutionPrompt(chunk, board, subject);
            const userPrompt = isMathSubject
                ? `Generate the Answer Key for this ${chunks.length > 1 ? `part (Part ${index + 1} of ${chunks.length}) of the` : ""} paper. COPY question numbers EXACTLY from the paper (Q.1, Q.2, etc). Show essential mathematical steps only (1-2 lines per step).`
                : `Generate the Answer Key for this ${chunks.length > 1 ? `part (Part ${index + 1} of ${chunks.length}) of the` : ""} paper. CRITICAL: COPY the question numbers EXACTLY as they appear in the paper (e.g. Q.1, Q.2... Q.20). Do NOT renumber. Adapt answer length to marks allocated.`;
            return openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
            });
        }));

        const content = completions.map(c => c.choices[0].message.content).join("\n\n");

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating solutions:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate solutions" },
            { status: 500 }
        );
    }
}
