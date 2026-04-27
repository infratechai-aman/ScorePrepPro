import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
    try {
        const { studentUid, studentName, studentEmail, code } = await req.json();

        if (!studentUid || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find classroom by code
        const snapshot = await adminDb.collection("classrooms").where("code", "==", code.toUpperCase()).get();

        if (snapshot.empty) {
            return NextResponse.json({ error: "Invalid classroom code. Please check and try again." }, { status: 404 });
        }

        const classroomDoc = snapshot.docs[0];
        const classroomId = classroomDoc.id;

        // Check if student already joined
        const studentRef = adminDb.collection("classrooms").doc(classroomId).collection("students").doc(studentUid);
        const existingDoc = await studentRef.get();
        if (existingDoc.exists) {
            return NextResponse.json({
                classroomId,
                classroomName: classroomDoc.data().name,
                message: "You are already in this classroom!"
            });
        }

        // Add student to classroom
        await studentRef.set({
            name: studentName || "Student",
            email: studentEmail || "",
            joinedAt: FieldValue.serverTimestamp()
        });

        // Increment student count
        await adminDb.collection("classrooms").doc(classroomId).update({
            studentCount: FieldValue.increment(1)
        });

        // Also update the user's document with classroom reference
        try {
            await adminDb.collection("users").doc(studentUid).update({
                [`classrooms.${classroomId}`]: true
            });
        } catch (e) {
            // Non-critical: user might not have a doc yet
        }

        return NextResponse.json({
            classroomId,
            classroomName: classroomDoc.data().name,
            message: "Successfully joined classroom!"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
