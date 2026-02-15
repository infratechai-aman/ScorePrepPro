
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
        // CALL 2: Generate ONLY exercise questions with answers
        // ============================================================
        const exercisePrompt = `
You are an expert ${boardName} Board teacher creating a comprehensive exercise set for Class ${grade || ''} students.

**BOARD**: ${boardName}
**CLASS**: ${grade || 'Not specified'}
**TEXTBOOK**: ${textbookName}
**SUBJECT**: ${subject}
**CHAPTER**: ${unit}

Create a COMPLETE set of practice exercises covering ALL concepts from this chapter. These exercises should follow the standard ${boardName} Board exam pattern and cover every topic thoroughly.

${board === 'maharashtra' ? `
## EXERCISE FORMAT (Maharashtra SSC Board Pattern):

Structure the exercises exactly like a standard Balbharati chapter-end exercise:

**Question 1**: A table-based matching exercise. Create a table with 3 columns (I, II, III) where Column I has concepts (e.g., Mass, Weight, Acceleration due to gravity, Gravitational constant), Column II has units/values, and Column III has properties/characteristics. Students need to rearrange and match correctly. Include the SOLVED rearranged table as the answer.

**Question 2**: "Answer the following questions." — Write 5 sub-parts (a through e):
- a: A comparison question (e.g., "What is the difference between mass and weight of an object. Will the mass and weight of an object on the earth be same as their values on Mars? Why?")
- b: A definition-based question covering 3-4 key terms (e.g., "What are (i) free fall, (ii) acceleration due to gravity (iii) escape velocity (iv) centripetal force?")
- c: A question about laws/principles (e.g., "Write the three laws given by Kepler. How did they help Newton to arrive at the inverse square law of gravity?")
- d: A derivation/proof question (e.g., "A stone thrown vertically upwards with initial velocity u reaches a height 'h' before coming down. Show that the time taken to go up is same as the time taken to come down.")
- e: A reasoning/application question (e.g., "If the value of g suddenly becomes twice its value, it will become two times more difficult to pull a heavy object along the floor. Why?")

**Question 3**: A conceptual explanation question (e.g., "Explain why the value of g is zero at the centre of the earth.")

**Question 4**: A mathematical proof/derivation question (e.g., "Let the period of revolution of a planet at a distance R from a star be T. Prove that if it was at a distance of 2R from the star, its period of revolution will be √8 T.")

**Question 5**: "Solve the following examples." — Write 7 numerical problems (a through g), each with:
- Specific given data with realistic values
- A printed answer (e.g., "Ans: 0.4 m/s²")
- Full step-by-step solution

The numerical problems should cover:
- a: Finding acceleration due to gravity on another planet (e.g., "An object takes 5 s to reach the ground from a height of 5 m on a planet. What is the value of g on the planet? Ans: 0.4 m/s²")
- b: Comparing masses using gravitational acceleration (e.g., finding mass of planet B given mass of planet A and ratio of g values, Ans: 2 MA)
- c: Mass and weight on moon (e.g., "The mass and weight of an object on earth are 5 kg and 49 N respectively. What will be their values on the moon? Assume g on moon is 1/6th of earth. Ans: 5 kg and 8.17 N")
- d: Projectile motion (e.g., "An object thrown vertically upwards reaches a height of 500 m. What was its initial velocity? How long will the object take to come back to earth? Assume g = 10 m/s². Ans: 100 m/s and 20 s")
- e: Free fall calculation (e.g., "A ball falls off a table and reaches the ground in 1 s. Calculate its speed on reaching the ground and the height of the table. g = 10 m/s². Ans: 10 m/s and 5 m")
- f: Gravitational force between celestial bodies (e.g., "The masses of the earth and moon are 6 x 10²⁴ kg and 7.4x10²² kg. The distance between them is 3.84 x 10⁵ km. Calculate the gravitational force. G = 6.7 x 10⁻¹¹ N m² kg⁻². Ans: 2 x 10²⁰ N")
- g: Finding mass of celestial body (e.g., "The mass of the earth is 6 x 10²⁴ kg. Distance between earth and Sun is 1.5x10¹¹ m. If gravitational force is 3.5 x 10²² N, what is mass of Sun? G = 6.7 x 10⁻¹¹. Ans: 1.96 x 10³⁰ kg")

Also include 3-5 in-chapter thinking questions like "Can you tell?", "Use your brain power" type boxes.
` : board === 'cbse' ? `
## EXERCISE FORMAT (NCERT Pattern):
Create 20-30 questions following NCERT exercise format:
- In-text questions (appear within the chapter)
- End-of-chapter exercises numbered 1 through 20+
- Mix of: MCQ, short answer (2-3 marks), long answer (5 marks), numerical problems, HOTS
- Cover every concept from the chapter
- Include specific experimental scenarios from the chapter
` : `
## EXERCISE FORMAT (ICSE Pattern):
Create exercises following Selina/Frank pattern:
- Exercise 1A: Objective (MCQ, fill blanks, true/false, match columns)
- Exercise 1B: Short answer questions
- Exercise 2A: Long answer and reasoning questions
- Exercise 2B: Numerical problems with answers
`}

## OUTPUT FORMAT:

---

## 📝 Chapter Exercises – Solved

**1. [Full question text]**

[Include table if applicable using markdown table format]

**Answer:**
[Complete solved answer with rearranged table if applicable]

---

**2. Answer the following questions.**

**a.** [Question text]
**Answer:** [Detailed answer]

**b.** [Question text]
**Answer:** [Detailed answer]

**c.** [Question text]
**Answer:** [Detailed answer]

**d.** [Question text]
**Answer:** [Detailed answer]

**e.** [Question text]
**Answer:** [Detailed answer]

---

**3. [Question text]**
**Answer:** [Detailed answer]

---

**4. [Question text]**
**Answer:** [Complete derivation/proof]

---

**5. Solve the following examples.**

**a.** [Numerical problem with given data] Ans: [printed answer]
- **Given:** [values]
- **To Find:** [what]
- **Formula:** [formula]
- **Solution:** [step-by-step]
- **Answer:** [final answer with units]

**b.** [Next numerical] Ans: [printed answer]
[...full solution...]

**c.** [Next numerical] Ans: [printed answer]
[...full solution...]

**d.** [Next numerical] Ans: [printed answer]
[...full solution...]

**e.** [Next numerical] Ans: [printed answer]
[...full solution...]

**f.** [Next numerical] Ans: [printed answer]
[...full solution...]

**g.** [Next numerical] Ans: [printed answer]
[...full solution...]

---

## CRITICAL RULES:
1. Include ALL 5 questions (Q1 through Q5) — NEVER skip Q3 or Q4
2. Q2 MUST have all 5 sub-parts (a, b, c, d, e) — NEVER stop at just a and b
3. Q5 MUST have all 7 numerical sub-parts (a, b, c, d, e, f, g) — NEVER stop at just 1
4. Every numerical must have Given, To Find, Formula, Solution, Answer
5. NEVER write a concluding paragraph — just end after the last answer
6. Make ALL questions specific to the chapter "${unit}" for ${boardName} Board Class ${grade}
7. This should be a VERY LONG response — 20-40+ question-answer pairs minimum
        `;

        // Run BOTH calls in parallel for speed
        const [notesCompletion, exerciseCompletion] = await Promise.all([
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
                    { role: "system", content: `You are an expert ${boardName} Board question paper setter and educator. Your task is to create a COMPREHENSIVE exercise set for students. You MUST write Q1 (table/matching), Q2 (5 sub-parts a-e), Q3 (reasoning), Q4 (proof/derivation), Q5 (7 numerical problems a-g with step-by-step solutions). NEVER skip any question. NEVER stop after just 2 sub-parts. Write ALL 5 questions with ALL sub-parts. NEVER write a conclusion paragraph. After the last solved numerical, just STOP.` },
                    { role: "user", content: exercisePrompt }
                ],
                temperature: 0.2,
                max_tokens: 16000,
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
