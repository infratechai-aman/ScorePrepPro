import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { generateFromKnowledge } from "@/lib/knowledgeEngine";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subjectId, unitIds, subjectName, difficulty, marks, duration, questionType, instituteName, includeAnswerKey } = await req.json();

        if (!subjectId || !unitIds || unitIds.length === 0) {
            return NextResponse.json({ error: "Subject and at least one unit required" }, { status: 400 });
        }

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
            "paper",
            {
                difficulty: difficulty || "medium",
                marks: marks || 50,
                duration: duration || 60,
                questionType: questionType || "Mixed"
            }
        );

        return NextResponse.json({ content });
    } catch (error: any) {
        console.error("Error generating custom paper:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
