"use client";

import { Button } from "@/components/ui/Button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Hero() {
    const router = useRouter();

    return (
        <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-b from-blue-50 to-white -z-10 rounded-bl-[100px] opacity-60"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold tracking-wide border border-green-100"
                    >
                        NEW: AI CURRICULUM SYNC 2-0
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight"
                    >
                        Generate <span className="text-primary">Board Quality</span> Papers in <span className="text-primary">60 Seconds</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-lg text-slate-500 max-w-xl leading-relaxed"
                    >
                        The #1 AI assistant for Indian teachers. Create unit tests, semester finals, and worksheets tailored to CBSE, ICSE, and State Board curriculum.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Button
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1"
                            onClick={() => router.push("/generate")}
                        >
                            Generate Now
                        </Button>

                        <button className="flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Play className="w-4 h-4 text-blue-600 fill-blue-600 ml-1" />
                            </div>
                            Watch 2 Min Demo
                        </button>
                    </motion.div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">Trusted by <strong>5000+ teachers</strong> in India</p>
                    </div>
                </div>

                {/* Right Content - Abstract UI Mockup */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative"
                >
                    <div className="relative z-10 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-6 md:p-8 aspect-square md:aspect-[4/3] flex flex-col">
                        {/* Mockup Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col gap-2 w-full">
                                <div className="h-2 w-1/3 bg-slate-100 rounded-full"></div>
                                <div className="h-2 w-1/4 bg-slate-50 rounded-full"></div>
                            </div>
                            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                                <div className="w-5 h-5 bg-white/20 rounded-md"></div>
                            </div>
                        </div>

                        {/* Mockup List Items */}
                        <div className="space-y-4 flex-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 font-bold text-sm">{i}</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
                                        <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <span className="text-primary text-sm font-semibold bg-primary/5 px-4 py-2 rounded-full">AI Generation in Progress...</span>
                        </div>
                    </div>

                    {/* Background Blobs for specific premium feel */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 blur-3xl rounded-full -z-10"></div>
                </motion.div>
            </div>
        </section>
    );
}
