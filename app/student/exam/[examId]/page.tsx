"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function StudentExamPage() {
    const { examId } = useParams() as { examId: string };
    const { userData } = useAuth();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [textAnswers, setTextAnswers] = useState("");
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    
    // Guest states
    const [guestName, setGuestName] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [guestUid, setGuestUid] = useState("");
    const [warnings, setWarnings] = useState(0);

    useEffect(() => {
        // Initialize guest uid
        if (typeof window !== "undefined") {
            let uid = localStorage.getItem(`exam_guest_uid_${examId}`);
            if (!uid) {
                uid = "guest_" + Math.random().toString(36).substring(2, 15);
                localStorage.setItem(`exam_guest_uid_${examId}`, uid);
            }
            setGuestUid(uid);
        }

        const fetchExam = async () => {
            try {
                const uidToCheck = userData?.uid || localStorage.getItem(`exam_guest_uid_${examId}`) || "";
                const res = await fetch(`/api/exams/${examId}?studentUid=${uidToCheck}`);
                const data = await res.json();

                if (!res.ok) {
                    setErrorMsg(data.error || "Failed to load exam.");
                    setLoading(false);
                    return;
                }

                if (data.submission) {
                    router.push(`/student/exam/${examId}/result`);
                    return;
                }

                setExam(data.exam);
                setTimeLeft((data.exam.timeLimit || 30) * 60);
            } catch (err: any) {
                setErrorMsg(err.message || "Something went wrong.");
            }
            setLoading(false);
        };
        fetchExam();
    }, [examId, userData]);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const startTime = (exam?.timeLimit || 30) * 60;
            const finalUid = userData?.uid || guestUid;
            const finalName = userData?.name || guestName || "Guest Student";

            const r = await fetch(`/api/exams/${examId}/submit`, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ 
                    studentUid: finalUid, 
                    studentName: finalName,
                    answers, 
                    textAnswers, // Keep for backwards compatibility with old unstructured papers
                    timeTaken: startTime - timeLeft 
                }) 
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            router.push(`/student/exam/${examId}/result`);
        } catch (e: any) { alert(e.message); setSubmitting(false); }
    }, [answers, textAnswers, timeLeft, submitting, examId, userData, guestUid, guestName, exam, router]);

    // Timer — only starts after exam is loaded AND started
    useEffect(() => {
        if (!exam || timeLeft <= 0 || !hasStarted) return;
        if (timeLeft === 1) { handleSubmit(); return; }
        const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
        return () => clearInterval(t);
    }, [timeLeft, exam, hasStarted, handleSubmit]);

    // Anti-cheat mechanisms
    useEffect(() => {
        if (!hasStarted) return;
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => {
                    const newWarnings = prev + 1;
                    if (newWarnings >= 2) {
                        alert("Exam auto-submitted due to multiple tab switches.");
                        handleSubmit();
                    } else {
                        alert("Warning: Do not switch tabs during the exam. One more warning and your exam will be auto-submitted.");
                    }
                    return newWarnings;
                });
            }
        };

        const blockKeys = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's')) {
                e.preventDefault();
            }
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText('');
                alert("Screenshots are disabled.");
            }
        };

        const blockContext = (e: MouseEvent) => e.preventDefault();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("keydown", blockKeys);
        document.addEventListener("contextmenu", blockContext);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("keydown", blockKeys);
            document.removeEventListener("contextmenu", blockContext);
        };
    }, [hasStarted, handleSubmit]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

    if (errorMsg) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
                <p className="text-slate-500">{errorMsg}</p>
                <Button onClick={() => router.push("/")} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                    Return to Home
                </Button>
            </div>
        </div>
    );

    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">{exam?.title}</h1>
                        <p className="text-slate-500">Please enter your name to begin the exam.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800">{exam?.type === "paper" ? "Subjective" : exam?.mcqs?.length}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{exam?.type === "paper" ? "Format" : "Questions"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800">{exam?.timeLimit}</p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Minutes</p>
                        </div>
                    </div>

                    {!userData?.uid && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input 
                                type="text" 
                                value={guestName} 
                                onChange={(e) => setGuestName(e.target.value)} 
                                placeholder="Enter your name" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all"
                                required
                            />
                        </div>
                    )}

                    <Button 
                        onClick={() => {
                            if (!userData?.uid && !guestName.trim()) {
                                alert("Please enter your name");
                                return;
                            }
                            setHasStarted(true);
                        }} 
                        className="w-full py-6 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    >
                        Start Exam
                    </Button>
                </div>
            </div>
        );
    }

    const mcqs = exam?.mcqs || [];
    const mcq = mcqs[currentQ];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const isLow = timeLeft < 120;

    if (exam?.type === "paper") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col select-none">
                {/* Timer Bar */}
                <div className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 ${isLow ? "bg-red-600" : "bg-[#0f172a]"} text-white transition-colors`}>
                    <h2 className="font-bold text-sm truncate">{exam?.title}</h2>
                    <div className="flex items-center gap-2 font-mono text-lg font-bold">
                        <Clock size={18} />
                        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                    </div>
                </div>

                <div className="pt-14 min-h-screen pb-20">
                    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                        {exam.structuredPaper ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-14 z-40">
                                    <h3 className="font-bold text-slate-800">Exam Questions</h3>
                                    <Button onClick={handleSubmit} isLoading={submitting} className="bg-indigo-600 hover:bg-indigo-700">Submit Exam</Button>
                                </div>
                                {exam.structuredPaper.instructions && (
                                    <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl border border-blue-100 shadow-sm">
                                        <h4 className="font-bold mb-2">Instructions</h4>
                                        <p className="text-sm">{exam.structuredPaper.instructions}</p>
                                    </div>
                                )}
                                {exam.structuredPaper.questions?.map((q: any, i: number) => (
                                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <p className="font-semibold text-slate-800 text-lg"><span className="text-indigo-600">Q{i + 1}.</span> {q.question}</p>
                                            {q.marks && <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded whitespace-nowrap">[{q.marks} Marks]</span>}
                                        </div>
                                        
                                        {q.type === "mcq" && q.options && (
                                            <div className="space-y-3">
                                                {q.options.map((opt: string, j: number) => (
                                                    <button 
                                                        key={j}
                                                        onClick={() => setAnswers(prev => ({ ...prev, [i]: j }))}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[i] === j ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[i] === j ? "border-indigo-600" : "border-slate-300"}`}>
                                                                {answers[i] === j && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                                            </div>
                                                            <span className={`text-sm md:text-base ${answers[i] === j ? "text-indigo-900 font-medium" : "text-slate-700"}`}>{opt}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "subjective" && (
                                            <div className="mt-4">
                                                <textarea 
                                                    value={answers[i] || ""} 
                                                    onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                                    className="w-full h-48 resize-y p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm leading-relaxed"
                                                    placeholder="Type your answer here..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Legacy Unstructured Paper Format */}
                                {/* Question Paper */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-12 overflow-hidden">
                                    <div className="notes-content prose prose-slate max-w-none prose-headings:font-serif prose-h1:text-xl lg:prose-h1:text-2xl prose-h2:text-lg lg:prose-h2:text-xl prose-h3:text-base lg:prose-h3:text-lg text-sm lg:text-base">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{exam.content}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Answer Box */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[60vh] min-h-[400px]">
                                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0">
                                        <h3 className="font-bold text-slate-800">Your Answers</h3>
                                        <Button onClick={handleSubmit} isLoading={submitting} className="bg-indigo-600 hover:bg-indigo-700">Submit Exam</Button>
                                    </div>
                                    <div className="flex-1">
                                        <textarea 
                                            value={textAnswers} 
                                            onChange={e => setTextAnswers(e.target.value)} 
                                            className="w-full h-full resize-none p-6 outline-none font-mono text-sm leading-relaxed text-slate-700 bg-white"
                                            placeholder="Type your answers here...&#10;&#10;e.g.&#10;Q1: My answer...&#10;Q2: Another answer..."
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                <style jsx global>{`
                    .notes-content { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
                    .notes-content h1 { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.75rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; padding-bottom: 0.75rem; margin-bottom: 1.5rem; border-bottom: 3px solid #e2e8f0; }
                    .notes-content h2 { font-family: 'Playfair Display', serif; font-weight: 700; color: #0f172a; margin-top: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
                    .notes-content h3 { font-family: 'Playfair Display', serif; font-weight: 600; color: #334155; margin-top: 1.5rem; }
                    .notes-content p { margin-bottom: 1rem; }
                    .notes-content ul, .notes-content ol { margin-left: 1.5rem; margin-bottom: 1rem; }
                    .notes-content li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
                    .notes-content strong { color: #0f172a; font-weight: 700; }
                    .notes-content blockquote { border-left: 4px solid #818cf8; background: #eef2ff; padding: 1rem 1.5rem; border-radius: 0 0.5rem 0.5rem 0; font-style: italic; color: #4338ca; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col select-none">
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
