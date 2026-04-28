"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, Check, Send, BarChart3, Loader2, Clock, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ExamDetailPage() {
    const { examId } = useParams() as { examId: string };
    const { userData } = useAuth();
    const [exam, setExam] = useState<any>(null);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [submissionsList, setSubmissionsList] = useState<any[]>([]);
    const [viewedSubmission, setViewedSubmission] = useState<any>(null);

    useEffect(() => { fetchExam(); }, [examId]);
    useEffect(() => { if (userData?.uid) fetchClassrooms(); }, [userData?.uid]);

    const fetchExam = async () => {
        setLoading(true);
        try {
            const d = await getDoc(doc(db, "exams", examId));
            if (d.exists()) { setExam({ id: d.id, ...d.data() }); setSelectedClassroom(d.data().classroomId || ""); }
            const subs = await getDocs(collection(db, "exams", examId, "submissions"));
            setSubmissionCount(subs.size);
            
            const subsData = await Promise.all(subs.docs.map(async (subDoc) => {
                const data = subDoc.data();
                let studentName = data.studentName;
                if (!studentName) {
                    const userDoc = await getDoc(doc(db, "users", subDoc.id));
                    studentName = userDoc.exists() ? userDoc.data().name : "Guest Student";
                }
                return { uid: subDoc.id, ...data, studentName };
            }));
            setSubmissionsList(subsData);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchClassrooms = async () => {
        const q2 = query(collection(db, "classrooms"), where("teacherUid", "==", userData?.uid));
        const s = await getDocs(q2);
        setClassrooms(s.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handlePublish = async () => {
        if (!selectedClassroom) { alert("Select a classroom"); return; }
        setPublishing(true);
        try {
            const r = await fetch(`/api/exams/${examId}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classroomId: selectedClassroom, teacherUid: userData?.uid }) });
            const d = await r.json(); if (!r.ok) throw new Error(d.error);
            fetchExam();
        } catch (e: any) { alert(e.message); } finally { setPublishing(false); }
    };

    const copyLink = () => { navigator.clipboard.writeText(`${window.location.origin}/student/exam/${examId}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    if (loading) return <div className="min-h-screen bg-slate-50"><DashboardHeader title="Exam" /><div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title={exam?.title || "Exam"} />
            <main className="p-8 space-y-6 max-w-5xl">
                <Link href="/teacher-dashboard/exams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Back</Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">{exam?.title}</h1>
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                            <span>{exam?.mcqs?.length} MCQs</span>
                            <span>{exam?.timeLimit} min</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${exam?.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{exam?.status}</span>
                        </div>
                    </div>
                    {exam?.status === "published" && (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={copyLink} className="rounded-xl gap-2">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied!" : "Copy Link"}</Button>
                            <Link href={`/teacher-dashboard/exams/${examId}/analytics`}><Button className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2"><BarChart3 size={16} /> Analytics</Button></Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <GlassCard className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="text-indigo-600" size={20} /></div><div><p className="text-2xl font-bold">{submissionCount}</p><p className="text-xs text-slate-500">Submissions</p></div></GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Clock className="text-purple-600" size={20} /></div><div><p className="text-2xl font-bold">{exam?.timeLimit}</p><p className="text-xs text-slate-500">Minutes</p></div></GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><BarChart3 className="text-emerald-600" size={20} /></div><div><p className="text-2xl font-bold">{exam?.type === "paper" ? "Subjective" : exam?.mcqs?.length}</p><p className="text-xs text-slate-500">{exam?.type === "paper" ? "Format" : "Questions"}</p></div></GlassCard>
                </div>

                {exam?.status === "draft" && (
                    <GlassCard className="p-6 space-y-4">
                        <h2 className="text-lg font-bold font-serif">Publish Exam</h2>
                        <select value={selectedClassroom} onChange={(e) => setSelectedClassroom(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                            <option value="">Select classroom...</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                        </select>
                        <Button onClick={handlePublish} isLoading={publishing} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2"><Send size={16} /> Publish</Button>
                    </GlassCard>
                )}

                {submissionsList.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold font-serif">Student Submissions</h2>
                        <GlassCard className="overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Student Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Score</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Percentage</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Time Taken</th>
                                        {exam?.type === "paper" && <th className="text-right py-3 px-4 font-semibold text-slate-600">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissionsList.map((s, i) => (
                                        <tr key={s.uid} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 font-medium text-slate-900">{s.studentName}</td>
                                            <td className="py-3 px-4 text-slate-700 font-semibold">
                                                {s.score === null ? "Pending" : `${s.score} / ${s.totalMarks}`}
                                            </td>
                                            <td className="py-3 px-4">
                                                {s.percentage === null ? (
                                                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">N/A</span>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : s.percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {s.percentage}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {Math.floor((s.timeTaken || 0) / 60)}m {(s.timeTaken || 0) % 60}s
                                            </td>
                                            {exam?.type === "paper" && (
                                                <td className="py-3 px-4 text-right">
                                                    <Button variant="outline" onClick={() => setViewedSubmission(s)} className="rounded-lg text-xs py-1 px-3">View Answers</Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </GlassCard>
                    </div>
                )}

                {exam?.type === "mcq" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold font-serif">Questions</h2>
                        {exam?.mcqs?.map((mcq: any, i: number) => (
                            <GlassCard key={i} className="p-4">
                                <p className="font-semibold text-slate-800 mb-2"><span className="text-indigo-600">Q{i + 1}.</span> {mcq.question}</p>
                                <div className="space-y-1 ml-4">{mcq.options?.map((opt: string, j: number) => (<p key={j} className={`text-sm ${j === mcq.correctAnswer ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>{j === mcq.correctAnswer ? "✅ " : ""}{opt}</p>))}</div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </main>

            {/* View Answers Modal */}
            {viewedSubmission && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                    <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col p-0">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-slate-900 font-serif">Submission by {viewedSubmission.studentName}</h3>
                                <p className="text-xs text-slate-500">Time Taken: {Math.floor((viewedSubmission.timeTaken || 0) / 60)}m {(viewedSubmission.timeTaken || 0) % 60}s</p>
                            </div>
                            <Button variant="ghost" onClick={() => setViewedSubmission(null)} className="h-8 px-3 rounded-lg text-sm">Close</Button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">{viewedSubmission.textAnswers}</pre>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
