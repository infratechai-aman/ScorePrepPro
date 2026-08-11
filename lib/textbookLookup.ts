/**
 * Smart Textbook Content Lookup
 * 
 * Reads scraped content directly from JSON files in /scraped_content/
 * and handles the mismatch between frontend subject names
 * (e.g. "Social Science (History)") and file-based keys
 * (e.g. "Social Science History").
 * 
 * Server-side only — used by API route generators.
 */

import fs from "fs";
import path from "path";

// Cache the loaded content in memory (loaded once per server startup)
let _cache: Record<string, Record<string, Record<string, Record<string, string>>>> | null = null;

function loadAllContent(): Record<string, Record<string, Record<string, Record<string, string>>>> {
    if (_cache) return _cache;

    const contentDir = path.join(process.cwd(), "scraped_content");
    const result: Record<string, Record<string, Record<string, Record<string, string>>>> = {};

    if (!fs.existsSync(contentDir)) {
        console.warn("[TextbookLookup] scraped_content directory not found");
        _cache = {};
        return _cache;
    }

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
        try {
            const parts = file.replace(".json", "").split("_");
            const board = parts[0]; // "cbse" or "maharashtra"
            const grade = parts[1]; // "5", "6", etc.
            const subject = parts.slice(2).join(" "); // "Mathematics", "Social Science History", etc.

            const filePath = path.join(contentDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

            if (!result[board]) result[board] = {};
            if (!result[board][grade]) result[board][grade] = {};
            result[board][grade][subject] = data;
        } catch (err) {
            console.error(`[TextbookLookup] Error loading ${file}:`, err);
        }
    }

    _cache = result;
    console.log(`[TextbookLookup] Loaded ${files.length} scraped content files`);
    return _cache;
}

/**
 * Look up textbook content with smart subject name normalization.
 * Tries multiple key formats to find a match.
 */
export function getTextbookContent(board: string, grade: string, subject: string, chapter: string): string {
    const content = loadAllContent();
    const gradeData = content?.[board]?.[grade];
    if (!gradeData) return "";

    // 1. Direct lookup (exact match)
    if (gradeData[subject]?.[chapter]) {
        return gradeData[subject][chapter];
    }

    // 2. Try without parentheses: "Social Science (History)" → "Social Science History"
    const withoutParens = subject.replace(/\s*\(([^)]+)\)\s*/g, " $1").trim();
    if (withoutParens !== subject && gradeData[withoutParens]?.[chapter]) {
        return gradeData[withoutParens][chapter];
    }

    // 3. Try parent subject only: "Social Science (History)" → "Social Science"
    const parentOnly = subject.replace(/\s*\([^)]+\)\s*/g, "").trim();
    if (parentOnly !== subject && gradeData[parentOnly]?.[chapter]) {
        return gradeData[parentOnly][chapter];
    }

    // 4. Try case-insensitive fuzzy match on subject keys
    const subjectLower = subject.toLowerCase();
    for (const key of Object.keys(gradeData)) {
        if (key.toLowerCase() === subjectLower && gradeData[key]?.[chapter]) {
            return gradeData[key][chapter];
        }
    }

    return "";
}

/**
 * Get combined textbook content for multiple chapters, smartly distributing 
 * the maximum character limit evenly across all selected chapters so none are left out.
 */
export function getChaptersContent(
    board: string, 
    grade: string, 
    subject: string, 
    chapters: string[], 
    maxTotalChars: number = 20000
): string {
    if (!chapters || chapters.length === 0) return "";

    const charsPerChapter = Math.floor(maxTotalChars / chapters.length);

    return chapters
        .map(ch => {
            const content = getTextbookContent(board, grade, subject, ch);
            if (!content) return "";
            // Take an even slice of each chapter so the AI gets context for everything
            const slicedContent = content.length > charsPerChapter 
                ? content.slice(0, charsPerChapter) + "... (content truncated)"
                : content;
            return `## ${ch}\n${slicedContent}`;
        })
        .filter(Boolean)
        .join("\n\n");
}
