"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, FileText, Settings, Download, RefreshCw } from "lucide-react";
import { collection, query, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import jsPDF from "jspdf";

export default function CustomGeneratorPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [units, setUnits] = useState<any[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

    // Configuration
    const [totalMarks, setTotalMarks] = useState(20);
    const [difficulty, setDifficulty] = useState("Medium");
    const [questionType, setQuestionType] = useState("Mixed"); // MCQ, Subjective, Mixed

    // Output
    const [paperData, setPaperData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [flippingQuestionId, setFlippingQuestionId] = useState<number | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            fetchSubjects();
        }
    }, [user, loading]);

    const fetchSubjects = async () => {
        if (!user) return;
        const q = query(collection(db, "users", user.uid, "custom_subjects"));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchUnits = async (subjectId: string) => {
        if (!user || !subjectId) return;
        const q = query(collection(db, "users", user.uid, "custom_subjects", subjectId, "units"));
        const snap = await getDocs(q);
        setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubject(subjectId);
        setSelectedUnits([]);
        fetchUnits(subjectId);
    };

    const toggleUnit = (unitId: string) => {
        setSelectedUnits(prev =>
            prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
        );
    };

    const handleGenerate = async () => {
        if (!selectedSubject || selectedUnits.length === 0) {
            alert("Please select a subject and at least one unit.");
            return;
        }

        setIsGenerating(true);
        try {
            // Get names of selected units
            const unitNames = units.filter(u => selectedUnits.includes(u.id)).map(u => u.name);
            const subjectName = subjects.find(s => s.id === selectedSubject)?.name;

            const response = await fetch("/api/generate-custom-paper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subjectName,
                    units: unitNames,
                    marks: totalMarks,
                    difficulty,
                    type: questionType
                })
            });

            const data = await response.json();
            if (data.paper) {
                setPaperData(data.paper);
                // Auto-save logic here
            } else {
                alert("Generation failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFlipQuestion = async (index: number, question: any) => {
        setFlippingQuestionId(index);
        try {
            // Get names of selected units (for context)
            const unitNames = units.filter(u => selectedUnits.includes(u.id)).map(u => u.name);
            const subjectName = subjects.find(s => s.id === selectedSubject)?.name;

            const response = await fetch("/api/flip-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subjectName || "General",
                    unit: unitNames[0] || "General", // Sending first unit as context for now
                    oldQuestion: question,
                    type: question.type,
                    marks: question.marks
                })
            });
            const data = await response.json();
            if (data.newQuestion) {
                const updatedQuestions = [...paperData.questions];
                updatedQuestions[index] = { ...data.newQuestion, id: question.id, section: question.section };
                setPaperData({ ...paperData, questions: updatedQuestions });
            }
        } catch (error) {
            console.error("Error flipping question:", error);
        } finally {
            setFlippingQuestionId(null);
        }
    };

    const handleDownloadPDF = () => {
        if (!paperData) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(paperData.title || "Question Paper", 10, 20);

        doc.setFontSize(12);
        doc.text(`Time: 1.5 Hours   Max Marks: ${totalMarks}`, 10, 30);

        if (paperData.instructions) {
            const instructions = doc.splitTextToSize(`Instructions: ${paperData.instructions}`, 180);
            doc.text(instructions, 10, 40);
        }

        let yPos = 60;
        let currentSection = "";

        paperData.questions.forEach((q: any, i: number) => {
            if (q.section !== currentSection) {
                yPos += 10;
                doc.setFont("helvetica", "bold");
                doc.text(q.section, 10, yPos);
                yPos += 10;
                currentSection = q.section;
                doc.setFont("helvetica", "normal");
            }

            const questionText = `${i + 1}. ${q.text} (${q.marks})`;
            const splitText = doc.splitTextToSize(questionText, 180);

            if (yPos + splitText.length * 7 > 280) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(splitText, 10, yPos);
            yPos += splitText.length * 7 + 5;
        });

        doc.save("custom-paper.pdf");
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => router.push("/teacher-dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Custom Paper Generator</h1>
                        <p className="text-slate-600">Create papers from your custom units.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <div className="space-y-6 md:col-span-1">
                        <GlassCard className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Subject</label>
                                <select
                                    className="w-full p-2 rounded-lg border border-slate-300"
                                    value={selectedSubject}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                >
                                    <option value="">-- Choose Subject --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {selectedSubject && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Units</label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {units.map(u => (
                                            <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUnits.includes(u.id)}
                                                    onChange={() => toggleUnit(u.id)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-slate-700">{u.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                                    <select className="w-full p-2 rounded-lg border border-slate-300" value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value))}>
                                        <option value="10">10 Marks</option>
                                        <option value="20">20 Marks</option>
                                        <option value="40">40 Marks</option>
                                        <option value="80">80 Marks</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                                    <select className="w-full p-2 rounded-lg border border-slate-300" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Paper Pattern</label>
                                <select className="w-full p-2 rounded-lg border border-slate-300" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                                    <option value="Mixed">Mixed (Standard)</option>
                                    <option value="Objective">Objective Only (MCQ/Fill-ups)</option>
                                    <option value="Subjective">Subjective Only (Long/Short)</option>
                                </select>
                            </div>

                            <Button className="w-full" size="lg" onClick={handleGenerate} isLoading={isGenerating} disabled={!selectedSubject || selectedUnits.length === 0}>
                                <Sparkles className="mr-2 h-4 w-4" /> Generate Paper
                            </Button>
                        </GlassCard>
                    </div>

                    {/* Preview Panel */}
                    <div className="md:col-span-2">
                        <GlassCard className="h-full min-h-[600px] flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" /> Paper Preview
                                </h3>
                                {paperData && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={handleGenerate}>
                                            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate All
                                        </Button>
                                        <Button size="sm" onClick={handleDownloadPDF}>
                                            <Download className="h-4 w-4 mr-2" /> Download PDF
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-8 bg-white rounded-b-xl overflow-y-auto">
                                {paperData ? (
                                    <div className="space-y-8">
                                        <div className="text-center border-b pb-4 mb-4">
                                            <h2 className="text-2xl font-bold uppercase">{paperData.title || "Question Paper"}</h2>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Time: 1.5 Hrs | Max Marks: {totalMarks}
                                            </p>
                                            {paperData.instructions && (
                                                <p className="text-xs text-slate-400 mt-2 italic">{paperData.instructions}</p>
                                            )}
                                        </div>

                                        {paperData.questions.map((q: any, i: number) => (
                                            <div key={i} className="group relative pl-4 border-l-2 border-transparent hover:border-primary/50 transition-colors">
                                                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-amber-500 hover:bg-amber-50 h-7 px-2 text-xs"
                                                        onClick={() => handleFlipQuestion(i, q)}
                                                        isLoading={flippingQuestionId === i}
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" /> Flip
                                                    </Button>
                                                </div>

                                                {(i === 0 || paperData.questions[i - 1].section !== q.section) && (
                                                    <h4 className="font-bold text-slate-800 mb-3 mt-6 border-b border-slate-100 pb-1">{q.section}</h4>
                                                )}

                                                <div className="flex gap-2">
                                                    <span className="font-bold text-slate-700">{i + 1}.</span>
                                                    <div className="flex-1">
                                                        <p className="text-slate-800">{q.text}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded h-fit whitespace-nowrap">
                                                        {q.marks} Mark{q.marks > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Settings className="h-12 w-12 mb-4 opacity-20" />
                                        <p>Select subject and units to generate a custom paper.</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </main>
    );
}
