import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const { studentUid, studentName, studentEmail, code } = await req.json();

        if (!studentUid || !code) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find classroom by code
        const q = query(collection(db, "classrooms"), where("code", "==", code.toUpperCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ error: "Invalid classroom code. Please check and try again." }, { status: 404 });
        }

        const classroomDoc = snapshot.docs[0];
        const classroomId = classroomDoc.id;

        // Check if student already joined
        const studentRef = doc(db, "classrooms", classroomId, "students", studentUid);
        const existingDoc = await getDoc(studentRef);
        if (existingDoc.exists()) {
            return NextResponse.json({
                classroomId,
                classroomName: classroomDoc.data().name,
                message: "You are already in this classroom!"
            });
        }

        // Add student to classroom
        await setDoc(studentRef, {
            name: studentName || "Student",
            email: studentEmail || "",
            joinedAt: serverTimestamp()
        });

        // Increment student count
        await updateDoc(doc(db, "classrooms", classroomId), {
            studentCount: increment(1)
        });

        // Also update the user's document with classroom reference
        try {
            const userRef = doc(db, "users", studentUid);
            await updateDoc(userRef, {
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
