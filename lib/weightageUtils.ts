/**
 * Chapter Weightage Utility
 *
 * Converts user-specified chapter weight percentages into hard-enforced
 * exact question counts for each chapter. This ensures the AI cannot ignore
 * the weightage — it receives a mandatory allocation table.
 */

export interface ChapterQuestionAllocation {
    chapter: string;
    weight: number;      // percentage e.g. 30
    questions: number;   // exact integer count e.g. 6
}

/**
 * Calculate exact question counts per chapter based on weights.
 *
 * @param chapters     - Ordered list of chapter names (selected by user)
 * @param weights      - Map of chapterName → weight percentage (0-100)
 * @param totalQ       - Total number of questions to distribute
 * @returns            - Ordered allocations with exact question counts
 */
export function calculateChapterQuestionMap(
    chapters: string[],
    weights: Record<string, number>,
    totalQ: number
): ChapterQuestionAllocation[] {
    if (!chapters.length || totalQ <= 0) return [];

    // Filter to only chapters that have a weight set
    const weighted = chapters.filter(ch => (weights[ch] ?? 0) > 0);
    const unweighted = chapters.filter(ch => (weights[ch] ?? 0) === 0);

    // Total weight given (may not be 100 — we normalize it)
    const totalWeight = weighted.reduce((sum, ch) => sum + (weights[ch] ?? 0), 0);

    let allocations: ChapterQuestionAllocation[] = [];
    let assignedQ = 0;

    if (totalWeight === 0 || weighted.length === 0) {
        // No weights set — distribute evenly across all chapters
        const base = Math.floor(totalQ / chapters.length);
        const remainder = totalQ % chapters.length;
        allocations = chapters.map((ch, i) => ({
            chapter: ch,
            weight: Math.round(100 / chapters.length),
            questions: base + (i < remainder ? 1 : 0),
        }));
        return allocations;
    }

    // Calculate raw question counts from percentages
    const rawCounts = weighted.map(ch => {
        const normalizedWeight = (weights[ch] / totalWeight);
        return { chapter: ch, weight: weights[ch], raw: normalizedWeight * totalQ };
    });

    // Floor everything first
    const floored = rawCounts.map(r => ({
        chapter: r.chapter,
        weight: r.weight,
        questions: Math.max(1, Math.floor(r.raw)),
        remainder: r.raw - Math.floor(r.raw),
    }));

    assignedQ = floored.reduce((sum, f) => sum + f.questions, 0);

    // Distribute unweighted chapters equally from remaining budget
    const budgetForWeighted = unweighted.length > 0
        ? Math.round(totalQ * (totalWeight / 100))
        : totalQ;

    // Re-floor for weighted chapters only within their budget
    const weightedAllocations: ChapterQuestionAllocation[] = floored.map(f => ({
        chapter: f.chapter,
        weight: f.weight,
        questions: Math.max(1, Math.floor((f.weight / totalWeight) * budgetForWeighted)),
    }));

    // Fix rounding: add remaining questions to the highest-weight chapter
    let weightedTotal = weightedAllocations.reduce((s, a) => s + a.questions, 0);
    let diff = budgetForWeighted - weightedTotal;
    if (diff !== 0 && weightedAllocations.length > 0) {
        // Sort by weight desc, give remainder to heaviest chapter
        const sorted = [...weightedAllocations].sort((a, b) => b.weight - a.weight);
        sorted[0].questions = Math.max(1, sorted[0].questions + diff);
    }

    allocations = [...weightedAllocations];

    // Distribute remaining budget to unweighted chapters equally
    if (unweighted.length > 0) {
        const remainingBudget = totalQ - weightedAllocations.reduce((s, a) => s + a.questions, 0);
        const base = Math.floor(remainingBudget / unweighted.length);
        const rem = remainingBudget % unweighted.length;
        unweighted.forEach((ch, i) => {
            allocations.push({
                chapter: ch,
                weight: 0,
                questions: Math.max(0, base + (i < rem ? 1 : 0)),
            });
        });
    }

    return allocations.filter(a => a.questions > 0);
}

/**
 * Build the hard-enforced weightage instruction string to inject into prompts.
 * This is NON-NEGOTIABLE for the AI — it MUST follow these exact counts.
 */
export function buildWeightagePromptBlock(
    allocations: ChapterQuestionAllocation[]
): string {
    if (!allocations.length) return "";

    const lines = allocations
        .map(a => `  - "${a.chapter}": EXACTLY ${a.questions} question${a.questions !== 1 ? "s" : ""} (${a.weight > 0 ? a.weight + "%" : "remainder"})`)
        .join("\n");

    return `
## CHAPTER QUESTION ALLOCATION (MANDATORY — DO NOT DEVIATE)
You MUST distribute questions across chapters EXACTLY as follows. 
This is non-negotiable. Generating more or fewer questions from any chapter is strictly forbidden:

${lines}

Total: ${allocations.reduce((s, a) => s + a.questions, 0)} questions distributed across ${allocations.length} chapters.
If a chapter has 0 questions allocated, do NOT include questions from it.
`;
}
