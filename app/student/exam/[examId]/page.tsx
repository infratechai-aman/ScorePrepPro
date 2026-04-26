"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudentExamPage() {
    const { examId } = useParams() as { examId: string };
    const { userData } = useAuth();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            const d = await getDoc(doc(db, "exams", examId));
            if (d.exists()) { setExam(d.data()); setTimeLeft((d.data().timeLimit || 30) * 60); }
            // Check if already submitted
            if (userData?.uid) {
                const sub = await getDoc(doc(db, "exams", examId, "submissions", userData.uid));
                if (sub.exists()) router.push(`/student/exam/${examId}/result`);
            }
            setLoading(false);
        };
        fetchExam();
    }, [examId, userData?.uid]);

    // Timer — only starts after exam is loaded
    useEffect(() => {
        if (!exam || timeLeft <= 0) return;
        if (timeLeft === 1) { handleSubmit(); return; }
        const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
        return () => clearInterval(t);
    }, [timeLeft, exam]);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const startTime = (exam?.timeLimit || 30) * 60;
            const r = await fetch(`/api/exams/${examId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentUid: userData?.uid, answers, timeTaken: startTime - timeLeft }) });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            router.push(`/student/exam/${examId}/result`);
        } catch (e: any) { alert(e.message); setSubmitting(false); }
    }, [answers, timeLeft, submitting, examId, userData?.uid]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

    const mcqs = exam?.mcqs || [];
    const mcq = mcqs[currentQ];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const isLow = timeLeft < 120;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Timer Bar */}
            <div className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 ${isLow ? "bg-red-600" : "bg-[#0f172a]"} text-white transition-colors`}>
                <h2 className="font-bold text-sm truncate">{exam?.title}</h2>
                <div className="flex items-center gap-2 font-mono text-lg font-bold">
                    <Clock size={18} />
                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </div>
            </div>

            <div className="flex-1 pt-14 flex">
                {/* Question Panel */}
                <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto">
                    <div className="mb-6">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Question {currentQ + 1} of {mcqs.length}</span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-6">{mcq?.question}</h2>

                    <div className="space-y-3">
                        {mcq?.options?.map((opt: string, j: number) => (
                            <button key={j} onClick={() => setAnswers(p => ({ ...p, [currentQ]: j }))}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQ] === j ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}>
                                <span className="font-semibold mr-3">{String.fromCharCode(65 + j)}.</span>{opt}
                            </button>
                        ))}
                    </div>

                    {/* Nav */}
                    <div className="flex items-center justify-between mt-8">
                        <Button variant="outline" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="rounded-xl gap-2">
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        {currentQ < mcqs.length - 1 ? (
                            <Button onClick={() => setCurrentQ(p => p + 1)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                                Next <ChevronRight size={16} />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} isLoading={submitting} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
                                <Send size={16} /> Submit Exam
                            </Button>
                        )}
                    </div>
                </div>

                {/* Question Palette */}
                <div className="hidden md:block w-64 bg-white border-l border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Questions</p>
                    <div className="grid grid-cols-5 gap-2">
                        {mcqs.map((_: any, i: number) => (
                            <button key={i} onClick={() => setCurrentQ(i)}
                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                                    currentQ === i ? "bg-indigo-600 text-white" : answers[i] !== undefined ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                }`}>{i + 1}</button>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-100" /> Answered ({Object.keys(answers).length})</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-100" /> Unanswered ({mcqs.length - Object.keys(answers).length})</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
