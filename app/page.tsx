"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useState, useRef, useEffect } from "react";
import { Sparkles, FileText, Download, CheckCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { ImageIcon } from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { Switch } from "@/components/ui/Switch";
import { SYLLABUS_DB } from "@/lib/syllabus";

// Hack for file-saver if not installed
const saveBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function Home() {
  // Wizard State
  const [step, setStep] = useState(1);

  // Data State
  const [board, setBoard] = useState("maharashtra");
  const [grade, setGrade] = useState("10");
  const [subject, setSubject] = useState("");
  const [totalMarks, setTotalMarks] = useState("40");

  // Derived Data
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  // Selection State
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [chapterWeights, setChapterWeights] = useState<Record<string, number>>({});

  // Config State
  const [difficulty, setDifficulty] = useState("moderate");
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Generation State
  const [loading, setLoading] = useState(false);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState("");
  const [generatedSolution, setGeneratedSolution] = useState("");
  const [error, setError] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  // Effect to load chapters when subject changes
  useEffect(() => {
    if (board && grade && subject) {
      const boardData = SYLLABUS_DB[board];
      if (boardData && boardData[grade] && boardData[grade][subject]) {
        setAvailableChapters(boardData[grade][subject]);
        setSelectedChapters([]); // Reset selections
        setChapterWeights({});
      } else {
        setAvailableChapters([]);
      }
    }
  }, [board, grade, subject]);

  const handleWeightChange = (chapter: string, weight: number) => {
    setChapterWeights(prev => ({ ...prev, [chapter]: weight }));
  };

  const totalWeight = Object.values(chapterWeights).reduce((a, b) => a + b, 0);

  const handleGenerate = async () => {
    if (totalWeight !== 100) {
      setError("Total weightage must equal 100%");
      return;
    }

    setLoading(true);
    setGeneratedPaper("");
    setGeneratedSolution("");
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Updated payload to include detailed weightage
        body: JSON.stringify({
          board,
          grade,
          subject,
          marks: parseInt(totalMarks),
          chapters: selectedChapters,
          chapterWeights,
          difficulty
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setGeneratedPaper(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSolution = async () => {
    if (!generatedPaper) return;
    setSolutionLoading(true);
    try {
      const res = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperContent: generatedPaper, board }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedSolution(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${board}-${subject}-question-paper.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const handleDownloadDOCX = async () => {
    const contentToExport = generatedPaper + (generatedSolution ? "\n\n" + generatedSolution : "");
    const lines = contentToExport.split("\n");
    const children = lines.map(line => {
      if (line.startsWith("# ")) return new Paragraph({ text: line.replace("# ", ""), heading: HeadingLevel.HEADING_1 });
      if (line.startsWith("## ")) return new Paragraph({ text: line.replace("## ", ""), heading: HeadingLevel.HEADING_2 });
      if (line.startsWith("**") && line.endsWith("**")) return new Paragraph({ children: [new TextRun({ text: line.replace(/\*\*/g, ""), bold: true })] });
      return new Paragraph({ text: line });
    });

    const doc = new Document({ sections: [{ properties: {}, children: children }] });
    const blob = await Packer.toBlob(doc);
    saveBlob(blob, `${board}-${subject}-question-paper.docx`);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <main className="min-h-screen pb-20 pt-24 px-4 md:px-6 bg-slate-50">
      <Navbar />

      <section className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-slate-900">
            Smart Paper <span className="text-primary">Wizard</span>
          </h1>
          <p className="text-slate-600">Step {step} of 3: {step === 1 ? "Subject Selection" : step === 2 ? "Chapter Selection" : "Weightage & Config"}</p>
        </motion.div>

        {/* Wizard Steps */}
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="md:col-span-2 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-slate-800">1. Select Subject</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Board" value={board} onChange={(e) => setBoard(e.target.value)} options={[
                      { value: "cbse", label: "CBSE" }, { value: "maharashtra", label: "Maharashtra SSC" }
                    ]} />
                    <Select label="Class" value={grade} onChange={(e) => setGrade(e.target.value)} options={[
                      { value: "10", label: "Class 10" }, { value: "9", label: "Class 9" }
                    ]} />
                    <Select label="Total Marks" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} options={[
                      { value: "10", label: "10 Marks" },
                      { value: "20", label: "20 Marks" },
                      { value: "40", label: "40 Marks" },
                    ]} />
                  </div>

                  <Select label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} options={
                    board === 'maharashtra' ? [
                      { value: "Mathematics Part-I (Algebra)", label: "Maths 1 (Algebra)" },
                      { value: "Mathematics Part-II (Geometry)", label: "Maths 2 (Geometry)" },
                      { value: "Science and Technology Part-1", label: "Science 1" },
                      { value: "Science and Technology Part-2", label: "Science 2" },
                      { value: "History and Political Science", label: "History" },
                      { value: "Geography", label: "Geography" },
                    ] : [
                      { value: "Mathematics", label: "Mathematics" },
                      { value: "Science", label: "Science" },
                      { value: "Social Science", label: "Social Science" },
                    ]
                  } />

                  <div className="mt-auto pt-8">
                    <Button className="w-full" onClick={nextStep} disabled={!board || !subject}>
                      Next: Select Chapters <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-slate-800">2. Select Chapters</h2>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedChapters(availableChapters)} className="text-xs text-primary hover:underline">Select All</button>
                      <button onClick={() => setSelectedChapters([])} className="text-xs text-slate-500 hover:underline">Clear</button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[400px] border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                    {availableChapters.length > 0 ? availableChapters.map((chap) => (
                      <label key={chap} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:border-blue-300 transition-colors">
                        <input type="checkbox"
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                          checked={selectedChapters.includes(chap)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedChapters([...selectedChapters, chap]);
                            else setSelectedChapters(selectedChapters.filter(c => c !== chap));
                          }}
                        />
                        <span className="text-slate-700 font-medium">{chap}</span>
                      </label>
                    )) : (
                      <p className="text-slate-500 text-center italic">No chapters found for this subject.</p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4 mt-auto">
                    <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <Button className="flex-1" onClick={() => {
                      // Initialize equal weights
                      const count = selectedChapters.length;
                      const equalWeight = Math.floor(100 / count);
                      const remainder = 100 % count;
                      const newWeights: Record<string, number> = {};
                      selectedChapters.forEach((ch, i) => {
                        newWeights[ch] = equalWeight + (i < remainder ? 1 : 0);
                      });
                      setChapterWeights(newWeights);
                      nextStep();
                    }} disabled={selectedChapters.length === 0}>
                      Next: Assign Weightage <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-slate-800">3. Weightage & Settings</h2>
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-2">
                    {selectedChapters.map((chap) => (
                      <div key={chap} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-slate-700">{chap}</span>
                          <span className="font-bold text-primary">{chapterWeights[chap] || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0" max="100"
                          value={chapterWeights[chap] || 0}
                          onChange={(e) => handleWeightChange(chap, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    ))}

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">Difficulty & Controls</h3>
                      <div className="grid gap-4">
                        <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={[
                          { value: "easy", label: "Easy" },
                          { value: "moderate", label: "Moderate" },
                          { value: "hard", label: "Hard" },
                          { value: "replica", label: "Exam Replica" },
                          { value: "challenging", label: "Challenging" },
                        ]} />
                        <Switch label="Teacher Mode" checked={isTeacherMode} onCheckedChange={setIsTeacherMode} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-500">Total Weightage:</span>
                      <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-red-500'}`}>
                        {totalWeight}%
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                      <Button className="flex-1" size="lg" onClick={handleGenerate} isLoading={loading} disabled={totalWeight !== 100}>
                        <Sparkles className="mr-2 h-5 w-5" /> Generate Paper
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <GlassCard className="bg-white/80 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between border-b pb-2"><span>Board:</span> <span className="font-medium text-slate-800 capitalize">{board || "-"}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Class:</span> <span className="font-medium text-slate-800">{grade}</span></div>
                <div className="flex justify-between border-b pb-2"><span>Subject:</span> <span className="font-medium text-slate-800 truncate max-w-[150px]">{subject || "-"}</span></div>
                <div className="flex justify-between pb-2"><span>Chapters:</span> <span className="font-medium text-slate-800">{selectedChapters.length}</span></div>
              </div>
            </GlassCard>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Result Section (Full Width) */}
          {(generatedPaper || generatedSolution) && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-3 space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-slate-800">Generated Question Paper</h2>
                <div className="flex gap-2">
                  {!generatedSolution && (
                    <Button variant="secondary" size="sm" onClick={handleGenerateSolution} isLoading={solutionLoading}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Generate Answer Key
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadDOCX}><Download className="mr-2 h-4 w-4" /> Word</Button>
                </div>
              </div>

              <div ref={contentRef} style={{ backgroundColor: "#ffffff", padding: "40px", minHeight: "800px", color: "#1e293b" }} className="rounded-2xl shadow-xl space-y-8">
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
                    h1: ({ node, ...props }) => <h1 style={{ borderBottom: "2px solid #0f172a", textAlign: "center", marginBottom: "20px", paddingBottom: "10px", textTransform: "uppercase" }} className="text-3xl font-bold" {...props} />,
                    h2: ({ node, ...props }) => <h2 style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #1e293b", padding: "10px", marginTop: "30px", marginBottom: "15px", textTransform: "uppercase" }} className="text-xl font-bold" {...props} />,
                    table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0" }} {...props} /></div>,
                    thead: ({ node, ...props }) => <thead style={{ backgroundColor: "#f8fafc" }} {...props} />,
                    tbody: ({ node, ...props }) => <tbody {...props} />,
                    tr: ({ node, ...props }) => <tr style={{ borderBottom: "1px solid #e2e8f0" }} {...props} />,
                    th: ({ node, ...props }) => <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#1e293b", borderRight: "1px solid #e2e8f0" }} {...props} />,
                    td: ({ node, ...props }) => <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0" }} {...props} />,
                    img: ({ node, ...props }) => {
                      if (props.alt?.startsWith("DIAGRAM:")) {
                        return (
                          <div className="my-6 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center">
                            <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Diagram Required</p>
                            <p className="text-sm text-slate-500 italic mt-1">{props.alt.replace("DIAGRAM:", "").trim()}</p>
                          </div>
                        );
                      }
                      return <img {...props} className="rounded-lg shadow-md max-w-full my-4" />;
                    },
                    p: ({ node, ...props }) => <p style={{ marginBottom: "16px", lineHeight: "1.6", textAlign: "justify" }} {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        style={{
                          backgroundColor: "#f1f5f9",
                          borderLeft: "4px solid #334155",
                          padding: "16px",
                          margin: "24px 0",
                          borderRadius: "0 8px 8px 0",
                          fontStyle: "italic",
                          textAlign: "center",
                          fontWeight: "500",
                          color: "#334155"
                        }}
                        {...props}
                      />
                    ),
                    hr: ({ node, ...props }) => <hr style={{ margin: "30px 0", borderTop: "2px solid #cbd5e1" }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ listStyleType: "decimal", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ marginBottom: "8px", paddingLeft: "5px" }} {...props} />
                  }}>
                    {generatedPaper}
                  </ReactMarkdown>
                </div>

                {generatedSolution && (
                  <div style={{ backgroundColor: "rgba(240, 253, 244, 0.5)", borderTop: "4px dotted #cbd5e1", padding: "24px", marginTop: "30px", borderRadius: "12px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "0", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#dcfce7", padding: "4px 16px", borderRadius: "999px", color: "#166534", fontWeight: "bold", fontSize: "14px", border: "1px solid #bbf7d0" }}>ANSWER KEY</div>
                    <div className="prose prose-green max-w-none" style={{ color: "#166534" }}>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
                        h2: ({ node, ...props }) => <h2 style={{ color: "#14532d", borderBottom: "1px solid #bbf7d0", paddingBottom: "4px", marginTop: "20px", marginBottom: "8px" }} className="text-lg font-bold" {...props} />
                      }}>
                        {generatedSolution}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
