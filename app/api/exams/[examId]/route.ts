import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { searchParams } = new URL(req.url);
        const studentUid = searchParams.get("studentUid");

        const examDoc = await adminDb.collection("exams").doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const examData = examDoc.data()!;
        
        let isExpired = false;
        if (examData.expiresAt) {
            const expiresAt = examData.expiresAt.toDate ? examData.expiresAt.toDate() : new Date(examData.expiresAt);
            if (new Date() > expiresAt) {
                isExpired = true;
            }
        }

        const requiresPasscode = !!examData.passcode;

        // If it requires a passcode, strip the secure content from this initial GET request
        const publicExamData = { ...examData };
        if (requiresPasscode) {
            delete publicExamData.mcqs;
            delete publicExamData.content;
            delete publicExamData.structuredPaper;
            delete publicExamData.passcode; // Never send the passcode itself
        }

        publicExamData.requiresPasscode = requiresPasscode;
        publicExamData.isExpired = isExpired;
        
        let submissionData = null;
        if (studentUid) {
            const subDoc = await adminDb.collection("exams").doc(examId).collection("submissions").doc(studentUid).get();
            if (subDoc.exists) {
                submissionData = subDoc.data();
            }
        }

        return NextResponse.json({ exam: publicExamData, submission: submissionData });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
