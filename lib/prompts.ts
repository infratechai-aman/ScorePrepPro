
import { BOARD_PATTERNS } from "./patterns";

export type DifficultyLevel = "easy" | "moderate" | "hard" | "replica" | "challenging";

interface GenerateOptions {
  difficulty?: DifficultyLevel;
  chapterWeights?: Record<string, number>;
  totalMarks?: number;
}

export function constructPrompt(
  board: string,
  grade: string,
  subject: string,
  chapters: string,
  options: GenerateOptions = {}
) {
  // @ts-ignore
  const pattern = BOARD_PATTERNS[board]?.[`class${grade}`]?.[subject];

  if (!pattern) return null;

  // Calculate scaling factor
  const totalMarks = options.totalMarks || pattern.totalMarks || 40;
  const originalMarks = pattern.totalMarks || 40;
  const scalingFactor = totalMarks / originalMarks;

  // 1. Initial Scale (Floor to avoid overshooting, then fill up)
  let newStructure = pattern.structure.map((s: any) => {
    let newCount = Math.floor(s.count * scalingFactor);
    // Ensure at least 1 question if original had questions and ratio is decent
    if (s.count > 0 && newCount === 0 && scalingFactor > 0.15) newCount = 1;
    return { ...s, count: newCount };
  });

  // 2. Correction Loop to match Total Marks EXACTLY
  let currentTotal = newStructure.reduce((sum: number, s: any) => sum + (s.count * s.marskPerQuestion), 0);
  let attempts = 0;

  // We loop to adjust counts until we hit the target or run out of attempts
  while (currentTotal !== totalMarks && attempts < 50) {
    const diff = totalMarks - currentTotal;

    if (diff > 0) {
      // Need MORE marks. Prefer adding to sections with lowest marks/q (e.g. MCQs) to fill gap precisely
      // Find smallest denomination that fits or just smallest available
      let candidate = newStructure.find((s: any) => s.marskPerQuestion <= diff && s.marskPerQuestion > 0);

      // If strict fit not found, just pick smallest available question type
      if (!candidate) {
        candidate = newStructure.reduce((prev: any, curr: any) =>
          (prev.marskPerQuestion < curr.marskPerQuestion && prev.marskPerQuestion > 0) ? prev : curr
        );
      }

      if (candidate) {
        candidate.count++;
        currentTotal += candidate.marskPerQuestion;
      }
    } else {
      // Need FEWER marks.
      // Try to remove from sections with >1 question first
      const diffAbs = Math.abs(diff);
      let candidate = newStructure.find((s: any) => s.count > 1 && s.marskPerQuestion <= diffAbs);

      if (!candidate) {
        // Fallback: Remove even if count is 1, preferring smallest marks to avoid massive undershoot
        candidate = newStructure.find((s: any) => s.count > 0 && s.marskPerQuestion <= diffAbs);
      }

      // If still no candidate (e.g. all questions are too big), remove ANY to get below target, then add back
      if (!candidate) {
        candidate = newStructure.find((s: any) => s.count > 0);
      }

      if (candidate) {
        candidate.count--;
        currentTotal -= candidate.marskPerQuestion;
      }
    }
    attempts++;
  }

  // Generate Scaled Pattern Text
  const structureText = newStructure.map((s: any) => {
    // If we scaled the paper (factor != 1), we MUST remove the "Choice" instruction (e.g. "Any 2 from 3")
    // because that forces the AI to generate extra questions ("from 3"), breaking our strict count.
    const showChoice = scalingFactor === 1 ? (s.choice ? `(${s.choice})` : "") : "";

    return `- **${s.section}**: ${s.type} | ${s.count} Questions | ${s.marskPerQuestion} Marks each. ${showChoice}`;
  }).join("\n");

  const diff = options.difficulty || "moderate";

  let difficultyInstruction = "";
  let toneInstruction = "";

  // Difficulty Logic
  switch (diff) {
    case "easy":
      difficultyInstruction = "LEVEL: EASY (School Test). Direct textbook questions, simple numbers, no complex reasoning.";
      break;
    case "moderate":
      difficultyInstruction = "LEVEL: MODERATE (Standard Board). 70% direct textbook, 30% simple application.";
      break;
    case "hard":
      difficultyInstruction = "LEVEL: HARD. 50% textbook, 50% conceptual/application. Complex word problems.";
      break;
    case "replica":
      difficultyInstruction = "LEVEL: EXAM REPLICA (Previous Year Style). MATCH EXACT BOARD DIFFICULTY. Mix of repetitive and tricky questions.";
      break;
    case "challenging":
      difficultyInstruction = "LEVEL: CHALLENGING (Olympiad/Foundation). High reasoning depth, multi-step problems, strict concept testing.";
      break;
  }

  // Tone Logic
  if (board === "maharashtra") {
    toneInstruction = `
      USE MAHARASHTRA SSC TONE:
      - "Attempt any..."
      - "Solve the following"
      - "Give scientific reasons"
      - "Observe the diagram and answer"
      - "Complete the following activity"
      `;
  } else if (board === "cbse") {
    toneInstruction = `
      USE CBSE TONE:
      - "Read the following passage and answer" (for Case based)
      - "Assertion (A): ... Reason (R): ..."
      - "Justify your answer"
      `;
  } else if (board === "icse") {
    toneInstruction = `
      USE ICSE TONE (Selina/Frank textbook style):
      - "Give reasons for the following"
      - "Name the following"
      - "Differentiate between"
      - "Draw a neat labelled diagram of"
      - "Define the term"
      - "State the law"
      - Questions should follow ICSE Council exam format
      `;
  }

  // Weightage Logic
  let weightageInstruction = "";
  if (options.chapterWeights) {
    weightageInstruction = "STRICT CHAPTER WEIGHTAGE (Approximate Marks Distribution):\n";
    Object.entries(options.chapterWeights).forEach(([chap, weight]) => {
      if (weight > 0) {
        weightageInstruction += `- ${chap}: ${weight}% of total marks\n`;
      }
    });
  }

  // Calculate Duration
  let duration = "2 Hours";
  if (totalMarks <= 10) duration = "30 Mins";
  else if (totalMarks <= 20) duration = "1 Hour";
  else if (totalMarks <= 40) duration = "2 Hours";
  else duration = "3 Hours";

  // Adjust prompt to force strict adherence to the CALCULATED structure
  return `
    You are an expert ${board.toUpperCase()} Board Paper Setter for Class ${grade}.
    
    GOAL: Generate a STRICTLY syllabus-aligned question paper.
    
    SUBJECT: ${subject.toUpperCase()}
    CHAPTERS: ${chapters}
    TOTAL MARKS: ${totalMarks}
    
    === BLUEPRINT (STRICTLY FOLLOW) ===
    The following blueprint has been pre-calculated for ${totalMarks} marks.
    YOU MUST FOLLOW QUESTION COUNTS EXACTLY. DO NOT CHANGE THEM.
    
    ${structureText}

    === NON-NEGOTIABLE GOLDEN RULES ===
    1. **CHAPTER LOCK**: Questions must come ONLY from: "${chapters}". REJECT any concept outside this scope.
    2. **STRICT COUNTS**: usage of the blueprint above is MANDATORY. Do not ask more or fewer questions.
    3. **TEXTBOOK FIRST**: numericals and questions must resemble standard textbook exercises.
    4. **TONE ENFORCEMENT**: ${toneInstruction}
    5. **DIFFICULTY**: ${difficultyInstruction}
    6. **WEIGHTAGE**: ${options.chapterWeights ? weightageInstruction : "Balanced distribution."}

    === MANDATORY INCLUSIONS (Crucial) ===
    - **MATCH THE FOLLOWING**: You MUST include at least ONE "Match the Following" question set (e.g., Column A vs Column B) worth 2-4 marks.
    - **ACTIVITY/CASE**: If applicable to the board, include a case study or activity-based question.
    
    === PAPER PATTERN (Calculated for ${totalMarks} Marks) ===
    ${structureText}

    === OUTPUT FORMAT ===
    - Use Markdown for strict formatting.
    - **PAPER HEADER**:
      - LINE 1: Board Name in H1 (e.g., # CBSE BOARD EXAM).
      - LINE 2: Use a Blockquote for metadata: \`> **Subject:** ${subject} | **Time:** ${duration} | **Marks:** ${totalMarks}\`.
      - Use '---' horizontal rules to separate sections.
    // FORCE_REFRESH_TIMESTAMP_${Date.now()}
    - **SECTION HEADERS**: Use '## SECTION A' style (Bold and large).
    - **Questions**:
      - **CRITICAL**: EVERY single question must have a number.
      - Use 'Q.1', 'Q.2' for main questions.
      - Use '1.', '2.', '3.' for sub-questions inside a main question.
      - **SPACING**: Separated every question by TWO empty lines.
      - Options for MCQs must be on new lines (a) ... (b) ...
      - **Match Pairs**: ALWAYS use a valid Markdown Table.
        Example:
        | Column A | Column B |
        | :--- | :--- |
        | 1. Item | A. Match |
    - **Math & Geometry**:
      - Use standard symbols: ∠ABC, 90°, π, ΔABC.
      - **STRICTLY NO DIAGRAMS**: Do NOT generate questions that rely on a figure/graph/map. All questions must be purely text-based and solvable without visual aids.
    - **Styling**:
      - Use Bold for numbers: '**1.**'.
      - Marks at the end: '**[1 Mark each]**' (if multiple items) or '**[X Marks]**' (if single big question).
      - Section Headers should clarify marks: "Q.1 Choose the Correct Option: **[1 Mark each]**"
    - NO preamble. Just the paper.
  `;
}

export function constructSolutionPrompt(paperContent: string, board: string) {
  return `
    You are a Senior Moderator for ${board.toUpperCase()} Board.
    
    TASK: Generate a detailed **ANSWER KEY** for the provided Question Paper.
    
    INPUT PAPER:
    "${paperContent.substring(0, 10000)}" (truncated if too long)
    
    RULES:
    1. **Format**: Section-wise solutions.
    2. **Step-marking**: Show steps for numericals/derivations (Formula -> Substitution -> Calculation -> Final Answer).
    3. **Tone**: Official marking scheme style.
    4. **Diagrams**: Describe what the diagram should show if a diagram is required.
    
    STRICT OUTPUT FORMATTING:
    - **Numbering**: COPY the question numbers EXACTLY from the paper (e.g. "Q.1", "1."). Do not invent new numbering.
    - **Match Columns**: ALWAYS return as a valid Markdown Table.
      | Pair | Answer |
      | :--- | :--- |
      | 1. Item A | B. Item B |
    - **Spacing**: Separated EVERY solution with ONE empty line.
    
    OUTPUT:
    Start with "## ANSWER KEY / MARKING SCHEME".
    `;
}
