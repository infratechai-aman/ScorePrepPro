import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");
        const section = searchParams.get("section");

        if (!teacherUid) {
            return NextResponse.json({ error: "Missing teacherUid" }, { status: 400 });
        }

        // --- STATS ---
        if (section === "stats") {
            const subjectsSnap = await adminDb.collection("customSubjects").where("teacherUid", "==", teacherUid).get();
            const classroomsSnap = await adminDb.collection("classrooms").where("teacherUid", "==", teacherUid).get();

            let totalStudents = 0;
            for (const room of classroomsSnap.docs) {
                const studentsSnap = await adminDb.collection("classrooms").doc(room.id).collection("students").count().get();
                totalStudents += studentsSnap.data().count;
            }

            const examsSnap = await adminDb.collection("exams").where("teacherUid", "==", teacherUid).get();

            return NextResponse.json({
                subjects: subjectsSnap.size,
                classrooms: classroomsSnap.size,
                exams: examsSnap.size,
                students: totalStudents,
            });
        }

        // --- SUBJECTS ---
        if (section === "subjects") {
            const snap = await adminDb.collection("customSubjects").where("teacherUid", "==", teacherUid).get();
            const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return NextResponse.json({ subjects });
        }

        // --- RECENT ACTIVITY ---
        if (section === "activity") {
            let exams: any[] = [];
            let papers: any[] = [];

            try {
                const examsSnap = await adminDb.collection("exams")
                    .where("teacherUid", "==", teacherUid)
                    .orderBy("createdAt", "desc")
                    .limit(3)
                    .get();
                exams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } catch (e) { console.error("Exams fetch:", e); }

            try {
                const papersSnap = await adminDb.collection("users").doc(teacherUid).collection("papers")
                    .orderBy("createdAt", "desc")
                    .limit(3)
                    .get();
                papers = papersSnap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        subject: data.subject,
                        chapter: data.chapter,
                        grade: data.grade,
                        totalMarks: data.totalMarks,
                        difficulty: data.difficulty,
                        createdAt: data.createdAt ? { seconds: data.createdAt.seconds } : null,
                    };
                });
            } catch (e) { console.error("Papers fetch:", e); }

            return NextResponse.json({ exams, papers });
        }

        // --- PUBLISHED EXAMS ---
        if (section === "published-exams") {
            try {
                const snap = await adminDb.collection("exams")
                    .where("teacherUid", "==", teacherUid)
                    .where("status", "==", "published")
                    .orderBy("createdAt", "desc")
                    .limit(3)
                    .get();
                const exams = snap.docs.map(d => {
                    const data = d.data();
                    return {
                        id: d.id,
                        title: data.title,
                        totalQuestions: data.totalQuestions || data.mcqs?.length || 0,
                        status: data.status,
                    };
                });
                return NextResponse.json({ exams });
            } catch (e) {
                console.error("Published exams fetch:", e);
                return NextResponse.json({ exams: [] });
            }
        }

        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    } catch (error: any) {
        console.error("Teacher dashboard API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
