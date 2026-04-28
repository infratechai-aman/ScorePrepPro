import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { passcode, studentName, rollNo } = await req.json();

        const examDoc = await adminDb.collection("exams").doc(examId).get();
        if (!examDoc.exists) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const examData = examDoc.data()!;

        // Check Expiry
        if (examData.expiresAt) {
            const expiresAt = examData.expiresAt.toDate ? examData.expiresAt.toDate() : new Date(examData.expiresAt);
            if (new Date() > expiresAt) {
                return NextResponse.json({ error: "This exam has expired and is no longer accepting submissions." }, { status: 403 });
            }
        }

        // Check Passcode
        if (examData.passcode && examData.passcode !== passcode) {
            return NextResponse.json({ error: "Invalid exam passcode" }, { status: 401 });
        }

        // Optional: Save the student details here if needed, or just return the exam
        // We will save rollNo in the submit payload, but we can verify it here.
        if (!studentName || !rollNo) {
            return NextResponse.json({ error: "Name and Roll No are required" }, { status: 400 });
        }

        return NextResponse.json({
            message: "Access granted",
            exam: {
                content: examData.content,
                structuredPaper: examData.structuredPaper,
                mcqs: examData.mcqs
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
