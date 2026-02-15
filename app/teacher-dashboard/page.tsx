"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { RecentPapers } from "@/components/dashboard/RecentPapers";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { useAuth } from "@/contexts/AuthContext";
import GeneratorPage from "@/app/generate/page";
import { useState } from "react";
import { LayoutDashboard, Sparkles } from "lucide-react";

export default function TeacherDashboardPage() {
    const { userData } = useAuth();
    const isTeacher = userData?.plan === 'teacher';
    const [activeTab, setActiveTab] = useState<"overview" | "generate">("overview");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <DashboardHeader title={activeTab === "overview" ? "Overview" : "Generate Paper"} />

            <div className="flex flex-1">
                <main className="flex-1 p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
                    {/* Tab Switcher */}
                    <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "overview"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("generate")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "generate"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <Sparkles className="h-4 w-4" /> Generate Paper
                        </button>
                    </div>

                    {activeTab === "overview" ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-slate-900 font-serif mb-2">
                                    {isTeacher ? 'Welcome, Teacher!' : `Welcome back, ${userData?.name || 'User'}!`}
                                </h1>
                                <p className="text-slate-500">
                                    {isTeacher ? "Here is what's happening with your classes today." : "Here's your premium dashboard overview."}
                                </p>
                            </div>

                            <StatsCards />

                            <div className="grid xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2 space-y-8">
                                    <SubjectProgress />
                                    <RecentPapers />
                                </div>
                            </div>

                            <div className="xl:grid xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-3">
                                    <ActivityGraph />
                                </div>
                            </div>
                        </>
                    ) : (
                        <GeneratorPage embedded={true} />
                    )}
                </main>

                {activeTab === "overview" && <RightSidebar />}
            </div>
        </div>
    );
}
