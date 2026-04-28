"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, FileText, BarChart3, Clock, CheckCircle, AlertCircle, Loader2, Lock, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ExamsPage() {
    const { userData } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isTheTeacher = userData?.plan === "the_teacher";

    useEffect(() => {
        if (userData?.uid && isTheTeacher) fetchExams();
    }, [userData?.uid]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/exams?teacherUid=${userData?.uid}`);
            const data = await res.json();
            if (res.ok) {
                setExams(data.exams || []);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isTheTeacher) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader title="Exams" />
                <div className="flex items-center justify-center h-[calc(100vh-160px)]">
                    <GlassCard className="max-w-md p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                            <Lock className="text-purple-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-slate-900">THE TEACHER Plan Required</h2>
                        <p className="text-slate-500 text-sm">Create MCQ exams and track student performance.</p>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = "/pricing"}>
                            <Sparkles size={16} className="mr-2" /> Upgrade Now
                        </Button>
                    </GlassCard>
                </div>
            </div>
        );
    }

    const statusIcons: any = {
        draft: <Clock size={14} className="text-amber-500" />,
        published: <CheckCircle size={14} className="text-emerald-500" />,
        expired: <AlertCircle size={14} className="text-slate-400" />,
    };

    const statusColors: any = {
        draft: "bg-amber-50 text-amber-700 border-amber-200",
        published: "bg-emerald-50 text-emerald-700 border-emerald-200",
        expired: "bg-slate-50 text-slate-500 border-slate-200",
    };

    const publishedCount = exams.filter(e => e.status === "published").length;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Exams" />

            <main className="p-8 space-y-8 max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Your Exams</h1>
                        <p className="text-slate-500 mt-1">
                            Create and manage exams from your content.
                        </p>
                    </div>
                    <Link href="/teacher-dashboard/exams/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                            <Plus size={18} /> Create Exam
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                ) : exams.length === 0 ? (
                    <GlassCard className="p-12 text-center">
                        <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                        <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">No exams yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Create your first MCQ exam from your uploaded content.</p>
                        <Link href="/teacher-dashboard/exams/create">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                                <Plus size={18} /> Create First Exam
                            </Button>
                        </Link>
                    </GlassCard>
                ) : (
                    <div className="space-y-4">
                        {exams.map(exam => (
                            <Link key={exam.id} href={`/teacher-dashboard/exams/${exam.id}`}>
                                <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <FileText className="text-purple-600" size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{exam.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500">{exam.totalQuestions || exam.mcqs?.length || 0} MCQs</span>
                                                <span className="text-xs text-slate-500">{exam.timeLimit || 30} min</span>
                                                <span className="text-xs text-slate-500 capitalize">{exam.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {exam.status === "published" && (
                                            <Link href={`/teacher-dashboard/exams/${exam.id}/analytics`} onClick={(e) => e.stopPropagation()}>
                                                <Button variant="outline" className="rounded-lg text-xs gap-1.5 py-1.5 px-3">
                                                    <BarChart3 size={14} /> Analytics
                                                </Button>
                                            </Link>
                                        )}
                                        <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${statusColors[exam.status]}`}>
                                            {statusIcons[exam.status]} {exam.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
