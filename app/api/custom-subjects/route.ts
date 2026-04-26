import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherUid = searchParams.get("teacherUid");

        if (!teacherUid) {
            return NextResponse.json({ error: "Missing teacherUid" }, { status: 400 });
        }

        const q = query(
            collection(db, "customSubjects"),
            where("teacherUid", "==", teacherUid)
        );
        const snapshot = await getDocs(q);
        const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ subjects });
    } catch (error: any) {
        console.error("Error fetching custom subjects:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { teacherUid, name, grade, board, description } = await req.json();

        if (!teacherUid || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check limit: max 2 custom subjects
        const q = query(
            collection(db, "customSubjects"),
            where("teacherUid", "==", teacherUid)
        );
        const existing = await getDocs(q);

        if (existing.size >= 2) {
            return NextResponse.json(
                { error: "Maximum 2 custom subjects allowed. Delete an existing one to create a new one." },
                { status: 400 }
            );
        }

        const docRef = await addDoc(collection(db, "customSubjects"), {
            teacherUid,
            name,
            grade: grade || "",
            board: board || "Custom",
            description: description || "",
            createdAt: serverTimestamp(),
            unitCount: 0
        });

        return NextResponse.json({ id: docRef.id, message: "Subject created successfully" });
    } catch (error: any) {
        console.error("Error creating custom subject:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
