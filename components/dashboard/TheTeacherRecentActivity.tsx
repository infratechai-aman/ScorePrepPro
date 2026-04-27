"use client";

import { useAuth } from "@/contexts/AuthContext";
import { FileText, ClipboardList, ArrowRight, CheckCircle, Clock, AlertCircle, Sparkles, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TheTeacherRecentActivity() {
    const { userData } = useAuth();
    const router = useRouter();
    const [exams, setExams] = useState<any[]>([]);
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?.uid) fetchActivity();
    }, [userData?.uid]);

    const fetchActivity = async () => {
        try {
            const res = await fetch(`/api/teacher-dashboard?teacherUid=${userData?.uid}&section=activity`);
            const data = await res.json();
            if (res.ok) { setExams(data.exams || []); setPapers(data.papers || []); }
        } catch (err) { console.error("Error fetching activity:", err); }
        finally { setLoading(false); }
    };

    const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
        draft: { icon: <Clock size={12} />, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
        published: { icon: <CheckCircle size={12} />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        expired: { icon: <AlertCircle size={12} />, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
    };

    const hasContent = exams.length > 0 || papers.length > 0;

    if (loading) return (
        <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-100" />
                        <div className="flex-1 space-y-2"><div className="h-4 bg-slate-100 rounded w-1/2" /><div className="h-3 bg-slate-50 rounded w-1/3" /></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                <span onClick={() => router.push("/teacher-dashboard/exams")} className="text-xs font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 uppercase tracking-wide flex items-center gap-1 transition-colors">
                    All Exams <ArrowRight className="w-3 h-3" />
                </span>
            </div>

            {hasContent ? (
                <div className="space-y-3">
                    {exams.map((exam, i) => {
                        const status = statusConfig[exam.status] || statusConfig.draft;
                        return (
                            <motion.div key={exam.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                                <Link href={`/teacher-dashboard/exams/${exam.id}`}>
                                    <div className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-4 relative z-10 min-w-0 flex-1">
                                            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-200/50 group-hover:scale-105 transition-transform">
                                                <ClipboardList className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{exam.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500">{exam.totalQuestions || 0} MCQs</span>
                                                    <span className="text-xs text-slate-300">•</span>
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${status.bg} ${status.color}`}>{status.icon} {exam.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors shrink-0 relative z-10" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                    {papers.map((paper, i) => (
                        <motion.div key={paper.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: (exams.length + i) * 0.06 }}>
                            <div onClick={() => router.push(`/teacher-dashboard/paper/${paper.id}`)} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-50/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative z-10 min-w-0 flex-1">
                                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200/50 group-hover:scale-105 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{paper.subject}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-500">{paper.chapter || paper.grade}</span>
                                            <span className="text-xs text-slate-300">•</span>
                                            <span className="text-xs text-slate-500">{paper.totalMarks} Marks</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 relative z-10" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="relative bg-gradient-to-br from-slate-50 to-white p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center mb-4"><Sparkles className="w-7 h-7 text-purple-400" /></div>
                        <p className="text-slate-500 font-medium mb-1">No activity yet</p>
                        <p className="text-sm text-slate-400 mb-5">Create content or publish exams to see your activity here.</p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/teacher-dashboard/custom-generate" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"><Sparkles className="w-4 h-4" /> Generate Content</Link>
                            <Link href="/teacher-dashboard/exams/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all"><Plus className="w-4 h-4" /> Create Exam</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
