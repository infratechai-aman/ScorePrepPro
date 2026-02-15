"use client";

import { CheckCircle2 } from "lucide-react";

export function ExamPatterns() {
    return (
        <section className="py-24 bg-[#0f172a] text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <p className="text-blue-400 font-bold tracking-wider text-sm uppercase">Exam Formats</p>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Every Exam Pattern, <br />
                            One AI Platform.
                        </h2>
                        <p className="text-slate-400 text-lg max-w-lg">
                            Whether it's a quick 10-mark surprise test or a full 3-hour final Mock, we have the patterns pre-configured.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {['Unit Tests', 'Semester Exams', 'Mock Boards', 'Worksheets'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <span className="font-semibold">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                                    <span className="font-bold text-white text-xl">M</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Mathematics Mock Paper</h3>
                                    <p className="text-slate-400 text-sm">Class 10 • Full Syllabus</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Section A (MCQs)</span>
                                        <span className="text-blue-400">100%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Section B (Short Answer)</span>
                                        <span className="text-blue-400">100%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-indigo-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Section D (Long Answer)</span>
                                        <span className="text-slate-500">Generating...</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full w-[60%] bg-purple-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <span className="text-xs text-slate-500">AI Engine v2.5 Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
