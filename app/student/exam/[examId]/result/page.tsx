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
                    {hasSubjective && (
                        <p className="text-sm font-medium text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-full inline-block mb-2">Theory questions auto-graded by AI Smart Grader</p>
                    )}
                    <div className={`inline-block px-6 py-3 rounded-2xl bg-emerald-50`}>
                        <span className={`text-5xl font-extrabold text-emerald-600`}>{submission?.percentage}%</span>
                    </div>
                    <p className="text-slate-600">{submission?.score}/{submission?.totalMarks} marks scored</p>
                    {hasSubjective && <p className="text-xs text-slate-500 mt-2">Note: Your teacher may review and override these AI-generated marks.</p>}
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
                                        <GlassCard key={i} className="p-4 border-l-4 border-l-indigo-400 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-2">
                                                    <p className="font-semibold text-slate-800">Q{i + 1}. {q.question}</p>
                                                </div>
                                                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded whitespace-nowrap">
                                                    {eval_q?.awardedMarks || 0} / {q.marks || 1} Marks
                                                </span>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 prose prose-sm max-w-none prose-slate"
                                                dangerouslySetInnerHTML={{ __html: eval_q?.textAnswer || "No answer provided." }}
                                            />
                                            {eval_q?.feedback && (
                                                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg mt-2">
                                                    <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">AI Feedback</p>
                                                    <p className="text-sm text-slate-700 italic">{eval_q.feedback}</p>
                                                </div>
                                            )}
                                        </GlassCard>
                                    );
                                }
                            })}
                        </div>
                    ) : (
                        <GlassCard className="p-6">
                            <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: submission?.textAnswers || "" }} />
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
