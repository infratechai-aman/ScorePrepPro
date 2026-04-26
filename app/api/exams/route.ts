import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");
        const classroomId = searchParams.get("classroomId");
        const studentUid = searchParams.get("studentUid");

        let exams: any[] = [];

        if (teacherUid) {
            const q = query(collection(db, "exams"), where("teacherUid", "==", teacherUid));
            const snapshot = await getDocs(q);
            exams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (classroomId) {
            const q = query(
                collection(db, "exams"),
                where("classroomId", "==", classroomId),
                where("status", "==", "published")
            );
            const snapshot = await getDocs(q);
            exams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (studentUid) {
            // Get all classrooms the student is in
            const userDoc = await getDoc(doc(db, "users", studentUid));
            const classrooms = userDoc.data()?.classrooms || {};
            const classroomIds = Object.keys(classrooms);

            for (const cId of classroomIds) {
                const q = query(
                    collection(db, "exams"),
                    where("classroomId", "==", cId),
                    where("status", "==", "published")
                );
                const snapshot = await getDocs(q);
                const classExams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                exams.push(...classExams);
            }
        }

        return NextResponse.json({ exams });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { teacherUid, classroomId, subjectId, unitId, title, mcqs, totalQuestions, difficulty, timeLimit } = await req.json();

        if (!teacherUid || !title || !mcqs || mcqs.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check published exam limit (max 10)
        const publishedQuery = query(
            collection(db, "exams"),
            where("teacherUid", "==", teacherUid),
            where("status", "==", "published")
        );
        const publishedSnap = await getDocs(publishedQuery);
        // Note: limit check happens at publish time, not creation

        const docRef = await addDoc(collection(db, "exams"), {
            teacherUid,
            classroomId: classroomId || "",
            subjectId: subjectId || "",
            unitId: unitId || "",
            title,
            mcqs,
            totalQuestions: totalQuestions || mcqs.length,
            difficulty: difficulty || "medium",
            timeLimit: timeLimit || 30,
            status: "draft",
            createdAt: serverTimestamp(),
            scheduledAt: null,
            expiresAt: null
        });

        return NextResponse.json({ id: docRef.id, message: "Exam created as draft" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
