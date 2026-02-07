// --- COPY OF PATTERNS ---
const BOARD_PATTERNS: any = {
    cbse: {
        class10: {
            "Science": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "Objective / MCQ / Assertion-Reason", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 6 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 7 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 3 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Mathematics": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs & Assertion-Reason", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 5 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 6 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 },
                    { section: "SECTION F", type: "Map Based", marskPerQuestion: 1, count: 5 }
                ]
            }
        },
        class9: {
            "Science": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "Objective / MCQ", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 6 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 7 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 3 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Mathematics": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 5 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 6 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 },
                    { section: "SECTION F", type: "Map Based", marskPerQuestion: 1, count: 5 }
                ]
            }
        }
    },
    maharashtra: {
        class10: {
            "Science and Technology Part-1": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective (Answer the following)", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Conceptual/Application", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Science and Technology Part-2": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Conceptual", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-I (Algebra)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Activity Based", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Activity Based", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "HOTS (Out of text)", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Creative/Open Ended", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-II (Geometry)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Activity Based", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Activity Based", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "HOTS", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Creative", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "History and Political Science": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "Choose Correct Option", marskPerQuestion: 1, count: 3 },
                    { section: "Q.1 (B)", type: "Identify Wrong Pair", marskPerQuestion: 1, count: 3 },
                    { section: "Q.2 (A)", type: "Complete Concept Map", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Notes", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.3", type: "Explain Statements with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Read Paragraph and Answer", marskPerQuestion: 4, count: 1 },
                    { section: "Q.5", type: "Detailed Answer", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6", type: "Choose Correct Option (Pol Sci)", marskPerQuestion: 1, count: 2 },
                    { section: "Q.7", type: "True/False with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.8 (A)", type: "Explain Concept", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.8 (B)", type: "Do as Directed", marskPerQuestion: 1, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.9", type: "Answer in Brief", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Geography": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2", type: "Match the Following", marskPerQuestion: 1, count: 4 },
                    { section: "Q.3", type: "One Sentence Answer", marskPerQuestion: 1, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.4 (A)", type: "Fill Map", marskPerQuestion: 4, count: 1, choice: "Any 4 from 6" },
                    { section: "Q.4 (B)", type: "Read Map & Answer", marskPerQuestion: 4, count: 1, choice: "Any 4 from 5" },
                    { section: "Q.5", type: "Geographical Reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6 (A)", type: "Draw Graph", marskPerQuestion: 3, count: 1 },
                    { section: "Q.6 (B)", type: "Read Graph", marskPerQuestion: 3, count: 1, choice: "Or Q.6(A)" },
                    { section: "Q.7", type: "Detailed Answer", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        },
        class9: {
            "Science and Technology Part-1": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Conceptual", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Science and Technology Part-2": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Conceptual", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-I (Algebra)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Activity", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Activity", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "HOTS", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Creative", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-II (Geometry)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Activity", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Activity", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "HOTS", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Creative", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "History and Political Science": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "Choose Correct Option", marskPerQuestion: 1, count: 3 },
                    { section: "Q.1 (B)", type: "Identify Wrong Pair", marskPerQuestion: 1, count: 3 },
                    { section: "Q.2 (A)", type: "Complete Concept Map", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Notes", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.3", type: "Explain Statements with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Read Paragraph and Answer", marskPerQuestion: 4, count: 1 },
                    { section: "Q.5", type: "Detailed Answer", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6", type: "Choose Correct Option (Pol Sci)", marskPerQuestion: 1, count: 2 },
                    { section: "Q.7", type: "True/False with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.8 (A)", type: "Explain Concept", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.8 (B)", type: "Do as Directed", marskPerQuestion: 1, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.9", type: "Answer in Brief", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Geography": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2", type: "Match the Following", marskPerQuestion: 1, count: 4 },
                    { section: "Q.3", type: "One Sentence Answer", marskPerQuestion: 1, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.4 (A)", type: "Fill Map", marskPerQuestion: 4, count: 1, choice: "Any 4 from 6" },
                    { section: "Q.4 (B)", type: "Read Map & Answer", marskPerQuestion: 4, count: 1, choice: "Any 4 from 5" },
                    { section: "Q.5", type: "Geographical Reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6 (A)", type: "Draw Graph", marskPerQuestion: 3, count: 1 },
                    { section: "Q.6 (B)", type: "Read Graph", marskPerQuestion: 3, count: 1, choice: "Or Q.6(A)" },
                    { section: "Q.7", type: "Detailed Answer", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        }
    }
};

// --- LOGIC FROM prompts.ts ---

function calculateStructure(board: any, grade: any, subject: any, targetMarks: any) {
    const pattern = BOARD_PATTERNS[board]?.[`class${grade}`]?.[subject];
    if (!pattern) return { structureText: "Pattern not found", total: 0, originalTotal: 0 };

    const originalMarks = pattern.totalMarks;
    const scalingFactor = targetMarks / originalMarks;

    // 1. Initial Scale
    let newStructure = pattern.structure.map((s: any) => {
        let newCount = Math.floor(s.count * scalingFactor);
        if (s.count > 0 && newCount === 0 && scalingFactor > 0.1) newCount = 1;
        return { ...s, count: newCount };
    });

    // Calculate sum
    let currentTotal = newStructure.reduce((sum: any, s: any) => sum + (s.count * s.marskPerQuestion), 0);

    // 2. Correction Loop
    let attempts = 0;
    while (currentTotal !== targetMarks && attempts < 50) {
        const diff = targetMarks - currentTotal;

        if (diff > 0) {
            let candidate = newStructure.find((s: any) => s.marskPerQuestion <= diff && s.marskPerQuestion > 0);
            if (!candidate) candidate = newStructure.reduce((prev: any, curr: any) => (prev.marskPerQuestion < curr.marskPerQuestion && prev.marskPerQuestion > 0) ? prev : curr);
            if (candidate) {
                candidate.count++;
                currentTotal += candidate.marskPerQuestion;
            }
        } else {
            const diffAbs = Math.abs(diff);
            let candidate = newStructure.find((s: any) => s.count > 1 && s.marskPerQuestion <= diffAbs);
            if (!candidate) candidate = newStructure.find((s: any) => s.count > 0 && s.marskPerQuestion <= diffAbs);
            if (!candidate) candidate = newStructure.find((s: any) => s.count > 0);
            if (candidate) {
                candidate.count--;
                currentTotal -= candidate.marskPerQuestion;
            }
        }
        attempts++;
    }

    // Generate String with Choice Logic
    const structureText = newStructure.map((s: any) => {
        const showChoice = scalingFactor === 1 ? (s.choice ? `(${s.choice})` : "") : "";
        return `- **${s.section}**: ${s.type} | ${s.count} Questions | ${s.marskPerQuestion} Marks each. ${showChoice}`;
    }).join("\n");

    return { structureText, total: currentTotal, originalTotal: originalMarks };
}

// --- VERIFICATION RUNNER ---
console.log("=== STARTING COMPREHENSIVE VERIFICATION ===");
const targets = [10, 20, 40];

Object.keys(BOARD_PATTERNS).forEach(boardName => {
    Object.keys(BOARD_PATTERNS[boardName]).forEach(className => {
        Object.keys(BOARD_PATTERNS[boardName][className]).forEach(subjectName => {
            // Verify Base Pattern Total
            const pattern = BOARD_PATTERNS[boardName][className][subjectName];
            const baseTotal = pattern.structure.reduce((sum: any, s: any) => sum + (s.count * s.marskPerQuestion), 0);

            if (baseTotal !== pattern.totalMarks) {
                console.error(`❌ [${boardName}:${className}:${subjectName}] BASE TOTAL MISMATCH! Config says ${pattern.totalMarks}, Calculated ${baseTotal}`);
                // Debug details
                pattern.structure.forEach((s: any) => console.log(`   ${s.section}: ${s.count} * ${s.marskPerQuestion} = ${s.count * s.marskPerQuestion}`));
            } else {
                // console.log(`✅ [${boardName}:${className}:${subjectName}] Base Total OK (${baseTotal})`);
            }

            // Verify Scaling
            targets.forEach(target => {
                if (target > pattern.totalMarks) return; // Skip 40 for 80 marks

                const result = calculateStructure(boardName, className.replace('class', ''), subjectName, target);
                if (result.total !== target) {
                    console.error(`❌ [${boardName}:${className}:${subjectName}] SCALING FAILED for ${target} marks. Got ${result.total}`);
                } else {
                    // Check for choice text leak
                    if (target < pattern.totalMarks && result.structureText.includes("Any ")) {
                        console.error(`❌ [${boardName}:${className}:${subjectName}] CHOICE TEXT LEAKED for ${target} marks.`);
                    } else {
                        // console.log(`✅ [${boardName}:${className}:${subjectName}] ${target} Marks OK`);
                    }
                }
            });
        });
    });
});
console.log("=== VERIFICATION COMPLETE ===");
