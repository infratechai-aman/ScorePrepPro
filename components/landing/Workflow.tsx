"use client";

import { GraduationCap, Wand2, FileCheck } from "lucide-react";

export function Workflow() {
    const steps = [
        {
            icon: <GraduationCap className="w-8 h-8 text-white" />,
            color: "bg-orange-500",
            title: "Select Curriculum",
            desc: "Choose your Board, Class, and Subject. We support all major Indian standards."
        },
        {
            icon: <Wand2 className="w-8 h-8 text-white" />,
            color: "bg-indigo-600",
            title: "AI Customization",
            desc: "Set difficulty levels, pick specific chapters, and choose between Mixed or Chapter-wise tests."
        },
        {
            icon: <FileCheck className="w-8 h-8 text-white" />,
            color: "bg-emerald-500",
            title: "Instant Export",
            desc: "Review your paper and download as a print-ready PDF in seconds. Watermark-free & perfectly aligned."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <p className="text-blue-600 font-bold tracking-wider text-sm uppercase">The Workflow</p>
                    <h2 className="text-4xl font-bold text-slate-900">How ScorePrepPro Works</h2>
                    <p className="text-slate-500">Streamlined for busy teachers and coaching centers.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-start space-y-4 group">
                            <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-lg shadow-slate-200 group-hover:-translate-y-2 transition-transform duration-300`}>
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed pr-8">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
