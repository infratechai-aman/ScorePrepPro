"use client";

import { motion } from "framer-motion";

export function ActivityGraph() {
    // Mock data points for the graph
    const dataPoints = [40, 55, 45, 60, 75, 65, 80, 85, 80, 90, 85, 95];
    const max = 100;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Learning Activity</h3>
                    <p className="text-xs text-slate-400">Student engagement over last 30 days</p>
                </div>
                <div className="flex gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    <span className="text-xs text-slate-500">Active</span>
                </div>
            </div>

            <div className="flex-1 relative w-full flex items-end justify-between gap-1 px-2 pt-8">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-300 font-medium pointer-events-none pb-6 pr-6">
                    <div className="border-b border-dashed border-slate-100 w-full h-full flex items-end"></div>
                    <div className="border-b border-dashed border-slate-100 w-full h-full flex items-end"></div>
                    <div className="border-b border-dashed border-slate-100 w-full h-full flex items-end"></div>
                </div>

                {/* Bars / Line Approximation */}
                {dataPoints.map((val, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 rounded-t-sm relative group cursor-pointer"
                    >
                        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-indigo-500 rounded-t-sm"></div>

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {val}% Activity
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
            </div>
        </div>
    );
}
