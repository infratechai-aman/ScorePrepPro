"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { ChevronRight, FileText, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RecentPapers() {
    const { user } = useAuth();
    const router = useRouter();
    const [papers, setPapers] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const fetchPapers = async () => {
                try {
                    const q = query(
                        collection(db, "users", user.uid, "papers"),
                        orderBy("createdAt", "desc"),
                        limit(4)
                    );
                    const snapshot = await getDocs(q);
                    setPapers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) {
                    console.error(e);
                }
            };
            fetchPapers();
        }
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold text-slate-800">Recently Built Papers</h3>
                <span
                    onClick={() => router.push("/teacher-dashboard/repository")}
                    className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                    Access Vault <ArrowRight className="w-3 h-3" />
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {papers.map((paper) => (
                    <div
                        key={paper.id}
                        onClick={() => router.push(`/teacher-dashboard/paper/${paper.id}`)}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex items-center gap-4 relative z-10 w-full overflow-hidden">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{paper.subject}</h4>
                                <p className="text-xs text-slate-500 truncate">{paper.chapter ? paper.chapter : `Class ${paper.grade}`} • {paper.totalMarks} Marks</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">
                                        {paper.difficulty || 'Mixed'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {paper.createdAt ? new Date(paper.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 relative z-10" />
                    </div>
                ))}

                {papers.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm">No papers generated yet. Create your first paper to see it here.</p>
                        <Link href="/teacher-dashboard/question-generator" className="text-indigo-600 font-bold text-sm mt-2 inline-block">Create Now</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
