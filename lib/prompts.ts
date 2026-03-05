
import { BOARD_PATTERNS } from "./patterns";

export type DifficultyLevel = "easy" | "moderate" | "hard" | "replica" | "challenging";

interface GenerateOptions {
  difficulty?: DifficultyLevel;
  chapterWeights?: Record<string, number>;
  totalMarks?: number;
}

export function constructPrompt(
  boardInput: string,
  grade: string,
  subjectInput: string,
  chapters: string,
  options: GenerateOptions = {}
) {
  const board = boardInput.toLowerCase().trim();
  const subject = subjectInput.trim();

  let subjectKey = subject;
  if (subject.startsWith("Social Science")) subjectKey = "Social Science";
  if (subject === "EVS") subjectKey = "Science";

  // @ts-ignore
  let pattern = BOARD_PATTERNS[board]?.[`class${grade}`]?.[subjectKey];

  if (!pattern) {
    console.warn(`[constructPrompt] Exact Pattern not found for Board: ${board}, Class: ${grade}, Subject: ${subject}. Using fallback.`);
    if (["English", "Hindi", "Marathi", "Sanskrit"].includes(subject)) {
      pattern = {
        totalMarks: 40,
        structure: [
          { section: "SECTION A", type: "Reading / Grammar (Objective)", marskPerQuestion: 1, count: 10 },
          { section: "SECTION B", type: "Short Answer (Literature)", marskPerQuestion: 2, count: 5 },
          { section: "SECTION C", type: "Long Answer / Composition", marskPerQuestion: 5, count: 4 }
        ]
      };
    } else {
      pattern = {
        totalMarks: 40,
        structure: [
          { section: "SECTION A", type: "Objective / MCQs", marskPerQuestion: 1, count: 10 },
          { section: "SECTION B", type: "Short Answer", marskPerQuestion: 2, count: 5 },
          { section: "SECTION C", type: "Long Answer", marskPerQuestion: 5, count: 4 }
        ]
      };
    }
  }

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
    let attemptCount = s.count;
    let generateCount = s.count;
    let choiceInstruction = ``;

    if (scalingFactor === 1 && s.choice) {
      // Explicit choices defined in patterns (e.g., Any 2 from 3)
      const match = s.choice.match(/from\s+(\d+)/i);
      if (match) {
        generateCount = parseInt(match[1], 10);
        choiceInstruction = `Add instruction in italics under section name: '*Attempt any ${attemptCount} of the following ${generateCount} questions. Give scientific reasons where applicable.*'`;
      }
    } else if (attemptCount >= 2 && s.marskPerQuestion >= 2 && !s.type.toLowerCase().includes("mcq") && !s.type.toLowerCase().includes("objective") && !s.type.toLowerCase().includes("assertion")) {
      // Auto-inject dynamic internal choices for subjective questions
      generateCount = attemptCount >= 4 ? attemptCount + 2 : attemptCount + 1;
      choiceInstruction = `Add instruction in italics under section name: '*Attempt any ${attemptCount} of the following ${generateCount} questions. Give scientific reasons where applicable.*'`;
    }

    if (choiceInstruction) {
      return `- **${s.section}**: ${s.type} | GENERATE ${generateCount} QUESTIONS. (Students attempt ${attemptCount}) | ${s.marskPerQuestion} Marks each. | ${choiceInstruction}`;
    }

    return `- **${s.section}**: ${s.type} | GENERATE ${attemptCount} QUESTIONS. | ${s.marskPerQuestion} Marks each.`;
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

  // Textbook Question Sourcing Logic (grade-aware)
  const gradeNum = parseInt(grade, 10) || 0;
  let textbookSourcingInstruction = '';
  if (gradeNum >= 1 && gradeNum <= 9) {
    textbookSourcingInstruction = `
      === TEXTBOOK QUESTION SOURCING (MANDATORY FOR CLASS ${grade}) ===
      For Class ${grade}, ALL questions in this paper MUST come from the textbook exercises.
      - Use ONLY end-of-chapter exercise questions from the ${board.toUpperCase()} Board textbook
      - Include table/matching, short answer, long answer, and numerical questions exactly as they appear in the textbook exercises
      - DO NOT create original questions — every question must be sourced from the textbook chapter exercises
      - For numericals, use the exact given data and values from textbook exercise problems
      - Rephrase minimally if needed for formatting, but keep the core question identical
    `;
  } else {
    textbookSourcingInstruction = `
      === TEXTBOOK QUESTION SOURCING ===
      At least 70% of the questions MUST come from the textbook chapter exercises.
      - Prioritize end-of-chapter exercise questions from the ${board.toUpperCase()} Board textbook
      - For numericals, prefer using data and values from textbook exercise problems
      - Remaining 30% can be application-based or conceptual questions that test deeper understanding
      - DO NOT invent questions that have no connection to the textbook content
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
    3. **TEXTBOOK FIRST**: Questions must come from standard textbook exercises. For numericals, use data/values from the textbook exercise problems.
    4. **TONE ENFORCEMENT**: ${toneInstruction}
    5. **DIFFICULTY**: ${difficultyInstruction}
    6. **WEIGHTAGE**: ${options.chapterWeights ? weightageInstruction : "Balanced distribution."}
    7. **NO IMAGES OR DIAGRAMS**: ABSOLUTELY DO NOT generate any question that requires a figure, diagram, graph, map, or image. All questions MUST be purely text-based and answerable without any visual aids. (e.g., Do NOT ask "Observe the given figure...").

    ${textbookSourcingInstruction}

    === MANDATORY INCLUSIONS (Crucial) ===
    - **MATCH THE FOLLOWING**: You MUST include at least ONE "Match the Following" question set (e.g., Column A vs Column B) worth 2-4 marks.
    - **ACTIVITY/CASE/SOURCE**: For any "Case Based", "Source Based", or "Passage" sections:
      - You MUST provide a **long, detailed reading passage of AT LEAST 150-250 words**. 
      - Do NOT provide 1-2 sentence snippets. The paragraph must be substantial enough for students to read and extract answers from.
    
    === PAPER PATTERN (Calculated for ${totalMarks} Marks) ===
    ${structureText}

    === OUTPUT FORMAT ===
    - Use Markdown for strict formatting.
    
    <center>
    <h1>${board.toUpperCase()} BOARD EXAM - CLASS ${grade}</h1>
    <h3>${subject.toUpperCase()}</h3>
    </center>
    
    **Subject**: ${subject} | **Time**: ${duration} | **Max Marks**: ${totalMarks}
    
    ---
    
    **General Instructions:**
    1. All questions are compulsory.
    2. Marks are indicated against each question.
    
    ---
    // FORCE_REFRESH_TIMESTAMP_${Date.now()}
    
    - **SECTION HEADERS**: Use '### SECTION A' style (Bold and large).
    
    - **Questions**:
      - **CRITICAL**: EVERY single question must have a number.
      - Use 'Q.1', 'Q.2' for main questions.
      - Use '(i)', '(ii)', '(iii)' for sub-questions inside a main question.
      - **SPACING**: You MUST leave exactly ONE blank line between EVERY single question. Do not clump questions together.
      - Options for MCQs must be on new lines (a) ... (b) ... (c) ... (d) ...
      - **Match Pairs**: ALWAYS use a valid Markdown Table.
        Example:
        | Column A | Column B |
        | :--- | :--- |
        | 1. Item | A. Match |
        
    - **Math & Geometry**:
      - Use standard symbols: ∠ABC, 90°, π, ΔABC.
      - **STRICTLY NO DIAGRAMS**: Do NOT generate questions that rely on a figure/graph/map. All questions must be purely text-based and solvable without visual aids.
      
    - **Styling**:
      - Use Bold for numbers: '**Q.1**'.
      - Marks at the end of the question or section header: '**[X Mark(s)]**'.
      
    - NO preamble. Just the question paper.
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
    - **CRITICAL**: DO NOT put the entire answer key or multiple questions inside a single giant Markdown table.
    - **Standard Questions**: Answer standard questions using normal paragraphs and bullet points, NOT tables.
    - **Numbering**: COPY the question numbers EXACTLY from the paper (e.g. "Q.1", "1."). Do not invent new numbering.
    - **Match Columns**: ONLY use Markdown tables for specific "Match the Following" type questions.
      | Pair | Answer |
      | :--- | :--- |
      | 1. Item A | B. Item B |
    - **Spacing**: Separate EVERY solution and EVERY section header with exactly ONE empty line.
    
    OUTPUT:
    Start with "## ANSWER KEY / MARKING SCHEME".
    `;
}
