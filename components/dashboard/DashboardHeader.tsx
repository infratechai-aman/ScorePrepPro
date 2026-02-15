"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function DashboardHeader({ title = "Overview" }: { title?: string }) {
    const { userData } = useAuth();
    const router = useRouter();

    return (
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>

            <div className="flex items-center gap-6">
                {/* Search - Hidden on small screens */}
                {/* <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 w-64">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search papers..." 
                        className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder:text-slate-400"
                    />
                </div> */}

                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">{userData?.name || "Guest User"}</p>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{userData?.plan || "TEACHER"}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-50 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=4f46e5&color=fff`} alt="Profile" />
                        </div>
                    </div>

                    <Button
                        size="sm"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 ml-2"
                        onClick={() => router.push(userData?.plan === 'teacher' ? "/teacher-dashboard/question-generator" : "/teacher-dashboard/smart-generate")}
                    >
                        Quick Generate
                    </Button>
                </div>
            </div>
        </header>
    );
}
