import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { db } from "@/lib/firebase"; // Ensure this exports your firebase admin or client instance appropriately for server context. 
// Note: If db is client SDK, we might need admin SDK for server routes to bypass rules if needed, 
// but consistent with existing code (api/generate uses openai directly but doesn't seem to use db? wait, api/generate didn't use db).
// Let's assume we can use the same firebase setup. 
// Actually, standard Next.js API routes run on server. Client SDK might work if auth is passed or if rules allow publicly (bad).
// For this MVP, I'll use the client SDK with the understanding that in a real app Admin SDK is better.
// However, to track usage securely, we really need the user's UID.
// I'll parse the 'Authorization' header or a custom header since I don't have a session cookie utility ready here.
// For now, I will pass the userId in the body for MVP (NOT SECURE for production but works for this demo context).
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

const DAILY_LIMIT = 100000;

export async function POST(req: Request) {
    try {
        const { messages, userId } = await req.json();

        if (!messages || !userId) {
            return NextResponse.json({ error: "Missing messages or userId" }, { status: 400 });
        }

        // 1. Check Rate Limit
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const usageRef = doc(db, "users", userId, "ai_usage", "daily");
        const usageSnap = await getDoc(usageRef);

        let currentUsage = 0;

        if (usageSnap.exists()) {
            const data = usageSnap.data();
            if (data.date === today) {
                currentUsage = data.tokens_used || 0;
                if (currentUsage >= DAILY_LIMIT) {
                    return NextResponse.json({ error: "Daily token limit reached (100k tokens)." }, { status: 429 });
                }
            } else {
                // Reset for new day
                await setDoc(usageRef, { date: today, tokens_used: 0 });
            }
        } else {
            // Create initial record
            await setDoc(usageRef, { date: today, tokens_used: 0 });
        }

        // 2. Call OpenAI
        const systemPrompt = `You are an expert AI Teaching Assistant for students and teachers. You ONLY answer questions related to education, academics, and learning.

STRICT SCOPE RULES:
- You MUST ONLY answer questions about academic subjects: Mathematics, Science, Social Science, English, Hindi, History, Geography, Civics, Economics, Physics, Chemistry, Biology, Computer Science, etc.
- You can help with: explaining concepts, solving problems step-by-step, exam preparation tips, chapter summaries, formula sheets, question paper strategies, lesson planning, and study techniques.
- You MUST REFUSE to answer any question that is NOT related to education. If someone asks about entertainment, personal advice, politics, or anything non-academic, politely decline and redirect them to ask an academic question.
- Example refusal: "I'm designed to help with academics only! Ask me about any subject — Math, Science, History, etc. — and I'll be happy to help. 📚"

FORMATTING RULES (CRITICAL):
- Use **bold** for key terms and important concepts.
- Use numbered lists (1. 2. 3.) for step-by-step solutions.
- Use bullet points (- ) for listing features, properties, or key facts.
- Use headings (## or ###) to organize longer responses.
- For math equations, use LaTeX notation: inline math with $...$ and display math with $$...$$
  - Example inline: The formula is $E = mc^2$
  - Example display: $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
- Use tables when comparing things (e.g., differences between concepts).
- Use code blocks for programming questions.
- Keep responses well-structured, clear, and concise.
- Use emojis sparingly for a friendly tone (📚, ✅, 💡, ⚡).`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const reply = completion.choices[0].message.content;
        const totalTokens = completion.usage?.total_tokens || (reply?.length || 0) / 4; // Fallback estimation

        // 3. Update Usage
        await updateDoc(usageRef, {
            tokens_used: increment(totalTokens)
        });

        return NextResponse.json({
            reply,
            tokensUsed: totalTokens,
            remaining: DAILY_LIMIT - (currentUsage + totalTokens)
        });

    } catch (error: any) {
        console.error("AI Tutor Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
