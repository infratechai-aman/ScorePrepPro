import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { evaluateSubjectiveAnswer } from "@/lib/gradingEngine";

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

        const evaluationPromises = mcqs.map(async (mcq: any, i: number) => {
            if (isPaper && examData.structuredPaper && mcq === null) {
                // It's a subjective question in a structured paper
                const subjectiveQ = examData.structuredPaper.questions[i];
                const studentAnswer = answers?.[i] || "";
                
                // AI Grading
                const { awardedMarks, feedback } = await evaluateSubjectiveAnswer(
                    subjectiveQ.question,
                    subjectiveQ.explanation || "",
                    studentAnswer,
                    subjectiveQ.marks || 1
                );

                return {
                    questionIndex: i,
                    isSubjective: true,
                    textAnswer: studentAnswer,
                    awardedMarks,
                    feedback
                };
            }

            // MCQ evaluation
            const selectedAnswer = answers && answers[i] !== undefined ? parseInt(answers[i]) : -1;
            let correctAnswer = isPaper ? mcqs[i]?.correctAnswer : examData.mcqs[i].correctAnswer;
            if (correctAnswer === undefined) correctAnswer = -1; // Fallback to prevent undefined in firestore
            const isCorrect = selectedAnswer === correctAnswer;
            const mcqMarks = isPaper ? (mcqs[i]?.marks || 1) : 1;
            const awardedMarks = isCorrect ? mcqMarks : 0;
            
            return { questionIndex: i, selectedAnswer, correctAnswer, isCorrect, isSubjective: false, awardedMarks };
        });

        const evaluatedResults = await Promise.all(evaluationPromises);
        
        let score = evaluatedResults.reduce((sum, item) => sum + (item.awardedMarks || 0), 0);
        const percentage = Math.round((score / totalMarks) * 100);

        await submissionRef.set({
            studentName: studentName || "Guest Student",
            rollNo: rollNo || "",
            answers: answers || {},
            evaluation: evaluatedResults,
            score,
            totalMarks,
            percentage,
            timeTaken: timeTaken || 0,
            submittedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ score, totalMarks, percentage, evaluation: evaluatedResults, message: "Exam submitted and evaluated using AI Smart Grader!" });
    } catch (error: any) {
        console.error("Error submitting exam:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
