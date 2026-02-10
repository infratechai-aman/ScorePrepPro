"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, FileText, Sparkles, Download, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";

interface Topic {
    id: string;
    name: string;
    isImp: boolean;
}

interface Unit {
    id: string;
    name: string;
    topics: Topic[];
    notesGenerated: number;
    notesContent?: string;
}

export default function SubjectUnitsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [subjectName, setSubjectName] = useState("");
    const [units, setUnits] = useState<Unit[]>([]);
    const [isAddingUnit, setIsAddingUnit] = useState(false);
    const [newUnitName, setNewUnitName] = useState("");
    const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

    // Topic State
    const [newTopic, setNewTopic] = useState("");
    const [isImpTopic, setIsImpTopic] = useState(false);

    // AI Generation State
    const [generatingNoteId, setGeneratingNoteId] = useState<string | null>(null);
    const [viewingNote, setViewingNote] = useState<Unit | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user && subjectId) {
            fetchSubjectDetails();
            fetchUnits();
        }
    }, [user, subjectId, loading]);

    const fetchSubjectDetails = async () => {
        if (!user) return;
        const docRef = doc(db, "users", user.uid, "custom_subjects", subjectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setSubjectName(docSnap.data().name);
        } else {
            router.push("/teacher-dashboard");
        }
    };

    const fetchUnits = async () => {
        if (!user) return;
        const q = query(collection(db, "users", user.uid, "custom_subjects", subjectId, "units"));
        const querySnapshot = await getDocs(q);
        const fetchedUnits: Unit[] = [];

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            // Fetch latest notes if exist
            const notesRef = collection(db, "users", user.uid, "custom_subjects", subjectId, "units", docSnap.id, "notes");
            const notesSnap = await getDocs(notesRef);
            const latestNote = notesSnap.empty ? null : notesSnap.docs[0].data().content;

            fetchedUnits.push({
                id: docSnap.id,
                name: data.name,
                topics: data.topics || [],
                notesGenerated: data.notesGenerated || 0,
                notesContent: latestNote
            });
        }
        setUnits(fetchedUnits);
    };

    const handleAddUnit = async () => {
        if (!newUnitName.trim() || !user) return;
        try {
            await addDoc(collection(db, "users", user.uid, "custom_subjects", subjectId, "units"), {
                name: newUnitName,
                topics: [],
                notesGenerated: 0,
                createdAt: serverTimestamp()
            });
            setNewUnitName("");
            setIsAddingUnit(false);
            fetchUnits();
        } catch (error) {
            console.error("Error adding unit:", error);
        }
    };

    const handleDeleteUnit = async (unitId: string) => {
        if (!confirm("Delete this unit and its notes?")) return;
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "custom_subjects", subjectId, "units", unitId));
            fetchUnits();
        } catch (error) {
            console.error("Error deleting unit:", error);
        }
    };

    const handleAddTopic = async (unitId: string) => {
        if (!newTopic.trim() || !user) return;

        const unit = units.find(u => u.id === unitId);
        if (!unit) return;

        const updatedTopics = [...unit.topics, { id: Date.now().toString(), name: newTopic, isImp: isImpTopic }];

        try {
            const unitRef = doc(db, "users", user.uid, "custom_subjects", subjectId, "units", unitId);
            await updateDoc(unitRef, { topics: updatedTopics });
            setNewTopic("");
            setIsImpTopic(false);

            // Optimistic update
            setUnits(units.map(u => u.id === unitId ? { ...u, topics: updatedTopics } : u));
        } catch (error) {
            console.error("Error adding topic:", error);
        }
    };

    const handleDeleteTopic = async (unitId: string, topicId: string) => {
        if (!user) return;
        const unit = units.find(u => u.id === unitId);
        if (!unit) return;

        const updatedTopics = unit.topics.filter(t => t.id !== topicId);

        try {
            const unitRef = doc(db, "users", user.uid, "custom_subjects", subjectId, "units", unitId);
            await updateDoc(unitRef, { topics: updatedTopics });
            // Optimistic update
            setUnits(units.map(u => u.id === unitId ? { ...u, topics: updatedTopics } : u));
        } catch (error) {
            console.error("Error deleting topic:", error);
        }
    };

    const handleGenerateNotes = async (unit: Unit) => {
        if (unit.notesGenerated >= 5) {
            alert("Limit reached: You can only generate notes 5 times for this unit.");
            return;
        }

        setGeneratingNoteId(unit.id);
        try {
            const response = await fetch("/api/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: subjectName,
                    unit: unit.name,
                    topics: unit.topics
                })
            });

            const data = await response.json();
            if (data.content) {
                // Save notes
                if (user) {
                    await addDoc(collection(db, "users", user.uid, "custom_subjects", subjectId, "units", unit.id, "notes"), {
                        content: data.content,
                        createdAt: serverTimestamp()
                    });

                    // Increment count
                    const unitRef = doc(db, "users", user.uid, "custom_subjects", subjectId, "units", unit.id);
                    await updateDoc(unitRef, { notesGenerated: increment(1) });

                    fetchUnits(); // Refresh to show new notes
                }
            } else {
                const errorData = data.error || "Unknown error";
                alert(`Failed to generate notes: ${errorData}`);
            }

        } catch (error: any) {
            console.error("Error generating notes:", error);
            alert(`Error generating notes: ${error.message || "Please check your connection and try again."}`);
        } finally {
            setGeneratingNoteId(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <main className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => router.push("/teacher-dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
                </Button>

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-slate-900">{subjectName}</h1>
                        <p className="text-slate-600">Managing Units & Notes</p>
                    </div>
                    <Button onClick={() => setIsAddingUnit(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Unit
                    </Button>
                </div>

                {isAddingUnit && (
                    <GlassCard className="p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Unit Name (e.g., Unit 1: Introduction)"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={newUnitName}
                                onChange={(e) => setNewUnitName(e.target.value)}
                            />
                            <Button onClick={handleAddUnit}>Save Unit</Button>
                            <Button variant="ghost" onClick={() => setIsAddingUnit(false)}>Cancel</Button>
                        </div>
                    </GlassCard>
                )}

                <div className="space-y-4">
                    {units.map((unit) => (
                        <GlassCard key={unit.id} className="overflow-hidden">
                            <div className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}>
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{unit.name}</h3>
                                        <p className="text-xs text-slate-500">{unit.topics.length} Topics • {unit.notesGenerated}/5 Notes Generated</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        className={unit.notesContent ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                                        onClick={() => handleGenerateNotes(unit)}
                                        isLoading={generatingNoteId === unit.id}
                                        disabled={unit.notesGenerated >= 5}
                                    >
                                        <Sparkles className="h-3 w-3 mr-2" /> {unit.notesContent ? "Regenerate Notes" : "Generate Notes"}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}>
                                        {expandedUnit === unit.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDeleteUnit(unit.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {expandedUnit === unit.id && (
                                <div className="p-6 bg-slate-50/50 space-y-6">
                                    {/* Topics Section */}
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wide">Topics in this Unit</h4>
                                        <div className="mb-4 text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                            {unit.topics.length > 0 ? (
                                                unit.topics.map((topic, i) => (
                                                    <span key={topic.id} className="group relative inline-block">
                                                        <span className={`${topic.isImp ? 'font-semibold text-amber-700' : 'text-slate-700'}`}>
                                                            {topic.name}
                                                            {topic.isImp && <Sparkles className="inline h-3 w-3 text-amber-500 ml-1" />}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteTopic(unit.id, topic.id)}
                                                            className="ml-0.5 -mr-1 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 font-bold px-1 transition-opacity"
                                                            title="Delete topic"
                                                        >
                                                            ×
                                                        </button>
                                                        {i < unit.topics.length - 1 && <span className="mr-2">, </span>}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 italic">No topics added yet.</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 max-w-lg">
                                            <input
                                                type="text"
                                                placeholder="Add Topic..."
                                                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-300"
                                                value={newTopic}
                                                onChange={(e) => setNewTopic(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(unit.id)}
                                            />
                                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                                <input type="checkbox" checked={isImpTopic} onChange={(e) => setIsImpTopic(e.target.checked)} className="rounded border-slate-300 text-primary focus:ring-primary" />
                                                IMP
                                            </label>
                                            <Button size="sm" onClick={() => handleAddTopic(unit.id)}>Add</Button>
                                        </div>
                                    </div>

                                    {/* AI Notes Section */}
                                    {unit.notesContent && (
                                        <div className="border-t border-slate-200 pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">AI Generated Notes</h4>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-3 w-3 mr-2" /> Download PDF
                                                </Button>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                                <div className="prose prose-sm prose-slate max-w-none line-clamp-[10] mask-linear-fade">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold text-slate-800 mt-4 mb-2 bg-slate-50 p-1 px-2 rounded border-l-2 border-indigo-500" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-slate-700 mt-3 mb-1" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 text-slate-600 leading-relaxed" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 text-slate-600 marker:text-indigo-400" {...props} />,
                                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-amber-400 bg-amber-50 p-2 my-3 rounded-r text-slate-600 text-xs not-italic" {...props} />,
                                                            pre: ({ node, ...props }) => <pre className="bg-slate-900 text-cyan-300 p-3 rounded-lg overflow-x-auto font-mono text-xs shadow-inner my-3 border border-slate-800" {...props} />,
                                                            code: ({ node, className, children, ...props }: any) => {
                                                                const isInline = !String(children).includes("\n");
                                                                return isInline ? (
                                                                    <code className="bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                                                                ) : (
                                                                    <code className="bg-transparent" {...props}>{children}</code>
                                                                );
                                                            },
                                                        }}
                                                    >
                                                        {unit.notesContent}
                                                    </ReactMarkdown>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="shadow-lg border border-indigo-100 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                                        onClick={() => setViewingNote(unit)}
                                                    >
                                                        View Full Notes
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </GlassCard>
                    ))}

                    {units.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            No units added yet. Add a unit to start.
                        </div>
                    )}
                </div>
            </div>

            {/* Full Notes Modal */}
            <Modal
                isOpen={!!viewingNote}
                onClose={() => setViewingNote(null)}
                title={viewingNote?.name || "Topic Notes"}
                className="max-h-[85vh] bg-slate-50"
            >
                <div className="prose prose-slate max-w-none font-sans text-slate-800 p-2">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold font-serif text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 mt-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2 bg-slate-100 p-2 rounded-lg border-l-4 border-indigo-500" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-slate-700 mt-6 mb-2 underline decoration-indigo-200 underline-offset-4" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4 text-slate-700 leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700 marker:text-indigo-500" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700 marker:font-bold marker:text-slate-900" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-amber-400 bg-amber-50 p-4 my-6 rounded-r-lg shadow-sm text-slate-700 not-italic" {...props} />
                            ),
                            // Styling for tables
                            table: ({ node, ...props }) => <div className="overflow-x-auto my-6 rounded-lg border border-slate-200"><table className="w-full text-sm text-left" {...props} /></div>,
                            thead: ({ node, ...props }) => <thead className="bg-slate-100 text-slate-700 font-bold uppercase" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-100" {...props} />,
                            tr: ({ node, ...props }) => <tr className="hover:bg-slate-50 transition-colors" {...props} />,
                            th: ({ node, ...props }) => <th className="px-4 py-3 whitespace-nowrap" {...props} />,
                            td: ({ node, ...props }) => <td className="px-4 py-3" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                            hr: ({ node, ...props }) => <hr className="my-8 border-slate-200" {...props} />,
                            pre: ({ node, ...props }) => (
                                <div className="my-6 rounded-lg overflow-hidden border border-slate-800 shadow-md bg-slate-900 ring-1 ring-white/10">
                                    <div className="bg-slate-800/50 px-4 py-2 text-[10px] uppercase tracking-widest font-mono text-slate-500 border-b border-slate-700/50 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                                        Blueprint View
                                    </div>
                                    <pre className="p-4 overflow-x-auto text-cyan-400 font-mono text-sm leading-relaxed" {...props} />
                                </div>
                            ),
                            code: ({ node, className, children, ...props }: any) => {
                                const isInline = !String(children).includes("\n");
                                return isInline ? (
                                    <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200" {...props}>{children}</code>
                                ) : (
                                    <code className="" {...props}>{children}</code>
                                );
                            },
                        }}
                    >
                        {viewingNote?.notesContent || ""}
                    </ReactMarkdown>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                    <Button onClick={() => setViewingNote(null)}>Close</Button>
                </div>
            </Modal>
        </main>
    );
}
