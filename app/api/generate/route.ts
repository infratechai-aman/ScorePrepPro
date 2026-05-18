
import { NextResponse } from "next/server";
import { generatePaperComplete } from "@/lib/generatePaperComplete";

// Allow up to 120 seconds for multi-pass generation
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { board, grade, subject, chapters, difficulty, chapterWeights, marks, instituteName } = await req.json();

        if (!board || !grade || !subject || !chapters) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const chaptersStr = Array.isArray(chapters) ? chapters.join(", ") : chapters;

        const result = await generatePaperComplete(
            board,
            grade,
            subject,
            chaptersStr,
            {
                difficulty,
                chapterWeights,
                totalMarks: marks,
                instituteName
            }
        );

        console.log(`[/api/generate] Paper generated: ${result.metadata.totalQuestions}/${result.metadata.expectedQuestions} questions, ${result.metadata.totalMarks} marks, complete: ${result.metadata.isComplete}`);

        return NextResponse.json({
            content: result.content,
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error("Error generating paper:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate paper" },
            { status: 500 }
        );
    }
}
