"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Download, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface NoteData {
    subject: string;
    grade: string;
    board?: string;
    chapter: string;
    content: string;
    createdAt: any;
}

export default function NoteViewPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const noteId = params.id as string;

    const [note, setNote] = useState<NoteData | null>(null);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && noteId) {
            fetchNote();
        }
    }, [user, noteId]);

    const fetchNote = async () => {
        try {
            const docRef = doc(db, "users", user!.uid, "notes", noteId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setNote(snap.data() as NoteData);
            }
        } catch (err) {
            console.error("Error fetching note:", err);
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
            const imgWidth = pdfWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }

            pdf.save(`${note?.subject} - ${note?.chapter} - Notes.pdf`);
        } catch (err) {
            console.error("PDF failed:", err);
            if (note) {
                const d = new jsPDF();
                const lines = d.splitTextToSize(note.content.replace(/[#*>`]/g, ''), 180);
                let y = 20;
                d.setFontSize(11);
                lines.forEach((line: string) => {
                    if (y > 280) { d.addPage(); y = 20; }
                    d.text(line, 15, y);
                    y += 7;
                });
                d.save(`${note.subject} - ${note.chapter} - Notes.pdf`);
            }
        }
    };

    if (loading) {
        return (
            <>
                <DashboardHeader title="Loading..." />
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            </>
        );
    }

    if (!note) {
        return (
            <>
                <DashboardHeader title="Note Not Found" />
                <div className="p-8 text-center">
                    <p className="text-slate-500 mb-4">This note could not be found.</p>
                    <Button onClick={() => router.push("/teacher-dashboard/repository")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Repository
                    </Button>
                </div>
            </>
        );
    }

    const boardLabel = note.board === 'maharashtra' ? 'Maharashtra SSC' : note.board === 'cbse' ? 'CBSE' : note.board === 'icse' ? 'ICSE' : '';

    return (
        <>
            <DashboardHeader title={`${note.subject} Notes`} />

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
                }
                .notes-content td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.875rem;
                }
                .notes-content tr:nth-child(even) td {
                    background-color: #faf8ff;
                }
                .notes-content code {
                    font-family: 'JetBrains Mono', monospace;
                    background: #1e1b4b;
                    color: #c7d2fe;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.85em;
                }
                .notes-content pre {
                    background: linear-gradient(145deg, #1e1b4b, #312e81);
                    color: #c7d2fe;
                    padding: 20px;
                    border-radius: 12px;
                    overflow-x: auto;
                    margin: 16px 0;
                    box-shadow: 0 4px 16px rgba(30, 27, 75, 0.3);
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
            `}</style>

            <div className="p-4 md:p-8 overflow-y-auto h-[calc(100vh-80px)]">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.push("/teacher-dashboard/repository")}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Repository
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 text-xs">
                            {boardLabel && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-semibold">{boardLabel}</span>}
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">Class {note.grade}</span>
                        </div>
                        <Button size="sm" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-1" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Notes content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">{note.subject}</h2>
                                <p className="text-sm text-slate-500">{note.chapter}</p>
                            </div>
                        </div>
                    </div>
                    <div ref={contentRef} className="notes-content p-6 md:p-10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {note.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </>
    );
}
