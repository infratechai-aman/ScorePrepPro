"use client";

import { Bot } from "lucide-react";

export default function AiTutorPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-8">
            <div className="bg-purple-50 p-6 rounded-full mb-6">
                <Bot className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">AI Tutor</h1>
            <p className="text-slate-500 max-w-md">
                An intelligent assistant to help you create custom questions,
                analyze student performance, and providing teaching tips.
            </p>
            <span className="mt-8 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Coming Soon
            </span>
        </div>
    );
}
