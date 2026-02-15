
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 120; // longer timeout for comprehensive notes + Q&A

export async function POST(req: Request) {
    try {
        const { subject, unit, topics, board, grade, textbook } = await req.json();

        if (!subject || !unit || !topics) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const topicList = topics.map((t: any) => `- ${t.name} ${t.isImp ? '(IMPORTANT)' : ''}`).join("\n");

        const boardName = board === 'maharashtra' ? 'Maharashtra SSC' : board === 'cbse' ? 'CBSE' : board === 'icse' ? 'ICSE' : 'Standard';
        const textbookName = textbook || 'Standard textbook';

        const prompt = `
You are an expert ${boardName} Board educator creating premium study notes for Class ${grade || ''} students.

**BOARD**: ${boardName}
**CLASS**: ${grade || 'Not specified'}  
**TEXTBOOK**: ${textbookName}
**SUBJECT**: ${subject}
**CHAPTER**: ${unit}

**CRITICAL**: Generate notes STRICTLY based on the ${textbookName} textbook for ${boardName} Board Class ${grade}. Do NOT mix content from other boards.

Topics to Cover:
${topicList}

---

## STYLE GUIDELINES – MAKE THESE NOTES BEAUTIFUL & UNIQUE

You are NOT writing generic Wikipedia-style notes. These are **premium, textbook-quality study notes** that a student would love to read. Follow these strict formatting rules:

### STRUCTURE (Follow this order):

**1. CHAPTER TITLE** (use # heading)
Start with the full chapter title.

**2. CHAPTER SNAPSHOT** (use > blockquote)
A 3-4 line overview that hooks the student. What will they learn? Why is it important?

**3. FOR EACH MAJOR CONCEPT/TOPIC**:

Use ## for the topic heading, then cover these sections (use ### for each):

### 🔑 Key Definition (in blockquote)
> **Definition**: Clear, concise definition from the ${textbookName} textbook.

### 📝 Explanation 
Write 4-6 bullet points explaining the concept. Use bold for key terms. Make it conversational but informative. Use analogies when helpful.

### 📊 Comparison Table (when applicable)
Use markdown tables with clear headers. Compare related concepts side by side.

### ⚡ Key Formulas / Laws (when applicable)
Present in code blocks for clarity. Include the formula name, the equation, and where each variable stands.

### 🔬 Diagram Description (when applicable)
Describe what a student should draw/visualize using a clear text blueprint:
\`\`\`
[Input] → [Process] → [Output]
\`\`\`

### 📌 Important Points to Remember
Use a bulleted list with **bold** keywords. These are exam-critical points.

**4. QUICK REVISION BOX**
> **Quick Revision**:
> - **Key Terms**: List 5-8 essential keywords
> - **Remember**: One-line takeaway for each major concept
> - **Common Mistakes**: 2-3 mistakes students typically make

**5. TEXTBOOK EXERCISE – SOLVED** (MANDATORY – THIS IS THE MOST IMPORTANT SECTION)

⚠️ This section MUST be COMPREHENSIVE. You MUST include EVERY SINGLE exercise question from the ${textbookName} textbook for this chapter. Do NOT skip, truncate, or summarize any question. Do NOT say "and so on" or "similarly for other questions".

List EVERY question from EVERY exercise in the chapter — Exercise 1, Exercise 2, Exercise 3, etc. Include:
- ALL "Answer in one sentence" / short answer questions
- ALL "Answer in brief" / long answer questions  
- ALL "Give reasons" / "Give scientific reasons" questions
- ALL "Differentiate between" questions
- ALL "Define" / "What is" questions
- ALL "True or False" with corrections
- ALL "Fill in the blanks" with answers
- ALL "Match the columns" with correct pairs
- ALL MCQs with correct answers marked
- ALL numerical / solve type problems with step-by-step solutions
- ALL diagram-based questions with descriptions
- ALL "Can you tell?" / "Use your brain power" / in-text questions

Format each as:
### Q1. [Full question text exactly as it appears in the textbook]
**Answer:**
[Complete, detailed, exam-ready answer]

Continue numbering sequentially: Q1, Q2, Q3... until EVERY question is covered. There should typically be 15-40+ questions per chapter. If the output is long, that is expected and desired. DO NOT stop early.

---

### FORMATTING RULES (STRICT):

1. **USE BOLD LIBERALLY** for all key terms, definitions, and important phrases – like a real highlighted textbook.
2. Use *italics* for scientific names, examples, and emphasis.
3. Use > blockquotes for definitions, important notes, and revision boxes.
4. Use --- horizontal rules to separate major sections.
5. Use markdown tables for ALL comparisons (minimum 3-4 rows).
6. Use numbered lists (1. 2. 3.) for sequential processes/steps.
7. Use bullet lists (- or *) for non-sequential points.
8. Use code blocks (\`\`\`) for formulas, equations, and diagrams.
9. **NO generic filler text**. Every sentence must add value.
10. **NO "Exam Weightage" sections**. Do not estimate marks.
11. **NO emojis in the actual notes content** (only in section label headers as shown above).
12. Keep language simple but authoritative – like a top teacher explaining.
13. Add **"Did You Know?"** boxes (in blockquotes) for interesting facts.
14. Make content SPECIFIC to the ${textbookName} ${boardName} Class ${grade} syllabus.
15. **DO NOT use a), b), c), d) style labels** for section headers. Use ### headings only.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: `You are a premium educational content creator specializing in ${boardName} Board. You create beautifully formatted, textbook-quality study notes that are specific, detailed, and visually structured. Your notes feel like a premium study guide, NOT generic web content. Every note you create is unique to the specific board, class, and chapter. You MUST include ALL textbook exercise questions with complete answers — never cut short or summarize. Write the full response no matter how long.` },
                { role: "user", content: prompt }
            ],
            temperature: 0.75,
            max_tokens: 16000,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
    }
}
