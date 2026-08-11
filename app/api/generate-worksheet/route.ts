
import { NextResponse } from "next/server";
import { generateWorksheet } from "@/lib/generateWorksheet";

// Allow up to 120 seconds for generation
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { board, grade, subject, chapters, difficulty, chapterWeights, totalMarks, includeAnswerKey, instituteName } = await req.json();

        if (!board || !grade || !subject || !chapters) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const chaptersStr = Array.isArray(chapters) ? chapters.join(", ") : chapters;

        const result = await generateWorksheet(
            board,
            grade,
            subject,
            chaptersStr,
            {
                difficulty,
                chapterWeights,
                totalMarks: totalMarks || 40,
                includeAnswerKey: includeAnswerKey !== false,
                instituteName
            }
        );

        console.log(`[/api/generate-worksheet] Generated worksheet: ${result.metadata.totalMarks} marks, ${result.metadata.totalQuestions} questions`);

        return NextResponse.json({
            content: result.content,
            answerKey: result.answerKey,
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error("Error generating worksheet:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate worksheet" },
            { status: 500 }
        );
    }
}
