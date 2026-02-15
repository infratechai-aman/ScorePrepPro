"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, getDocs, query } from "firebase/firestore";
import { BookOpen, Calculator, FlaskConical, Languages } from "lucide-react";
import { useEffect, useState } from "react";

export function SubjectProgress() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const fetchSubjects = async () => {
                try {
                    const q = query(collection(db, "users", user.uid, "custom_subjects"));
                    const querySnapshot = await getDocs(q);

                    const subs = await Promise.all(querySnapshot.docs.map(async (doc) => {
                        // For demo, we'll try to guess icon based on name, and mock progress
                        const data = doc.data();
                        const unitsColl = collection(db, "users", user.uid, "custom_subjects", doc.id, "units");
                        const snapshot = await getCountFromServer(unitsColl);

                        return {
                            id: doc.id,
                            name: data.name,
                            type: data.type,
                            unitCount: snapshot.data().count,
                            progress: Math.floor(Math.random() * 60) + 20 // Mock progress 20-80%
                        };
                    }));
                    setSubjects(subs);
                } catch (error) {
                    console.error("Error fetching subjects", error);
                }
            };
            fetchSubjects();
        }
    }, [user]);

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("math")) return <Calculator className="w-6 h-6 text-white" />;
        if (n.includes("sci") || n.includes("chem") || n.includes("phy")) return <FlaskConical className="w-6 h-6 text-white" />;
        if (n.includes("eng") || n.includes("hindi")) return <Languages className="w-6 h-6 text-white" />;
        return <BookOpen className="w-6 h-6 text-white" />;
    };

    const getColor = (index: number) => {
        const colors = ["bg-orange-500", "bg-blue-500", "bg-purple-500", "bg-emerald-500"];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Current Subjects</h3>
                <span className="text-xs font-bold text-indigo-600 cursor-pointer hover:underline uppercase tracking-wide">View Full Curriculum</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {subjects.length > 0 ? (
                    subjects.map((sub, i) => (
                        <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-48">
                            <div className={`w-12 h-12 rounded-xl ${getColor(i)} flex items-center justify-center shadow-lg shadow-slate-200 mb-4`}>
                                {getIcon(sub.name)}
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">{sub.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">Board Curriculum • {sub.unitCount} Units</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                    <span>Progress</span>
                                    <span>{sub.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${getColor(i)} rounded-full`} style={{ width: `${sub.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                        <p className="text-slate-400">No subjects added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
