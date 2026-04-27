import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateFromKnowledge } from "@/lib/knowledgeEngine";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subjectId, unitIds, subjectName, notesType, difficulty } = await req.json();

        if (!subjectId || !unitIds || unitIds.length === 0) {
            return NextResponse.json({ error: "Subject and at least one unit required" }, { status: 400 });
        }

        // Gather knowledge from all selected units
        let combinedKnowledge = "";
        let unitNames: string[] = [];

        for (const unitId of unitIds) {
            const unitDoc = await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).get();
            if (unitDoc.exists) {
                const data = unitDoc.data()!;
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

        const content = await generateFromKnowledge(
            combinedKnowledge,
            subjectName || "Custom Subject",
            unitNames.join(", "),
            "notes",
            { notesType: notesType || "detailed", difficulty: difficulty || "medium" }
        );

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating custom notes:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
