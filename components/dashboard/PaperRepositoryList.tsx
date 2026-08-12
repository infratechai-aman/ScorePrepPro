"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { FileText, Search, Trash2, Calendar, BookOpen, ListChecks, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Paper {
    id: string;
    subject: string;
    grade: string;
    board?: string;
    chapter?: string;
    chapters?: string[];
    totalMarks: number;
    difficulty?: string;
    type?: string;
    isCustom?: boolean;
    worksheetMetadata?: {
        sections?: any[];
        duration?: number;
    };
    createdAt: any;
}

interface Note {
    id: string;
    subject: string;
    grade: string;
    board?: string;
    chapter: string;
    createdAt: any;
}

type ActiveTab = "subjective" | "objective" | "worksheet" | "notes";

export function PaperRepositoryList() {
    const { user } = useAuth();
    const router = useRouter();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [activeTab, setActiveTab] = useState<ActiveTab>("subjective");

    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [user]);

    const fetchAll = async () => {
        try {
            // Fetch papers
            const pq = query(
                collection(db, "users", user!.uid, "papers"),
                orderBy("createdAt", "desc")
            );
            const pSnap = await getDocs(pq);
            const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Paper));
            setPapers(pData);

            // Fetch notes
            const nq = query(
                collection(db, "users", user!.uid, "notes"),
                orderBy("createdAt", "desc")
            );
            const nSnap = await getDocs(nq);
            const nData = nSnap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
            setNotes(nData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── Paper bucketing by type ────────────────────────────────────────────────
    const subjectivePapers = papers.filter(p =>
        p.type === "subjective" || p.isCustom === true || (!p.type && !p.isCustom)
    );
    const objectivePapers = papers.filter(p => p.type === "objective");
    const worksheetPapers = papers.filter(p => p.type === "worksheet");

    // ── Current bucket based on active tab ────────────────────────────────────
    const currentPapers =
        activeTab === "subjective" ? subjectivePapers :
        activeTab === "objective" ? objectivePapers :
        activeTab === "worksheet" ? worksheetPapers : [];

    // ── Filtered papers (search + subject filter) ─────────────────────────────
    const filteredPapers = currentPapers.filter(p => {
        const matchSearch = !searchQuery ||
            p.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.chapter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.chapters?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.grade.toLowerCase().includes(searchQuery.toLowerCase());
        const matchSubject = selectedSubject === "All" || p.subject === selectedSubject;
        return matchSearch && matchSubject;
    });

    const filteredNotes = notes.filter(n => {
        const matchSearch = !searchQuery ||
            n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.chapter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.grade?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchSubject = selectedSubject === "All" || n.subject === selectedSubject;
        return matchSearch && matchSubject;
    });


    const handleDeletePaper = async (id: string, e: React.MouseEvent) => {
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

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteDoc(doc(db, "users", user!.uid, "notes", id));
            setNotes(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error deleting note:", error);
            alert("Failed to delete note");
        }
    };

    // ── Subject filter options per tab ─────────────────────────────────────────
    const allSubjects = activeTab === "notes"
        ? ["All", ...Array.from(new Set(notes.map(n => n.subject)))]
        : ["All", ...Array.from(new Set(currentPapers.map(p => p.subject)))];

    // ── Tab config ─────────────────────────────────────────────────────────────
    const tabs: { id: ActiveTab; label: string; count: number; icon: React.ReactNode; activeClass: string }[] = [
        { id: "subjective", label: "Subjective", count: subjectivePapers.length, icon: <FileText className="h-4 w-4" />, activeClass: "bg-indigo-600 text-white shadow-md" },
        { id: "objective", label: "Objective", count: objectivePapers.length, icon: <ListChecks className="h-4 w-4" />, activeClass: "bg-emerald-600 text-white shadow-md" },
        { id: "worksheet", label: "Worksheets", count: worksheetPapers.length, icon: <ClipboardList className="h-4 w-4" />, activeClass: "bg-violet-600 text-white shadow-md" },
        { id: "notes", label: "Notes", count: notes.length, icon: <BookOpen className="h-4 w-4" />, activeClass: "bg-amber-500 text-white shadow-md" },
    ];

    // ── Per-tab accent colours ─────────────────────────────────────────────────
    const accentMap: Record<ActiveTab, { icon: string; viewText: string; borderTop: string; bgFooter: string }> = {
        subjective: { icon: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white", viewText: "text-indigo-600", borderTop: "border-t border-slate-100", bgFooter: "bg-slate-50" },
        objective:  { icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white", viewText: "text-emerald-600", borderTop: "border-t border-emerald-100", bgFooter: "bg-emerald-50/50" },
        worksheet:  { icon: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white", viewText: "text-violet-600", borderTop: "border-t border-violet-100", bgFooter: "bg-violet-50/50" },
        notes:      { icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white", viewText: "text-amber-600", borderTop: "border-t border-amber-100", bgFooter: "bg-amber-50/50" },
    };
    const accent = accentMap[activeTab];

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading your repository...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit shadow-sm flex-wrap">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelectedSubject("All"); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                            ? tab.activeClass
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        {tab.icon} {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase() || ""}...`}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {allSubjects.map(sub => (
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

            {/* Papers Grid (Subjective / Objective / Worksheet) */}
            {activeTab !== "notes" && (
                <>
                    {filteredPapers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPapers.map((paper) => (
                                <div
                                    key={paper.id}
                                    onClick={() => router.push(`/teacher-dashboard/paper/${paper.id}`)}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden flex flex-col"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${accent.icon}`}>
                                                {activeTab === "subjective" && <FileText className="w-5 h-5" />}
                                                {activeTab === "objective" && <ListChecks className="w-5 h-5" />}
                                                {activeTab === "worksheet" && <ClipboardList className="w-5 h-5" />}
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
                                            {paper.chapter || (paper.chapters?.join(", ")) || `Class ${paper.grade} - Complete Syllabus`}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                {paper.totalMarks} Marks
                                            </div>
                                            {/* Worksheet: show sections & duration */}
                                            {activeTab === "worksheet" && paper.worksheetMetadata && (
                                                <>
                                                    {paper.worksheetMetadata.sections && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-300"></div>
                                                            {paper.worksheetMetadata.sections.length} Sections
                                                        </div>
                                                    )}
                                                    {paper.worksheetMetadata.duration && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-200"></div>
                                                            {paper.worksheetMetadata.duration} min
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {paper.createdAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(paper.createdAt?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`p-3 flex justify-between items-center ${accent.borderTop} ${accent.bgFooter}`}>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 ${accent.viewText}`}>View Paper</span>
                                        <button
                                            onClick={(e) => handleDeletePaper(paper.id, e)}
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
                        <EmptyState
                            type={activeTab}
                            onAction={() => router.push("/teacher-dashboard/smart-generate")}
                        />
                    )}
                </>
            )}

            {/* Notes Grid */}
            {activeTab === "notes" && (
                <>
                    {filteredNotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNotes.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => router.push(`/teacher-dashboard/note/${note.id}`)}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer overflow-hidden flex flex-col"
                                >
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-50 text-amber-600">
                                                Notes
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{note.subject}</h3>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                                            {note.chapter || `Class ${note.grade}`}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                            {note.board && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-300"></div>
                                                    {note.board === 'maharashtra' ? 'SSC' : note.board?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                Class {note.grade}
                                            </div>
                                            {note.createdAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(note.createdAt?.seconds * 1000).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-50/50 border-t border-amber-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider px-2">View Notes</span>
                                        <button
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState type="notes" onAction={() => router.push("/teacher-dashboard/notes-generator")} />
                    )}
                </>
            )}
        </div>
    );
}

function EmptyState({ type, onAction }: { type: ActiveTab; onAction: () => void }) {
    const config = {
        subjective: { icon: <FileText className="w-8 h-8 text-slate-300" />, label: "subjective papers", action: "Generate New Paper" },
        objective:  { icon: <ListChecks className="w-8 h-8 text-slate-300" />, label: "objective papers", action: "Generate Objective Paper" },
        worksheet:  { icon: <ClipboardList className="w-8 h-8 text-slate-300" />, label: "worksheets", action: "Generate Worksheet" },
        notes:      { icon: <BookOpen className="w-8 h-8 text-slate-300" />, label: "notes", action: "Generate Notes" },
    }[type];

    return (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                {config.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No {config.label} found</h3>
            <p className="text-slate-500 mb-6">
                Try adjusting your filters or create a new one.
            </p>
            <Button onClick={onAction}>
                {config.action}
            </Button>
        </div>
    );
}
