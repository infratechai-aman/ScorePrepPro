"use client";

import { useUsage } from "@/hooks/useUsage";
import { FileText, Database, Clock, Users } from "lucide-react";

export function StatsCards() {
    const { usage } = useUsage();

    // Derived stats for demo purposes
    const questionsSaved = usage.papers * 25; // Approx 25 questions per paper
    const hoursSaved = Math.round(usage.papers * 1.5); // Approx 1.5 hours per paper

    const stats = [
        {
            label: "Papers Generated",
            value: usage.papers,
            icon: <FileText className="w-5 h-5 text-indigo-600" />,
            bg: "bg-indigo-50"
        },
        {
            label: "Questions Saved",
            value: questionsSaved.toLocaleString(),
            icon: <Database className="w-5 h-5 text-emerald-600" />,
            bg: "bg-emerald-50"
        },
        {
            label: "Hours Saved",
            value: `${hoursSaved}h`,
            icon: <Clock className="w-5 h-5 text-orange-600" />,
            bg: "bg-orange-50"
        },
        {
            label: "Classes Managed",
            value: "2", // Placeholder
            icon: <Users className="w-5 h-5 text-purple-600" />,
            bg: "bg-purple-50"
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                        {stat.icon}
                    </div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </div>
            ))}
        </div>
    );
}
