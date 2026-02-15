"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, FileText, Printer, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PaperViewerPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [paper, setPaper] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && params.id) {
            fetchPaper();
        }
    }, [user, params.id]);

    const fetchPaper = async () => {
        try {
            const docRef = doc(db, "users", user!.uid, "papers", params.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPaper(docSnap.data());
            } else {
                alert("Paper not found");
                router.push("/teacher-dashboard/repository");
            }
        } catch (error) {
            console.error("Error fetching paper:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!paper) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(paper.title || "Question Paper", 10, 20);

        doc.setFontSize(12);
        doc.text(`Time: 1.5 Hours   Max Marks: ${paper.totalMarks || 'N/A'}`, 10, 30);

        if (paper.instructions) {
            const instructions = doc.splitTextToSize(`Instructions: ${paper.instructions}`, 180);
            doc.text(instructions, 10, 40);
        }

        let yPos = 60;
        let currentSection = "";

        paper.questions.forEach((q: any, i: number) => {
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

        doc.save(`${paper.subject || 'paper'}-${params.id}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center">Loading paper...</div>;
    if (!paper) return <div className="p-10 text-center">Paper not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-24 pb-20">
            <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:p-0">
                {/* Header Actions - Hidden when printing */}
                <div className="flex justify-between items-center print:hidden">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all gap-2" onClick={() => router.push("/teacher-dashboard/repository")}>
                        <ArrowLeft className="h-4 w-4" /> Back to Repository
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" /> Print
                        </Button>
                        <Button size="sm" onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                </div>

                {/* Paper Content */}
                <GlassCard className="p-12 print:shadow-none print:border-none print:p-0">
                    <div className="text-center border-b border-slate-200 pb-6 mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <div className="text-left">
                                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">{paper.title || paper.subject}</h1>
                                <p className="text-slate-500 font-medium">Class {paper.grade} • {paper.difficulty} Level</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">Max Marks: {paper.totalMarks}</p>
                                <p className="text-sm text-slate-500">Time: 1.5 Hours</p>
                            </div>
                        </div>
                        {paper.instructions && (
                            <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 italic border border-slate-100">
                                <span className="font-bold not-italic">Instructions: </span> {paper.instructions}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {paper.questions.map((q: any, i: number) => (
                            <div key={i}>
                                {(i === 0 || paper.questions[i - 1].section !== q.section) && (
                                    <div className="flex items-center gap-4 mb-4 mt-8">
                                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-wider">{q.section}</h4>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                )}

                                <div className="flex gap-4 group">
                                    <span className="font-bold text-slate-700 w-6 shrink-0">{i + 1}.</span>
                                    <div className="flex-1">
                                        <p className="text-slate-800 leading-relaxed font-medium">{q.text}</p>
                                        {/* If MCQ options exist, render them (assuming data structure has options) */}
                                        {q.options && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 ml-2">
                                                {q.options.map((opt: string, idx: number) => (
                                                    <div key={idx} className="flex gap-2 items-center">
                                                        <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                            {String.fromCharCode(65 + idx)}
                                                        </span>
                                                        <span className="text-sm text-slate-600">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap pt-1">
                                        [{q.marks}]
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
                        Generated via ScorePrepPro AI
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
