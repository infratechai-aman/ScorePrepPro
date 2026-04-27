"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SubjectCard } from "@/components/teacher/SubjectCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, BookOpen, Lock, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";

export default function CustomSubjectsPage() {
    const { userData } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: "", grade: "", board: "Custom", description: "" });

    const isTheTeacher = userData?.plan === "the_teacher";

    useEffect(() => {
        if (userData?.uid) fetchSubjects();
    }, [userData?.uid]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/custom-subjects?teacherUid=${userData?.uid}`);
            const data = await res.json();
            if (res.ok) {
                setSubjects(data.subjects || []);
            } else {
                console.error("Error fetching subjects:", data.error);
            }
        } catch (err) {
            console.error("Error fetching subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/custom-subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherUid: userData?.uid, ...form }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowCreate(false);
            setForm({ name: "", grade: "", board: "Custom", description: "" });
            fetchSubjects();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this subject and all its units? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "customSubjects", id));
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    // Plan gate
    if (!isTheTeacher) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader title="Custom Subjects" />
                <div className="flex items-center justify-center h-[calc(100vh-160px)]">
                    <GlassCard className="max-w-md p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                            <Lock className="text-purple-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-slate-900">THE TEACHER Plan Required</h2>
                        <p className="text-slate-500 text-sm">
                            Create your own custom subjects, upload content, and let AI remember everything.
                            Upgrade to <span className="font-bold text-purple-600">THE TEACHER</span> plan to unlock this feature.
                        </p>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = "/pricing"}>
                            <Sparkles size={16} className="mr-2" /> Upgrade Now
                        </Button>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Custom Subjects" />

            <main className="p-8 space-y-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Your Subjects</h1>
                        <p className="text-slate-500 mt-1">
                            Create custom subjects and upload your own content. AI remembers everything.
                            <span className="text-indigo-600 font-medium"> ({subjects.length}/2 subjects used)</span>
                        </p>
                    </div>
                    {subjects.length < 2 && (
                        <Button
                            onClick={() => setShowCreate(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"
                        >
                            <Plus size={18} /> New Subject
                        </Button>
                    )}
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <GlassCard className="w-full max-w-lg p-6 space-y-5">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Create Custom Subject</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Subject Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                        placeholder="e.g., Advanced Python, Robotics, JEE Chemistry"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Grade / Class</label>
                                        <input
                                            type="text"
                                            value={form.grade}
                                            onChange={(e) => setForm({ ...form, grade: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                            placeholder="e.g., Class 10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1 block">Board / Exam Type</label>
                                        <input
                                            type="text"
                                            value={form.board}
                                            onChange={(e) => setForm({ ...form, board: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                            placeholder="e.g., JEE, Custom, Internal"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none h-20"
                                        placeholder="Brief description of the subject..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 rounded-xl">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    isLoading={creating}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                                >
                                    Create Subject
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Subjects Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4" />
                                <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-slate-100 rounded w-full mb-4" />
                                <div className="h-8 bg-slate-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : subjects.length === 0 ? (
                    <GlassCard className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                            <BookOpen className="text-indigo-400" size={36} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">No subjects yet</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Create your first custom subject to get started. Upload content and let AI do the rest.
                        </p>
                        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                            <Plus size={18} /> Create First Subject
                        </Button>
                    </GlassCard>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {subjects.map(subject => (
                            <SubjectCard
                                key={subject.id}
                                id={subject.id}
                                name={subject.name}
                                grade={subject.grade}
                                board={subject.board}
                                description={subject.description}
                                unitCount={subject.unitCount || 0}
                                createdAt={subject.createdAt}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
