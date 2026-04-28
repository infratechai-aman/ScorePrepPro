"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, Check, Send, BarChart3, Loader2, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
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
    const [overridingMap, setOverridingMap] = useState<{[key: number]: number}>({});
    const [savingOverride, setSavingOverride] = useState(false);

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

    const handleSaveOverride = async () => {
        if (!viewedSubmission) return;
        setSavingOverride(true);
        try {
            // Recalculate total score
            const newEvaluation = [...viewedSubmission.evaluation];
            Object.keys(overridingMap).forEach(qIndex => {
                const idx = parseInt(qIndex);
                if (newEvaluation[idx]) {
                    newEvaluation[idx].awardedMarks = overridingMap[idx];
                }
            });

            const newScore = newEvaluation.reduce((sum, item) => sum + (item.awardedMarks || 0), 0);
            const newPercentage = viewedSubmission.totalMarks ? Math.round((newScore / viewedSubmission.totalMarks) * 100) : 0;

            const res = await fetch(`/api/exams/${examId}/override`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentUid: viewedSubmission.uid,
                    evaluation: newEvaluation,
                    score: newScore,
                    percentage: newPercentage
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Update local state
            const updatedSubmission = { ...viewedSubmission, evaluation: newEvaluation, score: newScore, percentage: newPercentage };
            setViewedSubmission(updatedSubmission);
            setSubmissionsList(prev => prev.map(s => s.uid === updatedSubmission.uid ? updatedSubmission : s));
            setOverridingMap({}); // clear overrides after save
            alert("Score overridden successfully!");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSavingOverride(false);
        }
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
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Roll No</th>
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
                                            <td className="py-3 px-4 text-slate-600">{s.rollNo || "-"}</td>
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
                                <h3 className="font-bold text-slate-900 font-serif">Submission by {viewedSubmission.studentName} {viewedSubmission.rollNo ? `(${viewedSubmission.rollNo})` : ""}</h3>
                                <p className="text-xs text-slate-500">Time Taken: {Math.floor((viewedSubmission.timeTaken || 0) / 60)}m {(viewedSubmission.timeTaken || 0) % 60}s</p>
                            </div>
                            <div className="flex gap-2">
                                {Object.keys(overridingMap).length > 0 && (
                                    <Button onClick={handleSaveOverride} isLoading={savingOverride} className="h-8 px-3 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-700">Save Overrides</Button>
                                )}
                                <Button variant="ghost" onClick={() => { setViewedSubmission(null); setOverridingMap({}); }} className="h-8 px-3 rounded-lg text-sm">Close</Button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
                            {exam?.structuredPaper ? (
                                exam.structuredPaper.questions.map((q: any, i: number) => {
                                    const eval_q = viewedSubmission.evaluation?.[i];
                                    if (q.type === "mcq") {
                                        const isCorrect = eval_q?.isCorrect;
                                        return (
                                            <div key={i} className={`p-4 bg-white rounded-xl border-l-4 shadow-sm ${isCorrect ? "border-l-emerald-400" : "border-l-red-400"}`}>
                                                <div className="flex items-start gap-2 mb-2">
                                                    {isCorrect ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />}
                                                    <p className="font-semibold text-slate-800">Q{i + 1}. {q.question}</p>
                                                </div>
                                                <div className="space-y-1 ml-6">
                                                    {q.options?.map((opt: string, j: number) => (
                                                        <p key={j} className={`text-sm ${j === q.correctAnswer ? "text-emerald-700 font-semibold" : j === eval_q?.selectedAnswer && !isCorrect ? "text-red-600 line-through" : "text-slate-500"}`}>
                                                            {j === q.correctAnswer ? "✅ " : j === eval_q?.selectedAnswer && !isCorrect ? "❌ " : ""}{opt}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={i} className="p-4 bg-white rounded-xl border-l-4 border-l-amber-400 shadow-sm space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold text-slate-800">Q{i + 1}. {q.question}</p>
                                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">[{q.marks} Marks]</span>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{eval_q?.textAnswer || "No answer provided."}</p>
                                                </div>
                                                
                                                {eval_q?.feedback && (
                                                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex flex-col gap-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <Sparkles className="text-indigo-600" size={16} />
                                                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">AI Evaluation</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-slate-700">Marks:</span>
                                                                <input 
                                                                    type="number" 
                                                                    min={0}
                                                                    max={q.marks || 1}
                                                                    value={overridingMap[i] !== undefined ? overridingMap[i] : (eval_q?.awardedMarks || 0)}
                                                                    onChange={(e) => setOverridingMap({ ...overridingMap, [i]: Number(e.target.value) })}
                                                                    className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center text-sm font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                                                                />
                                                                <span className="text-sm text-slate-500 font-medium">/ {q.marks || 1}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-indigo-900/80 italic">{eval_q.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                })
                            ) : (
                                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">{viewedSubmission.textAnswers}</pre>
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
