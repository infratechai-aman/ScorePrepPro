"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Trophy, CheckCircle, XCircle, ArrowLeft, Loader2, Clock } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function ExamResultPage() {
    const { examId } = useParams() as { examId: string };
    const { userData } = useAuth();
    const [exam, setExam] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            const uidToCheck = userData?.uid || (typeof window !== "undefined" ? localStorage.getItem(`exam_guest_uid_${examId}`) : "");
            if (!uidToCheck) {
                setLoading(false);
                return;
            }
            
            try {
                const res = await fetch(`/api/exams/${examId}?studentUid=${uidToCheck}`);
                const data = await res.json();
                
                if (res.ok) {
                    setExam(data.exam);
                    setSubmission(data.submission);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchResult();
    }, [examId, userData?.uid]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    if (exam?.type === "paper") {
        const isStructured = !!exam.structuredPaper;
        const hasSubjective = isStructured ? exam.structuredPaper.questions.some((q: any) => q.type === "subjective") : true;

        return (
            <main className="max-w-3xl mx-auto p-6 space-y-8">
                <Link href="/student" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Dashboard</Link>

                <GlassCard className="p-8 text-center space-y-4 border-t-4 border-t-indigo-500">
                    <CheckCircle className="mx-auto text-indigo-500" size={48} />
                    <h1 className="text-3xl font-bold font-serif text-slate-900">Exam Submitted!</h1>
                    {hasSubjective ? (
                        <p className="text-slate-600">Your answers have been saved and sent to your teacher for manual grading.</p>
                    ) : (
                        <>
                            <div className={`inline-block px-6 py-3 rounded-2xl bg-emerald-50`}>
                                <span className={`text-5xl font-extrabold text-emerald-600`}>{submission?.percentage}%</span>
                            </div>
                            <p className="text-slate-600">{submission?.score}/{submission?.totalMarks} correct answers</p>
                        </>
                    )}
                </GlassCard>

                <div className="space-y-3">
                    <h2 className="text-xl font-bold font-serif text-slate-900">Your Submission Review</h2>
                    
                    {isStructured ? (
                        <div className="space-y-4">
                            {exam.structuredPaper.questions.map((q: any, i: number) => {
                                const eval_q = submission?.evaluation?.[i];
                                if (q.type === "mcq") {
                                    const isCorrect = eval_q?.isCorrect;
                                    return (
                                        <GlassCard key={i} className={`p-4 border-l-4 ${isCorrect ? "border-l-emerald-400" : "border-l-red-400"}`}>
                                            <div className="flex items-start gap-2 mb-2">
                                                {isCorrect ? <CheckCircle size={18} className="text-emerald-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />}
                                                <p className="font-semibold text-slate-800">Q{i + 1}. {q.question}</p>
                                            </div>
                                            <div className="space-y-1 ml-6">
                                                {q.options?.map((opt: string, j: number) => (
                                                    <p key={j} className={`text-sm ${j === q.correctAnswer ? "text-emerald-700 font-semibold" : j === eval_q?.selectedAnswer && !isCorrect ? "text-red-600 line-through" : "text-slate-500"}`}>
                                                        {j === q.correctAnswer ? "✅ " : j === eval_q?.selectedAnswer && !isCorrect ? "❌ " : ""}{opt}
                                                    </p>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    );
                                } else {
                                    return (
                                        <GlassCard key={i} className="p-4 border-l-4 border-l-amber-400">
                                            <div className="flex items-start gap-2 mb-2">
                                                <Clock size={18} className="text-amber-500 mt-0.5" />
                                                <p className="font-semibold text-slate-800">Q{i + 1}. {q.question}</p>
                                            </div>
                                            <div className="ml-6 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{eval_q?.textAnswer || "No answer provided."}</p>
                                            </div>
                                            <p className="text-xs text-amber-600 mt-2 ml-6 font-medium">Pending manual review</p>
                                        </GlassCard>
                                    );
                                }
                            })}
                        </div>
                    ) : (
                        <GlassCard className="p-6">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">{submission?.textAnswers}</pre>
                        </GlassCard>
                    )}
                </div>
            </main>
        );
    }

    const pct = submission?.percentage || 0;
    const color = pct >= 80 ? "emerald" : pct >= 50 ? "amber" : "red";

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-8">
            <Link href="/student" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Dashboard</Link>

            <GlassCard className="p-8 text-center space-y-4">
                <Trophy className={`mx-auto text-${color}-500`} size={48} />
                <h1 className="text-3xl font-bold font-serif text-slate-900">Exam Complete!</h1>
                <div className={`inline-block px-6 py-3 rounded-2xl bg-${color}-50`}>
                    <span className={`text-5xl font-extrabold text-${color}-600`}>{pct}%</span>
                </div>
                <p className="text-slate-600">{submission?.score}/{submission?.totalMarks} correct answers</p>
            </GlassCard>

            {/* Review */}
            <div className="space-y-3">
                <h2 className="text-xl font-bold font-serif text-slate-900">Review Answers</h2>
                {exam?.mcqs?.map((mcq: any, i: number) => {
                    const eval_q = submission?.evaluation?.[i];
                    const isCorrect = eval_q?.isCorrect;
                    return (
                        <GlassCard key={i} className={`p-4 border-l-4 ${isCorrect ? "border-l-emerald-400" : "border-l-red-400"}`}>
                            <div className="flex items-start gap-2 mb-2">
                                {isCorrect ? <CheckCircle size={18} className="text-emerald-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />}
                                <p className="font-semibold text-slate-800">Q{i + 1}. {mcq.question}</p>
                            </div>
                            <div className="space-y-1 ml-6">
                                {mcq.options?.map((opt: string, j: number) => (
                                    <p key={j} className={`text-sm ${j === mcq.correctAnswer ? "text-emerald-700 font-semibold" : j === eval_q?.selectedAnswer && !isCorrect ? "text-red-600 line-through" : "text-slate-500"}`}>
                                        {j === mcq.correctAnswer ? "✅ " : j === eval_q?.selectedAnswer && !isCorrect ? "❌ " : ""}{opt}
                                    </p>
                                ))}
                            </div>
                            {mcq.explanation && <p className="mt-2 text-xs text-slate-500 ml-6 bg-slate-50 p-2 rounded-lg">💡 {mcq.explanation}</p>}
                        </GlassCard>
                    );
                })}
            </div>
        </main>
    );
}
