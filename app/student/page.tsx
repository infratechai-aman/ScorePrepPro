"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { FileText, Clock, CheckCircle, Users, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function StudentDashboard() {
    const { userData } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState("");
    const [joining, setJoining] = useState(false);

    useEffect(() => { if (userData?.uid) fetchExams(); }, [userData?.uid]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/exams?studentUid=${userData?.uid}`);
            const d = await r.json();
            // Check which exams student has already submitted
            const examsWithStatus = await Promise.all((d.exams || []).map(async (exam: any) => {
                try {
                    const subDoc = await getDoc(doc(db, "exams", exam.id, "submissions", userData!.uid));
                    return { ...exam, submitted: subDoc.exists(), submission: subDoc.exists() ? subDoc.data() : null };
                } catch { return { ...exam, submitted: false }; }
            }));
            setExams(examsWithStatus);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        try {
            const r = await fetch("/api/classrooms/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentUid: userData?.uid, studentName: userData?.name, studentEmail: userData?.email, code: joinCode }) });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            alert(`Joined ${d.classroomName}!`);
            setJoinCode("");
            fetchExams();
        } catch (e: any) { alert(e.message); } finally { setJoining(false); }
    };

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">Welcome, {userData?.name || "Student"}!</h1>
                <p className="text-slate-500 mt-1">Your exams and classroom activity.</p>
            </div>

            {/* Join Classroom */}
            <GlassCard className="p-5 flex items-end gap-4">
                <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Join a Classroom</label>
                    <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter classroom code" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm font-mono tracking-widest uppercase" />
                </div>
                <Button onClick={handleJoin} isLoading={joining} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2"><Plus size={16} /> Join</Button>
            </GlassCard>

            {/* Exams */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif">Your Exams</h2>
                {loading ? (
                    <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-24" />)}</div>
                ) : exams.length === 0 ? (
                    <GlassCard className="p-8 text-center">
                        <FileText className="mx-auto text-slate-300 mb-3" size={36} />
                        <p className="text-slate-500 text-sm">No exams yet. Join a classroom to see assigned exams.</p>
                    </GlassCard>
                ) : (
                    exams.map(exam => (
                        <GlassCard key={exam.id} className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">{exam.title}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                        <span>{exam.totalQuestions || exam.mcqs?.length} MCQs</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {exam.timeLimit} min</span>
                                    </div>
                                </div>
                                {exam.submitted ? (
                                    <Link href={`/student/exam/${exam.id}/result`}>
                                        <Button variant="outline" className="rounded-xl gap-2 text-emerald-600 border-emerald-200">
                                            <CheckCircle size={16} /> Score: {exam.submission?.percentage}%
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/student/exam/${exam.id}`}>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">Start Exam</Button>
                                    </Link>
                                )}
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </main>
    );
}
