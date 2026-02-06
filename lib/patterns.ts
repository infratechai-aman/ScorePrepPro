export const BOARD_PATTERNS = {
    cbse: {
        class10: {
            science: {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "Objective / MCQ", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 6 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 7 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 3 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            maths: {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs & Assertion-Reason", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Very Short Answer", marskPerQuestion: 2, count: 5 },
                    { section: "SECTION C", type: "Short Answer", marskPerQuestion: 3, count: 6 },
                    { section: "SECTION D", type: "Long Answer", marskPerQuestion: 5, count: 4 },
                    { section: "SECTION E", type: "Case Based", marskPerQuestion: 4, count: 3 }
                ]
            },
            // Added History/Geography for completeness if needed later
            history: {
                totalMarks: 80,
                structure: [
                    { section: "SECTION A", type: "MCQs", marskPerQuestion: 1, count: 20 },
                    { section: "SECTION B", type: "Short Answer", marskPerQuestion: 3, count: 8 },
                    { section: "SECTION C", type: "Long Answer", marskPerQuestion: 5, count: 6 },
                    { section: "SECTION D", type: "Map Based", marskPerQuestion: 4, count: 1 },
                    { section: "SECTION E", type: "Project/Case", marskPerQuestion: 2, count: 1 }
                ]
            }
        }
    },
    maharashtra: {
        class10: {
            science1: {
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
            science2: {
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
            maths1: {
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
            maths2: {
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
            }
        }
    }
};
