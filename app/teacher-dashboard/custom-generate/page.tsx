"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, FileText, ClipboardList, Sparkles, ArrowLeft, Download, Loader2, Save, CheckCircle2, Share2, Copy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const PIPELINE_STEPS = [
    { key: "analyzing", label: "Analyzing Content" },
    { key: "outlining", label: "Designing Architecture" },
    { key: "generating", label: "Generating Sections" },
    { key: "humanizing", label: "Humanizing Tone" },
    { key: "enhancing", label: "Visual Enhancement" },
    { key: "diagrams", label: "Creating Diagrams" },
    { key: "assembling", label: "Final Assembly" },
];

function CustomGenerateContent() {
    const { userData, user } = useAuth();
    const searchParams = useSearchParams();
    const contentRef = useRef<HTMLDivElement>(null);

    const preSubjectId = searchParams.get("subjectId") || "";
    const preUnitId = searchParams.get("unitId") || "";
    const preType = searchParams.get("type") || "";

    const [subjects, setSubjects] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState(preSubjectId);
    const [selectedUnits, setSelectedUnits] = useState<string[]>(preUnitId ? [preUnitId] : []);
    const [genType, setGenType] = useState<"notes" | "paper" | "mcqs">(preType as any || "notes");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState("");
    const [mcqResult, setMcqResult] = useState<any[]>([]);
    const [savedNoteId, setSavedNoteId] = useState("");
    const [pipelineStep, setPipelineStep] = useState(0);
    const [publishedExamLink, setPublishedExamLink] = useState("");
    const [publishingExam, setPublishingExam] = useState(false);

    const [notesType, setNotesType] = useState("detailed");
    const [questionType, setQuestionType] = useState("Mixed");
    const [difficulty, setDifficulty] = useState("medium");
    const [marks, setMarks] = useState(50);
    const [duration, setDuration] = useState(60);
    const [mcqCount, setMcqCount] = useState(10);
    const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
    const [examTitle, setExamTitle] = useState("");

    useEffect(() => { if (userData?.uid) fetchSubjects(); }, [userData?.uid]);
    useEffect(() => { if (selectedSubject) fetchUnits(selectedSubject); }, [selectedSubject]);

    const fetchSubjects = async () => {
        const q = query(collection(db, "customSubjects"), where("teacherUid", "==", userData?.uid));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchUnits = async (subjectId: string) => {
        const snap = await getDocs(collection(db, "customSubjects", subjectId, "units"));
        setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const toggleUnit = (unitId: string) => {
        setSelectedUnits(prev => prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]);
    };

    const handleGenerate = async () => {
        if (!selectedSubject || selectedUnits.length === 0) { alert("Select a subject and units."); return; }
        setGenerating(true); setResult(""); setMcqResult([]); setSavedNoteId(""); setPipelineStep(0); setPublishedExamLink("");

        const subjectName = subjects.find(s => s.id === selectedSubject)?.name || "Custom Subject";

        try {
            if (genType === "notes") {
                // Use premium 7-step pipeline
                setPipelineStep(1);
                const progressInterval = setInterval(() => {
                    setPipelineStep(prev => prev < 6 ? prev + 1 : prev);
                }, 12000); // Advance progress every ~12s as estimate

                const res = await fetch("/api/premium-notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subjectId: selectedSubject, unitIds: selectedUnits,
                        subjectName, difficulty, teacherUid: userData?.uid
                    }),
                });
                clearInterval(progressInterval);
                setPipelineStep(7);

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setResult(data.content || "");
                setSavedNoteId(data.noteId || "");
            } else {
                // Paper or MCQs — use existing endpoints + save to repo
                const endpoint = genType === "paper" ? "/api/custom-generate/paper" : "/api/custom-generate/mcqs";
                const body: any = { subjectId: selectedSubject, unitIds: selectedUnits, subjectName, difficulty };
                if (genType === "paper") { body.marks = marks; body.duration = duration; body.questionType = questionType; body.includeAnswerKey = includeAnswerKey; }
                if (genType === "mcqs") body.mcqCount = mcqCount;

                const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                if (genType === "mcqs" && data.mcqs) {
                    setMcqResult(data.mcqs);
                } else {
                    setResult(data.content || "");
                    // Auto-save paper to repository
                    if (user && data.content) {
                        try {
                            await addDoc(collection(db, "users", user.uid, "papers"), {
                                subject: subjectName, grade: subjects.find(s => s.id === selectedSubject)?.grade || "",
                                board: "Custom", chapter: units.filter(u => selectedUnits.includes(u.id)).map((u: any) => u.title).join(", "),
                                totalMarks: marks, difficulty, content: data.content, source: "the_teacher",
                                createdAt: serverTimestamp()
                            });
                        } catch (e) { console.warn("Save failed:", e); }
                    }
                }
            }
        } catch (err: any) { alert("Generation failed: " + err.message); } finally { setGenerating(false); }
    };

    const handlePublishExam = async () => {
        if (!selectedSubject) return;
        if (genType === "mcqs" && mcqResult.length === 0) return;
        if (genType === "paper" && !result) return;
        
        setPublishingExam(true);
        try {
            const subjectName = subjects.find(s => s.id === selectedSubject)?.name || "Subject";
            const finalTitle = examTitle.trim() ? examTitle : `${subjectName} - Auto Generated Exam`;
            
            // 1. Create exam draft
            const createRes = await fetch("/api/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherUid: userData?.uid,
                    classroomId: "", // Open link access
                    subjectId: selectedSubject,
                    title: finalTitle,
                    type: genType === "paper" ? "paper" : "mcq",
                    content: genType === "paper" ? result : "",
                    mcqs: genType === "mcqs" ? mcqResult : [],
                    totalQuestions: genType === "mcqs" ? mcqResult.length : 1,
                    difficulty,
                    timeLimit: genType === "paper" ? duration : mcqCount * 2,
                }),
            });
            const createData = await createRes.json();
            if (!createRes.ok) throw new Error(createData.error);
            const examId = createData.id;

            // 2. Publish it immediately
            const pubRes = await fetch(`/api/exams/${examId}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classroomId: "", teacherUid: userData?.uid }),
            });
            const pubData = await pubRes.json();
            if (!pubRes.ok) throw new Error(pubData.error);

            // 3. Set the link
            const link = `${window.location.origin}/student/exam/${examId}`;
            setPublishedExamLink(link);
        } catch (err: any) {
            alert("Failed to publish exam: " + err.message);
        } finally {
            setPublishingExam(false);
        }
    };

    const handlePrint = () => { window.print(); };

    const genTypes = [
        { id: "notes" as const, label: "Notes", icon: BookOpen, color: "emerald" },
        { id: "paper" as const, label: "Paper", icon: FileText, color: "indigo" },
        { id: "mcqs" as const, label: "MCQs", icon: ClipboardList, color: "purple" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Content Generator" />
            <main className="p-8 space-y-8 max-w-6xl">
                <div>
                    <Link href="/teacher-dashboard/custom-subjects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Subjects
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Generate from Your Content</h1>
                    <p className="text-slate-500 mt-1">AI generates strictly from your uploaded materials. Notes use a premium 7-step pipeline.</p>
                </div>

                {/* Type tabs */}
                <div className="flex gap-3">
                    {genTypes.map(t => (
                        <button key={t.id} onClick={() => {
                            setGenType(t.id);
                            setResult("");
                            setMcqResult([]);
                            setSavedNoteId("");
                            setPublishedExamLink("");
                            setPipelineStep(0);
                        }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                genType === t.id
                                    ? t.color === "emerald" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                    : t.color === "indigo" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                    : "text-slate-500 hover:text-slate-700 bg-white border border-slate-200"
                            }`}>
                            <t.icon size={16} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Config Panel */}
                    <GlassCard className="lg:col-span-1 p-6 space-y-5 h-fit print:hidden">
                        <h3 className="font-bold text-slate-900">Configuration</h3>

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
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {units.filter(u => u.knowledgeExtracted).map(u => (
                                        <label key={u.id} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                            selectedUnits.includes(u.id) ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"
                                        }`}>
                                            <input type="checkbox" checked={selectedUnits.includes(u.id)} onChange={() => toggleUnit(u.id)} className="rounded" />
                                            <span className="text-sm">{u.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {genType === "paper" && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Question Type</label>
                                    <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm">
                                        <option value="Mixed">Mixed</option><option value="MCQ">MCQ Only</option><option value="Theory">Theory Only</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-sm font-medium text-slate-700 mb-1 block">Marks</label>
                                        <input type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" /></div>
                                    <div><label className="text-sm font-medium text-slate-700 mb-1 block">Duration</label>
                                        <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" /></div>
                                </div>
                                <div className="flex items-center gap-2 p-3 mt-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="answerKey"
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        checked={includeAnswerKey}
                                        onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                                    />
                                    <label htmlFor="answerKey" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                        Include Answer Key
                                    </label>
                                </div>
                            </>
                        )}
                        {genType === "mcqs" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">MCQ Count</label>
                                    <input type="number" value={mcqCount} onChange={(e) => setMcqCount(Number(e.target.value))} min={5} max={50} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Exam Title (Optional)</label>
                                    <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Unit 1 Checkpoint" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>
                        )}
                        {genType === "paper" && (
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Exam Title (Optional)</label>
                                <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Term 1 Exam" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500 transition-colors" />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Difficulty</label>
                            <div className="flex gap-2">
                                {["easy", "medium", "hard"].map(d => (
                                    <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${difficulty === d ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{d}</button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleGenerate} isLoading={generating} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 py-3" disabled={!selectedSubject || selectedUnits.length === 0}>
                            <Sparkles size={18} /> {genType === "notes" ? "Generate Premium Notes" : genType === "paper" ? "Generate Paper" : "Generate MCQs"}
                        </Button>

                        {/* Pipeline Progress */}
                        {generating && genType === "notes" && (
                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Progress</p>
                                {PIPELINE_STEPS.map((s, i) => (
                                    <div key={s.key} className={`flex items-center gap-2.5 text-xs transition-all ${i + 1 <= pipelineStep ? "text-indigo-700 font-medium" : "text-slate-400"}`}>
                                        {i + 1 < pipelineStep ? <CheckCircle2 size={14} className="text-emerald-500" /> :
                                         i + 1 === pipelineStep ? <Loader2 size={14} className="animate-spin text-indigo-600" /> :
                                         <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                                        <span>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>

                    {/* Result Panel */}
                    <GlassCard className="lg:col-span-2 p-0 min-h-[400px] overflow-hidden">
                        {/* Action bar */}
                        {(result || mcqResult.length > 0) && !generating && (
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    {savedNoteId && <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle2 size={14} /> Saved to Repository</span>}
                                    {publishedExamLink && <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle2 size={14} /> Exam Published</span>}
                                </div>
                                <div className="flex gap-2">
                                    {savedNoteId && (
                                        <Link href={`/teacher-dashboard/note/${savedNoteId}`}>
                                            <Button variant="outline" className="rounded-lg text-xs gap-1.5 py-1.5 px-3"><BookOpen size={14} /> View in Repo</Button>
                                        </Link>
                                    )}
                                    
                                    {genType === "mcqs" || genType === "paper" ? (
                                        publishedExamLink ? (
                                            <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-lg pl-3 pr-1 py-1">
                                                <span className="text-xs text-indigo-700 font-medium select-all truncate max-w-[200px]">{publishedExamLink}</span>
                                                <Button onClick={() => { navigator.clipboard.writeText(publishedExamLink); alert("Link copied to clipboard!"); }} className="h-6 w-6 p-0 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200" title="Copy Link">
                                                    <Copy size={12} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                {genType === "paper" && (
                                                    <Button variant="outline" onClick={handlePrint} className="rounded-lg text-xs gap-1.5 py-1.5 px-3"><Download size={14} /> Print / PDF</Button>
                                                )}
                                                <Button onClick={handlePublishExam} isLoading={publishingExam} className="rounded-lg text-xs gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700">
                                                    <Share2 size={14} /> Publish as Shareable Exam
                                                </Button>
                                            </div>
                                        )
                                    ) : (
                                        <Button variant="outline" onClick={handlePrint} className="rounded-lg text-xs gap-1.5 py-1.5 px-3"><Download size={14} /> Print / PDF</Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-6" ref={contentRef}>
                            {generating ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <Loader2 className="text-indigo-600 animate-spin" size={40} />
                                    <p className="text-slate-600 font-medium">{genType === "notes" ? "Running premium 7-step pipeline..." : "AI is generating..."}</p>
                                    <p className="text-xs text-slate-400">{genType === "notes" ? "This takes 1-3 minutes for maximum quality" : "This may take up to a minute"}</p>
                                </div>
                            ) : result ? (
                                <div className="notes-content prose prose-slate max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{result}</ReactMarkdown>
                                </div>
                            ) : mcqResult.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-900 font-serif text-lg">Generated MCQs ({mcqResult.length})</h3>
                                    {mcqResult.map((mcq, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="font-semibold text-slate-800 mb-3"><span className="text-indigo-600">Q{i + 1}.</span> {mcq.question}</p>
                                            <div className="space-y-1.5 ml-4">
                                                {mcq.options?.map((opt: string, j: number) => (
                                                    <p key={j} className={`text-sm ${j === mcq.correctAnswer ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>{j === mcq.correctAnswer ? "✅ " : ""}{opt}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Sparkles className="text-slate-300 mb-4" size={48} />
                                    <h3 className="text-lg font-bold text-slate-400 font-serif">Ready to Generate</h3>
                                    <p className="text-sm text-slate-400 mt-1 max-w-xs">Select a subject and units. Notes use a premium 7-step AI pipeline for coaching-institute quality.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </main>

            {/* Notes styling (same as note viewer) */}
            <style jsx global>{`
                .notes-content { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.8; color: #1e293b; }
                .notes-content h1 { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1.75rem; background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; padding-bottom: 0.75rem; margin-bottom: 1.5rem; border-bottom: 3px solid #e2e8f0; }
                .notes-content h2 { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.35rem; color: #4f46e5; margin-top: 2.5rem; margin-bottom: 1rem; padding-left: 14px; border-left: 4px solid #818cf8; }
                .notes-content h3 { font-family: 'Source Serif 4', serif; font-weight: 600; font-size: 1.1rem; color: #334155; margin-top: 1.75rem; margin-bottom: 0.75rem; padding: 6px 12px; background: linear-gradient(90deg, #f1f5f9, transparent); border-radius: 6px; border-left: 3px solid #6366f1; }
                .notes-content blockquote { background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); border-left: 4px solid #818cf8; padding: 16px 20px; margin: 20px 0; border-radius: 0 12px 12px 0; font-style: normal; color: #475569; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08); }
                .notes-content blockquote strong { color: #4f46e5; }
                .notes-content strong { color: #1e1b4b; font-weight: 700; background: linear-gradient(180deg, transparent 60%, #fef9c3 60%); padding: 0 2px; }
                .notes-content em { color: #6366f1; font-style: italic; font-weight: 500; }
                .notes-content ul { list-style: none; padding-left: 0; }
                .notes-content ul li { position: relative; padding-left: 24px; margin-bottom: 8px; }
                .notes-content ul li::before { content: '▸'; position: absolute; left: 4px; color: #6366f1; font-weight: bold; }
                .notes-content ol { padding-left: 0; counter-reset: step-counter; }
                .notes-content ol li { counter-increment: step-counter; position: relative; padding-left: 36px; margin-bottom: 10px; list-style: none; }
                .notes-content ol li::before { content: counter(step-counter); position: absolute; left: 0; top: 2px; width: 24px; height: 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
                .notes-content table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 20px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .notes-content th { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 14px 16px; text-align: left; font-weight: 600; font-size: 0.875rem; }
                .notes-content td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; }
                .notes-content tr:nth-child(even) td { background-color: #faf8ff; }
                .notes-content code { font-family: 'JetBrains Mono', monospace; background: #1e1b4b; color: #c7d2fe; padding: 3px 8px; border-radius: 6px; font-size: 0.85em; }
                .notes-content pre { background: linear-gradient(145deg, #1e1b4b, #312e81); color: #c7d2fe; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 16px 0; }
                .notes-content pre code { background: none; padding: 0; color: inherit; }
                .notes-content hr { border: none; height: 2px; background: linear-gradient(90deg, transparent, #c7d2fe, transparent); margin: 2rem 0; }
                .notes-content p { margin-bottom: 0.75rem; line-height: 1.85; }
                @media print { .print\\:hidden { display: none !important; } body { background: white; } .notes-content { font-size: 11pt; } .notes-content h1 { -webkit-text-fill-color: #4f46e5; } }
            `}</style>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        </div>
    );
}

export default function CustomGeneratePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
            <CustomGenerateContent />
        </Suspense>
    );
}
