import { generateFromKnowledge } from "./lib/knowledgeEngine.js";

async function run() {
    const res = await generateFromKnowledge(
        "The quick brown fox jumps over the lazy dog.",
        "English",
        "Unit 1",
        "paper",
        {
            difficulty: "easy",
            marks: 10,
            duration: 10,
            questionType: "Mixed"
        }
    );
    console.log("Response:", res);
}

run().catch(console.error);
