"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Select } from "@/components/ui/Select";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Download, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import { getSubjects, getChapters, getClasses, BOARD_INFO } from "@/lib/syllabus";

export default function NotesGeneratorPage() {
    const { userData } = useAuth();

    const [board, setBoard] = useState("maharashtra");
    const [grade, setGrade] = useState("10");
    const [subject, setSubject] = useState("");
    const [chapter, setChapter] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState("");
    const [error, setError] = useState("");
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
    }, [board, grade]);

    useEffect(() => {
        setChapter("");
    }, [subject]);

    const handleGenerate = async () => {
        if (!subject || !chapter) {
            setError("Please select a subject and chapter.");
            return;
        }

        setLoading(true);
        setError("");
        setGeneratedNotes("");

        const boardInfo = BOARD_INFO[board];

        try {
            const response = await fetch("/api/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subject,
                    unit: chapter,
                    board: board,
                    grade: grade,
                    textbook: boardInfo?.textbook || "",
                    topics: [{ name: chapter, isImp: true }]
                })
            });

            const data = await response.json();
            if (data.content) {
                setGeneratedNotes(data.content);
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

    const handleDownloadPDF = () => {
        if (!generatedNotes || !contentRef.current) return;
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(generatedNotes.replace(/[#*>`]/g, ''), 180);
        let yPos = 20;
        doc.setFontSize(12);

        lines.forEach((line: string) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 15, yPos);
            yPos += 7;
        });

        doc.save(`${subject}-${chapter}-notes.pdf`);
    };

    // Class options based on plan
    const classOptions = availableClasses
        .filter(cls => {
            const num = parseInt(cls);
            if (isPremium) return true;
            if (userData?.plan === 'basic') return num >= 7 && num <= 10;
            return num >= 9 && num <= 10; // free
        })
        .map(cls => ({ value: cls, label: `Class ${cls}` }));

    return (
        <>
            <DashboardHeader title="Notes Generator" />
            <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">
                        AI <span className="text-indigo-600">Notes Generator</span>
                    </h1>
                    <p className="text-slate-500">Generate comprehensive study notes for any chapter instantly.</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <GlassCard className="p-6 space-y-5 lg:col-span-1">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <BookOpen className="h-4 w-4 text-indigo-500" /> Configuration
                        </h3>

                        <Select label="Board" value={board} onChange={(e) => setBoard(e.target.value)} options={[
                            { value: "cbse", label: "CBSE" },
                            { value: "icse", label: "ICSE" },
                            { value: "maharashtra", label: "Maharashtra SSC" }
                        ]} />

                        <Select label="Class" value={grade} onChange={(e) => setGrade(e.target.value)} options={classOptions} />

                        <Select
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            options={[
                                { value: "", label: "-- Select Subject --" },
                                ...availableSubjects.map(s => ({ value: s, label: s }))
                            ]}
                        />

                        <Select
                            label="Chapter"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            options={[
                                { value: "", label: subject ? "-- Select Chapter --" : "-- Select Subject First --" },
                                ...availableChapters.map(c => ({ value: c, label: c }))
                            ]}
                        />

                        {error && (
                            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
                        )}

                        <Button className="w-full" size="lg" onClick={handleGenerate} isLoading={loading} disabled={!subject || !chapter}>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Notes
                        </Button>
                    </GlassCard>

                    {/* Preview Panel */}
                    <GlassCard className="lg:col-span-2 min-h-[600px] flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" /> Notes Preview
                            </h3>
                            {generatedNotes && (
                                <Button size="sm" onClick={handleDownloadPDF}>
                                    <Download className="h-4 w-4 mr-2" /> Download PDF
                                </Button>
                            )}
                        </div>

                        <div ref={contentRef} className="flex-1 p-8 bg-white rounded-b-xl overflow-y-auto">
                            {generatedNotes ? (
                                <div className="prose prose-slate max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
                                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold border-b-2 border-slate-200 pb-2 mb-4" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-indigo-700 mt-8 mb-3" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-2" {...props} />,
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="bg-indigo-50 border-l-4 border-indigo-400 p-4 my-4 rounded-r-lg italic text-slate-700" {...props} />
                                        ),
                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-slate-200" {...props} /></div>,
                                        th: ({ node, ...props }) => <th className="bg-slate-50 p-3 text-left font-semibold border border-slate-200" {...props} />,
                                        td: ({ node, ...props }) => <td className="p-3 border border-slate-200" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                                        code: ({ node, ...props }) => <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                    }}>
                                        {generatedNotes}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Select a board, subject, and chapter to generate notes</p>
                                    <p className="text-sm mt-1">AI will create comprehensive, exam-ready study material from {BOARD_INFO[board]?.textbook || "textbook"} syllabus</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </>
    );
}
