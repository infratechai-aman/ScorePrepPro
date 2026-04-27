// Server-side file text extraction utility
// Supports: PDF, DOCX, PPT (text), Images (via OpenAI Vision)

import { openai } from "./openai";

export async function extractTextFromFile(
    fileBuffer: Buffer,
    fileType: string,
    fileName: string
): Promise<string> {
    try {
        switch (fileType) {
            case "pdf":
                return await extractFromPDF(fileBuffer);
            case "docx":
                return await extractFromDOCX(fileBuffer);
            case "pptx":
            case "ppt":
                return await extractFromPPT(fileBuffer);
            case "png":
            case "jpg":
            case "jpeg":
            case "webp":
                return await extractFromImage(fileBuffer, fileType);
            case "txt":
            case "md":
                return fileBuffer.toString("utf-8");
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }
    } catch (error: any) {
        console.error(`Error extracting text from ${fileName}:`, error);
        throw new Error(`Failed to extract text from ${fileName}: ${error.message}`);
    }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
    const pdfParse = (await import("pdf-parse-new")).default;
    const data = await pdfParse(buffer);
    return data.text || "";
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
}

async function extractFromPPT(buffer: Buffer): Promise<string> {
    // Basic PPT text extraction - extract readable strings from buffer
    const text = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
    // Clean up excessive whitespace
    return text.replace(/\s{3,}/g, "\n").trim();
}

async function extractFromImage(buffer: Buffer, fileType: string): Promise<string> {
    const base64 = buffer.toString("base64");
    const mimeType = fileType === "png" ? "image/png" : fileType === "webp" ? "image/webp" : "image/jpeg";

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Extract ALL text content from this image. Include every word, formula, diagram label, heading, and paragraph visible. Format it clearly with proper structure. If there are handwritten notes, transcribe them accurately.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64}`,
                        },
                    },
                ],
            },
        ],
        max_tokens: 4000,
    });

    return response.choices[0].message.content || "";
}

export function getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || "";
}
