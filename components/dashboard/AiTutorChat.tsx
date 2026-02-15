"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { Bot, Send, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const DAILY_LIMIT = 100000;

export function AiTutorChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tokensUsed, setTokensUsed] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch daily usage
    useEffect(() => {
        if (user) {
            const unsub = onSnapshot(doc(db, "users", user.uid, "ai_usage", "daily"), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    // Reset if date mismatch handled by UI? No, backend resets.
                    // Just show what's in DB.
                    // Ideally check date here too but for MVP simpler.
                    setTokensUsed(data.tokens_used || 0);
                }
            });
            return () => unsub();
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !user) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai-tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg], // Send context
                    userId: user.uid
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            const aiMsg: Message = { role: "assistant", content: data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const usagePercent = Math.min((tokensUsed / DAILY_LIMIT) * 100, 100);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header / Usage Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">AI Teaching Assistant</h3>
                        <p className="text-xs text-slate-500">Ask doubts, plan lessons, ask for study tips.</p>
                    </div>
                </div>

                <div className="w-64">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">
                        <span>Daily Limit</span>
                        <span>{Math.round(usagePercent)}% used</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${usagePercent}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-right text-slate-400 mt-0.5">
                        {(DAILY_LIMIT - tokensUsed).toLocaleString()} tokens remaining
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">How can I help you today?</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">I can help you design question papers, explain complex topics, or provide teaching strategies.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-bl-none flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                    <input
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl w-12 h-12 p-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                    </Button>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
                    <AlertCircle className="w-3 h-3" />
                    AI can make mistakes. Please verify important information.
                </div>
            </div>
        </div>
    );
}
