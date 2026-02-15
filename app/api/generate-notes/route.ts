
import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 180;

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
        // EXERCISE PART A: Q1, Q2 (a-e), Q3
        // ============================================================
        const exercisePromptA = `
You are an expert ${boardName} Board educator creating practice exercises for Class ${grade || ''} ${subject} — Chapter: "${unit}".

Create Questions 1, 2, and 3 ONLY (do NOT write Q4 or Q5 — those will be handled separately).

${board === 'maharashtra' ? `
## FORMAT (Maharashtra SSC Board Pattern):

**Question 1**: A table-based matching/rewriting exercise.
- Create a table with 3 columns (I, II, III)
- Column I: Key concepts from this chapter (4-5 rows)
- Column II: Units, values, or formulas (jumbled)
- Column III: Properties or characteristics (jumbled)
- Students must rearrange and match correctly
- **Write the SOLVED rearranged table as the answer using markdown table**

**Question 2**: "Answer the following questions." — Write exactly 5 sub-parts (a, b, c, d, e):
- **a**: Comparison question (e.g., "What is the difference between mass and weight of an object. Will the mass and weight of an object on the earth be same as their values on Mars? Why?")
- **b**: Definition question covering 3-4 key terms with (i), (ii), (iii), (iv) format (e.g., "What are (i) free fall, (ii) acceleration due to gravity (iii) escape velocity (iv) centripetal force?")
- **c**: Laws/principles question (e.g., "Write the three laws given by Kepler. How did they help Newton to arrive at the inverse square law of gravity?")
- **d**: Derivation/proof question (e.g., "A stone thrown vertically upwards with initial velocity u reaches a height 'h' before coming down. Show that the time taken to go up is same as the time taken to come down.")
- **e**: Reasoning/application question (e.g., "If the value of g suddenly becomes twice its value, it will become two times more difficult to pull a heavy object along the floor. Why?")
- Each answer should be detailed (5-10 lines minimum)

**Question 3**: A conceptual explanation question (e.g., "Explain why the value of g is zero at the centre of the earth.")
- Answer should be thorough with proper scientific reasoning
` : board === 'cbse' ? `
## FORMAT (NCERT Pattern):
Write the first 15 questions of the exercise:
- Include any "In-text Questions" from within the chapter
- Mix of MCQ, short answer, long answer
- Cover all key concepts from the first half of the chapter
` : `
## FORMAT (ICSE Pattern):
Write Exercise 1A and 1B:
- 1A: Objective (MCQ, fill blanks, true/false, match columns) — at least 10 questions
- 1B: Short answer questions — at least 8 questions
`}

## OUTPUT FORMAT:

## 📝 Chapter Exercises – Solved

**1. [Full question text including table instructions]**

| I | II | III |
|---|---|---|
| [concept] | [jumbled unit] | [jumbled property] |
| ... | ... | ... |

**Answer:**

| I | II | III |
|---|---|---|
| [correct concept] | [correct unit] | [correct property] |
| ... | ... | ... |

---

**2. Answer the following questions.**

**a.** [Question text]  
**Answer:** [Detailed 5-10 line answer]

**b.** [Question text]  
**Answer:** [Detailed answer]

**c.** [Question text]  
**Answer:** [Detailed answer]

**d.** [Question text]  
**Answer:** [Detailed answer with derivation if needed]

**e.** [Question text]  
**Answer:** [Detailed answer]

---

**3. [Question text]**  
**Answer:** [Thorough explanation]

RULES:
- You MUST write ALL 5 sub-parts of Q2 (a, b, c, d, e) — do NOT stop at 2
- Each answer must be detailed, not one-liners
- Do NOT write Q4 or Q5 — ONLY Q1, Q2, Q3
- Do NOT write any conclusion paragraph
- Make all questions specific to "${unit}" for ${boardName} Board Class ${grade}
        `;

        // ============================================================
        // EXERCISE PART B: Q4, Q5 (a-g), In-chapter questions
        // ============================================================
        const exercisePromptB = `
You are an expert ${boardName} Board educator creating practice exercises for Class ${grade || ''} ${subject} — Chapter: "${unit}".

Create Questions 4, 5, and bonus in-chapter thinking questions ONLY (Q1, Q2, Q3 are already done separately).

${board === 'maharashtra' ? `
## FORMAT (Maharashtra SSC Board Pattern):

**Question 4**: A mathematical proof/derivation question related to this chapter.
- Example: "Let the period of revolution of a planet at a distance R from a star be T. Prove that if it was at a distance of 2R from the star, its period of revolution will be √8 T."
- Answer must include full step-by-step mathematical derivation

**Question 5**: "Solve the following examples." — Write exactly 7 numerical problems (a through g):

Each numerical MUST have:
- Full question text with specific given data
- A printed answer like "Ans: 0.4 m/s²"
- Complete solution in format: Given → To Find → Formula → Solution → Answer

The 7 numericals should cover these types:
- **a**: Finding g on another planet (e.g., "An object takes 5 s to reach the ground from a height of 5 m on a planet. What is the value of g on the planet? Ans: 0.4 m/s²")
- **b**: Comparing planet masses using g ratios (e.g., "The radius of planet A is half the radius of planet B. If the mass of A is MA, what must be the mass of B so that the value of g on B is half that of its value on A? Ans: 2 MA")
- **c**: Weight on moon (e.g., "The mass and weight of an object on earth are 5 kg and 49 N respectively. What will be their values on the moon? Assume g on moon is 1/6th of earth. Ans: 5 kg and 8.17 N")
- **d**: Vertical projectile (e.g., "An object thrown vertically upwards reaches a height of 500 m. What was its initial velocity? How long will the object take to come back to earth? Assume g = 10 m/s². Ans: 100 m/s and 20 s")
- **e**: Free fall (e.g., "A ball falls off a table and reaches the ground in 1 s. Assuming g = 10 m/s², calculate its speed on reaching the ground and the height of the table. Ans: 10 m/s and 5 m")
- **f**: Gravitational force calculation (e.g., "The masses of the earth and moon are 6 x 10²⁴ kg and 7.4x10²² kg. Distance between them is 3.84 x 10⁵ km. Calculate gravitational force. G = 6.7 x 10⁻¹¹ N m² kg⁻². Ans: 2 x 10²⁰ N")
- **g**: Finding mass of celestial body (e.g., "Mass of earth is 6 x 10²⁴ kg. Distance between earth and Sun is 1.5x10¹¹ m. If gravitational force is 3.5 x 10²² N, what is mass of Sun? G = 6.7 x 10⁻¹¹. Ans: 1.96 x 10³⁰ kg")

**Bonus: In-Chapter Thinking Questions** — Write 3-5 questions like:
- "Can you tell?" boxes
- "Use your brain power" boxes  
- "Think about it" boxes
These should be thought-provoking conceptual questions related to the chapter.
` : board === 'cbse' ? `
## FORMAT (NCERT Pattern):
Write questions 16 through 30 of the exercise:
- Long answer questions (5 marks each)
- Numerical problems with step-by-step solutions
- HOTS (Higher Order Thinking Skills) questions
- Cover all key concepts from the second half of the chapter
` : `
## FORMAT (ICSE Pattern):
Write Exercise 2A and 2B:
- 2A: Long answer and reasoning questions — at least 8 questions
- 2B: Numerical problems with full solutions — at least 7 problems with printed answers
`}

## OUTPUT FORMAT:

**4. [Question text — derivation/proof type]**  
**Answer:**  
[Complete step-by-step mathematical derivation]

---

**5. Solve the following examples.**

**a.** [Numerical problem with given data] Ans: [printed answer]
- **Given:** [all values with units]
- **To Find:** [what to calculate]
- **Formula:** [relevant formula]
- **Solution:** [step-by-step calculation showing work]
- **Answer:** [final answer with units]

**b.** [Numerical problem] Ans: [printed answer]
- **Given:** [values]
- **To Find:** [what]
- **Formula:** [formula]
- **Solution:** [steps]
- **Answer:** [answer]

**c.** [Numerical problem] Ans: [printed answer]
[...full solution...]

**d.** [Numerical problem] Ans: [printed answer]
[...full solution...]

**e.** [Numerical problem] Ans: [printed answer]
[...full solution...]

**f.** [Numerical problem] Ans: [printed answer]
[...full solution...]

**g.** [Numerical problem] Ans: [printed answer]
[...full solution...]

---

## 💡 In-Chapter Thinking Questions

**Can you tell?**
[Question] → **Answer:** [Answer]

**Use your brain power:**
[Question] → **Answer:** [Answer]

**Think about it:**
[Question] → **Answer:** [Answer]

RULES:
- You MUST write ALL 7 numericals in Q5 (a through g) — do NOT stop at just 1 or 2
- Each numerical must have full Given/To Find/Formula/Solution/Answer format
- Do NOT write Q1, Q2, or Q3 — ONLY Q4, Q5, and bonus questions
- Do NOT write any conclusion paragraph — just end after the last answer
- Make all questions specific to "${unit}" for ${boardName} Board Class ${grade}
        `;

        const exerciseSystemMsg = `You are an expert ${boardName} Board question paper setter. Create comprehensive, exam-quality exercises. Write EVERY question asked of you with detailed answers. NEVER skip sub-parts. NEVER write a conclusion paragraph. After the last answer, just STOP.`;

        // Run ALL 3 calls in parallel: notes + exercise part A + exercise part B
        const [notesCompletion, exerciseCompletionA, exerciseCompletionB] = await Promise.all([
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: `You are a premium educational content creator for ${boardName} Board. Create beautifully formatted study notes. Do NOT include exercise questions — only conceptual notes. Keep it concise but thorough.` },
                    { role: "user", content: notesPrompt }
                ],
                temperature: 0.7,
                max_tokens: 5000,
            }),
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: exerciseSystemMsg },
                    { role: "user", content: exercisePromptA }
                ],
                temperature: 0.3,
                max_tokens: 10000,
            }),
            openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: exerciseSystemMsg },
                    { role: "user", content: exercisePromptB }
                ],
                temperature: 0.3,
                max_tokens: 10000,
            })
        ]);

        const notesContent = notesCompletion.choices[0].message.content || '';
        const exerciseA = exerciseCompletionA.choices[0].message.content || '';
        const exerciseB = exerciseCompletionB.choices[0].message.content || '';

        // Combine: notes + exercise part A (Q1-Q3) + exercise part B (Q4-Q5)
        const content = notesContent + '\n\n---\n\n' + exerciseA + '\n\n' + exerciseB;

        return NextResponse.json({ content });

    } catch (error) {
        console.error("Error generating notes:", error);
        return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
    }
}
