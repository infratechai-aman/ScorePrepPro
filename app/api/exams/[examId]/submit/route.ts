import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { studentUid, studentName, rollNo, answers, textAnswers, timeTaken } = await req.json();

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

        if (isPaper && !examData.structuredPaper) {
            // Legacy Subjective exam - no auto evaluation
            await submissionRef.set({
                studentName: studentName || "Guest Student",
                rollNo: rollNo || "",
                textAnswers: textAnswers || "",
                score: null,
                percentage: null,
                timeTaken: timeTaken || 0,
                submittedAt: FieldValue.serverTimestamp()
            });

            return NextResponse.json({ message: "Subjective exam submitted successfully!" });
        }

        let mcqs = [];
        let totalMarks = 0;
        let hasSubjective = false;

        if (isPaper && examData.structuredPaper) {
            const questions = examData.structuredPaper.questions || [];
            hasSubjective = questions.some((q: any) => q.type === "subjective");
            mcqs = questions.map((q: any) => q.type === "mcq" ? q : null);
            totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
        } else {
            mcqs = examData.mcqs || [];
            totalMarks = mcqs.length;
        }

        let score = 0;
        const evaluation: { questionIndex: number; selectedAnswer?: number; correctAnswer?: number; isCorrect?: boolean; textAnswer?: string; isSubjective?: boolean }[] = [];

        for (let i = 0; i < mcqs.length; i++) {
            if (isPaper && examData.structuredPaper && mcqs[i] === null) {
                // It's a subjective question in a structured paper
                evaluation.push({
                    questionIndex: i,
                    isSubjective: true,
                    textAnswer: answers?.[i] || ""
                });
                continue;
            }

            // MCQ evaluation
            const selectedAnswer = answers && answers[i] !== undefined ? parseInt(answers[i]) : -1;
            let correctAnswer = isPaper ? mcqs[i]?.correctAnswer : examData.mcqs[i].correctAnswer;
            if (correctAnswer === undefined) correctAnswer = -1; // Fallback to prevent undefined in firestore
            const isCorrect = selectedAnswer === correctAnswer;
            if (isCorrect && !hasSubjective) score++; // Only accumulate score if no subjective questions (otherwise handled manually later)
            
            evaluation.push({ questionIndex: i, selectedAnswer, correctAnswer, isCorrect, isSubjective: false });
        }

        const percentage = hasSubjective ? null : Math.round((score / totalMarks) * 100);

        await submissionRef.set({
            studentName: studentName || "Guest Student",
            rollNo: rollNo || "",
            answers: answers || {},
            evaluation,
            score: hasSubjective ? null : score,
            totalMarks,
            percentage,
            timeTaken: timeTaken || 0,
            submittedAt: FieldValue.serverTimestamp()
        });

        if (hasSubjective) {
            return NextResponse.json({ evaluation, message: "Exam submitted! Subjective questions pending review." });
        }

        return NextResponse.json({ score: hasSubjective ? null : score, totalMarks, percentage, evaluation, message: "Exam submitted and evaluated!" });
    } catch (error: any) {
        console.error("Error submitting exam:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
