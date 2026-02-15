"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { FileText, Search, Trash2, Eye, Filter, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Paper {
    id: string;
    subject: string;
    grade: string;
    chapter?: string;
    totalMarks: number;
    difficulty?: string;
    createdAt: any;
}

export function PaperRepositoryList() {
    const { user } = useAuth();
    const router = useRouter();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");

    useEffect(() => {
        if (user) {
            fetchPapers();
        }
    }, [user]);

    const fetchPapers = async () => {
        try {
            const q = query(
                collection(db, "users", user!.uid, "papers"),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Paper));
            setPapers(data);
            setFilteredPapers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = papers;

        if (searchQuery) {
            result = result.filter(p =>
                p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.chapter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.grade.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedSubject !== "All") {
            result = result.filter(p => p.subject === selectedSubject);
        }

        setFilteredPapers(result);
    }, [searchQuery, selectedSubject, papers]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this paper?")) return;

        try {
            await deleteDoc(doc(db, "users", user!.uid, "papers", id));
            setPapers(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting paper:", error);
            alert("Failed to delete paper");
        }
    };

    const uniqueSubjects = ["All", ...Array.from(new Set(papers.map(p => p.subject)))];

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading your repository...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by subject, chapter, or class..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {uniqueSubjects.map(sub => (
                        <button
                            key={sub}
                            onClick={() => setSelectedSubject(sub)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedSubject === sub
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPapers.map((paper) => (
                        <div
                            key={paper.id}
                            onClick={() => router.push(`/teacher-dashboard/paper/${paper.id}`)} // Assuming this route exists or matches RecentPapers logic
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden flex flex-col"
                        >
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${paper.difficulty === 'Hard' ? 'bg-red-50 text-red-600' :
                                                paper.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {paper.difficulty || 'Mixed'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{paper.subject}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                                    {paper.chapter || `Class ${paper.grade} - Complete Syllabus`}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        {paper.totalMarks} Marks
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(paper.createdAt?.seconds * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider px-2">View Paper</span>
                                <button
                                    onClick={(e) => handleDelete(paper.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Paper"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No papers found</h3>
                    <p className="text-slate-500 mb-6">Try adjusting your filters or create a new paper.</p>
                    <Button onClick={() => router.push("/teacher-dashboard/question-generator")}>
                        Generate New Paper
                    </Button>
                </div>
            )}
        </div>
    );
}
