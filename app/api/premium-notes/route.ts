import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { generatePremiumNotes } from "@/lib/premiumNotesEngine";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — multi-step pipeline needs time

export async function POST(req: Request) {
    try {
        const { subjectId, unitIds, subjectName, difficulty, teacherUid } = await req.json();

        if (!subjectId || !unitIds || unitIds.length === 0) {
            return NextResponse.json({ error: "Subject and at least one unit required" }, { status: 400 });
        }

        if (!teacherUid) {
            return NextResponse.json({ error: "Teacher UID required" }, { status: 400 });
        }

        // Gather knowledge from all selected units
        let combinedKnowledge = "";
        let unitNames: string[] = [];

        for (const unitId of unitIds) {
            const unitDoc = await getDoc(doc(db, "customSubjects", subjectId, "units", unitId));
            if (unitDoc.exists()) {
                const data = unitDoc.data();
                if (data.knowledgeText) {
                    combinedKnowledge += `\n\n## ${data.title}\n${data.knowledgeText}`;
                    unitNames.push(data.title);
                }
            }
        }

        if (!combinedKnowledge.trim()) {
            return NextResponse.json(
                { error: "No content found in selected units. Please upload materials first." },
                { status: 400 }
            );
        }

        // Get subject info
        const subjectDoc = await getDoc(doc(db, "customSubjects", subjectId));
        const subjectData = subjectDoc.exists() ? subjectDoc.data() : {};
        const finalSubjectName = subjectName || subjectData?.name || "Custom Subject";
        const unitTitle = unitNames.join(", ");

        // Run the 7-step premium pipeline
        const content = await generatePremiumNotes(
            combinedKnowledge,
            finalSubjectName,
            unitTitle,
            difficulty || "medium"
        );

        // Auto-save to repository
        let noteId = "";
        try {
            const noteRef = await addDoc(collection(db, "users", teacherUid, "notes"), {
                subject: finalSubjectName,
                chapter: unitTitle,
                grade: subjectData?.grade || "",
                board: subjectData?.board || "Custom",
                content,
                source: "the_teacher",
                subjectId,
                unitIds,
                createdAt: serverTimestamp()
            });
            noteId = noteRef.id;
        } catch (saveErr) {
            console.warn("Failed to save note to repository:", saveErr);
        }

        return NextResponse.json({
            content,
            noteId,
            message: "Premium notes generated and saved to repository!"
        });
    } catch (error: any) {
        console.error("Premium notes generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate premium notes: " + error.message },
            { status: 500 }
        );
    }
}
