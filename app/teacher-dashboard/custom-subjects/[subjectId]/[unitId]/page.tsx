"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FileUploader } from "@/components/teacher/FileUploader";
import { KnowledgeViewer } from "@/components/teacher/KnowledgeViewer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, FileText, Sparkles, BookOpen, ClipboardList, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function UnitDetailPage() {
    const { subjectId, unitId } = useParams() as { subjectId: string; unitId: string };
    const [subject, setSubject] = useState<any>(null);
    const [unit, setUnit] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [subjectId, unitId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const subjectDoc = await getDoc(doc(db, "customSubjects", subjectId));
            if (subjectDoc.exists()) setSubject({ id: subjectDoc.id, ...subjectDoc.data() });

            const unitDoc = await getDoc(doc(db, "customSubjects", subjectId, "units", unitId));
            if (unitDoc.exists()) setUnit({ id: unitDoc.id, ...unitDoc.data() });

            const matsSnap = await getDocs(collection(db, "customSubjects", subjectId, "units", unitId, "materials"));
            setMaterials(matsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Delete this file?")) return;
        try {
            await deleteDoc(doc(db, "customSubjects", subjectId, "units", unitId, "materials", materialId));
            setMaterials(prev => prev.filter(m => m.id !== materialId));
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader title="Loading..." />
                <main className="p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/3" />
                        <div className="h-40 bg-slate-100 rounded-2xl" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title={unit?.title || "Unit"} />

            <main className="p-8 space-y-8 max-w-5xl">
                {/* Breadcrumb */}
                <div>
                    <Link href={`/teacher-dashboard/custom-subjects/${subjectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to {subject?.name}
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 font-serif">{unit?.title}</h1>
                            <p className="text-slate-500 mt-1">{unit?.description || "No description"}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {unit?.knowledgeExtracted && (
                    <div className="flex flex-wrap gap-3">
                        <Link href={`/teacher-dashboard/custom-generate?subjectId=${subjectId}&unitId=${unitId}&type=notes`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
                                <BookOpen size={16} /> Generate Notes
                            </Button>
                        </Link>
                        <Link href={`/teacher-dashboard/custom-generate?subjectId=${subjectId}&unitId=${unitId}&type=paper`}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                                <FileText size={16} /> Generate Paper
                            </Button>
                        </Link>
                        <Link href={`/teacher-dashboard/custom-generate?subjectId=${subjectId}&unitId=${unitId}&type=mcqs`}>
                            <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2">
                                <ClipboardList size={16} /> Generate MCQs
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Upload Section */}
                <GlassCard className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-600" size={20} />
                        <h2 className="text-lg font-bold text-slate-900 font-serif">Upload Content</h2>
                    </div>
                    <p className="text-sm text-slate-500">
                        Upload PDFs, DOCX, PPT, or images. AI will extract and permanently remember the content for all future generations.
                    </p>
                    <FileUploader
                        subjectId={subjectId}
                        unitId={unitId}
                        onUploadComplete={() => fetchData()}
                    />
                </GlassCard>

                {/* Uploaded Files */}
                {materials.length > 0 && (
                    <GlassCard className="p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 font-serif">Uploaded Materials ({materials.length})</h2>
                        <div className="divide-y divide-slate-100">
                            {materials.map((mat) => (
                                <div key={mat.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <FileText size={16} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{mat.fileName}</p>
                                            <p className="text-xs text-slate-400">
                                                {mat.fileType?.toUpperCase()} • {mat.fileSize ? `${(mat.fileSize / 1024).toFixed(0)} KB` : ""}
                                                {mat.processed && " • ✅ Processed"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMaterial(mat.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {/* AI Knowledge */}
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 font-serif">AI Knowledge Base</h2>
                    <KnowledgeViewer
                        summary={unit?.knowledgeSummary}
                        concepts={unit?.concepts}
                        definitions={unit?.definitions}
                        formulas={unit?.formulas}
                        keyTopics={unit?.keyTopics}
                    />
                </div>
            </main>
        </div>
    );
}
