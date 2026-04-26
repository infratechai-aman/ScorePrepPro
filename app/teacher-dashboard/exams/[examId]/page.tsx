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

    useEffect(() => { fetchExam(); }, [examId]);
    useEffect(() => { if (userData?.uid) fetchClassrooms(); }, [userData?.uid]);

    const fetchExam = async () => {
        setLoading(true);
        try {
            const d = await getDoc(doc(db, "exams", examId));
            if (d.exists()) { setExam({ id: d.id, ...d.data() }); setSelectedClassroom(d.data().classroomId || ""); }
            const subs = await getDocs(collection(db, "exams", examId, "submissions"));
            setSubmissionCount(subs.size);
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
                    <GlassCard className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><BarChart3 className="text-emerald-600" size={20} /></div><div><p className="text-2xl font-bold">{exam?.mcqs?.length}</p><p className="text-xs text-slate-500">Questions</p></div></GlassCard>
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

                <div className="space-y-3">
                    <h2 className="text-lg font-bold font-serif">Questions</h2>
                    {exam?.mcqs?.map((mcq: any, i: number) => (
                        <GlassCard key={i} className="p-4">
                            <p className="font-semibold text-slate-800 mb-2"><span className="text-indigo-600">Q{i + 1}.</span> {mcq.question}</p>
                            <div className="space-y-1 ml-4">{mcq.options?.map((opt: string, j: number) => (<p key={j} className={`text-sm ${j === mcq.correctAnswer ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>{j === mcq.correctAnswer ? "✅ " : ""}{opt}</p>))}</div>
                        </GlassCard>
                    ))}
                </div>
            </main>
        </div>
    );
}
