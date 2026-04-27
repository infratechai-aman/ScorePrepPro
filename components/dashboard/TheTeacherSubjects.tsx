"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BookOpen, ArrowRight, Plus, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export function TheTeacherSubjects() {
    const { userData } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?.uid) fetchSubjects();
    }, [userData?.uid]);

    const fetchSubjects = async () => {
        try {
            const q = query(collection(db, "customSubjects"), where("teacherUid", "==", userData?.uid));
            const snap = await getDocs(q);
            const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setSubjects(subs);
        } catch (err) {
            console.error("Error fetching subjects:", err);
        } finally {
            setLoading(false);
        }
    };

    const getGradient = (index: number) => {
        const gradients = [
            "from-violet-500 via-purple-500 to-fuchsia-500",
            "from-blue-500 via-indigo-500 to-violet-500",
            "from-emerald-500 via-teal-500 to-cyan-500",
            "from-orange-500 via-amber-500 to-yellow-500",
        ];
        return gradients[index % gradients.length];
    };

    const getBgGlow = (index: number) => {
        const glows = [
            "bg-purple-500/10",
            "bg-indigo-500/10",
            "bg-teal-500/10",
            "bg-amber-500/10",
        ];
        return glows[index % glows.length];
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Your Subjects</h3>
                <Link
                    href="/teacher-dashboard/custom-subjects"
                    className="text-xs font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 uppercase tracking-wide flex items-center gap-1 transition-colors"
                >
                    Manage Subjects <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 gap-5">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 mb-4" />
                            <div className="h-5 bg-slate-100 rounded w-2/3 mb-2" />
                            <div className="h-3 bg-slate-50 rounded w-full" />
                        </div>
                    ))}
                </div>
            ) : subjects.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-5">
                    {subjects.map((sub, i) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.1 }}
                        >
                            <Link href={`/teacher-dashboard/custom-subjects`}>
                                <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
                                    {/* Glow blob */}
                                    <div className={`absolute -top-8 -right-8 w-32 h-32 ${getBgGlow(i)} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Icon with gradient bg */}
                                    <div className={`relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(i)} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Info */}
                                    <div className="relative z-10">
                                        <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">{sub.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                                                <Layers className="w-3 h-3" />
                                                {sub.unitCount || 0} Units
                                            </span>
                                            {sub.grade && (
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {sub.grade}
                                                </span>
                                            )}
                                        </div>
                                        {sub.description && (
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{sub.description}</p>
                                        )}
                                    </div>

                                    {/* Arrow indicator */}
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="relative bg-gradient-to-br from-slate-50 to-white p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center overflow-hidden group hover:border-indigo-200 transition-colors">
                    {/* Decorative blur */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                            <BookOpen className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-slate-500 font-medium mb-4">No custom subjects yet</p>
                        <Link
                            href="/teacher-dashboard/custom-subjects"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4" /> Create First Subject
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
