import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");
        const section = searchParams.get("section"); // "stats" | "subjects" | "activity" | "exams"

        if (!teacherUid) {
            return NextResponse.json({ error: "Missing teacherUid" }, { status: 400 });
        }

        // --- STATS ---
        if (section === "stats") {
            const subjectsSnap = await getDocs(query(collection(db, "customSubjects"), where("teacherUid", "==", teacherUid)));
            const classroomsSnap = await getDocs(query(collection(db, "classrooms"), where("teacherUid", "==", teacherUid)));
            
            let totalStudents = 0;
            for (const room of classroomsSnap.docs) {
                try {
                    const studentsSnap = await getCountFromServer(collection(db, "classrooms", room.id, "students"));
                    totalStudents += studentsSnap.data().count;
                } catch (e) {
                    // Skip if sub-collection doesn't exist
                }
            }

            const examsSnap = await getDocs(query(collection(db, "exams"), where("teacherUid", "==", teacherUid)));

            return NextResponse.json({
                subjects: subjectsSnap.size,
                classrooms: classroomsSnap.size,
                exams: examsSnap.size,
                students: totalStudents,
            });
        }

        // --- SUBJECTS ---
        if (section === "subjects") {
            const q = query(collection(db, "customSubjects"), where("teacherUid", "==", teacherUid));
            const snap = await getDocs(q);
            const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return NextResponse.json({ subjects });
        }

        // --- RECENT ACTIVITY (exams + papers) ---
        if (section === "activity") {
            let exams: any[] = [];
            let papers: any[] = [];

            try {
                const examsSnap = await getDocs(query(
                    collection(db, "exams"),
                    where("teacherUid", "==", teacherUid),
                    orderBy("createdAt", "desc"),
                    limit(3)
                ));
                exams = examsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } catch (e) {
                console.error("Error fetching exams for activity:", e);
            }

            try {
                const papersSnap = await getDocs(query(
                    collection(db, "users", teacherUid, "papers"),
                    orderBy("createdAt", "desc"),
                    limit(3)
                ));
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
            } catch (e) {
                console.error("Error fetching papers for activity:", e);
            }

            return NextResponse.json({ exams, papers });
        }

        // --- PUBLISHED EXAMS (for right sidebar) ---
        if (section === "published-exams") {
            try {
                const q = query(
                    collection(db, "exams"),
                    where("teacherUid", "==", teacherUid),
                    where("status", "==", "published"),
                    orderBy("createdAt", "desc"),
                    limit(3)
                );
                const snap = await getDocs(q);
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
                console.error("Error fetching published exams:", e);
                return NextResponse.json({ exams: [] });
            }
        }

        return NextResponse.json({ error: "Invalid section parameter" }, { status: 400 });
    } catch (error: any) {
        console.error("Teacher dashboard API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
