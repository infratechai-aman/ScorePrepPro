"use client";

import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Bot,
    Settings,
    HelpCircle,
    LogOut,
    BookOpen,
    Sparkles,
    GraduationCap,
    Users,
    ClipboardList,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export function Sidebar() {
    const pathname = usePathname();
    const { logout, userData } = useAuth();

    const isTeacher = userData?.plan === 'teacher';
    const isTheTeacher = userData?.plan === 'the_teacher';

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Overview", href: "/teacher-dashboard" },
        { icon: <Sparkles size={20} />, label: "Paper Generator", href: "/teacher-dashboard/smart-generate", show: !isTheTeacher },
        { icon: <BookOpen size={20} />, label: "Notes Generator", href: "/teacher-dashboard/notes-generator", show: !isTheTeacher },
        { icon: <FileText size={20} />, label: "Custom Generator", href: "/teacher-dashboard/question-generator", show: isTeacher && !isTheTeacher },
        { icon: <FolderOpen size={20} />, label: "My Repository", href: "/teacher-dashboard/repository" },
        { icon: <Bot size={20} />, label: "AI Tutor", href: "/teacher-dashboard/ai-tutor" },
        { icon: <Settings size={20} />, label: "Settings", href: "/teacher-dashboard/settings" },
        { icon: <HelpCircle size={20} />, label: "Help & Support", href: "/teacher-dashboard/support" },
    ].filter(item => item.show !== false);

    const theTeacherItems = [
        { icon: <GraduationCap size={20} />, label: "Custom Subjects", href: "/teacher-dashboard/custom-subjects" },
        { icon: <Sparkles size={20} />, label: "Content Generator", href: "/teacher-dashboard/custom-generate" },
        { icon: <Users size={20} />, label: "Classrooms", href: "/teacher-dashboard/classrooms" },
        { icon: <ClipboardList size={20} />, label: "Exams", href: "/teacher-dashboard/exams" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] text-white flex flex-col border-r border-slate-800 z-50 print:hidden">
            {/* Logo */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
                <Image src="/ScorePrepPro_Logo.png" alt="ScorePrepPro Logo" width={48} height={48} className="rounded-xl object-contain" />
                <div>
                    <h1 className="font-bold text-lg font-serif tracking-tight">ScorePrepPro</h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">{isTheTeacher ? 'THE TEACHER' : isTeacher ? 'Teacher Mode' : 'Premium'}</p>
                </div>
            </div>

            {/* Menu */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    )
                })}

                {/* THE TEACHER Section */}
                {isTheTeacher && (
                    <>
                        <div className="pt-6 pb-2">
                            <p className="px-4 text-xs font-bold text-purple-400 uppercase tracking-wider">THE TEACHER</p>
                        </div>
                        {theTeacherItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className={`${isActive ? 'text-white' : 'text-purple-400 group-hover:text-white'}`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            )
                        })}
                    </>
                )}
            </div>

            {/* System Status & Logout */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-300">System Status</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-3">{isTheTeacher ? 'AI Engine v2.5 is active for your custom content.' : 'AI Engine v2.5 is active for CBSE & ICSE Boards.'}</p>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-indigo-500 rounded-full"></div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
