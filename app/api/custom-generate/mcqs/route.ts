import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { generateFromKnowledge } from "@/lib/knowledgeEngine";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subjectId, unitIds, subjectName, difficulty, mcqCount } = await req.json();

        if (!subjectId || !unitIds || unitIds.length === 0) {
            return NextResponse.json({ error: "Subject and at least one unit required" }, { status: 400 });
        }

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

        const content = await generateFromKnowledge(
            combinedKnowledge,
            subjectName || "Custom Subject",
            unitNames.join(", "),
            "mcqs",
            {
                difficulty: difficulty || "medium",
                mcqCount: mcqCount || 10
            }
        );

        // Try to parse the MCQ JSON
        try {
            let cleanContent = content.trim();
            if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            const mcqs = JSON.parse(cleanContent);
            return NextResponse.json({ mcqs });
        } catch {
            return NextResponse.json({ mcqs: [], raw: content });
        }
    } catch (error: any) {
        console.error("Error generating MCQs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
