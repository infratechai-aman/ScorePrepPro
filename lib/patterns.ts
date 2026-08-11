export const BOARD_PATTERNS: any = {
    cbse: {
        // ── CBSE Class 5 (Primary, 50 marks, no Case Based yet) ──────────────
        class5: {
            "Mathematics": {
                totalMarks: 50,
                structure: [
                    { section: "SECTION A", type: "MCQ / Objective", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION B", type: "Short Answer", marskPerQuestion: 2, count: 8 },
                    { section: "SECTION C", type: "Long Answer", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Environmental Studies Part 1": {
                totalMarks: 50,
                structure: [
                    { section: "SECTION A", type: "MCQ / Fill in the Blanks", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION B", type: "Short Answer", marskPerQuestion: 2, count: 8 },
                    { section: "SECTION C", type: "Long Answer", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Environmental Studies Part 2": {
                totalMarks: 50,
                structure: [
                    { section: "SECTION A", type: "MCQ / Fill in the Blanks", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION B", type: "Short Answer", marskPerQuestion: 2, count: 8 },
                    { section: "SECTION C", type: "Long Answer", marskPerQuestion: 4, count: 3 }
                ]
            },
            "English": {
                totalMarks: 50,
                structure: [
                    { section: "SECTION A", type: "Reading Comprehension", marskPerQuestion: 1, count: 8 },
                    { section: "SECTION B", type: "Grammar / Language Study", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION C", type: "Writing Skills", marskPerQuestion: 8, count: 2 },
                    { section: "SECTION D", type: "Literature (Short Answer)", marskPerQuestion: 2, count: 6 }
                ]
            }
        },

        // ── CBSE Classes 6, 7, 8 (Secondary prep — 80 marks annual) ─────────
        ...[6, 7, 8].reduce((acc: any, cls) => {
            acc[`class${cls}`] = {
                "Mathematics": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 6 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 2 }
                    ]
                },
                "Science": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 6 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 2 }
                    ]
                },
                "Social Science": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 5 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 3 }
                    ]
                },
                "Social Science History": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 5 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 3 }
                    ]
                },
                "Social Science Geography": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 5 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 3 }
                    ]
                },
                "Social Science Civics": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "MCQ / Objective (1 mark each)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Very Short Answer (VSA)", marskPerQuestion: 2, count: 5 },
                        { section: "SECTION C", type: "Short Answer (SA)", marskPerQuestion: 3, count: 8 },
                        { section: "SECTION D", type: "Long Answer (LA)", marskPerQuestion: 5, count: 3 }
                    ]
                },
                "English": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "Reading Comprehension (2 passages)", marskPerQuestion: 1, count: 20 },
                        { section: "SECTION B", type: "Grammar & Creative Writing", marskPerQuestion: 1, count: 15 },
                        { section: "SECTION C", type: "Literature (Short Answer)", marskPerQuestion: 2, count: 10 },
                        { section: "SECTION D", type: "Literature (Long Answer)", marskPerQuestion: 5, count: 3 }
                    ]
                },
                "Hindi": {
                    totalMarks: 80,
                    structure: [
                        { section: "खंड-क", type: "अपठित गद्यांश / पद्यांश", marskPerQuestion: 2, count: 10 },
                        { section: "खंड-ख", type: "व्याकरण", marskPerQuestion: 1, count: 15 },
                        { section: "खंड-ग", type: "पाठ्यपुस्तक (लघु उत्तर)", marskPerQuestion: 2, count: 8 },
                        { section: "खंड-घ", type: "लेखन (निबंध / पत्र)", marskPerQuestion: 5, count: 3 }
                    ]
                }
            };
            return acc;
        }, {}),

        // ── CBSE Class 9 (Official CBSE Blueprint — 80 marks) ─────────────────
        class9: {
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
                    { section: "SECTION F", type: "Source Based (Competency)", marskPerQuestion: 1, count: 5 }
                ]
            },
            "Social Science History": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based / Source Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science Geography": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Map-Based / Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science Civics": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science Economics": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based / Data Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "English": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "Reading Comprehension (2 passages)", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Grammar & Creative Writing", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION C", type: "Literature Short Answer", marskPerQuestion: 2, count: 10 },
                    { section: "SECTION D", type: "Literature Long Answer", marskPerQuestion: 5, count: 4 }
                ]
            }
        },

        // ── CBSE Class 10 (Official CBSE Board Blueprint — 80 marks) ──────────
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
                    { section: "SECTION A", type: "MCQs (History, Geography, PolSci, Economics)", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based (2 questions × 4 marks)", marskPerQuestion: 4, count: 2 },
                    { section: "SECTION F", type: "Source/Map Based", marskPerQuestion: 5, count: 2 }
                ]
            },
            "Social Science History": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Source Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science Geography": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Map-Based / Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "Social Science Civics": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 4 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 5 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            "English": {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "Reading Comprehension (2 passages)", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Grammar & Writing Skills", marskPerQuestion: 1, count: 10 },
                    { section: "SECTION C", type: "Literature Short Answer", marskPerQuestion: 2, count: 10 },
                    { section: "SECTION D", type: "Literature Long Answer", marskPerQuestion: 5, count: 4 }
                ]
            }
        }
    },

    maharashtra: {
        // ── Maharashtra Class 10 (Official SSC Blueprint — 40 marks each) ─────
        class10: {
            "Science and Technology Part-1": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective (Answer the following in one sentence)", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Give Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Distinguish Between / Conceptual Answer", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer / Detail", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Science and Technology Part-2": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective (Fill in the blanks / True-False)", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Give Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Distinguish Between / Conceptual Answer", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer / Detail", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-I (Algebra)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve the following (1-step)", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Solve", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Solve", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Application Problem (Solve)", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Word Problem (Solve)", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-II (Geometry)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve the following (1-step)", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Solve", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Solve", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Proof / Construction / Application Problem", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Proof / Word Problem", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "History and Political Science": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "Choose the Correct Option", marskPerQuestion: 1, count: 3 },
                    { section: "Q.1 (B)", type: "Identify the Wrong Pair", marskPerQuestion: 1, count: 3 },
                    { section: "Q.2 (A)", type: "Complete the Concept Map", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Write Short Notes", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.3", type: "Explain with Reasons (History)", marskPerQuestion: 2, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Read the Paragraph and Answer", marskPerQuestion: 4, count: 1 },
                    { section: "Q.5", type: "Give detailed answers (History)", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6", type: "Choose the Correct Option (Political Science)", marskPerQuestion: 1, count: 2 },
                    { section: "Q.7", type: "State Whether True or False with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.8 (A)", type: "Explain the concept (Political Science)", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.8 (B)", type: "Do as Directed", marskPerQuestion: 1, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.9", type: "Answer in Brief (Political Science)", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Geography": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2", type: "Match the Columns", marskPerQuestion: 1, count: 4 },
                    { section: "Q.3", type: "Give geographical reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4 (A)", type: "Write a detailed note", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.4 (B)", type: "Distinguish between", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.5 (A)", type: "Explain in detail", marskPerQuestion: 4, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.5 (B)", type: "Application-based Answer", marskPerQuestion: 4, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.6", type: "Source-based / Paragraph Answer", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        },

        // ── Maharashtra Class 9 (Official SSC Blueprint — 40 marks each) ──────
        class9: {
            "Science and Technology Part-1": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective (Answer in one sentence)", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Give Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Distinguish Between / Conceptual Answer", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Science and Technology Part-2": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQs", marskPerQuestion: 1, count: 5 },
                    { section: "Q.1 (B)", type: "Objective (Fill in the blanks / True-False)", marskPerQuestion: 1, count: 5 },
                    { section: "Q.2 (A)", type: "Give Scientific Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Short Answer", marskPerQuestion: 2, count: 3, choice: "Any 3 from 5" },
                    { section: "Q.3", type: "Distinguish Between / Conceptual Answer", marskPerQuestion: 3, count: 5, choice: "Any 5 from 8" },
                    { section: "Q.4", type: "Long Answer", marskPerQuestion: 5, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-I (Algebra)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve (1-step)", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Solve", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Solve", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Application Problem (Solve)", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Word Problem (Solve)", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Mathematics Part-II (Geometry)": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 4 },
                    { section: "Q.1 (B)", type: "Solve (1-step)", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2 (A)", type: "Solve", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 4, choice: "Any 4 from 5" },
                    { section: "Q.3 (A)", type: "Solve", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" },
                    { section: "Q.3 (B)", type: "Solve", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Proof / Construction", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.5", type: "Proof / Word Problem", marskPerQuestion: 3, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "History and Political Science": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1 (A)", type: "Choose the Correct Option", marskPerQuestion: 1, count: 3 },
                    { section: "Q.1 (B)", type: "Identify the Wrong Pair", marskPerQuestion: 1, count: 3 },
                    { section: "Q.2 (A)", type: "Complete the Concept Map", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.2 (B)", type: "Write Short Notes", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.3", type: "Explain with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Read the Paragraph and Answer", marskPerQuestion: 4, count: 1 },
                    { section: "Q.5", type: "Give detailed answers", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6", type: "Choose the Correct Option (Political Science)", marskPerQuestion: 1, count: 2 },
                    { section: "Q.7", type: "State Whether True or False with Reasons", marskPerQuestion: 2, count: 2, choice: "Any 2 from 3" },
                    { section: "Q.8", type: "Answer in Brief", marskPerQuestion: 2, count: 1, choice: "Any 1 from 2" }
                ]
            },
            "Geography": {
                totalMarks: 40,
                structure: [
                    { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                    { section: "Q.2", type: "Match the Columns", marskPerQuestion: 1, count: 4 },
                    { section: "Q.3", type: "Give geographical reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.4", type: "Write a detailed note / Distinguish between", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.5", type: "Explain in detail / Application-based", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        },

        // ── Maharashtra Classes 5-8 (Official Balbharati Internal/Annual — 40 marks) ──
        ...[5, 6, 7, 8].reduce((acc: any, cls) => {
            acc[`class${cls}`] = {
                "General Science": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "MCQ (Choose the correct option)", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Fill in the blanks / Match the columns", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2 (A)", type: "Give scientific reasons", marskPerQuestion: 2, count: 2 },
                        { section: "Q.2 (B)", type: "Short answer (2-3 sentences)", marskPerQuestion: 2, count: 3 },
                        { section: "Q.3", type: "Answer in detail (5-6 sentences)", marskPerQuestion: 3, count: 3 },
                        { section: "Q.4", type: "Activity / Observation / Long answer", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "Mathematics": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "MCQ / Choose the correct alternative", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Solve (1-step basic problems)", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2 (A)", type: "Solve (2-step problems)", marskPerQuestion: 2, count: 2 },
                        { section: "Q.2 (B)", type: "Solve (problems)", marskPerQuestion: 2, count: 3 },
                        { section: "Q.3", type: "Solve (multi-step problems)", marskPerQuestion: 3, count: 3 },
                        { section: "Q.4", type: "Word Problem / Challenging Problem", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "History and Civics": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "Choose Correct Option / True or False", marskPerQuestion: 1, count: 4 },
                        { section: "Q.1 (B)", type: "Match the Columns", marskPerQuestion: 1, count: 4 },
                        { section: "Q.2", type: "Write Short Notes (2-3 sentences)", marskPerQuestion: 2, count: 4 },
                        { section: "Q.3", type: "Explain with Reasons", marskPerQuestion: 2, count: 2 },
                        { section: "Q.4", type: "Answer in Brief / Detail", marskPerQuestion: 3, count: 2 },
                        { section: "Q.5", type: "Civics: Answer the following", marskPerQuestion: 2, count: 3 }
                    ]
                },
                "Geography": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                        { section: "Q.2", type: "Match the Columns", marskPerQuestion: 1, count: 4 },
                        { section: "Q.3", type: "One sentence answer", marskPerQuestion: 1, count: 4 },
                        { section: "Q.4", type: "Give geographical reasons", marskPerQuestion: 3, count: 2 },
                        { section: "Q.5", type: "Write a detail note / Distinguish between", marskPerQuestion: 3, count: 2 },
                        { section: "Q.6", type: "Detailed answer", marskPerQuestion: 4, count: 2 }
                    ]
                },
                "Environmental Studies Part 1": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "MCQ / Tick the correct answer", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Fill in the blanks / Match the following", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2", type: "Short Answer (2-3 sentences)", marskPerQuestion: 2, count: 5 },
                        { section: "Q.3", type: "Answer in detail", marskPerQuestion: 3, count: 3 },
                        { section: "Q.4", type: "Activity / Project / Long answer", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "Environmental Studies Part 2": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "MCQ / Choose the correct option", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Fill in the blanks / True or False", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2", type: "Short Answer (2-3 sentences)", marskPerQuestion: 2, count: 5 },
                        { section: "Q.3", type: "Answer in detail (about historical facts)", marskPerQuestion: 3, count: 3 },
                        { section: "Q.4", type: "Timeline / Map / Long Answer", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "English": {
                    totalMarks: 40,
                    structure: [
                        { section: "Section I", type: "Language Study (Grammar)", marskPerQuestion: 1, count: 8 },
                        { section: "Section II", type: "Textual Passages (Comprehension)", marskPerQuestion: 2, count: 6 },
                        { section: "Section III", type: "Poetry / Literature Short Answer", marskPerQuestion: 2, count: 5 },
                        { section: "Section IV", type: "Writing Skills (Essay / Letter)", marskPerQuestion: 5, count: 2 }
                    ]
                }
            };
            return acc;
        }, {})
    },

    icse: {
        ...[5, 6, 7, 8, 9, 10].reduce((acc: any, cls) => {
            acc[`class${cls}`] = {
                "Physics": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION I (Compulsory)", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION II", type: "Long Answer (any 4 of 6)", marskPerQuestion: 10, count: 4, choice: "Any 4 from 6" }
                    ]
                },
                "Chemistry": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION I (Compulsory)", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION II", type: "Long Answer (any 4 of 6)", marskPerQuestion: 10, count: 4, choice: "Any 4 from 6" }
                    ]
                },
                "Biology": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION I (Compulsory)", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION II", type: "Long Answer (any 4 of 6)", marskPerQuestion: 10, count: 4, choice: "Any 4 from 6" }
                    ]
                },
                "Mathematics": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "Short Answer (Compulsory)", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION B", type: "Long Answer (any 4 of 6)", marskPerQuestion: 10, count: 4, choice: "Any 4 from 6" }
                    ]
                }
            };
            return acc;
        }, {})
    }
};
