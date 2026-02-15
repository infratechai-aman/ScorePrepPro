"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, ChevronRight, Crown, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RightSidebar() {
    const { userData } = useAuth();
    const date = new Date();

    return (
        <aside className="w-80 bg-slate-50/50 border-l border-slate-200 hidden xl:flex flex-col p-6 space-y-8 h-[calc(100vh-80px)] overflow-y-auto sticky top-20">

            {/* Profile Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Status</p>
                        <h3 className="font-bold text-slate-900">{userData?.plan === 'teacher' ? 'Teacher Pro' : 'Free Plan'}</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">Your subscription is active until Dec 2026.</p>
                <Button variant="outline" className="w-full text-xs h-9">Manage Billing</Button>
            </div>

            {/* Exam Calendar */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 text-sm">Exam Calendar</h4>
                    <span className="text-xs font-bold text-indigo-600 uppercase">Full Schedule</span>
                </div>

                <div className="space-y-3">
                    {[
                        { day: "15", month: "OCT", title: "Unit Test 2", sub: "Mathematics", color: "bg-blue-500" },
                        { day: "28", month: "OCT", title: "Mid-term Exams", sub: "Multiple Subjects", color: "bg-orange-500" },
                        { day: "02", month: "NOV", title: "Surprise Quiz", sub: "Science", color: "bg-emerald-500" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-shadow cursor-pointer group">
                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-slate-50 rounded-lg text-xs font-bold text-slate-600">
                                <span className="text-[9px] uppercase">{item.month}</span>
                                <span className="text-sm">{item.day}</span>
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-slate-800 text-sm">{item.title}</h5>
                                <p className="text-xs text-slate-500">{item.sub}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        </div>
                    ))}
                    <Button variant="ghost" className="w-full text-xs text-slate-500 justify-start px-0 hover:text-indigo-600">
                        + Add Important Date
                    </Button>
                </div>
            </div>

            {/* Pro Teacher Tip */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

                <h4 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Pro Tip
                </h4>
                <p className="text-sm text-slate-300 relative z-10 leading-relaxed mb-4">
                    Try mixing "Case Study" questions for Class 10/12 to better align with the latest Competency Based Education guidelines.
                </p>
                <a href="#" className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 uppercase tracking-wider">
                    Learn More <ChevronRight className="w-3 h-3" />
                </a>
            </div>

        </aside>
    );
}
