"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Bot, Send, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const DAILY_LIMIT = 100000;

// Markdown components for AI Tutor messages
const markdownComponents: any = {
    p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
    h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold mb-2 mt-3 text-slate-900" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-base font-bold mb-2 mt-3 text-slate-800" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-sm font-bold mb-1.5 mt-2 text-slate-800" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-slate-900" {...props} />,
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
    li: ({ node, ...props }: any) => <li className="leading-relaxed" {...props} />,
    code: ({ node, inline, className, children, ...props }: any) => {
        if (inline) {
            return <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>;
        }
        return (
            <pre className="bg-slate-900 text-green-300 p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono">
                <code {...props}>{children}</code>
            </pre>
        );
    },
    table: ({ node, ...props }: any) => (
        <div className="overflow-x-auto my-2">
            <table className="w-full text-sm border-collapse border border-slate-200 rounded" {...props} />
        </div>
    ),
    th: ({ node, ...props }: any) => <th className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-bold text-xs" {...props} />,
    td: ({ node, ...props }: any) => <td className="border border-slate-200 px-3 py-1.5 text-xs" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-indigo-300 bg-indigo-50/50 pl-3 py-1 my-2 italic text-slate-600" {...props} />,
    hr: ({ node, ...props }: any) => <hr className="my-3 border-slate-200" {...props} />,
};

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
                    messages: [...messages, userMsg],
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
                        <p className="text-xs text-slate-500">Ask doubts, explain topics, solve equations.</p>
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
                        <p className="text-slate-500 max-w-sm mx-auto">I can explain concepts, solve math problems, help with science topics, and answer your academic doubts.</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <div className="prose prose-sm prose-slate max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex]}
                                        components={markdownComponents}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
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
                        placeholder="Ask a question about any subject..."
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
                    Education-focused AI. Only answers academic questions.
                </div>
            </div>
        </div>
    );
}
