
import { BOARD_PATTERNS } from "./patterns";

export type DifficultyLevel = "easy" | "moderate" | "hard" | "replica" | "challenging";

interface GenerateOptions {
  difficulty?: DifficultyLevel;
  chapterWeights?: Record<string, number>;
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

  const structureText = pattern.structure.map((s: any) =>
    `- **${s.section}**: ${s.type} | ${s.count} Questions | ${s.marskPerQuestion} Marks each. ${s.choice ? `(${s.choice})` : ""}`
  ).join("\n");

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

  return `
    You are an expert ${board.toUpperCase()} Board Paper Setter for Class ${grade}.
    
    GOAL: Generate a STRICTLY syllabus-aligned question paper.
    
    SUBJECT: ${subject.toUpperCase()}
    CHAPTERS: ${chapters}
    TOTAL MARKS: ${pattern.totalMarks}

    === NON-NEGOTIABLE GOLDEN RULES ===
    1. **CHAPTER LOCK**: Questions must come ONLY from: "${chapters}". REJECT any concept outside this scope.
    2. **STRICT STRUCTURE**: Follow the section structure below EXACTLY. Do not change question counts or marks.
    3. **TEXTBOOK FIRST**: numericals and questions must resemble standard textbook exercises.
    4. **TONE ENFORCEMENT**: ${toneInstruction}
    5. **DIFFICULTY**: ${difficultyInstruction}
    6. **WEIGHTAGE**: ${weightageInstruction}

    === MANDATORY INCLUSIONS (Crucial) ===
    - **MATCH THE FOLLOWING**: You MUST include at least ONE "Match the Following" question set (e.g., Column A vs Column B) worth 2-4 marks.
    - **ACTIVITY/CASE**: If applicable to the board, include a case study or activity-based question.
    
    === PAPER PATTERN ===
    ${structureText}

    === OUTPUT FORMAT ===
    - Use Markdown for strict formatting.
    - **PAPER HEADER**:
      - Center Align the Board Name (e.g., <center># CBSE BOARD EXAM</center>).
      - Below it, put Subject, Time, and Marks in a clean horizontal line pattern or table.
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
    
    OUTPUT:
    Start with "## ANSWER KEY / MARKING SCHEME".
    `;
}
