"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeft, Trophy, Users, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ExamAnalyticsPage() {
    const { examId } = useParams() as { examId: string };
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, [examId]);

    const fetchAnalytics = async () => {
        try {
            const r = await fetch(`/api/exams/${examId}/analytics`);
            const d = await r.json();
            setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-screen bg-slate-50"><DashboardHeader title="Analytics" /><div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Exam Analytics" />
            <main className="p-8 space-y-8 max-w-6xl">
                <Link href={`/teacher-dashboard/exams/${examId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Back to Exam</Link>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <GlassCard className="p-5 text-center">
                        <Users className="mx-auto text-indigo-600 mb-2" size={24} />
                        <p className="text-3xl font-bold text-slate-900">{data?.totalStudents || 0}</p>
                        <p className="text-xs text-slate-500">Total Submissions</p>
                    </GlassCard>
                    <GlassCard className="p-5 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                            <span className="text-xl font-bold text-emerald-600">{data?.averagePercentage || 0}%</span>
                        </div>
                        <p className="text-xs text-slate-500">Average Score</p>
                    </GlassCard>
                    <GlassCard className="p-5 text-center">
                        <Trophy className="mx-auto text-amber-500 mb-2" size={24} />
                        <p className="text-xl font-bold text-slate-900">{data?.topper?.score || 0}/{data?.topper?.totalMarks || 0}</p>
                        <p className="text-xs text-slate-500">Topper</p>
                    </GlassCard>
                    <GlassCard className="p-5 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-2">
                            <span className="text-xl font-bold text-purple-600">{data?.completionRate || 0}%</span>
                        </div>
                        <p className="text-xs text-slate-500">Completion Rate</p>
                    </GlassCard>
                </div>

                {/* Score Distribution */}
                {data?.submissions?.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-bold font-serif text-slate-900 mb-4">Student Scores</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Student</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Score</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Percentage</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Time</th>
                                </tr></thead>
                                <tbody>
                                    {[...data.submissions].sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).map((s: any, i: number) => (
                                        <tr key={s.studentUid} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">{i === 0 ? "🏆" : i + 1}</td>
                                            <td className="py-3 px-4 font-medium">{s.studentUid?.substring(0, 8)}...</td>
                                            <td className="py-3 px-4">{s.score}/{s.totalMarks}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.percentage >= 80 ? "bg-emerald-50 text-emerald-700" : s.percentage >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{s.percentage}%</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">{s.timeTaken ? `${Math.round(s.timeTaken / 60)}m` : "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}

                {/* Hardest Questions */}
                {data?.hardestQuestions?.length > 0 && (
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingDown className="text-red-500" size={20} /> Hardest Questions
                        </h2>
                        <div className="space-y-3">
                            {data.hardestQuestions.map((q: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-700 flex-1">Q{q.questionIndex + 1}: {q.question?.substring(0, 80)}...</p>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="text-red-600 font-medium">{q.errorRate}% error</span>
                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${q.errorRate}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </main>
        </div>
    );
}
