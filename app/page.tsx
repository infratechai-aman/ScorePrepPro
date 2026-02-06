"use client";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import { Sparkles, FileText, Download, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { useRef } from "react";

// Hack for file-saver if not installed (I'll implement manual blob saving to avoid extra deps)
const saveBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};


import { Switch } from "@/components/ui/Switch";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [solutionLoading, setSolutionLoading] = useState(false); // New state for solution loading
  const [board, setBoard] = useState("");
  const [grade, setGrade] = useState("10"); // Default to Class 10
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState("");

  const [difficulty, setDifficulty] = useState("moderate"); // Changed to string enum
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  // removed includeAnswers state as it's now a separate action

  const [generatedPaper, setGeneratedPaper] = useState("");
  const [generatedSolution, setGeneratedSolution] = useState(""); // Store solution separately
  const [error, setError] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!board || !subject || !chapters) return;
    setLoading(true);
    setGeneratedPaper("");
    setGeneratedSolution(""); // Reset solution on new paper
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board, grade, subject, chapters, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }

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
    // Basic conversion of markdown text to DOCX paragraphs
    // For a real app, strict parsing is better, but this is a starter
    // Combine paper and solution if exists
    const contentToExport = generatedPaper + (generatedSolution ? "\n\n" + generatedSolution : "");

    const lines = contentToExport.split("\n");
    const children = lines.map(line => {
      if (line.startsWith("# ")) {
        return new Paragraph({
          text: line.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
        });
      }
      if (line.startsWith("## ")) {
        return new Paragraph({
          text: line.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
        });
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return new Paragraph({
          children: [new TextRun({ text: line.replace(/\*\*/g, ""), bold: true })]
        });
      }
      return new Paragraph({
        text: line
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveBlob(blob, `${board}-${subject}-question-paper.docx`);
  };

  return (
    <main className="min-h-screen pb-20 pt-24 px-4 md:px-6">
      <Navbar />

      <section className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 leading-tight">
            AI-Powered <span className="text-primary">Exam Papers</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create professional board-level question papers in seconds. Strictly aligned with syllabus and textbook patterns.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-accent rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-800">Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Board"
                placeholder="Select Board"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                options={[
                  { value: "cbse", label: "CBSE" },
                  { value: "maharashtra", label: "Maharashtra SSC" },
                  { value: "state", label: "State Board" },
                ]}
              />
              <Select
                label="Class"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                options={[
                  { value: "10", label: "Class 10" },
                  { value: "9", label: "Class 9" },
                ]}
              />
            </div>

            <Select
              label="Subject"
              placeholder="Select Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[
                { value: "science1", label: "Science 1" },
                { value: "science2", label: "Science 2" },
                { value: "maths1", label: "Maths 1 (Algebra)" },
                { value: "maths2", label: "Maths 2 (Geometry)" },
                { value: "history", label: "History" },
                { value: "geography", label: "Geography" },
              ]}
            />

            <Input
              label="Chapters (Comma separated)"
              placeholder="e.g. Gravitation, Periodic Classification, lenses"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
            />

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900">Premium Controls</h3>
                <Switch
                  label="Teacher Mode"
                  checked={isTeacherMode}
                  onCheckedChange={setIsTeacherMode}
                />
              </div>

              {isTeacherMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-4 pt-2 overflow-hidden"
                >
                  <Select
                    label="Difficulty Mode"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    options={[
                      { value: "easy", label: "Easy (School Test)" },
                      { value: "moderate", label: "Moderate (Standard Board)" },
                      { value: "hard", label: "Hard (Concept Driven)" },
                      { value: "replica", label: "Exam Replica (Previous Year Pattern)" },
                      { value: "challenging", label: "Challenging (Olympiad/HOTS)" },
                    ]}
                  />
                </motion.div>
              )}
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleGenerate}
              isLoading={loading}
              disabled={!board || !subject || !chapters}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Question Paper
            </Button>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="bg-blue-900/5 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Papers
              </h3>
              <div className="text-sm text-slate-500 text-center py-8">
                No papers generated yet.
              </div>
            </GlassCard>

            <GlassCard className="bg-amber-50/50 border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Pro Tip</h3>
              <p className="text-sm text-slate-600">
                Choose <strong>Exam Replica</strong> mode for the most authentic experience.
              </p>
            </GlassCard>
          </div>

          {error && (
            <div className="md:col-span-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {(generatedPaper || generatedSolution) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-3 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-slate-800">Generated Question Paper</h2>
                <div className="flex gap-2">
                  {!generatedSolution && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateSolution}
                      isLoading={solutionLoading}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Generate Answer Key
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadDOCX}>
                    <Download className="mr-2 h-4 w-4" /> Word
                  </Button>
                </div>
              </div>

              <div ref={contentRef} style={{ backgroundColor: "#ffffff", padding: "40px", minHeight: "800px", color: "#1e293b" }} className="rounded-2xl shadow-xl space-y-8">
                {/* Wrapper for PDF Capture */}
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ node, ...props }) => <h1 style={{ borderBottom: "2px solid #0f172a", textAlign: "center", marginBottom: "20px", paddingBottom: "10px", textTransform: "uppercase" }} className="text-3xl font-bold" {...props} />,
                      h2: ({ node, ...props }) => <h2 style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #1e293b", padding: "10px", marginTop: "30px", marginBottom: "15px", textTransform: "uppercase" }} className="text-xl font-bold" {...props} />,
                      p: ({ node, ...props }) => <p style={{ marginBottom: "16px", lineHeight: "1.6", textAlign: "justify" }} {...props} />,
                      hr: ({ node, ...props }) => <hr style={{ margin: "30px 0", borderTop: "1px dashed #cbd5e1" }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
                      ol: ({ node, ...props }) => <ol style={{ listStyleType: "decimal", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ marginBottom: "8px", paddingLeft: "5px" }} {...props} />
                    }}
                  >
                    {generatedPaper}
                  </ReactMarkdown>
                </div>

                {generatedSolution && (
                  <div style={{ backgroundColor: "rgba(240, 253, 244, 0.5)", borderTop: "4px dotted #cbd5e1", padding: "24px", marginTop: "30px", borderRadius: "12px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "0", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#dcfce7", padding: "4px 16px", borderRadius: "999px", color: "#166534", fontWeight: "bold", fontSize: "14px", border: "1px solid #bbf7d0" }}>
                      ANSWER KEY
                    </div>
                    <div className="prose prose-green max-w-none" style={{ color: "#166534" }}>
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h2: ({ node, ...props }) => <h2 style={{ color: "#14532d", borderBottom: "1px solid #bbf7d0", paddingBottom: "4px", marginTop: "20px", marginBottom: "8px" }} className="text-lg font-bold" {...props} />
                        }}
                      >
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
