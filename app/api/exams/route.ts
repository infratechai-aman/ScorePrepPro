import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");
        const classroomId = searchParams.get("classroomId");
        const studentUid = searchParams.get("studentUid");

        let exams: any[] = [];

        if (teacherUid) {
            const snapshot = await adminDb.collection("exams")
                .where("teacherUid", "==", teacherUid)
                .get();
            exams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (classroomId) {
            const snapshot = await adminDb.collection("exams")
                .where("classroomId", "==", classroomId)
                .where("status", "==", "published")
                .get();
            exams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else if (studentUid) {
            const userDoc = await adminDb.collection("users").doc(studentUid).get();
            const classrooms = userDoc.data()?.classrooms || {};
            const classroomIds = Object.keys(classrooms);

            for (const cId of classroomIds) {
                const snapshot = await adminDb.collection("exams")
                    .where("classroomId", "==", cId)
                    .where("status", "==", "published")
                    .get();
                exams.push(...snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        }

        return NextResponse.json({ exams });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

    export async function POST(req: Request) {
    try {
        const { teacherUid, classroomId, subjectId, unitId, title, type, content, structuredPaper, mcqs, totalQuestions, difficulty, timeLimit, passcode, validityHours } = await req.json();

        const isPaper = type === "paper";

        if (!teacherUid || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!isPaper && (!mcqs || mcqs.length === 0)) {
            return NextResponse.json({ error: "MCQs required for MCQ exam" }, { status: 400 });
        }
        if (isPaper && !content && !structuredPaper) {
            return NextResponse.json({ error: "Content or Structured Paper required for Paper exam" }, { status: 400 });
        }

        let expiresAt = null;
        if (validityHours) {
            const now = new Date();
            now.setHours(now.getHours() + Number(validityHours));
            expiresAt = now;
        }

        const docRef = await adminDb.collection("exams").add({
            teacherUid,
            classroomId: classroomId || "",
            subjectId: subjectId || "",
            unitId: unitId || "",
            title,
            type: type || "mcq",
            content: content || "",
            structuredPaper: structuredPaper || null,
            mcqs: mcqs || [],
            totalQuestions: totalQuestions || (mcqs ? mcqs.length : 0),
            difficulty: difficulty || "medium",
            timeLimit: timeLimit || 30,
            passcode: passcode || null,
            validityHours: validityHours || null,
            status: "draft",
            createdAt: FieldValue.serverTimestamp(),
            scheduledAt: null,
            expiresAt
        });

        return NextResponse.json({ id: docRef.id, message: "Exam created as draft" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
