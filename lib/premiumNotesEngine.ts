// Premium Notes Engine — 7-Step Multi-Call AI Pipeline
// Produces coaching-institute-quality notes that look deeply human-written
// ONLY for THE TEACHER plan

import { openai } from "./openai";

// ====================================================================
// TYPES
// ====================================================================

export interface NotesBlueprint {
    concepts: string[];
    subtopics: string[];
    formulas: string[];
    definitions: { term: string; meaning: string }[];
    diagramsNeeded: string[];
    tablesNeeded: string[];
    memoryTricks: string[];
    examFocusAreas: string[];
}

export interface NotesOutline {
    title: string;
    sections: { id: string; heading: string; type: string; description: string }[];
}

export type PipelineStep =
    | "analyzing"
    | "outlining"
    | "generating"
    | "humanizing"
    | "enhancing"
    | "diagrams"
    | "assembling"
    | "done";

export interface PipelineProgress {
    step: PipelineStep;
    stepNumber: number;
    totalSteps: number;
    message: string;
    sectionProgress?: string;
}

// ====================================================================
// THE SYSTEM PROMPT — used across all generation calls
// ====================================================================

const ELITE_WRITER_SYSTEM = `You are an elite academic writer, philosopher-level educator, and premium educational content designer.

ABSOLUTE RULES:
- Write as if you are the most brilliant teacher who has 30 years of experience
- Every sentence must demonstrate deep understanding, not surface-level paraphrasing
- NEVER write like AI. NEVER use emojis. NEVER sound robotic.
- NEVER use "In conclusion", "To summarize", "It is important to note", "Let us explore", "As we delve into"
- NEVER use repetitive transition patterns
- NEVER overexplain simple concepts
- NEVER use excessive formality or academic jargon without purpose
- Vary sentence length naturally — mix short punchy statements with longer explanatory ones
- Use the tone of a brilliant mentor explaining to a sharp student, not a textbook to a child
- Think like a philosopher, write like a journalist, structure like an architect`;

// ====================================================================
// STEP 1: CONTENT ANALYSIS
// ====================================================================

async function analyzeContent(
    knowledgeText: string,
    subjectName: string,
    unitTitle: string
): Promise<NotesBlueprint> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a curriculum analysis expert. Analyze educational content and extract a structured blueprint for notes generation. Output ONLY valid JSON, no markdown blocks.`
            },
            {
                role: "user",
                content: `Analyze this content for "${subjectName}" — "${unitTitle}":

${knowledgeText.substring(0, 20000)}

Extract this JSON:
{
  "concepts": ["every distinct concept covered, be thorough"],
  "subtopics": ["ordered list of subtopics for logical study flow"],
  "formulas": ["every formula, equation, or mathematical relationship"],
  "definitions": [{"term": "...", "meaning": "one-line definition"}],
  "diagramsNeeded": ["describe each diagram that would aid understanding"],
  "tablesNeeded": ["describe each comparison table that would be useful"],
  "memoryTricks": ["suggest mnemonics or memory aids for complex concepts"],
  "examFocusAreas": ["topics most likely to appear in exams"]
}`
            }
        ],
        temperature: 0.2,
        max_tokens: 4000,
    });

    const raw = response.choices[0].message.content || "{}";
    try {
        let clean = raw.trim();
        if (clean.startsWith("```")) clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        return JSON.parse(clean);
    } catch {
        return {
            concepts: [], subtopics: [], formulas: [], definitions: [],
            diagramsNeeded: [], tablesNeeded: [], memoryTricks: [], examFocusAreas: []
        };
    }
}

// ====================================================================
// STEP 2: NOTES ARCHITECTURE
// ====================================================================

async function createOutline(
    blueprint: NotesBlueprint,
    subjectName: string,
    unitTitle: string
): Promise<NotesOutline> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `You are a curriculum architect. Design the perfect notes structure. Output ONLY valid JSON.`
            },
            {
                role: "user",
                content: `Design a premium notes outline for "${subjectName}" — "${unitTitle}".

Available content:
- Concepts: ${blueprint.concepts.join(", ")}
- Subtopics: ${blueprint.subtopics.join(", ")}
- Formulas: ${blueprint.formulas.length} formulas
- Definitions: ${blueprint.definitions.length} definitions
- Diagrams needed: ${blueprint.diagramsNeeded.length}
- Tables needed: ${blueprint.tablesNeeded.length}

Create a JSON outline:
{
  "title": "Chapter title for the notes",
  "sections": [
    {"id": "overview", "heading": "Chapter Overview", "type": "overview", "description": "Brief chapter snapshot + learning objectives"},
    {"id": "...", "heading": "...", "type": "concept|theory|application|comparison|formula|practice", "description": "what this section covers"},
    ...
    {"id": "definitions", "heading": "Key Definitions", "type": "definitions", "description": "All important definitions in styled boxes"},
    {"id": "formulas", "heading": "Formula Sheet", "type": "formulas", "description": "All formulas consolidated"},
    {"id": "memory", "heading": "Memory Tricks & Mnemonics", "type": "memory", "description": "Creative recall aids"},
    {"id": "exam", "heading": "Exam-Oriented Questions", "type": "exam", "description": "Practice questions teachers would ask"},
    {"id": "revision", "heading": "Revision Summary", "type": "revision", "description": "Quick one-page recap"}
  ]
}

Rules:
- 8-14 sections total
- Start with overview, end with revision
- Group related concepts logically
- Place definitions, formulas, memory tricks, and exam sections at the end`
            }
        ],
        temperature: 0.3,
        max_tokens: 2000,
    });

    const raw = response.choices[0].message.content || "{}";
    try {
        let clean = raw.trim();
        if (clean.startsWith("```")) clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        return JSON.parse(clean);
    } catch {
        return {
            title: unitTitle,
            sections: [
                { id: "overview", heading: "Overview", type: "overview", description: "Chapter overview" },
                { id: "main", heading: "Core Concepts", type: "concept", description: "Main content" },
                { id: "revision", heading: "Revision", type: "revision", description: "Quick recap" }
            ]
        };
    }
}

// ====================================================================
// STEP 3: SECTION-WISE GENERATION (parallel calls)
// ====================================================================

async function generateSection(
    sectionHeading: string,
    sectionType: string,
    sectionDescription: string,
    knowledgeText: string,
    blueprint: NotesBlueprint,
    subjectName: string,
    unitTitle: string,
    difficulty: string
): Promise<string> {
    // Build context based on section type
    let typeSpecificInstructions = "";

    switch (sectionType) {
        case "overview":
            typeSpecificInstructions = `Write a compelling 4-6 line chapter snapshot using a blockquote, followed by 5-7 clear learning objectives as a numbered list. Hook the reader intellectually — make them curious about what follows. Do NOT use "In this chapter, we will learn...". Instead, paint a picture of WHY this matters.`;
            break;
        case "concept":
        case "theory":
            typeSpecificInstructions = `Write deep, conceptual explanations. Use bold for every key term on first use. Include at least one comparison table if concepts can be contrasted. Add a "Key Insight" blockquote for the most important takeaway. Use real-world analogies to ground abstract ideas.`;
            break;
        case "application":
            typeSpecificInstructions = `Focus on practical applications and worked examples. Show step-by-step problem solving. Use the format: Problem Statement → Approach → Solution → Key Learning. Include at least 2-3 solved examples.`;
            break;
        case "comparison":
            typeSpecificInstructions = `Create detailed comparison tables with 4+ rows. Follow each table with a brief paragraph explaining the significance of the differences. Use bold in table cells for emphasis.`;
            break;
        case "definitions":
            typeSpecificInstructions = `List every important definition using this format for EACH one:

> **Term**: Definition text here. Include etymology or origin if interesting.

Group related definitions together. Add a one-line context note after each group explaining why these terms matter together.`;
            break;
        case "formulas":
            typeSpecificInstructions = `Create a comprehensive formula sheet. For each formula:
- Formula name as ### heading
- The formula in a code block
- Variable meanings listed clearly
- When to use it (one line)
- Common mistakes (one line)

Group related formulas together.`;
            break;
        case "memory":
            typeSpecificInstructions = `Create genuinely clever memory tricks. For each:
- The mnemonic or trick in bold
- What it helps remember
- A brief explanation of how it works

Make them creative, memorable, and actually useful — not forced or childish. Think of how toppers create personal shortcuts.`;
            break;
        case "exam":
            typeSpecificInstructions = `Create 8-10 exam-oriented questions covering the most important topics. Mix:
- 3 short answer questions (2-3 marks type)
- 3 descriptive questions (5 marks type)
- 2 application/numerical questions
- 2 "explain with diagram/example" questions

For each question, write a model answer that would score full marks.`;
            break;
        case "revision":
            typeSpecificInstructions = `Create a tight one-page revision summary with:
- **Key Terms**: 8-10 essential vocabulary with one-line meanings
- **Core Concepts**: 5-7 bullet points capturing the essence of the chapter
- **Must-Remember**: 3-4 points that ALWAYS appear in exams
- **Common Mistakes**: 3 errors students typically make
- **Quick Self-Test**: 5 rapid-fire questions (with answers in parentheses)`;
            break;
        default:
            typeSpecificInstructions = `Write thorough, well-structured content with proper headings, bold key terms, tables where useful, and blockquotes for important definitions.`;
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: ELITE_WRITER_SYSTEM },
            {
                role: "user",
                content: `Generate premium academic notes for this SPECIFIC SECTION ONLY.

Subject: ${subjectName}
Chapter: ${unitTitle}
Section: ${sectionHeading}
Difficulty: ${difficulty}

SECTION INSTRUCTIONS:
${typeSpecificInstructions}

SOURCE CONTENT (generate ONLY from this, do NOT add outside knowledge):
${knowledgeText.substring(0, 12000)}

RELEVANT CONCEPTS: ${blueprint.concepts.slice(0, 15).join(", ")}

FORMAT RULES:
- Start with ## ${sectionHeading}
- Use ### for subsections
- Bold all key terms: **term**
- Use > blockquotes for definitions and key insights
- Use markdown tables for comparisons
- Use \`code blocks\` for formulas/equations
- Use --- horizontal rules to separate major ideas
- Use numbered lists for steps/processes
- Use bullet lists for properties/characteristics
- Keep paragraphs to 3-4 lines maximum
- DO NOT use emojis
- DO NOT write conclusions or transition paragraphs
- DO NOT reference other sections`
            }
        ],
        temperature: 0.65,
        max_tokens: 4000,
    });

    return response.choices[0].message.content || "";
}

// ====================================================================
// STEP 4: HUMANIZATION PASS
// ====================================================================

async function humanizeContent(content: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are an expert editor specializing in making academic content feel naturally human-written.

YOUR TASK: Polish the given notes to remove ANY trace of AI-generated writing.

REMOVE:
- "In conclusion", "To summarize", "It is important to note", "Let us explore"
- "Furthermore", "Moreover" at the start of paragraphs (vary transitions)
- Repetitive sentence structures (Subject-Verb-Object repeated)
- Overly formal phrasing that no real teacher would use
- Any emojis or unicode symbols used as decoration
- "As we have seen", "As mentioned earlier"
- Passive voice where active is more natural

ADD:
- Natural variation in sentence length
- Occasional rhetorical questions
- Direct address ("Notice how...", "Think of it this way...")
- Concrete language over abstract
- Personality — a slight edge of enthusiasm without being cheesy

PRESERVE:
- All markdown formatting (headings, bold, tables, blockquotes, code blocks)
- All factual content — change ZERO facts
- All structure and section organization
- All technical terms and definitions

Output the improved version. ONLY output the content, nothing else.`
            },
            { role: "user", content: content }
        ],
        temperature: 0.4,
        max_tokens: 16000,
    });

    return response.choices[0].message.content || content;
}

// ====================================================================
// STEP 5: DESIGN ENHANCEMENT PASS
// ====================================================================

async function enhanceDesign(content: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a premium educational content formatter. Your job is to enhance the VISUAL STRUCTURE of academic notes for beautiful PDF rendering.

ADD these markdown patterns where appropriate:

1. DEFINITION BOXES — wrap important definitions:
> **Definition** — *Term*: Clear definition text here.

2. KEY INSIGHT BOXES — wrap breakthrough understanding moments:
> **Key Insight**: The critical understanding that ties everything together.

3. FORMULA HIGHLIGHTING — ensure formulas are in code blocks with labels

4. COMPARISON TABLES — if any list compares 2+ things, convert to a markdown table

5. SECTION DIVIDERS — add --- between major topic changes

6. BOLD STRATEGY — ensure every key term is bold on first appearance

7. VISUAL HIERARCHY — ensure h2 > h3 > h4 nesting is consistent

RULES:
- Do NOT add emojis
- Do NOT change any content or facts
- Do NOT add new text content
- ONLY enhance formatting and visual structure
- Preserve all existing markdown
- Output the enhanced content only, nothing else`
            },
            { role: "user", content: content }
        ],
        temperature: 0.2,
        max_tokens: 16000,
    });

    return response.choices[0].message.content || content;
}

// ====================================================================
// STEP 6: DIAGRAM GENERATION
// ====================================================================

async function generateDiagrams(
    blueprint: NotesBlueprint,
    subjectName: string,
    unitTitle: string
): Promise<string> {
    if (blueprint.diagramsNeeded.length === 0) return "";

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You create text-based academic diagrams using ASCII art and structured markdown. These will be rendered in styled markdown, so use code blocks for diagrams.`
            },
            {
                role: "user",
                content: `Create visual diagrams for "${subjectName}" — "${unitTitle}".

Diagrams needed:
${blueprint.diagramsNeeded.map((d, i) => `${i + 1}. ${d}`).join("\n")}

For each diagram, create:
1. A clear ### heading
2. The diagram inside a code block using ASCII art (boxes, arrows, lines)
3. A brief 1-2 line description below

Use these ASCII patterns:
- Boxes: ┌──────┐ │ Text │ └──────┘
- Arrows: ──▶, ──▷, ↓, ↑
- Lines: ───, │, ├──, └──
- Flow: ══▶

Make diagrams clean, readable, and informative. Do NOT use emojis.
Start with: ## Diagrams & Concept Maps`
            }
        ],
        temperature: 0.4,
        max_tokens: 4000,
    });

    return response.choices[0].message.content || "";
}

// ====================================================================
// STEP 7: FINAL ASSEMBLY
// ====================================================================

function assembleNotes(
    title: string,
    subjectName: string,
    unitTitle: string,
    sections: string[],
    diagrams: string
): string {
    // Title page
    let assembled = `# ${title}\n\n`;
    assembled += `**Subject**: ${subjectName} | **Unit**: ${unitTitle}\n\n`;
    assembled += `---\n\n`;

    // Add all sections
    for (const section of sections) {
        if (section.trim()) {
            assembled += section.trim() + "\n\n---\n\n";
        }
    }

    // Add diagrams section if exists
    if (diagrams.trim()) {
        assembled += diagrams.trim() + "\n\n---\n\n";
    }

    // Footer
    assembled += `\n\n---\n\n*Generated by ScorePrepPro — Premium AI Notes Engine*\n`;

    return assembled;
}

// ====================================================================
// MAIN PIPELINE — orchestrates all 7 steps
// ====================================================================

export async function generatePremiumNotes(
    knowledgeText: string,
    subjectName: string,
    unitTitle: string,
    difficulty: string = "medium",
    onProgress?: (progress: PipelineProgress) => void
): Promise<string> {
    const report = (step: PipelineStep, num: number, msg: string, sectionProgress?: string) => {
        onProgress?.({ step, stepNumber: num, totalSteps: 7, message: msg, sectionProgress });
    };

    // STEP 1: Content Analysis
    report("analyzing", 1, "Analyzing content structure...");
    const blueprint = await analyzeContent(knowledgeText, subjectName, unitTitle);

    // STEP 2: Notes Architecture
    report("outlining", 2, "Designing notes architecture...");
    const outline = await createOutline(blueprint, subjectName, unitTitle);

    // STEP 3: Section-wise Generation (parallel batches)
    report("generating", 3, "Generating sections...");
    const sectionContents: string[] = [];

    // Generate in batches of 3 to avoid rate limits
    const secs = outline.sections;
    for (let i = 0; i < secs.length; i += 3) {
        const batch = secs.slice(i, i + 3);
        report("generating", 3, `Generating sections...`, `${Math.min(i + 3, secs.length)}/${secs.length}`);

        const batchResults = await Promise.all(
            batch.map(sec =>
                generateSection(
                    sec.heading,
                    sec.type,
                    sec.description,
                    knowledgeText,
                    blueprint,
                    subjectName,
                    unitTitle,
                    difficulty
                )
            )
        );
        sectionContents.push(...batchResults);
    }

    // STEP 4: Humanization
    report("humanizing", 4, "Removing AI patterns, adding natural flow...");
    const rawCombined = sectionContents.join("\n\n---\n\n");

    // Split into chunks for humanization (max ~8000 chars per call)
    const halfPoint = Math.floor(rawCombined.length / 2);
    const splitIndex = rawCombined.indexOf("\n---\n", halfPoint);
    const firstHalf = rawCombined.substring(0, splitIndex > 0 ? splitIndex : halfPoint);
    const secondHalf = rawCombined.substring(splitIndex > 0 ? splitIndex : halfPoint);

    const [humanizedFirst, humanizedSecond] = await Promise.all([
        humanizeContent(firstHalf),
        humanizeContent(secondHalf)
    ]);
    const humanized = humanizedFirst + "\n\n" + humanizedSecond;

    // STEP 5: Design Enhancement
    report("enhancing", 5, "Adding visual structure and formatting...");
    const enhanced = await enhanceDesign(humanized);

    // STEP 6: Diagrams
    report("diagrams", 6, "Generating concept diagrams...");
    const diagrams = await generateDiagrams(blueprint, subjectName, unitTitle);

    // STEP 7: Assembly
    report("assembling", 7, "Composing final premium notes...");
    const finalNotes = assembleNotes(
        outline.title || unitTitle,
        subjectName,
        unitTitle,
        [enhanced],
        diagrams
    );

    report("done", 7, "Premium notes ready!");
    return finalNotes;
}
