"use client";

import { RefreshCw, Key, Image as ImageIcon, Keyboard } from "lucide-react";

export function Features() {
    const features = [
        {
            icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
            title: "Syllabus Synced",
            desc: "Stay effortlessly aligned with the ever-changing curriculum. Our system automatically updates in real-time with the latest CBSE, ICSE, and State Board guidelines, ensuring your question papers are always precise, relevant, and compliant without you having to double-check syllabus docs."
        },
        {
            icon: <Key className="w-6 h-6 text-purple-600" />,
            title: "Answer Keys",
            desc: "Stop wasting hours writing out solutions. Along with your question paper, we instantly generate comprehensive, step-by-step marking schemes that follow official board patterns, making evaluation faster, fairer, and completely stress-free for educators."
        },
        {
            icon: <ImageIcon className="w-6 h-6 text-pink-600" />,
            title: "Custom Branding",
            desc: "Deliver a premium, professional experience to your students and parents. Easily integrate your own school, institute, or coaching center's logo, adjust headers, and personalize the metadata on every single exam paper you generate with just a single click."
        },
        {
            icon: <Keyboard className="w-6 h-6 text-indigo-600" />,
            title: "No Typing Needed",
            desc: "Say goodbye to formatting nightmares and massive Word documents. Our intelligent AI engine allows you to simply select your desired classes, choose specific subjects, pick your topics, set the difficulty, and generate a flawless PDF ready for printing in just 60 seconds."
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Teachers Love Us</h2>
                    <p className="text-slate-500">Built specifically for the Indian Education System.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
