import { openai } from "./openai";

export interface SubjectiveEvaluation {
    awardedMarks: number;
    feedback: string;
}

export async function evaluateSubjectiveAnswer(
    question: string,
    idealAnswer: string,
    studentAnswer: string,
    maxMarks: number
): Promise<SubjectiveEvaluation> {
    if (!studentAnswer || !studentAnswer.trim()) {
        return {
            awardedMarks: 0,
            feedback: "No answer provided."
        };
    }

    const systemPrompt = `You are a fair, expert teacher grading an exam. 
Your task is to grade a student's answer against the ideal answer.
You must award marks out of a maximum of ${maxMarks}.

CRITICAL GRADING RULES:
1. Focus on the core concepts. If the student demonstrates an understanding of the key ideas, award full or partial marks.
2. Do not deduct marks for grammar or spelling unless it completely changes the meaning.
3. Be fair. If the answer is partially correct, award partial marks (e.g., 2 or 3 out of 5).
4. If the student's answer is completely irrelevant or wrong, award 0.

You must return a JSON object exactly like this:
{
  "awardedMarks": <number between 0 and ${maxMarks}>,
  "feedback": "A short, 1-2 sentence constructive feedback explaining why marks were awarded or deducted."
}`;

    const userPrompt = `
Question: ${question}
Maximum Marks: ${maxMarks}

Ideal Answer / Explanation:
${idealAnswer || "Grade based on general academic knowledge of the question."}

Student Answer:
${studentAnswer}
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.2, // Low temperature for consistent grading
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || "{}";
        const parsed = JSON.parse(content);
        
        return {
            awardedMarks: typeof parsed.awardedMarks === 'number' ? parsed.awardedMarks : 0,
            feedback: parsed.feedback || "Graded by AI."
        };
    } catch (e) {
        console.error("AI Grading failed:", e);
        // Fallback in case of failure
        return {
            awardedMarks: 0,
            feedback: "AI Evaluation Failed. Requires manual teacher review."
        };
    }
}
