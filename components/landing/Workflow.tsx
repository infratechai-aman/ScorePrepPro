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
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="text-center mb-12 space-y-4">
                    <p className="text-blue-600 font-bold tracking-wider text-sm uppercase">The Workflow</p>
                    <h2 className="text-4xl font-bold text-slate-900">How ScorePrepPro Works</h2>
                </div>

                <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                        ScorePrepPro simplifies the entire examination creation process into a seamlessly integrated, intelligent workflow designed specifically for busy Indian educators. Instead of wrestling with multiple documents, searching for relevant questions, and struggling with formatting, our platform allows you to effortlessly select your specific Board (CBSE, ICSE, or State Boards), Class, and Subject in seconds. Once your curriculum is set, our advanced AI takes over—granting you the power to pinpoint specific chapters, adjust difficulty levels to match your students' needs, and choose between comprehensive mixed-topic tests or focused chapter-wise assessments. Finally, with a single click, your custom-tailored, watermark-free question paper along with its detailed, step-by-step marking scheme is instantly exported as a perfectly aligned, print-ready PDF. This completely eliminates manual typing and formatting, saving you countless hours of labor and letting you focus on what truly matters: teaching and student success.
                    </p>
                </div>
            </div>
        </section>
    );
}
