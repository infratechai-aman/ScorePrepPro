import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request, { params }: { params: Promise<{ examId: string }> }) {
    try {
        const { examId } = await params;
        const { studentUid, evaluation, score, percentage } = await req.json();

        if (!studentUid || score === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const submissionRef = adminDb.collection("exams").doc(examId).collection("submissions").doc(studentUid);
        await submissionRef.update({
            evaluation,
            score,
            percentage
        });

        return NextResponse.json({ message: "Score overridden successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
