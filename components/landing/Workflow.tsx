"use client";

import { Quote } from "lucide-react";

export function Workflow() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <p className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold tracking-wider text-xs uppercase shadow-sm">
                        The Workflow
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 tracking-tight">
                        How ScorePrepPro Works
                    </h2>
                </div>

                <div className="relative bg-white p-8 md:p-14 lg:p-20 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-blue-900/5 group transition-all duration-500 hover:shadow-blue-900/10">
                    <Quote className="w-16 h-16 text-blue-50 absolute top-6 left-6 -rotate-180 -z-0 transition-transform duration-500 group-hover:scale-110" />
                    <Quote className="w-16 h-16 text-indigo-50 absolute bottom-6 right-6 -z-0 transition-transform duration-500 group-hover:scale-110" />

                    <p className="relative z-10 text-xl md:text-2xl text-slate-700 leading-loose font-medium text-center max-w-4xl mx-auto">
                        <span className="text-slate-900 font-bold">ScorePrepPro</span> simplifies the entire examination creation process into a seamlessly integrated, intelligent workflow designed specifically for busy Indian educators. Instead of wrestling with multiple documents, searching for relevant questions, and struggling with formatting, our platform allows you to effortlessly select your specific Board (CBSE, ICSE, or State Boards), Class, and Subject in seconds. Once your curriculum is set, our <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 mx-1">advanced AI takes over</span>—granting you the power to pinpoint specific chapters, adjust difficulty levels to match your students' needs, and choose between comprehensive mixed-topic tests or focused chapter-wise assessments. Finally, with a single click, your custom-tailored, watermark-free question paper along with its detailed, step-by-step marking scheme is instantly exported as a <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 mx-1">perfectly aligned, print-ready PDF</span>. This completely eliminates manual typing and formatting, saving you countless hours of labor and letting you focus on what truly matters: teaching and student success.
                    </p>
                </div>
            </div>
        </section>
    );
}
