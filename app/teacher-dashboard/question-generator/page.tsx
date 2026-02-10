"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronRight, Plus, Trash2, Sparkles, AlertCircle, FileText, CheckCircle, Download, Save } from "lucide-react";
import { collection, query, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

interface Unit {
    id: string;
    name: string;
}

interface Section {
    id: string;
    name: string;
    type: string;
    count: number;
    marksPerQuestion: number;
}

export default function TeacherQuestionGenerator() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    // Steps: 1=Setup, 2=Units, 3=Weightage, 4=Pattern, 5=Preview
    const [step, setStep] = useState(1);

    // Data State
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [subjectUnits, setSubjectUnits] = useState<Unit[]>([]);

    // Setup State
    const [paperTitle, setPaperTitle] = useState("");
    const [duration, setDuration] = useState("120"); // minutes

    // Unit Selection & Weightage
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [unitWeights, setUnitWeights] = useState<Record<string, number>>({});

    // Pattern State
    const [sections, setSections] = useState<Section[]>([
        { id: "1", name: "Section A", type: "Multiple Choice", count: 5, marksPerQuestion: 1 },
        { id: "2", name: "Section B", type: "Short Answer", count: 3, marksPerQuestion: 2 },
    ]);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPaper, setGeneratedPaper] = useState("");
    const [error, setError] = useState("");

    const contentRef = useRef<HTMLDivElement>(null);

    // Derived State
    const totalMarks = sections.reduce((acc, sec) => acc + (sec.count * sec.marksPerQuestion), 0);
    const totalWeight = selectedUnitIds.reduce((acc, id) => acc + (unitWeights[id] || 0), 0);

    useEffect(() => {
        if (!loading && !user) router.push("/login");
        if (userData && userData.plan !== 'teacher') router.push("/dashboard");
        if (user) fetchSubjects();
    }, [user, userData, loading]);

    useEffect(() => {
        if (selectedSubject) fetchUnits(selectedSubject);
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        if (!user) return;
        const q = query(collection(db, "users", user.uid, "custom_subjects"));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchUnits = async (subjectId: string) => {
        if (!user) return;
        const q = query(collection(db, "users", user.uid, "custom_subjects", subjectId, "units"));
        const snap = await getDocs(q);
        setSubjectUnits(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        setSelectedUnitIds([]);
        setUnitWeights({});
    };

    // Weightage Logic
    const distributeWeights = () => {
        const count = selectedUnitIds.length;
        if (count === 0) return;
        const equal = Math.floor(100 / count);
        const remainder = 100 % count;
        const newWeights: Record<string, number> = {};
        selectedUnitIds.forEach((id, i) => {
            newWeights[id] = equal + (i < remainder ? 1 : 0);
        });
        setUnitWeights(newWeights);
    };

    // Pattern Logic
    const addSection = () => {
        setSections([...sections, {
            id: Date.now().toString(),
            name: `Section ${String.fromCharCode(65 + sections.length)}`,
            type: "Short Answer",
            count: 1,
            marksPerQuestion: 2
        }]);
    };

    const removeSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, field: keyof Section, value: any) => {
        setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleGenerate = async () => {
        if (totalWeight !== 100) {
            setError("Total weightage must be 100%");
            return;
        }
        setIsGenerating(true);
        setError("");

        try {
            const selectedUnitNames = subjectUnits
                .filter(u => selectedUnitIds.includes(u.id))
                .map(u => ({ name: u.name, weight: unitWeights[u.id] }));

            const res = await fetch("/api/teacher-generate-paper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subjects.find(s => s.id === selectedSubject)?.name,
                    units: selectedUnitNames,
                    pattern: sections,
                    totalMarks,
                    title: paperTitle || `Unit Test - ${subjects.find(s => s.id === selectedSubject)?.name}`,
                    duration
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");

            setGeneratedPaper(data.content);
            setStep(5); // Go to Preview

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPDF = async () => {
        if (!contentRef.current) return;
        const canvas = await html2canvas(contentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("question-paper.pdf");
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => step === 1 ? router.push("/teacher-dashboard") : setStep(step - 1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Question Paper Generator</h1>
                        <p className="text-slate-500">Teacher Mode • Step {step} of 5</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <GlassCard className="p-8 space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-indigo-600" /> Paper Details
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Subject</label>
                                            <select
                                                className="w-full p-3 rounded-lg border border-slate-300 bg-white"
                                                value={selectedSubject}
                                                onChange={(e) => setSelectedSubject(e.target.value)}
                                            >
                                                <option value="">-- Select Subject --</option>
                                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                                            </select>
                                        </div>
                                        <Input
                                            label="Paper Title"
                                            placeholder="e.g. Mid-Term Examination 2024"
                                            value={paperTitle}
                                            onChange={(e) => setPaperTitle(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Duration (Minutes)"
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                            />
                                            {/* Marks are calculated automatically later */}
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={() => setStep(2)} disabled={!selectedSubject}>
                                            Next: Select Units <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </GlassCard>
                            )}

                            {step === 2 && (
                                <GlassCard className="p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-slate-800">Select Units</h2>
                                        <div className="space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedUnitIds(subjectUnits.map(u => u.id))}>Select All</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedUnitIds([])}>Clear</Button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
                                        {subjectUnits.length > 0 ? subjectUnits.map(unit => (
                                            <label key={unit.id} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedUnitIds.includes(unit.id) ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnitIds.includes(unit.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedUnitIds([...selectedUnitIds, unit.id]);
                                                            else setSelectedUnitIds(selectedUnitIds.filter(id => id !== unit.id));
                                                        }}
                                                        className="h-5 w-5 text-indigo-600 rounded"
                                                    />
                                                    <span className="font-medium text-slate-700">{unit.name}</span>
                                                </div>
                                            </label>
                                        )) : (
                                            <p className="text-slate-500 col-span-2 text-center py-10">No units found. Please add units to this subject first.</p>
                                        )}
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={() => { distributeWeights(); setStep(3); }} disabled={selectedUnitIds.length === 0}>
                                            Next: Weightage <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </GlassCard>
                            )}

                            {step === 3 && (
                                <GlassCard className="p-8 space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800">Unit Weightage (Total: {totalWeight}%)</h2>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {selectedUnitIds.map(id => {
                                            const unit = subjectUnits.find(u => u.id === id);
                                            return (
                                                <div key={id} className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-medium text-slate-700">{unit?.name}</span>
                                                        <span className="font-bold text-indigo-600">{unitWeights[id] || 0}%</span>
                                                    </div>
                                                    <input
                                                        type="range" min="0" max="100"
                                                        value={unitWeights[id] || 0}
                                                        onChange={(e) => setUnitWeights({ ...unitWeights, [id]: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {totalWeight !== 100 && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                            <AlertCircle className="h-4 w-4" /> Total weightage must equal 100%. Current: {totalWeight}%
                                        </div>
                                    )}
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={() => setStep(4)} disabled={totalWeight !== 100}>
                                            Next: Pattern <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </GlassCard>
                            )}

                            {step === 4 && (
                                <GlassCard className="p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-slate-800">Exam Pattern</h2>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Total Marks</p>
                                            <p className="text-2xl font-bold text-indigo-600">{totalMarks}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {sections.map((section, idx) => (
                                            <div key={section.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600 p-1">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="grid md:grid-cols-4 gap-4">
                                                    <div className="md:col-span-1">
                                                        <label className="text-xs text-slate-500 block mb-1">Section Name</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm font-bold border-none p-0 focus:ring-0 text-slate-800"
                                                            value={section.name}
                                                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="text-xs text-slate-500 block mb-1">Question Type</label>
                                                        <select
                                                            className="w-full text-sm p-1 bg-slate-50 rounded border border-slate-200"
                                                            value={section.type}
                                                            onChange={(e) => updateSection(section.id, 'type', e.target.value)}
                                                        >
                                                            <option>Multiple Choice</option>
                                                            <option>Fill in the Blanks</option>
                                                            <option>True/False</option>
                                                            <option>One Sentence</option>
                                                            <option>Short Answer</option>
                                                            <option>Long Answer</option>
                                                            <option>Diagram/Map</option>
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="text-xs text-slate-500 block mb-1">Count</label>
                                                        <input
                                                            type="number" min="1"
                                                            className="w-full text-sm p-1 bg-slate-50 rounded border border-slate-200"
                                                            value={section.count}
                                                            onChange={(e) => updateSection(section.id, 'count', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <label className="text-xs text-slate-500 block mb-1">Marks Each</label>
                                                        <input
                                                            type="number" min="1"
                                                            className="w-full text-sm p-1 bg-slate-50 rounded border border-slate-200"
                                                            value={section.marksPerQuestion}
                                                            onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-400 text-right">
                                                    Subtotal: {section.count * section.marksPerQuestion} Marks
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full border-dashed" onClick={addSection}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Section
                                        </Button>
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

                                    <div className="pt-4 flex justify-end">
                                        <Button size="lg" onClick={handleGenerate} isLoading={isGenerating}>
                                            <Sparkles className="mr-2 h-5 w-5" /> Generate Paper
                                        </Button>
                                    </div>
                                </GlassCard>
                            )}

                            {step === 5 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <Button variant="outline" onClick={() => setStep(4)}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Edit Pattern
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={downloadPDF}>
                                                <Download className="mr-2 h-4 w-4" /> Download PDF
                                            </Button>
                                            <Button>
                                                <Save className="mr-2 h-4 w-4" /> Save to Library
                                            </Button>
                                        </div>
                                    </div>

                                    <GlassCard className="bg-white p-8 min-h-[800px] shadow-2xl">
                                        <div ref={contentRef} className="prose max-w-none prose-slate">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                {generatedPaper}
                                            </ReactMarkdown>
                                        </div>
                                    </GlassCard>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar / Summary */}
                    <div className="hidden md:block space-y-6">
                        <GlassCard className="p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4">Paper Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subject</span>
                                    <span className="font-medium text-slate-900">{subjects.find(s => s.id === selectedSubject)?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Units</span>
                                    <span className="font-medium text-slate-900">{selectedUnitIds.length} Selected</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Marks</span>
                                    <span className="font-medium text-slate-900">{totalMarks}</span>
                                </div>
                                <div className="h-px bg-slate-200 my-2"></div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Pattern</p>
                                    {sections.map(s => (
                                        <div key={s.id} className="flex justify-between text-xs text-slate-600">
                                            <span>{s.name} ({s.type})</span>
                                            <span>{s.count}x{s.marksPerQuestion} = {s.count * s.marksPerQuestion}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </main>
    );
}
