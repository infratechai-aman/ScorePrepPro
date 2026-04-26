"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UnitCard } from "@/components/teacher/UnitCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, ArrowLeft, Layers, Sparkles, FileText, Brain } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function SubjectDetailPage() {
    const { subjectId } = useParams() as { subjectId: string };
    const [subject, setSubject] = useState<any>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", description: "" });

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch subject
            const subjectDoc = await getDoc(doc(db, "customSubjects", subjectId));
            if (subjectDoc.exists()) {
                setSubject({ id: subjectDoc.id, ...subjectDoc.data() });
            }

            // Fetch units
            const unitsSnap = await getDocs(collection(db, "customSubjects", subjectId, "units"));
            setUnits(unitsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUnit = async () => {
        if (!form.title.trim()) return;
        setCreating(true);
        try {
            const res = await fetch(`/api/custom-subjects/${subjectId}/units`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowCreate(false);
            setForm({ title: "", description: "" });
            fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader title="Loading..." />
                <main className="p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/3" />
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title={subject?.name || "Subject"} />

            <main className="p-8 space-y-8 max-w-6xl">
                {/* Back + Header */}
                <div>
                    <Link href="/teacher-dashboard/custom-subjects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Subjects
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 font-serif">{subject?.name}</h1>
                            <p className="text-slate-500 mt-1">{subject?.description || "No description"}</p>
                            <div className="flex gap-2 mt-3">
                                {subject?.grade && (
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{subject.grade}</span>
                                )}
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">{subject?.board}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href={`/teacher-dashboard/custom-generate?subjectId=${subjectId}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-2">
                                    <Sparkles size={16} /> Generate
                                </Button>
                            </Link>
                            <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                                <Plus size={16} /> Add Unit
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <GlassCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Layers className="text-indigo-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{units.length}</p>
                            <p className="text-xs text-slate-500">Units</p>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <Brain className="text-emerald-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {units.filter(u => u.knowledgeExtracted).length}
                            </p>
                            <p className="text-xs text-slate-500">AI Ready</p>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <FileText className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {units.reduce((acc, u) => acc + (u.materialCount || 0), 0)}
                            </p>
                            <p className="text-xs text-slate-500">Files Uploaded</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <GlassCard className="w-full max-w-lg p-6 space-y-5">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Add New Unit</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Unit Title *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                        placeholder="e.g., Unit 1 - Introduction to Python"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none h-20"
                                        placeholder="Brief description of what this unit covers..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 rounded-xl">Cancel</Button>
                                <Button onClick={handleCreateUnit} isLoading={creating} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                                    Create Unit
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Units List */}
                {units.length === 0 ? (
                    <GlassCard className="p-12 text-center">
                        <Layers className="mx-auto text-slate-300 mb-3" size={40} />
                        <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">No units yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Add units to organize your content. Upload materials in each unit.</p>
                        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                            <Plus size={18} /> Add First Unit
                        </Button>
                    </GlassCard>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {units.map(unit => (
                            <UnitCard
                                key={unit.id}
                                id={unit.id}
                                subjectId={subjectId}
                                title={unit.title}
                                description={unit.description}
                                materialCount={unit.materialCount || 0}
                                knowledgeExtracted={unit.knowledgeExtracted || false}
                                concepts={unit.concepts}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
