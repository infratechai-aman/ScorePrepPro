
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

**5. TEXTBOOK EXERCISE – SOLVED** (MANDATORY – MOST IMPORTANT SECTION)

## ⚠️ CRITICAL: USE REAL TEXTBOOK QUESTIONS ONLY

You MUST recall and reproduce the ACTUAL end-of-chapter exercise questions from the **${textbookName}** textbook for **${boardName} Board Class ${grade}**, chapter: **${unit}**.

These questions are publicly available on educational websites like shaalaa.com, learncbse.in, maharashtrastudy.com, byjus.com, and topperlearning.com. You have been trained on this data. Recall the EXACT questions from these sources.

**❌ WRONG (DO NOT DO THIS — these are INVENTED generic questions):**
- "Define the Universal Law of Gravitation."
- "Calculate the force between two masses of 10 kg and 20 kg..."
- "What is the significance of the gravitational constant?"
These are GENERIC questions that YOU made up. The textbook does NOT contain these exact questions.

**✅ CORRECT (These are REAL Balbharati textbook questions for Gravitation):**
- "1. Study the entries in the following table and rewrite them putting the connected items in a single row."
- "2. Answer the following questions: a. What is the difference between mass and weight of an object?"
- "5. Solve the following examples: a. An object takes 5 s to reach the ground from a height of 5 m on a planet. What is the value of g on the planet? Ans: 0.4 m/s²"

You MUST follow the CORRECT pattern above. The exercise questions in ${textbookName} textbooks:
${board === 'maharashtra' ? `
- Are organized as Question 1, 2, 3, 4, 5 (NOT as separate "sections")
- Q1 is usually a table/rewrite/match type
- Q2 says "Answer the following questions" followed by a, b, c, d, e sub-parts
- Q3 is usually "Explain" or reasoning type
- Q4 is usually a derivation/proof
- Q5 says "Solve the following examples" with sub-parts a through g, each with given numerical data and a printed answer like "Ans: 0.4 m/s²"
- In-chapter boxes include "Can you tell?", "Use your brain power", "Think about it", "Always remember"
` : board === 'cbse' ? `
- Are from NCERT textbook exercises at the end of each chapter
- Numbered sequentially 1, 2, 3... (up to 20-30 questions)
- Include "In-text Questions" that appear within the chapter
- Mix of MCQ, short answer, long answer, numericals, HOTS
- Questions reference specific examples and experiments from the chapter
` : `
- Are from Selina/Frank textbook exercises 
- Organized as Exercise 1A, 1B, 2A, etc.
- Include objective (MCQ, fill blanks, true/false, match) and subjective sections
- Numerical problems include worked answers
`}

## Format for exercises:

## 📝 Textbook Exercises – Solved

**1. [EXACT question text from the real ${textbookName} textbook]**

[If has sub-parts:]

**a.** [Exact sub-part text]
**Answer:** [Complete answer]

**b.** [Exact sub-part text]  
**Answer:** [Complete answer]

**2. [EXACT next question from textbook]**
**Answer:** [Complete answer]

[Continue all questions with all sub-parts]

For numericals:
- **Given:** [values]
- **To Find:** [what]
- **Formula:** [formula]
- **Solution:** [steps]
- **Answer:** [answer with units, matching printed textbook answer]

**ABSOLUTE RULES:**
- Every question must be a REAL question from the ${textbookName} textbook chapter "${unit}"
- DO NOT rephrase — use the exact wording from the textbook
- DO NOT invent — if you cannot recall a question, it is better to write fewer real questions than many fake ones
- Include ALL questions and ALL sub-parts
- This must be the LONGEST section of the notes

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

        const systemMessage = board === 'maharashtra'
            ? `You are a Maharashtra SSC Board teacher who has the Balbharati textbook physically in front of you. You have taught this exact textbook for 15 years. You know every single exercise question from every chapter by heart. When asked to write exercise questions, you reproduce the EXACT questions from the Balbharati textbook — not your own invented questions. Your exercise questions are sourced from shaalaa.com and maharashtrastudy.com question banks for Balbharati textbooks. You create premium, beautifully formatted study notes. Never cut short or summarize. Write the complete response.`
            : board === 'cbse'
                ? `You are a CBSE Board teacher who has the NCERT textbook physically in front of you. You have taught this exact textbook for 15 years. You know every single exercise question from every chapter by heart. When asked to write exercise questions, you reproduce the EXACT questions from the NCERT textbook — not your own invented questions. Your exercise questions are sourced from learncbse.in and ncert.nic.in. You create premium, beautifully formatted study notes. Never cut short or summarize. Write the complete response.`
                : `You are an ICSE Board teacher who has the Selina/Frank textbook physically in front of you. You have taught this exact textbook for 15 years. You know every single exercise question from every chapter by heart. When asked to write exercise questions, you reproduce the EXACT questions from the Selina/Frank textbook — not your own invented questions. You create premium, beautifully formatted study notes. Never cut short or summarize. Write the complete response.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 16000,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
    }
}
