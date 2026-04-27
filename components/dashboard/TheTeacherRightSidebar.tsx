"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Crown, ChevronRight, Zap, ClipboardList, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export function TheTeacherRightSidebar() {
    const { userData } = useAuth();
    const [upcomingExams, setUpcomingExams] = useState<any[]>([]);

    useEffect(() => {
        if (userData?.uid) fetchUpcomingExams();
    }, [userData?.uid]);

    const fetchUpcomingExams = async () => {
        try {
            const res = await fetch(`/api/teacher-dashboard?teacherUid=${userData?.uid}&section=published-exams`);
            const data = await res.json();
            if (res.ok) setUpcomingExams(data.exams || []);
        } catch (err) { console.error("Error fetching exams:", err); }
    };

    return (
        <aside className="w-80 bg-slate-50/50 border-l border-slate-200 hidden xl:flex flex-col p-6 space-y-8 h-[calc(100vh-80px)] overflow-y-auto sticky top-20">
            {/* Plan Status Card */}
            <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                        <Crown size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Status</p>
                        <h3 className="font-bold text-slate-900">THE TEACHER</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 relative z-10">Full access to custom content, classrooms, and exam management.</p>
                <Button variant="outline" className="w-full text-xs h-9 rounded-xl">Manage Billing</Button>
            </div>

            {/* Published Exams */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" /> Published Exams
                    </h4>
                    <span className="text-xs font-bold text-indigo-600 uppercase">View All</span>
                </div>
                <div className="space-y-3">
                    {upcomingExams.length > 0 ? upcomingExams.map((exam, i) => (
                        <div key={i} className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm hover:border-purple-100 transition-all cursor-pointer">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                <ClipboardList className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-800 text-sm truncate">{exam.title}</h5>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    <span className="text-xs text-emerald-600 font-medium">Published</span>
                                    <span className="text-xs text-slate-300 ml-1">•</span>
                                    <span className="text-xs text-slate-400">{exam.totalQuestions || 0} MCQs</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 bg-slate-50 rounded-xl text-center">
                            <p className="text-xs text-slate-400">No published exams yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/80 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-15 translate-y-1/2 -translate-x-1/2" />
                <h4 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Pro Tip
                </h4>
                <p className="text-sm text-slate-300 relative z-10 leading-relaxed mb-4">
                    Upload your own content to Custom Subjects, then use the Content Generator to create premium notes and question papers from your material.
                </p>
                <a href="/teacher-dashboard/custom-generate" className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1 uppercase tracking-wider relative z-10 transition-colors">
                    Try Generator <ChevronRight className="w-3 h-3" />
                </a>
            </div>
        </aside>
    );
}
