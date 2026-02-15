"use client";

import { AiTutorChat } from "@/components/dashboard/AiTutorChat";

export default function AiTutorPage() {
    return (
        <div className="p-8 h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">AI Tutor</h1>
                <p className="text-slate-500">Your personal teaching assistant powered by AI.</p>
            </div>
            <AiTutorChat />
        </div>
    );
}
