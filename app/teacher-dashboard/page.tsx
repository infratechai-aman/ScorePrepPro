"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Crown, BookOpen, Plus, FileText, Settings, LogOut, Trash2 } from "lucide-react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TeacherDashboardPage() {
    const { user, userData, logout, loading, refreshUserData } = useAuth();
    const { usage, limits } = useUsage();
    const router = useRouter();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [newSubjectType, setNewSubjectType] = useState("School");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (userData && userData.plan !== 'teacher') {
            router.push("/dashboard");
        } else if (user) {
            fetchSubjects();
        }
    }, [user, userData, loading, router]);

    const fetchSubjects = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "users", user.uid, "custom_subjects"));
            const querySnapshot = await getDocs(q);
            const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubjects(subs);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim() || !user) return;
        if (subjects.length >= 3) {
            alert("Limit reached: You can add up to 3 custom subjects.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "users", user.uid, "custom_subjects"), {
                name: newSubjectName,
                type: newSubjectType,
                createdAt: serverTimestamp()
            });
            setNewSubjectName("");
            setIsAddingSubject(false);
            fetchSubjects();
        } catch (error) {
            console.error("Error adding subject:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!user || !confirm("Are you sure? This will delete all units and notes associated with this subject.")) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "custom_subjects", id));
            fetchSubjects();
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-slate-50 to-white opacity-70"></div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Teacher Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">Subject Management</h1>
                        <p className="text-slate-600">manage your custom curriculum, units, and AI notes.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Go to Generator
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={async () => { await logout(); router.push("/login"); }}>
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>

                {/* Stats & Actions Grid */}
                <div className="grid md:grid-cols-4 gap-6">
                    <GlassCard className="p-6 md:col-span-3">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" /> Your Custom Subjects
                            </h2>
                            <Button size="sm" onClick={() => setIsAddingSubject(true)} disabled={subjects.length >= 3}>
                                <Plus className="h-4 w-4 mr-2" /> Add Subject
                            </Button>
                        </div>

                        {isAddingSubject && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Subject</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Subject Name (e.g., Computer Science)"
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                    />
                                    <select
                                        className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                                        value={newSubjectType}
                                        onChange={(e) => setNewSubjectType(e.target.value)}
                                    >
                                        <option value="School">School Level</option>
                                        <option value="College">College Level</option>
                                        <option value="Degree">Degree/Professional</option>
                                    </select>
                                    <Button onClick={handleAddSubject} isLoading={isSubmitting}>Save</Button>
                                    <Button variant="ghost" onClick={() => setIsAddingSubject(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <div key={subject.id} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {subject.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{subject.name}</h4>
                                                <p className="text-xs text-slate-500">{subject.type} • 0 Units Created</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/teacher-dashboard/subject/${subject.id}`)}>
                                                Manage Units
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-500" onClick={() => handleDeleteSubject(subject.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No custom subjects added yet.</p>
                                    <p className="text-sm">Add a subject to start creating units and notes.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Crown className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-bold">Plan Status</h3>
                            </div>
                            <div className="space-y-1 mb-4">
                                <p className="text-purple-100 text-sm">Active Plan</p>
                                <p className="text-2xl font-bold">Teacher Mode</p>
                            </div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-2">
                                <div className="bg-white h-full rounded-full" style={{ width: '10%' }}></div>
                            </div>
                            <p className="text-xs text-purple-200">Renew in 6 months</p>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" /> Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subjects</span>
                                    <span className="font-semibold text-slate-900">{subjects.length} / 3</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Units</span>
                                    <span className="font-semibold text-slate-900">-</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Notes Generated</span>
                                    <span className="font-semibold text-slate-900">0</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </main>
    );
}
