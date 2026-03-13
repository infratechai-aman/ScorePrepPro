export const BOARD_PATTERNS: any = {
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
                    { section: "SECTION F", type: "Source Based (Competency)", marskPerQuestion: 1, count: 5 }
                ]
            }
        },
        ...[5, 6, 7, 8, 9].reduce((acc: any, cls) => {
            acc[`class${cls}`] = {
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
                        { section: "SECTION F", type: "Source Based (Competency)", marskPerQuestion: 1, count: 5 }
                    ]
                }
            };
            return acc;
        }, {})
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
                    { section: "Q.4 (A)", type: "Source Based / Paragraph", marskPerQuestion: 4, count: 1, choice: "Any 4 from 6" },
                    { section: "Q.4 (B)", type: "Application Based", marskPerQuestion: 4, count: 1, choice: "Any 4 from 5" },
                    { section: "Q.5", type: "Geographical Reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6 (A)", type: "Detail Note", marskPerQuestion: 3, count: 1 },
                    { section: "Q.6 (B)", type: "Source Analysis", marskPerQuestion: 3, count: 1, choice: "Or Q.6(A)" },
                    { section: "Q.7", type: "Detailed Answer", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        },
        class9: {
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
                    { section: "Q.4 (A)", type: "Source Based / Paragraph", marskPerQuestion: 4, count: 1, choice: "Any 4 from 6" },
                    { section: "Q.4 (B)", type: "Application Based", marskPerQuestion: 4, count: 1, choice: "Any 4 from 5" },
                    { section: "Q.5", type: "Geographical Reasons", marskPerQuestion: 3, count: 2, choice: "Any 2 from 4" },
                    { section: "Q.6 (A)", type: "Detail Note", marskPerQuestion: 3, count: 1 },
                    { section: "Q.6 (B)", type: "Source Analysis", marskPerQuestion: 3, count: 1, choice: "Or Q.6(A)" },
                    { section: "Q.7", type: "Detailed Answer", marskPerQuestion: 4, count: 2, choice: "Any 2 from 3" }
                ]
            }
        },
        ...[5, 6, 7, 8].reduce((acc: any, cls) => {
            acc[`class${cls}`] = {
                "General Science": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "Fill in blanks", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Match the following", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2 (A)", type: "Give reasons", marskPerQuestion: 2, count: 2 },
                        { section: "Q.2 (B)", type: "Short answer", marskPerQuestion: 2, count: 5 },
                        { section: "Q.3", type: "Explain in detail", marskPerQuestion: 3, count: 4 },
                        { section: "Q.4", type: "Long answer / Detail", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "Mathematics": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "MCQ", marskPerQuestion: 1, count: 5 },
                        { section: "Q.1 (B)", type: "Solve", marskPerQuestion: 1, count: 5 },
                        { section: "Q.2 (A)", type: "Activity", marskPerQuestion: 2, count: 2 },
                        { section: "Q.2 (B)", type: "Solve", marskPerQuestion: 2, count: 3 },
                        { section: "Q.3", type: "Solve", marskPerQuestion: 3, count: 4 },
                        { section: "Q.4", type: "Challenging", marskPerQuestion: 4, count: 1 }
                    ]
                },
                "History and Civics": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1 (A)", type: "Choose Correct Option", marskPerQuestion: 1, count: 3 },
                        { section: "Q.1 (B)", type: "Identify Wrong Pair", marskPerQuestion: 1, count: 3 },
                        { section: "Q.2", type: "Short Notes", marskPerQuestion: 2, count: 2 },
                        { section: "Q.3", type: "Explain Statements with Reasons", marskPerQuestion: 2, count: 2 },
                        { section: "Q.4", type: "Answer in Brief", marskPerQuestion: 3, count: 2 },
                        { section: "Q.5", type: "Civics: Choose Correct Option", marskPerQuestion: 1, count: 2 },
                        { section: "Q.6", type: "Civics: True/False with Reasons", marskPerQuestion: 2, count: 2 },
                        { section: "Q.7", type: "Civics: Answer in Brief", marskPerQuestion: 2, count: 2 }
                    ]
                },
                "Geography": {
                    totalMarks: 40,
                    structure: [
                        { section: "Q.1", type: "Choose Correct Option", marskPerQuestion: 1, count: 4 },
                        { section: "Q.2", type: "Match the Following", marskPerQuestion: 1, count: 4 },
                        { section: "Q.3", type: "One Sentence Answer", marskPerQuestion: 1, count: 4 },
                        { section: "Q.4", type: "Geographical Reasons", marskPerQuestion: 3, count: 2 },
                        { section: "Q.5", type: "Detail Note", marskPerQuestion: 3, count: 2 },
                        { section: "Q.6", type: "Detailed Answer", marskPerQuestion: 4, count: 4 }
                    ]
                },
                "English": {
                    totalMarks: 40,
                    structure: [
                        { section: "Section I", type: "Language Study (Grammar)", marskPerQuestion: 1, count: 8 },
                        { section: "Section II", type: "Textual Passages", marskPerQuestion: 2, count: 6 },
                        { section: "Section III", type: "Poetry Comprehension", marskPerQuestion: 2, count: 5 },
                        { section: "Section IV", type: "Writing Skills", marskPerQuestion: 5, count: 2 }
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
                        { section: "SECTION II", type: "Long Answer", marskPerQuestion: 10, count: 4 }
                    ]
                },
                "Chemistry": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION I (Compulsory)", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION II", type: "Long Answer", marskPerQuestion: 10, count: 4 }
                    ]
                },
                "Biology": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION I (Compulsory)", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION II", type: "Long Answer", marskPerQuestion: 10, count: 4 }
                    ]
                },
                "Mathematics": {
                    totalMarks: 80,
                    structure: [
                        { section: "SECTION A", type: "Short Answer", marskPerQuestion: 2, count: 20 },
                        { section: "SECTION B", type: "Long Answer", marskPerQuestion: 10, count: 4 }
                    ]
                }
            };
            return acc;
        }, {})
    }
};
