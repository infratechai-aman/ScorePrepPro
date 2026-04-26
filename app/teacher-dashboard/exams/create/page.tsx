"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowLeft, Trash2, RefreshCw, Loader2, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function CreateExamPage() {
    const { userData } = useAuth();
    const router = useRouter();

    const [subjects, setSubjects] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [title, setTitle] = useState("");
    const [mcqCount, setMcqCount] = useState(10);
    const [difficulty, setDifficulty] = useState("medium");
    const [timeLimit, setTimeLimit] = useState(30);
    const [mcqs, setMcqs] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);

    useEffect(() => {
        if (userData?.uid) {
            fetchSubjects();
            fetchClassrooms();
        }
    }, [userData?.uid]);

    useEffect(() => {
        if (selectedSubject) fetchUnits();
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        const q = query(collection(db, "customSubjects"), where("teacherUid", "==", userData?.uid));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchUnits = async () => {
        const snap = await getDocs(collection(db, "customSubjects", selectedSubject, "units"));
        setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchClassrooms = async () => {
        const q = query(collection(db, "classrooms"), where("teacherUid", "==", userData?.uid));
        const snap = await getDocs(q);
        setClassrooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handleGenerate = async () => {
        if (selectedUnits.length === 0) {
            alert("Please select at least one unit.");
            return;
        }

        setGenerating(true);
        try {
            const subjectName = subjects.find(s => s.id === selectedSubject)?.name || "";
            const res = await fetch("/api/custom-generate/mcqs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjectId: selectedSubject,
                    unitIds: selectedUnits,
                    subjectName,
                    difficulty,
                    mcqCount,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMcqs(data.mcqs || []);
            setStep(2);
        } catch (err: any) {
            alert("Generation failed: " + err.message);
        } finally {
            setGenerating(false);
        }
    };

    const removeMcq = (index: number) => {
        setMcqs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter an exam title.");
            return;
        }
        if (mcqs.length === 0) {
            alert("No questions to save.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherUid: userData?.uid,
                    classroomId: selectedClassroom,
                    subjectId: selectedSubject,
                    title,
                    mcqs,
                    totalQuestions: mcqs.length,
                    difficulty,
                    timeLimit,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push(`/teacher-dashboard/exams/${data.id}`);
        } catch (err: any) {
            alert("Failed to save: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Create Exam" />

            <main className="p-8 space-y-8 max-w-4xl">
                <Link href="/teacher-dashboard/exams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Exams
                </Link>

                {/* Step indicator */}
                <div className="flex items-center gap-3">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                step >= s ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                            }`}>{s}</div>
                            <span className={`text-sm font-medium ${step >= s ? "text-slate-700" : "text-slate-400"}`}>
                                {s === 1 ? "Configure" : s === 2 ? "Review MCQs" : "Publish"}
                            </span>
                            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-indigo-600" : "bg-slate-200"}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Configure */}
                {step === 1 && (
                    <GlassCard className="p-6 space-y-5">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Configure Exam</h2>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Exam Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-200"
                                placeholder="e.g., Unit Test 1 - Python Basics" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject</label>
                            <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setSelectedUnits([]); }}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                                <option value="">Select subject...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {units.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Units</label>
                                <div className="space-y-2">
                                    {units.filter(u => u.knowledgeExtracted).map(u => (
                                        <label key={u.id} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                            selectedUnits.includes(u.id) ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"
                                        }`}>
                                            <input type="checkbox" checked={selectedUnits.includes(u.id)}
                                                onChange={() => setSelectedUnits(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                                className="rounded" />
                                            <span className="text-sm">{u.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">MCQ Count</label>
                                <input type="number" value={mcqCount} onChange={(e) => setMcqCount(Number(e.target.value))}
                                    min={5} max={50} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Time (min)</label>
                                <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulty</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Assign to Classroom (optional)</label>
                            <select value={selectedClassroom} onChange={(e) => setSelectedClassroom(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                                <option value="">No classroom (assign later)</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>

                        <Button onClick={handleGenerate} isLoading={generating} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 py-3"
                            disabled={!selectedSubject || selectedUnits.length === 0}>
                            <Sparkles size={18} /> Generate MCQs with AI
                        </Button>
                    </GlassCard>
                )}

                {/* Step 2: Review MCQs */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Review Questions ({mcqs.length})</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">Back</Button>
                                <Button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                                    Continue →
                                </Button>
                            </div>
                        </div>

                        {mcqs.map((mcq, i) => (
                            <GlassCard key={i} className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <p className="font-semibold text-slate-800">
                                        <span className="text-indigo-600">Q{i + 1}.</span> {mcq.question}
                                    </p>
                                    <button onClick={() => removeMcq(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="space-y-1.5 ml-4">
                                    {mcq.options?.map((opt: string, j: number) => (
                                        <p key={j} className={`text-sm ${j === mcq.correctAnswer ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
                                            {j === mcq.correctAnswer ? "✅ " : ""}{opt}
                                        </p>
                                    ))}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* Step 3: Save */}
                {step === 3 && (
                    <GlassCard className="p-6 space-y-5">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Save Exam</h2>

                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                            <p className="text-sm"><span className="font-medium text-slate-700">Title:</span> {title || "Untitled Exam"}</p>
                            <p className="text-sm"><span className="font-medium text-slate-700">Questions:</span> {mcqs.length} MCQs</p>
                            <p className="text-sm"><span className="font-medium text-slate-700">Time Limit:</span> {timeLimit} minutes</p>
                            <p className="text-sm"><span className="font-medium text-slate-700">Difficulty:</span> {difficulty}</p>
                            <p className="text-sm"><span className="font-medium text-slate-700">Classroom:</span> {classrooms.find(c => c.id === selectedClassroom)?.name || "Not assigned"}</p>
                        </div>

                        <p className="text-xs text-slate-500">The exam will be saved as a <strong>draft</strong>. You can publish it from the exam detail page.</p>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">Back</Button>
                            <Button onClick={handleSave} isLoading={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                                <Save size={16} /> Save as Draft
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </main>
        </div>
    );
}
