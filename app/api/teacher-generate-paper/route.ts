import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "edge";
// Allow up to 120 seconds for large paper generation
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subject, units, pattern, totalMarks, title, duration, collegeName, includeAnswerKey } = await req.json();

        // units: [{ name: "Unit 1", weight: 20 }, ...]
        // pattern: [{ name: "Section A", type: "MCQ", count: 5, marksPerQuestion: 1 }, ...]

        const unitList = units.map((u: any) => `- ${u.name} (Approx. ${u.weight}% weightage)`).join("\n");

        // Calculate total expected questions
        const totalExpectedQuestions = pattern.reduce((sum: number, s: any) => sum + s.count, 0);

        // --- MULTI-PASS: Generate section by section ---
        const sectionResults: string[] = [];
        let currentQNum = 1;

        for (const section of pattern) {
            const questionEndNum = currentQNum + section.count - 1;

            const sectionPrompt = `You are an expert examiner for ${subject}. Generate EXACTLY ${section.count} questions for ONE section of an exam paper.

**SECTION**: ${section.name}
**QUESTION TYPE**: ${section.type}
**MARKS PER QUESTION**: ${section.marksPerQuestion}
**QUESTIONS TO GENERATE**: ${section.count}
**NUMBERING**: Q.${currentQNum} to Q.${questionEndNum}

**Syllabus & Weightage (STRICTLY ADHERE)**:
${unitList}
*(IMPORTANT: Do NOT ask questions from topics outside these units.)*

**MANDATORY FORMATTING RULES**:
1. **Spacing**: Leave ONE blank line between EVERY question.
2. **Numbering**: Use **Q.${currentQNum}**, **Q.${currentQNum + 1}**, etc.
3. **Marks Display**: Show marks at end: **[${section.marksPerQuestion} Mark(s)]**
4. For MCQs, use (a), (b), (c), (d) on separate lines.
5. For "Match the following", use a Markdown table.
6. Source 80-90% from standard textbook end-of-chapter exercises.
7. **NO IMAGES OR DIAGRAMS**: All questions must be text-based only.

**OUTPUT FORMAT**:

### ${section.name}

**Q.${currentQNum}** [Question text] **[${section.marksPerQuestion} Mark(s)]**

**Q.${currentQNum + 1}** [Next question] **[${section.marksPerQuestion} Mark(s)]**

... continue until Q.${questionEndNum}

CRITICAL: Generate ALL ${section.count} questions. DO NOT stop early. Output ONLY the section content, no preamble.`;

            // Estimate tokens needed
            const typeLower = section.type.toLowerCase();
            let maxTokens = 4000;
            if (typeLower.includes("mcq") || typeLower.includes("objective")) {
                maxTokens = Math.max(section.count * 100, 1500);
            } else if (section.marksPerQuestion >= 5) {
                maxTokens = Math.max(section.count * 250, 1500);
            } else {
                maxTokens = Math.max(section.count * 150, 1200);
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `You are a professional examiner. Generate the EXACT number of questions requested. Never stop early.` },
                    { role: "user", content: sectionPrompt }
                ],
                temperature: 0.7,
                max_tokens: Math.min(maxTokens, 16384),
            });

            const sectionContent = completion.choices[0].message.content || "";
            sectionResults.push(sectionContent);
            currentQNum = questionEndNum + 1;
        }

        // --- Build paper header ---
        let header = "";
        if (collegeName) {
            header += `<center>\n<h1>${collegeName}</h1>\n<h3>${title}</h3>\n</center>\n\n`;
        } else {
            header += `<center>\n<h1>EXAMINATION PAPER</h1>\n<h3>${title}</h3>\n</center>\n\n`;
        }
        header += `**Subject**: ${subject} | **Time**: ${duration} Mins | **Max Marks**: ${totalMarks}\n\n`;
        header += `---\n\n`;
        header += `**General Instructions:**\n`;
        header += `1. All questions are compulsory unless specified otherwise.\n`;
        header += `2. Marks are indicated against each question.\n\n`;
        header += `---\n\n`;

        // --- Assemble full paper ---
        const fullPaper = header + sectionResults.join("\n\n");

        // --- Optional Answer Key ---
        let finalContent = fullPaper;
        if (includeAnswerKey) {
            const answerKeyCompletion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an expert marking scheme creator. Generate concise, accurate answers." },
                    { role: "user", content: `Generate a concise Answer Key for this question paper. For MCQs, just give the answer letter. For short/long answers, give key points.\n\nPAPER:\n${fullPaper.substring(0, 12000)}` }
                ],
                temperature: 0.3,
                // Scale answer key tokens based on question count: MCQ answers ~20 tokens, subjective ~80 tokens
                max_tokens: Math.min(Math.max(totalExpectedQuestions * 80, 2000), 8000),
            });

            const answerKey = answerKeyCompletion.choices[0].message.content || "";
            finalContent += `\n\n---\n\n## ANSWER KEY / MARKING SCHEME\n\n${answerKey}`;
        }

        return NextResponse.json({ content: finalContent });

    } catch (error) {
        console.error("Error generating teacher paper:", error);
        return NextResponse.json({ error: "Failed to generate paper" }, { status: 500 });
    }
}
