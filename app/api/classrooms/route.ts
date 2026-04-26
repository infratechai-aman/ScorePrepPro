import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");

        if (!teacherUid) {
            return NextResponse.json({ error: "Missing teacherUid" }, { status: 400 });
        }

        const q = query(collection(db, "classrooms"), where("teacherUid", "==", teacherUid));
        const snapshot = await getDocs(q);
        const classrooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ classrooms });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { teacherUid, name } = await req.json();

        if (!teacherUid || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const code = nanoid(6).toUpperCase();

        const docRef = await addDoc(collection(db, "classrooms"), {
            teacherUid,
            name,
            code,
            createdAt: serverTimestamp(),
            studentCount: 0
        });

        return NextResponse.json({
            id: docRef.id,
            code,
            message: "Classroom created successfully"
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
