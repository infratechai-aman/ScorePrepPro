"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users, Copy, Check, Loader2, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";

export default function ClassroomDetailPage() {
    const { classroomId } = useParams() as { classroomId: string };
    const { userData } = useAuth();
    const [classroom, setClassroom] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => { fetchData(); }, [classroomId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const cDoc = await getDoc(doc(db, "classrooms", classroomId));
            if (cDoc.exists()) setClassroom({ id: cDoc.id, ...cDoc.data() });

            const sSnap = await getDocs(collection(db, "classrooms", classroomId, "students"));
            setStudents(sSnap.docs.map(d => ({ uid: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const copyCode = () => {
        if (classroom?.code) {
            navigator.clipboard.writeText(classroom.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const removeStudent = async (studentUid: string) => {
        if (!confirm("Remove this student from the classroom?")) return;
        try {
            await deleteDoc(doc(db, "classrooms", classroomId, "students", studentUid));
            await updateDoc(doc(db, "classrooms", classroomId), { studentCount: Math.max(0, (classroom?.studentCount || 1) - 1) });
            setStudents(prev => prev.filter(s => s.uid !== studentUid));
        } catch (e) { console.error(e); alert("Failed to remove student"); }
    };

    if (loading) return <div className="min-h-screen bg-slate-50"><DashboardHeader title="Classroom" /><div className="flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-indigo-600" size={32} /></div></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title={classroom?.name || "Classroom"} />
            <main className="p-8 space-y-6 max-w-5xl">
                <Link href="/teacher-dashboard/classrooms" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Back to Classrooms</Link>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">{classroom?.name}</h1>
                        <p className="text-slate-500 mt-1">{students.length} students enrolled</p>
                    </div>
                    <button onClick={copyCode}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-mono font-bold text-lg text-slate-700 transition-colors">
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        {classroom?.code}
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center"><Users className="text-indigo-600" size={24} /></div>
                        <div><p className="text-3xl font-bold text-slate-900">{students.length}</p><p className="text-xs text-slate-500">Students</p></div>
                    </GlassCard>
                    <GlassCard className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><Copy className="text-emerald-600" size={24} /></div>
                        <div><p className="text-lg font-bold font-mono text-slate-900">{classroom?.code}</p><p className="text-xs text-slate-500">Join Code</p></div>
                    </GlassCard>
                </div>

                {/* Student List */}
                <GlassCard className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 font-serif mb-4">Students</h2>
                    {students.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No students have joined yet. Share the code <strong>{classroom?.code}</strong> with your students.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Joined</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-600">Action</th>
                                </tr></thead>
                                <tbody>
                                    {students.map((s, i) => (
                                        <tr key={s.uid} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4 text-slate-500">{i + 1}</td>
                                            <td className="py-3 px-4 font-medium text-slate-900">{s.name || "Student"}</td>
                                            <td className="py-3 px-4 text-slate-500">{s.email || "-"}</td>
                                            <td className="py-3 px-4 text-slate-500">{s.joinedAt?.seconds ? new Date(s.joinedAt.seconds * 1000).toLocaleDateString() : "-"}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button onClick={() => removeStudent(s.uid)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>
            </main>
        </div>
    );
}
