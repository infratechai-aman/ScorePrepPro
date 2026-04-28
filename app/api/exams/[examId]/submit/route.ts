import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { studentUid, studentName, answers, textAnswers, timeTaken } = await req.json();

        if (!studentUid) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if already submitted
        const submissionRef = adminDb.collection("exams").doc(examId).collection("submissions").doc(studentUid);
        const existingSubmission = await submissionRef.get();
        if (existingSubmission.exists) {
            return NextResponse.json({ error: "Already submitted this exam" }, { status: 400 });
        }

        // Get exam to evaluate
        const examDoc = await adminDb.collection("exams").doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const examData = examDoc.data()!;
        const isPaper = examData.type === "paper";

        if (isPaper) {
            // Subjective exam - no auto evaluation
            await submissionRef.set({
                studentName: studentName || "Guest Student",
                textAnswers: textAnswers || "",
                score: null,
                percentage: null,
                timeTaken: timeTaken || 0,
                submittedAt: FieldValue.serverTimestamp()
            });

            return NextResponse.json({ message: "Subjective exam submitted successfully!" });
        }

        // MCQ auto-evaluation
        const mcqs = examData.mcqs || [];
        let score = 0;
        const totalMarks = mcqs.length;
        const evaluation: { questionIndex: number; selectedAnswer: number; correctAnswer: number; isCorrect: boolean }[] = [];

        for (let i = 0; i < mcqs.length; i++) {
            const selectedAnswer = answers && answers[i] !== undefined ? answers[i] : -1;
            const correctAnswer = mcqs[i].correctAnswer;
            const isCorrect = selectedAnswer === correctAnswer;
            if (isCorrect) score++;
            evaluation.push({ questionIndex: i, selectedAnswer, correctAnswer, isCorrect });
        }

        const percentage = Math.round((score / totalMarks) * 100);

        await submissionRef.set({
            studentName: studentName || "Guest Student",
            answers: answers || {},
            evaluation,
            score,
            totalMarks,
            percentage,
            timeTaken: timeTaken || 0,
            submittedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ score, totalMarks, percentage, evaluation, message: "Exam submitted and evaluated!" });
    } catch (error: any) {
        console.error("Error submitting exam:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
