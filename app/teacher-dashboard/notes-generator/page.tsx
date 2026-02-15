"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Download, BookOpen, FileText, Save, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/contexts/AuthContext";
import { getSubjects, getChapters, getClasses, BOARD_INFO } from "@/lib/syllabus";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function NotesGeneratorPage() {
    const { user, userData } = useAuth();

    const [board, setBoard] = useState("maharashtra");
    const [grade, setGrade] = useState("10");
    const [subject, setSubject] = useState("");
    const [chapter, setChapter] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState("");
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const isPremium = userData?.plan === 'premium' || userData?.plan === 'teacher';

    // Dynamic data from syllabus DB
    const availableClasses = getClasses(board);
    const availableSubjects = getSubjects(board, grade);
    const availableChapters = getChapters(board, grade, subject);

    // Reset downstream when board/grade/subject changes
    useEffect(() => {
        setSubject("");
        setChapter("");
        setGeneratedNotes("");
        setSaved(false);
    }, [board, grade]);

    useEffect(() => {
        setChapter("");
        setGeneratedNotes("");
        setSaved(false);
    }, [subject]);

    // Save to Firestore
    const handleSave = async () => {
        if (!user || !generatedNotes) return;
        setSaving(true);
        try {
            await addDoc(collection(db, "users", user.uid, "notes"), {
                board,
                grade,
                subject,
                chapter,
                content: generatedNotes,
                createdAt: serverTimestamp()
            });
            setSaved(true);
        } catch (err) {
            console.error("Failed to save notes:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        if (!subject || !chapter) {
            setError("Please select a subject and chapter.");
            return;
        }

        setLoading(true);
        setError("");
        setGeneratedNotes("");
        setSaved(false);

        const boardInfo = BOARD_INFO[board];

        try {
            const response = await fetch("/api/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    unit: chapter,
                    board,
                    grade,
                    textbook: boardInfo?.textbook || "",
                    topics: [{ name: chapter, isImp: true }]
                })
            });

            const data = await response.json();
            if (data.content) {
                setGeneratedNotes(data.content);
                // Auto-save to Firestore
                if (user) {
                    try {
                        await addDoc(collection(db, "users", user.uid, "notes"), {
                            board,
                            grade,
                            subject,
                            chapter,
                            content: data.content,
                            createdAt: serverTimestamp()
                        });
                        setSaved(true);
                    } catch (saveErr) {
                        console.error("Auto-save failed:", saveErr);
                    }
                }
            } else {
                setError(data.error || "Failed to generate notes.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An error occurred while generating notes.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;

        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            // First page
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            // Additional pages
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }

            pdf.save(`${subject} - ${chapter} - Notes.pdf`);
        } catch (err) {
            console.error("PDF download failed:", err);
            // Fallback to basic text PDF
            const doc = new jsPDF();
            const lines = doc.splitTextToSize(generatedNotes.replace(/[#*>`]/g, ''), 180);
            let yPos = 20;
            doc.setFontSize(11);
            lines.forEach((line: string) => {
                if (yPos > 280) { doc.addPage(); yPos = 20; }
                doc.text(line, 15, yPos);
                yPos += 7;
            });
            doc.save(`${subject} - ${chapter} - Notes.pdf`);
        }
    };

    // Class options based on plan
    const classOptions = availableClasses
        .filter(cls => {
            const num = parseInt(cls);
            if (isPremium) return true;
            if (userData?.plan === 'basic') return num >= 7 && num <= 10;
            return num >= 9 && num <= 10;
        })
        .map(cls => ({ value: cls, label: `Class ${cls}` }));

    return (
        <>
            <DashboardHeader title="Notes Generator" />

            {/* Google Fonts for aesthetic notes */}
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Source+Serif+4:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

            <style jsx global>{`
                .notes-content {
                    font-family: 'Inter', -apple-system, sans-serif;
                    line-height: 1.8;
                    color: #1e293b;
                }
                .notes-content h1 {
                    font-family: 'Playfair Display', serif;
                    font-weight: 800;
                    font-size: 1.75rem;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding-bottom: 0.75rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 3px solid #e2e8f0;
                    position: relative;
                }
                .notes-content h1::after {
                    content: '';
                    position: absolute;
                    bottom: -3px;
                    left: 0;
                    width: 80px;
                    height: 3px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    border-radius: 2px;
                }
                .notes-content h2 {
                    font-family: 'Playfair Display', serif;
                    font-weight: 700;
                    font-size: 1.35rem;
                    color: #4f46e5;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    padding-left: 14px;
                    border-left: 4px solid #818cf8;
                    position: relative;
                }
                .notes-content h3 {
                    font-family: 'Source Serif 4', serif;
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: #334155;
                    margin-top: 1.75rem;
                    margin-bottom: 0.75rem;
                    padding: 6px 12px;
                    background: linear-gradient(90deg, #f1f5f9, transparent);
                    border-radius: 6px;
                    border-left: 3px solid #6366f1;
                }
                .notes-content blockquote {
                    background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
                    border-left: 4px solid #818cf8;
                    padding: 16px 20px;
                    margin: 20px 0;
                    border-radius: 0 12px 12px 0;
                    font-style: italic;
                    color: #475569;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
                }
                .notes-content blockquote strong {
                    color: #4f46e5;
                    font-style: normal;
                }
                .notes-content strong {
                    color: #1e1b4b;
                    font-weight: 700;
                    background: linear-gradient(180deg, transparent 60%, #fef9c3 60%);
                    padding: 0 2px;
                }
                .notes-content em {
                    color: #6366f1;
                    font-style: italic;
                    font-weight: 500;
                }
                .notes-content ul {
                    list-style: none;
                    padding-left: 0;
                    margin: 12px 0;
                }
                .notes-content ul li {
                    position: relative;
                    padding-left: 24px;
                    margin-bottom: 8px;
                    line-height: 1.7;
                }
                .notes-content ul li::before {
                    content: '▸';
                    position: absolute;
                    left: 4px;
                    color: #6366f1;
                    font-weight: bold;
                    font-size: 14px;
                }
                .notes-content ol {
                    padding-left: 0;
                    counter-reset: step-counter;
                    margin: 12px 0;
                }
                .notes-content ol li {
                    counter-increment: step-counter;
                    position: relative;
                    padding-left: 36px;
                    margin-bottom: 10px;
                    line-height: 1.7;
                    list-style: none;
                }
                .notes-content ol li::before {
                    content: counter(step-counter);
                    position: absolute;
                    left: 0;
                    top: 2px;
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                }
                .notes-content table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 20px 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    border: 1px solid #e2e8f0;
                }
                .notes-content th {
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.875rem;
                    letter-spacing: 0.025em;
                }
                .notes-content td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.875rem;
                }
                .notes-content tr:nth-child(even) td {
                    background-color: #faf8ff;
                }
                .notes-content tr:hover td {
                    background-color: #eef2ff;
                }
                .notes-content code {
                    font-family: 'JetBrains Mono', monospace;
                    background: #1e1b4b;
                    color: #c7d2fe;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.85em;
                    font-weight: 500;
                }
                .notes-content pre {
                    background: linear-gradient(145deg, #1e1b4b, #312e81);
                    color: #c7d2fe;
                    padding: 20px;
                    border-radius: 12px;
                    overflow-x: auto;
                    margin: 16px 0;
                    box-shadow: 0 4px 16px rgba(30, 27, 75, 0.3);
                    border: 1px solid #3730a3;
                }
                .notes-content pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                }
                .notes-content hr {
                    border: none;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #c7d2fe, transparent);
                    margin: 2rem 0;
                }
                .notes-content p {
                    margin-bottom: 0.75rem;
                    line-height: 1.85;
                }
                .notes-content a {
                    color: #4f46e5;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .notes-content > *:first-child {
                    margin-top: 0;
                }
                @media print {
                    .notes-content {
                        font-size: 11pt;
                    }
                    .notes-content h1 {
                        -webkit-text-fill-color: #4f46e5;
                        color: #4f46e5;
                    }
                }
            `}</style>

            <div className="p-4 md:p-8 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                        AI <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Notes Generator</span>
                    </h1>
                    <p className="text-slate-500 text-sm">Generate beautiful, exam-ready study notes from your syllabus instantly.</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <GlassCard className="p-6 space-y-5 lg:col-span-1 sticky top-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <BookOpen className="h-4 w-4 text-indigo-500" /> Configuration
                            </h3>

                            <Select label="Board" value={board} onChange={(e) => setBoard(e.target.value)} options={[
                                { value: "maharashtra", label: "Maharashtra SSC" },
                                { value: "cbse", label: "CBSE" },
                                { value: "icse", label: "ICSE" },
                            ]} />

                            <Select label="Class" value={grade} onChange={(e) => setGrade(e.target.value)} options={classOptions} />

                            <Select
                                label="Subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                options={[
                                    { value: "", label: "— Select Subject —" },
                                    ...availableSubjects.map(s => ({ value: s, label: s }))
                                ]}
                            />

                            <Select
                                label="Chapter"
                                value={chapter}
                                onChange={(e) => setChapter(e.target.value)}
                                options={[
                                    { value: "", label: subject ? "— Select Chapter —" : "— Select Subject First —" },
                                    ...availableChapters.map(c => ({ value: c, label: c }))
                                ]}
                            />

                            <AnimatePresence>
                                {error && (
                                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!subject || !chapter || loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Notes</>
                                )}
                            </Button>

                            {/* Status indicators */}
                            <AnimatePresence>
                                {saved && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                        <CheckCircle className="h-4 w-4" />
                                        Saved to your repository
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>

                    {/* Preview Panel */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                        <GlassCard className="min-h-[600px] flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-t-xl">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" /> Notes Preview
                                </h3>
                                {generatedNotes && (
                                    <div className="flex gap-2">
                                        {!saved && user && (
                                            <button onClick={handleSave} disabled={saving}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                Save
                                            </button>
                                        )}
                                        <Button size="sm" onClick={handleDownloadPDF}>
                                            <Download className="h-4 w-4 mr-1" /> PDF
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 bg-white rounded-b-xl overflow-y-auto">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600" />
                                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
                                        </div>
                                        <p className="mt-6 text-slate-600 font-medium text-lg">Generating your notes...</p>
                                        <p className="text-slate-400 text-sm mt-1">This may take 15-30 seconds</p>
                                        <div className="mt-6 flex gap-2">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 bg-indigo-400 rounded-full"
                                                    animate={{ y: [0, -8, 0] }}
                                                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : generatedNotes ? (
                                    <div ref={contentRef} className="notes-content p-6 md:p-10">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                            {generatedNotes}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mb-6">
                                            <BookOpen className="h-10 w-10 text-indigo-300" />
                                        </div>
                                        <p className="text-lg font-semibold text-slate-600">Ready to create notes</p>
                                        <p className="text-sm mt-2 text-center max-w-sm">
                                            Select your board, class, subject, and chapter — then hit <strong className="text-indigo-600">Generate</strong> for beautifully styled study material.
                                        </p>
                                        <div className="mt-6 flex gap-2 text-xs text-slate-400">
                                            <span className="px-3 py-1 bg-slate-50 rounded-full">📚 {BOARD_INFO[board]?.textbook || "Textbook"} based</span>
                                            <span className="px-3 py-1 bg-slate-50 rounded-full">🎯 Exam-focused</span>
                                            <span className="px-3 py-1 bg-slate-50 rounded-full">💾 Auto-saved</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
