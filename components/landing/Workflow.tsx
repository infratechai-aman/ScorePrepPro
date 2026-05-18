"use client";

import { MousePointerClick, Sparkles, FileDown, Check } from "lucide-react";

export function Workflow() {
    return (
        <section className="py-28 bg-[#0f172a] relative overflow-hidden">
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-20 space-y-5">
                    <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold tracking-wider text-xs uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        How It Works
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Three steps. <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Zero effort.</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        From selecting your syllabus to holding a print-ready PDF — everything happens in under 60 seconds.
                    </p>
                </div>

                {/* Steps — Vertical timeline layout */}
                <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="hidden md:block absolute left-[72px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-blue-500/50 to-cyan-500/50"></div>

                    {/* Step 1 */}
                    <div className="flex gap-8 mb-16 group">
                        <div className="flex-shrink-0 relative">
                            <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <MousePointerClick className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0f172a] border-2 border-indigo-500 flex items-center justify-center text-[11px] font-black text-indigo-400">1</span>
                        </div>
                        <div className="pt-2 flex-1">
                            <h3 className="text-2xl font-bold text-white mb-3">Configure Your Blueprint</h3>
                            <p className="text-slate-400 leading-relaxed text-[15px] mb-5 max-w-lg">
                                Select your Board, Class, and Subject. Pick specific chapters, set difficulty, and define total marks. The entire setup takes less than 30 seconds.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["CBSE", "ICSE", "Maharashtra SSC", "State Boards"].map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-8 mb-16 group">
                        <div className="flex-shrink-0 relative">
                            <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0f172a] border-2 border-blue-500 flex items-center justify-center text-[11px] font-black text-blue-400">2</span>
                        </div>
                        <div className="pt-2 flex-1">
                            <h3 className="text-2xl font-bold text-white mb-3">AI Generates Everything</h3>
                            <p className="text-slate-400 leading-relaxed text-[15px] mb-5 max-w-lg">
                                Our engine crafts a complete exam paper — proper sections, marks distribution, choice questions, and a detailed marking scheme. One click, full paper.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {["Sections & Marks", "Answer Keys", "Difficulty Balanced", "Board Accurate"].map(item => (
                                    <div key={item} className="flex items-center gap-1.5 text-xs text-blue-300">
                                        <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-8 group">
                        <div className="flex-shrink-0 relative">
                            <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <FileDown className="w-8 h-8 text-white" />
                            </div>
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0f172a] border-2 border-cyan-500 flex items-center justify-center text-[11px] font-black text-cyan-400">3</span>
                        </div>
                        <div className="pt-2 flex-1">
                            <h3 className="text-2xl font-bold text-white mb-3">Export & Print</h3>
                            <p className="text-slate-400 leading-relaxed text-[15px] mb-5 max-w-lg">
                                Download a perfectly formatted, watermark-free PDF. Add your school branding, customize headers — it's ready for the classroom. No formatting nightmares, ever.
                            </p>
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
                                <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">Output</span>
                                <span className="text-slate-400 text-xs">→</span>
                                <span className="text-sm font-medium text-white">Print-Ready PDF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom gradient divider */}
                <div className="mt-20 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
            </div>
        </section>
    );
}
