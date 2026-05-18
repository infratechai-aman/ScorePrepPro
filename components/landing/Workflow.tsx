"use client";

import { MousePointerClick, Sparkles, FileDown, ArrowRight } from "lucide-react";

export function Workflow() {
    const steps = [
        {
            num: "01",
            icon: <MousePointerClick className="w-6 h-6" />,
            title: "Select Your Blueprint",
            desc: "Choose your Board (CBSE, ICSE, Maharashtra SSC), Class, Subject, and specific chapters. Set difficulty level and total marks — all in under 30 seconds.",
            accent: "blue",
            gradient: "from-blue-500 to-cyan-400",
            bgLight: "bg-blue-50",
            borderLight: "border-blue-100",
            textAccent: "text-blue-600",
        },
        {
            num: "02",
            icon: <Sparkles className="w-6 h-6" />,
            title: "AI Generates Instantly",
            desc: "Our advanced AI engine crafts a complete, syllabus-aligned question paper with proper section structure, marks distribution, and a detailed answer key — in one click.",
            accent: "indigo",
            gradient: "from-indigo-500 to-purple-500",
            bgLight: "bg-indigo-50",
            borderLight: "border-indigo-100",
            textAccent: "text-indigo-600",
        },
        {
            num: "03",
            icon: <FileDown className="w-6 h-6" />,
            title: "Export & Print",
            desc: "Download your watermark-free, perfectly formatted question paper as a print-ready PDF. Add your school logo, customize headers, and it's ready for the classroom.",
            accent: "emerald",
            gradient: "from-emerald-500 to-teal-400",
            bgLight: "bg-emerald-50",
            borderLight: "border-emerald-100",
            textAccent: "text-emerald-600",
        }
    ];

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <p className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold tracking-wider text-xs uppercase shadow-sm">
                        The Workflow
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 tracking-tight">
                        How ScorePrepPro Works
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        From blueprint to print-ready PDF in three effortless steps. No typing, no formatting, no stress.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {steps.map((step, i) => (
                        <div key={i} className="group relative">
                            {/* Connector Arrow (between cards on desktop) */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20">
                                    <ArrowRight className="w-5 h-5 text-slate-300" />
                                </div>
                            )}

                            <div className="h-full p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                {/* Background number watermark */}
                                <span className="absolute -top-4 -right-2 text-[120px] font-black text-slate-50 leading-none select-none pointer-events-none transition-all duration-500 group-hover:text-slate-100/80">
                                    {step.num}
                                </span>

                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                        <span className="text-white">{step.icon}</span>
                                    </div>

                                    {/* Step label */}
                                    <p className={`text-xs font-bold tracking-widest uppercase ${step.textAccent} mb-2`}>
                                        Step {step.num}
                                    </p>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-500 leading-relaxed text-sm">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom highlight bar */}
                <div className="flex items-center justify-center gap-3 pt-4">
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                </div>
            </div>
        </section>
    );
}
