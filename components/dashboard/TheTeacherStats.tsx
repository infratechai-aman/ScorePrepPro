"use client";

import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Users, ClipboardList, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TeacherStats {
    subjects: number;
    classrooms: number;
    exams: number;
    students: number;
}

export function TheTeacherStats() {
    const { userData } = useAuth();
    const [stats, setStats] = useState<TeacherStats>({ subjects: 0, classrooms: 0, exams: 0, students: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?.uid) fetchStats();
    }, [userData?.uid]);

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/teacher-dashboard?teacherUid=${userData?.uid}&section=stats`);
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (err) {
            console.error("Error fetching teacher stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        {
            label: "Custom Subjects",
            value: stats.subjects,
            icon: <GraduationCap className="w-5 h-5" />,
            gradient: "from-violet-500 to-purple-600",
            shadow: "shadow-purple-200",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            label: "Classrooms",
            value: stats.classrooms,
            icon: <Users className="w-5 h-5" />,
            gradient: "from-blue-500 to-indigo-600",
            shadow: "shadow-indigo-200",
            bgLight: "bg-indigo-50",
            textColor: "text-indigo-600",
        },
        {
            label: "Exams Created",
            value: stats.exams,
            icon: <ClipboardList className="w-5 h-5" />,
            gradient: "from-emerald-500 to-teal-600",
            shadow: "shadow-emerald-200",
            bgLight: "bg-emerald-50",
            textColor: "text-emerald-600",
        },
        {
            label: "Total Students",
            value: stats.students,
            icon: <UserCheck className="w-5 h-5" />,
            gradient: "from-amber-500 to-orange-600",
            shadow: "shadow-orange-200",
            bgLight: "bg-orange-50",
            textColor: "text-orange-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-default"
                >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                    {/* Icon */}
                    <div className={`relative z-10 w-11 h-11 ${card.bgLight} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <span className={card.textColor}>{card.icon}</span>
                    </div>

                    {/* Label */}
                    <p className="relative z-10 text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{card.label}</p>

                    {/* Value */}
                    {loading ? (
                        <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                    ) : (
                        <h3 className="relative z-10 text-2xl font-bold text-slate-900">
                            {card.value}
                        </h3>
                    )}

                    {/* Bottom accent bar */}
                    <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </motion.div>
            ))}
        </div>
    );
}
