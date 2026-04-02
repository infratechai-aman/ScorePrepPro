"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Header, ImageRun, HorizontalPositionAlign, VerticalPositionAlign } from "docx";
import { GlassCard } from "@/components/ui/GlassCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const saveBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

export default function PaperViewerPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [paper, setPaper] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    const id = params?.id as string;

    // Detect if this is a Markdown-based paper (Smart Generator) vs JSON-based (Custom Generator)
    const isMarkdownPaper = paper?.content && typeof paper.content === "string";

    useEffect(() => {
        if (user && id) {
            fetchPaper();
        }
    }, [user, id]);

    const fetchPaper = async () => {
        try {
            const docRef = doc(db, "users", user!.uid, "papers", id);
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

    // ========== PDF DOWNLOAD (Print-based for maximum CSS compatibility) ==========
    const handleDownloadPDF = () => {
        if (!contentRef.current) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to download PDF.");
            return;
        }
        const htmlContent = contentRef.current.innerHTML;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${paper?.subject || "Question Paper"} - ${paper?.board || ""}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #1e293b;
                        padding: 40px;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1, h2, h3, h4 { margin-top: 20px; margin-bottom: 10px; }
                    h1 { font-size: 24px; text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; text-transform: uppercase; }
                    h2 { font-size: 18px; background-color: #f8fafc; border-left: 4px solid #1e293b; padding: 10px; text-transform: uppercase; }
                    h3 { font-size: 16px; background-color: #f8fafc; border-left: 4px solid #1e293b; padding: 8px; text-transform: uppercase; }
                    p { margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    th { background-color: #f8fafc; font-weight: bold; }
                    hr { margin: 24px 0; border-top: 2px solid #cbd5e1; }
                    ul, ol { padding-left: 24px; margin-bottom: 12px; }
                    li { margin-bottom: 4px; }
                    strong { font-weight: bold; }
                    em { font-style: italic; }
                    blockquote { background: #f1f5f9; border-left: 4px solid #334155; padding: 12px; margin: 16px 0; font-style: italic; }
                    
                    /* Print Watermark */
                    .watermark-container-preview {
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        z-index: -1 !important;
                        pointer-events: none !important;
                        display: flex !important;
                        justify-content: center !important;
                        align-items: center !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    .watermark-container-preview img {
                        width: 90% !important;
                        max-width: 800px !important;
                        object-fit: contain !important;
                        opacity: 0.15 !important;
                    }

                    /* Page border - repeats on every printed page */
                    .page-border {
                        position: fixed;
                        top: 15px;
                        left: 15px;
                        right: 15px;
                        bottom: 15px;
                        border: 1.5px solid #94a3b8;
                        pointer-events: none;
                        z-index: 9999;
                    }

                    /* Pagination fixes */
                    .print\\:break-before-page {
                        page-break-before: always !important;
                        break-before: page !important;
                    }
                    h2, h3 {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                    table, img {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Global Print Rules */
                    @page { size: auto; margin: 0mm; }

                    @media print {
                        body { padding: 0; margin: 0; }
                        .watermark-container-preview { display: flex !important; }
                    }
                </style>
            </head>
            <body>
                <div class="page-border"></div>
                <table style="width: 100%; border-collapse: collapse; border: none;">
                    <thead><tr><td style="height: 40px; border: none; padding: 0;"><div style="height:40px;color:transparent;">&nbsp;</div></td></tr></thead>
                    <tbody><tr><td style="padding: 0 40px; border: none;">
                        ${htmlContent}
                    </td></tr></tbody>
                    <tfoot><tr><td style="height: 40px; border: none; padding: 0;"><div style="height:40px;color:transparent;">&nbsp;</div></td></tr></tfoot>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    // ========== DOCX DOWNLOAD (Styled Word Export) ==========
    const handleDownloadDOCX = () => {
        if (!paper) return;

        const rawContent = isMarkdownPaper
            ? paper.content + (paper.solution ? "\n\n---\n\nANSWER KEY\n\n" + paper.solution : "")
            : buildTextFromJSON(paper);

        const lines = rawContent.split("\n");
        const children: Paragraph[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                children.push(new Paragraph({ text: "" }));
                continue;
            }

            // HTML center tags → centered heading
            if (trimmed.startsWith("<center>") || trimmed.startsWith("</center>")) continue;
            if (trimmed.startsWith("<h1>")) {
                const text = trimmed.replace(/<\/?h1>/g, "");
                children.push(new Paragraph({
                    children: [new TextRun({ text, bold: true, size: 32, font: "Calibri" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                }));
                continue;
            }
            if (trimmed.startsWith("<h3>")) {
                const text = trimmed.replace(/<\/?h3>/g, "");
                children.push(new Paragraph({
                    children: [new TextRun({ text, bold: true, size: 24, font: "Calibri" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }));
                continue;
            }

            // Markdown headings
            if (trimmed.startsWith("### ")) {
                const text = trimmed.replace("### ", "").replace(/\*\*/g, "");
                children.push(new Paragraph({
                    children: [new TextRun({ text, bold: true, size: 26, font: "Calibri" })],
                    spacing: { before: 300, after: 100 },
                    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" } },
                }));
                continue;
            }
            if (trimmed.startsWith("## ")) {
                const text = trimmed.replace("## ", "").replace(/\*\*/g, "");
                children.push(new Paragraph({
                    children: [new TextRun({ text, bold: true, size: 28, font: "Calibri" })],
                    spacing: { before: 400, after: 150 },
                }));
                continue;
            }
            if (trimmed.startsWith("# ")) {
                const text = trimmed.replace("# ", "").replace(/\*\*/g, "");
                children.push(new Paragraph({
                    children: [new TextRun({ text, bold: true, size: 32, font: "Calibri" })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }));
                continue;
            }

            // Horizontal rule
            if (trimmed === "---" || trimmed === "***") {
                children.push(new Paragraph({
                    text: "",
                    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" } },
                    spacing: { before: 200, after: 200 },
                }));
                continue;
            }

            // Bold lines (e.g., **Q.1 ...**)
            if (trimmed.startsWith("**") && trimmed.includes("**")) {
                const plainText = trimmed.replace(/\*\*/g, "");
                const isBoldEntire = trimmed.endsWith("**");
                children.push(new Paragraph({
                    children: [new TextRun({ text: plainText, bold: isBoldEntire, size: 22, font: "Calibri" })],
                    spacing: { before: 120, after: 80 },
                }));
                continue;
            }

            // MCQ options like (a), (b), etc.
            if (/^\([a-d]\)/i.test(trimmed)) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: trimmed, size: 22, font: "Calibri" })],
                    indent: { left: 720 }, // 0.5 inch indent
                    spacing: { after: 40 },
                }));
                continue;
            }

            // Regular paragraph
            const plainText = trimmed.replace(/\*\*/g, "").replace(/\*/g, "");
            children.push(new Paragraph({
                children: [new TextRun({ text: plainText, size: 22, font: "Calibri" })],
                spacing: { after: 80 },
            }));
        }

        const buildDocx = async () => {
            let backgroundOptions: any = {};
            if (paper?.watermark) {
                try {
                    // Fetch the data URL and convert to ArrayBuffer for docx
                    const res = await fetch(paper.watermark);
                    const blob = await res.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    
                    let w = 800;
                    let h = 800;
                    
                    await new Promise<void>((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const ratio = Math.min(800 / img.width, 800 / img.height);
                            w = img.width * ratio;
                            h = img.height * ratio;
                            resolve();
                        };
                        img.onerror = () => resolve();
                        img.src = paper.watermark;
                    });
                    
                    backgroundOptions = {
                        headers: {
                            default: new Header({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new ImageRun({
                                                data: arrayBuffer,
                                                transformation: {
                                                    width: w,
                                                    height: h,
                                                },
                                                type: "png",
                                                floating: {
                                                    horizontalPosition: {
                                                        align: HorizontalPositionAlign.CENTER,
                                                    },
                                                    verticalPosition: {
                                                        align: VerticalPositionAlign.CENTER,
                                                    },
                                                    behindDocument: true,
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        },
                    };
                } catch (e) {
                    console.error("Failed to add watermark to DOCX", e);
                }
            }

            const document = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 720, right: 720, bottom: 720, left: 720 },
                        },
                    },
                    ...backgroundOptions,
                    children
                }]
            });
            const blob = await Packer.toBlob(document);
            saveBlob(blob, `${paper?.subject || "paper"}-${id}.docx`);
        };
        buildDocx();
    };

    // Helper: Build plain text from JSON paper (for Custom Generator papers)
    const buildTextFromJSON = (p: any): string => {
        let text = `${p.title || p.subject || "Question Paper"}\n\n`;
        text += `Max Marks: ${p.totalMarks || "N/A"} | Time: 1.5 Hours\n\n`;
        if (p.instructions) text += `Instructions: ${p.instructions}\n\n---\n\n`;
        let currentSection = "";
        (p.questions || []).forEach((q: any, i: number) => {
            if (q.section !== currentSection) {
                text += `\n### ${q.section}\n`;
                if (q.sectionInstruction) text += `*${q.sectionInstruction}*\n`;
                currentSection = q.section;
            }
            text += `\n**Q.${i + 1}** ${q.text} **[${q.marks} Mark(s)]**\n`;
            if (q.options) {
                q.options.forEach((opt: string, idx: number) => {
                    text += `(${String.fromCharCode(97 + idx)}) ${opt}\n`;
                });
            }
        });
        return text;
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center">Loading paper...</div>;
    if (!paper) return <div className="p-10 text-center">Paper not found.</div>;

    // Markdown components for beautiful rendering in the viewer
    const markdownComponents: any = {
        h1: ({ node, ...props }: any) => <h1 style={{ borderBottom: "2px solid #0f172a", textAlign: "center", marginBottom: "20px", paddingBottom: "10px", textTransform: "uppercase" }} className="text-3xl font-bold" {...props} />,
        h2: ({ node, ...props }: any) => <h2 style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #1e293b", padding: "10px", marginTop: "30px", marginBottom: "15px", textTransform: "uppercase" }} className="text-xl font-bold" {...props} />,
        h3: ({ node, ...props }: any) => <h3 style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #1e293b", padding: "10px", marginTop: "30px", marginBottom: "15px", textTransform: "uppercase" }} className="text-lg font-bold" {...props} />,
        table: ({ node, ...props }: any) => <div className="overflow-x-auto my-6"><table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0" }} {...props} /></div>,
        th: ({ node, ...props }: any) => <th style={{ padding: "12px", fontWeight: "bold", borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "left" }} {...props} />,
        td: ({ node, ...props }: any) => <td style={{ padding: "12px", color: "#475569", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }} {...props} />,
        p: ({ node, ...props }: any) => <p style={{ marginBottom: "12px", lineHeight: "1.7", textAlign: "justify" }} {...props} />,
        blockquote: ({ node, ...props }: any) => <blockquote style={{ backgroundColor: "#f1f5f9", borderLeft: "4px solid #334155", padding: "16px", margin: "24px 0", borderRadius: "0 8px 8px 0", fontStyle: "italic" }} {...props} />,
        hr: ({ node, ...props }: any) => <hr style={{ margin: "30px 0", borderTop: "2px solid #cbd5e1" }} {...props} />,
        ul: ({ node, ...props }: any) => <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
        ol: ({ node, ...props }: any) => <ol style={{ listStyleType: "decimal", paddingLeft: "20px", marginBottom: "16px" }} {...props} />,
        li: ({ node, ...props }: any) => <li style={{ marginBottom: "6px", paddingLeft: "5px" }} {...props} />,
    };

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
                        <Button variant="outline" size="sm" onClick={handleDownloadDOCX}>
                            <Download className="h-4 w-4 mr-2" /> Word
                        </Button>
                        <Button size="sm" onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Download className="h-4 w-4 mr-2" /> PDF
                        </Button>
                    </div>
                </div>

                {/* Paper Content */}
                <GlassCard className="p-12 print:shadow-none print:border-none print:p-4 relative">
                    <div ref={contentRef} style={{ backgroundColor: "#ffffff", padding: "20px", color: "#1e293b", position: "relative" }}>
                        
                        {/* Print Watermark overlay */}
                        {paper?.watermark && (
                            <div className="watermark-container-preview hidden print:flex fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none w-full h-full justify-center items-center">
                                <img src={paper.watermark} alt="Watermark" className="w-[80%] max-w-[800px] object-contain opacity-15 mix-blend-multiply" />
                            </div>
                        )}

                        {isMarkdownPaper ? (
                            /* ===== MARKDOWN PAPER (Smart Generator) ===== */
                            <div className="prose prose-slate max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                                    {paper.content}
                                </ReactMarkdown>

                                {paper.solution && (
                                    <div className="print:break-before-page" style={{ backgroundColor: "rgba(240, 253, 244, 0.5)", borderTop: "4px dotted #cbd5e1", padding: "24px", marginTop: "30px", borderRadius: "12px", position: "relative" }}>
                                        <div style={{ position: "absolute", top: "0", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#dcfce7", padding: "4px 16px", borderRadius: "999px", color: "#166534", fontWeight: "bold", fontSize: "14px", border: "1px solid #bbf7d0" }}>ANSWER KEY</div>
                                        <div className="prose prose-green max-w-none" style={{ color: "#166534" }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
                                                ...markdownComponents,
                                                h2: ({ node, ...props }: any) => <h2 style={{ color: "#14532d", borderBottom: "1px solid #bbf7d0", paddingBottom: "4px", marginTop: "24px", marginBottom: "12px" }} className="text-xl font-bold" {...props} />,
                                            }}>
                                                {paper.solution}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ===== JSON PAPER (Custom Generator) ===== */
                            <>
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
                                    {(paper?.questions || []).map((q: any, i: number, arr: any[]) => (
                                        <div key={i}>
                                            {(i === 0 || arr[i - 1].section !== q.section) && (
                                                <div className="mb-4 mt-8">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h4 className="font-bold text-slate-900 text-lg uppercase tracking-wider">{q.section}</h4>
                                                        <div className="h-px bg-slate-200 flex-1"></div>
                                                    </div>
                                                    {q.sectionInstruction && (
                                                        <p className="text-sm font-medium text-indigo-600 italic px-3 py-1.5 bg-indigo-50/50 rounded-md inline-block border border-indigo-100/50">
                                                            {q.sectionInstruction}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-4 group">
                                                <span className="font-bold text-slate-700 w-6 shrink-0">{i + 1}.</span>
                                                <div className="flex-1">
                                                    <p className="text-slate-800 leading-relaxed font-medium">{q.text}</p>
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
                            </>
                        )}

                        <div className="mt-12 pt-8 text-center text-xs text-slate-400">
                            {/* Footer text removed as requested */}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
