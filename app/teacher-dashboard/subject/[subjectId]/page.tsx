"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
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
                alert("Failed to generate notes. Please try again.");
            }

        } catch (error) {
            console.error("Error generating notes:", error);
            alert("Error generating notes.");
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
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {unit.topics.map(topic => (
                                                <span key={topic.id} className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${topic.isImp ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                    {topic.isImp && <Sparkles className="h-3 w-3 text-amber-500" />}
                                                    {topic.name}
                                                    <button onClick={() => handleDeleteTopic(unit.id, topic.id)} className="hover:text-red-500 ml-1">×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 max-w-lg">
                                            <input
                                                type="text"
                                                placeholder="Add Topic..."
                                                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-300"
                                                value={newTopic}
                                                onChange={(e) => setNewTopic(e.target.value)}
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
                                            <div className="bg-white p-6 rounded-xl border border-slate-200 prose prose-slate max-w-none shadow-sm text-sm">
                                                <ReactMarkdown>{(unit.notesContent ? unit.notesContent.substring(0, 500) : "") + "..."}</ReactMarkdown>
                                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 text-center">
                                                    <button className="text-primary text-sm font-medium hover:underline">View Full Notes</button>
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
        </main>
    );
}
