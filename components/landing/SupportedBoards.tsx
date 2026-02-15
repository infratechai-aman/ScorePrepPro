"use client";

import { motion } from "framer-motion";

export function SupportedBoards() {
    const boards = [
        { name: "CBSE", sub: "Central Board", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
        { name: "ICSE", sub: "Council for the Indian School", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { name: "MH-BOARD", sub: "Maharashtra State", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
        { name: "UP-BOARD", sub: "Uttar Pradesh State", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
        { name: "TN-BOARD", sub: "Tamil Nadu State", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    ];

    return (
        <section className="py-20 bg-slate-50 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-12">Universal Curriculum Support</h2>

                <div className="flex flex-wrapjustify-center gap-6 justify-center">
                    {boards.map((board, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className={`p-6 rounded-2xl bg-white border ${board.border} shadow-sm w-48 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md`}
                        >
                            <h3 className={`text-2xl font-bold ${board.color}`}>{board.name}</h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">{board.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
