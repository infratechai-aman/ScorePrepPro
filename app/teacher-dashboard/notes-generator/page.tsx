"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sparkles } from "lucide-react";

export default function NotesGeneratorPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DashboardHeader title="AI Notes Generator" />

            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-xl w-full text-center space-y-10 p-12 md:p-16 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
                    {/* Decorative Backgrounds */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 transition-transform duration-700 group-hover:scale-110" />

                    {/* Icon Container */}
                    <div className="relative z-10 mx-auto w-24 h-24 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-[2rem] flex items-center justify-center border border-indigo-100 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 tracking-tight">
                            Coming Soon
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                            We are crafting a magical AI-powered notes generation experience. Prepare to instantly convert your syllabus into beautiful, exam-ready study materials!
                        </p>
                    </div>

                    {/* Progress Indicator Dots */}
                    <div className="relative z-10 pt-4 flex justify-center gap-2">
                        <div className="h-2 w-8 bg-indigo-600 rounded-full" />
                        <div className="h-2 w-2 bg-indigo-200 rounded-full" />
                        <div className="h-2 w-2 bg-indigo-100 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
