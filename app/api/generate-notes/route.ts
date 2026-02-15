
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { subject, unit, topics, board, grade, textbook } = await req.json();

        if (!subject || !unit || !topics) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const topicList = topics.map((t: any) => `- ${t.name} ${t.isImp ? '(IMPORTANT)' : ''}`).join("\n");

        const boardName = board === 'maharashtra' ? 'Maharashtra SSC' : board === 'cbse' ? 'CBSE' : board === 'icse' ? 'ICSE' : 'Standard';
        const textbookName = textbook || 'Standard textbook';

        // ============================================================
        // CALL 1: Generate study notes (concepts only, NO exercises)
        // ============================================================
        const notesPrompt = `
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

You are NOT writing generic Wikipedia-style notes. These are **premium, textbook-quality study notes**.

### STRUCTURE (Follow this order):

**1. CHAPTER TITLE** (use # heading)

**2. CHAPTER SNAPSHOT** (use > blockquote)
A 3-4 line overview that hooks the student.

**3. FOR EACH MAJOR CONCEPT/TOPIC**:

Use ## for the topic heading, then cover these sections (use ### for each):

### 🔑 Key Definition (in blockquote)
> **Definition**: Clear, concise definition from the ${textbookName} textbook.

### 📝 Explanation 
Write 4-6 bullet points explaining the concept. Use bold for key terms.

### 📊 Comparison Table (when applicable)
Use markdown tables with clear headers.

### ⚡ Key Formulas / Laws (when applicable)
Present formulas clearly. Include the formula name, equation, and variable meanings.

### 🔬 Diagram Description (when applicable)
Describe what a student should draw/visualize.

### 📌 Important Points to Remember
Use a bulleted list with **bold** keywords.

**4. QUICK REVISION BOX**
> **Quick Revision**:
> - **Key Terms**: List 5-8 essential keywords
> - **Remember**: One-line takeaway for each major concept
> - **Common Mistakes**: 2-3 mistakes students typically make

### FORMATTING RULES:
1. **USE BOLD LIBERALLY** for all key terms and important phrases.
2. Use *italics* for scientific names, examples, and emphasis.
3. Use > blockquotes for definitions and important notes.
4. Use --- horizontal rules to separate major sections.
5. Use markdown tables for ALL comparisons (minimum 3-4 rows).
6. Use code blocks for formulas and equations.
7. **NO generic filler**. Every sentence must add value.
8. Add **"Did You Know?"** boxes for interesting facts.
9. Make content SPECIFIC to the ${textbookName} ${boardName} Class ${grade} syllabus.
10. **DO NOT include any exercise questions in this section.** Exercises will be added separately.
        `;

        // ============================================================
        // CALL 2: Generate ONLY exercise questions with answers
        // ============================================================
        const exercisePrompt = `
You are a ${boardName} Board teacher who has the ${textbookName} textbook physically open in front of you right now.

**BOARD**: ${boardName}
**CLASS**: ${grade || 'Not specified'}
**TEXTBOOK**: ${textbookName}
**SUBJECT**: ${subject}
**CHAPTER**: ${unit}

YOUR ONLY TASK: Write out EVERY SINGLE exercise question from the end-of-chapter exercises of this specific chapter in the ${textbookName} textbook, along with complete answers.

These exercise questions are publicly documented on shaalaa.com, learncbse.in, maharashtrastudy.com, byjus.com, and topperlearning.com. You have been trained on content from these sites. Recall the EXACT questions.

${board === 'maharashtra' ? `
## BALBHARATI EXERCISE FORMAT (follow this EXACTLY):

The Balbharati textbook exercises for this chapter have this structure:
- **Question 1**: Table/matching/rewrite/fill-in-the-blanks type (includes a table with columns I, II, III that students must rearrange)
- **Question 2**: "Answer the following questions." followed by sub-parts a, b, c, d, e (5+ sub-parts, each is a conceptual/theory question)
- **Question 3**: "Explain why..." or reasoning questions
- **Question 4**: "Let..." or prove/derive type questions  
- **Question 5**: "Solve the following examples." followed by sub-parts a, b, c, d, e, f, g (each is a numerical problem with given data and a printed answer like "Ans: 0.4 m/s²")

Additionally include any in-chapter activity questions like "Can you tell?", "Use your brain power", "Think about it", "Do you know?" boxes.

EXAMPLE OF WHAT REAL BALBHARATI QUESTIONS LOOK LIKE (from Gravitation chapter):
- "1. Study the entries in the following table and rewrite them putting the connected items in a single row." [followed by actual table with Mass/Weight/Acceleration due to gravity/Gravitational constant in column I, units in column II, properties in column III]
- "2. Answer the following questions. a. What is the difference between mass and weight of an object. Will the mass and weight of an object on the earth be same as their values on Mars? Why?"
- "2b. What are (i) free fall, (ii) acceleration due to gravity (iii) escape velocity (iv) centripetal force?"
- "2c. Write the three laws given by Kepler. How did they help Newton to arrive at the inverse square law of gravity?"
- "5a. An object takes 5 s to reach the ground from a height of 5 m on a planet. What is the value of g on the planet? Ans: 0.4 m/s²"
- "5f. The masses of the earth and moon are 6 x 10²⁴ kg and 7.4x10²² kg, respectively. The distance between them is 3.84 x 10⁵ km. Calculate the gravitational force of attraction between the two? Use G = 6.7 x 10⁻¹¹ N m² kg⁻². Ans: 2 x 10²⁰ N"

YOUR output must match this level of specificity and detail.
` : board === 'cbse' ? `
## NCERT EXERCISE FORMAT:
- Questions numbered 1, 2, 3, 4... sequentially (typically 15-30 questions)
- Include "In-text Questions" from within the chapter
- Mix of MCQ, short answer, long answer, numerical, HOTS
- Questions reference specific experiments and examples from the chapter
` : `
## SELINA/FRANK EXERCISE FORMAT:
- Multiple exercises per chapter (Exercise 1A, 1B, 2A, etc.)
- Objective section: MCQ, fill blanks, true/false, match columns
- Subjective section: Short answer, long answer, reasoning
- Numerical problems with printed answers
`}

## OUTPUT FORMAT:

---

## 📝 Textbook Exercises – Solved

**1. [EXACT full question text from the ${textbookName} textbook]**

[Include any tables, data, or context that is part of the question]

**a.** [Exact sub-part text if applicable]
**Answer:** [Complete, detailed answer]

**b.** [Exact sub-part text]
**Answer:** [Complete, detailed answer]

[...continue ALL sub-parts]

**2. [EXACT next question from textbook]**

**a.** [Sub-part]
**Answer:** [Complete answer]

[...continue ALL sub-parts]

**3. [EXACT next question]**
**Answer:** [Complete answer]

**4. [EXACT next question]**
**Answer:** [Complete answer with derivation/proof if needed]

**5. [EXACT next question - typically "Solve the following examples"]**

**a.** [Numerical problem with exact given data from textbook]
- **Given:** [all given values]
- **To Find:** [what to calculate]  
- **Formula:** [relevant formula]
- **Solution:** [step-by-step calculation]
- **Answer:** [final answer with units] *(Textbook Ans: [printed answer])*

[...continue b, c, d, e, f, g with ALL numerical sub-parts]

---

## ABSOLUTE RULES:
1. Write EVERY question from the exercise — Q1, Q2, Q3, Q4, Q5 with ALL sub-parts (a through g)
2. Use the REAL question text from the ${textbookName} textbook — do NOT rephrase or invent
3. For Q1 type (tables/matching), reproduce the ACTUAL table content
4. For Q2 type, include ALL sub-parts a, b, c, d, e (typically 5+ parts)
5. For Q5 numericals, include ALL sub-parts with the textbook's printed answer
6. Include in-text questions ("Can you tell?", "Use your brain power", etc.)
7. DO NOT stop early. DO NOT skip any question. DO NOT summarize.
8. If unsure about exact wording, write the closest accurate version you can recall
9. This response should contain 20-40+ question-answer pairs
        `;

        // Run BOTH calls in parallel for speed
        const [notesCompletion, exerciseCompletion] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `You are a premium educational content creator for ${boardName} Board. Create beautifully formatted study notes. Do NOT include exercise questions — only conceptual notes.` },
                    { role: "user", content: notesPrompt }
                ],
                temperature: 0.7,
                max_tokens: 8000,
            }),
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `You are a ${boardName} Board teacher who has memorized every exercise question from the ${textbookName} textbook. Your ONLY job is to write out the COMPLETE end-of-chapter exercise with ALL questions and ALL sub-parts, exactly as they appear in the textbook. You recall these from educational sites like shaalaa.com, learncbse.in, and maharashtrastudy.com. Never skip questions. Never invent questions. Write the REAL textbook exercises.` },
                    { role: "user", content: exercisePrompt }
                ],
                temperature: 0.2,
                max_tokens: 10000,
            })
        ]);

        const notesContent = notesCompletion.choices[0].message.content || '';
        const exerciseContent = exerciseCompletion.choices[0].message.content || '';

        // Combine: notes first, then exercises
        const content = notesContent + '\n\n---\n\n' + exerciseContent;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
    }
}
