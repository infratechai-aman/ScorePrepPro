import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ subjectId: string }> }
) {
    try {
        const { subjectId } = await params;
        const snapshot = await adminDb.collection("customSubjects").doc(subjectId).collection("units").get();
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

        const docRef = await adminDb.collection("customSubjects").doc(subjectId).collection("units").add({
            title,
            description: description || "",
            createdAt: FieldValue.serverTimestamp(),
            materialCount: 0,
            knowledgeExtracted: false,
            knowledgeText: ""
        });

        // Update unit count on parent subject
        await adminDb.collection("customSubjects").doc(subjectId).update({ unitCount: FieldValue.increment(1) });

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

        await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).delete();
        await adminDb.collection("customSubjects").doc(subjectId).update({ unitCount: FieldValue.increment(-1) });

        return NextResponse.json({ message: "Unit deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
