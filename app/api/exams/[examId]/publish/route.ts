import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { classroomId, teacherUid } = await req.json();



        await adminDb.collection("exams").doc(examId).update({
            status: "published",
            classroomId: classroomId || "",
            publishedAt: new Date().toISOString()
        });

        return NextResponse.json({ message: "Exam published successfully!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
