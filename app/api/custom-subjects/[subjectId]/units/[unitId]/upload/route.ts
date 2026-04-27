import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { extractTextFromFile, getFileExtension } from "@/lib/fileProcessor";
import { processContentToKnowledge } from "@/lib/knowledgeEngine";

export const runtime = "nodejs";
export const maxDuration = 180; // 3 min for large file processing

export async function POST(
    req: Request,
    { params }: { params: Promise<{ subjectId: string; unitId: string }> }
) {
    try {
        const { subjectId, unitId } = await params;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileExt = getFileExtension(file.name);
        const allowedExts = ["pdf", "docx", "pptx", "ppt", "txt", "md", "png", "jpg", "jpeg", "webp"];

        if (!allowedExts.includes(fileExt)) {
            return NextResponse.json(
                { error: `Unsupported file type: .${fileExt}. Allowed: ${allowedExts.join(", ")}` },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Step 1: Extract text from file
        const extractedText = await extractTextFromFile(buffer, fileExt, file.name);

        if (!extractedText || extractedText.trim().length < 10) {
            return NextResponse.json(
                { error: "Could not extract meaningful text from this file. Please try a different format." },
                { status: 400 }
            );
        }

        // Step 2: Save material record to Firestore
        await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).collection("materials").add({
            fileName: file.name,
            fileType: fileExt,
            fileSize: file.size,
            uploadedAt: FieldValue.serverTimestamp(),
            extractedText: extractedText.substring(0, 50000),
            processed: true
        });

        // Step 3: Get subject info for context
        const subjectDoc = await adminDb.collection("customSubjects").doc(subjectId).get();
        const subjectData = subjectDoc.data();
        const subjectName = subjectData?.name || "Unknown Subject";

        const unitDoc = await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).get();
        const unitData = unitDoc.data();
        const unitTitle = unitData?.title || "Unknown Unit";

        // Step 4: Process with AI Knowledge Engine
        const knowledge = await processContentToKnowledge(extractedText, subjectName, unitTitle);

        // Step 5: Merge new knowledge with existing (permanent memory)
        const existingKnowledge = unitData?.knowledgeText || "";
        const mergedKnowledge = existingKnowledge
            ? existingKnowledge + "\n\n---NEW CONTENT---\n\n" + knowledge.fullKnowledge
            : knowledge.fullKnowledge;

        // Step 6: Update unit with permanent knowledge
        await adminDb.collection("customSubjects").doc(subjectId).collection("units").doc(unitId).update({
            knowledgeExtracted: true,
            knowledgeText: mergedKnowledge.substring(0, 100000),
            knowledgeSummary: knowledge.summary,
            concepts: knowledge.concepts,
            definitions: knowledge.definitions,
            formulas: knowledge.formulas,
            keyTopics: knowledge.keyTopics,
            materialCount: FieldValue.increment(1),
            lastProcessedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({
            message: "File uploaded and processed successfully!",
            summary: knowledge.summary,
            conceptCount: knowledge.concepts.length,
            topicCount: knowledge.keyTopics.length
        });
    } catch (error: any) {
        console.error("Error processing upload:", error);
        return NextResponse.json(
            { error: "Failed to process file: " + error.message },
            { status: 500 }
        );
    }
}
