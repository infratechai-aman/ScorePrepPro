
import { NextResponse } from "next/server";
import { generateObjective } from "@/lib/generateObjective";

// Allow up to 120 seconds for generation
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { board, grade, subject, chapters, difficulty, chapterWeights, questionCount, formats, instituteName } = await req.json();

        if (!board || !grade || !subject || !chapters) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const chaptersStr = Array.isArray(chapters) ? chapters.join(", ") : chapters;

        const result = await generateObjective(
            board,
            grade,
            subject,
            chaptersStr,
            {
                difficulty,
                chapterWeights,
                questionCount: questionCount || 20,
                formats: formats || ["mcq", "assertion_reason", "statement_based", "fill_blank"],
                instituteName
            }
        );

        console.log(`[/api/generate-objective] Generated ${result.metadata.totalQuestions} objective questions`);

        return NextResponse.json({
            content: result.content,
            answerKey: result.answerKey,
            questions: result.questions,
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error("Error generating objective paper:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate objective paper" },
            { status: 500 }
        );
    }
}
