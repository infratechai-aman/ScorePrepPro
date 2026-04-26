import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const { examId } = await params;
        const { classroomId, teacherUid } = await req.json();

        // Check published exam limit (max 10)
        const publishedQuery = query(
            collection(db, "exams"),
            where("teacherUid", "==", teacherUid),
            where("status", "==", "published")
        );
        const publishedSnap = await getDocs(publishedQuery);

        if (publishedSnap.size >= 10) {
            return NextResponse.json(
                { error: "Maximum 10 published exams allowed. Please unpublish or delete an existing exam." },
                { status: 400 }
            );
        }

        const examRef = doc(db, "exams", examId);
        await updateDoc(examRef, {
            status: "published",
            classroomId: classroomId || "",
            publishedAt: new Date().toISOString()
        });

        return NextResponse.json({ message: "Exam published successfully!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
