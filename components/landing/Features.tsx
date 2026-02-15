"use client";

import { RefreshCw, Key, Image as ImageIcon, Keyboard } from "lucide-react";

export function Features() {
    const features = [
        {
            icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
            title: "Syllabus Synced",
            desc: "Always updated with latest Board curriculum changes."
        },
        {
            icon: <Key className="w-6 h-6 text-purple-600" />,
            title: "Answer Keys",
            desc: "Auto-generated detailed marking schemes."
        },
        {
            icon: <ImageIcon className="w-6 h-6 text-pink-600" />,
            title: "Custom Branding",
            desc: "Add your School or Coaching Logo to every paper."
        },
        {
            icon: <Keyboard className="w-6 h-6 text-indigo-600" />,
            title: "No Typing Needed",
            desc: "Stop manually finding questions. Just pick topics."
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
