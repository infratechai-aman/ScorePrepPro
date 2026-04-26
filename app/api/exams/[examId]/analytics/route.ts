import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;

        // Get exam data
        const examDoc = await getDoc(doc(db, "exams", examId));
        if (!examDoc.exists()) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }
        const examData = examDoc.data();

        // Get all submissions
        const submissionsSnap = await getDocs(collection(db, "exams", examId, "submissions"));
        const submissions = submissionsSnap.docs.map(d => ({ studentUid: d.id, ...d.data() }));

        if (submissions.length === 0) {
            return NextResponse.json({
                totalStudents: 0,
                averageScore: 0,
                averagePercentage: 0,
                topper: null,
                submissions: [],
                questionAnalysis: [],
                completionRate: 0
            });
        }

        // Calculate analytics
        const scores = submissions.map((s: any) => s.score || 0);
        const percentages = submissions.map((s: any) => s.percentage || 0);
        const totalStudents = submissions.length;
        const averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / totalStudents * 10) / 10;
        const averagePercentage = Math.round(percentages.reduce((a: number, b: number) => a + b, 0) / totalStudents);

        // Find topper
        const topperSubmission = submissions.reduce((top: any, s: any) =>
            (s.score || 0) > (top.score || 0) ? s : top, submissions[0]
        );

        // Question-level analysis
        const mcqs = examData.mcqs || [];
        const questionAnalysis = mcqs.map((_: any, qIndex: number) => {
            let correctCount = 0;
            let wrongCount = 0;
            let unansweredCount = 0;

            submissions.forEach((s: any) => {
                const eval_q = s.evaluation?.find((e: any) => e.questionIndex === qIndex);
                if (!eval_q || eval_q.selectedAnswer === -1) unansweredCount++;
                else if (eval_q.isCorrect) correctCount++;
                else wrongCount++;
            });

            return {
                questionIndex: qIndex,
                question: mcqs[qIndex]?.question || `Q${qIndex + 1}`,
                correctCount,
                wrongCount,
                unansweredCount,
                errorRate: Math.round((wrongCount / totalStudents) * 100)
            };
        });

        // Sort by error rate to find hardest questions
        const hardestQuestions = [...questionAnalysis].sort((a: any, b: any) => b.errorRate - a.errorRate).slice(0, 5);

        // Get classroom student count for completion rate
        let classroomStudentCount = totalStudents;
        if (examData.classroomId) {
            const classroomDoc = await getDoc(doc(db, "classrooms", examData.classroomId));
            if (classroomDoc.exists()) {
                classroomStudentCount = classroomDoc.data().studentCount || totalStudents;
            }
        }
        const completionRate = Math.round((totalStudents / Math.max(classroomStudentCount, 1)) * 100);

        return NextResponse.json({
            totalStudents,
            averageScore,
            averagePercentage,
            topper: topperSubmission,
            submissions,
            questionAnalysis,
            hardestQuestions,
            completionRate
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
