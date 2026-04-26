import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        const { subjectId } = await params;
        const unitsRef = collection(db, "customSubjects", subjectId, "units");
        const snapshot = await getDocs(unitsRef);
        const units = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        return NextResponse.json({ units });
    } catch (error: any) {
        console.error("Error fetching units:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        const { subjectId } = await params;
        const { title, description } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Unit title is required" }, { status: 400 });
        }

        const unitsRef = collection(db, "customSubjects", subjectId, "units");
        const docRef = await addDoc(unitsRef, {
            title,
            description: description || "",
            createdAt: serverTimestamp(),
            materialCount: 0,
            knowledgeExtracted: false,
            knowledgeText: ""
        });

        // Update unit count on parent subject
        const subjectRef = doc(db, "customSubjects", subjectId);
        await updateDoc(subjectRef, { unitCount: increment(1) });

        return NextResponse.json({ id: docRef.id, message: "Unit created successfully" });
    } catch (error: any) {
        console.error("Error creating unit:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        const { subjectId } = await params;
        const { unitId } = await req.json();

        if (!unitId) {
            return NextResponse.json({ error: "Unit ID required" }, { status: 400 });
        }

        await deleteDoc(doc(db, "customSubjects", subjectId, "units", unitId));
        const subjectRef = doc(db, "customSubjects", subjectId);
        await updateDoc(subjectRef, { unitCount: increment(-1) });

        return NextResponse.json({ message: "Unit deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
