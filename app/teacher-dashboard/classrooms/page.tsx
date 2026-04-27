"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Users, Copy, Check, Lock, Sparkles } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function ClassroomsPage() {
    const { userData } = useAuth();
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const isTheTeacher = userData?.plan === "the_teacher";

    useEffect(() => {
        if (userData?.uid) fetchClassrooms();
    }, [userData?.uid]);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/classrooms?teacherUid=${userData?.uid}`);
            const data = await res.json();
            if (res.ok) {
                setClassrooms(data.classrooms || []);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/classrooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherUid: userData?.uid, name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowCreate(false);
            setName("");
            fetchClassrooms();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isTheTeacher) {
        return (
            <div className="min-h-screen bg-slate-50">
                <DashboardHeader title="Classrooms" />
                <div className="flex items-center justify-center h-[calc(100vh-160px)]">
                    <GlassCard className="max-w-md p-8 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center">
                            <Lock className="text-purple-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-slate-900">THE TEACHER Plan Required</h2>
                        <p className="text-slate-500 text-sm">Create classrooms, assign exams, and track student progress.</p>
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
            <DashboardHeader title="Classrooms" />

            <main className="p-8 space-y-8 max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Your Classrooms</h1>
                        <p className="text-slate-500 mt-1">Create classrooms and share the join code with your students.</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                        <Plus size={18} /> New Classroom
                    </Button>
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <GlassCard className="w-full max-w-md p-6 space-y-5">
                            <h2 className="text-xl font-bold font-serif text-slate-900">Create Classroom</h2>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Classroom Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                    placeholder="e.g., Class 10-A, Python Batch 2026"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 rounded-xl">Cancel</Button>
                                <Button onClick={handleCreate} isLoading={creating} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                                    Create
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Classrooms Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-40" />
                        ))}
                    </div>
                ) : classrooms.length === 0 ? (
                    <GlassCard className="p-12 text-center">
                        <Users className="mx-auto text-slate-300 mb-3" size={40} />
                        <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">No classrooms yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Create a classroom and share the code with your students.</p>
                        <Button onClick={() => setShowCreate(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                            <Plus size={18} /> Create First Classroom
                        </Button>
                    </GlassCard>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map(room => (
                            <Link key={room.id} href={`/teacher-dashboard/classrooms/${room.id}`}>
                                <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                            <Users className="text-indigo-600" size={24} />
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyCode(room.code, room.id); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-sm font-mono font-bold text-slate-700 transition-colors"
                                        >
                                            {copiedId === room.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                            {room.code}
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">{room.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {room.actualStudentCount || 0} students
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
